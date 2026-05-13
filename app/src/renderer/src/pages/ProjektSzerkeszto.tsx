/**
 * ProjektSzerkeszto — projektterv részletes szerkesztője (TODO-10 Stage A).
 *
 * 19 mezős űrlap, 4 szekcióra tagolva:
 *  1. Alapadatok — cím, dátum (kezdő+záró), cél, téma, nevelési év
 *  2. Pedagógiai feladatok — 4 dimenzió (értelmi, kommunikációs, erkölcsi, testi)
 *  3. Tevékenységek + szervezés — bevontak, előkészületek, alkotó tev., játékok, szabályok
 *  4. Produktumok + eszközök + egyebek — gyermeki+pedagógusi produktumok,
 *     munka jellegű, eszközök, iskola előkészítő összesített, szokások-hagyományok
 *
 * A DOCX-export (TODO-10 Stage B) későbbi session-ben kerül implementálásra.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Projekt, NevelesiEv } from '@shared/schema';

export default function ProjektSzerkeszto() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [projekt, setProjekt] = useState<Partial<Projekt> | null>(null);
  const [evek, setEvek] = useState<NevelesiEv[]>([]);
  const [mentes, setMentes] = useState<'idle' | 'mentes' | 'mentve' | 'hiba'>('idle');
  const [exportAllapot, setExportAllapot] = useState<'idle' | 'exportal' | 'kesz' | 'hiba'>('idle');

  useEffect(() => {
    async function load() {
      const aktiv = await window.api.nevelesiEvAktiv();
      const evekLista = await window.api.nevelesiEvLista();
      setEvek(evekLista);

      if (params.id && params.id !== 'uj') {
        const meglevo = await window.api.projektBetolt(Number(params.id));
        if (meglevo) {
          setProjekt(meglevo);
          return;
        }
      }

      // Új projekt
      setProjekt({
        nevelesiEvId: aktiv?.id ?? evekLista[0]?.id ?? null,
        cim: '',
        kezdoDatum: '',
        zaroDatum: '',
        cel: '',
        tema: '',
        feladatErtelmi: '',
        feladatKommunikacios: '',
        feladatErkolcsi: '',
        feladatTesti: '',
        bevontak: '',
        elokeszuletek: '',
        alkotoTevekenysegek: '',
        jatekok: '',
        szabalyok: '',
        produktumokGyermeki: '',
        produktumokPedagogusi: '',
        munkaJellegu: '',
        ovodapedagogusFeladatai: '',
        eszkozok: '',
        iskolaElokeszitoOsszesitett: '',
        szokasokHagyomanyok: '',
      });
    }
    void load();
  }, [params.id]);

  const update = useCallback(<K extends keyof Projekt>(mezo: K, ertek: Projekt[K]) => {
    setProjekt((prev) => (prev ? { ...prev, [mezo]: ertek } : prev));
  }, []);

  const ment = useCallback(async () => {
    if (!projekt || !projekt.cim?.trim()) {
      window.alert('A cím megadása kötelező.');
      return;
    }
    setMentes('mentes');
    try {
      const result = await window.api.projektMent(projekt as Projekt);
      setProjekt(result);
      setMentes('mentve');
      if (!params.id || params.id === 'uj') {
        navigate(`/projektek/${result.id}/szerkesztes`, { replace: true });
      }
      setTimeout(() => setMentes('idle'), 1500);
    } catch (err) {
      console.error('Projekt mentési hiba:', err);
      setMentes('hiba');
      setTimeout(() => setMentes('idle'), 3000);
    }
  }, [projekt, params.id, navigate]);

  const exportalas = useCallback(async () => {
    if (!projekt?.id) {
      // Először mentsünk
      window.alert('Először mentsd el a projektet, hogy DOCX-be exportálhasd.');
      return;
    }
    setExportAllapot('exportal');
    try {
      const eredmeny = await window.api.exportProjektDocx(projekt.id);
      if (eredmeny.siker) {
        setExportAllapot('kesz');
        setTimeout(() => setExportAllapot('idle'), 2500);
      } else if (eredmeny.hiba === 'megszakítva') {
        setExportAllapot('idle');
      } else {
        setExportAllapot('hiba');
        setTimeout(() => setExportAllapot('idle'), 3000);
      }
    } catch (err) {
      console.error('Projekt DOCX export hiba:', err);
      setExportAllapot('hiba');
      setTimeout(() => setExportAllapot('idle'), 3000);
    }
  }, [projekt?.id]);

  if (!projekt) return <div className="p-8 text-center text-ink/50">Betöltés…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-sage-700 mb-1">
            Projektterv
          </div>
          <input
            type="text"
            value={projekt.cim ?? ''}
            onChange={(e) => update('cim', e.target.value)}
            placeholder="A projekt címe (pl. Olvasni jó, Húsvét, Ősz…)"
            className="heading-serif text-3xl font-medium w-full bg-transparent outline-none border-b border-transparent focus:border-sage-300 transition"
          />
        </div>
        <Link to="/projektek" className="text-sm text-ink/60 hover:text-ink whitespace-nowrap">
          ← Vissza a projektekhez
        </Link>
      </div>

      {/* === 1. ALAPADATOK === */}
      <section className="card mb-6">
        <h2 className="heading-serif text-lg font-medium mb-3">1. Alapadatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Field label="Téma" value={projekt.tema ?? ''} onChange={(v) => update('tema', v)} placeholder="A projekt témája" />
          <SelectField
            label="Nevelési év"
            value={String(projekt.nevelesiEvId ?? '')}
            onChange={(v) => update('nevelesiEvId', v ? Number(v) : null)}
            options={[
              { value: '', label: '— nincs —' },
              ...evek.map((ev) => ({ value: String(ev.id), label: ev.nev })),
            ]}
          />
          <Field
            label="Kezdő dátum"
            value={projekt.kezdoDatum ?? ''}
            onChange={(v) => update('kezdoDatum', v)}
            type="date"
          />
          <Field
            label="Záró dátum"
            value={projekt.zaroDatum ?? ''}
            onChange={(v) => update('zaroDatum', v)}
            type="date"
          />
        </div>
        <Textarea
          label="Cél"
          value={projekt.cel ?? ''}
          onChange={(v) => update('cel', v)}
          placeholder="Mit szeretnél elérni ezzel a projekttel?"
          rows={3}
        />
      </section>

      {/* === 2. PEDAGÓGIAI FELADATOK === */}
      <section className="card mb-6">
        <h2 className="heading-serif text-lg font-medium mb-3">2. Pedagógiai feladatok</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Értelmi feladatok"
            value={projekt.feladatErtelmi ?? ''}
            onChange={(v) => update('feladatErtelmi', v)}
            placeholder="Gondolkodás, figyelem, emlékezet, problémamegoldás…"
            rows={3}
          />
          <Textarea
            label="Kommunikációs feladatok"
            value={projekt.feladatKommunikacios ?? ''}
            onChange={(v) => update('feladatKommunikacios', v)}
            placeholder="Szóbeli kifejezés, szókincs, beszédkészség…"
            rows={3}
          />
          <Textarea
            label="Erkölcsi-szociális feladatok"
            value={projekt.feladatErkolcsi ?? ''}
            onChange={(v) => update('feladatErkolcsi', v)}
            placeholder="Együttműködés, empátia, normák, közösségi viselkedés…"
            rows={3}
          />
          <Textarea
            label="Testi-egészségvédelmi feladatok"
            value={projekt.feladatTesti ?? ''}
            onChange={(v) => update('feladatTesti', v)}
            placeholder="Mozgás, finommotorika, egészséges életmód…"
            rows={3}
          />
        </div>
      </section>

      {/* === 3. TEVÉKENYSÉGEK + SZERVEZÉS === */}
      <section className="card mb-6">
        <h2 className="heading-serif text-lg font-medium mb-3">3. Tevékenységek és szervezés</h2>
        <div className="space-y-3">
          <Textarea
            label="Bevontak"
            value={projekt.bevontak ?? ''}
            onChange={(v) => update('bevontak', v)}
            placeholder="Szülők, dajka, fejlesztő pedagógus, vendég, gyerekek csoportbontása…"
            rows={2}
          />
          <Textarea
            label="Előkészületek"
            value={projekt.elokeszuletek ?? ''}
            onChange={(v) => update('elokeszuletek', v)}
            placeholder="Mit kell előkészíteni a projekt megkezdése előtt?"
            rows={2}
          />
          <Textarea
            label="Alkotó tevékenységek"
            value={projekt.alkotoTevekenysegek ?? ''}
            onChange={(v) => update('alkotoTevekenysegek', v)}
            placeholder="Rajz, festés, mintázás, kézimunka, építés…"
            rows={3}
          />
          <Textarea
            label="Játékok"
            value={projekt.jatekok ?? ''}
            onChange={(v) => update('jatekok', v)}
            placeholder="Mozgásos, körjátékos, szerepjáték, szabályjáték…"
            rows={3}
          />
          <Textarea
            label="Szabályok"
            value={projekt.szabalyok ?? ''}
            onChange={(v) => update('szabalyok', v)}
            placeholder="A projekthez kapcsolódó csoportszabályok, normák…"
            rows={2}
          />
        </div>
      </section>

      {/* === 4. PRODUKTUMOK + ESZKÖZÖK + EGYEBEK === */}
      <section className="card mb-6">
        <h2 className="heading-serif text-lg font-medium mb-3">4. Produktumok és eszközök</h2>
        <div className="space-y-3">
          <Textarea
            label="Gyermeki produktumok"
            value={projekt.produktumokGyermeki ?? ''}
            onChange={(v) => update('produktumokGyermeki', v)}
            placeholder="Mit készítenek a gyerekek? (kép, könyv, kiállítás, előadás…)"
            rows={2}
          />
          <Textarea
            label="Pedagógusi produktumok"
            value={projekt.produktumokPedagogusi ?? ''}
            onChange={(v) => update('produktumokPedagogusi', v)}
            placeholder="Mit készítesz te? (mese-bábok, tematikus tabló, fotók…)"
            rows={2}
          />
          <Textarea
            label="Munka jellegű tevékenységek"
            value={projekt.munkaJellegu ?? ''}
            onChange={(v) => update('munkaJellegu', v)}
            placeholder="Önkiszolgálás, csoportszintű munka, segítségnyújtás…"
            rows={2}
          />
          <Textarea
            label="Óvodapedagógus feladatai"
            value={projekt.ovodapedagogusFeladatai ?? ''}
            onChange={(v) => update('ovodapedagogusFeladatai', v)}
            placeholder="Saját feladataid a projekt során"
            rows={2}
          />
          <Textarea
            label="Eszközök"
            value={projekt.eszkozok ?? ''}
            onChange={(v) => update('eszkozok', v)}
            placeholder="Eszközök, anyagok, segédanyagok"
            rows={2}
          />
        </div>
      </section>

      {/* === 5. EGYEBEK (IE + SZOKÁSOK) === */}
      <section className="card mb-6 border-l-4 border-l-sage-500">
        <h2 className="heading-serif text-lg font-medium mb-3">5. Iskola előkészítő + szokások</h2>
        <div className="space-y-3">
          <Textarea
            label="Iskola előkészítő tevékenységek (összesített)"
            value={projekt.iskolaElokeszitoOsszesitett ?? ''}
            onChange={(v) => update('iskolaElokeszitoOsszesitett', v)}
            placeholder="A projekt egészére összesített iskola-előkészítő képességek (megfigyelőképesség, szókincs, finommotorika, ritmusérzék…)"
            rows={3}
          />
          <Textarea
            label="Szokások-hagyományok"
            value={projekt.szokasokHagyomanyok ?? ''}
            onChange={(v) => update('szokasokHagyomanyok', v)}
            placeholder="Hagyományok, népi szokások, ünnepi elemek a projektben"
            rows={2}
          />
        </div>
      </section>

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-sage-100">
        <button onClick={ment} className="btn-primary">
          {mentes === 'mentes' ? 'Mentés…' : mentes === 'mentve' ? '✓ Mentve' : mentes === 'hiba' ? 'Mentési hiba' : 'Mentés'}
        </button>
        <button
          onClick={exportalas}
          className="btn-secondary"
          disabled={exportAllapot === 'exportal' || !projekt.id}
          title={!projekt.id ? 'Először mentsd el a projektet' : 'Letöltés .docx-ként (Könyv projektterv formátum)'}
        >
          {exportAllapot === 'exportal'
            ? 'Exportálás…'
            : exportAllapot === 'kesz'
              ? '✓ DOCX elmentve'
              : exportAllapot === 'hiba'
                ? 'Export-hiba'
                : '📥 Letöltés .docx-ként'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-sage-200 rounded px-2 py-1.5 text-sm focus:border-sage-500 outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-sage-200 rounded px-2 py-1.5 text-sm focus:border-sage-500 outline-none bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-sage-100 rounded p-2 text-sm leading-relaxed focus:border-sage-500 outline-none"
      />
    </label>
  );
}
