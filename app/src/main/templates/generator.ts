/**
 * Heti terv generátor — egy egész nevelési évre.
 *
 * Bemenet: nevelési év (kezdő-záró dátum)
 * Kimenet: lista heti terv + területek, sablonok alapján.
 *
 * Matcher logika:
 *   1. Ha van magyar ünnep a héten, és valamelyik sablon `kapcsoloUnnep` mezője rá illik → az.
 *   2. Hónap + sorrendi pozíció szerint (pl. szeptember 1. hete = "tanevkezdes")
 *   3. Fallback: üres skeleton sablon csak alap mezőkkel
 *
 * Csak a meglévő heti tervek MELLETT generál — nem írja felül a meglévőket.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Unnep } from '../../shared/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface SablonAdat {
  azonosito: string;
  cim: string;
  kategoria: string;
  javasoltHonap?: number;
  javasoltSorrend?: number;
  kapcsoloUnnep?: string;
  verzio?: number; // 1 vagy 2 — kettős verziók ugyanazon témán
  tema: string;
  cel: string;
  feladat: string;
  teruletek: Record<string, string>;
  iskolaElokeszito: string; // legacy — csak kulso_vilag-é
  iskolaElokeszitoTeruletek?: Record<string, string>; // új — minden főterülethez külön
  kepessegfejlesztes: string;
  eszkozok: string;
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
      join(process.resourcesPath, 'seed', `otletek-bank-${kc}.json`),
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
  const aliasoltTema = TEMA_ALIAS[tema] ?? tema;
  const temaPart = kcBank.temak[aliasoltTema];
  if (!temaPart) return [];
  return temaPart[terulet] ?? [];
}

let sablonokCache: SablonAdat[] | null = null;

export function loadSablonok(): SablonAdat[] {
  // FONTOS: ne cache-eljük az üres listát! Ha a seed file még nem volt elérhető
  // (pl. első indításnál timing-probléma), később próbáljuk újra.
  if (sablonokCache && sablonokCache.length > 0) return sablonokCache;

  const utak = [
    join(__dirname, '..', '..', '..', '..', 'seed', 'weekly-templates.json'),
    join(__dirname, '..', '..', '..', 'seed', 'weekly-templates.json'),
    join(process.resourcesPath, 'seed', 'weekly-templates.json'),
  ];

  for (const ut of utak) {
    if (existsSync(ut)) {
      try {
        const raw = readFileSync(ut, 'utf-8');
        const data: SablonokFile = JSON.parse(raw);
        if (data.sablonok && data.sablonok.length > 0) {
          sablonokCache = data.sablonok;
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
 * Adott dátumtartományban szereplő fix-dátumú ünnepek kiválogatása.
 */
function unnepekAHeten(
  hetKezdo: Date,
  hetVeg: Date,
  unnepek: Unnep[],
): Unnep[] {
  return unnepek.filter((u) => {
    if (u.tipus !== 'fix' || !u.honap || !u.nap) return false;
    // Megpróbáljuk a héten lévő évhez kapcsolni
    const ev = hetKezdo.getFullYear();
    const unnepDatum = new Date(ev, u.honap - 1, u.nap);
    return unnepDatum >= hetKezdo && unnepDatum <= hetVeg;
  });
}

/**
 * Adott héthez sablon kiválasztása.
 * Prioritás: ünnep > hónap+sorrend > hónap > null
 */
export function sablonHezKivalasztas(
  hetKezdo: Date,
  unnepek: Unnep[],
  hasznaltSablonAzonositok: Set<string>,
): SablonAdat | null {
  const sablonok = loadSablonok();
  const hetVeg = new Date(hetKezdo);
  hetVeg.setDate(hetVeg.getDate() + 4);

  // 1. Ünnep-alapú
  const aktualisUnnepek = unnepekAHeten(hetKezdo, hetVeg, unnepek);
  for (const u of aktualisUnnepek) {
    const talalat = sablonok.find((s) => s.kapcsoloUnnep === u.nev);
    if (talalat) return talalat;
  }

  // 2. Hónap + sorrend (csak még nem használt sablonok)
  const honap = hetKezdo.getMonth() + 1;
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

  const teruletek = ONAP_TERULETEK.map((tipus, i) => {
    let iskolaElokeszito = '';
    if (sablon.iskolaElokeszitoTeruletek?.[tipus]) {
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
