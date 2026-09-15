/**
 * A „Fejlesztett képességek" chipek és a Képességfejlesztés szövegmező összefésülése.
 *
 * MI VOLT A BAJ: a chip-választó egy külön kapcsolótáblába mentett, a dokumentum
 * nézet és a Word-export viszont CSAK a `kepessegfejlesztes` szövegmezőt mutatja.
 * Így a kipipált képességek sehol nem jelentek meg a kész tervben — a pedagógus
 * hiába választott újakat vagy vett le régieket, a dokumentumban nem változott semmi.
 *
 * A megoldás: a chip a szövegmezőt írja. Egy forrás van, azt látja a dokumentum
 * nézet és azt viszi a Word-export is.
 *
 * A mező vesszővel elválasztott felsorolás („finommotorika, szókincs, figyelem").
 * A kézzel beírt szöveget NEM bántjuk: a levett képességet töröljük, az újat a
 * végére fűzzük, minden mást békén hagyunk.
 */

/** Összevetéshez: kisbetűs, ékezet-érzékeny, a záró írásjelek nélkül. */
function normal(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase('hu')
    .replace(/[.,;:!?]+$/, '')
    .replace(/\s+/g, ' ');
}

/** A felsorolás tételei — üres elemek és a fölös szóközök nélkül. */
export function tetelek(szoveg: string): string[] {
  return szoveg
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

/**
 * A szövegmező frissítése a chip-választás változása után.
 *
 * @param szoveg   a mező jelenlegi tartalma
 * @param hozzaad  az imént bepipált képességek neve
 * @param elvesz   az imént levett képességek neve
 */
export function kepessegSzovegFrissites(
  szoveg: string,
  hozzaad: string[],
  elvesz: string[],
): string {
  const torlendo = new Set(elvesz.map(normal));
  const megmarad = tetelek(szoveg).filter((x) => !torlendo.has(normal(x)));

  const meglevo = new Set(megmarad.map(normal));
  for (const nev of hozzaad) {
    const kulcs = normal(nev);
    // Amit a pedagógus már beírt kézzel, azt nem duplázzuk meg.
    if (kulcs && !meglevo.has(kulcs)) {
      megmarad.push(nev.trim());
      meglevo.add(kulcs);
    }
  }

  return megmarad.join(', ');
}

/**
 * Mely képességek szerepelnek a szövegben — a chipek innen tudják, hogy aktívak-e.
 * Így a mezőbe kézzel beírt képesség is ki lesz pipálva.
 */
export function szovegbenSzereploNevek(szoveg: string, nevek: string[]): Set<string> {
  const benne = new Set(tetelek(szoveg).map(normal));
  return new Set(nevek.filter((n) => benne.has(normal(n))));
}
