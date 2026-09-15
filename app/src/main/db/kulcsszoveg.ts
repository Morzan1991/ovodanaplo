/**
 * A visszaállítási kulcs szöveges alakja: kiírás, visszaolvasás, ellenőrzés.
 *
 * Electron-függés nélkül, hogy tesztelhető legyen. (Korábban a `kulcs.ts`-ben
 * éltek; az továbbra is innen adja tovább őket.)
 */

/**
 * Ember által olvasható forma: 8 karakteres csoportok kötőjellel.
 * Pl. `A1B2C3D4-E5F6...` — így le lehet írni papírra elgépelés nélkül.
 */
export function kulcsFormazott(kulcs: string): string {
  return (kulcs.toUpperCase().match(/.{1,8}/g) ?? []).join('-');
}

/** A formázott (kötőjeles, nagybetűs) alakból visszaállítja a nyers kulcsot. */
export function kulcsNormalizal(bevitel: string): string {
  return bevitel.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
}

/** Érvényes-e egy visszaállítási kulcs (256 bit = 64 hex karakter). */
export function kulcsErvenyes(kulcs: string): boolean {
  return /^[0-9a-f]{64}$/.test(kulcsNormalizal(kulcs));
}

/**
 * Elválasztónak számít: bármilyen szóköz és sortörés, a kötőjel, és azok a
 * változatai, amikre a szövegszerkesztők cserélik (‐ ‑ ‒ – — ― −).
 */
const ELVALASZTO = /[\s\-‐-―−]/g;

/**
 * Mi a baj a begépelt visszaállítási kulccsal? `null`, ha formailag rendben van.
 *
 * Szigorúbb a `kulcsNormalizal`-nál, ami minden idegen jelet csendben eldob: egy
 * nulla helyett gépelt O betű ott nyomtalanul eltűnne, és csak egy érthetetlen
 * „rövid a kulcs" maradna belőle. Itt megnevezzük a gondot.
 */
export function kulcsBevitelHiba(bevitel: string): string | null {
  const jelek = bevitel.replace(ELVALASZTO, '');
  if (jelek === '') return 'Írd be a visszaállítási kulcsot.';

  const idegen = [...new Set(jelek.replace(/[0-9a-f]/gi, ''))];
  if (idegen.length > 0) {
    let uzenet =
      'A kulcsban csak számjegyek (0–9) és A–F betűk szerepelnek, ez nem illik bele: ' +
      `${idegen.map((j) => `„${j}”`).join(', ')}.`;
    // Tippet csak akkor adunk, ha minden idegen jel tipikus elírás — egy bemásolt
    // „Kulcs:" felirat l betűjénél az „egyest írj" félrevezetne.
    if (idegen.every((j) => /[oil]/i.test(j))) {
      if (idegen.some((j) => /o/i.test(j))) uzenet += ' Az O betű helyett nullát (0) írj.';
      if (idegen.some((j) => /[il]/i.test(j))) uzenet += ' Az I és az l betű helyett egyest (1) írj.';
    }
    return uzenet;
  }

  if (jelek.length !== 64) {
    return (
      `A kulcs 64 jelből áll (8 csoport, mindegyikben 8), most ${jelek.length} van beírva.` +
      (jelek.length < 64
        ? ' Lehet, hogy kimaradt egy darabja.'
        : ' Lehet, hogy valami kétszer került bele.')
    );
  }
  return null;
}
