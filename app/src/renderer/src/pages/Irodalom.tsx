import { useEffect, useState } from 'react';
import type { Irodalom as IrodalomType, IrodalomTipus } from '@shared/schema';
import { irodalomTipus } from '@shared/schema';

const TIPUS_CIMKE: Record<IrodalomTipus, string> = {
  vers: 'Vers',
  mese: 'Mese',
  mondoka: 'Mondóka',
  nepmese: 'Népmese',
  dal: 'Dal',
  zenehallgatas: 'Zenehallgatás',
  talalos_kerdes: 'Találós kérdés',
  koreplay: 'Körjáték',
  altato: 'Altató',
  regeny: 'Regény',
  verseskotet: 'Verseskötet',
  nepmonda: 'Népmonda',
};

export default function Irodalom() {
  const [tetelek, setTetelek] = useState<IrodalomType[]>([]);
  const [tipus, setTipus] = useState<IrodalomTipus | 'mind'>('mind');
  const [szoveg, setSzoveg] = useState('');
  const [kivalasztott, setKivalasztott] = useState<IrodalomType | null>(null);
  const [masolva, setMasolva] = useState(false);

  useEffect(() => {
    void window.api
      .irodalomKereses({
        tipus: tipus === 'mind' ? undefined : tipus,
        szoveg: szoveg || undefined,
      })
      .then(setTetelek);
  }, [tipus, szoveg]);

  async function masolas(t: IrodalomType) {
    const sor = t.szerzo ? `${t.cim} — ${t.szerzo}` : t.cim;
    const masolando = t.szoveg ? `${sor}\n\n${t.szoveg}` : sor;
    try {
      await navigator.clipboard.writeText(masolando);
      setMasolva(true);
      setTimeout(() => setMasolva(false), 1500);
    } catch (err) {
      console.error('Másolási hiba:', err);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h1 className="heading-serif text-3xl font-medium">Irodalmi adatbázis</h1>
        <p className="text-sm text-ink/60 mt-1">
          Versek, mesék, dalok — kizárólag valós szerzőktől, forrás-megjelöléssel. Klikk a sorra a
          teljes szöveg megnézéséhez (ha közkincs).
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTipus('mind')}
          className={tipus === 'mind' ? 'btn-ghost-active' : 'btn-ghost'}
        >
          Mind ({tetelek.length})
        </button>
        {irodalomTipus.map((t) => (
          <button
            key={t}
            onClick={() => setTipus(t)}
            className={tipus === t ? 'btn-ghost-active' : 'btn-ghost'}
          >
            {TIPUS_CIMKE[t]}
          </button>
        ))}
        <input
          type="text"
          value={szoveg}
          onChange={(e) => setSzoveg(e.target.value)}
          placeholder="Keresés cím vagy szerző alapján…"
          className="ml-auto px-3 py-1.5 border border-sage-200 rounded text-sm w-64 focus:border-sage-500 outline-none"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-sage-100 text-left bg-sage-50/40">
            <tr>
              <th className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-ink/60">
                Cím
              </th>
              <th className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-ink/60">
                Szerző
              </th>
              <th className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-ink/60">
                Típus
              </th>
              <th className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-ink/60">
                Szöveg
              </th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {tetelek.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-ink/50 italic">
                  Nincs találat
                </td>
              </tr>
            ) : (
              tetelek.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-sage-50 last:border-0 hover:bg-sage-50/40 cursor-pointer"
                  onClick={() => setKivalasztott(t)}
                >
                  <td className="px-3 py-2 font-medium">{t.cim}</td>
                  <td className="px-3 py-2 text-ink/70">
                    {t.szerzo ?? <span className="italic text-ink/40">néphagyomány</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span className="pill">{TIPUS_CIMKE[t.tipus]}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {t.szoveg ? (
                      <span className="text-sage-700">📖 elérhető</span>
                    ) : (
                      <span className="text-ink/40 italic">csak adat</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void masolas(t);
                      }}
                      className="text-xs text-sage-700 hover:underline"
                      title="Cím + szerző (és szöveg ha van) vágólapra"
                    >
                      Másolás
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {masolva && (
        <div className="fixed bottom-6 right-6 bg-sage-700 text-cream px-4 py-2 rounded-md shadow-lg text-sm">
          ✓ Vágólapra másolva
        </div>
      )}

      <p className="mt-4 text-xs text-ink/50 italic">
        A szöveggel ellátott művek mind <strong>közkincs</strong> (Petőfi, Móra Ferenc, József Attila,
        Ady, népdalok, népmondókák). A kortárs szerzők (Weöres, Marék Veronika, Donászy Magda,
        Mentovics Éva, Gryllus Vilmos, Csukás István, Lázár Ervin) művei a könyvtárban vagy
        könyvesboltban érhetők el — a szerzői jogvédelem miatt nem helyezhetők itt el.
      </p>

      {/* Megnézés modal */}
      {kivalasztott && (
        <div
          className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
          onClick={() => setKivalasztott(null)}
        >
          <div
            className="bg-cream rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="heading-serif text-2xl font-medium">{kivalasztott.cim}</h2>
                  <div className="text-sm text-ink/60 mt-1">
                    {kivalasztott.szerzo ?? <span className="italic">néphagyomány</span>}
                    <span className="mx-2">•</span>
                    <span className="pill">{TIPUS_CIMKE[kivalasztott.tipus]}</span>
                  </div>
                  <div className="text-xs text-ink/50 mt-1 italic">
                    Forrás: {kivalasztott.forras}
                  </div>
                </div>
                <button
                  onClick={() => setKivalasztott(null)}
                  className="text-ink/50 hover:text-ink text-xl leading-none"
                  aria-label="Bezár"
                >
                  ×
                </button>
              </div>

              {kivalasztott.szoveg ? (
                <div className="bg-white border border-sage-100 rounded p-4 mb-4">
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-ink">
                    {kivalasztott.szoveg}
                  </pre>
                </div>
              ) : (
                <div className="bg-mauve-100/40 border border-mauve-200 rounded p-4 mb-4 text-sm text-ink/80">
                  📚 A szöveg <strong>szerzői jogvédelem alatt</strong> áll — könyvtárban vagy
                  könyvesboltban érhető el. A forrás megjelölése elegendő a heti tervben.
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => void masolas(kivalasztott)} className="btn-primary">
                  📋 Másolás vágólapra
                </button>
                <button onClick={() => setKivalasztott(null)} className="btn-secondary">
                  Bezár
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
