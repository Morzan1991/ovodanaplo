/**
 * „Ez a hét” — az aktuális nevelési hét kiszámítása a telefonon.
 *
 * MIÉRT KELL: az asztali program naptárban gondolkodik, konkrét hetekkel; a
 * mobil app viszont csak hónapot mutatott. Az óvónő viszont hétben tervez, ezért
 * a kezdőképernyőnek meg kell mondania, hogy MOST melyik hét van, mi a hét témája
 * és milyen jeles nap esik bele.
 *
 * FONTOS: ugyanazt kell adnia, mint az asztali program, különben a két felület
 * mást mutat ugyanarra a hétre. Ezért az `app/src/shared/unnepnaptar.ts` és az
 * `app/src/main/templates/generator.ts` szabályai vannak ideátültetve:
 *   - a mozgó ünnepeket évre számítjuk (nem a seed konkrét dátumát vesszük),
 *   - a hétvégi ünnep a szomszédos munkanapra tolódik,
 *   - húsvét és pünkösd az ünnep ELŐTTI hétre kerül (nagyhét, készülődés),
 *   - a téma-választás sorrendje: ünnep > hónap+sorrend > hónap > semmi,
 *   - a nevelési év szeptember 1-től június 30-ig tart, a téli szünet kimarad.
 *
 * A telefonon nincs adatbázis, így „már felhasznált sablon” sincs eltárolva:
 * ezért az egész nevelési évet végigosztjuk minden hívásnál (10 hónap ≈ 40 hét,
 * ez ezredmásodperc), és abból olvassuk ki az aktuális hetet.
 */

import { TEMAK, UNNEPEK, type Tema, type Unnep } from './tartalom';

// --- Mozgó ünnepek --------------------------------------------------------

/** Húsvétvasárnap dátuma (Meeus/Jones/Butcher Computus algoritmus). */
function husvetVasarnap(ev: number): { honap: number; nap: number } {
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
  return {
    honap: Math.floor((h + l - 7 * m + 114) / 31),
    nap: ((h + l - 7 * m + 114) % 31) + 1,
  };
}

/** N. adott hétnapja egy hónapban (pl. 1. vasárnap májusban). hetnapja: 0 = vasárnap. */
function nEdikHetnap(ev: number, honap: number, hetnapja: number, n: number): number {
  const elso = new Date(ev, honap - 1, 1).getDay();
  return 1 + ((hetnapja - elso + 7) % 7) + (n - 1) * 7;
}

/** Utolsó adott hétnapja egy hónapban (pl. utolsó vasárnap májusban). */
function utolsoHetnap(ev: number, honap: number, hetnapja: number): number {
  const utolsoNap = new Date(ev, honap, 0).getDate();
  const utolso = new Date(ev, honap - 1, utolsoNap).getDay();
  return utolsoNap - ((utolso - hetnapja + 7) % 7);
}

/** Az adott évre kiszámított mozgó ünnepek. */
function mozgoUnnepekEvre(ev: number): Unnep[] {
  const husvet = husvetVasarnap(ev);
  const husvetNap = new Date(ev, husvet.honap - 1, husvet.nap);

  const napElore = (alap: Date, delta: number) => {
    const d = new Date(alap);
    d.setDate(d.getDate() + delta);
    return { honap: d.getMonth() + 1, nap: d.getDate() };
  };

  // Hamvazószerda = húsvét − 46 nap; a farsang vége az azt megelőző nap.
  const farsangVege = napElore(husvetNap, -47);
  const punkosd = napElore(husvetNap, 49);

  // Advent 1. vasárnapja: a karácsony ELŐTTI utolsó vasárnap mínusz 3 hét.
  // Ha karácsony épp vasárnapra esik, az még nem adventi vasárnap.
  const dec25 = new Date(ev, 11, 25);
  const advent = new Date(dec25);
  advent.setDate(25 - (dec25.getDay() || 7) - 21);

  return [
    { nev: 'Advent kezdete', honap: advent.getMonth() + 1, nap: advent.getDate(), kategoria: 'egyhazi', ovodaiSulyozas: 5 },
    { nev: 'Farsang', ...farsangVege, kategoria: 'nephagyomany', ovodaiSulyozas: 5 },
    { nev: 'Húsvét', honap: husvet.honap, nap: husvet.nap, kategoria: 'egyhazi', ovodaiSulyozas: 5, unneplesEltolas: -3 },
    { nev: 'Pünkösd', ...punkosd, kategoria: 'egyhazi', ovodaiSulyozas: 3, unneplesEltolas: -2 },
    { nev: 'Anyák napja', honap: 5, nap: nEdikHetnap(ev, 5, 0, 1), kategoria: 'ovodai', ovodaiSulyozas: 5 },
    { nev: 'Gyermeknap', honap: 5, nap: utolsoHetnap(ev, 5, 0), kategoria: 'ovodai', ovodaiSulyozas: 5 },
    { nev: 'Apák napja', honap: 6, nap: nEdikHetnap(ev, 6, 0, 3), kategoria: 'ovodai', ovodaiSulyozas: 4 },
  ];
}

// --- Munkanaphoz igazítás -------------------------------------------------

/** Dátum óra nélkül — így a nap-alapú összevetés nem csúszik el időzóna miatt. */
function napKulcs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** A téli szünetbe csúszott napot visszahozza a szünet előtti utolsó óvodai hétre. */
function szunetbolVissza(d: Date): Date {
  if (d.getMonth() !== 11) return d;
  const hetfo = new Date(d);
  hetfo.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (hetfo.getDate() < 22) return d;
  const eredmeny = new Date(hetfo);
  eredmeny.setDate(hetfo.getDate() - 3); // az előző hét péntekje
  return eredmeny;
}

/**
 * Hétvégére eső ünnep áttolása a legközelebbi munkanapra: szombat → péntek,
 * vasárnap → hétfő. December második felében mindig visszafelé, mert a karácsonyi
 * ünneplés a téli szünet ELŐTTI utolsó héten van.
 */
function munkanapraIgazit(datum: Date): Date {
  const d = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate());
  const nap = d.getDay();
  if (nap !== 0 && nap !== 6) return szunetbolVissza(d);

  const teliSzunetElott = d.getMonth() === 11 && d.getDate() >= 20;
  if (nap === 6) d.setDate(d.getDate() - 1);
  else if (teliSzunetElott) d.setDate(d.getDate() - 2);
  else d.setDate(d.getDate() + 1);
  return szunetbolVissza(d);
}

const KATEGORIA_RANG: Record<string, number> = {
  ovodai: 3,
  egyhazi: 2,
  nephagyomany: 2,
  nemzeti: 1,
  vilagunnep: 0,
};

/**
 * Az adott munkahétre (hétfő–péntek) eső jeles napok, fontosság szerint.
 * A 'mozgo' típusúak seedbeli dátuma egy régi évhez tartozik, ezért azokat
 * mindig számítjuk.
 */
interface UnnepJelolt {
  unnep: Unnep;
  /** Az a MUNKANAP, amelyen az óvoda ténylegesen megünnepli. */
  munkanap: number;
}

/** Az év összes jeles napja a megünneplés munkanapjával, fontossági sorrendben. */
function unnepJeloltek(ev: number): UnnepJelolt[] {
  return [...UNNEPEK.filter((u) => u.tipus !== 'mozgo' && u.honap && u.nap), ...mozgoUnnepekEvre(ev)]
    .map((u) => ({
      unnep: u,
      // Az `unneplesEltolas` a húsvétot és a pünkösdöt az ünnep ELŐTTI hétre viszi.
      munkanap: napKulcs(
        munkanapraIgazit(
          new Date(ev, (u.honap as number) - 1, (u.nap as number) + (u.unneplesEltolas ?? 0)),
        ),
      ),
    }))
    .sort(
      (a, b) =>
        (b.unnep.ovodaiSulyozas ?? 3) - (a.unnep.ovodaiSulyozas ?? 3) ||
        (KATEGORIA_RANG[b.unnep.kategoria ?? ''] ?? 0) - (KATEGORIA_RANG[a.unnep.kategoria ?? ''] ?? 0),
    );
}

/** Az adott munkahétre (hétfő–péntek) eső jeles napok, fontosság szerint. */
export function unnepekAHeten(hetfo: Date, pentek: Date): Unnep[] {
  const kezd = napKulcs(hetfo);
  const veg = napKulcs(pentek);
  return unnepJeloltek(hetfo.getFullYear())
    .filter((x) => x.munkanap >= kezd && x.munkanap <= veg)
    .map((x) => x.unnep);
}

// --- Nevelési év hetei ----------------------------------------------------

/** Annak a nevelési évnek a kezdő éve, amelybe a megadott nap esik (szept. 1-től). */
export function nevelesiEvKezdete(most: Date): number {
  return most.getMonth() + 1 >= 9 ? most.getFullYear() : most.getFullYear() - 1;
}

/**
 * A nevelési év óvodai hétfői, szeptember 1-től június 30-ig.
 * A téli szünet hetei kimaradnak — ahogy az asztali programban is.
 */
export function evHetei(evKezdo: number): Date[] {
  const hetek: Date[] = [];
  const zaro = new Date(evKezdo + 1, 5, 30);

  const d = new Date(evKezdo, 8, 1);
  const napIndex = d.getDay() || 7;
  if (napIndex !== 1) d.setDate(d.getDate() + (8 - napIndex));

  while (d <= zaro) {
    const honap = d.getMonth() + 1;
    const nap = d.getDate();
    const szunet = (honap === 12 && nap >= 22) || (honap === 1 && nap <= 7);
    if (!szunet) hetek.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return hetek;
}

const NAP_MS = 86_400_000;

/**
 * A nevelési év minden hetéhez témát rendel.
 *
 * Ugyanaz a sorrend, mint az asztali generálásnál:
 *   ünnep > jövő heti vesztes ünnep > elmaradt ünnep > hónap+sorrend > hónap.
 *
 * A két „mentő" lépés azért kell, mert egy hétre több jeles nap is eshet, a hét
 * viszont csak egy témát kap: a vesztes ünnep témája e nélkül kimaradna az évből
 * (2029-ben az adventi készülődés, 2027-ben a Víz Világnapja). A mentés ünnep-
 * szinten néz, nem téma-szinten — különben ugyanaz az ünnep több egymást követő
 * hetet is elvinne.
 */
function evKiosztasa(evKezdo: number): Map<number, Tema> {
  const kiosztas = new Map<number, Tema>();
  const hasznalt = new Set<string>();
  const kiszolgaltUnnep = new Set<string>();

  const mentendo = (nev: string): Tema | undefined =>
    kiszolgaltUnnep.has(nev) ? undefined : TEMAK.find((t) => t.unnep === nev);

  for (const hetfo of evHetei(evKezdo)) {
    const pentek = new Date(hetfo);
    pentek.setDate(pentek.getDate() + 4);
    const honap = hetfo.getMonth() + 1;
    const jeloltek = unnepJeloltek(hetfo.getFullYear());

    let valasztott: Tema | undefined;

    // 1. Ünnep — a hét legfontosabb jeles napja nyer
    for (const u of unnepekAHeten(hetfo, pentek)) {
      valasztott = TEMAK.find((t) => t.unnep && t.unnep === u.nev);
      if (valasztott) break;
    }

    // 1/b. A jövő héten biztosan alulmaradó ünnep előrehozása
    if (!valasztott) {
      const jovoKezd = napKulcs(pentek) + 3 * NAP_MS;
      const jovoHeti = jeloltek.filter(
        (x) => x.munkanap >= jovoKezd && x.munkanap <= jovoKezd + 4 * NAP_MS,
      );
      for (const vesztes of jovoHeti.slice(1)) {
        valasztott = mentendo(vesztes.unnep.nev);
        if (valasztott) break;
      }
    }

    // 1/c. Olyan ünnep pótlása, amelynek a hetét egy fontosabb jeles nap vitte el
    if (!valasztott) {
      const kezd = napKulcs(hetfo);
      for (const elmult of jeloltek.filter(
        (x) =>
          x.munkanap < kezd &&
          (new Date(x.munkanap).getMonth() + 1 === honap || kezd - x.munkanap <= 14 * NAP_MS),
      )) {
        valasztott = mentendo(elmult.unnep.nev);
        if (valasztott) break;
      }
    }

    // 2. Hónap + sorrend, még fel nem használt témák közül
    if (!valasztott) {
      valasztott = TEMAK.filter((t) => t.honap === honap && !t.unnep && !hasznalt.has(t.id)).sort(
        (a, b) => (a.sorrend ?? 99) - (b.sorrend ?? 99),
      )[0];
    }

    // 3. Bármelyik ehhez a hónaphoz tartozó téma
    if (!valasztott) {
      valasztott = TEMAK.find((t) => t.honap === honap && !t.unnep);
    }

    if (valasztott) {
      hasznalt.add(valasztott.id);
      if (valasztott.unnep) kiszolgaltUnnep.add(valasztott.unnep);
      kiosztas.set(napKulcs(hetfo), valasztott);
    }
  }
  return kiosztas;
}

const kiosztasGyorsitotar = new Map<number, Map<number, Tema>>();

export interface AktualisHet {
  hetfo: Date;
  pentek: Date;
  /** Hányadik óvodai hét a nevelési évben (1-től). */
  sorszam: number;
  osszesHet: number;
  tema: Tema | null;
  unnepek: Unnep[];
  /** Igaz, ha a mai nap nem esik óvodai hétre (nyári vagy téli szünet). */
  szunet: boolean;
}

/**
 * Az aktuális hét: dátumhatárok, sorszám, a hét témája és jeles napjai.
 *
 * Szünetben (nyár, karácsony) a KÖVETKEZŐ óvodai hetet adja vissza `szunet: true`
 * jelzéssel — így a kezdőképernyő sosem üres, és a készülődéshez is jó.
 */
export function aktualisHet(most: Date = new Date()): AktualisHet {
  const ma = napKulcs(most);
  let evKezdo = nevelesiEvKezdete(most);
  let hetek = evHetei(evKezdo);

  // Július-augusztus: a nevelési év már lezárult, a következő szeptember jön.
  if (hetek.length > 0 && ma > napKulcs(hetek[hetek.length - 1]) + 4 * 86400000) {
    evKezdo += 1;
    hetek = evHetei(evKezdo);
  }

  let kiosztas = kiosztasGyorsitotar.get(evKezdo);
  if (!kiosztas) {
    kiosztas = evKiosztasa(evKezdo);
    kiosztasGyorsitotar.set(evKezdo, kiosztas);
  }

  // A mai napot tartalmazó hét, vagy — szünetben — a következő.
  let index = hetek.findIndex((h) => ma >= napKulcs(h) && ma <= napKulcs(h) + 4 * 86400000);
  const szunet = index < 0;
  if (index < 0) index = Math.max(0, hetek.findIndex((h) => napKulcs(h) > ma));

  const hetfo = hetek[index] ?? new Date(most);
  const pentek = new Date(hetfo);
  pentek.setDate(pentek.getDate() + 4);

  return {
    hetfo,
    pentek,
    sorszam: index + 1,
    osszesHet: hetek.length,
    tema: kiosztas.get(napKulcs(hetfo)) ?? null,
    unnepek: unnepekAHeten(hetfo, pentek),
    szunet,
  };
}

const HONAP_ROVID = [
  'jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.',
  'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.',
];

/** „szept. 8. — 12." — azonos hónapon belül a hónapnév nem ismétlődik. */
export function hetIdoszak(hetfo: Date, pentek: Date): string {
  const eleje = `${HONAP_ROVID[hetfo.getMonth()]} ${hetfo.getDate()}.`;
  const vege =
    hetfo.getMonth() === pentek.getMonth()
      ? `${pentek.getDate()}.`
      : `${HONAP_ROVID[pentek.getMonth()]} ${pentek.getDate()}.`;
  return `${eleje} – ${vege}`;
}
