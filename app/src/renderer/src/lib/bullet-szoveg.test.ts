/**
 * A bullet-lista szerkesztésének megőrzése.
 *
 * MIÉRT: a régi változat gépelés közben eldobta az üres sort, ezért új sort
 * kezdeni és egy sor szövegét kitörölve újraírni sem lehetett.
 */

import { describe, it, expect } from 'vitest';
import { bulletFormat, bulletParse } from './bullet-szoveg';

describe('bulletFormat', () => {
  it('minden sor elé „• " kerül', () => {
    expect(bulletFormat('Alma\nKörte')).toBe('• Alma\n• Körte');
  });

  it('a meglévő pontot nem duplázza', () => {
    expect(bulletFormat('• Alma')).toBe('• Alma');
  });

  it('az ÜRES SORT meghagyja — enélkül nem lehetne új sort kezdeni', () => {
    expect(bulletFormat('Alma\n\nKörte')).toBe('• Alma\n\n• Körte');
    expect(bulletFormat('Alma\n')).toBe('• Alma\n');
  });
});

describe('bulletParse', () => {
  it('leveszi a „• " előtagot', () => {
    expect(bulletParse('• Alma\n• Körte')).toBe('Alma\nKörte');
  });

  it('az üres sor megmarad', () => {
    expect(bulletParse('• Alma\n\n• Körte')).toBe('Alma\n\nKörte');
  });

  it('a sor belsejéhez nem nyúl', () => {
    expect(bulletParse('• Szutyejev: Az alma — osztozkodás')).toBe(
      'Szutyejev: Az alma — osztozkodás',
    );
  });

  it('a gépelés közbeni szóközt nem vágja le', () => {
    // Ha trimmelnénk, a szó utáni szóköz leütésekor elugrana a kurzor.
    expect(bulletParse('• Alma ')).toBe('Alma ');
  });
});

describe('oda-vissza alakítás', () => {
  it('stabil: a formázott alak újra parse-olva ugyanazt adja', () => {
    for (const eredeti of ['Alma\nKörte', 'Alma\n\nKörte', 'Alma\n', '', 'Egy sor']) {
      expect(bulletParse(bulletFormat(eredeti))).toBe(eredeti);
    }
  });

  it('új sor ütése után is megmarad a szerkezet', () => {
    // A felhasználó Entert üt a lista végén, majd gépel egy betűt.
    const gepelt = '• Alma\nK';
    expect(bulletParse(gepelt)).toBe('Alma\nK');
    expect(bulletFormat(bulletParse(gepelt))).toBe('• Alma\n• K');
  });
});
