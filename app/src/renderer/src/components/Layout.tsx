import { Outlet, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Beallitas } from '@shared/schema';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/naptar', label: 'Naptár' },
  { to: '/heti-terv', label: 'Heti terv' },
  { to: '/projektek', label: 'Projektek' },
  { to: '/reflexiok', label: 'Reflexiók' },
  { to: '/irodalom', label: 'Irodalom' },
];

export default function Layout() {
  const [beallitas, setBeallitas] = useState<Beallitas | null>(null);

  useEffect(() => {
    void window.api.beallitasokGet().then(setBeallitas);
  }, []);

  const csoportLabel = beallitas
    ? `${beallitas.ovodaNeve ?? 'Óvoda'} — ${beallitas.csoportNeve ?? 'csoport'}${
        beallitas.csoportTipus ? ` (${beallitas.csoportTipus})` : ''
      }`
    : 'Beállítások hiányoznak';

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-sage-100 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sage-500 flex items-center justify-center">
              <span className="text-cream font-serif text-lg font-medium">Ó</span>
            </div>
            <div>
              <div className="heading-serif text-lg font-medium leading-none">OvodaNapló</div>
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
