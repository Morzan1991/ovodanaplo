import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NevelesiEv, HetiTerv, Unnep, Esemeny } from '@shared/schema';
import { hetTartomany, nevelesiEvCimke } from '../lib/utils';

const HONAPOK = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December',
];

const NEVELESI_EV_HONAPOK = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5]; // szept–jún (0-indexű hónapok)

export default function Naptar() {
  const [nevelesiEv, setNevelesiEv] = useState<NevelesiEv | null>(null);
  const [evek, setEvek] = useState<NevelesiEv[]>([]);
  const [hetiTervek, setHetiTervek] = useState<HetiTerv[]>([]);
  const [unnepek, setUnnepek] = useState<Unnep[]>([]);
  const [esemenyek, setEsemenyek] = useState<Esemeny[]>([]);
  const [loading, setLoading] = useState(true);

  async function torolHetiTerv(terv: HetiTerv) {
    const cim = terv.tema && terv.tema.trim() ? terv.tema : 'Heti terv';
    const megerosit = window.confirm(
      `Biztosan törlöd a(z) "${cim}" heti tervet?\n\n` +
        'A hozzá tartozó területek tartalma is törlődik. ' +
        'A reflexiók megmaradnak, de gazdátlanná válnak.\n\n' +
        'Ez a művelet visszavonhatatlan.',
    );
    if (!megerosit) return;
    try {
      await window.api.hetiTervTorol(terv.id);
      setHetiTervek((tervek) => tervek.filter((t) => t.id !== terv.id));
    } catch (err) {
      console.error('Heti terv törlése sikertelen:', err);
      window.alert('Sikertelen volt a törlés. Próbáld újra később.');
    }
  }

  useEffect(() => {
    async function load() {
      const [aktiv, lista, unnepekLista] = await Promise.all([
        window.api.nevelesiEvAktiv(),
        window.api.nevelesiEvLista(),
        window.api.unnepekListaEvre(),
      ]);
      setEvek(lista);
      setUnnepek(unnepekLista);

      let active = aktiv;
      if (!active && lista.length > 0) active = lista[0];
      setNevelesiEv(active);

      if (active) {
        const [tervek, esemenyekLista] = await Promise.all([
          window.api.hetiTervLista(active.id),
          window.api.esemenyLista(active.id),
        ]);
        setHetiTervek(tervek);
        setEsemenyek(esemenyekLista);
      }
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-ink/50">Betöltés...</div>;
  }

  if (!nevelesiEv) {
    return <NevelesiEvLetrehozas onCreated={(ev) => { setNevelesiEv(ev); setEvek([ev]); }} />;
  }

  // Évhez tartozó hetek szervezése hónapokba
  const hetiTervekByDatum = new Map(hetiTervek.map((t) => [t.kezdoDatum, t]));
  const esemenyekByDatum = new Map<string, Esemeny[]>();
  for (const e of esemenyek) {
    const list = esemenyekByDatum.get(e.datum) ?? [];
    list.push(e);
    esemenyekByDatum.set(e.datum, list);
  }

  const evKezdoEv = parseInt(nevelesiEv.kezdo.slice(0, 4), 10);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sage-700">
            Nevelési év
          </div>
          <h1 className="heading-serif text-3xl font-medium">{nevelesiEv.nev}</h1>
          <div className="text-sm text-ink/60 mt-1">
            {nevelesiEv.kezdo} — {nevelesiEv.zaro}
          </div>
        </div>
        <div className="text-sm flex items-center gap-3">
          {evek.length > 1 && (
            <select
              value={nevelesiEv.id}
              onChange={(e) => {
                const ev = evek.find((x) => x.id === Number(e.target.value));
                if (ev) setNevelesiEv(ev);
              }}
              className="border border-sage-200 rounded px-2 py-1 text-sm"
            >
              {evek.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nev}
                </option>
              ))}
            </select>
          )}
          <div className="text-xs text-ink/50 italic">
            Új heti tervnél választhatsz sablont (Mikulás, Húsvét, Tavasz, stb.) — 21 előre elkészített téma.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {NEVELESI_EV_HONAPOK.map((honapIdx) => {
          // szept-dec az évKezdoEv-ben, jan-jún a következő évben
          const ev = honapIdx >= 8 ? evKezdoEv : evKezdoEv + 1;
          const honapNev = HONAPOK[honapIdx];
          const hetekEbbenAHonapban = hetekHonapra(ev, honapIdx);

          const unnepekEbben = unnepek
            .filter((u) => u.tipus === 'fix' && u.honap === honapIdx + 1)
            .sort((a, b) => (a.nap ?? 0) - (b.nap ?? 0));

          return (
            <div key={`${ev}-${honapIdx}`} className="card">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="heading-serif text-xl font-medium">{honapNev}</h2>
                <span className="text-xs text-ink/40">{ev}</span>
              </div>

              {unnepekEbben.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {unnepekEbben.map((u) => (
                    <span
                      key={u.id}
                      className={`text-xs px-2 py-0.5 rounded ${
                        (u.ovodaiSulyozas ?? 5) >= 5
                          ? 'bg-terra-400/30 text-terra-600'
                          : 'bg-mauve-100 text-mauve-600'
                      }`}
                      title={u.leiras ?? ''}
                    >
                      {u.nap}. {u.nev}
                    </span>
                  ))}
                </div>
              )}

              <ol className="space-y-1 text-sm">
                {hetekEbbenAHonapban.map((hetKezdo) => {
                  const terv = hetiTervekByDatum.get(hetKezdo);
                  const t = hetTartomany(hetKezdo);
                  return (
                    <li key={hetKezdo}>
                      {terv ? (
                        <div className="relative group">
                          <Link
                            to={`/heti-terv/${terv.id}`}
                            className="block px-3 py-2 pr-9 rounded-md hover:bg-sage-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{terv.tema ?? 'Heti terv'}</span>
                              <span className="text-xs text-ink/40 mr-4">{t.label}</span>
                            </div>
                            <div className="text-xs text-ink/50 mt-0.5">{t.kezdo}</div>
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              void torolHetiTerv(terv);
                            }}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 flex items-center justify-center rounded-full text-lg leading-none font-bold transition"
                            title={`Törlés: ${terv.tema ?? 'Heti terv'}`}
                            aria-label="Heti terv törlése"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Link
                          to={`/heti-terv?datum=${hetKezdo}`}
                          className="block px-3 py-2 rounded-md hover:bg-sage-50 text-ink/50 italic"
                        >
                          <div className="flex items-center justify-between">
                            <span>+ új heti terv</span>
                            <span className="text-xs">{t.label}</span>
                          </div>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Adott évre+hónapra kiszámolja a hét-kezdő (hétfő) dátumokat.
 * Visszaadja a hónap minden olyan hétfőjét, ami a hónapban van.
 */
function hetekHonapra(ev: number, honapIdx: number): string[] {
  const elsoNap = new Date(ev, honapIdx, 1);
  const utolsoNap = new Date(ev, honapIdx + 1, 0);
  const eredmeny: string[] = [];

  // Megkeressük az első hétfőt (vagy az első napot ha hétfő a hónap eleje)
  let d = new Date(elsoNap);
  const napVKezdes = d.getDay() || 7; // 1..7
  if (napVKezdes !== 1) {
    d.setDate(d.getDate() - (napVKezdes - 1));
  }

  while (d <= utolsoNap) {
    if (d.getMonth() === honapIdx || (d.getMonth() === honapIdx - 1 && d.getDate() >= 25)) {
      eredmeny.push(d.toISOString().split('T')[0]);
    }
    d.setDate(d.getDate() + 7);
  }
  return eredmeny;
}

function NevelesiEvLetrehozas({ onCreated }: { onCreated: (ev: NevelesiEv) => void }) {
  const aktualisEv = new Date().getFullYear();
  const [kezdoEv, setKezdoEv] = useState(aktualisEv);
  const [korcsoport, setKorcsoport] = useState<string>('vegyes');
  const [letrehozas, setLetrehozas] = useState(false);

  async function letrehoz() {
    setLetrehozas(true);
    const ev = await window.api.nevelesiEvLetrehoz({
      nev: nevelesiEvCimke(kezdoEv),
      kezdo: `${kezdoEv}-09-01`,
      zaro: `${kezdoEv + 1}-06-30`,
      aktiv: 1,
      korcsoport,
    });
    setLetrehozas(false);
    onCreated(ev);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="heading-serif text-3xl font-medium mb-2">Üdv az OvodaNaplóban!</h1>
      <p className="text-ink/60 mb-8">Először hozz létre egy nevelési évet.</p>

      <div className="card text-left max-w-md mx-auto space-y-4">
        <label className="block text-sm">
          <span className="field-label block mb-1">Nevelési év kezdete</span>
          <select
            value={kezdoEv}
            onChange={(e) => setKezdoEv(Number(e.target.value))}
            className="w-full border border-sage-200 rounded px-3 py-2 text-base"
          >
            {[aktualisEv - 1, aktualisEv, aktualisEv + 1].map((ev) => (
              <option key={ev} value={ev}>
                {ev} szeptember – {ev + 1} június ({nevelesiEvCimke(ev)})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="field-label block mb-1">Csoport korosztálya</span>
          <select
            value={korcsoport}
            onChange={(e) => setKorcsoport(e.target.value)}
            className="w-full border border-sage-200 rounded px-3 py-2 text-base"
          >
            <option value="vegyes">Vegyes csoport (3–7 éves)</option>
            <option value="kicsi">Kiscsoport (3–4 éves)</option>
            <option value="kozepso">Középső csoport (4–5 éves)</option>
            <option value="nagy">Nagycsoport (5–7 éves)</option>
          </select>
          <span className="text-xs text-ink/60 block mt-1 leading-snug">
            Ez alapján szűri a heti tervek ötletbörzéje, hogy a korosztályhoz illő
            tevékenységeket javasolja. Évközben módosítható a Beállításokban.
          </span>
        </label>

        <button onClick={letrehoz} disabled={letrehozas} className="btn-primary w-full mt-4">
          {letrehozas ? 'Létrehozás…' : 'Nevelési év létrehozása'}
        </button>
      </div>
    </div>
  );
}

