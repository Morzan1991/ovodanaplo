/**
 * A tartalom betöltése és kikeresése.
 *
 * A csomagot a `tools/mobil_tartalom.py` állítja elő a közös `seed/` mappából,
 * így az asztali és a mobil app soha nem csúszik szét.
 *
 * A négy korcsoport ötletbankja külön fájl, és CSAK azt töltjük be, amelyik
 * éppen kell — így az induláskor beolvasott adat harmadára csökken.
 */

import temakJson from '../tartalom/temak.json';
import irodalomJson from '../tartalom/irodalom.json';
import teruletekJson from '../tartalom/teruletek.json';
import unnepekJson from '../tartalom/unnepek.json';

export type Korcsoport = 'kicsi' | 'kozepso' | 'nagy' | 'vegyes';

export const KORCSOPORT_NEV: Record<Korcsoport, string> = {
  kicsi: 'Kiscsoport',
  kozepso: 'Középső csoport',
  nagy: 'Nagycsoport',
  vegyes: 'Vegyes csoport',
};

export const KORCSOPORT_KOR: Record<Korcsoport, string> = {
  kicsi: '3–4 év',
  kozepso: '4–5 év',
  nagy: '5–7 év',
  vegyes: '3–7 év',
};

export interface Tema {
  id: string;
  cim: string;
  honap: number | null;
  sorrend: number | null;
  tema: string;
  kategoria: string;
  /** Ha a téma egy jeles naphoz kötődik, annak a neve (pl. „Márton-nap"). */
  unnep: string;
  cel: string;
  feladat: string;
  kepessegek: string;
  celKor: Record<string, string>;
  feladatKor: Record<string, string>;
  kepessegKor: Record<string, string>;
}

export interface Mu {
  tipus: string;
  cim: string;
  szerzo?: string;
  korcsoport?: string;
  temak?: string[];
  szoveg?: string;
}

export interface Terulet {
  id: string;
  nev: string;
}

export interface Unnep {
  nev: string;
  honap?: number;
  nap?: number;
  /** 'fix' | 'mozgo' | 'idoszak' — a mozgó ünnepek dátumát évre számítjuk. */
  tipus?: string;
  kategoria?: string;
  /** Mennyire hangsúlyos az óvodában (1–5). */
  ovodaiSulyozas?: number;
  /** Hány nappal a naptári dátum ELŐTT ünnepel az óvoda (húsvét, pünkösd). */
  unneplesEltolas?: number;
  leiras?: string;
}

export const TEMAK = temakJson as Tema[];
export const IRODALOM = irodalomJson as Mu[];
export const TERULETEK = teruletekJson as Terulet[];
export const UNNEPEK = unnepekJson as Unnep[];

export const TERULET_NEV: Record<string, string> = Object.fromEntries(
  TERULETEK.map((t) => [t.id, t.nev]),
);

/** téma → terület → javaslatok */
type Otletbank = Record<string, Record<string, string[]>>;

const bankGyorsitotar = new Map<Korcsoport, Otletbank>();

/**
 * Egy korcsoport ötletbankja. Első hívásnál tölti be, utána a gyorsítótárból ad.
 * A dinamikus import miatt a nem használt korcsoportok fájlja el sem jut a
 * telefonra a kezdőképernyő megjelenítéséig.
 */
export async function otletbank(kor: Korcsoport): Promise<Otletbank> {
  const meglevo = bankGyorsitotar.get(kor);
  if (meglevo) return meglevo;

  const modul = await (kor === 'kicsi'
    ? import('../tartalom/otletek-kicsi.json')
    : kor === 'kozepso'
      ? import('../tartalom/otletek-kozepso.json')
      : kor === 'nagy'
        ? import('../tartalom/otletek-nagy.json')
        : import('../tartalom/otletek-vegyes.json'));

  const bank = modul.default as Otletbank;
  bankGyorsitotar.set(kor, bank);
  return bank;
}

/** Egy téma a saját azonosítója alapján. */
export function temaAzonositoval(id: string): Tema | undefined {
  return TEMAK.find((t) => t.id === id);
}

/**
 * A témák a nevelési év sorrendjében: szeptembertől júniusig.
 * A naptári hónapszám nem jó rendezési kulcs, mert a január a tanév közepe.
 */
const NEVELESI_EV_SORREND = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

export function temakNevelesiEvSorrendben(): Tema[] {
  return [...TEMAK].sort((a, b) => {
    const ha = NEVELESI_EV_SORREND.indexOf(a.honap ?? 0);
    const hb = NEVELESI_EV_SORREND.indexOf(b.honap ?? 0);
    if (ha !== hb) return (ha < 0 ? 99 : ha) - (hb < 0 ? 99 : hb);
    return (a.sorrend ?? 99) - (b.sorrend ?? 99);
  });
}

export const HONAP_NEV: Record<number, string> = {
  1: 'Január',
  2: 'Február',
  3: 'Március',
  4: 'Április',
  5: 'Május',
  6: 'Június',
  7: 'Július',
  8: 'Augusztus',
  9: 'Szeptember',
  10: 'Október',
  11: 'November',
  12: 'December',
};

/**
 * A mai naphoz illő témák: az aktuális hónap témái, a hónapon belüli sorrend
 * szerint. Ha a hónapban nincs téma (július, augusztus), a következő hónapét
 * adja, hogy a kezdőképernyő sose legyen üres.
 */
export function maiTemak(most: Date = new Date()): { honap: number; temak: Tema[] } {
  const sorrend = NEVELESI_EV_SORREND;
  const kezdo = sorrend.indexOf(most.getMonth() + 1);
  const indulo = kezdo < 0 ? 0 : kezdo;
  for (let i = 0; i < sorrend.length; i++) {
    const honap = sorrend[(indulo + i) % sorrend.length];
    const temak = TEMAK.filter((t) => t.honap === honap).sort(
      (a, b) => (a.sorrend ?? 99) - (b.sorrend ?? 99),
    );
    if (temak.length > 0) return { honap, temak };
  }
  return { honap: most.getMonth() + 1, temak: [] };
}

/** A hónap jeles napjai — a kezdőképernyőn ez adja a hét „miért"-jét. */
export function honapUnnepei(honap: number): Unnep[] {
  return UNNEPEK.filter((u) => u.honap === honap).sort((a, b) => (a.nap ?? 0) - (b.nap ?? 0));
}

/**
 * A javaslat sor végén zárójelben áll a műfaj („… (vers)”), utána gondolatjellel
 * a megjegyzés. Ezt bontjuk szét, hogy a felületen külön lehessen szedni.
 */
export function javaslatReszei(sor: string): {
  szoveg: string;
  mufaj: string | null;
  megjegyzes: string | null;
} {
  const [fej, ...maradek] = sor.split(' — ');
  const megjegyzes = maradek.length > 0 ? maradek.join(' — ') : null;
  const talalat = fej.match(/^(.*)\s\(([^()]+)\)\s*$/);
  if (talalat) {
    return { szoveg: talalat[1].trim(), mufaj: talalat[2].trim(), megjegyzes };
  }
  return { szoveg: fej.trim(), mufaj: null, megjegyzes };
}
