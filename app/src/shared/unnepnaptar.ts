/**
 * Magyar ünnepnaptár — mozgó ünnepek dátumszámítása és munkanaphoz igazítás.
 *
 * A `shared` mappában van, mert MINDKÉT oldalnak kell:
 *   - a renderer a naptár nézetben jeleníti meg,
 *   - a főprocesz pedig a heti tervek sablon-generálásánál használja.
 * Korábban csak a renderer ismerte, ezért a generálás sosem talált rá a Farsang,
 * Húsvét, Advent, Anyák napja, Pünkösd és Gyermeknap sablonokra.
 */

// --- Mozgó ünnepek dátumszámítása ---

/** Húsvétvasárnap dátuma (Meeus/Jones/Butcher Computus algoritmus). */
export function husvetVasarnap(ev: number): { honap: number; nap: number } {
  const a = ev % 19;
  const b = Math.floor(ev / 100);
  const c = ev % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const honap = Math.floor((h + l - 7 * m + 114) / 31);
  const nap = ((h + l - 7 * m + 114) % 31) + 1;
  return { honap, nap };
}

/** N. adott hétnapja egy hónapban (pl. 1. vasárnap májusban). hetnapja: 0=vasárnap. */
function nEdikHetnap(ev: number, honap: number, hetnapja: number, n: number): number {
  const elso = new Date(ev, honap - 1, 1).getDay();
  let nap = 1 + ((hetnapja - elso + 7) % 7);
  nap += (n - 1) * 7;
  return nap;
}

/** Utolsó adott hétnapja egy hónapban (pl. utolsó vasárnap májusban). */
function utolsoHetnap(ev: number, honap: number, hetnapja: number): number {
  const utolsoNap = new Date(ev, honap, 0).getDate();
  const utolsoHetnap = new Date(ev, honap - 1, utolsoNap).getDay();
  return utolsoNap - ((utolsoHetnap - hetnapja + 7) % 7);
}

export interface MozgoUnnepDatum {
  nev: string;
  honap: number;
  nap: number;
  kategoria: string;
  ovodaiSulyozas: number;
  leiras: string;
  /**
   * Hány nappal a naptári dátum ELŐTT ünnepel az óvoda (negatív szám).
   *
   * Húsvét és pünkösd vasárnapra esik, a rá következő hétfő pedig munkaszüneti
   * nap — a készülődés (tojásfestés, locsolóversek, pünkösdi királyság) ezért az
   * ünnep ELŐTTI héten zajlik, nem utána. E nélkül a hétvégi ünnep a következő
   * hétfőre tolódott, és a húsvéti hét egy héttel az ünnep UTÁN jött volna ki.
   * Nagypéntek szintén munkaszüneti nap, ezért húsvétnál nagycsütörtök (−3) az
   * utolsó óvodai nap; pünkösdnél a péntek (−2).
   *
   * A `nap`/`honap` mező érintetlen marad: a naptár nézet a valódi dátumot mutatja.
   */
  unneplesEltolas?: number;
}

/** Adott évre kiszámított mozgó ünnepek listája. */
export function mozgoUnnepekEvre(ev: number): MozgoUnnepDatum[] {
  const husvet = husvetVasarnap(ev);
  const husvetDate = new Date(ev, husvet.honap - 1, husvet.nap);

  const napElore = (alap: Date, delta: number) => {
    const d = new Date(alap);
    d.setDate(d.getDate() + delta);
    return { honap: d.getMonth() + 1, nap: d.getDate() };
  };

  // Hamvazószerda = húsvét - 46 nap; farsang vége = hamvazószerda - 1
  const farsangVege = napElore(husvetDate, -47);
  const punkosd = napElore(husvetDate, 49);
  const anyakNapja = { honap: 5, nap: nEdikHetnap(ev, 5, 0, 1) };
  const gyermeknap = { honap: 5, nap: utolsoHetnap(ev, 5, 0) };
  const apakNapja = { honap: 6, nap: nEdikHetnap(ev, 6, 0, 3) };

  // Advent 1. vasárnapja = a karácsony ELŐTTI utolsó vasárnap mínusz 3 hét.
  // Figyelem: ha karácsony épp vasárnapra esik, az NEM adventi vasárnap — ilyenkor
  // a szenteste előtti utolsó vasárnap dec. 18., és advent nov. 27-én kezdődik.
  // (A korábbi `% 7` képlet ezt az esetet egy héttel későbbre tette, pl. 2033-ban.)
  const dec25 = new Date(ev, 11, 25);
  const dec25Nap = dec25.getDay(); // 0 = vasárnap
  const advent4vasarnap = new Date(dec25);
  advent4vasarnap.setDate(25 - (dec25Nap || 7) - 21);
  const advent = { honap: advent4vasarnap.getMonth() + 1, nap: advent4vasarnap.getDate() };

  return [
    { ...advent, nev: 'Advent kezdete', kategoria: 'egyhazi', ovodaiSulyozas: 5, leiras: 'Adventi 4. vasárnap. Karácsonyi készülődés kezdete.' },
    { ...farsangVege, nev: 'Farsang', kategoria: 'nephagyomany', ovodaiSulyozas: 5, leiras: 'Jelmezbál, télűzés. Hamvazószerdáig tart.' },
    { honap: husvet.honap, nap: husvet.nap, nev: 'Húsvét', kategoria: 'egyhazi', ovodaiSulyozas: 5, leiras: 'Tojásfestés, locsolkodás, népszokások.', unneplesEltolas: -3 },
    { ...punkosd, nev: 'Pünkösd', kategoria: 'egyhazi', ovodaiSulyozas: 3, leiras: 'Pünkösdi királyság, pünkösdi rózsa.', unneplesEltolas: -2 },
    { ...anyakNapja, nev: 'Anyák napja', kategoria: 'ovodai', ovodaiSulyozas: 5, leiras: 'Május első vasárnapja. Ünnepség, ajándékkészítés.' },
    { ...gyermeknap, nev: 'Gyermeknap', kategoria: 'ovodai', ovodaiSulyozas: 5, leiras: 'Május utolsó vasárnapja. Rendezvény, játékok.' },
    { ...apakNapja, nev: 'Apák napja', kategoria: 'ovodai', ovodaiSulyozas: 4, leiras: 'Június harmadik vasárnapja.' },
  ];
}

// --- Munkanaphoz igazítás ---

/** Dátum óra nélkül, helyi időzónában — így az összevetés nem csúszik el. */
export function napKulcs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Hétvégére eső ünnep áttolása a legközelebbi munkanapra.
 *
 * Az óvodában a hétvégi ünnepet a mellette lévő munkanapon tartják meg:
 * szombat → az előtte lévő péntek, vasárnap → az utána következő hétfő.
 * Enélkül pl. 2026-ban a Mikulás (vasárnap) és a Luca-nap (vasárnap) egyetlen
 * heti tervbe sem került volna bele.
 */
export function munkanapraIgazit(datum: Date): Date {
  const d = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate());
  const nap = d.getDay();
  // FIGYELEM: a hétköznapokat is át kell engedni a szünet-korrekción — ha
  // szenteste hétfőre/keddre/szerdára esik (2029-2031), a hete már a téli
  // szünetben kezdődik, és a karácsonyi sablon kimaradna.
  if (nap !== 0 && nap !== 6) return szunetiHetbolVissza(d);

  // December második felében MINDIG visszafelé igazítunk: a karácsonyi ünneplés
  // a téli szünet ELŐTTI utolsó óvodai héten van. (2028-ban pl. szenteste
  // vasárnapra esik — előre tolva a szünetbe csúszna, és a karácsonyi sablon
  // egyetlen hétre sem került volna be.)
  const teliSzunetElott = d.getMonth() === 11 && d.getDate() >= 20;

  if (nap === 6) {
    d.setDate(d.getDate() - 1); // szombat → péntek
  } else if (teliSzunetElott) {
    d.setDate(d.getDate() - 2); // vasárnap → az előző péntek
  } else {
    d.setDate(d.getDate() + 1); // vasárnap → hétfő
  }
  return szunetiHetbolVissza(d);
}

/**
 * A téli szünetbe eső napot visszahozza az utolsó óvodai hétre.
 *
 * A heti tervek generálása kihagyja azokat a heteket, amelyek december 22. vagy
 * később kezdődnek. Ha szenteste ilyen hétre esik (2029-2031 között minden évben),
 * a karácsonyi sablon egyetlen hétre sem került volna be — pedig az óvodában épp
 * a szünet előtti utolsó héten van a karácsonyi ünneplés.
 */
function szunetiHetbolVissza(d: Date): Date {
  if (d.getMonth() !== 11) return d;
  const hetfo = new Date(d);
  hetfo.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // a hét hétfője
  if (hetfo.getDate() < 22) return d;
  const eredmeny = new Date(hetfo);
  eredmeny.setDate(hetfo.getDate() - 3); // az előző hét péntekje
  return eredmeny;
}
