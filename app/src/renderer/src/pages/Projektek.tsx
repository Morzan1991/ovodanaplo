import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Projekt } from '@shared/schema';

export default function Projektek() {
  const [projektek, setProjektek] = useState<Projekt[]>([]);
  const [loading, setLoading] = useState(true);
  const [torles, setTorles] = useState<number | null>(null);

  useEffect(() => {
    void window.api.projektLista().then((arr) => {
      setProjektek(arr);
      setLoading(false);
    });
  }, []);

  async function torolProjekt(p: Projekt) {
    const megerosit = window.confirm(
      `Biztosan törlöd a(z) "${p.cim}" projektet?\n\nA kapcsolódó reflexiók is törlődnek. A heti tervek megmaradnak (csak a projekt-kapcsolat szűnik meg).`,
    );
    if (!megerosit) return;
    setTorles(p.id);
    try {
      await window.api.projektTorol(p.id);
      setProjektek((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      window.alert(`Hiba a törlés során: ${(e as Error).message}`);
    } finally {
      setTorles(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="heading-serif text-3xl font-medium">Projektek</h1>
          <p className="text-sm text-ink/60 mt-1">
            Több hetes átfogó témák (pl. „Olvasni jó", „Húsvét", „Ősz")
          </p>
        </div>
        <Link to="/projektek/uj" className="btn-primary text-sm">
          + Új projekt
        </Link>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-ink/50">Betöltés…</div>
      ) : projektek.length === 0 ? (
        <div className="card text-center py-12 text-ink/50">
          <div className="text-base mb-1">Még nincs projekt.</div>
          <div className="text-xs">
            Kattints a "+ Új projekt" gombra a részletes szerkesztő megnyitásához.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {projektek.map((p) => (
            <div key={p.id} className="card group">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium heading-serif text-lg truncate">{p.cim}</div>
                  <div className="text-xs text-ink/50 mt-0.5">
                    {p.kezdoDatum || '—'} {p.zaroDatum && `— ${p.zaroDatum}`}
                    {p.tema && <span className="ml-2 italic">{p.tema}</span>}
                  </div>
                  {p.cel && (
                    <p className="text-sm text-ink/70 mt-2 line-clamp-2">{p.cel}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <Link
                    to={`/projektek/${p.id}/szerkesztes`}
                    className="text-xs text-sage-700 hover:underline opacity-60 group-hover:opacity-100 transition"
                  >
                    ✏ Szerkesztés →
                  </Link>
                  <button
                    type="button"
                    onClick={() => void torolProjekt(p)}
                    disabled={torles === p.id}
                    className="text-xs text-red-600 hover:underline opacity-60 group-hover:opacity-100 transition disabled:opacity-30 disabled:cursor-wait"
                    title="Projekt törlése"
                  >
                    {torles === p.id ? '⏳ Törlés…' : '🗑 Törlés'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
