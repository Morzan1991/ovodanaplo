import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Reflexio } from '@shared/schema';

const TIPUS_CIMKE: Record<Reflexio['tipus'], string> = {
  foglalkozas: 'Foglalkozás',
  heti: 'Heti',
  projekt: 'Projekt',
};

type Szuro = 'mind' | Reflexio['tipus'];

const SZURO_GOMBOK: Array<{ ertek: Szuro; cimke: string }> = [
  { ertek: 'mind', cimke: 'Mind' },
  { ertek: 'heti', cimke: 'Heti' },
  { ertek: 'foglalkozas', cimke: 'Foglalkozás' },
  { ertek: 'projekt', cimke: 'Projekt' },
];

/**
 * Egy adott reflexióhoz visszaadja a szerkesztő-link célját.
 * - heti: /heti-terv/{hetiTervId}/reflexio (a dedikált területenkénti szerkesztő)
 * - foglalkozas: /foglalkozas/{foglalkozasId} (a tervezet — itt látszik a kontextus,
 *   ahonnan a reflexió szövegét vissza lehet vinni)
 * - projekt: /projektek/{projektId}
 */
function szerkesztoLink(r: Reflexio): string | null {
  if (r.tipus === 'heti' && r.hetiTervId) {
    return `/heti-terv/${r.hetiTervId}/reflexio`;
  }
  if (r.tipus === 'foglalkozas' && r.foglalkozasId) {
    return `/foglalkozas/${r.foglalkozasId}`;
  }
  if (r.tipus === 'projekt' && r.projektId) {
    return `/projektek/${r.projektId}`;
  }
  return null;
}

export default function Reflexiok() {
  const [reflexiok, setReflexiok] = useState<Reflexio[]>([]);
  const [szuro, setSzuro] = useState<Szuro>('mind');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void window.api.reflexioLista().then((arr) => {
      setReflexiok(arr);
      setLoading(false);
    });
  }, []);

  // Szűrt + dátum-csökkenő sorrendben rendezett lista
  const szurtek = useMemo(() => {
    const lista = szuro === 'mind' ? reflexiok : reflexiok.filter((r) => r.tipus === szuro);
    return [...lista].sort((a, b) => (b.modositva ?? b.letrehozva ?? 0) - (a.modositva ?? a.letrehozva ?? 0));
  }, [reflexiok, szuro]);

  // Tipus-szerinti darabszámok a szűrő-gombhoz
  const szamlalo = useMemo(() => {
    const sz: Record<string, number> = { mind: reflexiok.length };
    for (const r of reflexiok) sz[r.tipus] = (sz[r.tipus] ?? 0) + 1;
    return sz;
  }, [reflexiok]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="heading-serif text-3xl font-medium">Reflexiók</h1>
        <p className="text-sm text-ink/60 mt-1">
          Foglalkozás-, heti- és projekt-szintű elemzések. Klikk a "Szerkesztés"-re a tartalom módosításához.
        </p>
      </div>

      {/* Szűrő gombok */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SZURO_GOMBOK.map((g) => (
          <button
            key={g.ertek}
            onClick={() => setSzuro(g.ertek)}
            className={szuro === g.ertek ? 'btn-ghost-active' : 'btn-ghost'}
          >
            {g.cimke} ({szamlalo[g.ertek] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12 text-ink/50">Betöltés…</div>
      ) : reflexiok.length === 0 ? (
        <div className="card text-center py-12 text-ink/50">
          <div className="text-base mb-1">Még nincs reflexió.</div>
          <div className="text-xs">
            Először hozz létre heti terveket vagy foglalkozás-tervezeteket, majd kattints a
            "Reflexió" gombra az adott tervnél.
          </div>
        </div>
      ) : szurtek.length === 0 ? (
        <div className="card text-center py-12 text-ink/50 italic">
          Nincs „{SZURO_GOMBOK.find((s) => s.ertek === szuro)?.cimke ?? szuro}" típusú reflexió.
        </div>
      ) : (
        <div className="space-y-3">
          {szurtek.map((r) => {
            const link = szerkesztoLink(r);
            return (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="pill">{TIPUS_CIMKE[r.tipus]}</span>
                    {r.teruletTipus && (
                      <span className="text-[10px] uppercase tracking-wider text-ink/50">
                        {r.teruletTipus}
                      </span>
                    )}
                    <span className="text-xs text-ink/50">
                      {r.letrehozva
                        ? new Date(r.letrehozva * 1000).toLocaleDateString('hu-HU')
                        : ''}
                    </span>
                    {r.modositva && r.modositva !== r.letrehozva && (
                      <span className="text-xs text-ink/40 italic">
                        szerk.: {new Date(r.modositva * 1000).toLocaleDateString('hu-HU')}
                      </span>
                    )}
                  </div>
                  {link ? (
                    <Link
                      to={link}
                      className="text-xs text-sage-700 hover:underline whitespace-nowrap"
                      title={
                        r.tipus === 'heti'
                          ? 'Heti reflexió szerkesztése területenként'
                          : r.tipus === 'foglalkozas'
                            ? 'Forrás foglalkozás-tervezet megnyitása'
                            : 'Forrás projekt megnyitása'
                      }
                    >
                      ✏ Szerkesztés →
                    </Link>
                  ) : (
                    <span className="text-xs text-ink/40 italic">forrás nincs</span>
                  )}
                </div>
                <p className="text-sm line-clamp-4 whitespace-pre-line">{r.tartalom}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
