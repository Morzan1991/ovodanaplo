/**
 * Mikor ajánlkozzon az irodalom-autocomplete — és mikor NE.
 *
 * MI VOLT A BAJ: a legördülő a kurzor MINDEN mozdulatára megnyílt, nem csak
 * gépeléskor. Ha a pedagógus belekattintott egy már beszúrt ötletbe, hogy
 * átfogalmazza vagy kihúzzon belőle pár szót, a mező alatt azonnal feljött a
 * találati lista — és onnantól:
 *   - az ENTER nem sort tört, hanem KICSERÉLTE a sorát a listaelemre,
 *   - a fel/le nyíl a listában lépkedett, nem a szövegben,
 *   - a lista eltakarta azt, amit épp javított.
 * Így a beszúrt ötletet gyakorlatilag nem lehetett szerkeszteni.
 *
 * AZ ÚJ SZABÁLY: a lista csak GÉPELÉSKOR jelenik meg, és csak akkor, ha tényleg
 * címre keresés zajlik. Kurzormozgásra, törlésre, kijelölésre soha.
 */

/** Ennél rövidebb töredékre nem keresünk. */
export const MIN_HOSSZ = 2;
/** Ennél hosszabb token már mondat, nem cím — arra sem keresünk. */
export const MAX_HOSSZ = 60;

export interface Token {
  start: number;
  end: number;
  text: string;
}

/**
 * A kurzor körüli „token": az utolsó sortörés / vessző / pontosvessző utáni
 * szöveg a kurzorig.
 */
export function aktualisToken(ertek: string, kurzor: number): Token {
  const elotte = ertek.slice(0, kurzor);
  let utolsoHatar = -1;
  for (let i = elotte.length - 1; i >= 0; i--) {
    const ch = elotte[i];
    if (ch === '\n' || ch === ',' || ch === ';') {
      utolsoHatar = i;
      break;
    }
  }
  let kezdet = utolsoHatar + 1;
  while (kezdet < elotte.length && /\s/.test(ertek[kezdet] ?? '')) kezdet++;
  return { start: kezdet, end: kurzor, text: ertek.slice(kezdet, kurzor).trim() };
}

export interface KeresesFeltetel {
  /** A mező tartalma a változás ELŐTT. */
  elozo: string;
  /** A mező tartalma a változás UTÁN. */
  uj: string;
  /** A kurzor pozíciója a változás után. */
  kurzor: number;
  /** A kijelölés vége — ha eltér a kurzortól, a felhasználó kijelöl, nem gépel. */
  valasztasVege?: number;
}

/**
 * Nyíljon-e a találati lista?
 *
 * Csak akkor, ha a felhasználó GÉPELT (a szöveg hosszabb lett), nincs kijelölés,
 * és a kurzornál álló töredék tényleg címkeresésnek látszik.
 */
export function keresestInditsunk({
  elozo,
  uj,
  kurzor,
  valasztasVege,
}: KeresesFeltetel): boolean {
  // Törlés, visszavonás, beillesztett nagy szövegblokk — ezekre nem ajánlkozunk.
  if (uj.length <= elozo.length) return false;
  // Kijelölés közben a felhasználó nem címet keres.
  if (valasztasVege !== undefined && valasztasVege !== kurzor) return false;

  const token = aktualisToken(uj, kurzor);
  if (token.text.length < MIN_HOSSZ || token.text.length > MAX_HOSSZ) return false;
  // A beszúrt javaslatok „Cím — Szerző" alakúak. Ha a töredékben már ott a
  // gondolatjel, a pedagógus egy kész sort szerkeszt, nem újat keres.
  if (token.text.includes(' — ')) return false;
  return true;
}

/**
 * Nyitva maradhat-e a lista a kurzor új helyén? Ha a kurzor kilépett abból a
 * töredékből, amire a keresés indult, a lista már félrevezető.
 */
export function nyitvaMaradhat(token: Token, kurzor: number): boolean {
  return kurzor >= token.start && kurzor <= token.end;
}
