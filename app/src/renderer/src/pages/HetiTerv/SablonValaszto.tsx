/**
 * SablonValaszto — sablon-választó kártya + "Sablon alkalmazva" banner.
 *
 * Két összetevő egy fájlban (kis, szorosan kapcsolódó komponensek):
 *
 * 1. SablonValaszto — a sablon-választó kártya, ami:
 *    - ÚJ tervnél a sablonHasznalva=false állapotban látszik (kezdő üdvözlés)
 *    - MEGLÉVŐ tervnél (params.id van) MINDIG látszik — bármikor lehet váltani
 *
 * 2. SablonBanner — a "✓ Sablon alkalmazva" zöld banner, ami CSAK új tervnél
 *    jelenik meg a sablonHasznalva=true állapotban. Lehet "Üres tervezet ⊗"
 *    gombbal visszaállítani a kezdő állapotra.
 */

import type { SablonMeta } from './types';

const HONAPOK = [
  '',
  'Jan',
  'Feb',
  'Már',
  'Ápr',
  'Máj',
  'Jún',
  'Júl',
  'Aug',
  'Szep',
  'Okt',
  'Nov',
  'Dec',
];

interface SablonValasztoProps {
  sablonok: SablonMeta[];
  sablonHasznalva: boolean;
  /** params.id — meglévő terv azonosító (vagy undefined új tervnél) */
  paramsId: string | undefined;
  aktualisSablonAzonosito: string | null;
  onSablonValasztas: (azonosito: string) => void;
  /** "Üres tervezet" gomb — setSablonHasznalva(true) callback */
  onUres: () => void;
}

export function SablonValaszto({
  sablonok,
  sablonHasznalva,
  paramsId,
  aktualisSablonAzonosito,
  onSablonValasztas,
  onUres,
}: SablonValasztoProps) {
  // Megjelenítési feltétel:
  // - Új tervnél: csak amíg nem alkalmaztak sablont (sablonHasznalva = false)
  // - Meglévő tervnél: MINDIG látszik (hogy bármikor lehessen másikat választani)
  if (sablonok.length === 0) return null;
  if (!paramsId && sablonHasznalva) return null;

  return (
    <div className="mb-6 p-4 rounded-lg border border-mauve-200 bg-mauve-100/30">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-sm">
          <div className="font-semibold text-mauve-700">
            {paramsId ? '🔄 Sablon alkalmazása' : '✨ Sablonból indulnál?'}
          </div>
          <div className="text-xs text-ink/70 mt-0.5">
            {paramsId
              ? 'Felülírhatod a meglévő tartalmat egy sablonnal — konfirmációt kérünk.'
              : 'Választhatsz egy előre elkészített témából — a saját doksijaid + 15 magyar ünnep alapján.'}
          </div>
        </div>
        <select
          value={aktualisSablonAzonosito ?? ''}
          onChange={(e) => onSablonValasztas(e.target.value)}
          className="ml-auto border border-mauve-300 rounded px-3 py-2 text-sm bg-white min-w-[280px]"
        >
          <option value="" disabled>
            — Válassz sablont —
          </option>
          {/* Iskolai év sorrendben: szept-jún */}
          {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].flatMap((h) => {
            const csoport = sablonok
              .filter((s) => s.javasoltHonap === h)
              .sort((a, b) => {
                const sa = a.javasoltSorrend ?? 99;
                const sb = b.javasoltSorrend ?? 99;
                if (sa !== sb) return sa - sb;
                const va = a.verzio ?? 0;
                const vb = b.verzio ?? 0;
                return va - vb;
              });
            if (csoport.length === 0) return [];
            return [
              <optgroup key={h} label={HONAPOK[h]}>
                {csoport.map((s) => {
                  const verzioJel = s.verzio === 1 ? ' (V1)' : s.verzio === 2 ? ' (V2)' : '';
                  return (
                    <option key={s.azonosito} value={s.azonosito}>
                      {s.cim}
                      {verzioJel}
                    </option>
                  );
                })}
              </optgroup>,
            ];
          })}
        </select>
        {!paramsId && (
          <button
            onClick={onUres}
            className="text-xs text-ink/50 hover:text-ink hover:underline"
          >
            Üres tervezet ⊗
          </button>
        )}
      </div>
    </div>
  );
}

interface SablonBannerProps {
  autoSablonCim: string | null;
  /** Visszaállás üres tervezetre — resetel: terv-mezők + területek + sablon-state */
  onUresTervezet: () => void;
}

export function SablonBanner({ autoSablonCim, onUresTervezet }: SablonBannerProps) {
  return (
    <div className="mb-4 p-3 rounded-lg border border-sage-200 bg-sage-50 text-sm text-sage-700 flex items-center justify-between">
      <span>
        {autoSablonCim ? (
          <>
            ✨ <strong>„{autoSablonCim}"</strong> sablon automatikusan betöltve a dátum
            alapján — szerkeszd, majd Mentés gomb.
          </>
        ) : (
          <>✓ Sablon alkalmazva — szerkeszd kedved szerint, majd nyomd meg a Mentés gombot</>
        )}
      </span>
      <button
        onClick={onUresTervezet}
        className="text-ink/50 hover:text-ink hover:underline whitespace-nowrap ml-3"
      >
        Üres tervezet ⊗
      </button>
    </div>
  );
}
