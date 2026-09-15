/**
 * IrodalomAutoComplete — textarea az irodalomtárból ajánlkozó kiegészítéssel.
 *
 * A SZERKESZTÉS AZ ELSŐDLEGES. A találati lista korábban a kurzor minden
 * mozdulatára megnyílt, és elvette az Entert meg a nyilakat — így egy beszúrt
 * ötletet nem lehetett átfogalmazni: az Enter kicserélte a sort, a fel/le nyíl a
 * listában lépkedett, a lista pedig eltakarta a javítandó szöveget.
 *
 * A mostani viselkedés:
 *  - a lista CSAK gépelésre jelenik meg (lásd `lib/autocomplete-szabaly.ts`);
 *    törlésre, kurzormozgásra, kijelölésre soha,
 *  - az ENTER mindig sort tör — a javaslatot Tab-bal vagy kattintással lehet
 *    elfogadni,
 *  - Escape után a lista csak a következő gépelésig marad csukva,
 *  - ha a kurzor kilép abból a töredékből, amire a keresés indult, a lista becsukódik.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Irodalom, IrodalomTipus } from '@shared/schema';
import { aktualisToken, keresestInditsunk, nyitvaMaradhat } from '../lib/autocomplete-szabaly';

const TIPUS_CIMKE: Record<IrodalomTipus, string> = {
  vers: 'Vers',
  mese: 'Mese',
  mondoka: 'Mondóka',
  nepmese: 'Népmese',
  dal: 'Dal',
  zenehallgatas: 'Zene',
  talalos_kerdes: 'Találós',
  koreplay: 'Körjáték',
  altato: 'Altató',
  regeny: 'Regény',
  verseskotet: 'Kötet',
  nepmonda: 'Népmonda',
};

const MAX_JAVASLAT = 10;
const KESLELTETES_MS = 200;

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  /** Mely irodalom-típusokra keressen — pl. ['vers','mese','mondoka','regeny',...] */
  tipusok: IrodalomTipus[];
  /** Opcionális korcsoport-szűrés (kicsi/kozepso/nagy/vegyes). */
  korcsoport?: string;
}

export default function IrodalomAutoComplete({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
  tipusok,
  korcsoport,
}: Props) {
  const [javaslatok, setJavaslatok] = useState<Irodalom[]>([]);
  const [nyitva, setNyitva] = useState(false);
  const [valasztottIdx, setValasztottIdx] = useState(0);
  const [token, setToken] = useState({ start: 0, end: 0, text: '' });
  const taRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idozitoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bezar = useCallback(() => {
    if (idozitoRef.current) clearTimeout(idozitoRef.current);
    setNyitva(false);
    setJavaslatok([]);
  }, []);

  const kereses = useCallback(
    (szoveg: string) => {
      if (idozitoRef.current) clearTimeout(idozitoRef.current);
      idozitoRef.current = setTimeout(async () => {
        try {
          const eredmenyek = await Promise.all(
            tipusok.map((t) =>
              window.api.irodalomKereses({ tipus: t, szoveg, korcsoport }),
            ),
          );
          const latott = new Set<number>();
          const dedup: Irodalom[] = [];
          for (const arr of eredmenyek) {
            for (const irod of arr) {
              if (latott.has(irod.id)) continue;
              latott.add(irod.id);
              dedup.push(irod);
              if (dedup.length >= MAX_JAVASLAT) break;
            }
            if (dedup.length >= MAX_JAVASLAT) break;
          }
          setJavaslatok(dedup);
          // Találat nélkül NEM nyitunk buborékot: az csak eltakarná a szöveget.
          setNyitva(dedup.length > 0);
          setValasztottIdx(0);
        } catch (err) {
          console.error('[IrodalomAutoComplete] keresési hiba:', err);
        }
      }, KESLELTETES_MS);
    },
    [tipusok, korcsoport],
  );

  const valtozas = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const uj = e.target.value;
    const kurzor = e.target.selectionStart;
    onChange(uj);

    if (!keresestInditsunk({ elozo: value, uj, kurzor })) {
      bezar();
      return;
    }
    const tok = aktualisToken(uj, kurzor);
    setToken(tok);
    kereses(tok.text);
  };

  /**
   * Kurzormozgás: SOHA nem nyit listát, csak becsukja, ha a kurzor elhagyta azt a
   * töredéket, amire a keresés indult. Enélkül a mezőbe kattintás is találati
   * listát dobott fel a szerkesztendő sor tetejére.
   */
  const kurzorMozgas = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!nyitva) return;
    if (!nyitvaMaradhat(token, e.currentTarget.selectionStart)) bezar();
  };

  const beillesztes = useCallback(
    (irod: Irodalom) => {
      const sor = irod.szerzo ? `${irod.cim} — ${irod.szerzo}` : irod.cim;
      const uj = value.slice(0, token.start) + sor + value.slice(token.end);
      onChange(uj);
      bezar();
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (!ta) return;
        const pos = token.start + sor.length;
        ta.focus();
        ta.setSelectionRange(pos, pos);
      });
    },
    [value, token, onChange, bezar],
  );

  const billentyu = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!nyitva || javaslatok.length === 0) return;
    // FIGYELEM: az Enter itt NEM elfogadás. Többsoros mezőben az Enter a sortörés
    // billentyűje — ha elvennénk, a pedagógus szövege helyére kerülne a javaslat.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setValasztottIdx((i) => (i + 1) % javaslatok.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setValasztottIdx((i) => (i - 1 + javaslatok.length) % javaslatok.length);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      beillesztes(javaslatok[valasztottIdx]);
    } else if (e.key === 'Escape' || e.key === 'Enter') {
      // Enterre nem nyelünk el semmit: a sortörés megtörténik, a lista bezárul.
      if (e.key === 'Escape') e.preventDefault();
      bezar();
    }
  };

  // Komponensen kívüli kattintásra bezárjuk a listát.
  useEffect(() => {
    function dokumentumKattintas(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setNyitva(false);
    }
    document.addEventListener('mousedown', dokumentumKattintas);
    return () => document.removeEventListener('mousedown', dokumentumKattintas);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <textarea
        ref={taRef}
        value={value}
        onChange={valtozas}
        onSelect={kurzorMozgas}
        onKeyDown={billentyu}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {nyitva && javaslatok.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-sage-200 rounded-md shadow-lg"
          role="listbox"
        >
          <li className="px-3 py-1 text-[10px] text-ink/40 border-b border-sage-100">
            Tab vagy kattintás a beillesztéshez · Esc a bezáráshoz
          </li>
          {javaslatok.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === valasztottIdx}
              onMouseDown={(e) => {
                // mousedown — onClick előtt fut, így nem szakítja meg a blur
                e.preventDefault();
                beillesztes(s);
              }}
              onMouseEnter={() => setValasztottIdx(i)}
              className={`px-3 py-2 text-sm cursor-pointer border-b border-sage-50 last:border-b-0 ${
                i === valasztottIdx ? 'bg-sage-100' : 'hover:bg-sage-50'
              }`}
            >
              <div className="font-medium text-ink/90 truncate">{s.cim}</div>
              <div className="text-xs text-ink/50 flex items-center gap-2 mt-0.5">
                <span className="pill text-[10px]">{TIPUS_CIMKE[s.tipus]}</span>
                {s.szerzo && <span className="truncate">{s.szerzo}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
