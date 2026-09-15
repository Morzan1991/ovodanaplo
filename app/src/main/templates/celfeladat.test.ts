/**
 * Őrzi, hogy a korcsoportos CÉL és FELADAT szövegek saját megfogalmazásban legyenek.
 *
 * ELŐZMÉNY: a heti tervek célja és feladata korcsoportonként szó szerint a
 * „Tappancs" kiadványból került a sablonokba, mintegy 95 ezer karakternyi
 * szöveg. A szerzői jog a megfogalmazást védi, a pedagógiai tartalmat nem: a
 * nevelési szándék szabadon leírható más szavakkal. A cserét a
 * `tools/cel_feladat_ujrairas.py` végezte.
 *
 * Ez a teszt azért kell, mert a seed generált: ha valaki újrafuttat egy régi
 * kinyerő szkriptet, a kiadvány szövege NÉMÁN visszakerülne a programba.
 *
 * A rövid szakkifejezéseket („számfogalom alakítása", „Törekedjenek a tiszta
 * munkavégzésre") szándékosan engedjük: azok a szakma közös szókincséhez
 * tartoznak, nem egyéni-eredeti szövegek. A küszöb ezért 45 karakter.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const GYOKER = join(__dirname, '..', '..', '..', '..');
const MEZOK = ['celKorcsoport', 'feladatKorcsoport', 'kepessegfejlesztesKorcsoport'] as const;

/** Ennél hosszabb egyező mondat már egyéni megfogalmazás, nem szakkifejezés. */
const HOSSZ_KUSZOB = 45;

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** A kiadványból kinyert teljes szöveg, egyetlen normalizált szövegtömbként. */
function kiadvanySzovege(): string {
  const nyers = JSON.parse(
    readFileSync(join(GYOKER, 'tools', 'tappancs-teljes.json'), 'utf-8'),
  ) as unknown;
  const darabok: string[] = [];
  const bejar = (x: unknown): void => {
    if (typeof x === 'string') darabok.push(x);
    else if (Array.isArray(x)) x.forEach(bejar);
    else if (x && typeof x === 'object') Object.values(x).forEach(bejar);
  };
  bejar(nyers);
  return norm(darabok.join(' \n '));
}

interface Sablon {
  azonosito: string;
  celKorcsoport?: Record<string, string>;
  feladatKorcsoport?: Record<string, string>;
  kepessegfejlesztesKorcsoport?: Record<string, string>;
}

function sablonok(): Sablon[] {
  return (
    JSON.parse(readFileSync(join(GYOKER, 'seed', 'weekly-templates.json'), 'utf-8')) as {
      sablonok: Sablon[];
    }
  ).sablonok;
}

describe('korcsoportos cél és feladat szerzői joga', () => {
  it('a kiadvány mondatai nem kerülnek vissza a sablonokba', () => {
    const kiadvany = kiadvanySzovege();
    expect(kiadvany.length).toBeGreaterThan(10000); // a kinyerés megvan-e egyáltalán

    const talalat: string[] = [];
    for (const s of sablonok()) {
      for (const mezo of MEZOK) {
        for (const [kor, szoveg] of Object.entries(s[mezo] ?? {})) {
          for (const mondat of szoveg.split(/(?<=[.!?])\s+/)) {
            const m = mondat.trim();
            if (m.length <= HOSSZ_KUSZOB) continue;
            if (kiadvany.includes(norm(m))) {
              talalat.push(`${s.azonosito}/${mezo}/${kor}: ${m.slice(0, 70)}…`);
            }
          }
        }
      }
    }
    expect(talalat).toEqual([]);
  });

  it('a PDF-kinyerés kettétört szavai nincsenek bent', () => {
    // A kinyerés a sorvégi elválasztásnál szóközt hagyott: „gyur mázás",
    // „felisme rése", „mes terek". Ezek a szövegeket olvashatatlanná tették.
    const gyanus = /\b(gyur mázás|felisme rése|mes terek|jele netek|je le netek|meglát tatá|ismer kedés|tudato sítás|Számfoga lom|alakítá sa|kü lönböző|elsajátítá sa|mozgásigé nyéből|körül mények|előse gítése)\b/i;
    const talalat: string[] = [];
    for (const s of sablonok()) {
      for (const mezo of MEZOK) {
        for (const [kor, szoveg] of Object.entries(s[mezo] ?? {})) {
          if (gyanus.test(szoveg)) talalat.push(`${s.azonosito}/${mezo}/${kor}`);
        }
      }
    }
    expect(talalat).toEqual([]);
  });

  it('minden korcsoportos szöveg érdemi hosszúságú maradt', () => {
    // A csere nem rövidíthette le a tartalmat: a pedagógus bővebb szöveget kért.
    const rovid: string[] = [];
    for (const s of sablonok()) {
      for (const mezo of ['celKorcsoport', 'feladatKorcsoport'] as const) {
        for (const [kor, szoveg] of Object.entries(s[mezo] ?? {})) {
          if (szoveg.trim().length < 100) rovid.push(`${s.azonosito}/${mezo}/${kor}`);
        }
      }
    }
    expect(rovid).toEqual([]);
  });
});
