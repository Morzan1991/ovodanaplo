/**
 * A visszaállítási kulcsfájl nevének kiválasztása — lásd `kulcsfajl.ts`.
 *
 * Egyetlen szabályt őriz: létező fájlt soha nem választhat, mert az egy másik
 * napló egyetlen visszaállítási útja lehet.
 */

import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { KULCSFAJL_ALAPNEV, szabadKulcsfajlUt } from './kulcsfajl.js';

const ASZTAL = join('teszt', 'Asztal');
const MOST = new Date(2026, 8, 15, 10, 30); // helyi idő: 2026. szeptember 15., 10:30
const ut = (nev: string): string => join(ASZTAL, nev);

describe('visszaállítási kulcsfájl neve', () => {
  it('üres Asztalon az alapnevet kapja', () => {
    expect(szabadKulcsfajlUt(ASZTAL, () => false, MOST)).toBe(ut(`${KULCSFAJL_ALAPNEV}.txt`));
  });

  it('ha már van kulcsfájl, nem írja felül — időbélyeges nevet választ', () => {
    const letezo = new Set([ut(`${KULCSFAJL_ALAPNEV}.txt`)]);
    expect(szabadKulcsfajlUt(ASZTAL, (u) => letezo.has(u), MOST)).toBe(
      ut(`${KULCSFAJL_ALAPNEV}-2026-09-15-1030.txt`),
    );
  });

  it('ha az időbélyeges név is foglalt, sorszámot fűz hozzá', () => {
    const letezo = new Set([
      ut(`${KULCSFAJL_ALAPNEV}.txt`),
      ut(`${KULCSFAJL_ALAPNEV}-2026-09-15-1030.txt`),
      ut(`${KULCSFAJL_ALAPNEV}-2026-09-15-1030-2.txt`),
    ]);
    const valasztott = szabadKulcsfajlUt(ASZTAL, (u) => letezo.has(u), MOST);
    expect(valasztott).toBe(ut(`${KULCSFAJL_ALAPNEV}-2026-09-15-1030-3.txt`));
    expect(letezo.has(valasztott)).toBe(false);
  });
});
