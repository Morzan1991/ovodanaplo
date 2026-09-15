/**
 * Az adatbázis próba-megnyitása egy kulccsal — írás nélkül.
 *
 * Electron-függés nélkül, hogy valódi titkosított fájlon tesztelhető legyen.
 */

import Database from 'better-sqlite3';

/** SQL-sztringbe ágyazás: az aposztrófot duplázni kell. */
export function sqlIdezet(ertek: string): string {
  return ertek.replace(/'/g, "''");
}

/**
 * A kulcs ráadása egy frissen nyitott kapcsolatra.
 *
 * A megnyitás és a próba UGYANEZT használja: más titkosítási mód vagy más
 * kulcsformátum más kulcsot származtatna, és a helyes kulcs is rossznak tűnne.
 */
export function kulcsRaad(kapcsolat: Database.Database, kulcs: string): void {
  kapcsolat.pragma("cipher='sqlcipher'");
  kapcsolat.pragma(`key='${sqlIdezet(kulcs)}'`);
}

/**
 * Megnyitható-e a meglévő adatbázisfájl a megadott kulccsal? `null`: kulcs
 * nélkül, sima SQLite-ként.
 *
 * Csak olvasásra nyit, és a fájlnak léteznie kell — így adatbázist nem hozhat
 * létre és nem módosíthat. Rossz kulcsnál semmit nem ír; helyes kulcsnál az
 * SQLite üres `-wal`/`-shm` segédfájlt hagyhat maga után, az adatbázisfájl
 * tartalma akkor sem változik.
 *
 * @returns `false`, ha a fájl ezzel a kulccsal nem olvasható adatbázisként
 *          (rossz kulcs, titkosított fájl kulcs nélkül, sérült vagy idegen fájl).
 * @throws  minden más hibánál (nem létező, zárolt, olvashatatlan fájl): ilyenkor
 *          a kulcsról nem derült ki semmi, és egy „rossz a kulcs" üzenet félrevezetne.
 */
export function adatbazisNyithato(ut: string, kulcs: string | null): boolean {
  const kapcsolat = new Database(ut, { readonly: true, fileMustExist: true });
  try {
    if (kulcs !== null) kulcsRaad(kapcsolat, kulcs);
    kapcsolat.prepare('SELECT count(*) FROM sqlite_master').get();
    return true;
  } catch (err) {
    if (err instanceof Database.SqliteError && err.code === 'SQLITE_NOTADB') return false;
    throw err;
  } finally {
    kapcsolat.close();
  }
}
