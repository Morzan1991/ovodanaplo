/**
 * Regressziós tesztek: az „Iskola-előkészítő tevékenység" korosztály-szabálya.
 *
 * Az iskola-előkészítő az 5-7 éves korosztály (nagy- és vegyes csoport) anyaga.
 * Kis- és középső csoportnál a sablonból SEM szabad bekerülnie a heti tervbe —
 * korábban bekerült, majd „beragadt" adatként felbukkant a dokumentum-nézetben
 * és a Word-exportban is, hiába tűnt el a szerkesztő felületről.
 */

import { describe, it, expect } from 'vitest';
import { tervezetEgyHetbol, type SablonAdat } from './generator.js';

const SABLON: SablonAdat = {
  azonosito: 'oszi_gyumolcsok_v1',
  cim: 'Ősz kezdete, gyümölcsök',
  kategoria: 'evszak',
  tema: 'Ősz',
  cel: 'Az őszi gyümölcsök megismerése',
  feladat: 'Gyűjtés, válogatás',
  teruletek: {
    kulso_vilag: 'Ismertebb őszi gyümölcsök megismerése',
    verseles_meseles: 'Móra Ferenc: A cinege cipője',
  },
  iskolaElokeszito: 'Legacy: iránytartás, sorrendezés',
  iskolaElokeszitoTeruletek: {
    kulso_vilag: 'Számfogalom előkészítése',
    verseles_meseles: 'Szövegértés, mondatalkotás',
    rajzolas_festes: 'Finommotorika, ceruzafogás',
  },
  kepessegfejlesztes: 'Megfigyelés',
  eszkozok: 'Gyümölcskosár',
};

const HET_KEZDO = new Date('2026-09-07');

/** Egy terület iskola-előkészítő tartalma a generált tervben. */
function ie(korcsoport: string, tipus: string): string {
  const terv = tervezetEgyHetbol(HET_KEZDO, 1, SABLON, korcsoport);
  return terv.teruletek.find((t) => t.tipus === tipus)?.iskolaElokeszito ?? '';
}

describe('tervezetEgyHetbol — iskola-előkészítő korosztály szerint', () => {
  it('középső csoportnál egyetlen területre sem kerül iskola-előkészítő', () => {
    const terv = tervezetEgyHetbol(HET_KEZDO, 1, SABLON, 'kozepso');
    for (const terulet of terv.teruletek) {
      expect(terulet.iskolaElokeszito).toBe('');
    }
  });

  it('kiscsoportnál sem kerül be', () => {
    const terv = tervezetEgyHetbol(HET_KEZDO, 1, SABLON, 'kicsi');
    expect(terv.teruletek.every((t) => t.iskolaElokeszito === '')).toBe(true);
  });

  it('nagycsoportnál bekerül a sablon per-területi tartalma', () => {
    expect(ie('nagy', 'kulso_vilag')).toBe('Számfogalom előkészítése');
    expect(ie('nagy', 'verseles_meseles')).toBe('Szövegértés, mondatalkotás');
    expect(ie('nagy', 'rajzolas_festes')).toBe('Finommotorika, ceruzafogás');
  });

  it('vegyes csoportnál is bekerül (lehetnek benne 5-7 évesek)', () => {
    expect(ie('vegyes', 'kulso_vilag')).toBe('Számfogalom előkészítése');
  });

  it('a heti terv tartalma korosztálytól függetlenül változatlan', () => {
    const kozepso = tervezetEgyHetbol(HET_KEZDO, 1, SABLON, 'kozepso');
    const nagy = tervezetEgyHetbol(HET_KEZDO, 1, SABLON, 'nagy');
    const tartalom = (t: typeof kozepso) =>
      t.teruletek.map((x) => x.tartalom).join('|');
    expect(tartalom(kozepso)).toBe(tartalom(nagy));
    expect(kozepso.tema).toBe(nagy.tema);
  });

  it('legacy sablonnál (csak kulso_vilag) középsőben szintén üres marad', () => {
    const legacySablon: SablonAdat = { ...SABLON, iskolaElokeszitoTeruletek: undefined };
    const kozepso = tervezetEgyHetbol(HET_KEZDO, 1, legacySablon, 'kozepso');
    const nagy = tervezetEgyHetbol(HET_KEZDO, 1, legacySablon, 'nagy');
    expect(kozepso.teruletek.find((t) => t.tipus === 'kulso_vilag')?.iskolaElokeszito).toBe('');
    expect(nagy.teruletek.find((t) => t.tipus === 'kulso_vilag')?.iskolaElokeszito).toBe(
      'Legacy: iránytartás, sorrendezés',
    );
  });
});
