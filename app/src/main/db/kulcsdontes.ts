/**
 * Induláskor: melyik kulccsal nyíljon az adatbázis — vagy kérjük be a
 * visszaállítási kulcsot?
 *
 * MIÉRT KÜLÖN MODUL. A visszaállítási kulcs arra a helyzetre készült, amikor a
 * Windows-fiók elvész, és a felhasználó visszamásolja a naplóját. A program pont
 * ekkor rontotta el: ha a `kulcs.dat` hiányzott, kérdés nélkül új kulcsot
 * generált és írt ki; ha megvolt, de az új fiók nem tudta visszafejteni, kulcs
 * nélkül nyitotta a titkosított fájlt. Mindkét esetben elhasalt az indulás, az
 * elsőben ráadásul a ROSSZ kulcs került a `kulcs.dat`-ba.
 *
 * A szabály ezért: meglévő, titkosított adatbázis mellé soha nem készül új kulcs,
 * és kulcs nélkül sem nyílik meg. Ha a tárolt kulcs nem nyitja, a felhasználótól
 * kérjük be — és csak akkor tároljuk el, ha bizonyítottan nyitja.
 *
 * Electron-függés nélkül, hogy tesztelhető legyen: a tényeket a hívó gyűjti össze
 * (`db/index.ts` → `nyitasiHelyzet`), a próba-megnyitást és a kiírást pedig
 * paraméterként kapja.
 */

import { kulcsBevitelHiba, kulcsErvenyes, kulcsNormalizal } from './kulcsszoveg.js';

/** A `kulcs.dat` állapota. */
export type TaroltKulcs =
  | { allapot: 'nincs' }
  /** Van fájl, de nem fejthető vissza (másik Windows-fiók), vagy sérült. */
  | { allapot: 'olvashatatlan'; ok: string }
  | { allapot: 'van'; kulcs: string };

/** Az induláskori tények. Mind olvasással derül ki, közben semmi nem íródik. */
export interface NyitasiHelyzet {
  /** Létezik-e már az adatbázisfájl. */
  dbLetezik: boolean;
  /**
   * Megnyitható-e kulcs nélkül, sima SQLite-ként. Nem létező fájlnál `false`.
   * Létező, de így nem olvasható fájl: titkosított — vagy sérült. A kettő kulcs
   * nélkül nem különböztethető meg, és egyiknél sem szabad új kulcsot generálni.
   */
  dbTitkositatlan: boolean;
  /** Elérhető-e a Windows jelszóvédelme (`safeStorage`). Nélküle kulcs nem tárolható. */
  vedelemElerheto: boolean;
  taroltKulcs: TaroltKulcs;
  /** Megnyitja-e a tárolt kulcs a meglévő adatbázist. Ha nincs mit próbálni: `false`. */
  taroltKulcsNyitja: boolean;
}

/** Miért kell bekérni a kulcsot — a felhasználónak ez alapján magyarázzuk el. */
export type KulcsBekeresOka =
  /** Nincs `kulcs.dat` (pl. csak az adatbázist másolták vissza). */
  | 'nincs-tarolt-kulcs'
  /** A `kulcs.dat` ebben a Windows-fiókban nem fejthető vissza. */
  | 'olvashatatlan-tarolt-kulcs'
  /** A `kulcs.dat` egy másik napló kulcsát tartalmazza. */
  | 'mas-naplo-kulcsa';

export type NyitasiDontes =
  /** A tárolt kulccsal nyílik (titkosítatlan adatbázis ezzel titkosítódik). */
  | { tipus: 'tarolt-kulcs'; kulcs: string }
  /** Nincs adatbázis, vagy titkosítatlan: új kulcs készül — nincs mit elrontani. */
  | { tipus: 'uj-kulcs' }
  /** Titkosított adatbázis, használható kulcs nélkül: a felhasználótól kérjük be. */
  | { tipus: 'kulcs-bekeres'; ok: KulcsBekeresOka; mentheto: boolean }
  /** Nincs Windows-védelem, és titkosított adatbázis sincs: titkosítás nélkül indul. */
  | { tipus: 'titkositas-nelkul' };

export function nyitasiDontes(h: NyitasiHelyzet): NyitasiDontes {
  const titkositott = h.dbLetezik && !h.dbTitkositatlan;

  if (titkositott) {
    if (h.taroltKulcs.allapot === 'van' && h.taroltKulcsNyitja) {
      return { tipus: 'tarolt-kulcs', kulcs: h.taroltKulcs.kulcs };
    }
    // Se új kulcs, se kulcs nélküli nyitás: mindkettő a meglévő naplót zárná ki.
    return {
      tipus: 'kulcs-bekeres',
      ok: bekeresOka(h.taroltKulcs),
      mentheto: h.vedelemElerheto,
    };
  }

  if (!h.vedelemElerheto) return { tipus: 'titkositas-nelkul' };
  if (h.taroltKulcs.allapot === 'van') return { tipus: 'tarolt-kulcs', kulcs: h.taroltKulcs.kulcs };
  // Hiányzó vagy olvashatatlan `kulcs.dat` mellett sincs mit elrontani, mert
  // nincs titkosított adat, amihez a régi kulcs kellene.
  return { tipus: 'uj-kulcs' };
}

function bekeresOka(tarolt: TaroltKulcs): KulcsBekeresOka {
  switch (tarolt.allapot) {
    case 'nincs':
      return 'nincs-tarolt-kulcs';
    case 'olvashatatlan':
      return 'olvashatatlan-tarolt-kulcs';
    case 'van':
      return 'mas-naplo-kulcsa';
  }
}

/** A bekért kulcs kipróbálásához szükséges műveletek — a hívó adja. */
export interface KulcsProbaMuveletek {
  /**
   * Megnyitja-e az adatbázist a (normalizált) kulcs? Csak olvasva próbál.
   * Nem kulcs okozta hibánál (zárolt, sérült fájl) kivételt dob.
   */
  nyitja: (kulcs: string) => boolean;
  /** A kulcs eltárolása a Windows-védelemmel; `null`, ha a védelem nem érhető el. */
  kiir: ((kulcs: string) => void) | null;
}

export type KulcsProbaEredmeny =
  /** Formailag hibás — az adatbázist meg sem próbáltuk vele. */
  | { tipus: 'hibas-bevitel'; uzenet: string }
  /** Formailag jó, de nem ennek a naplónak a kulcsa. */
  | { tipus: 'nem-nyitja' }
  /** A próba nem a kulcs miatt bukott el — a kulcsról ilyenkor nem mondunk semmit. */
  | { tipus: 'probahiba'; uzenet: string }
  /** Nyitja a naplót. `mentesiHiba`: miért nem sikerült eltárolni (`null`: eltárolva). */
  | { tipus: 'elfogadva'; kulcs: string; mentesiHiba: string | null };

/**
 * A felhasználó által beírt visszaállítási kulcs kipróbálása.
 *
 * Sorrend: formai ellenőrzés → próba-megnyitás → CSAK sikernél kiírás. Rossz
 * kulcsnál tehát semmi nem íródik, formailag hibás bevitel pedig az adatbázishoz
 * sem ér.
 */
export function bekertKulcsProba(bevitel: string, m: KulcsProbaMuveletek): KulcsProbaEredmeny {
  const hiba = kulcsBevitelHiba(bevitel);
  if (hiba !== null || !kulcsErvenyes(bevitel)) {
    return { tipus: 'hibas-bevitel', uzenet: hiba ?? 'Ez nem visszaállítási kulcs.' };
  }
  const kulcs = kulcsNormalizal(bevitel);

  let nyitja: boolean;
  try {
    nyitja = m.nyitja(kulcs);
  } catch (err) {
    return { tipus: 'probahiba', uzenet: (err as Error).message };
  }
  if (!nyitja) return { tipus: 'nem-nyitja' };

  if (!m.kiir) {
    return {
      tipus: 'elfogadva',
      kulcs,
      mentesiHiba: 'A Windows jelszóvédelme ezen a gépen nem érhető el.',
    };
  }
  try {
    m.kiir(kulcs);
    return { tipus: 'elfogadva', kulcs, mentesiHiba: null };
  } catch (err) {
    return { tipus: 'elfogadva', kulcs, mentesiHiba: (err as Error).message };
  }
}
