import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Naptar from './pages/Naptar';
import HetiTerv from './pages/HetiTerv';
import HetiReflexio from './pages/HetiReflexio';
import FoglalkozasSzerkeszto from './pages/FoglalkozasSzerkeszto';
import Projektek from './pages/Projektek';
import ProjektSzerkeszto from './pages/ProjektSzerkeszto';
import Reflexiok from './pages/Reflexiok';
import Irodalom from './pages/Irodalom';
import Beallitasok from './pages/Beallitasok';
import Kereses from './pages/Kereses';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/naptar" replace />} />
        <Route path="naptar" element={<Naptar />} />
        <Route path="heti-terv/:id?" element={<HetiTerv />} />
        <Route path="heti-terv/:id/reflexio" element={<HetiReflexio />} />
        <Route path="heti-terv/:hetiId/foglalkozas/:id" element={<FoglalkozasSzerkeszto />} />
        <Route path="foglalkozas/:id" element={<FoglalkozasSzerkeszto />} />
        <Route path="projektek/:id?" element={<Projektek />} />
        <Route path="projektek/uj" element={<ProjektSzerkeszto />} />
        <Route path="projektek/:id/szerkesztes" element={<ProjektSzerkeszto />} />
        <Route path="reflexiok" element={<Reflexiok />} />
        <Route path="kereses" element={<Kereses />} />
        <Route path="irodalom" element={<Irodalom />} />
        <Route path="beallitasok" element={<Beallitasok />} />
      </Route>
    </Routes>
  );
}
