/**
 * A chip-választás és a Képességfejlesztés mező összefésülése.
 *
 * MIÉRT: a kipipált képességek korábban sehol nem jelentek meg a kész tervben —
 * ezt csak teszt tudja megfogni, mert a mentés maga hibátlanul lefutott.
 */

import { describe, it, expect } from 'vitest';
import {
  kepessegSzovegFrissites,
  szovegbenSzereploNevek,
  tetelek,
} from './kepesseg-szoveg';

describe('tételek', () => {
  it('vesszővel és sortöréssel is bont, a fölös szóközt levágja', () => {
    expect(tetelek(' finommotorika ,szókincs\nfigyelem ')).toEqual([
      'finommotorika',
      'szókincs',
      'figyelem',
    ]);
  });

  it('üres mezőből üres lista', () => {
    expect(tetelek('')).toEqual([]);
    expect(tetelek('  ,  , ')).toEqual([]);
  });
});

describe('szöveg frissítése', () => {
  it('az újat a végére fűzi', () => {
    expect(kepessegSzovegFrissites('finommotorika, szókincs', ['figyelem'], [])).toBe(
      'finommotorika, szókincs, figyelem',
    );
  });

  it('a levettet kiveszi', () => {
    expect(kepessegSzovegFrissites('finommotorika, szókincs, figyelem', [], ['szókincs'])).toBe(
      'finommotorika, figyelem',
    );
  });

  it('üres mezőbe is beír', () => {
    expect(kepessegSzovegFrissites('', ['ritmusérzék'], [])).toBe('ritmusérzék');
  });

  it('nem duplázza, amit a pedagógus már kézzel beírt', () => {
    expect(kepessegSzovegFrissites('Finommotorika, szókincs', ['finommotorika'], [])).toBe(
      'Finommotorika, szókincs',
    );
  });

  it('a kézzel írt szöveget nem bántja', () => {
    const szoveg = 'finommotorika, saját megfigyelés a séta során, szókincs';
    expect(kepessegSzovegFrissites(szoveg, ['figyelem'], ['szókincs'])).toBe(
      'finommotorika, saját megfigyelés a séta során, figyelem',
    );
  });

  it('a záró írásjel nem akadályozza a levételt', () => {
    expect(kepessegSzovegFrissites('finommotorika, szókincs.', [], ['szókincs'])).toBe(
      'finommotorika',
    );
  });

  it('egyszerre vesz le és ad hozzá', () => {
    expect(
      kepessegSzovegFrissites('a, b, c', ['d', 'e'], ['b']),
    ).toBe('a, c, d, e');
  });
});

describe('chipek visszaolvasása a szövegből', () => {
  it('a kézzel beírt képességet is felismeri', () => {
    const benne = szovegbenSzereploNevek('Finommotorika, figyelem', [
      'finommotorika',
      'figyelem',
      'szókincs',
    ]);
    expect([...benne].sort()).toEqual(['figyelem', 'finommotorika']);
  });

  it('üres mezőre üres halmaz', () => {
    expect(szovegbenSzereploNevek('', ['finommotorika']).size).toBe(0);
  });
});
