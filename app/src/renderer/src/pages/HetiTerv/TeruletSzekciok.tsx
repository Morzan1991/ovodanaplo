/**
 * TeruletSzekciok — a 7 (5 fő + 2 al) ONAP-területi szekció renderelése.
 *
 * - 5 fő-terület: kulso_vilag, verseles_meseles, rajzolas_festes, enek_zene, mozgas
 * - 2 al-terület: matematika (kulso_vilag alá), hallas_ritmus (enek_zene alá)
 *
 * Minden főterülethez:
 *   - cím + "💡 Ötletek" gomb
 *   - tartalom textarea VAGY IrodalomAutoComplete (verseles_meseles, enek_zene esetén)
 *   - al-szekciók (ha vannak)
 *   - "Iskola előkészítő tevékenység" collapsible textarea
 */

import type { TeruletTipus, IrodalomTipus } from '@shared/schema';
import type { TeruletAllapot, TeruletDefinicio } from './types';
import IrodalomAutoComplete from '../../components/IrodalomAutoComplete';

// Mely irodalom-típusok kapcsolódnak az adott területhez (autocomplete-szűréshez).
const IRODALOM_TIPUSOK_TERULETHEZ: Partial<Record<TeruletTipus, IrodalomTipus[]>> = {
  verseles_meseles: [
    'vers',
    'mese',
    'mondoka',
    'nepmese',
    'regeny',
    'verseskotet',
    'altato',
    'nepmonda',
    'talalos_kerdes',
  ],
  enek_zene: ['dal', 'zenehallgatas', 'koreplay'],
};

interface Props {
  definicio: TeruletDefinicio[];
  teruletAllapotok: TeruletAllapot[];
  onUpdate: (tipus: TeruletTipus, mezo: 'tartalom' | 'iskolaElokeszito', ertek: string) => void;
  onNyitOtletekPanel: (tipus: TeruletTipus) => void;
  korcsoport: string;
}

export default function TeruletSzekciok({
  definicio,
  teruletAllapotok,
  onUpdate,
  onNyitOtletekPanel,
  korcsoport,
}: Props) {
  const getTerulet = (tipus: TeruletTipus): TeruletAllapot =>
    teruletAllapotok.find((t) => t.tipus === tipus) ?? {
      tipus,
      tartalom: '',
      iskolaElokeszito: '',
    };

  return (
    <div className="space-y-4">
      {definicio
        .filter((d) => d.szint === 'fo')
        .map((d) => (
          <section key={d.tipus} className="terulet-szekcio">
            <div className="flex items-center justify-between mb-2">
              <h2 className="heading-serif text-lg font-medium">{d.cim}</h2>
              <button
                onClick={() => onNyitOtletekPanel(d.tipus)}
                className="text-xs px-2 py-1 rounded border border-sage-300 text-sage-700 hover:bg-sage-100 transition whitespace-nowrap"
                title="Tallózz a kapcsolódó sablonok között, és válassz ötleteket"
              >
                💡 Ötletek (10+)
              </button>
            </div>
            {IRODALOM_TIPUSOK_TERULETHEZ[d.tipus] ? (
              <IrodalomAutoComplete
                value={getTerulet(d.tipus).tartalom}
                onChange={(v) => onUpdate(d.tipus, 'tartalom', v)}
                rows={4}
                placeholder={d.placeholder}
                className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
                tipusok={IRODALOM_TIPUSOK_TERULETHEZ[d.tipus]!}
                korcsoport={korcsoport}
              />
            ) : (
              <textarea
                value={getTerulet(d.tipus).tartalom}
                onChange={(e) => onUpdate(d.tipus, 'tartalom', e.target.value)}
                rows={4}
                placeholder={d.placeholder}
                className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
              />
            )}

            {/* Al-szekciók (matematika a kulso_vilag alatt, hallas_ritmus az enek_zene alatt) */}
            {definicio
              .filter((al) => al.szuloTipus === d.tipus)
              .map((al) => (
                <div key={al.tipus} className="mt-3 pl-3 border-l-2 border-sage-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="field-label">{al.cim}</h3>
                    <button
                      onClick={() => onNyitOtletekPanel(al.tipus)}
                      className="text-[10px] px-2 py-0.5 rounded border border-sage-200 text-sage-700 hover:bg-sage-50"
                    >
                      💡 Ötletek
                    </button>
                  </div>
                  <textarea
                    value={getTerulet(al.tipus).tartalom}
                    onChange={(e) => onUpdate(al.tipus, 'tartalom', e.target.value)}
                    rows={2}
                    placeholder={al.placeholder}
                    className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition"
                  />
                </div>
              ))}

            {/* Iskola előkészítő tevékenység (collapsible) */}
            <details className="mt-2 group">
              <summary className="text-xs font-semibold text-sage-700 cursor-pointer hover:underline list-none">
                <span className="inline-block group-open:rotate-90 transition-transform">▸</span>{' '}
                Iskola előkészítő tevékenység
              </summary>
              <textarea
                value={getTerulet(d.tipus).iskolaElokeszito}
                onChange={(e) => onUpdate(d.tipus, 'iskolaElokeszito', e.target.value)}
                rows={3}
                placeholder="A területhez tartozó iskola-előkészítő képességek, soronként egy…"
                className="mt-1 w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
              />
            </details>
          </section>
        ))}
    </div>
  );
}
