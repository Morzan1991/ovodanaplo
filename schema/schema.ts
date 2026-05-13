/**
 * OvodaNapló — SQLite séma Drizzle ORM-mel.
 *
 * Az adatmodell a 15 minta-docx elemzéséből áll össze. Minden tábla a magyar
 * óvodapedagógusi munkafolyamat egy konkrét dokumentumtípusát képviseli.
 *
 * Sémahierarchia:
 *   nevelesiEvek (2026/2027)
 *     ├── projektek (1–3 hetes átfogó témák)
 *     │     └── hetiTervek (egy hét)
 *     │           ├── teruletek (6 ONAP-terület)
 *     │           └── foglalkozasTervezetek (egyedi tevékenység)
 *     │                 └── reflexiok (foglalkozás után)
 *     └── esemenyek (kirándulás, ünnep, szülői)
 *
 * Külön táblák a könyvtárakhoz:
 *   - irodalom    (versek, mesék, dalok — csak valós szerzőktől!)
 *   - unnepek     (magyar ünnepi naptár)
 *   - kepessegek  (képességfejlesztés tagek)
 *   - beallitasok (1 sor — pedagógus + óvoda + csoport)
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ============================================================
// Beállítások (1 sor — pedagógus + intézményi adatok)
// ============================================================

export const beallitasok = sqliteTable('beallitasok', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pedagogusNeve: text('pedagogus_neve'),
  ovodaNeve: text('ovoda_neve'),
  ovodaCime: text('ovoda_cime'),
  csoportNeve: text('csoport_neve'),
  csoportTipus: text('csoport_tipus'), // 'vegyes' | 'kicsi' | 'kozepso' | 'nagy'
  utolsoBackup: integer('utolso_backup'),
  themeAccent: text('theme_accent').default('osz'), // osz | tel | tavasz | nyar
});

// ============================================================
// Nevelési év
// ============================================================

export const nevelesiEvek = sqliteTable('nevelesi_evek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(), // pl. "2026/2027"
  kezdo: text('kezdo').notNull(), // ISO date: 2026-09-01
  zaro: text('zaro').notNull(), // ISO date: 2027-06-30
  aktiv: integer('aktiv').default(0),
  letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
});

// ============================================================
// Projekt (1–3 hetes átfogó téma, pl. "Olvasni jó", "Húsvét")
// ============================================================

export const projektek = sqliteTable(
  'projektek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nevelesiEvId: integer('nevelesi_ev_id').references(() => nevelesiEvek.id),
    cim: text('cim').notNull(),
    kezdoDatum: text('kezdo_datum'),
    zaroDatum: text('zaro_datum'),
    cel: text('cel'),
    tema: text('tema'),
    feladatErtelmi: text('feladat_ertelmi'),
    feladatKommunikacios: text('feladat_kommunikacios'),
    feladatErkolcsi: text('feladat_erkolcsi'),
    feladatTesti: text('feladat_testi'),
    bevontak: text('bevontak'),
    elokeszuletek: text('elokeszuletek'),
    alkotoTevekenysegek: text('alkoto_tevekenysegek'),
    jatekok: text('jatekok'),
    szabalyok: text('szabalyok'),
    produktumokGyermeki: text('produktumok_gyermeki'),
    produktumokPedagogusi: text('produktumok_pedagogusi'),
    munkaJellegu: text('munka_jellegu'),
    ovodapedagogusFeladatai: text('ovodapedagogus_feladatai'),
    eszkozok: text('eszkozok'),
    iskolaElokeszitoOsszesitett: text('iskola_elokeszito_osszesitett'),
    szokasokHagyomanyok: text('szokasok_hagyomanyok'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
    modositva: integer('modositva').default(sql`(unixepoch())`),
  },
  (t) => ({
    nevelesiEvIdx: index('projekt_nevelesi_ev_idx').on(t.nevelesiEvId),
  }),
);

// ============================================================
// Heti terv
// ============================================================

export const hetiTervek = sqliteTable(
  'heti_tervek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nevelesiEvId: integer('nevelesi_ev_id').references(() => nevelesiEvek.id),
    projektId: integer('projekt_id').references(() => projektek.id),
    hetSzama: integer('het_szama'),
    kezdoDatum: text('kezdo_datum').notNull(),
    zaroDatum: text('zaro_datum').notNull(),
    tema: text('tema'),
    cel: text('cel'),
    feladat: text('feladat'),
    differencialas: text('differencialas').default(
      'tartalomban, módszerekben, segítségadás módjában és mennyiségében, az egyénre fordított idő mennyiségében',
    ),
    modszerek: text('modszerek').default(
      'bemutatás, magyarázat, szemléltetés, cselekedtetés, gyakorlás, ellenőrzés, értékelés',
    ),
    kepessegfejlesztes: text('kepessegfejlesztes'),
    eszkozok: text('eszkozok'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
    modositva: integer('modositva').default(sql`(unixepoch())`),
  },
  (t) => ({
    datumIdx: index('heti_terv_datum_idx').on(t.kezdoDatum),
    nevelesiEvIdx: index('heti_terv_nevelesi_ev_idx').on(t.nevelesiEvId),
  }),
);

// ============================================================
// Tevékenységi területek (6 ONAP-terület egy heti tervhez)
// ============================================================

export const teruletTipus = [
  'kulso_vilag', // Külső világ tevékeny megismerésére nevelés (matek alszekcióval)
  'matematika', // Matematikai tartalom (külső világ alszekciója)
  'verseles_meseles',
  'rajzolas_festes',
  'enek_zene',
  'hallas_ritmus', // Hallás- és ritmusérzék (ének-zene alszekciója)
  'mozgas',
] as const;

export const teruletek = sqliteTable(
  'teruletek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    hetiTervId: integer('heti_terv_id')
      .references(() => hetiTervek.id, { onDelete: 'cascade' })
      .notNull(),
    tipus: text('tipus', { enum: teruletTipus }).notNull(),
    tartalom: text('tartalom'),
    iskolaElokeszito: text('iskola_elokeszito'),
    sorrend: integer('sorrend').default(0),
  },
  (t) => ({
    hetiTervIdx: index('terulet_heti_terv_idx').on(t.hetiTervId),
  }),
);

// ============================================================
// Foglalkozás-tervezet (egyedi tevékenység, részletes)
// ============================================================

export const foglalkozasTervezetek = sqliteTable(
  'foglalkozas_tervezetek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    hetiTervId: integer('heti_terv_id').references(() => hetiTervek.id),
    pedagogusNeve: text('pedagogus_neve'),
    helyszin: text('helyszin'),
    idopont: text('idopont'),
    csoport: text('csoport'),
    csoportTipus: text('csoport_tipus'),
    tevekenysegiForma: text('tevekenysegi_forma', { enum: teruletTipus }),
    tema: text('tema').notNull(),
    cel: text('cel'),
    feladat: text('feladat'),
    korcsoport: text('korcsoport'),
    idotartam: text('idotartam'),
    eszkozok: text('eszkozok'),
    motivacio: text('motivacio'),
    foRezz: text('fo_resz'),
    befejezes: text('befejezes'),
    munkaforma: text('munkaforma'),
    modszerek: text('modszerek'),
    differencialas: text('differencialas'),
    kepessegfejlesztes: text('kepessegfejlesztes'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
    modositva: integer('modositva').default(sql`(unixepoch())`),
  },
  (t) => ({
    hetiTervIdx: index('foglalkozas_heti_terv_idx').on(t.hetiTervId),
  }),
);

// ============================================================
// Reflexió (foglalkozás-, heti- vagy projekt-szintű)
// ============================================================

export const reflexioTipus = ['foglalkozas', 'heti', 'projekt'] as const;

export const reflexiok = sqliteTable(
  'reflexiok',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tipus: text('tipus', { enum: reflexioTipus }).notNull(),
    foglalkozasId: integer('foglalkozas_id').references(() => foglalkozasTervezetek.id),
    hetiTervId: integer('heti_terv_id').references(() => hetiTervek.id),
    projektId: integer('projekt_id').references(() => projektek.id),
    teruletTipus: text('terulet_tipus', { enum: teruletTipus }), // heti reflexió: melyik területre
    tartalom: text('tartalom').notNull(),
    forrasok: text('forrasok'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
    modositva: integer('modositva').default(sql`(unixepoch())`),
  },
  (t) => ({
    hetiTervIdx: index('reflexio_heti_terv_idx').on(t.hetiTervId),
    foglalkozasIdx: index('reflexio_foglalkozas_idx').on(t.foglalkozasId),
    projektIdx: index('reflexio_projekt_idx').on(t.projektId),
  }),
);

// ============================================================
// Események (kirándulás, ünnep, szülői, munkadélután)
// ============================================================

export const esemenyTipus = [
  'unnep', // Magyar ünnep megemlékezése
  'kirandulas',
  'szuloi', // szülői értekezlet
  'munkadelutan', // pl. Föld napi munkadélután
  'vendeg', // óvodába jött vendég, állat stb.
  'szuletesnap',
  'egyeb',
] as const;

export const esemenyek = sqliteTable(
  'esemenyek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nevelesiEvId: integer('nevelesi_ev_id').references(() => nevelesiEvek.id),
    hetiTervId: integer('heti_terv_id').references(() => hetiTervek.id),
    cim: text('cim').notNull(),
    datum: text('datum').notNull(), // ISO date
    tipus: text('tipus', { enum: esemenyTipus }),
    leiras: text('leiras'),
    reszvevok: text('reszvevok'),
    reflexio: text('reflexio'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
  },
  (t) => ({
    datumIdx: index('esemeny_datum_idx').on(t.datum),
  }),
);

// ============================================================
// Irodalmi adatbázis (csak valós szerzőktől!)
// ============================================================

export const irodalomTipus = [
  'vers',
  'mese',
  'mondoka',
  'nepmese',
  'dal', // énekes
  'zenehallgatas', // hangzó zene
  'talalos_kerdes',
  'koreplay',
] as const;

export const irodalom = sqliteTable(
  'irodalom',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tipus: text('tipus', { enum: irodalomTipus }).notNull(),
    cim: text('cim').notNull(),
    szerzo: text('szerzo'), // null = nép- / hagyományőrző
    forras: text('forras'), // pl. "Móra Kiadó, 1985"
    szoveg: text('szoveg'), // teljes szöveg (opcionális)
    korcsoport: text('korcsoport'), // 'kicsi' | 'kozepso' | 'nagy' | 'vegyes'
    temak: text('temak'), // JSON array: ["husvet", "tavasz"]
    sajat: integer('sajat').default(0), // 1 = saját hozzáadás, 0 = előtöltött
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
  },
  (t) => ({
    tipusIdx: index('irodalom_tipus_idx').on(t.tipus),
    cimIdx: index('irodalom_cim_idx').on(t.cim),
  }),
);

// ============================================================
// Magyar ünnepi naptár
// ============================================================

export const unnepek = sqliteTable('unnepek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(),
  honap: integer('honap'), // 1-12 (null ha mozgó)
  nap: integer('nap'), // null ha időszak vagy mozgó
  tipus: text('tipus', { enum: ['fix', 'mozgo', 'idoszak'] as const }).notNull(),
  kategoria: text('kategoria'), // 'nemzeti' | 'egyhazi' | 'nephagyomany' | 'vilagunnep' | 'egyeb'
  leiras: text('leiras'),
  ovodaiSulyozas: integer('ovodai_sulyozas').default(5), // 1-5 (mennyire fontos óvodában)
  alapJavaslatok: text('alap_javaslatok'), // JSON: { irodalom: [], tevekenysegek: [], eszkozok: [] }
});

// ============================================================
// Képességfejlesztés tagek
// ============================================================

export const kepessegek = sqliteTable('kepessegek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(),
  kategoria: text('kategoria'),
  iskolaElokeszito: integer('iskola_elokeszito').default(0),
});

// Sok-sok kapcsolat: heti terv ↔ képesség
export const hetiTervKepesseg = sqliteTable(
  'heti_terv_kepesseg',
  {
    hetiTervId: integer('heti_terv_id')
      .references(() => hetiTervek.id, { onDelete: 'cascade' })
      .notNull(),
    kepessegId: integer('kepesseg_id')
      .references(() => kepessegek.id)
      .notNull(),
  },
  (t) => ({
    hetiTervIdx: index('htk_heti_terv_idx').on(t.hetiTervId),
    kepessegIdx: index('htk_kepesseg_idx').on(t.kepessegId),
  }),
);

// ============================================================
// Típusexport (Drizzle inference)
// ============================================================

export type Beallitas = typeof beallitasok.$inferSelect;
export type UjBeallitas = typeof beallitasok.$inferInsert;
export type NevelesiEv = typeof nevelesiEvek.$inferSelect;
export type Projekt = typeof projektek.$inferSelect;
export type HetiTerv = typeof hetiTervek.$inferSelect;
export type UjHetiTerv = typeof hetiTervek.$inferInsert;
export type Terulet = typeof teruletek.$inferSelect;
export type FoglalkozasTervezet = typeof foglalkozasTervezetek.$inferSelect;
export type Reflexio = typeof reflexiok.$inferSelect;
export type Esemeny = typeof esemenyek.$inferSelect;
export type Irodalom = typeof irodalom.$inferSelect;
export type Unnep = typeof unnepek.$inferSelect;
export type Kepesseg = typeof kepessegek.$inferSelect;
