/**
 * Az irodalmi anyag (mesék, versek, mondókák, dalok) helyességét őrzi.
 *
 * Előzmény: az ötletbank irodalmi listái a sablonok szabad szövegű sorai voltak,
 * ezért dal került a versek közé („Lipem-lopom a szőlőt”), témán kívüli mondóka
 * az őszi gyümölcsök hetébe, és mind a négy korcsoport szóról szóra ugyanazt
 * kapta. A listákat most a `tools/korpusz` gondozott korpusza generálja; ezek a
 * tesztek azt ellenőrzik, hogy a generált seed tényleg helyes maradjon.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SEED = join(__dirname, '..', '..', '..', '..', 'seed');

const KORCSOPORTOK = ['kicsi', 'kozepso', 'nagy', 'vegyes'] as const;
const IRODALMI_TERULETEK = ['verseles_meseles', 'enek_zene'] as const;

/** Verselés, mesélés területre való műfajok. */
const VERSELES = new Set([
  'mondóka',
  'vers',
  'mese',
  'népmese',
  'találós kérdés',
  'anyanyelvi játék',
]);
/** Ének, zene területre való műfajok. */
const ENEK = new Set(['dal', 'énekes körjáték', 'zenehallgatás', 'altató']);
const MINDEN_MUFAJ = new Set([...VERSELES, ...ENEK]);

interface Bank {
  temak: Record<string, Record<string, string[]>>;
}

function bankBetolt(kor: string): Bank {
  const ut = join(SEED, `otletek-bank-${kor}.json`);
  return JSON.parse(readFileSync(ut, 'utf-8')) as Bank;
}

/**
 * Egy javaslatsor műfaj-címkéje. A cím maga is tartalmazhat zárójelet
 * („A négy évszak — Ősz (részlet) (zenehallgatás)”), ezért hátulról keressük az
 * első ismert műfajnevet.
 */
function mufaj(sor: string): string | null {
  const csoportok = [...sor.matchAll(/\(([^()]+)\)/g)].map((m) => m[1]);
  for (let i = csoportok.length - 1; i >= 0; i--) {
    if (MINDEN_MUFAJ.has(csoportok[i])) return csoportok[i];
  }
  return null;
}

/**
 * Egy mű azonosító kulcsa a sorból: műfaj-címke és megjegyzés nélkül.
 * Így a bank („… (vers) — megjegyzés") és a sablon („…") sora egy műre mutat.
 */
function muKulcs(sor: string): string {
  return sor
    .replace(/\s\(([^()]+)\)/g, (egesz, benne: string) =>
      MINDEN_MUFAJ.has(benne) ? '' : egesz,
    )
    .split(' — ')[0]
    .trim()
    .toLocaleLowerCase('hu');
}

describe('irodalmi ötletbank', () => {
  it('minden korcsoport bankja betölthető', () => {
    for (const kor of KORCSOPORTOK) {
      expect(existsSync(join(SEED, `otletek-bank-${kor}.json`))).toBe(true);
      expect(Object.keys(bankBetolt(kor).temak).length).toBeGreaterThan(50);
    }
  });

  it('minden javaslat meg van jelölve műfajjal', () => {
    const jeloletlen: string[] = [];
    for (const kor of KORCSOPORTOK) {
      const bank = bankBetolt(kor);
      for (const [tema, teruletek] of Object.entries(bank.temak)) {
        for (const terulet of IRODALMI_TERULETEK) {
          for (const sor of teruletek[terulet] ?? []) {
            if (mufaj(sor) === null) jeloletlen.push(`${kor}/${tema}/${terulet}: ${sor}`);
          }
        }
      }
    }
    expect(jeloletlen).toEqual([]);
  });

  it('dal nem kerül a versek közé, vers nem kerül a dalok közé', () => {
    const rossz: string[] = [];
    for (const kor of KORCSOPORTOK) {
      const bank = bankBetolt(kor);
      for (const [tema, teruletek] of Object.entries(bank.temak)) {
        for (const terulet of IRODALMI_TERULETEK) {
          const varhato = terulet === 'verseles_meseles' ? VERSELES : ENEK;
          for (const sor of teruletek[terulet] ?? []) {
            const m = mufaj(sor);
            if (m && !varhato.has(m)) rossz.push(`${kor}/${tema}/${terulet}: ${sor}`);
          }
        }
      }
    }
    expect(rossz).toEqual([]);
  });

  it('egyetlen listán belül sincs ismétlődés — mind a hét területen', () => {
    // Központozás- és kisbetű-független összehasonlítás, hogy az írásváltozatok
    // („Ég a gyertya ég" / „Ég a gyertya, ég") se maradjanak bent kétszer.
    const norm = (s: string) =>
      s.toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim();
    const dupla: string[] = [];
    for (const kor of KORCSOPORTOK) {
      const bank = bankBetolt(kor);
      for (const [tema, teruletek] of Object.entries(bank.temak)) {
        for (const [terulet, lista] of Object.entries(teruletek)) {
          if (!Array.isArray(lista)) continue;
          const kulcsok = lista.map(norm);
          if (new Set(kulcsok).size !== kulcsok.length) dupla.push(`${kor}/${tema}/${terulet}`);
        }
      }
    }
    expect(dupla).toEqual([]);
  });

  it('a kiscsoport és a nagycsoport nem ugyanazt kapja', () => {
    const kicsi = bankBetolt('kicsi');
    const nagy = bankBetolt('nagy');
    const azonos: string[] = [];
    for (const tema of Object.keys(kicsi.temak)) {
      for (const terulet of IRODALMI_TERULETEK) {
        const a = kicsi.temak[tema]?.[terulet] ?? [];
        const b = nagy.temak[tema]?.[terulet] ?? [];
        if (a.length === 0 || b.length === 0) continue;
        if (a.join('|') === b.join('|')) azonos.push(`${tema}/${terulet}`);
      }
    }
    expect(azonos).toEqual([]);
  });

  it('minden téma minden korcsoportnak kínál irodalmat és éneket', () => {
    const ures: string[] = [];
    for (const kor of KORCSOPORTOK) {
      const bank = bankBetolt(kor);
      for (const [tema, teruletek] of Object.entries(bank.temak)) {
        for (const terulet of IRODALMI_TERULETEK) {
          if ((teruletek[terulet] ?? []).length < 3) ures.push(`${kor}/${tema}/${terulet}`);
        }
      }
    }
    expect(ures).toEqual([]);
  });
});

describe('sablonok irodalmi szekciói', () => {
  const sablonok = JSON.parse(
    readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8'),
  ).sablonok as Array<{ azonosito: string; teruletek: Record<string, string> }>;

  /**
   * A sablonok szövegében MÁR NINCS műfaj-címke — a pedagógus kérésére csak a
   * népmese jelölése maradt, a szekció fejléce („Mondókák, versek:", „Mesék:")
   * mondja meg a többit. A műfaji keveredést ezért a bankkal összevetve nézzük:
   * ugyanaz a mű ott címkével szerepel, abból tudjuk, melyik területre való.
   */
  // Egy mű több műfajjal is szerepelhet: az „Ess, eső, ess" az egyik témában
  // mondóka, a másikban énekelt változat. Ezért halmazt tartunk, és csak akkor
  // hibázunk, ha EGYIK ismert műfaja sem való az adott területre.
  const mufajokCimSzerint = new Map<string, Set<string>>();
  for (const kor of KORCSOPORTOK) {
    const bank = bankBetolt(kor);
    for (const teruletek of Object.values(bank.temak)) {
      for (const lista of Object.values(teruletek)) {
        if (!Array.isArray(lista)) continue;
        for (const sor of lista) {
          const m = mufaj(sor);
          if (!m) continue;
          const kulcs = muKulcs(sor);
          if (!mufajokCimSzerint.has(kulcs)) mufajokCimSzerint.set(kulcs, new Set());
          mufajokCimSzerint.get(kulcs)!.add(m);
        }
      }
    }
  }

  it('a sablonokban sem keveredik a műfaj', () => {
    const rossz: string[] = [];
    for (const s of sablonok) {
      for (const terulet of IRODALMI_TERULETEK) {
        const varhato = terulet === 'verseles_meseles' ? VERSELES : ENEK;
        for (const sor of (s.teruletek[terulet] ?? '').split('\n')) {
          if (!sor.trim() || sor.trim().endsWith(':')) continue; // szekció-fejléc
          const mufajok = mufajokCimSzerint.get(muKulcs(sor));
          // Amit a bank nem ismer, azt nem tudjuk megítélni — az nem hiba.
          if (mufajok && ![...mufajok].some((m) => varhato.has(m))) {
            rossz.push(`${s.azonosito}/${terulet}: ${sor} → ${[...mufajok].join('/')}`);
          }
        }
      }
    }
    expect(rossz).toEqual([]);
  });

  it('a sablonok szövegében a NÉPMESÉN kívül nincs műfaj-címke', () => {
    const felesleges: string[] = [];
    for (const s of sablonok) {
      for (const terulet of IRODALMI_TERULETEK) {
        for (const sor of (s.teruletek[terulet] ?? '').split('\n')) {
          const m = mufaj(sor);
          if (m && m !== 'népmese') felesleges.push(`${s.azonosito}/${terulet}: ${sor}`);
        }
      }
    }
    expect(felesleges).toEqual([]);
  });

  it('minden sablonban jut hely mesének is', () => {
    // A mese az óvodai hét gerince — ha csak a mondókák férnének be a keretbe,
    // a heti terv mese nélkül maradna.
    const mesetlen = sablonok
      .filter((s) => !(s.teruletek.verseles_meseles ?? '').includes('Mesék:'))
      .map((s) => s.azonosito);
    expect(mesetlen).toEqual([]);
  });

  it('minden sablonban van vers/mese és ének is', () => {
    const hianyos: string[] = [];
    for (const s of sablonok) {
      for (const terulet of IRODALMI_TERULETEK) {
        const sorok = (s.teruletek[terulet] ?? '')
          .split('\n')
          .filter((x) => x.trim() && !x.trim().endsWith(':'));
        if (sorok.length < 3) hianyos.push(`${s.azonosito}/${terulet}`);
      }
    }
    expect(hianyos).toEqual([]);
  });
});

describe('irodalomtár (Irodalom menüpont)', () => {
  const tetelek = JSON.parse(readFileSync(join(SEED, 'literature.json'), 'utf-8')).tetelek as Array<{
    tipus: string;
    cim: string;
    szerzo?: string;
  }>;

  it('nincs két azonos mű', () => {
    // Központozás-független összehasonlítás: a „Lipem, lopom a szőlőt" és a
    // „Lipem-lopom a szőlőt" ugyanaz a dal, nem két külön tétel.
    const norm = (t: { szerzo?: string; cim: string }) =>
      `${(t.szerzo ?? '').toLowerCase()}|` +
      t.cim
        .toLowerCase()
        .replace(/[^\p{L}\p{N} ]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const kulcsok = tetelek.map(norm);
    const duplak = kulcsok.filter((k, i) => kulcsok.indexOf(k) !== i);
    expect(duplak).toEqual([]);
  });

  it('a címek nem végződnek ponttal', () => {
    // A számmal végződő cím ("Március 15.") szabályos — csak a mondatvégi pontot
    // hagyó, elgépelt címeket keressük.
    const pontos = tetelek.filter((t) => /\p{Ll}\.$/u.test(t.cim.trim())).map((t) => t.cim);
    expect(pontos).toEqual([]);
  });
});

describe('korcsoportra szabott cél, feladat, fejlesztés', () => {
  const sablonok = JSON.parse(
    readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8'),
  ).sablonok as Array<{
    azonosito: string;
    cel: string;
    feladat: string;
    kepessegfejlesztes: string;
    celKorcsoport?: Record<string, string>;
    feladatKorcsoport?: Record<string, string>;
    kepessegfejlesztesKorcsoport?: Record<string, string>;
  }>;

  it('a sablonok többségének van korcsoportos változata', () => {
    const vanKorcsoportos = sablonok.filter((s) => s.celKorcsoport).length;
    expect(vanKorcsoportos).toBeGreaterThan(sablonok.length / 2);
  });

  it('a kiscsoport és a nagycsoport célja nem ugyanaz', () => {
    const azonos = sablonok
      .filter((s) => s.celKorcsoport?.kicsi && s.celKorcsoport?.nagy)
      .filter((s) => s.celKorcsoport!.kicsi === s.celKorcsoport!.nagy)
      .map((s) => s.azonosito);
    expect(azonos).toEqual([]);
  });

  it('korcsoportraSzabott a megfelelő szöveget adja vissza', async () => {
    const { korcsoportraSzabott } = await import('./generator');
    const minta = sablonok.find((s) => s.celKorcsoport?.nagy)!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nagynak = korcsoportraSzabott(minta as any, 'nagy');
    expect(nagynak.cel).toBe(minta.celKorcsoport!.nagy);
    // vegyes csoportban a mindhárom szintet átfogó általános szöveg marad
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(korcsoportraSzabott(minta as any, 'vegyes').cel).toBe(minta.cel);
  });
});

describe('sablon-metaadatok — a választólista épsége', () => {
  const sablonok = JSON.parse(
    readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8'),
  ).sablonok as Array<{
    azonosito: string;
    cim: string;
    javasoltHonap?: unknown;
    javasoltSorrend?: unknown;
    verzio?: unknown;
  }>;

  it('a hónap, a sorrend és a verzió szám, nem szöveg', () => {
    // A felület szigorúan hasonlít (javasoltHonap === 9); ha szövegként „9" kerül
    // a fájlba, az a sablon némán kimarad a választólistából.
    const rossz = sablonok
      .filter((s) =>
        (['javasoltHonap', 'javasoltSorrend', 'verzio'] as const).some(
          (m) => s[m] !== undefined && s[m] !== null && typeof s[m] !== 'number',
        ),
      )
      .map((s) => s.azonosito);
    expect(rossz).toEqual([]);
  });

  it('minden sablonnak van címe és nevelési évbe eső hónapja', () => {
    const honapok = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
    const rossz = sablonok
      .filter((s) => !s.cim?.trim() || !honapok.includes(s.javasoltHonap as number))
      .map((s) => s.azonosito);
    expect(rossz).toEqual([]);
  });

  it('nincs két azonos sablon-azonosító', () => {
    const idk = sablonok.map((s) => s.azonosito);
    expect(idk.filter((x, i) => idk.indexOf(x) !== i)).toEqual([]);
  });
});
