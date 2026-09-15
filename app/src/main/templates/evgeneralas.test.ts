/**
 * A nevelési év sablon-generálásának ellenőrzése HAT évre előre.
 *
 * Miért kell ez: a mozgó ünnepek (Farsang, Húsvét, Advent, Anyák napja,
 * Pünkösd, Gyermeknap) dátuma évről évre változik, a fix ünnepek pedig hol
 * hétköznapra, hol hétvégére esnek. Korábban emiatt egész hetek maradtak
 * sablon nélkül — 2026/2027-ben pl. a Mikulás és a Luca-nap hete —, és a
 * húsvéti, farsangi, anyák napi sablonok SOSEM kerültek elő.
 *
 * A teszt minden vizsgált évre végigfuttatja a valódi generálást, és
 * megköveteli, hogy az óvodai év gerincét adó ünnepek helyet kapjanak.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import type { Unnep } from '../../shared/schema.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A nevelési év azon ünnepei, amelyek nélkül a generált év hiányos. */
const FO_UNNEPEK = [
  'mikulas',
  'luca_nap',
  'karacsony',
  'advent',
  'farsang',
  'husvet',
  'marcius_15',
  'anyak_napja',
  'gyermeknap',
  'viz_vilagnapja',
  'allatok_vilagnapja',
  'evzaro',
];

const EVEK = [2026, 2027, 2028, 2029, 2030, 2031];

type Modul = typeof import('./generator.js');
let generator: Modul;
let unnepek: Unnep[];

beforeAll(async () => {
  // A generátor Electronon kívül is betölthető legyen (resourcesPath ott nincs).
  (process as unknown as { resourcesPath: string }).resourcesPath = process.cwd();
  generator = await import('./generator.js');
  const nyers = JSON.parse(
    readFileSync(join(process.cwd(), '..', 'seed', 'hungarian-holidays.json'), 'utf-8'),
  ) as { unnepek: Array<Record<string, unknown>> };
  unnepek = nyers.unnepek.map((u, i) => ({ id: i + 1, ...u })) as unknown as Unnep[];
});

/** Egy nevelési év végiggenerálása — a felhasznált sablonok azonosítói. */
function evetGeneral(
  evKezdo: number,
  korcsoport: string | null = null,
): { hasznalt: string[]; ures: number; hetek: number; juniusUres: number } {
  const hetek = generator.hetekAzEvben(`${evKezdo}-09-01`, `${evKezdo + 1}-06-30`);
  const hasznaltSet = new Set<string>();
  let ures = 0;
  let juniusUres = 0;
  for (const het of hetek) {
    const s = generator.sablonHezKivalasztas(het, unnepek, hasznaltSet, evKezdo, korcsoport);
    if (s) hasznaltSet.add(s.azonosito);
    else {
      ures++;
      if (het.getMonth() === 5) juniusUres++;
    }
  }
  return { hasznalt: [...hasznaltSet], ures, hetek: hetek.length, juniusUres };
}

describe.each(EVEK)('%i/%i+1 nevelési év', (evKezdo) => {
  it('minden fő ünnep kap sablont', () => {
    const { hasznalt } = evetGeneral(evKezdo);
    const hianyzo = FO_UNNEPEK.filter((f) => !hasznalt.some((h) => h.startsWith(f)));
    expect(hianyzo, `hiányzó ünnepek: ${hianyzo.join(', ')}`).toEqual([]);
  });

  it('legfeljebb 3 hét marad sablon nélkül', () => {
    const { ures, hetek } = evetGeneral(evKezdo);
    expect(ures, `${ures} üres hét a ${hetek}-ből`).toBeLessThanOrEqual(3);
  });

  it('nincs túlzott ismétlés — a hetek többsége önálló témát kap', () => {
    const { hasznalt, hetek } = evetGeneral(evKezdo);
    expect(hasznalt.length).toBeGreaterThanOrEqual(Math.floor(hetek * 0.8));
  });
});

describe.each(EVEK)('%i/%i+1 — június és korosztály', (evKezdo) => {
  it('június egyetlen hete sem marad téma nélkül', () => {
    const { juniusUres } = evetGeneral(evKezdo, 'kozepso');
    expect(juniusUres, `${juniusUres} üres júniusi hét`).toBe(0);
  });

  it('a nagycsoportosok búcsúztatása CSAK nagy és vegyes csoportban jelenik meg', () => {
    for (const kc of ['nagy', 'vegyes']) {
      expect(
        evetGeneral(evKezdo, kc).hasznalt,
        `${kc}: hiányzik a ballagás`,
      ).toContain('nagycsoportos_bucsu');
    }
    for (const kc of ['kicsi', 'kozepso']) {
      expect(
        evetGeneral(evKezdo, kc).hasznalt,
        `${kc}: NEM való ide a ballagás`,
      ).not.toContain('nagycsoportos_bucsu');
    }
  });
});

describe('a sablon-változatok évente váltakoznak', () => {
  it('két egymást követő év nem ugyanazt a sablonsort adja', () => {
    const a = evetGeneral(2026).hasznalt.join('|');
    const b = evetGeneral(2027).hasznalt.join('|');
    expect(a).not.toBe(b);
  });
});
