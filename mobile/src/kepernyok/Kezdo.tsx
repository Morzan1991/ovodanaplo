/**
 * Kezdőképernyő: mi jön most.
 *
 * A LEGFELSŐ dolog az AKTUÁLIS HÉT — az óvónő hétben tervez, nem hónapban. A
 * kártya ugyanazt a hetet és témát mutatja, mint az asztali program heti terve
 * (lásd `lib/hetek.ts`), így a két felület nem mond mást ugyanarra a hétre.
 * Alatta marad a hónap többi témája, hogy előre is lehessen nézni.
 */

import { Link } from 'react-router-dom';
import Fejlec from '../reszek/Fejlec';
import { HONAP_NEV, KORCSOPORT_NEV, honapUnnepei, maiTemak } from '../lib/tartalom';
import { aktualisHet, hetIdoszak } from '../lib/hetek';
import { useAllapot } from '../lib/allapot';

export default function Kezdo() {
  const { korcsoport } = useAllapot();
  const het = aktualisHet();
  const { honap, temak } = maiTemak();
  const unnepek = honapUnnepei(honap);

  // A hét témáját a hónap listájában már nem ismételjük meg.
  const tovabbiTemak = temak.filter((t) => t.id !== het.tema?.id);

  return (
    <>
      <Fejlec cim="ÓvodaNapló" alcim={KORCSOPORT_NEV[korcsoport]} alcimUt="/beallitasok" />
      <div className="p-3 space-y-4">
        <section className="rounded-xl border border-rozsa-300 bg-rozsa-50 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-rozsa-700">
              {het.szunet ? 'A következő hét' : 'Ez a hét'}
            </h2>
            <span className="text-xs text-ink/55">
              {hetIdoszak(het.hetfo, het.pentek)} · {het.sorszam}/{het.osszesHet}. hét
            </span>
          </div>

          {het.tema ? (
            <Link
              to={`/tema/${het.tema.id}`}
              className="mt-2 block rounded-lg border border-rozsa-200 bg-white/80 p-2.5 active:bg-rozsa-100"
            >
              <p className="font-medium leading-snug text-rozsa-700">{het.tema.cim}</p>
              {het.tema.tema && (
                <p className="mt-0.5 text-xs text-ink/60">{het.tema.tema}</p>
              )}
            </Link>
          ) : (
            <p className="mt-2 text-sm text-ink/55">Ehhez a héthez nincs javasolt téma.</p>
          )}

          {het.unnepek.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {het.unnepek.map((u) => (
                <li key={u.nev} className="cimke bg-rozsa-200 text-rozsa-800">
                  {u.nap ? `${u.nap}. ` : ''}
                  {u.nev}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-serif text-xl text-rozsa-700">{HONAP_NEV[honap]}</h2>
          <p className="text-sm text-ink/60">
            {tovabbiTemak.length > 0
              ? `${tovabbiTemak.length} további téma ebben a hónapban`
              : 'Ez a hónap egyetlen témája'}
          </p>
          <ul className="mt-2 space-y-2">
            {tovabbiTemak.map((t) => (
              <li key={t.id}>
                <Link to={`/tema/${t.id}`} className="kartya block active:bg-rozsa-50">
                  <p className="font-medium leading-snug">{t.cim}</p>
                  {t.tema && <p className="mt-0.5 text-xs text-ink/60">{t.tema}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {unnepek.length > 0 && (
          <section>
            <h2 className="font-serif text-lg text-rozsa-700">A hónap jeles napjai</h2>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {unnepek.map((u, i) => (
                <li key={i} className="cimke bg-rozsa-100 text-rozsa-700">
                  {u.nap ? `${u.nap}. ` : ''}
                  {u.nev}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          to="/temak"
          className="erintheto justify-center w-full rounded-xl bg-rozsa-500 text-white font-medium"
        >
          Az egész év témái
        </Link>
      </div>
    </>
  );
}
