/**
 * A visszaállítási kulcs szöveges alakja — lásd `kulcsszoveg.ts`.
 *
 * A kulcsot papírról vagy egy szövegfájlból gépelik vissza. Ami itt számít: a
 * kiírt alak visszaalakítva ugyanaz a kulcs, a tipikus gépelési eltérések nem
 * akadályozzák, a valódi hibát pedig érthetően megnevezi.
 */

import { describe, expect, it } from 'vitest';
import {
  kulcsBevitelHiba,
  kulcsErvenyes,
  kulcsFormazott,
  kulcsNormalizal,
} from './kulcsszoveg.js';

const KULCS = '0123456789abcdef'.repeat(4);

describe('visszaállítási kulcs szövegként', () => {
  it('kiírva 8 jeles, kötőjeles csoportok, és visszaalakítva ugyanaz a kulcs', () => {
    const papir = kulcsFormazott(KULCS);
    expect(papir).toMatch(/^[0-9A-F]{8}(-[0-9A-F]{8}){7}$/);
    expect(kulcsNormalizal(papir)).toBe(KULCS);
    expect(kulcsErvenyes(papir)).toBe(true);
  });

  it('a helyes kulcsra nincs kifogás — kisbetűvel, szóközzel, sortöréssel, gondolatjellel sem', () => {
    expect(kulcsBevitelHiba(kulcsFormazott(KULCS))).toBeNull();
    const kezzel = `  ${kulcsFormazott(KULCS).toLowerCase().replace(/-/g, ' – ')}\r\n`;
    expect(kulcsBevitelHiba(kezzel)).toBeNull();
    expect(kulcsNormalizal(kezzel)).toBe(KULCS);
  });

  it('üres bevitelnél kéri a kulcsot', () => {
    expect(kulcsBevitelHiba('  - ')).toBe('Írd be a visszaállítási kulcsot.');
  });

  it('a nulla helyett gépelt O betűt megnevezi, nem csak „rövid" lesz belőle', () => {
    const elirt = kulcsFormazott(KULCS).replace('0', 'O');
    expect(kulcsErvenyes(elirt)).toBe(false);
    expect(kulcsBevitelHiba(elirt)).toContain('„O”');
    expect(kulcsBevitelHiba(elirt)).toContain('nullát (0)');
  });

  it('bemásolt felirat idegen jeleinél nem ad félrevezető tippet', () => {
    const hiba = kulcsBevitelHiba(`Kulcs: ${kulcsFormazott(KULCS)}`);
    expect(hiba).toContain('„K”');
    expect(hiba).not.toContain('egyest');
  });

  it('hiányzó csoportnál megmondja, hány jel van beírva', () => {
    const rovid = kulcsFormazott(KULCS).slice(0, -9); // az utolsó csoport a kötőjellel
    expect(kulcsBevitelHiba(rovid)).toContain('most 56 van beírva');
  });
});
