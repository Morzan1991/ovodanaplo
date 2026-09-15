/** Az összes téma a nevelési év sorrendjében, kereséssel. */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Fejlec from '../reszek/Fejlec';
import { HONAP_NEV, temakNevelesiEvSorrendben } from '../lib/tartalom';

export default function Temak() {
  const [kereses, setKereses] = useState('');
  const osszes = useMemo(() => temakNevelesiEvSorrendben(), []);

  const talalatok = useMemo(() => {
    const k = kereses.trim().toLowerCase();
    if (!k) return osszes;
    return osszes.filter(
      (t) =>
        t.cim.toLowerCase().includes(k) ||
        t.tema.toLowerCase().includes(k) ||
        t.cel.toLowerCase().includes(k),
    );
  }, [kereses, osszes]);

  // Hónap szerinti csoportosítás, a lista sorrendjét megtartva.
  const csoportok = useMemo(() => {
    const map = new Map<number, typeof talalatok>();
    for (const t of talalatok) {
      const h = t.honap ?? 0;
      if (!map.has(h)) map.set(h, []);
      map.get(h)!.push(t);
    }
    return [...map.entries()];
  }, [talalatok]);

  return (
    <>
      <Fejlec cim="Témák" alcim={`${osszes.length} téma a nevelési évben`} />
      <div className="p-3">
        <input
          value={kereses}
          onChange={(e) => setKereses(e.target.value)}
          placeholder="Keresés a témák között…"
          className="w-full rounded-xl border border-rozsa-200 bg-white px-3 py-2.5 text-[15px]"
        />

        {talalatok.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink/50">Nincs találat.</p>
        )}

        {csoportok.map(([honap, lista]) => (
          <section key={honap} className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-rozsa-700">
              {HONAP_NEV[honap] ?? 'Egyéb'}
            </h2>
            <ul className="mt-1.5 space-y-2">
              {lista.map((t) => (
                <li key={t.id}>
                  <Link to={`/tema/${t.id}`} className="kartya block active:bg-rozsa-50">
                    <p className="font-medium leading-snug">{t.cim}</p>
                    {t.tema && <p className="mt-0.5 text-xs text-ink/60">{t.tema}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
