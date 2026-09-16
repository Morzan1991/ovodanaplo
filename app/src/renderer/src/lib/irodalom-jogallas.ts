/**
 * Egy irodalmi tétel szerzői jogi állása — ettől függ, mit ír a program, ha a
 * mű szövege nincs eltárolva.
 *
 * MI VOLT A HIBA. A döntés korábban a `forras` mező szövegében keresett „nép"
 * szórészletet. A tételek túlnyomó része viszont a gondozott korpuszból
 * generálódik, annak pedig nincs `forras` mezője: 485 szerző nélküli műből
 * 308-nál üresen maradt. Így a program 316 népmesére, mondókára, népdalra és
 * találós kérdésre is azt írta, hogy „szerzői jogvédelem alatt áll" — ami nem
 * igaz, a népi gyűjtés közkincs.
 *
 * A SZERZŐ a döntő: ahol nincs szerző, ott nincs kit védeni. A műfaj csak azt
 * mondja meg, hogy a hiányzó szerző népi gyűjtést jelent-e (népmese, mondóka),
 * vagy csak annyit, hogy nem tudjuk, ki írta (szerző nélküli vers).
 */

export type Jogallas =
  /** Népi gyűjtés — szabadon beírható. */
  | 'kozkincs'
  /** Nincs megadva szerző, de a műfaj nem népi — a felhasználó dönt. */
  | 'ismeretlen-szerzo'
  /** Van szerző: a szöveget nem tesszük a programba. */
  | 'jogvedett';

/**
 * Műfajok, amelyeknél a hiányzó szerző népi gyűjtést jelent.
 *
 * A `mese` is itt van: a 17 szerző nélküli mese közül 16 néphagyomány
 * („A vasorrú bába", „A Luca-szék meséje", „Szent Márton legendája"), és a
 * felület is „néphagyomány" felirattal mutatja őket.
 */
const NEPI_MUFAJ = new Set([
  'nepmese',
  'nepmonda',
  'mondoka',
  'dal',
  'koreplay',
  'altato',
  'talalos_kerdes',
  'mese',
]);

export function jogallas(m: {
  tipus?: string | null;
  szerzo?: string | null;
  forras?: string | null;
}): Jogallas {
  if ((m.szerzo ?? '').trim()) return 'jogvedett';

  const forras = (m.forras ?? '').toLowerCase();
  if (NEPI_MUFAJ.has(m.tipus ?? '') || forras.includes('nep') || forras.includes('nép')) {
    return 'kozkincs';
  }
  return 'ismeretlen-szerzo';
}
