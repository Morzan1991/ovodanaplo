import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Beallitas } from '@shared/schema';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/naptar', label: 'Naptár' },
  { to: '/heti-terv', label: 'Heti terv' },
  { to: '/projektek', label: 'Projektek' },
  { to: '/reflexiok', label: 'Reflexiók' },
  { to: '/kereses', label: '🔍 Keresés' },
  { to: '/irodalom', label: 'Irodalom' },
  { to: '/sugo', label: '? Súgó' },
];

export default function Layout() {
  const [beallitas, setBeallitas] = useState<Beallitas | null>(null);
  // A betöltés és a „nincs adat" két külön állapot. Korábban egybe estek, ezért a
  // fejléc a betöltés másodpercében is azt írta ki, hogy hiányoznak a beállítások.
  const [betoltve, setBetoltve] = useState(false);
  const hely = useLocation();

  // Oldalváltáskor újratöltjük: így a Beállításokban megadott óvoda- és
  // csoportnév azonnal megjelenik a fejlécben, nem csak újraindítás után.
  useEffect(() => {
    let ervenyes = true;
    window.api
      .beallitasokGet()
      .then((b) => {
        if (ervenyes) setBeallitas(b ?? null);
      })
      .catch((err) => {
        console.error('[Layout] a beállítások betöltése nem sikerült:', err);
      })
      .finally(() => {
        if (ervenyes) setBetoltve(true);
      });
    return () => {
      ervenyes = false;
    };
  }, [hely.pathname]);

  /** Emberi nevek a korcsoport-kódokhoz — a fejlécben ne a nyers kód látszódjon. */
  const KORCSOPORT_NEVEK: Record<string, string> = {
    vegyes: 'vegyes csoport',
    kicsi: 'kiscsoport',
    kozepso: 'középső csoport',
    nagy: 'nagycsoport',
  };

  // Az üres szöveg is hiányzónak számít — a `??` csak a null/undefined esetet fogná,
  // így korábban üres óvoda-/csoportnévnél csonka felirat jelent meg.
  const nemUres = (ertek: string | null | undefined, alap: string) =>
    ertek && ertek.trim() ? ertek.trim() : alap;

  // A korosztály akkor is látszódjon, ha az óvoda/csoport nevét még nem töltötte ki
  // — ez a leghasznosabb információ a fejlécben. Ha semmit sem tudunk, hívogató
  // feliratot mutatunk, nem hibaüzenetet.
  const korcsoportSzoveg = beallitas?.csoportTipus
    ? (KORCSOPORT_NEVEK[beallitas.csoportTipus] ?? beallitas.csoportTipus)
    : null;
  const vanNev = Boolean(beallitas?.ovodaNeve?.trim() || beallitas?.csoportNeve?.trim());

  let csoportLabel: string;
  if (!betoltve) {
    csoportLabel = '…';
  } else if (vanNev) {
    csoportLabel = `${nemUres(beallitas?.ovodaNeve, 'Óvoda')} — ${nemUres(
      beallitas?.csoportNeve,
      'csoport',
    )}${korcsoportSzoveg ? ` (${korcsoportSzoveg})` : ''}`;
  } else if (korcsoportSzoveg) {
    csoportLabel = `${korcsoportSzoveg} · add meg az óvoda nevét a Beállításokban`;
  } else {
    csoportLabel = 'Töltsd ki a Beállításokat';
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-sage-100 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sage-500 flex items-center justify-center">
              <span className="text-cream font-serif text-lg font-medium">Ó</span>
            </div>
            <div>
              <div className="heading-serif text-lg font-medium leading-none">ÓvodaNapló</div>
              <div className="text-xs text-ink/60 mt-0.5">{csoportLabel}</div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('px-3 py-1.5 rounded-md text-sm transition', isActive ? 'bg-sage-100 text-sage-700 font-medium' : 'text-ink/60 hover:bg-sage-50')
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="w-px h-5 bg-sage-100 mx-2" />
            <NavLink
              to="/beallitasok"
              className={({ isActive }) =>
                cn('px-3 py-1.5 rounded-md text-sm transition', isActive ? 'bg-sage-100 text-sage-700 font-medium' : 'text-ink/60 hover:bg-sage-50')
              }
            >
              Beállítások
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
