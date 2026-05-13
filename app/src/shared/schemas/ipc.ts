/**
 * IPC input-validációs Zod-schemák.
 *
 * A `main/ipc.ts` handler-jei ezeket használják a `validate()` helper-en keresztül,
 * hogy a renderer-ből érkező adatokat runtime-szinten ellenőrizzék.
 *
 * Stratégia:
 * - **Szigorú validáció a TÉNYLEG-input-fogadó** handlereknél (Ment, Letrehoz, Hozzaad)
 * - A read-only / lookup handlerek (Lista, Betolt) nem szorulnak validációra
 * - `.passthrough()` engedi az extra meta-mezőket (letrehozva, modositva), mert a Drizzle ORM
 *   adja vissza őket
 *
 * Hiba esetén `IpcValidationError`-t dob a `validate()`. Lásd `main/ipc-validate.ts`.
 */

import { z } from 'zod';

// ============================================================
// Általános primitív schemák
// ============================================================

/** SQLite primary key — pozitív egész szám. */
export const idSchema = z.number().int().positive();

/** ISO dátum (YYYY-MM-DD) — a heti terv és nevelési év mezőihez. */
export const datumSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Érvénytelen dátum-formátum (YYYY-MM-DD elvárt)',
});

/** Korcsoport-enum a nevelési évhez és beállításokhoz. */
export const korcsoportSchema = z.enum(['vegyes', 'kicsi', 'kozepso', 'nagy']);

/** Területi típusok (ONAP). */
export const teruletTipusSchema = z.enum([
  'kulso_vilag',
  'matematika',
  'verseles_meseles',
  'rajzolas_festes',
  'enek_zene',
  'hallas_ritmus',
  'mozgas',
]);

/** Irodalmi típusok. */
export const irodalomTipusSchema = z.enum([
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
]);

// ============================================================
// Domain schemák
// ============================================================

/** Beállítások mentés. */
export const ujBeallitasSchema = z
  .object({
    pedagogusNeve: z.string().max(200).nullable().optional(),
    ovodaNeve: z.string().max(200).nullable().optional(),
    ovodaCime: z.string().max(500).nullable().optional(),
    csoportNeve: z.string().max(200).nullable().optional(),
    csoportTipus: korcsoportSchema.nullable().optional(),
    themeAccent: z.string().max(50).nullable().optional(),
  })
  .passthrough();

/** Nevelési év létrehozás. */
export const ujNevelesiEvSchema = z
  .object({
    nev: z.string().min(1).max(50),
    kezdo: datumSchema,
    zaro: datumSchema,
    aktiv: z.number().int().min(0).max(1),
    korcsoport: korcsoportSchema.optional(),
  })
  .passthrough();

/** Heti terv mentés (egyszerű, területek nélkül). */
export const ujHetiTervSchema = z
  .object({
    id: idSchema.optional(),
    nevelesiEvId: idSchema.nullable().optional(),
    projektId: idSchema.nullable().optional(),
    hetSzama: z.number().int().nullable().optional(),
    kezdoDatum: datumSchema,
    zaroDatum: datumSchema,
    tema: z.string().nullable().optional(),
    cel: z.string().nullable().optional(),
    feladat: z.string().nullable().optional(),
    differencialas: z.string().nullable().optional(),
    modszerek: z.string().nullable().optional(),
    kepessegfejlesztes: z.string().nullable().optional(),
    eszkozok: z.string().nullable().optional(),
  })
  .passthrough();

/** Heti terv teljes (területekkel). */
export const hetiTervTeljesSchema = ujHetiTervSchema.extend({
  teruletek: z.array(
    z
      .object({
        id: idSchema.optional(),
        hetiTervId: idSchema.optional(),
        tipus: teruletTipusSchema,
        tartalom: z.string().nullable().optional(),
        iskolaElokeszito: z.string().nullable().optional(),
        sorrend: z.number().int().optional(),
      })
      .passthrough(),
  ),
});

/** Foglalkozás-tervezet mentés. */
export const ujFoglalkozasSchema = z
  .object({
    id: idSchema.optional(),
    hetiTervId: idSchema.nullable().optional(),
    pedagogusNeve: z.string().nullable().optional(),
    helyszin: z.string().nullable().optional(),
    idopont: z.string().nullable().optional(),
    csoport: z.string().nullable().optional(),
    csoportTipus: z.string().nullable().optional(),
    tevekenysegiForma: teruletTipusSchema.nullable().optional(),
    tema: z.string().min(1, { message: 'A téma kötelező' }),
    cel: z.string().nullable().optional(),
    feladat: z.string().nullable().optional(),
    korcsoport: z.string().nullable().optional(),
    idotartam: z.string().nullable().optional(),
    eszkozok: z.string().nullable().optional(),
    motivacio: z.string().nullable().optional(),
    foRezz: z.string().nullable().optional(),
    befejezes: z.string().nullable().optional(),
    munkaforma: z.string().nullable().optional(),
    modszerek: z.string().nullable().optional(),
    differencialas: z.string().nullable().optional(),
    kepessegfejlesztes: z.string().nullable().optional(),
    iskolaElokeszito: z.string().nullable().optional(),
  })
  .passthrough();

/** Projekt mentés (19 mező, mind nullable kivéve cim). */
export const ujProjektSchema = z
  .object({
    id: idSchema.optional(),
    nevelesiEvId: idSchema.nullable().optional(),
    cim: z.string().min(1, { message: 'A cím kötelező' }),
  })
  .passthrough(); // A többi 18 mező mind nullable string — passthrough engedi őket

/** Reflexió mentés. */
export const ujReflexioSchema = z
  .object({
    id: idSchema.optional(),
    tipus: z.enum(['foglalkozas', 'heti', 'projekt']),
    foglalkozasId: idSchema.nullable().optional(),
    hetiTervId: idSchema.nullable().optional(),
    projektId: idSchema.nullable().optional(),
    teruletTipus: teruletTipusSchema.nullable().optional(),
    tartalom: z.string().min(1, { message: 'A reflexió tartalma nem lehet üres' }),
    forrasok: z.string().nullable().optional(),
  })
  .passthrough();

/** Esemény mentés. */
export const ujEsemenySchema = z
  .object({
    id: idSchema.optional(),
    nevelesiEvId: idSchema.nullable().optional(),
    cim: z.string().min(1, { message: 'Az esemény címe kötelező' }),
    datum: datumSchema,
    tipus: z.string().nullable().optional(),
    leiras: z.string().nullable().optional(),
    reszvevok: z.string().nullable().optional(),
    reflexio: z.string().nullable().optional(),
  })
  .passthrough();

/** Új irodalmi tétel hozzáadása. */
export const ujIrodalomSchema = z
  .object({
    tipus: irodalomTipusSchema,
    cim: z.string().min(1, { message: 'A cím kötelező' }).max(300),
    szerzo: z.string().nullable().optional(),
    forras: z.string().nullable().optional(),
    szoveg: z.string().nullable().optional(),
    korcsoport: z.string().nullable().optional(),
    temak: z.string().nullable().optional(),
    sajat: z.number().int().min(0).max(1).optional(),
  })
  .passthrough();

/** Irodalom keresési paraméterek. */
export const irodalomKeresesSchema = z
  .object({
    tipus: z.string().optional(),
    szoveg: z.string().max(200).optional(),
    korcsoport: z.string().optional(),
  })
  .passthrough();

// ============================================================
// Inferált típusok (a renderer is használhatja)
// ============================================================

export type UjBeallitasInput = z.infer<typeof ujBeallitasSchema>;
export type UjNevelesiEvInput = z.infer<typeof ujNevelesiEvSchema>;
export type UjHetiTervInput = z.infer<typeof ujHetiTervSchema>;
export type HetiTervTeljesInput = z.infer<typeof hetiTervTeljesSchema>;
export type UjFoglalkozasInput = z.infer<typeof ujFoglalkozasSchema>;
export type UjProjektInput = z.infer<typeof ujProjektSchema>;
export type UjReflexioInput = z.infer<typeof ujReflexioSchema>;
export type UjEsemenyInput = z.infer<typeof ujEsemenySchema>;
export type UjIrodalomInput = z.infer<typeof ujIrodalomSchema>;
export type IrodalomKeresesInput = z.infer<typeof irodalomKeresesSchema>;
