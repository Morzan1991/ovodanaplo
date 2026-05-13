import { useEffect, useState } from 'react';
import type { Reflexio } from '@shared/schema';

const TIPUS_CIMKE: Record<Reflexio['tipus'], string> = {
  foglalkozas: 'Foglalkozás',
  heti: 'Heti',
  projekt: 'Projekt',
};

export default function Reflexiok() {
  const [reflexiok, setReflexiok] = useState<Reflexio[]>([]);

  useEffect(() => {
    void window.api.reflexioLista().then(setReflexiok);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="heading-serif text-3xl font-medium">Reflexiók</h1>
        <p className="text-sm text-ink/60 mt-1">
          Foglalkozás-, heti- és projekt-szintű elemzések
        </p>
      </div>

      {reflexiok.length === 0 ? (
        <div className="card text-center py-12 text-ink/50">
          Még nincs reflexió. Először hozz létre heti terveket vagy foglalkozás-tervezeteket.
        </div>
      ) : (
        <div className="space-y-3">
          {reflexiok.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="pill">{TIPUS_CIMKE[r.tipus]}</span>
                <span className="text-xs text-ink/50">
                  {r.letrehozva ? new Date(r.letrehozva * 1000).toLocaleDateString('hu-HU') : ''}
                </span>
              </div>
              <p className="text-sm line-clamp-4">{r.tartalom}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
