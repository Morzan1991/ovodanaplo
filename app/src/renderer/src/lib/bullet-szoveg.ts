/**
 * A dokumentum nézet bullet-listáinak oda-vissza alakítása.
 *
 * MI VOLT A BAJ: a régi változat `split(/\n+/)` + `filter(Boolean)` párossal
 * dolgozott, ezért gépelés közben AZONNAL eldobta az üres sort. Aki Entert ütött,
 * hogy új sort kezdjen, annak a sortörése eltűnt; aki kitörölte egy sor szövegét,
 * hogy újraírja, annak a sora összeolvadt a következővel. A beszúrt ötletet így
 * nem lehetett átfogalmazni.
 *
 * Az alapelv: SZERKESZTÉS KÖZBEN NEM ÁTRENDEZÜNK. A „• " előtag csak megjelenítés,
 * a tárolt szövegbe nem kerül bele.
 */

/** Megjelenítési alak: soronként „• " előtag, az üres sorok érintetlenül. */
export function bulletFormat(szoveg: string): string {
  return szoveg
    .split('\n')
    .map((s) => {
      const t = s.trim();
      if (!t) return '';
      return t.startsWith('•') ? t : `• ${t}`;
    })
    .join('\n');
}

/** Tárolt alak: a „• " előtag levétele, a sor többi részéhez nem nyúlunk. */
export function bulletParse(szoveg: string): string {
  return szoveg
    .split('\n')
    .map((s) => s.replace(/^\s*•\s?/, ''))
    .join('\n');
}
