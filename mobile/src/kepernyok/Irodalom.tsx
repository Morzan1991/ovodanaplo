/**
 * Irodalomtár: mesék, versek, mondókák, dalok — kereshetően, műfaj szerint szűrve.
 *
 * Ez a képernyő önmagában is megéri a telefont: 1023 mű a zsebben, keresővel.
 */

import { useMemo, useState } from 'react';
import Fejlec from '../reszek/Fejlec';
import { IRODALOM, type Mu } from '../lib/tartalom';

const MUFAJ_SZUROK: { id: string; cimke: string; tipusok: string[] }[] = [
  { id: 'mind', cimke: 'Mind', tipusok: [] },
  { id: 'vers', cimke: 'Vers', tipusok: ['vers'] },
  { id: 'mondoka', cimke: 'Mondóka', tipusok: ['mondoka'] },
  { id: 'mese', cimke: 'Mese', tipusok: ['mese', 'nepmese', 'nepmonda'] },
  { id: 'dal', cimke: 'Dal', tipusok: ['dal', 'koreplay', 'altato'] },
  { id: 'zene', cimke: 'Zenehallgatás', tipusok: ['zenehallgatas'] },
  { id: 'talalos', cimke: 'Találós', tipusok: ['talalos_kerdes'] },
  { id: 'konyv', cimke: 'Könyv', tipusok: ['regeny', 'verseskotet'] },
];

const TIPUS_NEV: Record<string, string> = {
  vers: 'vers',
  mondoka: 'mondóka',
  mese: 'mese',
  nepmese: 'népmese',
  nepmonda: 'népmonda',
  dal: 'dal',
  koreplay: 'körjáték',
  altato: 'altató',
  zenehallgatas: 'zenehallgatás',
  talalos_kerdes: 'találós kérdés',
  regeny: 'meseregény',
  verseskotet: 'verseskötet',
};

function ekezettelen(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function Irodalom() {
  const [kereses, setKereses] = useState('');
  const [szuro, setSzuro] = useState('mind');
  const [nyitott, setNyitott] = useState<string | null>(null);

  const talalatok = useMemo(() => {
    const valasztott = MUFAJ_SZUROK.find((s) => s.id === szuro)!;
    const k = ekezettelen(kereses.trim());
    return IRODALOM.filter((m: Mu) => {
      if (valasztott.tipusok.length > 0 && !valasztott.tipusok.includes(m.tipus)) return false;
      if (!k) return true;
      // Ékezet nélkül is találjon: telefonon sokan ékezet nélkül gépelnek.
      return (
        ekezettelen(m.cim).includes(k) ||
        (m.szerzo ? ekezettelen(m.szerzo).includes(k) : false) ||
        (m.temak ? m.temak.some((t) => ekezettelen(t).includes(k)) : false)
      );
    });
  }, [kereses, szuro]);

  return (
    <>
      <Fejlec cim="Irodalom" alcim={`${IRODALOM.length} mese, vers, mondóka, dal`} />
      <div className="p-3">
        <input
          value={kereses}
          onChange={(e) => setKereses(e.target.value)}
          placeholder="Cím, szerző vagy téma…"
          className="w-full rounded-xl border border-rozsa-200 bg-white px-3 py-2.5 text-[15px]"
        />
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {MUFAJ_SZUROK.map((s) => (
            <button
              key={s.id}
              onClick={() => setSzuro(s.id)}
              className={[
                'erintheto justify-center rounded-full px-3 text-sm whitespace-nowrap',
                s.id === szuro
                  ? 'bg-rozsa-500 text-white font-medium'
                  : 'bg-white text-ink/70 border border-rozsa-200',
              ].join(' ')}
            >
              {s.cimke}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-ink/50">{talalatok.length} találat</p>

        <ul className="mt-1">
          {talalatok.slice(0, 300).map((m, i) => {
            const kulcs = `${m.szerzo ?? ''}|${m.cim}|${i}`;
            const nyitva = nyitott === kulcs;
            return (
              <li key={kulcs} className="border-b border-rozsa-100 py-2 last:border-0">
                <button
                  className="w-full text-left"
                  onClick={() => setNyitott(nyitva ? null : kulcs)}
                  aria-expanded={nyitva}
                >
                  <p className="text-[15px] leading-snug">
                    {m.szerzo && <span className="text-ink/70">{m.szerzo}: </span>}
                    {m.cim}
                  </p>
                  <p className="mt-1">
                    <span className="cimke bg-rozsa-100 text-rozsa-700">
                      {TIPUS_NEV[m.tipus] ?? m.tipus}
                    </span>
                  </p>
                </button>
                {nyitva && m.szoveg && (
                  <p className="mt-2 whitespace-pre-line rounded-lg bg-white/70 p-2.5 text-sm leading-relaxed">
                    {m.szoveg}
                  </p>
                )}
                {nyitva && !m.szoveg && (
                  <p className="mt-2 text-xs text-ink/50">
                    Ehhez a műhöz nincs eltárolva szöveg — a cím alapján megtalálod a
                    kötetben.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {talalatok.length > 300 && (
          <p className="py-3 text-center text-xs text-ink/50">
            Az első 300 találat látszik — szűkíts a kereséssel.
          </p>
        )}
      </div>
    </>
  );
}
