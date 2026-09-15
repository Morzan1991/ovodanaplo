/**
 * Kereses — évek közötti full-text keresés (TODO-12).
 *
 * SQLite FTS5 virtuális táblát használ a `heti_terv_fts`-t, ami tartalmazza:
 *  - tema, cel, feladat, kepessegfejlesztes, eszkozok
 *  - teruletek_osszesen (a 7 terület tartalma + iskola-előkészítő, GROUP_CONCAT-tel)
 *
 * A `keresesHetiTervekben` IPC visszaadja a találatokat egy `snippet` mezővel,
 * ahol a találat környezete `<mark>`-okkal kiemelve.
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { HetiTerv } from '@shared/schema';

type Talalat = HetiTerv & { snippet: string };

/**
 * A találat-részlet biztonságos megjelenítése.
 *
 * Az FTS5 `snippet()` a talált szót `<mark>…</mark>` közé teszi, a részlet többi
 * része viszont a felhasználó SAJÁT, tetszőleges szövege — ami tartalmazhat HTML-t
 * is (pl. ha weboldalról másolt be valamit a heti tervbe). Ezért a szöveget nem
 * szabad HTML-ként értelmezni: React szövegcsomópontként rendereljük, amit a React
 * automatikusan escape-el, és csak a `<mark>` határolókat alakítjuk elemmé.
 */
function KiemeltReszlet({ snippet }: { snippet: string }) {
  const darabok = snippet.split(/(<mark>[\s\S]*?<\/mark>)/g);
  return (
    <>
      {darabok.map((darab, i) => {
        const talalat = /^<mark>([\s\S]*)<\/mark>$/.exec(darab);
        return talalat ? (
          <mark key={i} className="bg-mauve-200 text-mauve-800 px-0.5 rounded">
            {talalat[1]}
          </mark>
        ) : (
          <span key={i}>{darab}</span>
        );
      })}
    </>
  );
}

export default function Kereses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keresoSzoveg, setKeresoSzoveg] = useState(searchParams.get('q') ?? '');
  const [talalatok, setTalalatok] = useState<Talalat[]>([]);
  const [allapot, setAllapot] = useState<'tetlen' | 'keres' | 'kesz' | 'hiba'>('tetlen');

  useEffect(() => {
    const q = (searchParams.get('q') ?? '').trim();
    if (q.length < 2) {
      setTalalatok([]);
      setAllapot('tetlen');
      return;
    }
    setAllapot('keres');
    void window.api
      .keresesHetiTervekben(q)
      .then((arr) => {
        setTalalatok(arr);
        setAllapot('kesz');
      })
      .catch((err) => {
        console.error('Keresési hiba:', err);
        setAllapot('hiba');
      });
  }, [searchParams]);

  const indit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = keresoSzoveg.trim();
    if (q.length < 2) return;
    setSearchParams({ q });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="heading-serif text-3xl font-medium">🔍 Keresés</h1>
        <p className="text-sm text-ink/60 mt-1 max-w-2xl leading-relaxed">
        Kereső a korábbi heti terveid teljes szövegében — évekre visszamenőleg. Ha egy témát már kidolgoztál, itt megtalálod, és nem kell újra kitalálni.
      </p>
      </div>

      <form onSubmit={indit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={keresoSzoveg}
          onChange={(e) => setKeresoSzoveg(e.target.value)}
          placeholder="Keresési szó(k) — pl. mikulás, mese, ujjfestés…"
          autoFocus
          className="flex-1 border border-sage-200 rounded px-3 py-2 text-sm focus:border-sage-500 outline-none"
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={keresoSzoveg.trim().length < 2}
        >
          Keres
        </button>
      </form>

      {allapot === 'tetlen' && (
        <div className="card text-center py-12 text-ink/50">
          <div className="text-base">Adj meg legalább 2 karaktert a kereséshez.</div>
          <div className="text-xs mt-2">
            Tipp: a kereső prefix-egyezést is figyelembe veszi (pl. „mikul" → „mikulás"-t is megtalálja).
          </div>
        </div>
      )}
      {allapot === 'keres' && (
        <div className="card text-center py-12 text-ink/50 italic">Keresés…</div>
      )}
      {allapot === 'hiba' && (
        <div className="card text-center py-12 text-red-600">
          Keresési hiba történt. Próbáld újra.
        </div>
      )}
      {allapot === 'kesz' && talalatok.length === 0 && (
        <div className="card text-center py-12 text-ink/50 italic">
          Nincs találat a "{searchParams.get('q')}" keresésre.
        </div>
      )}
      {allapot === 'kesz' && talalatok.length > 0 && (
        <>
          <div className="text-sm text-ink/60 mb-3">
            <strong>{talalatok.length}</strong> találat (max 50, relevancia szerint).
          </div>
          <div className="space-y-3">
            {talalatok.map((t) => (
              <Link
                key={t.id}
                to={`/heti-terv/${t.id}`}
                className="card block hover:shadow-md hover:border-sage-200 transition"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="font-medium heading-serif text-lg truncate">
                    {t.tema ?? '(téma nélkül)'}
                  </div>
                  <div className="text-xs text-ink/50 whitespace-nowrap">
                    {t.kezdoDatum} — {t.zaroDatum}
                  </div>
                </div>
                <p className="text-sm text-ink/70 leading-snug">
                  <KiemeltReszlet snippet={t.snippet} />
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
