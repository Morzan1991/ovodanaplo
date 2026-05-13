/**
 * MasolasModal — heti terv másolása korábbi hétről (TODO-9).
 *
 * Megjeleníti a legutóbbi 10 heti tervet, klikkre másolja a tartalmát egy új
 * heti tervre (a választott dátumokkal). A "(másolat)" prefix kerül a témára.
 */

import { useEffect, useState } from 'react';
import type { HetiTerv } from '@shared/schema';

interface Props {
  /** A new heti tervhez tervezett kezdő dátum (YYYY-MM-DD) */
  ujKezdoDatum: string;
  /** A new heti tervhez tervezett záró dátum (YYYY-MM-DD) */
  ujZaroDatum: string;
  /** A new nevelési év id (opcionális) — ha megadva, ez lesz a célhét nevelési éve */
  ujNevelesiEvId?: number | null;
  onBezar: () => void;
  /** Sikeres másolás után meghívva az új heti terv id-vel — a hívó navigál tovább */
  onMasolva: (ujId: number) => void;
}

export default function MasolasModal({
  ujKezdoDatum,
  ujZaroDatum,
  ujNevelesiEvId,
  onBezar,
  onMasolva,
}: Props) {
  const [tervek, setTervek] = useState<HetiTerv[]>([]);
  const [loading, setLoading] = useState(true);
  const [masolas, setMasolas] = useState<number | null>(null);

  useEffect(() => {
    void window.api.hetiTervLista().then((arr) => {
      // Csak a legfrissebb 10 (a `modositva` szerint csökkenő — a backend `letrehozva` szerint ad,
      // de azt is használjuk fallback-ben)
      const rendezett = [...arr].sort((a, b) => {
        const am = a.modositva ?? a.letrehozva ?? 0;
        const bm = b.modositva ?? b.letrehozva ?? 0;
        return bm - am;
      });
      setTervek(rendezett.slice(0, 10));
      setLoading(false);
    });
  }, []);

  async function masol(forrasId: number) {
    setMasolas(forrasId);
    try {
      const uj = await window.api.hetiTervMasolas({
        forrasHetiTervId: forrasId,
        ujKezdoDatum,
        ujZaroDatum,
        ujNevelesiEvId: ujNevelesiEvId ?? null,
      });
      onMasolva(uj.id);
    } catch (err) {
      console.error('Másolási hiba:', err);
      window.alert('Sikertelen másolás. Próbáld újra.');
      setMasolas(null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4"
      onClick={onBezar}
    >
      <div
        className="bg-cream rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-sage-200 bg-sage-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold">
                Másolás előző hétről
              </div>
              <h3 className="heading-serif text-lg">📋 Melyik tervet másolod?</h3>
              <div className="text-xs text-ink/60 mt-0.5">
                Az új heti terv ide kerül: <strong>{ujKezdoDatum}</strong> — <strong>{ujZaroDatum}</strong>.
                A téma elé "(másolat)" jelölés kerül.
              </div>
            </div>
            <button onClick={onBezar} className="text-ink/50 hover:text-ink text-2xl leading-none ml-2">
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <div className="text-center text-ink/50 py-8 italic">Betöltés…</div>
          ) : tervek.length === 0 ? (
            <div className="text-center text-ink/50 py-8 italic">
              Még nincs heti terv, amiből másolhatnál.
            </div>
          ) : (
            <ul className="space-y-1">
              {tervek.map((t) => {
                const folyamatban = masolas === t.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => masol(t.id)}
                      disabled={masolas !== null}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-sage-50 border border-transparent hover:border-sage-200 disabled:opacity-50 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-ink/90 truncate">
                          {t.tema ?? '(téma nélkül)'}
                        </span>
                        <span className="text-xs text-ink/50 whitespace-nowrap">
                          {t.kezdoDatum} — {t.zaroDatum}
                        </span>
                      </div>
                      {folyamatban && (
                        <div className="text-xs text-sage-700 mt-1 italic">Másolás folyamatban…</div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-sage-200 bg-sage-50/50 text-xs text-ink/60">
          A területek tartalma + iskola-előkészítő, a cél/feladat/eszközök és a téma másolódik.
          A reflexiók nem kerülnek át.
        </div>
      </div>
    </div>
  );
}
