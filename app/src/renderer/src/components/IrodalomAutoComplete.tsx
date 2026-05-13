/**
 * IrodalomAutoComplete — textarea wrapper irodalom-autocomplete-tal.
 *
 * Funkció:
 * - Min 2 karakter gépelése után a kurzor körüli "token" (utolsó vessző/újsor
 *   utáni szöveg) alapján keresést indít a `irodalomKereses` IPC-n.
 * - Max 10 találat egy lebegő dropdown-ban.
 * - Tab/Enter beilleszti a kiválasztott művet "Cím — Szerző" formában.
 * - Fel/Le nyíllal navigálható, Escape bezárja.
 * - Klikk a találaton: szintén beilleszt.
 * - Klikk a komponensen kívül: bezárja a dropdown-t.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Irodalom, IrodalomTipus } from '@shared/schema';

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

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 10;
const DEBOUNCE_MS = 200;

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

/**
 * Megkeresi a kurzor körüli "token"-t a value szövegben.
 * A token vége a kurzor pozíciója, kezdete az utolsó \n / vessző / pontosvessző
 * UTÁN az első nem-whitespace karakter.
 */
function getCurrentToken(value: string, caret: number): {
  start: number;
  end: number;
  text: string;
} {
  const before = value.slice(0, caret);
  let lastSep = -1;
  for (let i = before.length - 1; i >= 0; i--) {
    const ch = before[i];
    if (ch === '\n' || ch === ',' || ch === ';') {
      lastSep = i;
      break;
    }
  }
  let trueStart = lastSep + 1;
  while (trueStart < before.length && /\s/.test(value[trueStart] ?? '')) {
    trueStart++;
  }
  return {
    start: trueStart,
    end: caret,
    text: value.slice(trueStart, caret).trim(),
  };
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
  const [suggestions, setSuggestions] = useState<Irodalom[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tokenStart, setTokenStart] = useState(0);
  const [tokenEnd, setTokenEnd] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);
    triggerSearch(v, e.target.selectionStart);
  };

  const onTaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    // selectionchange-szerű viselkedés: ha a felhasználó nyilakkal vagy klikkel
    // mozgatja a kurzort, ne maradjon nyitva irreleváns suggestion-listával.
    const caret = e.currentTarget.selectionStart;
    triggerSearch(e.currentTarget.value, caret);
  };

  const triggerSearch = useCallback(
    (v: string, caret: number) => {
      const tok = getCurrentToken(v, caret);
      setTokenStart(tok.start);
      setTokenEnd(tok.end);

      if (tok.text.length < MIN_QUERY_LENGTH) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          // Több típusra párhuzamos keresés, majd flat + dedup ID szerint
          const eredmenyek = await Promise.all(
            tipusok.map((t) =>
              window.api.irodalomKereses({
                tipus: t,
                szoveg: tok.text,
                korcsoport,
              }),
            ),
          );
          const seen = new Set<number>();
          const dedup: Irodalom[] = [];
          for (const arr of eredmenyek) {
            for (const irod of arr) {
              if (seen.has(irod.id)) continue;
              seen.add(irod.id);
              dedup.push(irod);
              if (dedup.length >= MAX_SUGGESTIONS) break;
            }
            if (dedup.length >= MAX_SUGGESTIONS) break;
          }
          setSuggestions(dedup);
          setIsOpen(dedup.length > 0);
          setSelectedIdx(0);
        } catch (err) {
          console.error('[IrodalomAutoComplete] keresési hiba:', err);
        }
      }, DEBOUNCE_MS);
    },
    [tipusok, korcsoport],
  );

  const beillesztes = useCallback(
    (irod: Irodalom) => {
      const sor = irod.szerzo ? `${irod.cim} — ${irod.szerzo}` : irod.cim;
      const before = value.slice(0, tokenStart);
      const after = value.slice(tokenEnd);
      const uj = before + sor + after;
      onChange(uj);
      setIsOpen(false);
      setSuggestions([]);
      // visszahelyezzük a kurzort a beszúrt szöveg utánra
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (!ta) return;
        const pos = tokenStart + sor.length;
        ta.focus();
        ta.setSelectionRange(pos, pos);
      });
    },
    [value, tokenStart, tokenEnd, onChange],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      beillesztes(suggestions[selectedIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Komponensen kívüli klikkre bezárjuk a dropdown-t.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <textarea
        ref={taRef}
        value={value}
        onChange={onTaChange}
        onSelect={onTaSelect}
        onKeyDown={onKeyDown}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-sage-200 rounded-md shadow-lg"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === selectedIdx}
              onMouseDown={(e) => {
                // mousedown — onClick előtt fut, így nem szakítja meg a blur-rel
                e.preventDefault();
                beillesztes(s);
              }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`px-3 py-2 text-sm cursor-pointer border-b border-sage-50 last:border-b-0 ${
                i === selectedIdx ? 'bg-sage-100' : 'hover:bg-sage-50'
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
      {isOpen && suggestions.length === 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-sage-200 rounded-md shadow-lg px-3 py-2 text-xs text-ink/50 italic">
          Nincs találat — Esc-re bezárhatod, vagy gépelj másképp.
        </div>
      )}
    </div>
  );
}
