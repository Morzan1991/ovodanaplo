/**
 * OsszegzoSzekcio — a heti terv lezáró összegzése.
 *
 * 6 mező: Cél / Feladat / Differenciálás / Módszerek / Képességfejlesztés / Eszközök.
 * Az Eszközöknél elérhető egy "↺ Auto-kitöltés a szövegekből" gomb, ha vannak
 * érzékelt eszköz-kulcsszavak a területek tartalmából.
 */

import type { HetiTervTeljes } from '../../../../preload/index';

type UpdateMezo =
  | 'cel'
  | 'feladat'
  | 'differencialas'
  | 'modszerek'
  | 'kepessegfejlesztes'
  | 'eszkozok';

interface Props {
  terv: Partial<HetiTervTeljes>;
  onUpdate: (mezo: UpdateMezo, value: string) => void;
  autoEszkozok: string[];
}

export default function OsszegzoSzekcio({ terv, onUpdate, autoEszkozok }: Props) {
  return (
    <section className="mt-8 pt-6 border-t border-sage-100">
      <h2 className="heading-serif text-lg font-medium mb-3">A heti terv összegzése</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="field-label block mb-1">Cél</label>
          <textarea
            value={terv.cel ?? ''}
            onChange={(e) => onUpdate('cel', e.target.value)}
            rows={3}
            className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
            placeholder="Mit szeretnél elérni ezen a héten?"
          />
        </div>
        <div>
          <label className="field-label block mb-1">Feladat</label>
          <textarea
            value={terv.feladat ?? ''}
            onChange={(e) => onUpdate('feladat', e.target.value)}
            rows={3}
            className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
            placeholder="Mi a konkrét feladat?"
          />
        </div>
        <div>
          <label className="field-label block mb-1">Differenciálás</label>
          <textarea
            value={terv.differencialas ?? ''}
            onChange={(e) => onUpdate('differencialas', e.target.value)}
            rows={2}
            className="w-full border border-sage-100 rounded p-2 text-xs italic text-ink/70 focus:border-sage-500 outline-none"
          />
        </div>
        <div>
          <label className="field-label block mb-1">Módszerek</label>
          <textarea
            value={terv.modszerek ?? ''}
            onChange={(e) => onUpdate('modszerek', e.target.value)}
            rows={2}
            className="w-full border border-sage-100 rounded p-2 text-xs italic text-ink/70 focus:border-sage-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label block mb-1">Képességfejlesztés</label>
        <textarea
          value={terv.kepessegfejlesztes ?? ''}
          onChange={(e) => onUpdate('kepessegfejlesztes', e.target.value)}
          rows={2}
          className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
          placeholder="finommotorika, szókincs, figyelem, emlékezet, …"
        />
      </div>

      <div className="mt-4">
        <label className="field-label block mb-1 flex items-center gap-2">
          Eszközök
          {autoEszkozok.length > 0 && (
            <button
              type="button"
              onClick={() => onUpdate('eszkozok', autoEszkozok.join(', '))}
              className="text-xs text-sage-700 font-normal normal-case tracking-normal hover:underline"
            >
              ↺ Auto-kitöltés a szövegekből ({autoEszkozok.length})
            </button>
          )}
        </label>
        <textarea
          value={terv.eszkozok ?? ''}
          onChange={(e) => onUpdate('eszkozok', e.target.value)}
          rows={2}
          className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
          placeholder="papír, színes ceruza, olló, ragasztó, hangszóró…"
        />
      </div>
    </section>
  );
}
