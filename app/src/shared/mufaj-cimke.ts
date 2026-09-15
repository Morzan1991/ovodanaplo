/**
 * A műfaj-címke levétele egy javaslatsorról.
 *
 * A `shared` mappában van, mert MINDKÉT oldalnak kell:
 *   - a renderer a szerkesztőben és az ötlet-panelen tisztítja a sorokat,
 *   - a főprocesz a Word-exportnál, hogy a régebbi, még nem újramentett tervek
 *     se vigyék be a címkéket a dokumentumba.
 *
 * MIÉRT: az ötletbankban minden sor végén ott a műfaj — abból tudjuk, melyik
 * szekcióba való a javaslat. A kész tervben viszont fölösleges: a szekció fejléce
 * („Mondókák, versek:", „Mesék:") már megmondja, és a nyomtatott dokumentumban
 * csak zaj. A NÉPMESE kivétel: az tartalmi információ — azt jelenti, hogy nem
 * műmese —, ezért az látszik.
 */

const REJTETT_CIMKEK = [
  'mondóka',
  'vers',
  'mese',
  'találós kérdés',
  'anyanyelvi játék',
  'dal',
  'énekes körjáték',
  'altató',
  'zenehallgatás',
];

const CIMKE_MINTA = new RegExp(
  `\\s\\((?:${REJTETT_CIMKEK.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\)`,
  'g',
);

/** A sor megjelenítési alakja: műfaj-címke nélkül, a népmesét kivéve. */
export function cimkeNelkul(szoveg: string): string {
  return szoveg.replace(CIMKE_MINTA, '');
}
