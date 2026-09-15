/**
 * Az alkalmazás váza: fejléc, útvonalak és az alsó navigáció.
 *
 * Telefonon az alsó sáv a helyes navigáció — hüvelykujjal elérhető, és nem
 * takarja el a tartalmat görgetés közben.
 */

import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Kezdo from './kepernyok/Kezdo';
import Temak from './kepernyok/Temak';
import TemaReszletek from './kepernyok/TemaReszletek';
import Irodalom from './kepernyok/Irodalom';
import Kedvencek from './kepernyok/Kedvencek';
import Beallitasok from './kepernyok/Beallitasok';

const MENU = [
  { ut: '/kezdo', cimke: 'Most', jel: '📅' },
  { ut: '/temak', cimke: 'Témák', jel: '📚' },
  { ut: '/irodalom', cimke: 'Irodalom', jel: '📖' },
  { ut: '/kedvencek', cimke: 'Kedvenc', jel: '⭐' },
  { ut: '/beallitasok', cimke: 'Beállítás', jel: '⚙️' },
];

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/kezdo" replace />} />
          <Route path="/kezdo" element={<Kezdo />} />
          <Route path="/temak" element={<Temak />} />
          <Route path="/tema/:id" element={<TemaReszletek />} />
          <Route path="/irodalom" element={<Irodalom />} />
          <Route path="/kedvencek" element={<Kedvencek />} />
          <Route path="/beallitasok" element={<Beallitasok />} />
          <Route path="*" element={<Navigate to="/kezdo" replace />} />
        </Routes>
      </main>

      <nav className="biztonsagos-alul border-t border-rozsa-200 bg-white/90 backdrop-blur">
        <div className="flex">
          {MENU.map((m) => (
            <NavLink
              key={m.ut}
              to={m.ut}
              className={({ isActive }) =>
                [
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition',
                  isActive ? 'text-rozsa-700 font-semibold' : 'text-ink/50',
                ].join(' ')
              }
            >
              <span className="text-lg leading-none" aria-hidden>
                {m.jel}
              </span>
              {m.cimke}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
