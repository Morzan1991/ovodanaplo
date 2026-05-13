/**
 * SQLite adatbázis főprocesz-oldali modulja.
 * - Megnyitja a DB-t a userData mappában
 * - Első indításkor létrehozza a táblákat
 * - Beolvassa a seed adatokat (irodalom, ünnepek, képességek)
 */

import { app } from 'electron';
import { existsSync, mkdirSync, readFileSync, copyFileSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

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

export function initDb(): void {
  const dbPath = getDbPath();
  console.log('[db] Adatbázis útvonal:', dbPath);

  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  db = drizzle(sqlite, { schema });

  createTables();
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
      const ujSzoveg = tetel.szoveg ?? null;
      const ujForras = tetel.forras ?? null;
      const ujTipus = tetel.tipus;

      if (!meglevo) {
        insert.run(ujTipus, tetel.cim, tetel.szerzo, ujForras, ujKorcsoport, ujTemakJson, ujSzoveg);
        ujCount++;
      } else {
        // Változás-detektálás: csak akkor UPDATE, ha legalább egy mező eltér.
        // (A USER által szerkesztett sajat=1 tételek érintetlenek — meglevoRows csak sajat=0-t tartalmaz.)
        const eltero =
          meglevo.tipus !== ujTipus ||
          (meglevo.forras ?? null) !== ujForras ||
          (meglevo.korcsoport ?? 'vegyes') !== ujKorcsoport ||
          (meglevo.temak ?? '[]') !== ujTemakJson ||
          (meglevo.szoveg ?? null) !== ujSzoveg;
        if (eltero) {
          updateTeljes.run(ujTipus, ujForras, ujKorcsoport, ujTemakJson, ujSzoveg, meglevo.id);
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
  const count = sqlite.prepare('SELECT COUNT(*) as n FROM unnepek').get() as { n: number };
  if (count.n > 0) return;

  const data = parseSeedJson<HolidaySeed>(join(seedDir, 'hungarian-holidays.json'), 'Ünnepek');
  const insert = sqlite.prepare(
    `INSERT INTO unnepek (nev, honap, nap, tipus, kategoria, leiras, ovodai_sulyozas)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  const tx = sqlite.transaction(() => {
    for (const u of data.unnepek) {
      insert.run(u.nev, u.honap, u.nap, u.tipus, u.kategoria ?? null, u.leiras ?? null, u.ovodaiSulyozas ?? 5);
    }
  });
  tx();
  console.log(`[db] Ünnepek seed: ${data.unnepek.length} tétel betöltve.`);
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
export function createBackup(): string | null {
  const MIN_BACKUP_SIZE = 10 * 1024; // 10 KB — kisebb az üres/csonka DB-nél
  try {
    const backupsDir = join(app.getPath('userData'), 'OvodaNaplo', 'backups');
    if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });

    const ts = new Date().toISOString().split('T')[0];
    const target = join(backupsDir, `ovodanaplo-${ts}.db`);

    // Ha aznap már van backup, ellenőrizzük a méretet. Ha túl kicsi, újraírjuk.
    if (existsSync(target)) {
      try {
        const stat = statSync(target);
        if (stat.size >= MIN_BACKUP_SIZE) return target;
        console.warn(`[db] Aznapi backup túl kicsi (${stat.size} byte), újraírjuk.`);
      } catch {
        // statSync hiba — folytatjuk és újraírjuk
      }
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
