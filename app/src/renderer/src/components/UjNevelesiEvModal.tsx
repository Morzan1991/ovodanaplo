/**
 * UjNevelesiEvModal — új nevelési év hozzáadása BÁRMIKOR (nem csak első indításkor).
 *
 * A Naptáron a fejlécben egy "+ Új év" gomb nyitja meg. Egy meglévő nevelési
 * év mellé jön létre egy újabb. Az új év aktívvá tehető (default: igen),
 * vagy passzívan is létrehozható (régi évek archív megőrzése).
 */

import { useState } from 'react';
import type { NevelesiEv } from '@shared/schema';
import { nevelesiEvCimke } from '../lib/utils';

interface Props {
  onBezar: () => void;
  /** Sikeres létrehozás után meghívva — a Naptar átvált az új évre */
  onLetrehozva: (ev: NevelesiEv) => void;
  /** Meglévő évek (kezdő-év szerinti duplikáció ellenőrzéséhez) */
  meglevoEvek: NevelesiEv[];
}

export default function UjNevelesiEvModal({ onBezar, onLetrehozva, meglevoEvek }: Props) {
  const aktualisEv = new Date().getFullYear();
  const [kezdoEv, setKezdoEv] = useState(aktualisEv);
  const [korcsoport, setKorcsoport] = useState<string>('vegyes');
  const [aktiv, setAktiv] = useState<boolean>(true);
  const [folyamatban, setFolyamatban] = useState(false);

  // A megengedett kezdő-évek: az aktuális + ±2 év a hibák elkerülésére
  const evek = [aktualisEv - 1, aktualisEv, aktualisEv + 1, aktualisEv + 2];

  // Duplikáció: nem lehet ugyanazzal a kezdő-évvel két nevelési év
  const mariLetezik = meglevoEvek.some(
    (ev) => parseInt(ev.kezdo.slice(0, 4), 10) === kezdoEv,
  );

  async function letrehoz() {
    if (mariLetezik) {
      window.alert(`A ${nevelesiEvCimke(kezdoEv)} nevelési év már létezik.`);
      return;
    }
    setFolyamatban(true);
    try {
      const ev = await window.api.nevelesiEvLetrehoz({
        nev: nevelesiEvCimke(kezdoEv),
        kezdo: `${kezdoEv}-09-01`,
        zaro: `${kezdoEv + 1}-06-30`,
        aktiv: aktiv ? 1 : 0,
        korcsoport,
      });
      onLetrehozva(ev);
    } catch (err) {
      console.error('Nevelési év létrehozási hiba:', err);
      window.alert('Sikertelen volt a létrehozás. Próbáld újra.');
      setFolyamatban(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4"
      onClick={onBezar}
    >
      <div
        className="bg-cream rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-sage-200 bg-sage-50 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold">
              Új nevelési év
            </div>
            <h3 className="heading-serif text-lg">+ Új év hozzáadása</h3>
          </div>
          <button onClick={onBezar} className="text-ink/50 hover:text-ink text-2xl leading-none ml-2">
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block text-sm">
            <span className="field-label block mb-1">Nevelési év kezdete</span>
            <select
              value={kezdoEv}
              onChange={(e) => setKezdoEv(Number(e.target.value))}
              className="w-full border border-sage-200 rounded px-3 py-2 text-base"
            >
              {evek.map((ev) => {
                const cimke = nevelesiEvCimke(ev);
                const letezik = meglevoEvek.some(
                  (m) => parseInt(m.kezdo.slice(0, 4), 10) === ev,
                );
                return (
                  <option key={ev} value={ev}>
                    {ev} szept — {ev + 1} jún ({cimke}){letezik ? ' — már létezik' : ''}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block text-sm">
            <span className="field-label block mb-1">Csoport korosztálya</span>
            <select
              value={korcsoport}
              onChange={(e) => setKorcsoport(e.target.value)}
              className="w-full border border-sage-200 rounded px-3 py-2 text-base"
            >
              <option value="vegyes">Vegyes csoport (3–7 éves)</option>
              <option value="kicsi">Kiscsoport (3–4 éves)</option>
              <option value="kozepso">Középső csoport (4–5 éves)</option>
              <option value="nagy">Nagycsoport (5–7 éves)</option>
            </select>
            <span className="text-xs text-ink/60 block mt-1 leading-snug">
              A korcsoport alapján szűrjük az ötletbörze-bulleteket. Évközben módosítható
              a Beállításokban.
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={aktiv}
              onChange={(e) => setAktiv(e.target.checked)}
              className="mt-1 accent-sage-500"
            />
            <span>
              <strong>Aktívvá tesszük</strong>
              <span className="block text-xs text-ink/60 leading-snug mt-0.5">
                Az aktív nevelési év jelenik meg alapból a Naptáron. Korábbi évek
                deaktiválódnak — de a tartalmuk megmarad, bármikor visszaválthatsz.
              </span>
            </span>
          </label>

          {mariLetezik && (
            <div className="text-xs text-red-600 italic">
              ⚠ Ez a nevelési év már létezik. Válassz másik kezdő évet.
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-sage-200 bg-sage-50/50 flex items-center justify-end gap-2">
          <button onClick={onBezar} className="btn-secondary text-sm" disabled={folyamatban}>
            Mégse
          </button>
          <button
            onClick={letrehoz}
            disabled={folyamatban || mariLetezik}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {folyamatban ? 'Létrehozás…' : '+ Létrehozás'}
          </button>
        </div>
      </div>
    </div>
  );
}
