/**
 * DokumentumNezet — Word-szerű, formázott nézet a heti tervről.
 *
 * Times New Roman font, 12pt, KRÉTA-DOCX formátum-megfelelő.
 * Tartalmaz: 7 terület + iskola-előkészítő szekciók + lezáró rész (cél/feladat/...).
 *
 * A komponens SZERKESZTHETŐ — textarea mezőkkel, amik document stílusúak.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import type { TeruletTipus } from '@shared/schema';
import type { HetiTervTeljes } from '../../../../preload/index';
import type { TeruletAllapot } from './types';
import { bulletFormat, bulletParse } from '../../lib/bullet-szoveg';

type TervMezo = 'cel' | 'feladat' | 'differencialas' | 'modszerek' | 'kepessegfejlesztes' | 'eszkozok';

interface Props {
  terv: Partial<HetiTervTeljes>;
  teruletAllapotok: TeruletAllapot[];
  beallitas: { pedagogusNeve?: string | null; ovodaNeve?: string | null; csoportNeve?: string | null } | null;
  onBack: () => void;
  onExport: () => void;
  exportAllapot: 'idle' | 'exportal' | 'kesz' | 'hiba';
  onTeruletUpdate: (tipus: TeruletTipus, mezo: 'tartalom' | 'iskolaElokeszito', ertek: string) => void;
  onTervUpdate: (mezo: TervMezo, value: string) => void;
  /** Az aktív nevelési év korcsoportja — az iskola-előkészítő rész ettől függ. */
  korcsoport: string;
}

/** Auto-resize textarea — magassága a tartalomhoz igazodik. */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = '0';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full resize-none overflow-hidden bg-transparent border-0 outline-none focus:bg-sage-50/30 rounded p-0 ${className ?? ''}`}
      style={{
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
      }}
    />
  );
}

/**
 * Szerkeszthető bullet-lista.
 *
 * MI VOLT A BAJ: a komponens a szülő függvénytörzsében készült, ezért minden
 * billentyűleütés után ÚJ komponens-típus lett belőle — React szemszögéből másik
 * elem —, így a textarea lecserélődött és elvesztette a fókuszt. Egy karakternél
 * többet nem lehetett beírni, és a beszúrt ötletet nem lehetett átfogalmazni.
 * Ezért van modul-szinten, és ezért tartja a gépelt szöveget saját állapotban:
 * a „• " előtag újrarakása gépelés közben elugrasztotta volna a kurzort.
 */
function BulletArea({ szoveg, onSave }: { szoveg: string; onSave: (v: string) => void }) {
  const [helyi, setHelyi] = useState(() => bulletFormat(szoveg));

  // Kívülről érkező változás (pl. ötlet-panel, sablon betöltés) — csak ilyenkor
  // formázunk újra, a saját gépelést nem írjuk felül.
  useEffect(() => {
    if (bulletParse(helyi) !== szoveg) setHelyi(bulletFormat(szoveg));
    // szándékosan csak a külső értékre figyelünk
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [szoveg]);

  return (
    <AutoTextarea
      value={helyi}
      onChange={(v) => {
        setHelyi(v);
        onSave(bulletParse(v));
      }}
      placeholder="• kattints ide az íráshoz…"
      className="pl-4"
    />
  );
}

/** Szerkeszthető inline szöveg — szintén modul-szinten, a fókusz megtartásáért. */
function InlineArea({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  return <AutoTextarea value={value} onChange={onSave} placeholder="kattints ide…" />;
}

export default function DokumentumNezet({
  terv,
  teruletAllapotok,
  onBack,
  onExport,
  exportAllapot,
  onTeruletUpdate,
  onTervUpdate,
  korcsoport,
}: Props) {
  const getTartalom = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.tartalom ?? '';
  const getIskolaElokeszito = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.iskolaElokeszito ?? '';

  const saveTartalom = useCallback(
    (tipus: TeruletTipus) => (val: string) => onTeruletUpdate(tipus, 'tartalom', val),
    [onTeruletUpdate],
  );
  const saveIskola = useCallback(
    (tipus: TeruletTipus) => (val: string) => onTeruletUpdate(tipus, 'iskolaElokeszito', val),
    [onTeruletUpdate],
  );

  // Az iskola-előkészítő az 5-7 éves korosztály (nagy- és vegyes csoport) anyaga.
  // Kis- és középső csoportnál akkor sem jelenítjük meg, ha korábbi sablonból
  // maradt benne tartalom — így a nézet és a DOCX-export egyezik.
  const iskolaElokeszitoKell = korcsoport !== 'kicsi' && korcsoport !== 'kozepso';

  // Iskola-előkészítő szekció — csak ha van tartalma
  const iskolaEloSzoveg = (tipus: TeruletTipus) => {
    if (!iskolaElokeszitoKell) return null;
    const szoveg = getIskolaElokeszito(tipus);
    const sorok = szoveg.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (sorok.length === 0) return null;
    return (
      <div className="mt-3">
        <p className="font-bold">Iskola-előkészítő tevékenység:</p>
        <BulletArea szoveg={szoveg} onSave={saveIskola(tipus)} />
      </div>
    );
  };

  return (
    <div className="min-h-full bg-ink/5">
      {/* Felső műveletsor (csak képernyőre, nyomtatáskor rejtett).
          A görgetést a Layout `main` eleme végzi, a fejléc azon kívül van —
          ezért a sáv `top-0`-ra tapad. (Korábbi `top-[57px]` a fejléc
          magasságával eltolta: alatta üres, átlátszó sávban gördült át a
          dokumentum szövege.) */}
      <div className="sticky top-0 z-20 border-b border-sage-200 bg-cream print:hidden">
        <div className="mx-auto max-w-4xl px-6 py-2 flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="btn-secondary text-sm">
            ← Szerkesztő nézet
          </button>
          <button onClick={onExport} className="btn-primary text-sm" disabled={exportAllapot === 'exportal'}>
            {exportAllapot === 'exportal'
              ? 'Exportálás…'
              : exportAllapot === 'kesz'
                ? '✓ DOCX elmentve'
                : '📥 Letöltés .docx-ként (KRÉTA)'}
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-sm">
            🖨 Nyomtatás / PDF
          </button>
          <span className="ml-auto text-xs text-ink/50 italic">
            Szerkeszthető dokumentum-előnézet — kattints a szövegre.
          </span>
        </div>
      </div>

      {/* A papír */}
      <div className="mx-auto max-w-4xl px-6 py-10 print:py-0">
        <div className="bg-white shadow-paper rounded p-12 print:shadow-none print:p-0">
          <article
            className="text-ink"
            style={{
              fontFamily: 'Times New Roman, Georgia, serif',
              fontSize: '12pt',
              lineHeight: '1.4',
            }}
          >
            {/* 1. Külső világ */}
            <p className="font-bold">Külső világ tevékeny megismerésére nevelés:</p>
            <BulletArea szoveg={getTartalom('kulso_vilag')} onSave={saveTartalom('kulso_vilag')} />

            {/* 2. Matematika */}
            <p className="font-bold mt-3">Matematikai tartalom:</p>
            <BulletArea szoveg={getTartalom('matematika')} onSave={saveTartalom('matematika')} />

            {iskolaEloSzoveg('kulso_vilag')}

            {/* 3. Verselés, mesélés */}
            <p className="font-bold mt-4">Verselés, mesélés:</p>
            <BulletArea szoveg={getTartalom('verseles_meseles')} onSave={saveTartalom('verseles_meseles')} />

            {iskolaEloSzoveg('verseles_meseles')}

            {/* 4. Rajzolás, festés */}
            <p className="font-bold mt-4">
              Rajzolás, festés, mintázás, építés, képalakítás, kézimunka:
            </p>
            <BulletArea szoveg={getTartalom('rajzolas_festes')} onSave={saveTartalom('rajzolas_festes')} />

            {iskolaEloSzoveg('rajzolas_festes')}

            {/* 5. Ének + Hallás-ritmus */}
            <p className="font-bold mt-4">Ének, zene, népi játék, tánc:</p>
            <BulletArea szoveg={getTartalom('enek_zene')} onSave={saveTartalom('enek_zene')} />

            <p className="mt-2">Hallás és ritmusérzék fejlesztés:</p>
            <BulletArea szoveg={getTartalom('hallas_ritmus')} onSave={saveTartalom('hallas_ritmus')} />

            {iskolaEloSzoveg('enek_zene')}

            {/* 6. Mozgás */}
            <p className="font-bold mt-4">Mindennapos mozgás:</p>
            <BulletArea szoveg={getTartalom('mozgas')} onSave={saveTartalom('mozgas')} />

            {iskolaEloSzoveg('mozgas')}

            {/* Lezáró rész */}
            <p className="mt-4">
              <span className="font-bold">Cél: </span>
              <InlineArea value={terv.cel ?? ''} onSave={(v) => onTervUpdate('cel', v)} />
            </p>

            <p className="mt-2">
              <span className="font-bold">Feladat: </span>
              <InlineArea value={terv.feladat ?? ''} onSave={(v) => onTervUpdate('feladat', v)} />
            </p>

            <p className="mt-2">
              <span className="font-bold">Differenciálás: </span>
              <InlineArea value={terv.differencialas ?? ''} onSave={(v) => onTervUpdate('differencialas', v)} />
            </p>

            <p className="mt-2">
              <span className="font-bold">Módszerek: </span>
              <InlineArea value={terv.modszerek ?? ''} onSave={(v) => onTervUpdate('modszerek', v)} />
            </p>

            <p className="mt-2">
              <span className="font-bold">Képességfejlesztés: </span>
              <InlineArea value={terv.kepessegfejlesztes ?? ''} onSave={(v) => onTervUpdate('kepessegfejlesztes', v)} />
            </p>

            <p className="mt-2">
              <span className="font-bold">Eszközök: </span>
              <InlineArea value={terv.eszkozok ?? ''} onSave={(v) => onTervUpdate('eszkozok', v)} />
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
