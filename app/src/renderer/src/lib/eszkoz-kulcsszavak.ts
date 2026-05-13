/**
 * Eszközlista auto-aggregálás kulcsszavai (TODO-13).
 *
 * A heti terv területeinek szövegéből kinyerhető eszközök listája,
 * kategorizálva. ~100+ kulcsszó óvodás tevékenységekhez.
 *
 * A `lookupEszkozok(szoveg)` függvény visszaadja a megtalált kulcsszavakat
 * a megjelenési sorrendben (kézműves → mozgás → ének → kreatív).
 */

export type EszkozKategoria = 'kezmuves' | 'mozgas' | 'enek' | 'kreativ';

export interface EszkozKulcsszo {
  /** A kulcsszó alacsony-betűs alakja (lookup-hoz). */
  kulcsszo: string;
  /** Alternatív kifejezések (pl. ragozott alak, szinonima). */
  variansok?: string[];
  kategoria: EszkozKategoria;
}

export const KATEGORIA_CIMKE: Record<EszkozKategoria, string> = {
  kezmuves: 'Kézműves',
  mozgas: 'Mozgás',
  enek: 'Ének-zene',
  kreativ: 'Kreatív / vegyes',
};

/** A 100+ kulcsszó kategorizálva. */
export const ESZKOZ_KULCSSZAVAK: EszkozKulcsszo[] = [
  // ===== KÉZMŰVES (40 elem) =====
  { kulcsszo: 'olló', kategoria: 'kezmuves' },
  { kulcsszo: 'cikk-cakk olló', kategoria: 'kezmuves' },
  { kulcsszo: 'ragasztó', kategoria: 'kezmuves' },
  { kulcsszo: 'ragasztószalag', variansok: ['cellux'], kategoria: 'kezmuves' },
  { kulcsszo: 'ragasztópisztoly', kategoria: 'kezmuves' },
  { kulcsszo: 'dekupázs', kategoria: 'kezmuves' },
  { kulcsszo: 'papír', kategoria: 'kezmuves' },
  { kulcsszo: 'színes lap', variansok: ['színes papír'], kategoria: 'kezmuves' },
  { kulcsszo: 'kartonlap', variansok: ['karton'], kategoria: 'kezmuves' },
  { kulcsszo: 'kraftpapír', kategoria: 'kezmuves' },
  { kulcsszo: 'krepp-papír', variansok: ['krepp papír', 'kreppapír'], kategoria: 'kezmuves' },
  { kulcsszo: 'csomagolópapír', kategoria: 'kezmuves' },
  { kulcsszo: 'hullámkarton', kategoria: 'kezmuves' },
  { kulcsszo: 'színes ceruza', kategoria: 'kezmuves' },
  { kulcsszo: 'zsírkréta', kategoria: 'kezmuves' },
  { kulcsszo: 'kréta', kategoria: 'kezmuves' },
  { kulcsszo: 'vízfesték', kategoria: 'kezmuves' },
  { kulcsszo: 'tempera', kategoria: 'kezmuves' },
  { kulcsszo: 'akvarell', kategoria: 'kezmuves' },
  { kulcsszo: 'festék', kategoria: 'kezmuves' },
  { kulcsszo: 'ujjfesték', variansok: ['ujj-festék'], kategoria: 'kezmuves' },
  { kulcsszo: 'ecset', kategoria: 'kezmuves' },
  { kulcsszo: 'lapos ecset', kategoria: 'kezmuves' },
  { kulcsszo: 'gyurma', kategoria: 'kezmuves' },
  { kulcsszo: 'agyag', kategoria: 'kezmuves' },
  { kulcsszo: 'sütőgyurma', kategoria: 'kezmuves' },
  { kulcsszo: 'plasztilin', kategoria: 'kezmuves' },
  { kulcsszo: 'fonal', kategoria: 'kezmuves' },
  { kulcsszo: 'zsineg', kategoria: 'kezmuves' },
  { kulcsszo: 'gombolyag', kategoria: 'kezmuves' },
  { kulcsszo: 'szalag', kategoria: 'kezmuves' },
  { kulcsszo: 'gyöngy', kategoria: 'kezmuves' },
  { kulcsszo: 'csillám', kategoria: 'kezmuves' },
  { kulcsszo: 'lyukasztó', kategoria: 'kezmuves' },
  { kulcsszo: 'körlyukasztó', kategoria: 'kezmuves' },
  { kulcsszo: 'sablon', kategoria: 'kezmuves' },
  { kulcsszo: 'nyomda', variansok: ['festéknyomda', 'gumi-stempli'], kategoria: 'kezmuves' },
  { kulcsszo: 'lamináló', kategoria: 'kezmuves' },
  { kulcsszo: 'papírvágó', kategoria: 'kezmuves' },
  { kulcsszo: 'gemkapocs', kategoria: 'kezmuves' },

  // ===== MOZGÁS (25 elem) =====
  { kulcsszo: 'babzsák', kategoria: 'mozgas' },
  { kulcsszo: 'labda', kategoria: 'mozgas' },
  { kulcsszo: 'karika', kategoria: 'mozgas' },
  { kulcsszo: 'hula-hop', variansok: ['hulahop'], kategoria: 'mozgas' },
  { kulcsszo: 'zsámoly', kategoria: 'mozgas' },
  { kulcsszo: 'alagút', kategoria: 'mozgas' },
  { kulcsszo: 'akadálypálya', kategoria: 'mozgas' },
  { kulcsszo: 'bólya', variansok: ['bóják'], kategoria: 'mozgas' },
  { kulcsszo: 'mászókendő', kategoria: 'mozgas' },
  { kulcsszo: 'kötél', kategoria: 'mozgas' },
  { kulcsszo: 'ugráló-kötél', variansok: ['ugráló kötél'], kategoria: 'mozgas' },
  { kulcsszo: 'tornaszőnyeg', kategoria: 'mozgas' },
  { kulcsszo: 'szivacs', kategoria: 'mozgas' },
  { kulcsszo: 'párna', kategoria: 'mozgas' },
  { kulcsszo: 'polifoam', kategoria: 'mozgas' },
  { kulcsszo: 'ejtőernyő', kategoria: 'mozgas' },
  { kulcsszo: 'doboz', kategoria: 'mozgas' },
  { kulcsszo: 'gumi-kötél', variansok: ['gumikötél'], kategoria: 'mozgas' },
  { kulcsszo: 'pad', variansok: ['padló-pad', 'tornapad'], kategoria: 'mozgas' },
  { kulcsszo: 'mászóka', kategoria: 'mozgas' },
  { kulcsszo: 'gyűrű', variansok: ['gyűrűk'], kategoria: 'mozgas' },
  { kulcsszo: 'bot', variansok: ['gimnasztikai bot', 'botok'], kategoria: 'mozgas' },
  { kulcsszo: 'célzó', kategoria: 'mozgas' },
  { kulcsszo: 'futballcél', variansok: ['kapu'], kategoria: 'mozgas' },
  { kulcsszo: 'hinta', variansok: ['hintázó'], kategoria: 'mozgas' },

  // ===== ÉNEK, ZENE (15 elem) =====
  { kulcsszo: 'csörgő', kategoria: 'enek' },
  { kulcsszo: 'dob', kategoria: 'enek' },
  { kulcsszo: 'triangulum', kategoria: 'enek' },
  { kulcsszo: 'csengetyű', variansok: ['csengő'], kategoria: 'enek' },
  { kulcsszo: 'hangszer', kategoria: 'enek' },
  { kulcsszo: 'furulya', kategoria: 'enek' },
  { kulcsszo: 'xilofon', kategoria: 'enek' },
  { kulcsszo: 'kongat', variansok: ['kongató'], kategoria: 'enek' },
  { kulcsszo: 'ritmusbot', variansok: ['ritmusbotok'], kategoria: 'enek' },
  { kulcsszo: 'kasztanyetta', kategoria: 'enek' },
  { kulcsszo: 'dobverő', kategoria: 'enek' },
  { kulcsszo: 'hangszóró', kategoria: 'enek' },
  { kulcsszo: 'laptop', kategoria: 'enek' },
  { kulcsszo: 'mikrofon', kategoria: 'enek' },
  { kulcsszo: 'CD', variansok: ['cd', 'cd-lejátszó'], kategoria: 'enek' },

  // ===== KREATÍV / VEGYES (25 elem) =====
  { kulcsszo: 'könyv', kategoria: 'kreativ' },
  { kulcsszo: 'mesekönyv', kategoria: 'kreativ' },
  { kulcsszo: 'képeskönyv', kategoria: 'kreativ' },
  { kulcsszo: 'verseskötet', kategoria: 'kreativ' },
  { kulcsszo: 'mondókás könyv', variansok: ['mondóka-könyv'], kategoria: 'kreativ' },
  { kulcsszo: 'képek', kategoria: 'kreativ' },
  { kulcsszo: 'fotó', variansok: ['fénykép', 'fényképek'], kategoria: 'kreativ' },
  { kulcsszo: 'képkártya', variansok: ['képkártyák'], kategoria: 'kreativ' },
  { kulcsszo: 'puzzle', variansok: ['kép-puzzle'], kategoria: 'kreativ' },
  { kulcsszo: 'kifestő', variansok: ['színező', 'színezők'], kategoria: 'kreativ' },
  { kulcsszo: 'termés', kategoria: 'kreativ' },
  { kulcsszo: 'gesztenye', kategoria: 'kreativ' },
  { kulcsszo: 'makk', kategoria: 'kreativ' },
  { kulcsszo: 'dió', kategoria: 'kreativ' },
  { kulcsszo: 'csigaház', variansok: ['csiga-ház'], kategoria: 'kreativ' },
  { kulcsszo: 'kavics', kategoria: 'kreativ' },
  { kulcsszo: 'levél', variansok: ['őszi levelek'], kategoria: 'kreativ' },
  { kulcsszo: 'gyertya', variansok: ['mécses'], kategoria: 'kreativ' },
  { kulcsszo: 'parafa-dugó', variansok: ['parafa dugó'], kategoria: 'kreativ' },
  { kulcsszo: 'tükör', kategoria: 'kreativ' },
  { kulcsszo: 'nagyítóüveg', variansok: ['nagyító', 'lupe'], kategoria: 'kreativ' },
  { kulcsszo: 'mesebáb', variansok: ['mese-báb', 'mese-bábok'], kategoria: 'kreativ' },
  { kulcsszo: 'kesztyűs báb', variansok: ['kesztyűs-báb'], kategoria: 'kreativ' },
  { kulcsszo: 'fakanál-báb', variansok: ['fakanál báb'], kategoria: 'kreativ' },
  { kulcsszo: 'jelmez', kategoria: 'kreativ' },
];

/**
 * Megkeresi a kulcsszavakat az adott szövegben (case-insensitive).
 * A találatokat kategória-sorrendben (kezmuves → mozgas → enek → kreativ) visszaadja.
 *
 * Mindkét formát (kulcsszó + variansok) ellenőrzi, de csak az alapformát adja vissza.
 */
export function lookupEszkozok(szoveg: string): string[] {
  const kis = szoveg.toLowerCase();
  const talalt: string[] = [];
  for (const e of ESZKOZ_KULCSSZAVAK) {
    const formak = [e.kulcsszo, ...(e.variansok ?? [])];
    if (formak.some((f) => kis.includes(f.toLowerCase()))) {
      talalt.push(e.kulcsszo);
    }
  }
  return talalt;
}
