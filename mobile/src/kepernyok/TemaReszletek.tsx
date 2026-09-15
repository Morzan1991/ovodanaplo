/**
 * Egy téma részletei: a hét ONAP-terület javaslatai a választott korosztályra.
 *
 * ÁTLÁTHATÓSÁG: az asztali programban a hét terület egyszerre látszik egy lapon.
 * Telefonon ez nem fér ki, de a LISTÁJUKNAK ki kell férnie — ezért az összecsukott
 * területek egysoros tételek vékony elválasztóval, nem külön dobozok. Így a
 * képernyő tetején egyben ott a téma teljes szerkezete: melyik területen hány
 * javaslat van. A „Mind" gombbal egy koppintással kinyitható az egész.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Fejlec from '../reszek/Fejlec';
import JavaslatSor from '../reszek/JavaslatSor';
import {
  KORCSOPORT_NEV,
  TERULETEK,
  otletbank,
  temaAzonositoval,
  type Korcsoport,
} from '../lib/tartalom';
import { useAllapot } from '../lib/allapot';

const ALAPBOL_NYITVA = ['verseles_meseles', 'enek_zene'];

export default function TemaReszletek() {
  const { id = '' } = useParams();
  const { korcsoport } = useAllapot();
  const tema = temaAzonositoval(id);

  const [bank, setBank] = useState<Record<string, string[]> | null>(null);
  const [nyitott, setNyitott] = useState<Set<string>>(new Set(ALAPBOL_NYITVA));

  useEffect(() => {
    let ervenyes = true;
    setBank(null);
    void otletbank(korcsoport).then((teljes) => {
      if (ervenyes) setBank(teljes[id] ?? {});
    });
    return () => {
      ervenyes = false;
    };
  }, [id, korcsoport]);

  // Csak azok a területek jelennek meg, amelyekhez tényleg van anyag.
  const teruletek = useMemo(
    () => (bank ? TERULETEK.filter((t) => (bank[t.id] ?? []).length > 0) : []),
    [bank],
  );
  const mindNyitva = teruletek.length > 0 && teruletek.every((t) => nyitott.has(t.id));

  if (!tema) {
    return (
      <>
        <Fejlec cim="Ismeretlen téma" vissza />
        <p className="p-4 text-sm text-ink/60">Ez a téma nem található.</p>
      </>
    );
  }

  // A cél és a feladat korosztályonként külön is meg van fogalmazva; ha van
  // ilyen, azt mutatjuk — vegyes csoportnál marad az átfogó szöveg.
  const kor = korcsoport as Korcsoport;
  const cel = (kor !== 'vegyes' && tema.celKor[kor]) || tema.cel;
  const feladat = (kor !== 'vegyes' && tema.feladatKor[kor]) || tema.feladat;
  const kepessegek = (kor !== 'vegyes' && tema.kepessegKor[kor]) || tema.kepessegek;

  const valt = (kulcs: string) =>
    setNyitott((elozo) => {
      const uj = new Set(elozo);
      if (uj.has(kulcs)) uj.delete(kulcs);
      else uj.add(kulcs);
      return uj;
    });

  const mindValt = () =>
    setNyitott(mindNyitva ? new Set() : new Set(teruletek.map((t) => t.id)));

  /** Egysoros, összecsukható szakasz-fejléc. */
  const Szakasz = ({
    kulcs,
    nev,
    darab,
    children,
  }: {
    kulcs: string;
    nev: string;
    darab?: number;
    children: React.ReactNode;
  }) => {
    const nyitva = nyitott.has(kulcs);
    return (
      <section className="border-b border-rozsa-200 last:border-0">
        <button
          onClick={() => valt(kulcs)}
          aria-expanded={nyitva}
          className="flex w-full items-center gap-2 py-2.5 text-left"
        >
          <span className="w-4 shrink-0 text-center text-ink/35">{nyitva ? '−' : '+'}</span>
          <span className="flex-1 font-medium text-rozsa-700">{nev}</span>
          {darab !== undefined && <span className="text-xs text-ink/40">{darab}</span>}
        </button>
        {nyitva && <div className="pb-2 pl-6">{children}</div>}
      </section>
    );
  };

  return (
    <>
      <Fejlec cim={tema.cim} alcim={KORCSOPORT_NEV[korcsoport]} alcimUt="/beallitasok" vissza />

      <div className="flex items-center justify-between px-3 pt-2">
        <p className="text-xs text-ink/55">{tema.tema}</p>
        {teruletek.length > 0 && (
          <button onClick={mindValt} className="shrink-0 text-xs text-rozsa-700 underline">
            {mindNyitva ? 'Mind becsuk' : 'Mind kinyit'}
          </button>
        )}
      </div>

      <div className="px-3 pb-4">
        {bank === null && <p className="py-8 text-center text-sm text-ink/50">Betöltés…</p>}

        {bank !== null && (
          <>
            {(cel || feladat) && (
              <Szakasz kulcs="cel" nev="Cél és feladat">
                <div className="space-y-2 text-sm leading-relaxed">
                  {cel && (
                    <p>
                      <span className="font-medium">Cél: </span>
                      {cel}
                    </p>
                  )}
                  {feladat && (
                    <p>
                      <span className="font-medium">Feladat: </span>
                      {feladat}
                    </p>
                  )}
                  {kepessegek && (
                    <p className="text-ink/70">
                      <span className="font-medium">Fejlesztési területek: </span>
                      {kepessegek}
                    </p>
                  )}
                </div>
              </Szakasz>
            )}

            {teruletek.map((t) => (
              <Szakasz key={t.id} kulcs={t.id} nev={t.nev} darab={(bank[t.id] ?? []).length}>
                <ul>
                  {(bank[t.id] ?? []).map((sor) => (
                    <JavaslatSor key={sor} sor={sor} />
                  ))}
                </ul>
              </Szakasz>
            ))}

            {teruletek.length === 0 && (
              <p className="py-8 text-center text-sm text-ink/50">
                Ehhez a témához ehhez a korosztályhoz még nincs anyag.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
