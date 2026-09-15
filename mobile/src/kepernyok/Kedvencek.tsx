/**
 * Kedvencek — az összegyűjtött ötletek, megoszthatóan.
 *
 * Ez a „heti listám": az óvónő végigböngészi a témát, bepipálja, ami kell, majd
 * átküldi magának, és a laptopon beírja a tervbe.
 */

import Fejlec from '../reszek/Fejlec';
import JavaslatSor from '../reszek/JavaslatSor';
import { useAllapot } from '../lib/allapot';
import { Share } from '@capacitor/share';

export default function Kedvencek() {
  const { kedvencek } = useAllapot();

  async function megoszt() {
    const szoveg = kedvencek.join('\n');
    try {
      await Share.share({ title: 'ÓvodaNapló — kiválasztott ötletek', text: szoveg });
    } catch {
      // Böngészőben vagy ha a megosztás nem érhető el: vágólapra tesszük.
      try {
        await navigator.clipboard.writeText(szoveg);
        window.alert('A lista a vágólapra került.');
      } catch {
        window.alert('A megosztás ezen az eszközön nem érhető el.');
      }
    }
  }

  return (
    <>
      <Fejlec cim="Kedvencek" alcim={`${kedvencek.length} kiválasztott ötlet`} />
      <div className="p-3">
        {kedvencek.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink/55">
            Még nincs kedvenced.
            <br />
            Böngészés közben a csillaggal gyűjtheted össze, ami kell a hétre.
          </p>
        ) : (
          <>
            <button
              onClick={() => void megoszt()}
              className="erintheto mb-3 w-full justify-center rounded-xl bg-rozsa-500 font-medium text-white"
            >
              Lista megosztása
            </button>
            <ul className="kartya">
              {kedvencek.map((sor) => (
                <JavaslatSor key={sor} sor={sor} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
