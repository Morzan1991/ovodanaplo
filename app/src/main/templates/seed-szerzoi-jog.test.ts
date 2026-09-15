/**
 * TELJES seed-átvizsgálás: nem maradt-e szó szerinti szöveg a forráskiadványból.
 *
 * A `jatekleiras.test.ts` a játékokat, a `celfeladat.test.ts` a korcsoportos cél-
 * és feladatszövegeket őrzi. Ez a teszt MINDEN seed-fájlra ránéz: az ötletbank
 * hét területére, a sablonok összes szöveges mezőjére és az irodalomtár tárolt
 * szövegeire.
 *
 * MIÉRT: a tartalom generált. Ha valaki újrafuttat egy régi kinyerő szkriptet
 * (`tools/tappancs_otletek.py`, `tappancs_celok.py`), a kiadvány szövege NÉMÁN
 * visszakerülne a programba, és ezt kézzel senki nem venné észre.
 *
 * KÜSZÖB: 45 karakter. Ennél rövidebb egyezés a szakma közös szókincse
 * („számfogalom alakítása", „Törekedjenek a tiszta munkavégzésre"), nem
 * egyéni-eredeti szöveg, így nem is áll szerzői jogi védelem alatt.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const GYOKER = join(__dirname, '..', '..', '..', '..');
const SEED = join(GYOKER, 'seed');
const KORCSOPORTOK = ['kicsi', 'kozepso', 'nagy', 'vegyes'] as const;
const HOSSZ_KUSZOB = 45;

/**
 * Amit szándékosan meghagytunk.
 *
 * A művek CÍME szerzővel együtt sem áll védelem alatt, és egy irodalmi
 * ajánlólistának épp az a dolga, hogy megnevezze a művet. A harmadik tétel
 * bevett szakmai fordulat.
 */
const ENGEDETT = [
  'Kolozsvári Grandpierre Emil: A két kicsi bocs meg a róka',
  'Ábrahám Ernő: A libák, a farkas meg a kiskakas',
  'Az egészséges életmód szokásainak megalapozása.',
];

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** A kinyert kiadványi szöveg, egyetlen normalizált tömbként. */
function kiadvany(): string {
  const darabok: string[] = [];
  const bejar = (x: unknown): void => {
    if (typeof x === 'string') darabok.push(x);
    else if (Array.isArray(x)) x.forEach(bejar);
    else if (x && typeof x === 'object') Object.values(x).forEach(bejar);
  };
  for (const nev of ['tappancs-teljes.json', 'tappancs.json', 'tappancs-jatekok.json']) {
    const ut = join(GYOKER, 'tools', nev);
    if (existsSync(ut)) bejar(JSON.parse(readFileSync(ut, 'utf-8')));
  }
  return norm(darabok.join(' \n '));
}

/** Minden vizsgálandó szövegdarab a seedből, a helyével együtt. */
function seedDarabok(): Array<{ hol: string; szoveg: string }> {
  const ki: Array<{ hol: string; szoveg: string }> = [];

  for (const kor of KORCSOPORTOK) {
    const bank = JSON.parse(readFileSync(join(SEED, `otletek-bank-${kor}.json`), 'utf-8')) as {
      temak: Record<string, Record<string, unknown>>;
    };
    for (const [tema, teruletek] of Object.entries(bank.temak)) {
      for (const [terulet, lista] of Object.entries(teruletek)) {
        if (!Array.isArray(lista)) continue;
        for (const sor of lista as string[]) {
          ki.push({ hol: `${kor}/${tema}/${terulet}`, szoveg: sor });
        }
      }
    }
  }

  const sablonok = (
    JSON.parse(readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8')) as {
      sablonok: Array<Record<string, unknown>>;
    }
  ).sablonok;
  for (const s of sablonok) {
    const azon = String(s.azonosito);
    for (const [kulcs, ertek] of Object.entries(s)) {
      const ertekek =
        typeof ertek === 'string'
          ? [ertek]
          : ertek && typeof ertek === 'object' && !Array.isArray(ertek)
            ? Object.values(ertek).filter((v): v is string => typeof v === 'string')
            : [];
      for (const v of ertekek) {
        for (const darab of v.split(/(?<=[.!?])\s+|\n+/)) {
          ki.push({ hol: `${azon}/${kulcs}`, szoveg: darab });
        }
      }
    }
  }

  const lit = (
    JSON.parse(readFileSync(join(SEED, 'literature.json'), 'utf-8')) as {
      tetelek: Array<{ cim: string; szoveg?: string }>;
    }
  ).tetelek;
  for (const x of lit) {
    for (const darab of (x.szoveg ?? '').split(/(?<=[.!?])\s+/)) {
      ki.push({ hol: `irodalom/${x.cim}`, szoveg: darab });
    }
  }

  return ki;
}

describe('a teljes seed szerzői jogi átvizsgálása', () => {
  // Bőkezű időkorlát: a teljes seed összevetése a több százezer karakteres kiadványi
  // szöveggel lassú, és terhelt gépen a vitest 5 másodperces alapkorlátján tartalmi
  // hiba nélkül is elbukott.
  it('sehol nem maradt szó szerinti szöveg a kiadványból', { timeout: 30_000 }, () => {
    const forras = kiadvany();
    expect(forras.length).toBeGreaterThan(100000); // a kinyerés megvan-e egyáltalán

    const engedett = new Set(ENGEDETT.map(norm));
    // Ugyanaz a mondat gyakran több korcsoportban is szerepel: a keresés eredményét
    // szövegenként megjegyezzük. Minden darabot ugyanúgy megvizsgálunk, a találatok
    // listája nem változik — csak ugyanazt a szöveget nem keressük ki újra.
    const kiadvanyban = new Map<string, boolean>();
    const talalat = new Map<string, string>();
    for (const { hol, szoveg } of seedDarabok()) {
      const s = szoveg.trim();
      if (s.length <= HOSSZ_KUSZOB) continue;
      const n = norm(s);
      if (engedett.has(n)) continue;
      let van = kiadvanyban.get(n);
      if (van === undefined) {
        van = forras.includes(n);
        kiadvanyban.set(n, van);
      }
      if (van) talalat.set(s, hol);
    }

    const lista = [...talalat].map(([s, hol]) => `${hol}: ${s.slice(0, 80)}…`);
    expect(lista).toEqual([]);
  });
});
