/**
 * Unit tesztek a Zod IPC-schemákra (TODO-8 + TODO-14 Stage A).
 *
 * Verifikáljuk a 10 kritikus séma viselkedését: érvényes adat → siker,
 * érvénytelen adat → ZodError.
 */
import { describe, expect, it } from 'vitest';
import {
  ujBeallitasSchema,
  ujNevelesiEvSchema,
  ujHetiTervSchema,
  ujFoglalkozasSchema,
  ujReflexioSchema,
  ujEsemenySchema,
  ujIrodalomSchema,
  irodalomKeresesSchema,
  idSchema,
  datumSchema,
} from './ipc';

describe('idSchema', () => {
  it('pozitív egész → siker', () => {
    expect(idSchema.parse(42)).toBe(42);
  });
  it('negatív → hiba', () => {
    expect(() => idSchema.parse(-1)).toThrow();
  });
  it('nulla → hiba', () => {
    expect(() => idSchema.parse(0)).toThrow();
  });
  it('tört → hiba', () => {
    expect(() => idSchema.parse(1.5)).toThrow();
  });
  it('string → hiba', () => {
    expect(() => idSchema.parse('42')).toThrow();
  });
});

describe('datumSchema', () => {
  it('érvényes YYYY-MM-DD → siker', () => {
    expect(datumSchema.parse('2026-09-15')).toBe('2026-09-15');
  });
  it('rossz formátum → hiba', () => {
    expect(() => datumSchema.parse('2026/09/15')).toThrow();
    expect(() => datumSchema.parse('15-09-2026')).toThrow();
    expect(() => datumSchema.parse('2026-9-15')).toThrow();
  });
});

describe('ujBeallitasSchema', () => {
  it('üres objektum is érvényes (minden mező opcionális)', () => {
    expect(ujBeallitasSchema.parse({})).toEqual({});
  });
  it('csoportTipus enum-érték elfogadva', () => {
    const r = ujBeallitasSchema.parse({ csoportTipus: 'vegyes' });
    expect(r.csoportTipus).toBe('vegyes');
  });
  it('érvénytelen csoportTipus → hiba', () => {
    expect(() => ujBeallitasSchema.parse({ csoportTipus: 'nagyon-nagy' })).toThrow();
  });
});

describe('ujNevelesiEvSchema', () => {
  it('minimális helyes inputtal sikeres', () => {
    expect(() =>
      ujNevelesiEvSchema.parse({
        nev: '2026/2027',
        kezdo: '2026-09-01',
        zaro: '2027-06-30',
        aktiv: 1,
      }),
    ).not.toThrow();
  });
  it('üres név → hiba', () => {
    expect(() =>
      ujNevelesiEvSchema.parse({
        nev: '',
        kezdo: '2026-09-01',
        zaro: '2027-06-30',
        aktiv: 1,
      }),
    ).toThrow();
  });
  it('aktiv csak 0 vagy 1', () => {
    expect(() =>
      ujNevelesiEvSchema.parse({
        nev: 'X',
        kezdo: '2026-09-01',
        zaro: '2027-06-30',
        aktiv: 2,
      }),
    ).toThrow();
  });
});

describe('ujHetiTervSchema', () => {
  it('csak kezdő+záró dátummal érvényes', () => {
    expect(() =>
      ujHetiTervSchema.parse({
        kezdoDatum: '2026-09-14',
        zaroDatum: '2026-09-18',
      }),
    ).not.toThrow();
  });
  it('id opcionális (új tervezet esetén)', () => {
    const r = ujHetiTervSchema.parse({
      kezdoDatum: '2026-09-14',
      zaroDatum: '2026-09-18',
    });
    expect(r.id).toBeUndefined();
  });
  it('rossz dátum-formátum → hiba', () => {
    expect(() =>
      ujHetiTervSchema.parse({
        kezdoDatum: '15.09.2026',
        zaroDatum: '2026-09-18',
      }),
    ).toThrow();
  });
});

describe('ujFoglalkozasSchema', () => {
  it('téma kötelező', () => {
    expect(() => ujFoglalkozasSchema.parse({ tema: '' })).toThrow();
  });
  it('csak témával minimálisan érvényes', () => {
    expect(() => ujFoglalkozasSchema.parse({ tema: 'Mikulás várás' })).not.toThrow();
  });
  it('tevékenységi forma érvényes enum-érték', () => {
    const r = ujFoglalkozasSchema.parse({
      tema: 'Mese',
      tevekenysegiForma: 'verseles_meseles',
    });
    expect(r.tevekenysegiForma).toBe('verseles_meseles');
  });
  it('érvénytelen tevékenységi forma → hiba', () => {
    expect(() =>
      ujFoglalkozasSchema.parse({
        tema: 'Test',
        tevekenysegiForma: 'unknown-type',
      }),
    ).toThrow();
  });
});

describe('ujReflexioSchema', () => {
  it('üres tartalom → hiba', () => {
    expect(() =>
      ujReflexioSchema.parse({ tipus: 'heti', tartalom: '' }),
    ).toThrow();
  });
  it('érvénytelen típus → hiba', () => {
    expect(() =>
      ujReflexioSchema.parse({ tipus: 'unknown', tartalom: 'X' }),
    ).toThrow();
  });
  it('heti reflexió tartalommal érvényes', () => {
    expect(() =>
      ujReflexioSchema.parse({ tipus: 'heti', tartalom: 'Jól sikerült a hét.' }),
    ).not.toThrow();
  });
});

describe('ujEsemenySchema', () => {
  it('cím + dátum kötelező', () => {
    expect(() => ujEsemenySchema.parse({ datum: '2026-12-06' })).toThrow();
    expect(() => ujEsemenySchema.parse({ cim: 'Mikulás' })).toThrow();
  });
  it('rossz dátum → hiba', () => {
    expect(() =>
      ujEsemenySchema.parse({ cim: 'Test', datum: '2026/12/06' }),
    ).toThrow();
  });
});

describe('ujIrodalomSchema', () => {
  it('vers típussal érvényes', () => {
    const r = ujIrodalomSchema.parse({ tipus: 'vers', cim: 'Anyám tyúkja' });
    expect(r.tipus).toBe('vers');
    expect(r.cim).toBe('Anyám tyúkja');
  });
  it('érvénytelen típus → hiba', () => {
    expect(() => ujIrodalomSchema.parse({ tipus: 'novella', cim: 'X' })).toThrow();
  });
  it('üres cím → hiba', () => {
    expect(() => ujIrodalomSchema.parse({ tipus: 'vers', cim: '' })).toThrow();
  });
});

describe('irodalomKeresesSchema', () => {
  it('üres objektum érvényes (minden opcionális)', () => {
    expect(() => irodalomKeresesSchema.parse({})).not.toThrow();
  });
  it('részleges paraméterek elfogadva', () => {
    const r = irodalomKeresesSchema.parse({ szoveg: 'tyúk' });
    expect(r.szoveg).toBe('tyúk');
  });
  it('túl hosszú szoveg → hiba (max 200)', () => {
    const longString = 'x'.repeat(250);
    expect(() => irodalomKeresesSchema.parse({ szoveg: longString })).toThrow();
  });
});
