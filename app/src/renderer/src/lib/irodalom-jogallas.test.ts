/**
 * A szerzői jogi állás eldöntése — lásd `irodalom-jogallas.ts`.
 *
 * A legfontosabb eset a regresszió: a korpuszból generált tételeknek NINCS
 * `forras` mezőjük, és korábban emiatt kaptak „jogvédett" minősítést.
 */

import { describe, expect, it } from 'vitest';
import { jogallas } from './irodalom-jogallas.js';

describe('irodalmi tétel jogi állása', () => {
  it('ha van szerző, jogvédettnek tekintjük', () => {
    expect(jogallas({ tipus: 'mese', szerzo: 'Lázár Ervin' })).toBe('jogvedett');
    expect(jogallas({ tipus: 'nepmese', szerzo: 'Benedek Elek' })).toBe('jogvedett');
  });

  it('szerző nélküli népi műfaj közkincs — üres forrás mellett is', () => {
    for (const tipus of ['nepmese', 'nepmonda', 'mondoka', 'dal', 'koreplay', 'altato', 'talalos_kerdes']) {
      expect(jogallas({ tipus, szerzo: null, forras: null })).toBe('kozkincs');
    }
  });

  it('a szerző nélküli mese is néphagyomány („A Luca-szék meséje")', () => {
    expect(jogallas({ tipus: 'mese', szerzo: null, forras: null })).toBe('kozkincs');
  });

  it('a forrásban szereplő „nép" akkor is dönt, ha a műfaj nem népi', () => {
    expect(jogallas({ tipus: 'vers', szerzo: null, forras: 'nephagyomany' })).toBe('kozkincs');
    expect(jogallas({ tipus: 'vers', szerzo: null, forras: 'Magyar népmese' })).toBe('kozkincs');
  });

  it('szerző nélküli vers forrás nélkül: csak ismeretlen szerző, nem jogvédett', () => {
    expect(jogallas({ tipus: 'vers', szerzo: null, forras: null })).toBe('ismeretlen-szerzo');
    expect(jogallas({ tipus: 'zenehallgatas', szerzo: '  ', forras: '' })).toBe('ismeretlen-szerzo');
  });

  it('a csupa szóköz nem számít szerzőnek', () => {
    expect(jogallas({ tipus: 'nepmese', szerzo: '   ' })).toBe('kozkincs');
  });
});
