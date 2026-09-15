/**
 * Őrzi, hogy a játékleírások SAJÁT megfogalmazásban legyenek.
 *
 * ELŐZMÉNY: a játékok szabálya szó szerint a „Tappancs" kiadványból került az
 * ötletbankba és a sablonokba, a tördelési hibákkal együtt. A szerzői jog a
 * megfogalmazást védi, nem a játékot: a népi és óvodai játékok szabálya közkincs,
 * egy konkrét leírás viszont a szerzőé. A szövegeket a
 * `tools/jatek_ujrairas.py` cserélte le sajátra.
 *
 * Ez a teszt azért kell, mert a seed generált: ha valaki újrafuttat egy régi
 * kinyerő szkriptet, a kiadvány szövege NÉMÁN visszakerülne a programba.
 *
 * A vizsgálat csak a LEÍRÁST nézi, a gondolatjel utáni részt. A játék NEVE
 * maradhat az eredeti („Postásjáték", „Hármas cica"), mert egy cím önmagában nem
 * áll szerzői jogi védelem alatt, és a nevek amúgy is a néphagyományból valók.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const GYOKER = join(__dirname, '..', '..', '..', '..');
const SEED = join(GYOKER, 'seed');
const KORCSOPORTOK = ['kicsi', 'kozepso', 'nagy', 'vegyes'] as const;
const GONDOLATJEL = ' — ';

/** Ennyi egyező kezdőkarakternél már szó szerinti átvételről beszélünk. */
const EGYEZES_HOSSZ = 40;

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/** A sor leírás-része: ami a gondolatjel után áll. */
function leiras(sor: string): string {
  const i = sor.indexOf(GONDOLATJEL);
  return i < 0 ? '' : sor.slice(i + GONDOLATJEL.length);
}

/** A kiadványból kinyert leírások kezdete — ezeket keressük. */
function kiadvanyiKezdetek(): Map<string, string> {
  const nyers = JSON.parse(
    readFileSync(join(GYOKER, 'tools', 'tappancs-jatekok.json'), 'utf-8'),
  ) as Array<{ jatekok?: Array<{ nev: string; leiras?: string }> }>;
  const ki = new Map<string, string>();
  for (const lap of nyers) {
    for (const jatek of lap.jatekok ?? []) {
      const l = norm(jatek.leiras ?? '');
      if (l.length > EGYEZES_HOSSZ) ki.set(l.slice(0, EGYEZES_HOSSZ), jatek.nev);
    }
  }
  return ki;
}

/** Minden javaslatsor a seedből, a forrás megjelölésével. */
function osszesSor(): Array<{ forras: string; sor: string }> {
  const ki: Array<{ forras: string; sor: string }> = [];
  for (const kor of KORCSOPORTOK) {
    const bank = JSON.parse(
      readFileSync(join(SEED, `otletek-bank-${kor}.json`), 'utf-8'),
    ) as { temak: Record<string, Record<string, unknown>> };
    for (const [tema, teruletek] of Object.entries(bank.temak)) {
      for (const lista of Object.values(teruletek)) {
        if (!Array.isArray(lista)) continue;
        for (const sor of lista as string[]) ki.push({ forras: `${kor}/${tema}`, sor });
      }
    }
  }
  const sablonok = JSON.parse(
    readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8'),
  ) as { sablonok: Array<{ azonosito: string; teruletek: Record<string, string> }> };
  for (const s of sablonok.sablonok) {
    for (const szoveg of Object.values(s.teruletek)) {
      for (const sor of (szoveg ?? '').split('\n')) ki.push({ forras: s.azonosito, sor });
    }
  }
  return ki;
}

describe('játékleírások szerzői joga', () => {
  it('a kiadvány szövege nem kerül vissza a seedbe', () => {
    const kezdetek = kiadvanyiKezdetek();
    expect(kezdetek.size).toBeGreaterThan(100); // a kinyerés megvan-e egyáltalán

    const talalat: string[] = [];
    for (const { forras, sor } of osszesSor()) {
      const l = norm(leiras(sor));
      if (l.length < EGYEZES_HOSSZ) continue;
      for (const [kezdet, nev] of kezdetek) {
        if (l.includes(kezdet)) {
          talalat.push(`${forras}: „${nev}" leírása szó szerinti`);
          break;
        }
      }
    }
    expect(talalat).toEqual([]);
  });

  it('a lapfejlécekből lett álkategóriák nincsenek bent', () => {
    // A PDF-kinyerés a kiadvány lapfejléceit is játéknak vélte:
    // „FÖLD NAPJA — ÁPRILIS 22. RAJZOLÁS, FESTÉS, MINTÁZÁS, ÉNEK, ZENE,"
    const szemet = osszesSor().filter(({ sor }) =>
      /RAJZOL[ÁA]S, FEST[ÉE]S, MINT[ÁA]Z[ÁA]S/.test(sor),
    );
    expect(szemet.map((x) => `${x.forras}: ${x.sor}`)).toEqual([]);
  });
});
