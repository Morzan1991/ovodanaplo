/**
 * Próba-megnyitás valódi, titkosított SQLite-fájlokon — lásd `kulcsproba.ts`.
 *
 * Azt őrzi, amin a visszaállítás múlik: a kiírt visszaállítási kulcs visszagépelve
 * nyitja a naplót, a rossz kulcs nem — és a próba nem ír semmit.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adatbazisNyithato, kulcsRaad } from './kulcsproba.js';
import { kulcsFormazott, kulcsNormalizal } from './kulcsszoveg.js';

const KULCS = randomBytes(32).toString('hex');
const MASIK_KULCS = randomBytes(32).toString('hex');

let mappa: string;
let titkositott: string;
let titkositatlan: string;

/** Úgy hozza létre, ahogy a program: SQLCipher-kulcs, WAL mód, egy sor adat. */
function adatbazis(ut: string, kulcs: string | null): void {
  const db = new Database(ut);
  if (kulcs !== null) kulcsRaad(db, kulcs);
  db.pragma('journal_mode = WAL');
  db.exec("CREATE TABLE beallitasok (pedagogus_neve TEXT); INSERT INTO beallitasok VALUES ('Próba Piroska');");
  db.close();
}

/** A mappa minden fájlja tartalom-lenyomattal — a „semmit nem írt" ellenőrzéséhez. */
function mappaAllapot(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(mappa).map((nev) => [
      nev,
      createHash('sha256').update(readFileSync(join(mappa, nev))).digest('hex'),
    ]),
  );
}

beforeAll(() => {
  mappa = mkdtempSync(join(tmpdir(), 'ovodanaplo-kulcsproba-'));
  titkositott = join(mappa, 'titkositott.db');
  titkositatlan = join(mappa, 'titkositatlan.db');
  adatbazis(titkositott, KULCS);
  adatbazis(titkositatlan, null);
});

afterAll(() => {
  rmSync(mappa, { recursive: true, force: true });
});

describe('adatbázis próba-megnyitása', () => {
  it('rossz kulccsal nem nyílik, és semmit nem ír', () => {
    const elotte = mappaAllapot();
    expect(adatbazisNyithato(titkositott, MASIK_KULCS)).toBe(false);
    expect(mappaAllapot()).toEqual(elotte);
  });

  it('a helyes kulccsal megnyílik, az adatbázisfájl tartalma nem változik', () => {
    const elotte = mappaAllapot()['titkositott.db'];
    expect(adatbazisNyithato(titkositott, KULCS)).toBe(true);
    expect(mappaAllapot()['titkositott.db']).toBe(elotte);
  });

  it('a kiírt visszaállítási kulcs kézzel visszagépelve is nyitja', () => {
    const begepelt = kulcsFormazott(KULCS).toLowerCase().replace(/-/g, ' - ');
    expect(adatbazisNyithato(titkositott, kulcsNormalizal(begepelt))).toBe(true);
  });

  it('titkosított fájl kulcs nélkül nem nyílik', () => {
    expect(adatbazisNyithato(titkositott, null)).toBe(false);
  });

  it('titkosítatlan fájl kulcs nélkül megnyílik, kulccsal nem', () => {
    expect(adatbazisNyithato(titkositatlan, null)).toBe(true);
    expect(adatbazisNyithato(titkositatlan, KULCS)).toBe(false);
  });

  it('nem adatbázis fájlnál false — nem kivétel', () => {
    const idegen = join(mappa, 'idegen.db');
    writeFileSync(idegen, randomBytes(8192));
    expect(adatbazisNyithato(idegen, null)).toBe(false);
    expect(adatbazisNyithato(idegen, KULCS)).toBe(false);
  });

  it('nem létező fájlnál kivételt dob, és nem hozza létre', () => {
    const nincs = join(mappa, 'nincs.db');
    expect(() => adatbazisNyithato(nincs, KULCS)).toThrow();
    expect(existsSync(nincs)).toBe(false);
  });
});
