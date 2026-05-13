/**
 * DOCX exporter — heti tervhez és foglalkozás-tervezethez.
 *
 * A heti terv kimenete pixelpontosan követi a felhasználó `Hetiterv üres.docx`
 * sablonjának struktúráját: 6 ONAP-terület + Cél/Feladat/Differenciálás/Módszerek/
 * Képességfejlesztés/Eszközök lezáró rész.
 *
 * Cél: a generált .docx feltölthető legyen az oviKRÉTA csoportnaplójába
 * csatolmányként.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
} from 'docx';
import type { HetiTerv, Terulet, Beallitas, FoglalkozasTervezet, Projekt } from '../shared/schema.js';

const FONT = 'Times New Roman';
const FONT_SIZE = 24; // 12pt

/**
 * Félkövér cím bekezdés (önálló sorban).
 */
function cimBekezdes(cim: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: cim, bold: true, font: FONT, size: FONT_SIZE })],
    spacing: { before: 120, after: 60 },
  });
}

/**
 * Alcím — normál betű (nem félkövér), kisebb térkövetés.
 */
function alcimBekezdes(cim: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: cim, font: FONT, size: FONT_SIZE })],
    spacing: { before: 60, after: 30 },
  });
}

/**
 * Bullet pontos lista-elem.
 */
function bulletBekezdes(szoveg: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: szoveg.trim(), font: FONT, size: FONT_SIZE })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

/**
 * Cím + bekezdés szöveg ugyanazon a soron (pl. "Cél: A gyerekek ismerjék meg...")
 */
function cimSzovegBekezdes(cim: string, szoveg: string | null | undefined): Paragraph {
  const children = [
    new TextRun({ text: cim, bold: true, font: FONT, size: FONT_SIZE }),
  ];
  if (szoveg && szoveg.trim()) {
    children.push(new TextRun({ text: ' ', font: FONT, size: FONT_SIZE }));
    children.push(new TextRun({ text: szoveg.trim(), font: FONT, size: FONT_SIZE }));
  }
  return new Paragraph({ children, spacing: { after: 100 } });
}

/**
 * Tartalmat \n-nel szétdarabol és bullet pontokká alakít.
 * Üres sorokat figyelmen kívül hagy.
 */
function bulletekBol(szoveg: string | null | undefined): Paragraph[] {
  if (!szoveg) return [];
  return szoveg
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => bulletBekezdes(s));
}

/**
 * Verselés-mesélés tartalmat felbontja "Mesék:" és "Mondókák és versek:" részekre.
 * Ha nem található alfejezet, az egészet egy lista alá teszi.
 */
function verselesBlokk(szoveg: string): Paragraph[] {
  const trimmed = (szoveg ?? '').trim();
  if (!trimmed) return [];

  // Keresési minták: Mesék:, Mondókák és versek:
  const mesekMatch = trimmed.match(/Mes[éeè]k\s*:\s*\n?/i);
  const mondokakMatch = trimmed.match(/Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*\n?/i);

  if (!mesekMatch && !mondokakMatch) {
    return bulletekBol(trimmed);
  }

  const result: Paragraph[] = [];
  let mesekResz = '';
  let mondokakResz = '';
  let elotteResz = '';

  if (mesekMatch && mondokakMatch) {
    // Mindkettő szerepel
    const mesekStart = mesekMatch.index! + mesekMatch[0].length;
    const mondokakStart = mondokakMatch.index!;
    elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
    mesekResz = trimmed.substring(mesekStart, mondokakStart).trim();
    mondokakResz = trimmed.substring(mondokakStart + mondokakMatch[0].length).trim();
  } else if (mesekMatch) {
    elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
    mesekResz = trimmed.substring(mesekMatch.index! + mesekMatch[0].length).trim();
  } else if (mondokakMatch) {
    elotteResz = trimmed.substring(0, mondokakMatch.index!).trim();
    mondokakResz = trimmed.substring(mondokakMatch.index! + mondokakMatch[0].length).trim();
  }

  if (elotteResz) result.push(...bulletekBol(elotteResz));
  if (mesekResz) {
    result.push(cimBekezdes('Mesék:'));
    result.push(...bulletekBol(mesekResz));
  }
  if (mondokakResz) {
    result.push(cimBekezdes('Mondókák és versek:'));
    result.push(...bulletekBol(mondokakResz));
  }
  return result;
}

/**
 * Mozgás-tartalmat felbontja "Tornatermi tevékenységek:" és
 * "Csoportban/udvaron végzett mindennapos mozgás:" részekre.
 */
function mozgasBlokk(szoveg: string): Paragraph[] {
  const trimmed = (szoveg ?? '').trim();
  if (!trimmed) return [];

  const tornaMatch = trimmed.match(/Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*\n?/i);
  const udvarMatch = trimmed.match(/Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*\n?/i);

  if (!tornaMatch && !udvarMatch) {
    return bulletekBol(trimmed);
  }

  const result: Paragraph[] = [];
  let tornaResz = '';
  let udvarResz = '';
  let elotteResz = '';

  if (tornaMatch && udvarMatch) {
    const tornaStart = tornaMatch.index! + tornaMatch[0].length;
    const udvarStart = udvarMatch.index!;
    elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
    tornaResz = trimmed.substring(tornaStart, udvarStart).trim();
    udvarResz = trimmed.substring(udvarStart + udvarMatch[0].length).trim();
  } else if (tornaMatch) {
    elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
    tornaResz = trimmed.substring(tornaMatch.index! + tornaMatch[0].length).trim();
  } else if (udvarMatch) {
    elotteResz = trimmed.substring(0, udvarMatch.index!).trim();
    udvarResz = trimmed.substring(udvarMatch.index! + udvarMatch[0].length).trim();
  }

  if (elotteResz) result.push(...bulletekBol(elotteResz));
  if (tornaResz) {
    result.push(alcimBekezdes('Tornatermi tevékenységek:'));
    result.push(...bulletekBol(tornaResz));
  }
  if (udvarResz) {
    result.push(alcimBekezdes('Csoportban/udvaron végzett mindennapos mozgás:'));
    result.push(...bulletekBol(udvarResz));
  }
  return result;
}

export interface HetiTervDocxInput {
  hetiTerv: HetiTerv;
  teruletek: Terulet[];
  beallitas: Beallitas | null;
}

/**
 * Heti terv DOCX-be exportálása.
 *
 * Pontos formátum (a felhasználó 4 mintadokumentuma alapján):
 *   1. Külső világ tevékeny megismerésére nevelés: + bullet lista
 *   2. Matematikai tartalom: + bullet lista
 *   → Iskola előkészítő tevékenység: + bullet lista (a két előző területhez közös)
 *   3. Verselés, mesélés: → Mesék: + bullet → Mondókák és versek: + bullet
 *   → Iskola előkészítő tevékenység: + bullet lista
 *   4. Rajzolás, festés, mintázás, építés, képalakítás, kézimunka: + bullet
 *   → Iskola előkészítő tevékenység: + bullet lista
 *   5. Ének, zene, népi játék, tánc: + bullet → Hallás és ritmusérzék fejlesztés: + bullet
 *   → Iskola előkészítő tevékenység: + bullet lista
 *   6. Mindennapos mozgás: → Tornatermi: + bullet → Csoportban/udvaron: + bullet
 *   → Iskola előkészítő tevékenység: + bullet lista
 *   7. Lezáró rész egy-soros: Cél, Feladat, Differenciálás, Módszerek, Képességfejlesztés, Eszközök
 *
 * Visszaadja a generált bináris Buffer-t.
 */
export async function hetiTervToDocx(input: HetiTervDocxInput): Promise<Buffer> {
  const { hetiTerv, teruletek, beallitas } = input;

  const get = (tipus: string) => teruletek.find((t) => t.tipus === tipus);
  const T = (tipus: string) => get(tipus)?.tartalom ?? '';
  const I = (tipus: string) => get(tipus)?.iskolaElokeszito ?? '';

  const tartalmak: Paragraph[] = [
    // 1. Külső világ + 2. Matematika (közös iskolaElokeszito a végén)
    cimBekezdes('Külső világ tevékeny megismerésére nevelés:'),
    ...bulletekBol(T('kulso_vilag')),
    cimBekezdes('Matematikai tartalom:'),
    ...bulletekBol(T('matematika')),
    cimBekezdes('Iskola előkészítő tevékenység:'),
    ...bulletekBol(I('kulso_vilag')),

    // 3. Verselés, mesélés (Mesék: + Mondókák alfejezet)
    cimBekezdes('Verselés, mesélés:'),
    ...verselesBlokk(T('verseles_meseles')),
    cimBekezdes('Iskola előkészítő tevékenység:'),
    ...bulletekBol(I('verseles_meseles')),

    // 4. Rajzolás, festés
    cimBekezdes('Rajzolás, festés, mintázás, építés, képalakítás, kézimunka:'),
    ...bulletekBol(T('rajzolas_festes')),
    cimBekezdes('Iskola előkészítő tevékenység:'),
    ...bulletekBol(I('rajzolas_festes')),

    // 5. Ének + Hallás-ritmus
    cimBekezdes('Ének, zene, népi játék, tánc:'),
    ...bulletekBol(T('enek_zene')),
    alcimBekezdes('Hallás és ritmusérzék fejlesztés:'),
    ...bulletekBol(T('hallas_ritmus')),
    cimBekezdes('Iskola előkészítő tevékenység:'),
    ...bulletekBol(I('enek_zene')),

    // 6. Mindennapos mozgás (Tornatermi + Csoportban/udvaron alfejezet)
    cimBekezdes('Mindennapos mozgás:'),
    ...mozgasBlokk(T('mozgas')),
    cimBekezdes('Iskola előkészítő tevékenység:'),
    ...bulletekBol(I('mozgas')),

    // 7. Lezáró rész (egy-soros cím+szöveg)
    cimSzovegBekezdes('Cél:', hetiTerv.cel),
    cimSzovegBekezdes('Feladat:', hetiTerv.feladat),
    cimSzovegBekezdes('Differenciálás:', hetiTerv.differencialas),
    cimSzovegBekezdes('Módszerek:', hetiTerv.modszerek),
    cimSzovegBekezdes('Képességfejlesztés:', hetiTerv.kepessegfejlesztes),
    cimSzovegBekezdes('Eszközök:', hetiTerv.eszkozok),
  ];

  const tema = hetiTerv.tema || 'heti-terv';
  const datumTartomany = `${hetiTerv.kezdoDatum} — ${hetiTerv.zaroDatum}`;

  const doc = new Document({
    creator: beallitas?.pedagogusNeve ?? 'OvodaNapló',
    title: `Heti terv — ${tema}`,
    description: `Heti terv ${datumTartomany}`,
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2 cm
          },
        },
        children: tartalmak,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// AlignmentType és PageBreak még kell a FoglalkozasDocx-hez
void AlignmentType;
void PageBreak;

// ============================================================
// Foglalkozás-tervezet DOCX export
// ============================================================

export interface FoglalkozasDocxInput {
  foglalkozas: FoglalkozasTervezet;
  beallitas: Beallitas | null;
}

export async function foglalkozasToDocx(input: FoglalkozasDocxInput): Promise<Buffer> {
  const { foglalkozas, beallitas } = input;

  const mezo = (cimke: string, ertek: string | null | undefined): Paragraph[] => {
    if (!ertek) return [];
    return [
      new Paragraph({
        children: [
          new TextRun({ text: `${cimke}: `, bold: true, font: 'Times New Roman', size: 24 }),
          new TextRun({ text: ertek, font: 'Times New Roman', size: 24 }),
        ],
        spacing: { after: 80 },
      }),
    ];
  };

  const blokk = (cim: string, ertek: string | null | undefined): Paragraph[] => {
    if (!ertek) return [];
    const sorok = ertek.split(/\n+/).filter((s) => s.trim());
    return [
      new Paragraph({
        children: [
          new TextRun({ text: cim, bold: true, font: 'Times New Roman', size: 24 }),
        ],
        spacing: { before: 200, after: 80 },
      }),
      ...sorok.map(
        (s) =>
          new Paragraph({
            children: [new TextRun({ text: s, font: 'Times New Roman', size: 24 })],
            spacing: { after: 80 },
          }),
      ),
    ];
  };

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'Foglalkozás-tervezet', bold: true, font: 'Times New Roman', size: 32 }),
      ],
      spacing: { after: 240 },
    }),
    ...mezo('Az óvodapedagógus neve', foglalkozas.pedagogusNeve ?? beallitas?.pedagogusNeve),
    ...mezo('Helyszín', foglalkozas.helyszin ?? beallitas?.ovodaNeve),
    ...mezo('Időpont', foglalkozas.idopont),
    ...mezo('Csoport', foglalkozas.csoport ?? beallitas?.csoportNeve),
    ...mezo('Csoport típusa', foglalkozas.csoportTipus ?? beallitas?.csoportTipus),
    ...mezo('Tevékenységi forma', foglalkozas.tevekenysegiForma),
    ...mezo('Téma', foglalkozas.tema),
    ...mezo('Korcsoport', foglalkozas.korcsoport),
    ...mezo('Időtartam', foglalkozas.idotartam),
    ...blokk('Cél:', foglalkozas.cel),
    ...blokk('Feladat:', foglalkozas.feladat),
    ...blokk('Eszközök:', foglalkozas.eszkozok),
    ...blokk('Motiváció:', foglalkozas.motivacio),
    ...blokk('Fő rész:', foglalkozas.foRezz),
    ...blokk('Befejezés:', foglalkozas.befejezes),
    ...blokk('Munkaforma:', foglalkozas.munkaforma),
    ...blokk('Módszerek:', foglalkozas.modszerek),
    ...blokk('Differenciálás:', foglalkozas.differencialas),
    ...blokk('Képességfejlesztés:', foglalkozas.kepessegfejlesztes),
    ...blokk('Iskola előkészítő tevékenység:', foglalkozas.iskolaElokeszito),
  ];

  // PageBreak elkerülése — itt nem kell, csak elérhető
  void PageBreak;

  const doc = new Document({
    creator: beallitas?.pedagogusNeve ?? 'OvodaNapló',
    title: `Foglalkozás-tervezet — ${foglalkozas.tema}`,
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// ============================================================
// Projektterv DOCX (TODO-10 Stage B)
// ============================================================

interface ProjektDocxInput {
  projekt: Projekt;
  beallitas: Beallitas | null;
}

/**
 * Egy projektterv DOCX-be exportálása.
 * A `Könyv projektterv.docx` formátumot követi: cím, alapadatok kulcs-érték
 * párokban, majd pedagógiai szekciók blokkokban (cím + bekezdés/lista).
 *
 * 5 logikai szekció a UI-tagolásnak megfelelően:
 *  1. Alapadatok (cím, dátumok, téma, cél)
 *  2. Pedagógiai feladatok (4 dimenzió)
 *  3. Tevékenységek és szervezés
 *  4. Produktumok és eszközök
 *  5. Iskola előkészítő + szokások-hagyományok
 */
export async function projektToDocx(input: ProjektDocxInput): Promise<Buffer> {
  const { projekt, beallitas } = input;

  const mezo = (cimke: string, ertek: string | null | undefined): Paragraph[] => {
    if (!ertek) return [];
    return [
      new Paragraph({
        children: [
          new TextRun({ text: `${cimke}: `, bold: true, font: FONT, size: FONT_SIZE }),
          new TextRun({ text: ertek, font: FONT, size: FONT_SIZE }),
        ],
        spacing: { after: 80 },
      }),
    ];
  };

  const blokk = (cim: string, ertek: string | null | undefined): Paragraph[] => {
    if (!ertek) return [];
    const sorok = ertek.split(/\n+/).filter((s) => s.trim());
    return [
      new Paragraph({
        children: [
          new TextRun({ text: cim, bold: true, font: FONT, size: FONT_SIZE }),
        ],
        spacing: { before: 200, after: 80 },
      }),
      ...sorok.map(
        (s) =>
          new Paragraph({
            children: [new TextRun({ text: s, font: FONT, size: FONT_SIZE })],
            spacing: { after: 60 },
          }),
      ),
    ];
  };

  /** Szekció-fejléc (nagyobb, 14pt félkövér) */
  const szekcioFejlec = (cim: string): Paragraph =>
    new Paragraph({
      children: [new TextRun({ text: cim, bold: true, font: FONT, size: 28 })],
      spacing: { before: 300, after: 120 },
    });

  const children: Paragraph[] = [
    // Címsor: PROJEKTTERV — {cím}
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PROJEKTTERV', bold: true, font: FONT, size: 36 })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: projekt.cim, bold: true, font: FONT, size: 28 })],
      spacing: { after: 240 },
    }),

    // === 1. ALAPADATOK ===
    szekcioFejlec('1. Alapadatok'),
    ...mezo('Pedagógus', beallitas?.pedagogusNeve ?? null),
    ...mezo('Óvoda', beallitas?.ovodaNeve ?? null),
    ...mezo('Csoport', beallitas?.csoportNeve ?? null),
    ...mezo('Téma', projekt.tema),
    ...mezo('Kezdés', projekt.kezdoDatum),
    ...mezo('Befejezés', projekt.zaroDatum),
    ...blokk('Cél:', projekt.cel),

    // === 2. PEDAGÓGIAI FELADATOK ===
    szekcioFejlec('2. Pedagógiai feladatok'),
    ...blokk('Értelmi feladatok:', projekt.feladatErtelmi),
    ...blokk('Kommunikációs feladatok:', projekt.feladatKommunikacios),
    ...blokk('Erkölcsi-szociális feladatok:', projekt.feladatErkolcsi),
    ...blokk('Testi-egészségvédelmi feladatok:', projekt.feladatTesti),

    // === 3. TEVÉKENYSÉGEK ÉS SZERVEZÉS ===
    szekcioFejlec('3. Tevékenységek és szervezés'),
    ...blokk('Bevontak:', projekt.bevontak),
    ...blokk('Előkészületek:', projekt.elokeszuletek),
    ...blokk('Alkotó tevékenységek:', projekt.alkotoTevekenysegek),
    ...blokk('Játékok:', projekt.jatekok),
    ...blokk('Szabályok:', projekt.szabalyok),

    // === 4. PRODUKTUMOK ÉS ESZKÖZÖK ===
    szekcioFejlec('4. Produktumok és eszközök'),
    ...blokk('Gyermeki produktumok:', projekt.produktumokGyermeki),
    ...blokk('Pedagógusi produktumok:', projekt.produktumokPedagogusi),
    ...blokk('Munka jellegű tevékenységek:', projekt.munkaJellegu),
    ...blokk('Óvodapedagógus feladatai:', projekt.ovodapedagogusFeladatai),
    ...blokk('Eszközök:', projekt.eszkozok),

    // === 5. ISKOLA ELŐKÉSZÍTŐ + SZOKÁSOK ===
    szekcioFejlec('5. Iskola előkészítő + szokások-hagyományok'),
    ...blokk(
      'Iskola előkészítő tevékenységek (összesített):',
      projekt.iskolaElokeszitoOsszesitett,
    ),
    ...blokk('Szokások-hagyományok:', projekt.szokasokHagyomanyok),
  ];

  const doc = new Document({
    creator: beallitas?.pedagogusNeve ?? 'OvodaNapló',
    title: `Projektterv — ${projekt.cim}`,
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
