/**
 * Az „Ez a hét" számítás ellenőrzése.
 *
 * MIÉRT: ez a logika az asztali program `generator.ts`-éből van átültetve, és a
 * két felületnek ugyanazt a hetet kell mutatnia. Ha itt elcsúszik valami, a
 * telefonon más téma jelenne meg, mint a heti tervben — ezt csak teszt fogja meg.
 */

import { describe, expect, it } from 'vitest';
import { aktualisHet, evHetei, hetIdoszak, nevelesiEvKezdete, unnepekAHeten } from './hetek';

const het = (ev: number, honap: number, nap: number) => {
  const hetfo = new Date(ev, honap - 1, nap);
  const pentek = new Date(hetfo);
  pentek.setDate(pentek.getDate() + 4);
  return unnepekAHeten(hetfo, pentek).map((u) => u.nev);
};

describe('nevelési év', () => {
  it('szeptembertől számít új évet', () => {
    expect(nevelesiEvKezdete(new Date(2026, 8, 8))).toBe(2026);
    expect(nevelesiEvKezdete(new Date(2027, 4, 8))).toBe(2026);
    expect(nevelesiEvKezdete(new Date(2026, 7, 31))).toBe(2025);
  });

  it('csak hétfőket ad, és kihagyja a téli szünetet', () => {
    const hetek = evHetei(2026);
    expect(hetek.every((h) => h.getDay() === 1)).toBe(true);
    expect(hetek[0]).toEqual(new Date(2026, 8, 7)); // 2026. szept. 1. kedd
    const teli = hetek.filter((h) => h.getMonth() === 11 && h.getDate() >= 22);
    expect(teli).toHaveLength(0);
    expect(hetek.length).toBeGreaterThan(35);
  });
});

describe('ünnepek a héten', () => {
  it('a pont hétfőre eső ünnepet is megtalálja', () => {
    // 2027. március 15. hétfő
    expect(het(2027, 3, 15)).toContain('1848. március 15.');
  });

  it('a vasárnapi ünnepet a hétfői napra tolja', () => {
    // 2026. december 6. vasárnap → hétfő, dec. 7.
    expect(het(2026, 12, 7)).toContain('Mikulás');
  });

  it('a szombati ünnepet az előző péntekre tolja', () => {
    // 2026. október 31. szombat → az előtte lévő péntek
    expect(het(2026, 10, 26)).toContain('Mindenszentek / Halloween');
  });

  it('a mozgó ünnepeket évre számítja, nem a seed dátumát veszi', () => {
    // 2027-ben húsvétvasárnap március 28. — a seedben álló (2026-os) április 5.
    // ilyenkor NEM ünnep.
    expect(het(2027, 3, 22)).toContain('Húsvét');
    expect(het(2027, 4, 5)).not.toContain('Húsvét');
  });

  it('a húsvét az ünnep ELŐTTI hétre kerül, nem utána', () => {
    // Az óvodában a nagyhéten van a készülődés; nagypéntek és húsvéthétfő is
    // munkaszüneti nap, tehát nagycsütörtök az utolsó óvodai nap.
    expect(het(2027, 3, 22)).toContain('Húsvét'); // márc. 28. vasárnap → nagyhét
    expect(het(2027, 3, 29)).not.toContain('Húsvét');
    expect(het(2026, 3, 30)).toContain('Húsvét'); // 2026: ápr. 5. vasárnap
    expect(het(2026, 4, 6)).not.toContain('Húsvét');
  });

  it('a pünkösd is az ünnep előtti hétre kerül', () => {
    // 2027: pünkösdvasárnap május 16. → a megelőző péntek, máj. 14.
    expect(het(2027, 5, 10)).toContain('Pünkösd');
    expect(het(2027, 5, 17)).not.toContain('Pünkösd');
  });

  it('több ünnepnél az óvodai súly dönt az első helyről', () => {
    const nevek = het(2026, 12, 7); // Mikulás (5★) és Advent környéke
    expect(nevek[0]).toBe('Mikulás');
  });
});

describe('aktuális hét', () => {
  it('a mai napot tartalmazó hetet adja, hétfőtől péntekig', () => {
    const h = aktualisHet(new Date(2026, 8, 9)); // szerda
    expect(h.hetfo).toEqual(new Date(2026, 8, 7));
    expect(h.pentek).toEqual(new Date(2026, 8, 11));
    expect(h.szunet).toBe(false);
    expect(h.sorszam).toBe(1);
  });

  it('hétvégén is a hozzá tartozó munkahetet mutatja', () => {
    // A vasárnap már a KÖVETKEZŐ hetet jelenti — akkor készül a jövő heti terv.
    const h = aktualisHet(new Date(2026, 8, 13));
    expect(h.hetfo).toEqual(new Date(2026, 8, 14));
    expect(h.szunet).toBe(true);
  });

  it('nyáron a következő nevelési év első hetét adja', () => {
    const h = aktualisHet(new Date(2027, 6, 20)); // július
    expect(h.szunet).toBe(true);
    expect(h.hetfo.getMonth()).toBe(8); // szeptember
    expect(h.hetfo.getFullYear()).toBe(2027);
  });

  it('minden óvodai héthez tartozik téma', () => {
    const uresek: string[] = [];
    for (const hetfo of evHetei(2026)) {
      const h = aktualisHet(new Date(hetfo));
      if (!h.tema) uresek.push(hetfo.toDateString());
    }
    expect(uresek).toEqual([]);
  });

  it('az ünnepi héten az ünnep témája nyer', () => {
    expect(aktualisHet(new Date(2026, 11, 7)).tema?.unnep).toBe('Mikulás');
    expect(aktualisHet(new Date(2026, 9, 5)).tema?.unnep).toBe('Állatok Világnapja');
  });

  it('a témák nem ismétlődnek a nevelési évben', () => {
    const latott = new Map<string, number>();
    for (const hetfo of evHetei(2026)) {
      const id = aktualisHet(new Date(hetfo)).tema?.id;
      if (id) latott.set(id, (latott.get(id) ?? 0) + 1);
    }
    // Ünnepi témából lehet kettő (pl. két húsvéti hét), de a legtöbb egyszeri.
    const ismetlodo = [...latott.values()].filter((n) => n > 1).length;
    expect(ismetlodo).toBeLessThanOrEqual(2);
  });
});

describe('időszak felirat', () => {
  it('azonos hónapon belül nem ismétli a hónapnevet', () => {
    expect(hetIdoszak(new Date(2026, 8, 7), new Date(2026, 8, 11))).toBe('szept. 7. – 11.');
  });

  it('hónapfordulón mindkét hónapot kiírja', () => {
    expect(hetIdoszak(new Date(2026, 8, 28), new Date(2026, 9, 2))).toBe('szept. 28. – okt. 2.');
  });
});
