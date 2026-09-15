/**
 * Korcsoport-váltó — a program legfontosabb kapcsolója.
 *
 * Az egész tartalom ez alapján szűrődik, ezért mindig kéznél kell lennie, nem
 * elrejtve a beállítások közé.
 */

import { KORCSOPORT_KOR, KORCSOPORT_NEV, type Korcsoport } from '../lib/tartalom';
import { useAllapot } from '../lib/allapot';

const SORREND: Korcsoport[] = ['kicsi', 'kozepso', 'nagy', 'vegyes'];

// Telefon szélességben a teljes név („Kiscsoport", „Nagycsoport") nem fér ki
// négyesével, ezért a kompakt sávban rövidítünk. A beállításoknál marad a teljes.
const ROVID: Record<Korcsoport, string> = {
  kicsi: 'Kicsi',
  kozepso: 'Középső',
  nagy: 'Nagy',
  vegyes: 'Vegyes',
};

export default function KorcsoportValto({ reszletes = false }: { reszletes?: boolean }) {
  const { korcsoport, korcsoportValt } = useAllapot();

  return (
    <div className={reszletes ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-4 gap-1.5'}>
      {SORREND.map((k) => {
        const aktiv = k === korcsoport;
        return (
          <button
            key={k}
            onClick={() => korcsoportValt(k)}
            aria-pressed={aktiv}
            className={[
              'erintheto justify-center rounded-full px-3 text-sm whitespace-nowrap transition',
              reszletes ? 'flex-col !items-start px-4 py-2 rounded-xl' : '',
              aktiv
                ? 'bg-rozsa-500 text-white font-medium'
                : 'bg-white text-ink/70 border border-rozsa-200',
            ].join(' ')}
          >
            <span>{reszletes ? KORCSOPORT_NEV[k] : ROVID[k]}</span>
            {reszletes && (
              <span className={aktiv ? 'text-white/80 text-xs' : 'text-ink/50 text-xs'}>
                {KORCSOPORT_KOR[k]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
