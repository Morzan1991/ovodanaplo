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
 */

import { app, safeStorage } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomBytes } from 'node:crypto';

/** A titkosított kulcsot tartalmazó fájl az adatmappában. */
function kulcsFajlUtvonal(): string {
  const dir = join(app.getPath('userData'), 'OvodaNaplo');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, 'kulcs.dat');
}

export interface KulcsAllapot {
  /** A nyers kulcs hex formában — ezzel nyitjuk az adatbázist. */
  kulcs: string;
  /** Most jött létre először? Ekkor meg kell mutatni a visszaállítási kulcsot. */
  ujonnanLetrehozva: boolean;
}

/**
 * Ember által olvasható forma: 8 karakteres csoportok kötőjellel.
 * Pl. `A1B2C3D4-E5F6...` — így le lehet írni papírra elgépelés nélkül.
 */
export function kulcsFormazott(kulcs: string): string {
  return (kulcs.toUpperCase().match(/.{1,8}/g) ?? []).join('-');
}

/** A formázott (kötőjeles, nagybetűs) alakból visszaállítja a nyers kulcsot. */
export function kulcsNormalizal(bevitel: string): string {
  return bevitel.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
}

/** Érvényes-e egy visszaállítási kulcs (256 bit = 64 hex karakter). */
export function kulcsErvenyes(kulcs: string): boolean {
  return /^[0-9a-f]{64}$/.test(kulcsNormalizal(kulcs));
}

/**
 * Betölti a meglévő kulcsot, vagy elsőre generál egy újat.
 *
 * @throws ha a Windows-védelem nem érhető el — ilyenkor a hívó dönt arról,
 *         hogy titkosítás nélkül folytat-e (inkább működjön a program, mint hogy
 *         a pedagógus kizárja magát a saját munkájából).
 */
export function kulcsBetoltVagyLetrehoz(): KulcsAllapot {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error(
      'A Windows jelszóvédelme (safeStorage) nem érhető el, ezért a titkosítási ' +
        'kulcs nem tárolható biztonságosan.',
    );
  }

  const fajl = kulcsFajlUtvonal();

  if (existsSync(fajl)) {
    const titkositott = readFileSync(fajl);
    const kulcs = safeStorage.decryptString(titkositott);
    if (!kulcsErvenyes(kulcs)) {
      throw new Error('A tárolt titkosítási kulcs sérült vagy érvénytelen.');
    }
    return { kulcs, ujonnanLetrehozva: false };
  }

  // Új kulcs: 256 bit véletlen.
  const kulcs = randomBytes(32).toString('hex');
  kulcsKiir(kulcs);
  return { kulcs, ujonnanLetrehozva: true };
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
