/**
 * Egy javaslat a listában: a mű vagy tevékenység és a megjegyzése, mellette a
 * kedvencelés.
 *
 * MŰFAJ-CÍMKE: csak a NÉPMESÉNÉL írjuk ki. A többi műfajt a szekció fejléce
 * („Verselés, mesélés", „Ének, zene") már megmondja, a soronkénti „(vers)",
 * „(dal)" csak ismétlés — a pedagógus kérése is ez volt. A népmese viszont
 * tartalmi információ: azt jelenti, hogy nem műmese.
 */

import { javaslatReszei } from '../lib/tartalom';
import { useAllapot } from '../lib/allapot';

/** Csak ez a műfaj kap látható címkét. */
const LATHATO_MUFAJ = 'népmese';

export default function JavaslatSor({ sor }: { sor: string }) {
  const { kedvencE, kedvencValt } = useAllapot();
  const { szoveg, mufaj, megjegyzes } = javaslatReszei(sor);
  const kedvenc = kedvencE(sor);

  return (
    <li className="flex items-start gap-1.5 border-b border-rozsa-100/70 py-1.5 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] leading-snug">
          {szoveg}
          {mufaj === LATHATO_MUFAJ && (
            <span className="cimke ml-1.5 align-middle bg-amber-100 text-amber-800">{mufaj}</span>
          )}
        </p>
        {megjegyzes && <p className="text-xs leading-snug text-ink/55">{megjegyzes}</p>}
      </div>
      <button
        onClick={() => kedvencValt(sor)}
        aria-label={kedvenc ? 'Törlés a kedvencekből' : 'Kedvencekhez adom'}
        aria-pressed={kedvenc}
        className="w-9 shrink-0 self-center text-center text-base leading-none"
      >
        <span className={kedvenc ? '' : 'opacity-25'}>{kedvenc ? '⭐' : '☆'}</span>
      </button>
    </li>
  );
}
