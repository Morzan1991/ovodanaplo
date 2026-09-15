/**
 * Az adatbázis titkosítási kulcsának kezelése.
 *
 * A program jelszó nélkül indul, mégis titkosított adatbázist használ. Ez úgy
 * lehetséges, hogy a véletlenszerű kulcsot a Windows saját védelmével
 * (`safeStorage`, a háttérben DPAPI) titkosítva tároljuk. Így:
 *   - a felhasználónak nem kell jelszót gépelni,
 *   - az adatbázis-fájl önmagában elmásolva olvashatatlan (más gépen, más fiókkal is),
 *   - DE a kulcs a Windows-felhasználói fiókhoz kötődik.
 *
 * Ezért van VISSZAÁLLÍTÁSI KULCS: ugyanaz a kulcs ember által leírható formában.
 * Ha a Windows-fiók elvész (újratelepítés, profilsérülés), enélkül az adat
 * véglegesen olvashatatlan lenne. A felhasználónak ezt ki kell mentenie a gépen
 * kívülre (papír, pendrive) — a profilon belül tárolt másolat vele együtt vész el.
 *
 * Hogy induláskor melyik kulcs kell (tárolt, új vagy bekért), azt nem ez a modul
 * dönti el, hanem a `kulcsdontes.ts`.
 */

import { app, safeStorage } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { TaroltKulcs } from './kulcsdontes.js';
import { kulcsErvenyes, kulcsFormazott } from './kulcsszoveg.js';

export { kulcsFormazott, kulcsNormalizal, kulcsErvenyes } from './kulcsszoveg.js';

/** A titkosított kulcsot tartalmazó fájl az adatmappában. */
function kulcsFajlUtvonal(): string {
  const dir = join(app.getPath('userData'), 'OvodaNaplo');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, 'kulcs.dat');
}

/** Elérhető-e a Windows jelszóvédelme. Nélküle a kulcs nem tárolható biztonságosan. */
export function vedelemElerheto(): boolean {
  return safeStorage.isEncryptionAvailable();
}

/**
 * A tárolt kulcs beolvasása. Új kulcsot SOHA nem hoz létre, és semmit nem ír:
 * hogy kell-e új kulcs, azt a `nyitasiDontes` dönti el, a meglévő adatbázis
 * ismeretében.
 */
export function taroltKulcsOlvas(): TaroltKulcs {
  const fajl = kulcsFajlUtvonal();
  if (!existsSync(fajl)) return { allapot: 'nincs' };
  if (!vedelemElerheto()) {
    return {
      allapot: 'olvashatatlan',
      ok: 'A Windows jelszóvédelme (safeStorage) nem érhető el.',
    };
  }
  try {
    // Egy másik Windows-fiókban (újratelepítés, profilsérülés után) ez kivételt dob.
    const kulcs = safeStorage.decryptString(readFileSync(fajl));
    if (!kulcsErvenyes(kulcs)) {
      return { allapot: 'olvashatatlan', ok: 'A tárolt titkosítási kulcs sérült vagy érvénytelen.' };
    }
    return { allapot: 'van', kulcs };
  } catch (err) {
    return { allapot: 'olvashatatlan', ok: (err as Error).message };
  }
}

/**
 * Új, 256 bites véletlen kulcs, azonnal eltárolva.
 *
 * Csak az `uj-kulcs` döntés után hívható: meglévő, titkosított adatbázis mellé
 * új kulcs soha nem készülhet.
 *
 * @throws ha a kulcs nem tárolható (nincs Windows-védelem, írási hiba)
 */
export function ujKulcsLetrehoz(): string {
  const kulcs = randomBytes(32).toString('hex');
  kulcsKiir(kulcs);
  return kulcs;
}

/** A kulcs (újra)mentése a Windows-védelemmel titkosítva. */
export function kulcsKiir(kulcs: string): void {
  const fajl = kulcsFajlUtvonal();
  const dir = dirname(fajl);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(fajl, safeStorage.encryptString(kulcs));
}

/**
 * A visszaállítási kulcs kiírása egy szöveges fájlba, magyarázattal együtt.
 * A felhasználónak ezt a gépen KÍVÜLRE kell másolnia.
 */
export function visszaallitasiFajlTartalma(kulcs: string): string {
  return [
    'ÓvodaNapló — VISSZAÁLLÍTÁSI KULCS',
    '='.repeat(52),
    '',
    'Ez a kulcs nyitja a naplód titkosított adatbázisát.',
    '',
    kulcsFormazott(kulcs),
    '',
    '='.repeat(52),
    'MIÉRT FONTOS EZ?',
    '',
    'A program normál esetben magától kinyitja az adatbázist — nem kell',
    'jelszót gépelned. Ez a Windows-fiókodhoz kötött védelemmel működik.',
    '',
    'HA a Windowst újratelepítik, vagy a felhasználói fiókod megsérül,',
    'a program EZEN KULCS NÉLKÜL NEM tudja visszaolvasni a tervezeteidet.',
    '',
    'MIT TEGYÉL?',
    '  1. Nyomtasd ki, vagy másold pendrive-ra / telefonra.',
    '  2. NE csak ezen a gépen tartsd — azzal együtt veszne el.',
    '  3. Tartsd olyan helyen, ahol más nem fér hozzá: aki ismeri a kulcsot,',
    '     el tudja olvasni a napló tartalmát.',
    '',
    `Készült: ${new Date().toLocaleString('hu-HU')}`,
    '',
  ].join('\n');
}
