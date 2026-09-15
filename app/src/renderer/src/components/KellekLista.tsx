/**
 * KellekLista — mit kell beszerezni a közelgő hetekre.
 *
 * Az eszközök eddig csak az egyes heti terveken belül látszottak, így a
 * pedagógusnak tervenként kellett visszakeresnie, mit hozzon otthonról vagy
 * mit kérjen a szülőktől. Ez a kártya a következő heteket egyben mutatja.
 */

import { useMemo, useState } from 'react';
import type { HetiTerv } from '@shared/schema';

interface Props {
  hetiTervek: HetiTerv[];
  /** Hány hétre előre nézzünk. */
  hetekSzama?: number;
}

/** Egy eszköz-mező szétbontása tételekre (soronként vagy vesszővel elválasztva). */
function tetelekre(szoveg: string | null | undefined): string[] {
  if (!szoveg) return [];
  return szoveg
    .split(/[\n;,]+/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ''))
    .filter((s) => s.length > 1);
}

export default function KellekLista({ hetiTervek, hetekSzama = 3 }: Props) {
  const [nyitva, setNyitva] = useState(false);

  const kozelgo = useMemo(() => {
    const ma = new Date();
    ma.setHours(0, 0, 0, 0);
    const hatar = new Date(ma);
    hatar.setDate(hatar.getDate() + hetekSzama * 7);

    return hetiTervek
      .filter((t) => {
        if (!t.kezdoDatum) return false;
        const d = new Date(t.kezdoDatum);
        return d >= ma && d <= hatar;
      })
      .sort((a, b) => (a.kezdoDatum ?? '').localeCompare(b.kezdoDatum ?? ''))
      .map((t) => ({
        datum: t.kezdoDatum!,
        tema: t.tema?.trim() || 'Heti terv',
        tetelek: tetelekre(t.eszkozok),
      }))
      .filter((x) => x.tetelek.length > 0);
  }, [hetiTervek, hetekSzama]);

  // Összesített, ismétlés nélküli lista — ezt viszi magával a boltba / kéri a szülőktől.
  const osszesites = useMemo(() => {
    const latott = new Map<string, string>();
    for (const het of kozelgo) {
      for (const t of het.tetelek) {
        const kulcs = t.toLocaleLowerCase('hu-HU');
        if (!latott.has(kulcs)) latott.set(kulcs, t);
      }
    }
    return [...latott.values()];
  }, [kozelgo]);

  if (kozelgo.length === 0) return null;

  return (
    <div className="card mb-6">
      <button
        type="button"
        onClick={() => setNyitva((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="field-label">
          🧺 Kellékek a következő {hetekSzama} hétre — {osszesites.length} tétel
        </span>
        <span className="text-xs text-sage-700">{nyitva ? 'elrejt' : 'mutasd'}</span>
      </button>

      {nyitva && (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <div className="field-label mb-1">Hetenként</div>
            <ul className="space-y-2 text-sm">
              {kozelgo.map((het) => (
                <li key={het.datum}>
                  <div className="font-medium">
                    {het.datum} — {het.tema}
                  </div>
                  <div className="text-ink/70">{het.tetelek.join(' · ')}</div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="field-label mb-1">Összesítve (bevásárláshoz)</div>
            <ul className="text-sm text-ink/80 leading-relaxed">
              {osszesites.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
