import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { HetiTerv, Reflexio, TeruletTipus } from '@shared/schema';
import { vanAdatvedelmiKockazat } from '../lib/utils';

const TERULET_CIM: Record<TeruletTipus, string> = {
  kulso_vilag: 'Külső világ tevékeny megismerésére nevelés',
  matematika: 'Matematikai tartalom',
  verseles_meseles: 'Verselés, mesélés',
  rajzolas_festes: 'Rajzolás, festés, mintázás, kézimunka',
  enek_zene: 'Ének, zene, népi játék, tánc',
  hallas_ritmus: 'Hallás és ritmusérzék fejlesztés',
  mozgas: 'Mindennapos mozgás',
};

const TERULET_SORREND: TeruletTipus[] = [
  'kulso_vilag',
  'matematika',
  'verseles_meseles',
  'rajzolas_festes',
  'enek_zene',
  'mozgas',
];

export default function HetiReflexio() {
  const params = useParams<{ id: string }>();
  const hetiTervId = Number(params.id);

  const [terv, setTerv] = useState<HetiTerv | null>(null);
  const [reflexiok, setReflexiok] = useState<Map<TeruletTipus, Reflexio>>(new Map());
  const [tartalmak, setTartalmak] = useState<Map<TeruletTipus, string>>(new Map());
  const [mentes, setMentes] = useState<'idle' | 'mentes' | 'mentve' | 'hiba'>('idle');

  useEffect(() => {
    async function load() {
      const tervRow = await window.api.hetiTervBetolt(hetiTervId);
      setTerv(tervRow);
      const lista = await window.api.reflexioLista({ hetiTervId });
      const m = new Map<TeruletTipus, Reflexio>();
      const t = new Map<TeruletTipus, string>();
      for (const r of lista) {
        if (r.tipus === 'heti' && r.teruletTipus) {
          m.set(r.teruletTipus as TeruletTipus, r);
          t.set(r.teruletTipus as TeruletTipus, r.tartalom);
        }
      }
      setReflexiok(m);
      setTartalmak(t);
    }
    void load();
  }, [hetiTervId]);

  const mentTerulet = useCallback(
    async (tipus: TeruletTipus) => {
      const meglevo = reflexiok.get(tipus);
      const tartalom = tartalmak.get(tipus) ?? '';
      if (!tartalom.trim() && !meglevo) return; // ne mentsünk üres újat

      const result = await window.api.reflexioMent({
        ...(meglevo ? { id: meglevo.id } : {}),
        tipus: 'heti',
        hetiTervId,
        teruletTipus: tipus,
        tartalom,
      });
      const ujMap = new Map(reflexiok);
      ujMap.set(tipus, result);
      setReflexiok(ujMap);
    },
    [reflexiok, tartalmak, hetiTervId],
  );

  const mentMind = useCallback(async () => {
    setMentes('mentes');
    try {
      await Promise.all(TERULET_SORREND.map((t) => mentTerulet(t)));
      setMentes('mentve');
      setTimeout(() => setMentes('idle'), 1500);
    } catch (err) {
      console.error('Mentési hiba:', err);
      setMentes('hiba');
      setTimeout(() => setMentes('idle'), 3000);
    }
  }, [mentTerulet]);

  if (!terv) return <div className="p-8 text-center text-ink/50">Betöltés…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sage-700 mb-1">
            Heti reflexió • {terv.kezdoDatum} — {terv.zaroDatum}
          </div>
          <h1 className="heading-serif text-3xl font-medium">{terv.tema || 'Heti terv'}</h1>
          <p className="text-sm text-ink/60 mt-1">
            Területenként írd le, mi valósult meg, mi nem, és milyen tapasztalatok voltak.
          </p>
        </div>
        <Link to={`/heti-terv/${hetiTervId}`} className="text-sm text-ink/60 hover:text-ink whitespace-nowrap ml-4">
          ← Vissza a heti tervhez
        </Link>
      </div>

      <div className="space-y-5">
        {TERULET_SORREND.map((tipus) => {
          const tartalom = tartalmak.get(tipus) ?? '';
          const figyelmeztet = vanAdatvedelmiKockazat(tartalom);

          return (
            <section key={tipus} className="terulet-szekcio">
              <h2 className="heading-serif text-lg font-medium mb-2">{TERULET_CIM[tipus]}</h2>
              <textarea
                value={tartalom}
                onChange={(e) =>
                  setTartalmak((prev) => {
                    const next = new Map(prev);
                    next.set(tipus, e.target.value);
                    return next;
                  })
                }
                onBlur={() => mentTerulet(tipus)}
                rows={5}
                placeholder="Mi valósult meg? Mi nem és miért? Mi volt a gyermekek reakciója? Mit változtatnál legközelebb?"
                className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition"
              />
              {figyelmeztet && (
                <div className="mt-1 text-xs text-mauve-600 italic">
                  ⚠ Konkrét gyermek-utalás. „Egy fiú/lány" helyett: „több gyermek tapasztalata"
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-sage-100 flex items-center gap-2">
        <button onClick={mentMind} className="btn-primary">
          {mentes === 'mentes'
            ? 'Mentés…'
            : mentes === 'mentve'
              ? '✓ Mentve mind'
              : mentes === 'hiba'
                ? 'Mentési hiba'
                : 'Mentés (mindet)'}
        </button>
        <span className="text-xs text-ink/50 italic">
          (Az egyes mezők automatikusan mentődnek, amikor elhagyod őket)
        </span>
      </div>
    </div>
  );
}
