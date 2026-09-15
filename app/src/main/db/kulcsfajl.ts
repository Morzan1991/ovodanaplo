/**
 * A visszaállítási kulcsfájl nevének kiválasztása.
 *
 * MIÉRT KÜLÖN MODUL. A kulcsfájl az egyetlen út vissza a titkosított naplóhoz, ha
 * a Windows-fiók elvész. Korábban a program minden új kulcsnál kérdés nélkül
 * FELÜLÍRTA az Asztalon már ott lévő `OvodaNaplo-visszaallitasi-kulcs.txt`-t.
 * Új kulcs pedig nem csak a legelső indításkor keletkezik, hanem minden olyan
 * indításkor is, amikor az adatmappa üres — egy próbatelepítésnél, egy új
 * Windows-fióknál, egy szinkronizált Asztalú második gépen. Ilyenkor a régi fájl
 * egy MÁSIK napló kulcsa volt, és a felülírással az a napló örökre
 * olvashatatlanná vált volna.
 *
 * Ezért itt soha nem választunk létező fájlnevet. Electron-függés nélkül, hogy
 * tesztelhető legyen.
 */

import { join } from 'node:path';

export const KULCSFAJL_ALAPNEV = 'OvodaNaplo-visszaallitasi-kulcs';

/**
 * Olyan fájlútvonal a megadott mappában, amely még nem létezik.
 *
 * Elsőként az alapnevet adja. Ha az foglalt, időbélyeget fűz hozzá
 * (`…-2026-09-15-1030.txt`), és ha az is, sorszámot (`…-1030-2.txt`).
 */
export function szabadKulcsfajlUt(
  konyvtar: string,
  letezik: (ut: string) => boolean,
  most: Date = new Date(),
): string {
  const alap = join(konyvtar, `${KULCSFAJL_ALAPNEV}.txt`);
  if (!letezik(alap)) return alap;

  const k = (n: number): string => String(n).padStart(2, '0');
  const belyeg =
    `${most.getFullYear()}-${k(most.getMonth() + 1)}-${k(most.getDate())}` +
    `-${k(most.getHours())}${k(most.getMinutes())}`;

  let ut = join(konyvtar, `${KULCSFAJL_ALAPNEV}-${belyeg}.txt`);
  for (let sorszam = 2; letezik(ut); sorszam++) {
    ut = join(konyvtar, `${KULCSFAJL_ALAPNEV}-${belyeg}-${sorszam}.txt`);
  }
  return ut;
}
