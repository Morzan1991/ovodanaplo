/**
 * Az irodalom-autocomplete megnyílási szabálya.
 *
 * MIÉRT: a legördülő korábban a kurzor minden mozdulatára feljött, és elvette az
 * Entert meg a nyilakat — a beszúrt ötletet nem lehetett átfogalmazni. Ezek a
 * tesztek azt őrzik, hogy a lista CSAK gépeléskor jelenjen meg.
 */

import { describe, it, expect } from 'vitest';
import { aktualisToken, keresestInditsunk, nyitvaMaradhat } from './autocomplete-szabaly';

describe('aktualisToken', () => {
  it('a sor elejétől a kurzorig tart', () => {
    const t = aktualisToken('Mesék:\nSzutyejev: Az alma', 25);
    expect(t.text).toBe('Szutyejev: Az alma');
  });

  it('a vessző is határ', () => {
    expect(aktualisToken('alma, körte', 11).text).toBe('körte');
  });

  it('a határ utáni szóközöket átlépi', () => {
    const t = aktualisToken('alma,   körte', 13);
    expect(t.text).toBe('körte');
    expect(t.start).toBe(8);
  });
});

describe('keresestInditsunk', () => {
  it('gépelésre igen', () => {
    expect(
      keresestInditsunk({ elozo: 'Gala', uj: 'Galag', kurzor: 5 }),
    ).toBe(true);
  });

  it('TÖRLÉSRE nem — pár szót kihúzni szabad legyen zavarás nélkül', () => {
    expect(
      keresestInditsunk({ elozo: 'Galagonya bokor', uj: 'Galagonya boko', kurzor: 14 }),
    ).toBe(false);
  });

  it('kijelölés közben nem', () => {
    expect(
      keresestInditsunk({ elozo: 'Gala', uj: 'Galag', kurzor: 2, valasztasVege: 5 }),
    ).toBe(false);
  });

  it('két karakternél rövidebb töredékre nem', () => {
    expect(keresestInditsunk({ elozo: 'G', uj: 'Ga', kurzor: 2 })).toBe(true);
    expect(keresestInditsunk({ elozo: '', uj: 'G', kurzor: 1 })).toBe(false);
  });

  it('hosszú, mondatszerű töredékre nem', () => {
    // vessző nélkül, mert a vessző új tokent kezd
    const mondat =
      'Beszélgetés a gyerekekkel arról hogyan érik be az alma a kertben ősszel és mit kezdünk vele';
    expect(
      keresestInditsunk({ elozo: mondat.slice(0, -1), uj: mondat, kurzor: mondat.length }),
    ).toBe(false);
  });

  it('a már beszúrt „Cím — Szerző" sor szerkesztésekor nem', () => {
    const sor = 'Galagonya — Weöres Sándor';
    expect(
      keresestInditsunk({ elozo: sor.slice(0, -1), uj: sor, kurzor: sor.length }),
    ).toBe(false);
  });
});

describe('nyitvaMaradhat', () => {
  it('a tokenen belül igen, kívül nem', () => {
    const token = { start: 5, end: 12, text: 'alma' };
    expect(nyitvaMaradhat(token, 8)).toBe(true);
    expect(nyitvaMaradhat(token, 12)).toBe(true);
    expect(nyitvaMaradhat(token, 40)).toBe(false);
    expect(nyitvaMaradhat(token, 2)).toBe(false);
  });
});
