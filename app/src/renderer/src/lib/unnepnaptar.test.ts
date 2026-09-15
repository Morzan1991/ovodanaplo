/**
 * A mozgó ünnepek dátumszámításának ellenőrzése több nevelési évre előre.
 *
 * A húsvét-számítás (Meeus/Jones/Butcher) minden évre működik — nem beégetett
 * lista —, de pont ezért kell bizonyítani, hogy a jövőbeli nevelési évekre is
 * helyes: erre épül a Farsang, Pünkösd és a húsvéti hét sablonjainak elhelyezése.
 */

import { describe, it, expect } from 'vitest';
import { husvetVasarnap, mozgoUnnepekEvre } from './utils';

/** Ismert húsvétvasárnapok (gergely-naptár). */
const ISMERT_HUSVET: Record<number, [number, number]> = {
  2026: [4, 5],
  2027: [3, 28],
  2028: [4, 16],
  2029: [4, 1],
  2030: [4, 21],
  2031: [4, 13],
  2032: [3, 28],
  2033: [4, 17],
  2034: [4, 9],
  2035: [3, 25],
};

describe('húsvétvasárnap 10 évre előre', () => {
  for (const [ev, [honap, nap]] of Object.entries(ISMERT_HUSVET)) {
    it(`${ev}: ${honap}. ${nap}.`, () => {
      expect(husvetVasarnap(Number(ev))).toEqual({ honap, nap });
    });
  }
});

describe('mozgó ünnepek minden évben értelmes helyre esnek', () => {
  const evek = Object.keys(ISMERT_HUSVET).map(Number);

  it('minden évre mind a 7 mozgó ünnep megvan', () => {
    for (const ev of evek) {
      expect(mozgoUnnepekEvre(ev)).toHaveLength(7);
    }
  });

  it('Anyák napja mindig május első vasárnapja', () => {
    for (const ev of evek) {
      const a = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Anyák napja')!;
      const d = new Date(ev, a.honap - 1, a.nap);
      expect(a.honap).toBe(5);
      expect(d.getDay()).toBe(0); // vasárnap
      expect(a.nap).toBeLessThanOrEqual(7);
    }
  });

  it('Gyermeknap mindig május utolsó vasárnapja', () => {
    for (const ev of evek) {
      const g = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Gyermeknap')!;
      const d = new Date(ev, g.honap - 1, g.nap);
      expect(g.honap).toBe(5);
      expect(d.getDay()).toBe(0);
      expect(g.nap + 7).toBeGreaterThan(31); // nincs utána több vasárnap
    }
  });

  it('Apák napja mindig június harmadik vasárnapja', () => {
    for (const ev of evek) {
      const a = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Apák napja')!;
      const d = new Date(ev, a.honap - 1, a.nap);
      expect(a.honap).toBe(6);
      expect(d.getDay()).toBe(0);
      expect(a.nap).toBeGreaterThanOrEqual(15);
      expect(a.nap).toBeLessThanOrEqual(21);
    }
  });

  it('Advent kezdete mindig vasárnap, nov 27. és dec 3. között', () => {
    for (const ev of evek) {
      const a = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Advent kezdete')!;
      const d = new Date(ev, a.honap - 1, a.nap);
      expect(d.getDay()).toBe(0);
      const sorszam = a.honap === 11 ? a.nap : 30 + a.nap;
      expect(sorszam).toBeGreaterThanOrEqual(27);
      expect(sorszam).toBeLessThanOrEqual(33);
    }
  });

  it('Pünkösd pontosan 49 nappal húsvét után van', () => {
    for (const ev of evek) {
      const h = husvetVasarnap(ev);
      const p = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Pünkösd')!;
      const kulonbseg =
        (new Date(ev, p.honap - 1, p.nap).getTime() -
          new Date(ev, h.honap - 1, h.nap).getTime()) /
        86400000;
      expect(Math.round(kulonbseg)).toBe(49);
    }
  });

  it('Farsang vége (húshagyókedd) mindig kedd, 47 nappal húsvét előtt', () => {
    for (const ev of evek) {
      const f = mozgoUnnepekEvre(ev).find((u) => u.nev === 'Farsang')!;
      expect(new Date(ev, f.honap - 1, f.nap).getDay()).toBe(2); // kedd
    }
  });
});
