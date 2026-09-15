/**
 * SQLite adatbázis főprocesz-oldali modulja.
 * - Megnyitja a DB-t a userData mappában
 * - Első indításkor létrehozza a táblákat
 * - Beolvassa a seed adatokat (irodalom, ünnepek, képességek)
 */

import { app } from 'electron';
import { existsSync, mkdirSync, readFileSync, copyFileSync, statSync, renameSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// FIGYELEM: a `better-sqlite3` név a package.json-ban a `better-sqlite3-multiple-ciphers`
// csomagra van irányítva (npm alias). Így a titkosítás (SQLCipher) elérhető, és a
// drizzle-orm belső `better-sqlite3` importja is ugyanezt a példányt kapja — enélkül
// két külön SQLite kerülne a programba, és a drizzle nem indulna el.
//
// A csomag Node-API alapú, ezért ABI-stabil: Electron-frissítéskor NEM kell
// újrafordítani — ami ezen a gépen amúgy sem menne (nincs Visual Studio, és
// szóköz van az elérési útban).
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { kulcsBetoltVagyLetrehoz, type KulcsAllapot } from './kulcs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle<typeof schema>>;

export function getDb() {
  if (!db) throw new Error('DB nincs inicializálva — initDb() előbb!');
  return db;
}

export function getSqlite() {
  if (!sqlite) throw new Error('SQLite nincs inicializálva — initDb() előbb!');
  return sqlite;
}

export function getDbPath(): string {
  const userData = app.getPath('userData');
  const ovodaDir = join(userData, 'OvodaNaplo');
  if (!existsSync(ovodaDir)) {
    mkdirSync(ovodaDir, { recursive: true });
  }
  return join(ovodaDir, 'ovodanaplo.db');
}

/** SQL-sztringbe ágyazás: az aposztrófot duplázni kell. */
function sqlIdezet(ertek: string): string {
  return ertek.replace(/'/g, "''");
}

/**
 * Titkosítatlan-e a meglévő adatbázisfájl? (Kulcs nélkül olvasható-e.)
 * Új telepítésnél a fájl még nem létezik — ilyenkor nincs mit migrálni.
 */
function titkositatlanE(dbPath: string): boolean {
  if (!existsSync(dbPath)) return false;
  try {
    const proba = new Database(dbPath, { readonly: true });
    proba.prepare('SELECT count(*) FROM sqlite_master').get();
    proba.close();
    return true;
  } catch {
    return false;
  }
}

/**
 * A titkosítatlan adatbázis félretétele, hogy a helyére új, titkosított jöhessen.
 *
 * Az eredetit NEM töröljük: `...-titkositatlan-EREDETI.db` néven megmarad, amíg a
 * felhasználó meg nem győződött róla, hogy minden átjött. (Ezt a fájlt neki kell
 * letörölnie — amíg ott van, az adat titkosítatlanul is olvasható.)
 */
function eredetiFelretetel(dbPath: string): string {
  const forras = new Database(dbPath);
  try {
    // A WAL-ban álló tranzakciók is kerüljenek a fő fájlba a mozgatás előtt.
    forras.pragma('wal_checkpoint(TRUNCATE)');
  } finally {
    forras.close();
  }

  // Ütközésmentes név: sosem írunk felül egy korábbi félretett adatbázist.
  let eredetiMentes = dbPath.replace(/\.db$/, '-titkositatlan-EREDETI.db');
  if (existsSync(eredetiMentes)) {
    eredetiMentes = dbPath.replace(
      /\.db$/,
      `-titkositatlan-EREDETI-${Date.now()}.db`,
    );
  }
  renameSync(dbPath, eredetiMentes);

  for (const mellek of ['-wal', '-shm']) {
    const f = `${dbPath}${mellek}`;
    if (existsSync(f)) unlinkSync(f);
  }

  // Ha az átnevezés után MÉGIS maradt fájl a helyén, azt is félretesszük.
  // Enélkül a program egy ottfelejtett, titkosítatlan adatbázisra próbálná
  // ráhúzni a titkosítást — ilyenkor "file is not a database" hibával elszáll.
  // Nem törlünk semmit: minden félretett fájl megmarad, amíg a felhasználó dönt.
  if (existsSync(dbPath)) {
    const felesleges = dbPath.replace(/\.db$/, `-tovabbi-masolat-${Date.now()}.db`);
    renameSync(dbPath, felesleges);
    console.warn(`[db] További fájl volt az adatbázis helyén, félretéve: ${felesleges}`);
  }

  console.log(`[db] Titkosítatlan adatbázis félretéve: ${eredetiMentes}`);
  return eredetiMentes;
}

/** Egy tábla oszlopnevei az adott sémában. */
function oszlopNevek(sema: string, tabla: string): string[] {
  const sorok = sqlite.prepare(`PRAGMA ${sema}.table_info("${tabla}")`).all() as Array<{
    name: string;
  }>;
  return sorok.map((s) => s.name);
}

/**
 * Adatok átemelése a félretett, titkosítatlan adatbázisból az újba.
 *
 * A sémát már a `createTables()` létrehozta, itt csak a SOROK jönnek át. A régi
 * fájlt üres kulccsal csatoljuk (így olvasható titkosítatlanként), és csak a két
 * oldalon EGYARÁNT meglévő oszlopokat másoljuk — így egy időközbeni séma-bővítés
 * sem akasztja meg a költözést.
 */
function adatokAtmasolasa(eredetiUt: string): void {
  sqlite.exec(`ATTACH DATABASE '${sqlIdezet(eredetiUt)}' AS regi KEY ''`);
  try {
    const tablak = (
      sqlite
        .prepare(
          `SELECT name FROM regi.sqlite_master
           WHERE type='table'
             AND name NOT LIKE 'sqlite_%'
             AND name NOT LIKE '%_fts%'`,
        )
        .all() as Array<{ name: string }>
    ).map((t) => t.name);

    let osszesSor = 0;
    const masolas = sqlite.transaction(() => {
      for (const tabla of tablak) {
        const ujOszlopok = oszlopNevek('main', tabla);
        if (ujOszlopok.length === 0) continue; // ilyen tábla már nincs a sémában
        const regiOszlopok = new Set(oszlopNevek('regi', tabla));
        const kozos = ujOszlopok.filter((o) => regiOszlopok.has(o));
        if (kozos.length === 0) continue;

        const lista = kozos.map((o) => `"${o}"`).join(', ');
        const eredmeny = sqlite
          .prepare(
            `INSERT INTO main."${tabla}" (${lista}) SELECT ${lista} FROM regi."${tabla}"`,
          )
          .run();
        osszesSor += eredmeny.changes;
        console.log(`[db]   ${tabla}: ${eredmeny.changes} sor`);
      }
    });
    masolas();
    console.log(`[db] Átköltöztetve összesen ${osszesSor} sor.`);
  } finally {
    sqlite.exec('DETACH DATABASE regi');
  }

  // A kereső-index újraépítése a friss adatokból (a másolás sorrendjétől függetlenül).
  try {
    sqlite.exec('DELETE FROM heti_terv_fts');
    sqlite.exec(`
      INSERT INTO heti_terv_fts (heti_terv_id, tema, cel, feladat, kepessegfejlesztes, eszkozok, teruletek_osszesen)
      SELECT t.id, COALESCE(t.tema,''), COALESCE(t.cel,''), COALESCE(t.feladat,''),
             COALESCE(t.kepessegfejlesztes,''), COALESCE(t.eszkozok,''),
             COALESCE((SELECT GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' ')
                       FROM teruletek WHERE heti_terv_id = t.id), '')
      FROM heti_tervek t
    `);
  } catch (err) {
    console.warn('[db] A kereső-index újraépítése kimaradt:', (err as Error).message);
  }
}

/** Az indításkor kiderült kulcs-állapot — a főprocesz ez alapján tájékoztat. */
export interface TitkositasAllapot {
  aktiv: boolean;
  ujKulcs: boolean;
  kulcs: string | null;
  hiba: string | null;
}
let titkositasAllapot: TitkositasAllapot = {
  aktiv: false,
  ujKulcs: false,
  kulcs: null,
  hiba: null,
};

export function getTitkositasAllapot(): TitkositasAllapot {
  return titkositasAllapot;
}

export function initDb(): void {
  const dbPath = getDbPath();
  console.log('[db] Adatbázis útvonal:', dbPath);

  // 1) Kulcs betöltése/létrehozása. Ha a Windows-védelem nem érhető el, inkább
  //    titkosítás nélkül indulunk, mint hogy a pedagógus ne férjen a munkájához.
  let kulcsAllapot: KulcsAllapot | null = null;
  try {
    kulcsAllapot = kulcsBetoltVagyLetrehoz();
  } catch (err) {
    titkositasAllapot = {
      aktiv: false,
      ujKulcs: false,
      kulcs: null,
      hiba: (err as Error).message,
    };
    console.error('[db] Titkosítás nem aktiválható:', err);
  }

  // 2) Ha van meglévő, titkosítatlan adatbázis, félretesszük — a helyére új,
  //    titkosított jön, és utána átemeljük belőle az adatokat.
  let atkoltoztetendo: string | null = null;

  if (kulcsAllapot) {
    if (titkositatlanE(dbPath)) {
      atkoltoztetendo = eredetiFelretetel(dbPath);
    }
    sqlite = new Database(dbPath);
    sqlite.pragma("cipher='sqlcipher'");
    sqlite.pragma(`key='${sqlIdezet(kulcsAllapot.kulcs)}'`);
    titkositasAllapot = {
      aktiv: true,
      ujKulcs: kulcsAllapot.ujonnanLetrehozva,
      kulcs: kulcsAllapot.kulcs,
      hiba: null,
    };
  } else {
    sqlite = new Database(dbPath);
  }

  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  db = drizzle(sqlite, { schema });

  createTables();

  // Az adatok átemelése a séma létrehozása UTÁN, de a seed-elés ELŐTT kell
  // történjen: így a seed-lépés már látja a meglévő sorokat, és nem duplikál.
  if (atkoltoztetendo) {
    adatokAtmasolasa(atkoltoztetendo);
  }

  loadSeedData();
}

/**
 * Inline tábla-létrehozás (a Drizzle séma alapján).
 * Egyszerűbb, mint a kit/migrate önbontható setup egy desktop app-ban.
 * IF NOT EXISTS — biztonságos újraindításnál.
 */
function createTables(): void {
  const statements = [
    `CREATE TABLE IF NOT EXISTS beallitasok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedagogus_neve TEXT,
      ovoda_neve TEXT,
      ovoda_cime TEXT,
      csoport_neve TEXT,
      csoport_tipus TEXT DEFAULT 'vegyes',
      utolso_backup INTEGER,
      theme_accent TEXT DEFAULT 'osz'
    )`,
    `CREATE TABLE IF NOT EXISTS nevelesi_evek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      kezdo TEXT NOT NULL,
      zaro TEXT NOT NULL,
      aktiv INTEGER DEFAULT 0,
      korcsoport TEXT DEFAULT 'vegyes',
      letrehozva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE TABLE IF NOT EXISTS projektek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      cim TEXT NOT NULL,
      kezdo_datum TEXT,
      zaro_datum TEXT,
      cel TEXT,
      tema TEXT,
      feladat_ertelmi TEXT,
      feladat_kommunikacios TEXT,
      feladat_erkolcsi TEXT,
      feladat_testi TEXT,
      bevontak TEXT,
      elokeszuletek TEXT,
      alkoto_tevekenysegek TEXT,
      jatekok TEXT,
      szabalyok TEXT,
      produktumok_gyermeki TEXT,
      produktumok_pedagogusi TEXT,
      munka_jellegu TEXT,
      ovodapedagogus_feladatai TEXT,
      eszkozok TEXT,
      iskola_elokeszito_osszesitett TEXT,
      szokasok_hagyomanyok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS projekt_nevelesi_ev_idx ON projektek(nevelesi_ev_id)`,
    `CREATE TABLE IF NOT EXISTS heti_tervek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      projekt_id INTEGER REFERENCES projektek(id),
      het_szama INTEGER,
      kezdo_datum TEXT NOT NULL,
      zaro_datum TEXT NOT NULL,
      tema TEXT,
      cel TEXT,
      feladat TEXT,
      differencialas TEXT DEFAULT 'tartalomban, módszerekben, segítségadás módjában és mennyiségében, az egyénre fordított idő mennyiségében',
      modszerek TEXT DEFAULT 'bemutatás, magyarázat, szemléltetés, cselekedtetés, gyakorlás, ellenőrzés, értékelés',
      kepessegfejlesztes TEXT,
      eszkozok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS heti_terv_datum_idx ON heti_tervek(kezdo_datum)`,
    `CREATE INDEX IF NOT EXISTS heti_terv_nevelesi_ev_idx ON heti_tervek(nevelesi_ev_id)`,
    `CREATE TABLE IF NOT EXISTS teruletek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heti_terv_id INTEGER NOT NULL REFERENCES heti_tervek(id) ON DELETE CASCADE,
      tipus TEXT NOT NULL,
      tartalom TEXT,
      iskola_elokeszito TEXT,
      sorrend INTEGER DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS terulet_heti_terv_idx ON teruletek(heti_terv_id)`,
    `CREATE TABLE IF NOT EXISTS foglalkozas_tervezetek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heti_terv_id INTEGER REFERENCES heti_tervek(id),
      pedagogus_neve TEXT,
      helyszin TEXT,
      idopont TEXT,
      csoport TEXT,
      csoport_tipus TEXT,
      tevekenysegi_forma TEXT,
      tema TEXT NOT NULL,
      cel TEXT,
      feladat TEXT,
      korcsoport TEXT,
      idotartam TEXT,
      eszkozok TEXT,
      motivacio TEXT,
      fo_resz TEXT,
      befejezes TEXT,
      munkaforma TEXT,
      modszerek TEXT,
      differencialas TEXT,
      kepessegfejlesztes TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS foglalkozas_heti_terv_idx ON foglalkozas_tervezetek(heti_terv_id)`,
    `CREATE TABLE IF NOT EXISTS reflexiok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipus TEXT NOT NULL,
      foglalkozas_id INTEGER REFERENCES foglalkozas_tervezetek(id) ON DELETE CASCADE,
      heti_terv_id INTEGER REFERENCES heti_tervek(id) ON DELETE CASCADE,
      projekt_id INTEGER REFERENCES projektek(id) ON DELETE CASCADE,
      terulet_tipus TEXT,
      tartalom TEXT NOT NULL,
      forrasok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS reflexio_heti_terv_idx ON reflexiok(heti_terv_id)`,
    `CREATE INDEX IF NOT EXISTS reflexio_foglalkozas_idx ON reflexiok(foglalkozas_id)`,
    `CREATE INDEX IF NOT EXISTS reflexio_projekt_idx ON reflexiok(projekt_id)`,
    `CREATE TABLE IF NOT EXISTS esemenyek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      heti_terv_id INTEGER REFERENCES heti_tervek(id),
      cim TEXT NOT NULL,
      datum TEXT NOT NULL,
      tipus TEXT,
      leiras TEXT,
      reszvevok TEXT,
      reflexio TEXT,
      letrehozva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS esemeny_datum_idx ON esemenyek(datum)`,
    `CREATE TABLE IF NOT EXISTS irodalom (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipus TEXT NOT NULL,
      cim TEXT NOT NULL,
      szerzo TEXT,
      forras TEXT,
      szoveg TEXT,
      korcsoport TEXT,
      temak TEXT,
      sajat INTEGER DEFAULT 0,
      letrehozva INTEGER DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS irodalom_tipus_idx ON irodalom(tipus)`,
    `CREATE INDEX IF NOT EXISTS irodalom_cim_idx ON irodalom(cim)`,
    `CREATE TABLE IF NOT EXISTS unnepek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      honap INTEGER,
      nap INTEGER,
      tipus TEXT NOT NULL,
      kategoria TEXT,
      leiras TEXT,
      ovodai_sulyozas INTEGER DEFAULT 5,
      alap_javaslatok TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS kepessegek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL,
      kategoria TEXT,
      iskola_elokeszito INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS heti_terv_kepesseg (
      heti_terv_id INTEGER NOT NULL REFERENCES heti_tervek(id) ON DELETE CASCADE,
      kepesseg_id INTEGER NOT NULL REFERENCES kepessegek(id)
    )`,
    `CREATE INDEX IF NOT EXISTS htk_heti_terv_idx ON heti_terv_kepesseg(heti_terv_id)`,
    `CREATE INDEX IF NOT EXISTS htk_kepesseg_idx ON heti_terv_kepesseg(kepesseg_id)`,

    // TODO-12: Full-text keresés a heti tervekre + területekre (FTS5)
    `CREATE VIRTUAL TABLE IF NOT EXISTS heti_terv_fts USING fts5(
       heti_terv_id UNINDEXED,
       tema,
       cel,
       feladat,
       kepessegfejlesztes,
       eszkozok,
       teruletek_osszesen,
       tokenize='unicode61 remove_diacritics 2'
     )`,
    // Trigger-ek: heti_tervek INSERT/UPDATE/DELETE → FTS sync
    `CREATE TRIGGER IF NOT EXISTS heti_terv_ai
       AFTER INSERT ON heti_tervek BEGIN
         INSERT INTO heti_terv_fts (heti_terv_id, tema, cel, feladat, kepessegfejlesztes, eszkozok, teruletek_osszesen)
         VALUES (new.id, COALESCE(new.tema,''), COALESCE(new.cel,''), COALESCE(new.feladat,''),
                 COALESCE(new.kepessegfejlesztes,''), COALESCE(new.eszkozok,''), '');
       END`,
    `CREATE TRIGGER IF NOT EXISTS heti_terv_au
       AFTER UPDATE ON heti_tervek BEGIN
         UPDATE heti_terv_fts SET
           tema = COALESCE(new.tema,''),
           cel = COALESCE(new.cel,''),
           feladat = COALESCE(new.feladat,''),
           kepessegfejlesztes = COALESCE(new.kepessegfejlesztes,''),
           eszkozok = COALESCE(new.eszkozok,'')
         WHERE heti_terv_id = new.id;
       END`,
    `CREATE TRIGGER IF NOT EXISTS heti_terv_ad
       AFTER DELETE ON heti_tervek BEGIN
         DELETE FROM heti_terv_fts WHERE heti_terv_id = old.id;
       END`,
    // Trigger-ek a teruletek táblára: területenkénti tartalom → 'teruletek_osszesen' FTS-mező
    `CREATE TRIGGER IF NOT EXISTS terulet_ai
       AFTER INSERT ON teruletek BEGIN
         UPDATE heti_terv_fts SET teruletek_osszesen = (
           SELECT GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' ')
           FROM teruletek WHERE heti_terv_id = new.heti_terv_id
         ) WHERE heti_terv_id = new.heti_terv_id;
       END`,
    `CREATE TRIGGER IF NOT EXISTS terulet_au
       AFTER UPDATE ON teruletek BEGIN
         UPDATE heti_terv_fts SET teruletek_osszesen = (
           SELECT GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' ')
           FROM teruletek WHERE heti_terv_id = new.heti_terv_id
         ) WHERE heti_terv_id = new.heti_terv_id;
       END`,
    `CREATE TRIGGER IF NOT EXISTS terulet_ad
       AFTER DELETE ON teruletek BEGIN
         UPDATE heti_terv_fts SET teruletek_osszesen = (
           SELECT COALESCE(GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' '), '')
           FROM teruletek WHERE heti_terv_id = old.heti_terv_id
         ) WHERE heti_terv_id = old.heti_terv_id;
       END`,
  ];

  const tx = sqlite.transaction(() => {
    for (const stmt of statements) {
      sqlite.exec(stmt);
    }
  });
  tx();

  // Mini-migrációk — már létező táblák hiányzó oszlopainak felvétele.
  // SQLite-ban nincs IF NOT EXISTS az ALTER TABLE ADD COLUMN-on, ezért
  // try-catch-tel kezeljük a "duplicate column" hibát (= már létezik).
  const miniMigrations: Array<{ tabla: string; oszlop: string; tipus: string }> = [
    { tabla: 'nevelesi_evek', oszlop: 'korcsoport', tipus: "TEXT DEFAULT 'vegyes'" },
    { tabla: 'foglalkozas_tervezetek', oszlop: 'iskola_elokeszito', tipus: 'TEXT' },
  ];
  for (const m of miniMigrations) {
    try {
      sqlite.exec(`ALTER TABLE ${m.tabla} ADD COLUMN ${m.oszlop} ${m.tipus}`);
      console.log(`[db] Mini-migráció: ${m.tabla}.${m.oszlop} hozzáadva.`);
    } catch (err) {
      const msg = (err as Error).message ?? '';
      if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
        console.warn(`[db] Mini-migráció skip ${m.tabla}.${m.oszlop}:`, msg);
      }
    }
  }

  // TODO-12: FTS5 backfill — ha az fts tábla üres és van heti terv, töltsük fel
  try {
    const ftsRow = sqlite.prepare('SELECT COUNT(*) as n FROM heti_terv_fts').get() as { n: number } | undefined;
    const tervRow = sqlite.prepare('SELECT COUNT(*) as n FROM heti_tervek').get() as { n: number } | undefined;
    if (ftsRow && tervRow && ftsRow.n === 0 && tervRow.n > 0) {
      sqlite.exec(`
        INSERT INTO heti_terv_fts (heti_terv_id, tema, cel, feladat, kepessegfejlesztes, eszkozok, teruletek_osszesen)
        SELECT
          t.id,
          COALESCE(t.tema,''),
          COALESCE(t.cel,''),
          COALESCE(t.feladat,''),
          COALESCE(t.kepessegfejlesztes,''),
          COALESCE(t.eszkozok,''),
          COALESCE((SELECT GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' ')
                    FROM teruletek WHERE heti_terv_id = t.id), '')
        FROM heti_tervek t
      `);
      console.log(`[db] FTS5 backfill: ${tervRow.n} heti terv indexelve.`);
    }
  } catch (err) {
    console.warn('[db] FTS5 backfill skipped:', (err as Error).message);
  }

  console.log('[db] Táblák létrehozva / ellenőrizve.');
}

/**
 * Seed adatok beolvasása JSON fájlokból.
 * Csak akkor, ha az adott tábla üres — duplikáció elkerülése.
 */
function loadSeedData(): void {
  const seedDir = resolveSeedDir();
  if (!seedDir) {
    console.warn('[db] Seed mappa nem található, kihagyva.');
    return;
  }

  // K2 fix: minden seed-funkciót izoláltan csapdázunk.
  // Ha az irodalmi JSON sérült, a többi (ünnepek, képességek) még betölthet.
  // Korábban egy közös try/catch volt — egy sérült fájl mindent megakasztott.
  const safeSeed = (nev: string, fn: () => void): void => {
    try {
      fn();
    } catch (err) {
      console.error(`[db] ${nev} seed hiba (kihagyva, de az app indul):`, err);
    }
  };

  safeSeed('Irodalom', () => seedIrodalom(seedDir));
  safeSeed('Ünnepek', () => seedUnnepek(seedDir));
  safeSeed('Képességek', () => seedKepessegek(seedDir));
  safeSeed('Beállítások', () => beallitasSorBiztositas());
}

/**
 * Gondoskodik róla, hogy pontosan egy beállítás-sor létezzen.
 *
 * A program egyfelhasználós: mindig van „a" beállítás. Korábban a sor csak akkor
 * jött létre, amikor a felhasználó először RÁMENTETT a Beállítások oldalra —
 * addig a fejléc „Beállítások hiányoznak" feliratot mutatott, és a korosztály-
 * szűrés is támpont nélkül maradt. Ha a sor bármiért hiányzik (új telepítés, vagy
 * egy költöztetésnél elveszett), itt pótoljuk.
 *
 * A korosztályt az aktív nevelési évtől vesszük át, ha van — így a Naptárban
 * megadott csoporttípus akkor is érvényesül, ha a Beállításokat még nem nyitotta meg.
 */
function beallitasSorBiztositas(): void {
  const van = sqlite.prepare('SELECT count(*) AS db FROM beallitasok').get() as { db: number };
  if (van.db > 0) return;

  const ev = sqlite
    .prepare('SELECT korcsoport FROM nevelesi_evek WHERE aktiv = 1 LIMIT 1')
    .get() as { korcsoport: string | null } | undefined;

  sqlite
    .prepare('INSERT INTO beallitasok (csoport_tipus, theme_accent) VALUES (?, ?)')
    .run(ev?.korcsoport ?? 'vegyes', 'osz');
  console.log(
    `[db] Beállítás-sor létrehozva (korcsoport: ${ev?.korcsoport ?? 'vegyes'}).`,
  );
}

/**
 * Biztonságos JSON-parse a seed-fájlokhoz.
 * Hibás vagy sérült JSON esetén explicit Error-t dob a fájl nevével.
 */
function parseSeedJson<T>(filePath: string, label: string): T {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`${label} JSON nem olvasható (${filePath}): ${(err as Error).message}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`${label} JSON sérült (${filePath}): ${(err as Error).message}`);
  }
}

/**
 * Megtalálja a seed mappát:
 * - dev módban: out/main/index.js → 3 szint feljebb → _ovodanaplo/seed
 * - prod módban: process.resourcesPath/seed (extraResources)
 */
function resolveSeedDir(): string | null {
  const candidates = [
    join(__dirname, '..', '..', '..', 'seed'), // out/main → app → _ovodanaplo/seed (dev)
    join(__dirname, '..', '..', 'seed'), // ha máshogy futna
    join(process.resourcesPath, 'seed'), // prod (extraResources)
  ];

  for (const p of candidates) {
    if (existsSync(p)) {
      console.log('[db] Seed mappa megtalálva:', p);
      return p;
    }
  }
  return null;
}

interface LiteratureSeed {
  tetelek: Array<{
    tipus: string;
    cim: string;
    szerzo: string | null;
    forras: string;
    korcsoport?: string;
    temak?: string[];
  }>;
}

interface HolidaySeed {
  unnepek: Array<{
    nev: string;
    honap: number | null;
    nap: number | null;
    tipus: string;
    kategoria?: string;
    leiras?: string;
    ovodaiSulyozas?: number;
  }>;
}

interface CapabilitySeed {
  kepessegek: Array<{
    nev: string;
    kategoria?: string;
    iskolaElokeszito?: number;
  }>;
}

function seedIrodalom(seedDir: string): void {
  const data = parseSeedJson<LiteratureSeed>(join(seedDir, 'literature.json'), 'Irodalom');

  // M3 fix: változás-detektálás mezőszintű összehasonlítással.
  // Ha a JSON-ban módosul egy meglévő mű (forras / korcsoport / temak / szoveg / tipus),
  // automatikusan frissítjük a DB-ben. Korábban csak az üres szöveget töltöttük be —
  // a többi mező frissítését elhanyagoltuk → inkonzisztens állapot.
  type ExistingRow = {
    id: number;
    tipus: string;
    cim: string;
    szerzo: string | null;
    forras: string | null;
    korcsoport: string | null;
    temak: string | null;
    szoveg: string | null;
  };
  const meglevoRows = sqlite
    .prepare('SELECT id, tipus, cim, szerzo, forras, korcsoport, temak, szoveg FROM irodalom WHERE sajat = 0')
    .all() as ExistingRow[];
  const meglevoMap = new Map<string, ExistingRow>();
  for (const r of meglevoRows) {
    meglevoMap.set(`${r.cim}|${r.szerzo ?? ''}`, r);
  }

  const insert = sqlite.prepare(
    `INSERT INTO irodalom (tipus, cim, szerzo, forras, korcsoport, temak, szoveg, sajat)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
  );
  const updateTeljes = sqlite.prepare(
    `UPDATE irodalom SET tipus = ?, forras = ?, korcsoport = ?, temak = ?, szoveg = ? WHERE id = ? AND sajat = 0`,
  );
  const torles = sqlite.prepare('DELETE FROM irodalom WHERE id = ? AND sajat = 0');

  type Tetel = LiteratureSeed['tetelek'][number] & { szoveg?: string };
  const ujKulcsok = new Set<string>();
  for (const tetel of data.tetelek as Tetel[]) {
    ujKulcsok.add(`${tetel.cim}|${tetel.szerzo ?? ''}`);
  }

  let ujCount = 0;
  let frissitettCount = 0;
  let toroltCount = 0;
  const tx = sqlite.transaction(() => {
    // 1. Töröljük a kihagyott tételeket (sajat=0, már nincs a JSON-ban)
    for (const r of meglevoRows) {
      const kulcs = `${r.cim}|${r.szerzo ?? ''}`;
      if (!ujKulcsok.has(kulcs)) {
        torles.run(r.id);
        toroltCount++;
      }
    }
    // 2. Új tételek + meglévők változás-frissítése
    for (const tetel of data.tetelek as Tetel[]) {
      const kulcs = `${tetel.cim}|${tetel.szerzo ?? ''}`;
      const meglevo = meglevoMap.get(kulcs);
      const ujTemakJson = JSON.stringify(tetel.temak ?? []);
      const ujKorcsoport = tetel.korcsoport ?? 'vegyes';
      // A szöveget a JSON csak akkor írja felül, ha ténylegesen VAN benne szöveg.
      // Az óvónő az Irodalom oldalon beírhatja a mese/vers szövegét egy seed-műnél
      // is (`irodalomSzovegMent`); ha a JSON üres szövegét is „változásnak” vennénk,
      // a következő indításkor a seed csendben kitörölné, amit begépelt.
      const jsonSzoveg = tetel.szoveg && tetel.szoveg.trim() ? tetel.szoveg : null;
      const ujForras = tetel.forras ?? null;
      const ujTipus = tetel.tipus;

      if (!meglevo) {
        insert.run(ujTipus, tetel.cim, tetel.szerzo, ujForras, ujKorcsoport, ujTemakJson, jsonSzoveg);
        ujCount++;
      } else {
        // Változás-detektálás: csak akkor UPDATE, ha legalább egy mező eltér.
        // (A USER által szerkesztett sajat=1 tételek érintetlenek — meglevoRows csak sajat=0-t tartalmaz.)
        const eltero =
          meglevo.tipus !== ujTipus ||
          (meglevo.forras ?? null) !== ujForras ||
          (meglevo.korcsoport ?? 'vegyes') !== ujKorcsoport ||
          (meglevo.temak ?? '[]') !== ujTemakJson ||
          (jsonSzoveg !== null && (meglevo.szoveg ?? null) !== jsonSzoveg);
        if (eltero) {
          // Ha a JSON-ban nincs szöveg, a DB-ben meglévőt MEGTARTJUK.
          const megtartottSzoveg = jsonSzoveg ?? meglevo.szoveg ?? null;
          updateTeljes.run(ujTipus, ujForras, ujKorcsoport, ujTemakJson, megtartottSzoveg, meglevo.id);
          frissitettCount++;
        }
      }
    }
  });
  tx();
  if (toroltCount > 0) {
    console.log(`[db] Irodalom seed: ${toroltCount} tétel törölve (már nincs a JSON-ban).`);
  }
  if (ujCount > 0 || frissitettCount > 0) {
    console.log(`[db] Irodalom seed: ${ujCount} új + ${frissitettCount} frissítve. Összes: ${data.tetelek.length}`);
  } else {
    console.log(`[db] Irodalom seed: már naprakész (${data.tetelek.length} tétel).`);
  }
}

function seedUnnepek(seedDir: string): void {
  const data = parseSeedJson<HolidaySeed>(join(seedDir, 'hungarian-holidays.json'), 'Ünnepek');

  // Korábban csak ÜRES táblát töltöttünk fel, ezért a később hozzáadott ünnepek
  // (pl. Erdők Nemzetközi Napja, Méhek Világnapja — amikre sablonok hivatkoztak,
  // de a naptárban nem szerepeltek) sosem jutottak el a már használatban lévő
  // adatbázisokba. Most a hiányzókat név szerint pótoljuk, a meglévőket pedig
  // érintetlenül hagyjuk (a felhasználó módosításai megmaradnak).
  const meglevoNevek = new Set(
    (sqlite.prepare('SELECT nev FROM unnepek').all() as Array<{ nev: string }>).map(
      (x) => x.nev,
    ),
  );
  const ujak = data.unnepek.filter((u) => !meglevoNevek.has(u.nev));
  if (ujak.length === 0) return;

  const insert = sqlite.prepare(
    `INSERT INTO unnepek (nev, honap, nap, tipus, kategoria, leiras, ovodai_sulyozas)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const tx = sqlite.transaction(() => {
    for (const u of ujak) {
      insert.run(u.nev, u.honap, u.nap, u.tipus, u.kategoria ?? null, u.leiras ?? null, u.ovodaiSulyozas ?? 5);
    }
  });
  tx();
  console.log(
    meglevoNevek.size === 0
      ? `[db] Ünnepek seed: ${ujak.length} tétel betöltve.`
      : `[db] Ünnepek: ${ujak.length} új ünnep pótolva (${ujak.map((u) => u.nev).join(', ')}).`,
  );
}

function seedKepessegek(seedDir: string): void {
  const count = sqlite.prepare('SELECT COUNT(*) as n FROM kepessegek').get() as { n: number };
  if (count.n > 0) return;

  const data = parseSeedJson<CapabilitySeed>(join(seedDir, 'kepessegek.json'), 'Képességek');
  const insert = sqlite.prepare(
    `INSERT INTO kepessegek (nev, kategoria, iskola_elokeszito) VALUES (?, ?, ?)`,
  );

  const tx = sqlite.transaction(() => {
    for (const k of data.kepessegek) {
      insert.run(k.nev, k.kategoria ?? null, k.iskolaElokeszito ?? 0);
    }
  });
  tx();
  console.log(`[db] Képességek seed: ${data.kepessegek.length} tétel betöltve.`);
}

/**
 * Backup egy snapshot fájlba a backups mappába.
 * Csendes hiba esetén csak loggol — nem akasztja az app-ot.
 *
 * M5 fix: 1) méret-validáció — ha az aznapi backup üres/csonka (<10KB), újra próbáljuk.
 *         2) atomic copy — temp-fájlba másol, majd rename. Ha félútban kihal, nincs csonka fájl.
 *         3) source-méret összehasonlítás — sanity check.
 */
/** Hány napi mentést tartunk meg. A régebbieket töröljük. */
const MEGTARTOTT_BACKUPOK = 30;

/**
 * Régi mentések törlése — a legfrissebb `MEGTARTOTT_BACKUPOK` darab marad.
 * Enélkül a mentés-mappa évekig korlátlanul nő (napi ~1-2 MB).
 * Csendes hiba: a takarítás sosem akaszthatja meg a mentést.
 */
function forgatasiTakaritas(backupsDir: string): void {
  try {
    const fajlok = readdirSync(backupsDir)
      .filter((f) => /^ovodanaplo-\d{4}-\d{2}-\d{2}\.db$/.test(f))
      .sort() // a névben ISO-dátum van, így a névsor = időrend
      .reverse();
    for (const regi of fajlok.slice(MEGTARTOTT_BACKUPOK)) {
      unlinkSync(join(backupsDir, regi));
      console.log(`[db] Régi backup törölve: ${regi}`);
    }
  } catch (err) {
    console.warn('[db] Backup-forgatás hiba (nem kritikus):', err);
  }
}

export function createBackup(): string | null {
  const MIN_BACKUP_SIZE = 10 * 1024; // 10 KB — kisebb az üres/csonka DB-nél
  try {
    const backupsDir = join(app.getPath('userData'), 'OvodaNaplo', 'backups');
    if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });

    // HELYI dátum, nem UTC. A `toISOString()` UTC szerint ad dátumot, ezért
    // éjfél és hajnali 2 óra között (magyar téli/nyári időzóna) az ELŐZŐ napra
    // íródott volna a mentés — felülírva az akkori pillanatképet.
    const most = new Date();
    const ts = [
      most.getFullYear(),
      String(most.getMonth() + 1).padStart(2, '0'),
      String(most.getDate()).padStart(2, '0'),
    ].join('-');
    const target = join(backupsDir, `ovodanaplo-${ts}.db`);

    // Ha aznap már van backup, akkor is csak FRISS és elég nagy fájlt fogadunk el.
    //
    // A puszta "létezik és >10KB" ellenőrzés csendes adatvesztéshez vezetett: ha a
    // mappában ott maradt egy aznapi NEVŰ, de régi TARTALMÚ fájl (pl. gépköltözéskor
    // átmásolt snapshot), a függvény visszatért vele, és az aznapi valódi munkáról
    // soha nem készült mentés. Ezért az adatbázis módosítási idejéhez hasonlítunk:
    // ha a mentés régebbi, mint az adatbázis, újraírjuk.
    if (existsSync(target)) {
      try {
        const stat = statSync(target);
        const forrasStat = statSync(getDbPath());
        if (stat.size >= MIN_BACKUP_SIZE && stat.mtimeMs >= forrasStat.mtimeMs) {
          return target;
        }
        console.warn(
          `[db] Aznapi backup elavult vagy csonka (${stat.size} byte, ` +
            `${new Date(stat.mtimeMs).toISOString()}), újraírjuk.`,
        );
      } catch {
        // statSync hiba — folytatjuk és újraírjuk
      }
    }

    // WAL-checkpoint a másolás ELŐTT.
    // WAL-módban a legfrissebb tranzakciók a `-wal` fájlban ülnek, nem a `.db`-ben.
    // Enélkül a backup a mai munkát NEM tartalmazza — csak a legutóbbi checkpoint-ig
    // tartó állapotot. A TRUNCATE mód beolvasztja a WAL-t a főfájlba és kiüríti.
    try {
      sqlite.pragma('wal_checkpoint(TRUNCATE)');
    } catch (err) {
      // Ha nem sikerül (pl. másik olvasó fogja), a másolat hiányos lehet — inkább
      // kihagyjuk a backupot, mint hogy hamis biztonságérzetet adjunk.
      console.error('[db] WAL-checkpoint sikertelen, backup kihagyva:', err);
      return null;
    }

    // Atomic copy: tmp fájlba, majd rename. Így félút esetén nincs csonka célfájl.
    const source = getDbPath();
    const sourceSize = statSync(source).size;
    if (sourceSize < MIN_BACKUP_SIZE) {
      console.warn(`[db] Forrás DB túl kicsi (${sourceSize} byte), backup kihagyva.`);
      return null;
    }

    const tmpTarget = `${target}.tmp-${process.pid}-${Date.now()}`;
    copyFileSync(source, tmpTarget);
    // Méret-ellenőrzés a temp-fájlon
    const copiedSize = statSync(tmpTarget).size;
    if (copiedSize < MIN_BACKUP_SIZE) {
      try { unlinkSync(tmpTarget); } catch { /* ignore */ }
      throw new Error(`Backup másolat túl kicsi (${copiedSize} byte) — feltételezhetően csonka.`);
    }
    renameSync(tmpTarget, target);
    console.log(`[db] Backup elkészült: ${target} (${copiedSize} byte)`);
    forgatasiTakaritas(backupsDir);
    return target;
  } catch (err) {
    console.error('[db] Backup hiba:', err);
    return null;
  }
}

export function closeDb(): void {
  if (sqlite) {
    sqlite.close();
    console.log('[db] Adatbázis lezárva.');
  }
}

export { sql };
