/**
 * OtletekModal — "Ötletek böngészése" modális panel.
 *
 * Két szekciót mutat:
 *  1. ⭐ KIEMELT — kor-specifikus 10 ötlet (az ötlet-bankból a téma+terület metszetén)
 *  2. 📚 ALTERNATÍV — a hónap sablonjaiból gyűjtött bullet-sorok
 *
 * A felhasználó pipálással választ ki ötleteket, amelyeket aztán a `onHozzaadas`
 * callback a kiválasztott területre szúr be a Heti terv-szerkesztőbe.
 *
 * Téma-szűrés toggle (📌 Csak ehhez a témához / 📅 Minden téma) lehetővé teszi
 * a rokon sablonok kiemelt vagy teljes (egész hónap) megjelenítését.
 */

import type { TeruletTipus } from '@shared/schema';
import type { SablonOtletForras } from './types';

interface Props {
  tipus: TeruletTipus;
  tipusCim: string;
  forrasok: SablonOtletForras[];
  korSpecifikusOtletek: string[];
  aktualisSablonAzonosito: string | null;
  csakAktualisTema: boolean;
  setCsakAktualisTema: (b: boolean) => void;
  korcsoport: string;
  valasztottak: Set<string>;
  setValasztottak: (s: Set<string>) => void;
  onBezar: () => void;
  onHozzaadas: () => void;
}

export default function OtletekModal({
  tipus,
  tipusCim,
  forrasok,
  korSpecifikusOtletek,
  aktualisSablonAzonosito,
  csakAktualisTema,
  setCsakAktualisTema,
  korcsoport,
  valasztottak,
  setValasztottak,
  onBezar,
  onHozzaadas,
}: Props) {
  // Header sorok kiszűrése (ezek nem javaslatok)
  const FEJCIMEK = [
    /^Mes[éeè]k\s*:\s*$/i,
    /^Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*$/i,
    /^Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*$/i,
    /^Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*$/i,
  ];

  // Téma-prefix kibontása az azonosítóból: "mikulas_v1" -> "mikulas"
  const temaPrefix = aktualisSablonAzonosito
    ? aktualisSablonAzonosito.replace(/_v[12]$/, '')
    : null;

  /**
   * "Rokon" sablonok keresése: nemcsak EGZAKT prefix-egyezést, hanem
   * fuzzy egyezést is figyelembe veszünk.
   * Pl. "husvet" prefix → "husveti_het" sablonok is rokon-mappolódnak,
   *     "osz_kezdete" → "osz_termenyek", "osz_szinek"
   */
  const rokonE = (sablonAzonosito: string, temaPref: string): boolean => {
    const fPrefix = sablonAzonosito.replace(/_v[12]$/, '');
    if (fPrefix === temaPref) return true;
    // egyik a másik prefixe (pl. "husvet" ⊂ "husveti_het")
    if (fPrefix.startsWith(temaPref) || temaPref.startsWith(fPrefix)) return true;
    // "osz_" prefix-csoport: ugyanazon szezon
    const elsoSzo = (s: string) => s.split('_')[0];
    if (elsoSzo(fPrefix) === elsoSzo(temaPref) && elsoSzo(fPrefix).length >= 3) return true;
    return false;
  };

  // Mely sablonokból gyűjtünk?
  // - Ha van aktuális téma ÉS bekapcsolt a téma-szűrés: rokon sablonok
  // - Egyébként: minden hónapi sablon
  const releavansForrasok = temaPrefix && csakAktualisTema
    ? forrasok.filter((f) => rokonE(f.azonosito, temaPrefix))
    : forrasok;

  // Minden forrásból gyűjtsük össze az ehhez a területhez tartozó bullet-sorokat
  const javaslatok: Array<{ szoveg: string; forrasCim: string; verzio?: number | null }> = [];
  const lattam = new Set<string>();
  for (const forras of releavansForrasok) {
    const tartalom = forras.teruletek?.[tipus] ?? '';
    if (!tartalom.trim()) continue;
    const sorok = tartalom
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const sor of sorok) {
      // Fejcímeket átugorjuk
      if (FEJCIMEK.some((re) => re.test(sor))) continue;
      const kulcs = sor.toLowerCase();
      if (lattam.has(kulcs)) continue;
      lattam.add(kulcs);
      javaslatok.push({ szoveg: sor, forrasCim: forras.cim, verzio: forras.verzio });
    }
  }

  const toggle = (szoveg: string) => {
    const uj = new Set(valasztottak);
    if (uj.has(szoveg)) uj.delete(szoveg);
    else uj.add(szoveg);
    setValasztottak(uj);
  };

  // Aktuális téma neve a fejlécbe (ha van)
  const aktualisTemaCim = temaPrefix
    ? forrasok.find((f) => f.azonosito.startsWith(temaPrefix))?.cim
    : null;

  // Korcsoport-cimke a fejléchez
  const korcsoportCimke = {
    kicsi: 'Kiscsoport (3–4 éves)',
    kozepso: 'Középső csoport (4–5 éves)',
    nagy: 'Nagycsoport (5–7 éves)',
    vegyes: 'Vegyes csoport (3–7 éves)',
  }[korcsoport] ?? 'Vegyes csoport (3–7 éves)';

  // Auto-fallback: ha kevés a téma-specifikus (és van rokon-szűrés bekapcsolva),
  // és van több sablon a hónapban, jelezzük hogy érdemes kibővíteni
  const tobbiSablonElerheto =
    temaPrefix &&
    csakAktualisTema &&
    forrasok.length > releavansForrasok.length;

  return (
    <div
      className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4"
      onClick={onBezar}
    >
      <div
        className="bg-cream rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-sage-200 bg-sage-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold flex items-center gap-2">
                <span>Ötletek böngészése — {tipusCim}</span>
                <span className="px-1.5 py-0.5 bg-mauve-200 text-mauve-700 rounded text-[10px] font-medium normal-case tracking-normal">
                  👥 {korcsoportCimke}
                </span>
              </div>
              <h3 className="heading-serif text-lg truncate">
                {temaPrefix && csakAktualisTema && aktualisTemaCim
                  ? `📌 ${aktualisTemaCim}`
                  : '📅 Minden téma a hónapból'}
              </h3>
              <div className="text-xs text-ink/60 mt-0.5">
                {javaslatok.length} javaslat — pipáld be amit szeretnél a tervedbe (utána még szerkesztheted).
              </div>
            </div>
            <button onClick={onBezar} className="text-ink/50 hover:text-ink text-2xl leading-none ml-2">
              ×
            </button>
          </div>
          {/* Téma-szűrés toggle — csak ha van aktuális sablon */}
          {temaPrefix && (
            <div className="mt-2 flex items-center gap-3 text-xs">
              <button
                onClick={() => setCsakAktualisTema(true)}
                className={`px-2 py-1 rounded transition ${
                  csakAktualisTema
                    ? 'bg-sage-500 text-cream font-semibold'
                    : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                }`}
              >
                📌 Csak ehhez a témához
              </button>
              <button
                onClick={() => setCsakAktualisTema(false)}
                className={`px-2 py-1 rounded transition ${
                  !csakAktualisTema
                    ? 'bg-sage-500 text-cream font-semibold'
                    : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                }`}
              >
                📅 Minden téma a hónapból
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {/* SZEKCIÓ 1: KIEMELT — kor-specifikus 10 ötlet az ötlet-bankból */}
          {korSpecifikusOtletek.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-mauve-700 font-semibold mb-2 flex items-center gap-2">
                <span>⭐ {korcsoportCimke} — {korSpecifikusOtletek.length} ötlet a témára</span>
              </div>
              <ul className="space-y-1">
                {korSpecifikusOtletek.map((sz, i) => {
                  const aktiv = valasztottak.has(sz);
                  return (
                    <li key={`bank-${i}`}>
                      <label
                        className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                          aktiv ? 'bg-mauve-100 border border-mauve-300' : 'hover:bg-mauve-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={aktiv}
                          onChange={() => toggle(sz)}
                          className="mt-0.5 accent-mauve-500"
                        />
                        <span className="flex-1 text-sm leading-snug">{sz}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* SZEKCIÓ 2: ALTERNATÍV — sablon-bullet-ek a hónap minden sablonjából */}
          {javaslatok.length > 0 && (
            <div>
              {korSpecifikusOtletek.length > 0 && (
                <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold mb-2 pt-2 border-t border-sage-200">
                  📚 További ötletek a sablonokból ({javaslatok.length})
                </div>
              )}
              <ul className="space-y-1">
                {javaslatok.map((j, i) => {
                  const aktiv = valasztottak.has(j.szoveg);
                  const verzioJel = j.verzio === 1 ? 'V1' : j.verzio === 2 ? 'V2' : null;
                  return (
                    <li key={i}>
                      <label
                        className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                          aktiv ? 'bg-sage-100 border border-sage-300' : 'hover:bg-sage-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={aktiv}
                          onChange={() => toggle(j.szoveg)}
                          className="mt-0.5 accent-sage-500"
                        />
                        <span className="flex-1 text-sm leading-snug">{j.szoveg}</span>
                        <span className="text-[10px] text-ink/40 whitespace-nowrap mt-0.5">
                          {verzioJel ?? (j.forrasCim.length > 18 ? j.forrasCim.slice(0, 18) + '…' : j.forrasCim)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Ha mindkét forrás üres */}
          {korSpecifikusOtletek.length === 0 && javaslatok.length === 0 && (
            <div className="text-center text-ink/50 py-8 italic">
              Ehhez nincs javaslat. Próbálj sablont választani, vagy írj saját ötletet a szerkesztőbe.
            </div>
          )}

          {/* Auto-fallback banner — már nem fontos, mert mindkét forrásból gyűjtünk */}
          {tobbiSablonElerheto && javaslatok.length + korSpecifikusOtletek.length < 10 && (
            <div className="p-2 bg-mauve-50 border border-mauve-200 rounded text-xs text-mauve-700">
              ⚡ Még alternatívák elérhetők. {' '}
              <button
                onClick={() => setCsakAktualisTema(false)}
                className="underline font-semibold hover:text-mauve-600"
              >
                📅 Minden téma megnyitása →
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-sage-200 flex items-center justify-between bg-sage-50/50">
          <div className="text-xs text-ink/60">
            {valasztottak.size} kiválasztva
          </div>
          <div className="flex gap-2">
            <button onClick={onBezar} className="btn-secondary text-sm">
              Mégse
            </button>
            <button
              onClick={onHozzaadas}
              disabled={valasztottak.size === 0}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Hozzáadás ({valasztottak.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
