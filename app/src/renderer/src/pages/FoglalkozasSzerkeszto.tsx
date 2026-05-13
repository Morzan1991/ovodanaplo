import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { FoglalkozasTervezet, Beallitas, TeruletTipus } from '@shared/schema';
import { teruletTipus } from '@shared/schema';
import { vanAdatvedelmiKockazat } from '../lib/utils';

const TEVEKENYSEGI_FORMA_CIMKE: Record<TeruletTipus, string> = {
  kulso_vilag: 'Külső világ tev. megismerésére nevelés',
  matematika: 'Matematikai tartalom',
  verseles_meseles: 'Verselés, mesélés',
  rajzolas_festes: 'Rajzolás, festés, mintázás, kézimunka',
  enek_zene: 'Ének, zene, népi játék, tánc',
  hallas_ritmus: 'Hallás és ritmusérzék',
  mozgas: 'Mindennapos mozgás',
};

const ALAP_MUNKAFORMA = 'frontális, mikrocsoportos, egyéni';
const ALAP_MODSZEREK = 'bemutatás, magyarázat, szemléltetés, cselekedtetés, gyakorlás, ellenőrzés, értékelés';
const ALAP_DIFFERENCIALAS = 'tartalomban, módszerekben, segítségadás módjában és mennyiségében, az egyénre fordított idő mennyiségében';

export default function FoglalkozasSzerkeszto() {
  const params = useParams<{ hetiId?: string; id?: string }>();
  const navigate = useNavigate();

  const [foglalkozas, setFoglalkozas] = useState<Partial<FoglalkozasTervezet> | null>(null);
  const [mentes, setMentes] = useState<'idle' | 'mentes' | 'mentve' | 'hiba'>('idle');
  const [exportAllapot, setExportAllapot] = useState<'idle' | 'exportal' | 'kesz' | 'hiba'>('idle');

  useEffect(() => {
    async function load() {
      const beallitasArr = await window.api.beallitasokGet();
      const b: Beallitas | null = beallitasArr;

      if (params.id && params.id !== 'uj') {
        const meglevo = await window.api.foglalkozasBetolt(Number(params.id));
        if (meglevo) {
          setFoglalkozas(meglevo);
          return;
        }
      }

      // Új tervezet
      setFoglalkozas({
        hetiTervId: params.hetiId ? Number(params.hetiId) : null,
        pedagogusNeve: b?.pedagogusNeve ?? '',
        helyszin: b?.ovodaNeve ?? '',
        idopont: new Date().toISOString().split('T')[0],
        csoport: b?.csoportNeve ?? '',
        csoportTipus: b?.csoportTipus ?? 'vegyes',
        tema: '',
        cel: '',
        feladat: '',
        korcsoport: '',
        idotartam: '',
        eszkozok: '',
        motivacio: '',
        foRezz: '',
        befejezes: '',
        munkaforma: ALAP_MUNKAFORMA,
        modszerek: ALAP_MODSZEREK,
        differencialas: ALAP_DIFFERENCIALAS,
        kepessegfejlesztes: '',
        iskolaElokeszito: '',
      });
    }
    void load();
  }, [params.id, params.hetiId]);

  const update = (field: keyof FoglalkozasTervezet, value: string) =>
    setFoglalkozas((prev) => ({ ...prev, [field]: value }));

  const ment = useCallback(async () => {
    if (!foglalkozas) return;
    setMentes('mentes');
    try {
      const result = await window.api.foglalkozasMent(foglalkozas as FoglalkozasTervezet);
      setFoglalkozas(result);
      setMentes('mentve');
      if (!params.id || params.id === 'uj') {
        navigate(
          params.hetiId
            ? `/heti-terv/${params.hetiId}/foglalkozas/${result.id}`
            : `/foglalkozas/${result.id}`,
          { replace: true },
        );
      }
      setTimeout(() => setMentes('idle'), 1500);
    } catch (err) {
      console.error('Mentési hiba:', err);
      setMentes('hiba');
      setTimeout(() => setMentes('idle'), 3000);
    }
  }, [foglalkozas, params.id, params.hetiId, navigate]);

  const exportalas = useCallback(async () => {
    if (!foglalkozas?.id) {
      await ment();
      return;
    }
    setExportAllapot('exportal');
    try {
      const eredmeny = await window.api.exportFoglalkozasDocx(foglalkozas.id);
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
      console.error('Export hiba:', err);
      setExportAllapot('hiba');
      setTimeout(() => setExportAllapot('idle'), 3000);
    }
  }, [foglalkozas?.id, ment]);

  if (!foglalkozas) return <div className="p-8 text-center text-ink/50">Betöltés…</div>;

  const adatvedelmiTalalat = [
    foglalkozas.tema, foglalkozas.cel, foglalkozas.feladat,
    foglalkozas.motivacio, foglalkozas.foRezz, foglalkozas.befejezes,
  ].some((x) => x && vanAdatvedelmiKockazat(x));

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sage-700 mb-1">
            Foglalkozás-tervezet
          </div>
          <input
            type="text"
            value={foglalkozas.tema ?? ''}
            onChange={(e) => update('tema', e.target.value)}
            placeholder="Tevékenység témája (pl. Szóló szőlő, mosolygó alma…)"
            className="heading-serif text-3xl font-medium w-full bg-transparent outline-none border-b border-transparent focus:border-sage-300 transition"
          />
        </div>
        {params.hetiId ? (
          <Link to={`/heti-terv/${params.hetiId}`} className="text-sm text-ink/60 hover:text-ink whitespace-nowrap ml-4">
            ← Vissza a heti tervhez
          </Link>
        ) : (
          <Link to="/naptar" className="text-sm text-ink/60 hover:text-ink whitespace-nowrap ml-4">
            ← Vissza
          </Link>
        )}
      </div>

      {/* Fejléc adatok */}
      <section className="card mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <Field label="Pedagógus neve" value={foglalkozas.pedagogusNeve ?? ''} onChange={(v) => update('pedagogusNeve', v)} />
        <Field label="Helyszín" value={foglalkozas.helyszin ?? ''} onChange={(v) => update('helyszin', v)} />
        <Field label="Időpont" value={foglalkozas.idopont ?? ''} onChange={(v) => update('idopont', v)} type="date" />
        <Field label="Csoport" value={foglalkozas.csoport ?? ''} onChange={(v) => update('csoport', v)} />
        <SelectField
          label="Csoport típusa"
          value={foglalkozas.csoportTipus ?? 'vegyes'}
          onChange={(v) => update('csoportTipus', v)}
          options={[
            { value: 'vegyes', label: 'Vegyes (3–7)' },
            { value: 'kicsi', label: 'Kicsi (3–4)' },
            { value: 'kozepso', label: 'Középső (4–5)' },
            { value: 'nagy', label: 'Nagy (5–7)' },
          ]}
        />
        <SelectField
          label="Tevékenységi forma"
          value={foglalkozas.tevekenysegiForma ?? ''}
          onChange={(v) => update('tevekenysegiForma', v)}
          options={[
            { value: '', label: '— válassz —' },
            ...teruletTipus.map((t) => ({ value: t, label: TEVEKENYSEGI_FORMA_CIMKE[t] })),
          ]}
        />
        <Field label="Korcsoport" value={foglalkozas.korcsoport ?? ''} onChange={(v) => update('korcsoport', v)} placeholder="pl. 5–6 éves" />
        <Field label="Időtartam" value={foglalkozas.idotartam ?? ''} onChange={(v) => update('idotartam', v)} placeholder="pl. 25 perc" />
      </section>

      {/* Cél / Feladat */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Textarea
          label="Cél"
          value={foglalkozas.cel ?? ''}
          onChange={(v) => update('cel', v)}
          placeholder="A foglalkozás fő célja"
          rows={4}
        />
        <Textarea
          label="Feladat"
          value={foglalkozas.feladat ?? ''}
          onChange={(v) => update('feladat', v)}
          placeholder="Konkrét pedagógiai feladatok"
          rows={4}
        />
      </section>

      {/* Menet */}
      <section className="space-y-4 mb-6">
        <Textarea
          label="Eszközök"
          value={foglalkozas.eszkozok ?? ''}
          onChange={(v) => update('eszkozok', v)}
          placeholder="Eszközök, anyagok listája"
          rows={2}
        />
        <Textarea
          label="Motiváció"
          value={foglalkozas.motivacio ?? ''}
          onChange={(v) => update('motivacio', v)}
          placeholder="Hogyan keltik fel a gyermekek érdeklődését? (vers, dal, kép, eszköz bemutatása…)"
          rows={3}
        />
        <Textarea
          label="Fő rész"
          value={foglalkozas.foRezz ?? ''}
          onChange={(v) => update('foRezz', v)}
          placeholder="A tevékenység részletes menete, lépésről lépésre"
          rows={6}
        />
        <Textarea
          label="Befejezés"
          value={foglalkozas.befejezes ?? ''}
          onChange={(v) => update('befejezes', v)}
          placeholder="Lezárás, értékelés, átvezetés a következő tevékenységhez"
          rows={3}
        />
      </section>

      {/* Lezáró */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Textarea
          label="Munkaforma"
          value={foglalkozas.munkaforma ?? ''}
          onChange={(v) => update('munkaforma', v)}
          rows={2}
        />
        <Textarea
          label="Módszerek"
          value={foglalkozas.modszerek ?? ''}
          onChange={(v) => update('modszerek', v)}
          rows={2}
        />
        <Textarea
          label="Differenciálás"
          value={foglalkozas.differencialas ?? ''}
          onChange={(v) => update('differencialas', v)}
          rows={2}
        />
        <Textarea
          label="Képességfejlesztés"
          value={foglalkozas.kepessegfejlesztes ?? ''}
          onChange={(v) => update('kepessegfejlesztes', v)}
          placeholder="finommotorika, szókincs, …"
          rows={2}
        />
      </section>

      {/* Iskola előkészítő tevékenység — ONAP-megfelelőség, kiemelt szekció */}
      <section className="mb-6 card border-l-4 border-l-sage-500">
        <div className="mb-2 flex items-baseline justify-between gap-2 flex-wrap">
          <h2 className="heading-serif text-lg font-medium text-sage-800">
            Iskola előkészítő tevékenység
          </h2>
          <span className="text-xs text-ink/50">
            ONAP — nagycsoportos / iskola-előkészítő foglalkozásnál fontos
          </span>
        </div>
        <Textarea
          label="Iskola-előkészítő képességek fejlesztése"
          value={foglalkozas.iskolaElokeszito ?? ''}
          onChange={(v) => update('iskolaElokeszito', v)}
          placeholder="Mely iskola-előkészítő képességek fejlesztését célozza ez a foglalkozás? (megfigyelőképesség, szókincs, finommotorika, ritmusérzék, nagymozgások, számfogalom, szín- és formaészlelés, téri tájékozódás…)"
          rows={4}
        />
      </section>

      {adatvedelmiTalalat && (
        <div className="mb-4 p-3 rounded-lg border border-mauve-200 bg-mauve-100/40 text-xs">
          <span className="font-semibold text-mauve-600">⚠ Adatvédelmi tipp:</span>{' '}
          A szövegben olyan kifejezés szerepel, ami közvetlenül azonosíthat egy gyermeket. Érdemes általánosabban fogalmazni.
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-sage-100">
        <button onClick={ment} className="btn-primary">
          {mentes === 'mentes' ? 'Mentés…' : mentes === 'mentve' ? '✓ Mentve' : mentes === 'hiba' ? 'Mentési hiba' : 'Mentés'}
        </button>
        <button onClick={exportalas} className="btn-secondary" disabled={exportAllapot === 'exportal'}>
          {exportAllapot === 'exportal' ? 'Exportálás…' : exportAllapot === 'kesz' ? '✓ DOCX elmentve' : exportAllapot === 'hiba' ? 'Export-hiba' : 'Letöltés .docx-ként'}
        </button>
        {foglalkozas.id && (
          <Link
            to="/reflexiok"
            className="btn-secondary"
            title="A reflexiók központi listája — onnan szerkeszthető vagy itt a területenkénti tartalom-mezőkben írhatsz megjegyzést."
          >
            Reflexiók megnyitása →
          </Link>
        )}
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
