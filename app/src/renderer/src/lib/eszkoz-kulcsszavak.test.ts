/**
 * Unit tesztek az eszközlista auto-aggregáláshoz (TODO-13 + TODO-14 Stage A).
 */
import { describe, expect, it } from 'vitest';
import {
  ESZKOZ_KULCSSZAVAK,
  KATEGORIA_CIMKE,
  lookupEszkozok,
} from './eszkoz-kulcsszavak';

describe('ESZKOZ_KULCSSZAVAK adatbázis', () => {
  it('legalább 100 kulcsszó van', () => {
    expect(ESZKOZ_KULCSSZAVAK.length).toBeGreaterThanOrEqual(100);
  });

  it('minden kulcsszó kategorizálva van', () => {
    const ervenyesKategoriak = ['kezmuves', 'mozgas', 'enek', 'kreativ'];
    for (const e of ESZKOZ_KULCSSZAVAK) {
      expect(ervenyesKategoriak).toContain(e.kategoria);
    }
  });

  it('a 4 kategória mindegyikben legalább 10 kulcsszó van', () => {
    const szamlalo: Record<string, number> = {};
    for (const e of ESZKOZ_KULCSSZAVAK) {
      szamlalo[e.kategoria] = (szamlalo[e.kategoria] ?? 0) + 1;
    }
    for (const kat of ['kezmuves', 'mozgas', 'enek', 'kreativ']) {
      expect(szamlalo[kat], `${kat} túl kevés`).toBeGreaterThanOrEqual(10);
    }
  });

  it('KATEGORIA_CIMKE-ben minden kategória ott van', () => {
    expect(KATEGORIA_CIMKE.kezmuves).toBe('Kézműves');
    expect(KATEGORIA_CIMKE.mozgas).toBe('Mozgás');
    expect(KATEGORIA_CIMKE.enek).toBe('Ének-zene');
    expect(KATEGORIA_CIMKE.kreativ).toBe('Kreatív / vegyes');
  });
});

describe('lookupEszkozok', () => {
  it('üres szövegre üres tömb', () => {
    expect(lookupEszkozok('')).toEqual([]);
  });

  it('"olló és ragasztó" felismeri mindkettőt', () => {
    const t = lookupEszkozok('Olló és ragasztó kellenek a kézművességhez');
    expect(t).toContain('olló');
    expect(t).toContain('ragasztó');
  });

  it('case-insensitive', () => {
    const t = lookupEszkozok('LABDA és Karika');
    expect(t).toContain('labda');
    expect(t).toContain('karika');
  });

  it('csak az alapformát adja vissza még variáns-egyezésnél is', () => {
    // a "cellux" a "ragasztószalag" variánsa — az alapforma kell visszajönjön
    const t = lookupEszkozok('Cellux a polcon');
    expect(t).toContain('ragasztószalag');
    expect(t).not.toContain('cellux');
  });

  it('a "csörgő" és "dob" hangszer-találatként jön vissza', () => {
    const t = lookupEszkozok('A csörgő és a dob ritmust ad.');
    expect(t).toContain('csörgő');
    expect(t).toContain('dob');
  });

  it('a kategória-sorrendet tartja (kezmuves → mozgas → enek → kreativ)', () => {
    // Olló (kezmuves) + labda (mozgas) + dob (enek) + könyv (kreativ)
    const t = lookupEszkozok('Olló, labda, dob, könyv');
    expect(t.indexOf('olló')).toBeLessThan(t.indexOf('labda'));
    expect(t.indexOf('labda')).toBeLessThan(t.indexOf('dob'));
    expect(t.indexOf('dob')).toBeLessThan(t.indexOf('könyv'));
  });

  it('nincs talált kulcsszó ha a szöveg releváns nincs', () => {
    expect(lookupEszkozok('Ez egy random szöveg semmi értelemmel')).toEqual([]);
  });

  it('a "termés" felismeri a kreativ kategóriából', () => {
    const t = lookupEszkozok('Őszi termés gyűjtés a sétán.');
    expect(t).toContain('termés');
  });

  it('nem ad vissza duplikátumot', () => {
    const t = lookupEszkozok('Olló olló olló sok ollóval');
    expect(t.filter((x) => x === 'olló').length).toBe(1);
  });
});
