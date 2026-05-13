/**
 * SQLite séma Drizzle ORM-mel.
 * Megegyezik a _ovodanaplo/schema/schema.ts-szel (spec-tükör).
 *
 * A 'shared' mappa azért külön, hogy a main és renderer is importálhassa a típusokat.
 * A renderer csak típusokat használ — a tényleges DB-műveletek a main process-ben futnak.
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ============================================================
// Beállítások
// ============================================================

export const beallitasok = sqliteTable('beallitasok', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pedagogusNeve: text('pedagogus_neve'),
  ovodaNeve: text('ovoda_neve'),
  ovodaCime: text('ovoda_cime'),
  csoportNeve: text('csoport_neve'),
  // csoportTipus — szabályozza a sablonok differenciálását
  // és a heti tervek tartalmának életkori illesztését.
  // Értékek: "vegyes" (3-7 éves), "kicsi" (3-4 éves), "kozepso" (4-5 éves), "nagy" (5-7 éves)
  csoportTipus: text('csoport_tipus').default('vegyes'),
  utolsoBackup: integer('utolso_backup'),
  themeAccent: text('theme_accent').default('osz'),
});

// ============================================================
// Nevelési év
// ============================================================

export const nevelesiEvek = sqliteTable('nevelesi_evek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(),
  kezdo: text('kezdo').notNull(),
  zaro: text('zaro').notNull(),
  aktiv: integer('aktiv').default(0),
  // Csoport korcsoportja erre a nevelési évre vonatkozóan.
  // Lehet: 'vegyes' (3-7 éves), 'kicsi' (3-4 éves), 'kozepso' (4-5 éves), 'nagy' (5-7 éves)
  korcsoport: text('korcsoport').default('vegyes'),
  letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
});

// ============================================================
// Projekt
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
// Tevékenységi területek
// ============================================================

export const teruletTipus = [
  'kulso_vilag',
  'matematika',
  'verseles_meseles',
  'rajzolas_festes',
  'enek_zene',
  'hallas_ritmus',
  'mozgas',
] as const;

export type TeruletTipus = (typeof teruletTipus)[number];

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
// Foglalkozás-tervezet
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
    iskolaElokeszito: text('iskola_elokeszito'),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
    modositva: integer('modositva').default(sql`(unixepoch())`),
  },
  (t) => ({
    hetiTervIdx: index('foglalkozas_heti_terv_idx').on(t.hetiTervId),
  }),
);

// ============================================================
// Reflexió
// ============================================================

export const reflexioTipus = ['foglalkozas', 'heti', 'projekt'] as const;
export type ReflexioTipus = (typeof reflexioTipus)[number];

export const reflexiok = sqliteTable(
  'reflexiok',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tipus: text('tipus', { enum: reflexioTipus }).notNull(),
    foglalkozasId: integer('foglalkozas_id').references(() => foglalkozasTervezetek.id),
    hetiTervId: integer('heti_terv_id').references(() => hetiTervek.id),
    projektId: integer('projekt_id').references(() => projektek.id),
    teruletTipus: text('terulet_tipus', { enum: teruletTipus }),
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
// Események
// ============================================================

export const esemenyTipus = [
  'unnep',
  'kirandulas',
  'szuloi',
  'munkadelutan',
  'vendeg',
  'szuletesnap',
  'egyeb',
] as const;
export type EsemenyTipus = (typeof esemenyTipus)[number];

export const esemenyek = sqliteTable(
  'esemenyek',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nevelesiEvId: integer('nevelesi_ev_id').references(() => nevelesiEvek.id),
    hetiTervId: integer('heti_terv_id').references(() => hetiTervek.id),
    cim: text('cim').notNull(),
    datum: text('datum').notNull(),
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
// Irodalom
// ============================================================

export const irodalomTipus = [
  'vers',
  'mese',
  'mondoka',
  'nepmese',
  'dal',
  'zenehallgatas',
  'talalos_kerdes',
  'koreplay',
  'altato',
  'regeny',
  'verseskotet',
  'nepmonda',
] as const;
export type IrodalomTipus = (typeof irodalomTipus)[number];

export const irodalom = sqliteTable(
  'irodalom',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tipus: text('tipus', { enum: irodalomTipus }).notNull(),
    cim: text('cim').notNull(),
    szerzo: text('szerzo'),
    forras: text('forras'),
    szoveg: text('szoveg'),
    korcsoport: text('korcsoport'),
    temak: text('temak'),
    sajat: integer('sajat').default(0),
    letrehozva: integer('letrehozva').default(sql`(unixepoch())`),
  },
  (t) => ({
    tipusIdx: index('irodalom_tipus_idx').on(t.tipus),
    cimIdx: index('irodalom_cim_idx').on(t.cim),
  }),
);

// ============================================================
// Ünnepek
// ============================================================

export const unnepek = sqliteTable('unnepek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(),
  honap: integer('honap'),
  nap: integer('nap'),
  tipus: text('tipus', { enum: ['fix', 'mozgo', 'idoszak'] as const }).notNull(),
  kategoria: text('kategoria'),
  leiras: text('leiras'),
  ovodaiSulyozas: integer('ovodai_sulyozas').default(5),
  alapJavaslatok: text('alap_javaslatok'),
});

// ============================================================
// Képességek
// ============================================================

export const kepessegek = sqliteTable('kepessegek', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nev: text('nev').notNull(),
  kategoria: text('kategoria'),
  iskolaElokeszito: integer('iskola_elokeszito').default(0),
});

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
// Típus-export
// ============================================================

export type Beallitas = typeof beallitasok.$inferSelect;
export type UjBeallitas = typeof beallitasok.$inferInsert;
export type NevelesiEv = typeof nevelesiEvek.$inferSelect;
export type UjNevelesiEv = typeof nevelesiEvek.$inferInsert;
export type Projekt = typeof projektek.$inferSelect;
export type UjProjekt = typeof projektek.$inferInsert;
export type HetiTerv = typeof hetiTervek.$inferSelect;
export type UjHetiTerv = typeof hetiTervek.$inferInsert;
export type Terulet = typeof teruletek.$inferSelect;
export type UjTerulet = typeof teruletek.$inferInsert;
export type FoglalkozasTervezet = typeof foglalkozasTervezetek.$inferSelect;
export type UjFoglalkozasTervezet = typeof foglalkozasTervezetek.$inferInsert;
export type Reflexio = typeof reflexiok.$inferSelect;
export type UjReflexio = typeof reflexiok.$inferInsert;
export type Esemeny = typeof esemenyek.$inferSelect;
export type UjEsemeny = typeof esemenyek.$inferInsert;
export type Irodalom = typeof irodalom.$inferSelect;
export type UjIrodalom = typeof irodalom.$inferInsert;
export type Unnep = typeof unnepek.$inferSelect;
export type Kepesseg = typeof kepessegek.$inferSelect;
