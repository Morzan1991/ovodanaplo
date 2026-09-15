/**
 * EsemenyModal — saját óvodai esemény felvitele a naptárba.
 *
 * A beépített 37 ünnep mellett minden óvodának megvannak a saját alkalmai:
 * nyílt nap, fotózás, színházlátogatás, kirándulás, az óvoda névnapja. Ezek
 * eddig csak az adatbázisban léteztek — felvinni nem lehetett őket, és a
 * naptárban sem jelentek meg.
 */

import { useState } from 'react';
import type { EsemenyTipus } from '@shared/schema';

const TIPUSOK: Array<{ ertek: EsemenyTipus; cimke: string }> = [
  { ertek: 'kirandulas', cimke: 'Kirándulás' },
  { ertek: 'vendeg', cimke: 'Vendég, előadás' },
  { ertek: 'szuloi', cimke: 'Szülői értekezlet' },
  { ertek: 'munkadelutan', cimke: 'Munkadélután' },
  { ertek: 'szuletesnap', cimke: 'Születésnap' },
  { ertek: 'unnep', cimke: 'Ünnep' },
  { ertek: 'egyeb', cimke: 'Egyéb' },
];

interface Props {
  /** Alapértelmezett dátum (a hónap, amelyikre kattintottak). */
  alapDatum: string;
  onMentes: (adat: { cim: string; datum: string; tipus: EsemenyTipus; leiras: string }) => Promise<void>;
  onBezar: () => void;
}

export default function EsemenyModal({ alapDatum, onMentes, onBezar }: Props) {
  const [cim, setCim] = useState('');
  const [datum, setDatum] = useState(alapDatum);
  const [tipus, setTipus] = useState<EsemenyTipus>('kirandulas');
  const [leiras, setLeiras] = useState('');
  const [mentes, setMentes] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);

  async function ment() {
    if (!cim.trim()) {
      setHiba('Adj nevet az eseménynek.');
      return;
    }
    setMentes(true);
    setHiba(null);
    try {
      await onMentes({ cim: cim.trim(), datum, tipus, leiras: leiras.trim() });
      onBezar();
    } catch (e) {
      setHiba(`Nem sikerült menteni: ${(e as Error).message}`);
      setMentes(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4"
      onClick={onBezar}
    >
      <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="heading-serif text-xl font-medium mb-1">Saját esemény</h2>
        <p className="text-sm text-ink/60 mb-4">
          Ami csak a ti óvodátokban van — nyílt nap, fotózás, színház, kirándulás.
        </p>

        <label className="block text-sm mb-3">
          <span className="field-label block mb-1">Esemény neve</span>
          <input
            autoFocus
            value={cim}
            onChange={(e) => setCim(e.target.value)}
            placeholder="pl. Nyílt nap a szülőknek"
            className="w-full border border-sage-200 rounded px-3 py-2 text-base"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block text-sm">
            <span className="field-label block mb-1">Dátum</span>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full border border-sage-200 rounded px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm">
            <span className="field-label block mb-1">Típus</span>
            <select
              value={tipus}
              onChange={(e) => setTipus(e.target.value as EsemenyTipus)}
              className="w-full border border-sage-200 rounded px-3 py-2 text-base"
            >
              {TIPUSOK.map((t) => (
                <option key={t.ertek} value={t.ertek}>
                  {t.cimke}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm mb-4">
          <span className="field-label block mb-1">Megjegyzés (nem kötelező)</span>
          <textarea
            value={leiras}
            onChange={(e) => setLeiras(e.target.value)}
            rows={2}
            placeholder="pl. 9 órától, a tornateremben"
            className="w-full border border-sage-200 rounded px-3 py-2 text-sm"
          />
        </label>

        {hiba && <p className="text-sm text-terra-600 mb-3">{hiba}</p>}

        <div className="flex gap-2">
          <button onClick={ment} disabled={mentes} className="btn-primary">
            {mentes ? 'Mentés…' : 'Mentés'}
          </button>
          <button onClick={onBezar} className="btn-secondary">
            Mégse
          </button>
        </div>
      </div>
    </div>
  );
}
