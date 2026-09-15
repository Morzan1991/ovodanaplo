/**
 * Heti terv generátor — egy egész nevelési évre.
 *
 * Bemenet: nevelési év (kezdő-záró dátum)
 * Kimenet: lista heti terv + területek, sablonok alapján.
 *
 * Matcher logika:
 *   1.   Ha van magyar ünnep a héten, és valamelyik sablon `kapcsoloUnnep` mezője rá illik → az.
 *   1/b. Ha a JÖVŐ héten két jeles nap ütközik, a biztos vesztes ide kerül előre.
 *   1/c. Ha egy ünnep hetét egy fontosabb vitte el, itt kap pótlást.
 *   2.   Hónap + sorrendi pozíció szerint (pl. szeptember 1. hete = "tanevkezdes")
 *   3.   Fallback: a hónap egy sablonja, akkor is ha már volt
 *
 * Az 1/b és 1/c nélkül a szűk hónapokban némán kimaradtak ünnepek az évből:
 * 2029-ben az adventi készülődés, 2027-ben a Víz Világnapja.
 *
 * Csak a meglévő heti tervek MELLETT generál — nem írja felül a meglévőket.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Unnep } from '../../shared/schema.js';
import { mozgoUnnepekEvre, munkanapraIgazit, napKulcs } from '../../shared/unnepnaptar.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SablonAdat {
  azonosito: string;
  cim: string;
  kategoria: string;
  javasoltHonap?: number;
  javasoltSorrend?: number;
  kapcsoloUnnep?: string;
  /**
   * Mely korcsoportoknak való a sablon. Hiányzó/üres = mindegyiknek.
   * Pl. a nagycsoportosok búcsúztatása csak ott értelmes, ahol iskolába
   * készülő gyerekek vannak: ['nagy', 'vegyes'].
   */
  korcsoport?: string[];
  verzio?: number; // 1 vagy 2 — kettős verziók ugyanazon témán
  tema: string;
  cel: string;
  feladat: string;
  teruletek: Record<string, string>;
  iskolaElokeszito: string; // legacy — csak kulso_vilag-é
  iskolaElokeszitoTeruletek?: Record<string, string>; // új — minden főterülethez külön
  kepessegfejlesztes: string;
  eszkozok: string;
  /**
   * Korcsoportra szabott változatok. A forrásgyűjtemény külön fogalmazza meg a
   * hét célját, feladatát és a fejlesztési területeket kis-, középső és
   * nagycsoportra — ha van ilyen, azt használjuk az általános szöveg helyett.
   */
  celKorcsoport?: Record<string, string>;
  feladatKorcsoport?: Record<string, string>;
  kepessegfejlesztesKorcsoport?: Record<string, string>;
}

/**
 * A sablon korcsoportra szabott változata.
 *
 * A cél, a feladat és a fejlesztési területek korosztályonként mást kívánnak: a
 * kiscsoportnál az ismerkedés és az érzékszervi tapasztalás, a nagycsoportnál a
 * rendszerezés és az összefüggések. Ha a sablonban van korcsoport-specifikus
 * szöveg, azt adjuk vissza; egyébként az általánosat.
 */
export function korcsoportraSzabott(
  sablon: SablonAdat,
  korcsoport: string | null | undefined,
): SablonAdat {
  // Vegyes csoportban nincs egyetlen „jó" korosztály — maradjon az általános,
  // amely mindhárom szintet átfogja.
  if (!korcsoport || korcsoport === 'vegyes') return sablon;
  return {
    ...sablon,
    cel: sablon.celKorcsoport?.[korcsoport] || sablon.cel,
    feladat: sablon.feladatKorcsoport?.[korcsoport] || sablon.feladat,
    kepessegfejlesztes:
      sablon.kepessegfejlesztesKorcsoport?.[korcsoport] || sablon.kepessegfejlesztes,
  };
}

interface SablonokFile {
  sablonok: SablonAdat[];
}

/**
 * Korcsoport-specifikus ötlet-bank: téma × terület × 10 bullet
 * a kiscsoport, középső, nagy és vegyes korosztályoknak.
 */
export interface OtletekBank {
  korcsoport: string; // 'kicsi' | 'kozepso' | 'nagy' | 'vegyes'
  korcsoport_cimke: string;
  temak: Record<string, Record<string, string[]>>; // [tema][terulet] -> string[]
}

let otletekBankCache: Record<string, OtletekBank> | null = null;

/**
 * Betölti az összes korcsoportra a `seed/otletek-bank-{korcsoport}.json` fájlokat.
 * Cache-elt — első hívásnál egyszer olvas, utána már nem.
 */
export function loadOtletekBank(): Record<string, OtletekBank> {
  if (otletekBankCache && Object.keys(otletekBankCache).length > 0) return otletekBankCache;

  const eredmeny: Record<string, OtletekBank> = {};
  const korcsoportok = ['kicsi', 'kozepso', 'nagy', 'vegyes'];

  for (const kc of korcsoportok) {
    const utak = [
      join(__dirname, '..', '..', '..', '..', 'seed', `otletek-bank-${kc}.json`),
      join(__dirname, '..', '..', '..', 'seed', `otletek-bank-${kc}.json`),
      // A becsomagolt appban a seed a resources mappában van. A `resourcesPath`
      // csak Electron alatt létezik — teszteléskor/parancssorból üres, és a
      // join() ilyenkor hibát dobna, ezért kiszűrjük.
      ...(process.resourcesPath
        ? [join(process.resourcesPath, 'seed', `otletek-bank-${kc}.json`)]
        : []),
    ];
    for (const ut of utak) {
      if (existsSync(ut)) {
        try {
          const raw = readFileSync(ut, 'utf-8');
          const data: OtletekBank = JSON.parse(raw);
          if (data.temak && Object.keys(data.temak).length > 0) {
            eredmeny[kc] = data;
            console.log(`[otletekBank/${kc}] betöltve: ${Object.keys(data.temak).length} téma`);
            break;
          }
        } catch (err) {
          console.error(`[otletekBank/${kc}] olvashatatlan:`, err);
        }
      }
    }
  }

  if (Object.keys(eredmeny).length === 0) {
    console.warn('[otletekBank] egyik korcsoport-bank sem található');
  }

  otletekBankCache = eredmeny;
  return eredmeny;
}

/**
 * Téma-prefix alias: néhány legacy név átirányítása a V1/V2-as csoportra.
 * pl. "husvet" legacy -> "husveti_het" V1/V2-csoport
 *     "osz_kezdete" legacy -> "osz_termenyek" V1/V2-csoport
 */
const TEMA_ALIAS: Record<string, string> = {
  husvet: 'husveti_het',
  osz_kezdete: 'osz_termenyek',
};

/**
 * Az adott korcsoport + téma + terület hármas 10 bullet-jét adja vissza.
 * Fallback: ha az adott korcsoport-bank nincs, a vegyes-t adja.
 *           Ha a vegyes sincs, üres tömböt.
 */
export function otletekTemara(
  korcsoport: string,
  tema: string,
  terulet: string,
): string[] {
  const bank = loadOtletekBank();
  const kcBank = bank[korcsoport] ?? bank['vegyes'];
  if (!kcBank) return [];
  // Az aliast CSAK akkor használjuk, ha a témának nincs saját bejegyzése.
  // (Korábban feltétel nélkül átirányított, így az „Ősz kezdete” és a „Húsvéti
  // hét” mindig a rokon téma anyagát kapta a sajátja helyett.)
  const temaPart = kcBank.temak[tema] ?? kcBank.temak[TEMA_ALIAS[tema] ?? tema];
  if (!temaPart) return [];
  return temaPart[terulet] ?? [];
}

/**
 * A hónap, a sorrend és a verzió számként kell hogy viselkedjen.
 *
 * A seed-fájlba korábban szövegként („9”) is került érték, a felület pedig
 * szigorúan hasonlít (`javasoltHonap === 9`) — az ilyen sablonok némán
 * kimaradtak a választólistából. Betöltéskor egységesítjük a típust, hogy egy
 * adathiba se tüntethessen el sablonokat.
 */
function szamokraAlakit(s: SablonAdat): SablonAdat {
  const szam = (ertek: unknown): number | undefined => {
    if (typeof ertek === 'number') return Number.isFinite(ertek) ? ertek : undefined;
    if (typeof ertek === 'string' && ertek.trim() !== '') {
      const n = Number(ertek);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };
  return {
    ...s,
    javasoltHonap: szam(s.javasoltHonap),
    javasoltSorrend: szam(s.javasoltSorrend),
    verzio: szam(s.verzio),
  };
}

let sablonokCache: SablonAdat[] | null = null;

export function loadSablonok(): SablonAdat[] {
  // FONTOS: ne cache-eljük az üres listát! Ha a seed file még nem volt elérhető
  // (pl. első indításnál timing-probléma), később próbáljuk újra.
  if (sablonokCache && sablonokCache.length > 0) return sablonokCache;

  const utak = [
    join(__dirname, '..', '..', '..', '..', 'seed', 'weekly-templates.json'),
    join(__dirname, '..', '..', '..', 'seed', 'weekly-templates.json'),
    ...(process.resourcesPath
      ? [join(process.resourcesPath, 'seed', 'weekly-templates.json')]
      : []),
  ];

  for (const ut of utak) {
    if (existsSync(ut)) {
      try {
        const raw = readFileSync(ut, 'utf-8');
        const data: SablonokFile = JSON.parse(raw);
        if (data.sablonok && data.sablonok.length > 0) {
          sablonokCache = data.sablonok.map(szamokraAlakit);
          console.log(`[sablon] ${data.sablonok.length} sablon betöltve: ${ut}`);
          return sablonokCache;
        }
      } catch (err) {
        console.error(`[sablon] hiba a fájl olvasásánál (${ut}):`, err);
      }
    }
  }

  console.warn('[sablon] weekly-templates.json nem található vagy üres, üres lista');
  // NEM cache-eljük az üres listát — később újra próbáljuk
  return [];
}

/**
 * Illik-e a sablon az adott korcsoporthoz?
 * A korcsoport nélküli sablonok mindenkinek valók. Ha nem ismerjük a csoport
 * típusát, inkább mutatunk mindent, mint hogy elrejtsünk valamit.
 */
export function sablonIllikKorcsoporthoz(
  sablon: SablonAdat,
  korcsoport: string | null | undefined,
): boolean {
  if (!sablon.korcsoport || sablon.korcsoport.length === 0) return true;
  if (!korcsoport) return true;
  return sablon.korcsoport.includes(korcsoport);
}

/**
 * Kategória-rangsor azonos súlyú ünnepek ütközésekor.
 * Az óvoda saját ünnepei és a hagyományok előbbre valók, mint a világnapok.
 */
const KATEGORIA_RANG: Record<string, number> = {
  ovodai: 3,
  egyhazi: 2,
  nephagyomany: 2,
  nemzeti: 1,
  vilagunnep: 0,
};

/**
 * Az adott munkahéten (hétfő-péntek) megünnepelt ünnepek, fontosság szerint.
 *
 * Három korábbi hiba javítva itt:
 *  1. A hét kezdete ISO-szövegből készül (UTC szerint értelmezve), az ünnep
 *     viszont helyi éjfélkor — így a PONT hétfőre eső ünnep két órával lemaradt,
 *     és kimaradt (pl. 2027. március 15., Víz Világnapja). Most nap-alapon,
 *     óra nélkül hasonlítunk.
 *  2. A hétvégi ünnepeket egyáltalán nem vette figyelembe, pedig az óvodában a
 *     szomszédos munkanapon ünneplik (2026-ban a Mikulás és a Luca-nap is
 *     vasárnapra esik — emiatt maradt üresen a december).
 *  3. Csak a 'fix' típust nézte, ezért a Farsang, Húsvét, Advent, Anyák napja,
 *     Pünkösd, Gyermeknap és az Évzáró sablonja SOSEM került elő. A mozgó
 *     ünnepeket most évre kiszámítjuk (lásd shared/unnepnaptar.ts).
 *  4. Húsvét és pünkösd az ünnep ELŐTTI héten kerül a tervbe — az óvodában a
 *     készülődés a nagyhéten van, a vasárnap utáni hétfő pedig munkaszüneti nap.
 */
interface UnnepJelolt {
  nev: string;
  /** Az a MUNKANAP, amelyen az óvoda ténylegesen megünnepli. */
  munkanap: number;
  suly: number;
  rang: number;
}

/**
 * Az év összes ünnepe azzal a munkanappal, amelyen az óvoda megtartja, fontossági
 * sorrendben. Erre épül a heti besorolás és az ünnepi sablonok mentése is.
 */
function unnepJeloltek(ev: number, unnepek: Unnep[]): UnnepJelolt[] {
  const jeloltek: Array<{ nev: string; datum: Date; suly: number; rang: number }> = [];

  for (const u of unnepek) {
    // A 'mozgo' típusúak dátuma a seedben egy konkrét évhez tartozik, ezért
    // azokat nem innen, hanem számítva vesszük.
    if (u.tipus === 'mozgo' || !u.honap || !u.nap) continue;
    jeloltek.push({
      nev: u.nev,
      datum: new Date(ev, u.honap - 1, u.nap),
      suly: u.ovodaiSulyozas ?? 3,
      rang: KATEGORIA_RANG[u.kategoria ?? ''] ?? 0,
    });
  }
  for (const m of mozgoUnnepekEvre(ev)) {
    // Húsvét és pünkösd ELŐTT ünnepel az óvoda (lásd unneplesEltolas): a vasárnapi
    // dátum a következő hétfőre tolódna, és a húsvéti hét az ünnep UTÁN jönne ki.
    const datum = new Date(ev, m.honap - 1, m.nap + (m.unneplesEltolas ?? 0));
    jeloltek.push({
      nev: m.nev,
      datum,
      suly: m.ovodaiSulyozas,
      rang: KATEGORIA_RANG[m.kategoria] ?? 0,
    });
  }

  return (
    jeloltek
      .map(({ nev, datum, suly, rang }) => ({
        nev,
        munkanap: napKulcs(munkanapraIgazit(datum)),
        suly,
        rang,
      }))
      // Ha egy hétre több ünnep esik: előbb az óvodai súlyozás dönt, azonos
      // súlynál pedig a kategória. Enélkül pl. 2028-ban a húsvét hete a Föld
      // Napja sablonját kapta volna (mindkettő 5★, egy hétre esnek).
      .sort((a, b) => b.suly - a.suly || b.rang - a.rang)
  );
}

/** Az adott munkahéten megünnepelt ünnepek nevei, fontosság szerint. */
function unnepekAHeten(hetKezdo: Date, hetVeg: Date, unnepek: Unnep[]): string[] {
  const kezd = napKulcs(hetKezdo);
  const veg = napKulcs(hetVeg);
  return unnepJeloltek(hetKezdo.getFullYear(), unnepek)
    .filter((x) => x.munkanap >= kezd && x.munkanap <= veg)
    .map(({ nev }) => nev);
}

/**
 * Adott héthez sablon kiválasztása.
 * Prioritás: ünnep > jövő heti vesztes ünnep > elmaradt ünnep > hónap+sorrend >
 * lecsúszott ünnepi > hónap > null
 */
export function sablonHezKivalasztas(
  hetKezdo: Date,
  unnepek: Unnep[],
  hasznaltSablonAzonositok: Set<string>,
  /**
   * Változat-eltolás: a nevelési év kezdő éve. Minden témához két sablon-változat
   * (v1/v2) létezik, korábban viszont MINDIG az első került elő — a második évben
   * a pedagógus szó szerint ugyanazt kapta volna. Az évszám szerinti eltolással
   * jövőre a másik változat jön.
   */
  valtozatEltolas = 0,
  /** A csoport korosztálya — a csak bizonyos korcsoportnak szóló sablonokhoz. */
  korcsoport?: string | null,
): SablonAdat | null {
  const sablonok = loadSablonok().filter((x) => sablonIllikKorcsoporthoz(x, korcsoport));
  const hetVeg = new Date(hetKezdo);
  hetVeg.setDate(hetVeg.getDate() + 4);

  /** Változatok közül választ: előbb a még nem használtak közül, év szerint váltva. */
  const valassz = (jeloltek: SablonAdat[]): SablonAdat | null => {
    if (jeloltek.length === 0) return null;
    const szabad = jeloltek.filter((x) => !hasznaltSablonAzonositok.has(x.azonosito));
    const lista = szabad.length > 0 ? szabad : jeloltek;
    return lista[Math.abs(valtozatEltolas) % lista.length];
  };

  // 1. Ünnep-alapú — a hét legfontosabb ünnepe nyer
  for (const unnepNev of unnepekAHeten(hetKezdo, hetVeg, unnepek)) {
    const talalat = valassz(sablonok.filter((x) => x.kapcsoloUnnep === unnepNev));
    if (talalat) return talalat;
  }

  const honap = hetKezdo.getMonth() + 1;
  const jeloltek = unnepJeloltek(hetKezdo.getFullYear(), unnepek);
  /**
   * Ünnepi sablon MENTÉSRE — csak akkor, ha az ünnep még egyáltalán nem került elő.
   *
   * Egy ünnephez több sablon-változat tartozik (húsvét: 4 db). Ha csak azt néznénk,
   * hogy van-e még fel nem használt változat, a mentő lépések ugyanazt az ünnepet
   * tennék egymás utáni hetekre — 2028 júniusa három egymást követő „Évzáró" hetet
   * kapott. A mentés ezért ünnep-szinten néz: ha az ünnepnek már van hete, kész.
   */
  const szabadUnnepi = (nev: string) => {
    const csalad = sablonok.filter((x) => x.kapcsoloUnnep === nev);
    if (csalad.some((x) => hasznaltSablonAzonositok.has(x.azonosito))) return null;
    return valassz(csalad);
  };

  // 1/b. ELŐREHOZÁS: a jövő héten vesztésre álló ünnep.
  //
  // Egy hétre több jeles nap is eshet, de a hét csak egy témát kap. 2029-ben pl.
  // advent kezdete és a Mikulás ugyanabba a hétbe esik, és a december többi hetét
  // a Luca-nap meg a karácsony viszi — az adventi készülődés így kimaradt volna az
  // évből. Ha a jövő heti ünnepek közül valamelyik biztosan alulmarad (nem ő a
  // legfontosabb), és ez a hét szabad, akkor ő ide kerül. Az adventi koszorú
  // készítése az első gyertyagyújtás előtti héten amúgy is természetes.
  const jovoKezd = napKulcs(hetVeg) + 3 * 86_400_000;
  const jovoVeg = jovoKezd + 4 * 86_400_000;
  const jovoHeti = jeloltek.filter((x) => x.munkanap >= jovoKezd && x.munkanap <= jovoVeg);
  for (const vesztes of jovoHeti.slice(1)) {
    const talalat = szabadUnnepi(vesztes.nev);
    if (talalat) return talalat;
  }

  // 1/c. PÓTLÁS: olyan ünnepi sablon, amelynek a hete már elment mellette.
  //
  // Ha az ünnep hetét egy fontosabb jeles nap vitte el (2027-ben a húsvéti
  // készülődés a Víz Világnapjáét), a sablon korábban NYOMTALANUL kimaradt az
  // évből, mert a hónap-alapú lépés az ünnepi sablonokat kizárja. Inkább egy
  // héttel odébb, mint sehol.
  const kezd = napKulcs(hetKezdo);
  for (const elmult of jeloltek.filter(
    (x) =>
      x.munkanap < kezd &&
      // Ugyanabban a hónapban, vagy legfeljebb két héttel korábban — hónapfordulón
      // is legyen esélye (a Víz Világnapja hete márciusban, a pótlás áprilisban).
      (new Date(x.munkanap).getMonth() + 1 === honap || kezd - x.munkanap <= 14 * 86_400_000),
  )) {
    const talalat = szabadUnnepi(elmult.nev);
    if (talalat) return talalat;
  }

  // 2. Hónap + sorrend (csak még nem használt sablonok)
  const honapSablonok = sablonok
    .filter((s) => s.javasoltHonap === honap && !s.kapcsoloUnnep)
    .filter((s) => !hasznaltSablonAzonositok.has(s.azonosito))
    .sort((a, b) => (a.javasoltSorrend ?? 99) - (b.javasoltSorrend ?? 99));

  if (honapSablonok.length > 0) return honapSablonok[0];

  // 3. Bármilyen ehhez a hónaphoz illő sablon (akkor is ha már használt)
  const barmiAhhoz = sablonok.find((s) => s.javasoltHonap === honap && !s.kapcsoloUnnep);
  if (barmiAhhoz) return barmiAhhoz;

  return null;
}

/**
 * Az adott nevelési év minden hétfőjének dátumát visszaadja
 * (csak a tényleges nevelési időszakban, kivéve a klasszikus iskolai szüneteket).
 */
export function hetekAzEvben(kezdo: string, zaro: string): Date[] {
  const hetek: Date[] = [];
  const kezdoDatum = new Date(kezdo);
  const zaroDatum = new Date(zaro);

  // Megtalál az első hétfőt
  let d = new Date(kezdoDatum);
  const napIndex = d.getDay() || 7; // 1..7 (vasárnap = 7)
  if (napIndex !== 1) {
    d.setDate(d.getDate() + (8 - napIndex));
  }

  while (d <= zaroDatum) {
    // Egyszerű szünet-szűrés: csak a karácsonyi szünetet vesszük ki (dec 22-31, jan 1-7)
    const honap = d.getMonth() + 1;
    const nap = d.getDate();
    const szunet =
      (honap === 12 && nap >= 22) ||
      (honap === 1 && nap <= 7) ||
      (honap === 4 && szuneti_husveti_idoszak(d));
    if (!szunet) {
      hetek.push(new Date(d));
    }
    d.setDate(d.getDate() + 7);
  }

  return hetek;
}

/**
 * Egyszerű húsvéti szünet check — ha a hét egybeesik a húsvéti hétfővel
 * (pontosan kiszámítani túl bonyolult, durva becslés).
 */
function szuneti_husveti_idoszak(d: Date): boolean {
  // Húsvét előtti hét (tipikusan): áprilisi 1. vagy 2. teljes hét
  // Itt egyszerűen NEM szűrjük — minden áprilisi hetet engedünk
  void d;
  return false;
}

export interface GeneraltHetiTerv {
  kezdoDatum: string;
  zaroDatum: string;
  hetSzama: number;
  tema: string;
  cel: string;
  feladat: string;
  differencialas: string;
  modszerek: string;
  kepessegfejlesztes: string;
  eszkozok: string;
  sablonAzonosito: string | null;
  teruletek: Array<{
    tipus: string;
    tartalom: string;
    iskolaElokeszito: string;
    sorrend: number;
  }>;
}

const ALAP_DIFFERENCIALAS =
  'tartalomban, módszerekben, segítségadás módjában és mennyiségében, az egyénre fordított idő mennyiségében';

/**
 * Differenciálás-szöveg.
 * A csoport-típus paraméter jelenleg nem módosítja a szöveget — a sablonok
 * tartalma differenciálódik a csoporthoz, nem a differenciálás-leírás.
 */
export function differencialasSzoveg(_csoportTipus?: string | null | undefined): string {
  return ALAP_DIFFERENCIALAS;
}
const ALAP_MODSZEREK =
  'bemutatás, magyarázat, szemléltetés, cselekedtetés, gyakorlás, ellenőrzés, értékelés';

const ONAP_TERULETEK = [
  'kulso_vilag',
  'matematika',
  'verseles_meseles',
  'rajzolas_festes',
  'enek_zene',
  'hallas_ritmus',
  'mozgas',
];

export function tervezetEgyHetbol(
  hetKezdo: Date,
  hetSzama: number,
  sablon: SablonAdat | null,
  csoportTipus: string | null | undefined = 'vegyes',
): GeneraltHetiTerv {
  const hetVeg = new Date(hetKezdo);
  hetVeg.setDate(hetVeg.getDate() + 4);

  const kezdoIso = hetKezdo.toISOString().split('T')[0];
  const zaroIso = hetVeg.toISOString().split('T')[0];

  const diff = differencialasSzoveg(csoportTipus);

  if (!sablon) {
    // Fallback: üres skeleton
    return {
      kezdoDatum: kezdoIso,
      zaroDatum: zaroIso,
      hetSzama,
      tema: '',
      cel: '',
      feladat: '',
      differencialas: diff,
      modszerek: ALAP_MODSZEREK,
      kepessegfejlesztes: '',
      eszkozok: '',
      sablonAzonosito: null,
      teruletek: ONAP_TERULETEK.map((t, i) => ({
        tipus: t,
        tartalom: '',
        iskolaElokeszito: '',
        sorrend: i,
      })),
    };
  }

  // Az iskola-előkészítő tartalom az 5-7 éveseké. Kis- és középső csoportnál nem
  // töltjük ki a sablonból — korábban oda is bekerült, és utólag "beragadt" adatként
  // felbukkant a dokumentum-nézetben és a DOCX-ben.
  const iskolaElokeszitoKell = csoportTipus !== 'kicsi' && csoportTipus !== 'kozepso';

  const teruletek = ONAP_TERULETEK.map((tipus, i) => {
    let iskolaElokeszito = '';
    if (!iskolaElokeszitoKell) {
      iskolaElokeszito = '';
    } else if (sablon.iskolaElokeszitoTeruletek?.[tipus]) {
      // Új formátum — minden főterülethez külön
      iskolaElokeszito = sablon.iskolaElokeszitoTeruletek[tipus];
    } else if (tipus === 'kulso_vilag') {
      // Legacy fallback — csak kulso_vilag-hez
      iskolaElokeszito = sablon.iskolaElokeszito;
    }
    return {
      tipus,
      tartalom: sablon.teruletek[tipus] ?? '',
      iskolaElokeszito,
      sorrend: i,
    };
  });

  return {
    kezdoDatum: kezdoIso,
    zaroDatum: zaroIso,
    hetSzama,
    tema: sablon.cim,
    cel: sablon.cel,
    feladat: sablon.feladat,
    differencialas: diff,
    modszerek: ALAP_MODSZEREK,
    kepessegfejlesztes: sablon.kepessegfejlesztes,
    eszkozok: sablon.eszkozok,
    sablonAzonosito: sablon.azonosito,
    teruletek,
  };
}
