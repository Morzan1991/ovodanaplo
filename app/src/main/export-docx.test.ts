/**
 * A Word-export ellenőrzése — VALÓDI .docx fájlt állít elő és belenéz.
 *
 * Miért kell: a felület korcsoport szerint elrejti az „Iskola-előkészítő
 * tevékenység” részt, a letöltött Word-fájlból viszont sokáig NEM maradt ki.
 * Ez azért volt kellemetlen, mert épp a Word-fájl az, ami az oviKRÉTA-ba
 * feltöltésre és a vezetőnek bemutatásra kerül.
 *
 * A teszt mindhárom exportot (heti terv, foglalkozás-tervezet, projektterv)
 * kicsomagolja és a dokumentum szövegében keres.
 */

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { hetiTervToDocx, foglalkozasToDocx, projektToDocx } from './export-docx.js';
import type {
  Beallitas,
  HetiTerv,
  Terulet,
  FoglalkozasTervezet,
  Projekt,
} from '../shared/schema.js';

const ISKOLA = 'Iskola-előkészítő';

/** A .docx egy ZIP — a szöveg a word/document.xml-ben van. */
async function docxSzovege(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml')!.async('string');
  // A címkék közötti szöveget hagyjuk meg, hogy egyszerűen kereshessünk benne.
  return xml.replace(/<[^>]+>/g, ' ');
}

function beallitas(csoportTipus: string): Beallitas {
  return {
    id: 1,
    pedagogusNeve: 'Teszt Óvó Néni',
    ovodaNeve: 'Teszt Óvoda',
    ovodaCime: null,
    csoportNeve: 'Katica',
    csoportTipus,
    utolsoBackup: null,
    themeAccent: 'osz',
  } as Beallitas;
}

const HETI_TERV = {
  id: 1,
  nevelesiEvId: 1,
  kezdoDatum: '2026-09-07',
  zaroDatum: '2026-09-11',
  hetSzama: 1,
  tema: 'Ősz kezdete',
  cel: 'Cél szövege',
  feladat: 'Feladat szövege',
  differencialas: null,
  modszerek: null,
  kepessegfejlesztes: null,
  eszkozok: null,
  sablonAzonosito: null,
} as unknown as HetiTerv;

const TERULETEK = [
  {
    id: 1,
    hetiTervId: 1,
    tipus: 'kulso_vilag',
    tartalom: 'Őszi gyümölcsök megismerése',
    iskolaElokeszito: 'Számfogalom előkészítése',
    sorrend: 0,
  },
] as unknown as Terulet[];

const FOGLALKOZAS = {
  id: 1,
  hetiTervId: 1,
  tema: 'Őszi gyümölcsök',
  tevekenysegTipus: 'kulso_vilag',
  cel: 'Cél',
  feladat: 'Feladat',
  eszkozok: null,
  motivacio: null,
  foRezz: null,
  befejezes: null,
  munkaforma: null,
  modszerek: null,
  differencialas: null,
  kepessegfejlesztes: null,
  iskolaElokeszito: 'Sorrendezés, számlálás',
  korcsoport: null,
  csoportTipus: null,
} as unknown as FoglalkozasTervezet;

const PROJEKT = {
  id: 1,
  nevelesiEvId: 1,
  cim: 'Őszi projekt',
  kezdoDatum: '2026-09-07',
  zaroDatum: '2026-09-25',
  cel: 'Cél',
  tema: 'Ősz',
  iskolaElokeszitoOsszesitett: 'Iskolára hangoló feladatok',
  szokasokHagyomanyok: 'Szüreti szokások',
} as unknown as Projekt;

describe('Word-export: az iskola-előkészítő korosztály szerint', () => {
  it('HETI TERV — középső csoportban NINCS benne', async () => {
    const szoveg = await docxSzovege(
      await hetiTervToDocx({
        hetiTerv: HETI_TERV,
        teruletek: TERULETEK,
        beallitas: beallitas('kozepso'),
      }),
    );
    expect(szoveg).not.toContain(ISKOLA);
    expect(szoveg).toContain('Őszi gyümölcsök megismerése'); // a többi tartalom megvan
  });

  it('HETI TERV — kiscsoportban sincs benne', async () => {
    const szoveg = await docxSzovege(
      await hetiTervToDocx({
        hetiTerv: HETI_TERV,
        teruletek: TERULETEK,
        beallitas: beallitas('kicsi'),
      }),
    );
    expect(szoveg).not.toContain(ISKOLA);
  });

  it('HETI TERV — nagycsoportban BENNE van', async () => {
    const szoveg = await docxSzovege(
      await hetiTervToDocx({
        hetiTerv: HETI_TERV,
        teruletek: TERULETEK,
        beallitas: beallitas('nagy'),
      }),
    );
    expect(szoveg).toContain(ISKOLA);
    expect(szoveg).toContain('Számfogalom előkészítése');
  });

  it('FOGLALKOZÁS-TERVEZET — középső csoportban nincs benne', async () => {
    const szoveg = await docxSzovege(
      await foglalkozasToDocx({ foglalkozas: FOGLALKOZAS, beallitas: beallitas('kozepso') }),
    );
    expect(szoveg).not.toContain(ISKOLA);
    expect(szoveg).toContain('Őszi gyümölcsök');
  });

  it('FOGLALKOZÁS-TERVEZET — nagycsoportban benne van', async () => {
    const szoveg = await docxSzovege(
      await foglalkozasToDocx({ foglalkozas: FOGLALKOZAS, beallitas: beallitas('nagy') }),
    );
    expect(szoveg).toContain(ISKOLA);
  });

  it('PROJEKTTERV — középső csoportban nincs benne, de a szokások megmaradnak', async () => {
    const szoveg = await docxSzovege(
      await projektToDocx({ projekt: PROJEKT, beallitas: beallitas('kozepso') }),
    );
    expect(szoveg).not.toContain(ISKOLA);
    expect(szoveg).toContain('Szüreti szokások');
  });

  it('PROJEKTTERV — nagycsoportban benne van', async () => {
    const szoveg = await docxSzovege(
      await projektToDocx({ projekt: PROJEKT, beallitas: beallitas('nagy') }),
    );
    expect(szoveg).toContain(ISKOLA);
  });

  it('beállítás nélkül (ismeretlen korosztály) inkább megjelenik', async () => {
    const szoveg = await docxSzovege(
      await hetiTervToDocx({ hetiTerv: HETI_TERV, teruletek: TERULETEK, beallitas: null }),
    );
    expect(szoveg).toContain(ISKOLA);
  });
});
