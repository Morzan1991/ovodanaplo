/**
 * Beállítások — szándékosan rövid.
 *
 * A program nem gyűjt semmilyen adatot, nincs fiók és nincs szerver; ezért itt
 * csak a korosztály és a tárolt kedvencek jelennek meg, plusz egy őszinte
 * tájékoztató arról, mi hol van.
 */

import Fejlec from '../reszek/Fejlec';
import KorcsoportValto from '../reszek/KorcsoportValto';
import { IRODALOM, TEMAK } from '../lib/tartalom';
import { useAllapot } from '../lib/allapot';

export default function Beallitasok() {
  const { kedvencek, kedvencValt } = useAllapot();

  function kedvencekTorlese() {
    if (kedvencek.length === 0) return;
    const ok = window.confirm(
      `Biztosan törlöd mind a(z) ${kedvencek.length} kedvencet?\n\nEz nem vonható vissza.`,
    );
    if (!ok) return;
    // Egyesével kapcsoljuk ki, hogy a tárolás is frissüljön.
    [...kedvencek].forEach((sor) => kedvencValt(sor));
  }

  return (
    <>
      <Fejlec cim="Beállítások" />
      <div className="space-y-5 p-3">
        <section>
          <h2 className="mb-2 font-medium text-rozsa-700">Csoport korosztálya</h2>
          <KorcsoportValto reszletes />
          <p className="mt-2 text-xs text-ink/55">
            Ez alapján szűrjük az ötleteket, az irodalmat és a hét célját.
          </p>
        </section>

        <section className="kartya">
          <h2 className="mb-1 font-medium text-rozsa-700">Ami a telefonon van</h2>
          <p className="text-sm text-ink/70">
            {TEMAK.length} téma · {IRODALOM.length} mese, vers, dal · {kedvencek.length} kedvenc
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink/55">
            A program nem gyűjt adatot, nincs benne fiók, nincs nyomkövetés, és internet
            nélkül is teljesen működik. A kedvenceid csak ezen a telefonon vannak.
          </p>
          {kedvencek.length > 0 && (
            <button
              onClick={kedvencekTorlese}
              className="erintheto mt-2 text-sm text-rozsa-700 underline"
            >
              Kedvencek törlése
            </button>
          )}
        </section>

        <p className="pb-2 text-center text-xs text-ink/45">
          ÓvodaNapló — ötletelő · a tartalom az asztali programéval azonos forrásból
        </p>
      </div>
    </>
  );
}
