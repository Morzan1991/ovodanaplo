import { useEffect, useState } from 'react';
import type { Projekt } from '@shared/schema';

export default function Projektek() {
  const [projektek, setProjektek] = useState<Projekt[]>([]);

  useEffect(() => {
    void window.api.projektLista().then(setProjektek);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="heading-serif text-3xl font-medium">Projektek</h1>
        <p className="text-sm text-ink/60 mt-1">
          Több hetes átfogó témák (pl. „Olvasni jó", „Húsvét", „Ősz")
        </p>
      </div>

      {projektek.length === 0 ? (
        <div className="card text-center py-12 text-ink/50">
          Még nincs projekt. (A részletes projekt-szerkesztő a következő ciklusban érkezik.)
        </div>
      ) : (
        <div className="space-y-3">
          {projektek.map((p) => (
            <div key={p.id} className="card">
              <div className="font-medium">{p.cim}</div>
              <div className="text-xs text-ink/50 mt-1">
                {p.kezdoDatum} — {p.zaroDatum}
              </div>
              {p.cel && <p className="text-sm text-ink/70 mt-2 line-clamp-2">{p.cel}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
