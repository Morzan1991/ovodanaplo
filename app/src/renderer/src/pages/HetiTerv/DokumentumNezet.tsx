/**
 * DokumentumNezet — Word-szerű, formázott olvasható nézet a heti tervről.
 *
 * Times New Roman font, 12pt, KRÉTA-DOCX formátum-megfelelő.
 * Tartalmaz: 7 terület + iskola előkészítő szekciók + lezáró rész (cél/feladat/...).
 *
 * A komponens NEM szerkeszthető — csak megjelenítésre + nyomtatásra/PDF-re/DOCX-export-ra.
 */

import type { TeruletTipus } from '@shared/schema';
import type { HetiTervTeljes } from '../../../../preload/index';
import type { TeruletAllapot } from './types';

interface Props {
  terv: Partial<HetiTervTeljes>;
  teruletAllapotok: TeruletAllapot[];
  beallitas: { pedagogusNeve?: string | null; ovodaNeve?: string | null; csoportNeve?: string | null } | null;
  onBack: () => void;
  onExport: () => void;
  exportAllapot: 'idle' | 'exportal' | 'kesz' | 'hiba';
}

export default function DokumentumNezet({
  terv,
  teruletAllapotok,
  onBack,
  onExport,
  exportAllapot,
}: Props) {
  const getTartalom = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.tartalom ?? '';
  const getIskolaElokeszito = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.iskolaElokeszito ?? '';

  // Bullet lista: \n-nel szétdarabol → minden sorból egy <li>
  const Bullets = ({ szoveg }: { szoveg: string }) => {
    const sorok = szoveg.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sorok.length === 0) return null;
    return (
      <ul className="list-disc pl-6 mt-1 space-y-0.5">
        {sorok.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    );
  };

  // Verselés blokk — kibontja "Mesék:" és "Mondókák és versek:" alszekciókra
  const VerselesBlokk = ({ szoveg }: { szoveg: string }) => {
    const trimmed = (szoveg ?? '').trim();
    if (!trimmed) return null;
    const mesekMatch = trimmed.match(/Mes[éeè]k\s*:\s*\n?/i);
    const mondokakMatch = trimmed.match(/Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*\n?/i);

    if (!mesekMatch && !mondokakMatch) {
      return <Bullets szoveg={trimmed} />;
    }
    let mesekResz = '', mondokakResz = '', elotteResz = '';
    if (mesekMatch && mondokakMatch) {
      const ms = mesekMatch.index! + mesekMatch[0].length;
      const moStart = mondokakMatch.index!;
      elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
      mesekResz = trimmed.substring(ms, moStart).trim();
      mondokakResz = trimmed.substring(moStart + mondokakMatch[0].length).trim();
    } else if (mesekMatch) {
      elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
      mesekResz = trimmed.substring(mesekMatch.index! + mesekMatch[0].length).trim();
    } else if (mondokakMatch) {
      elotteResz = trimmed.substring(0, mondokakMatch.index!).trim();
      mondokakResz = trimmed.substring(mondokakMatch.index! + mondokakMatch[0].length).trim();
    }
    return (
      <>
        {elotteResz && <Bullets szoveg={elotteResz} />}
        {mesekResz && (
          <>
            <p className="font-bold mt-2">Mesék:</p>
            <Bullets szoveg={mesekResz} />
          </>
        )}
        {mondokakResz && (
          <>
            <p className="font-bold mt-2">Mondókák és versek:</p>
            <Bullets szoveg={mondokakResz} />
          </>
        )}
      </>
    );
  };

  // Mozgás blokk — kibontja "Tornatermi:" és "Csoportban/udvaron:" alszekciókra
  const MozgasBlokk = ({ szoveg }: { szoveg: string }) => {
    const trimmed = (szoveg ?? '').trim();
    if (!trimmed) return null;
    const tornaMatch = trimmed.match(/Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*\n?/i);
    const udvarMatch = trimmed.match(/Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*\n?/i);

    if (!tornaMatch && !udvarMatch) {
      return <Bullets szoveg={trimmed} />;
    }
    let tornaResz = '', udvarResz = '', elotteResz = '';
    if (tornaMatch && udvarMatch) {
      const ts = tornaMatch.index! + tornaMatch[0].length;
      const uStart = udvarMatch.index!;
      elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
      tornaResz = trimmed.substring(ts, uStart).trim();
      udvarResz = trimmed.substring(uStart + udvarMatch[0].length).trim();
    } else if (tornaMatch) {
      elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
      tornaResz = trimmed.substring(tornaMatch.index! + tornaMatch[0].length).trim();
    } else if (udvarMatch) {
      elotteResz = trimmed.substring(0, udvarMatch.index!).trim();
      udvarResz = trimmed.substring(udvarMatch.index! + udvarMatch[0].length).trim();
    }
    return (
      <>
        {elotteResz && <Bullets szoveg={elotteResz} />}
        {tornaResz && (
          <>
            <p className="mt-2">Tornatermi tevékenységek:</p>
            <Bullets szoveg={tornaResz} />
          </>
        )}
        {udvarResz && (
          <>
            <p className="mt-2">Csoportban/udvaron végzett mindennapos mozgás:</p>
            <Bullets szoveg={udvarResz} />
          </>
        )}
      </>
    );
  };

  // Iskola előkészítő szekció — félkövér fejléc + bullet lista
  // Ha üres a szöveg, NEM jelenik meg a fejléc (kerüljük a üres bekezdést)
  const IskolaElokeszito = ({ szoveg }: { szoveg: string }) => {
    const sorok = szoveg.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sorok.length === 0) return null;
    return (
      <div className="mt-3">
        <p className="font-bold">Iskola előkészítő tevékenység:</p>
        <Bullets szoveg={szoveg} />
      </div>
    );
  };

  return (
    <div className="min-h-full bg-ink/5">
      {/* Felső műveletsor (csak képernyőre, nyomtatáskor rejtett) */}
      <div className="sticky top-[57px] z-10 border-b border-sage-200 bg-cream/95 backdrop-blur print:hidden">
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
            Olvasható dokumentum-előnézet — szerkesztéshez kapcsolj vissza.
          </span>
        </div>
      </div>

      {/* A papír — fejléc nélkül, ahogy a Hetiterv üres.docx-en */}
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
            {/* 1. Külső világ + 2. Matematika (közös iskolaElokeszito) */}
            <p className="font-bold">Külső világ tevékeny megismerésére nevelés:</p>
            <Bullets szoveg={getTartalom('kulso_vilag')} />

            <p className="font-bold mt-3">Matematikai tartalom:</p>
            <Bullets szoveg={getTartalom('matematika')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('kulso_vilag')} />

            {/* 3. Verselés, mesélés (Mesék: + Mondókák alfejezet) */}
            <p className="font-bold mt-4">Verselés, mesélés:</p>
            <VerselesBlokk szoveg={getTartalom('verseles_meseles')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('verseles_meseles')} />

            {/* 4. Rajzolás, festés */}
            <p className="font-bold mt-4">
              Rajzolás, festés, mintázás, építés, képalakítás, kézimunka:
            </p>
            <Bullets szoveg={getTartalom('rajzolas_festes')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('rajzolas_festes')} />

            {/* 5. Ének + Hallás-ritmus */}
            <p className="font-bold mt-4">Ének, zene, népi játék, tánc:</p>
            <Bullets szoveg={getTartalom('enek_zene')} />

            <p className="mt-2">Hallás és ritmusérzék fejlesztés:</p>
            <Bullets szoveg={getTartalom('hallas_ritmus')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('enek_zene')} />

            {/* 6. Mindennapos mozgás (Tornatermi + Csoportban/udvaron) */}
            <p className="font-bold mt-4">Mindennapos mozgás:</p>
            <MozgasBlokk szoveg={getTartalom('mozgas')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('mozgas')} />

            {/* Lezáró rész — Cél / Feladat / Differenciálás / Módszerek / Képességfejlesztés / Eszközök */}
            <p className="mt-4">
              <span className="font-bold">Cél: </span>
              <span>{terv.cel}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Feladat: </span>
              <span>{terv.feladat}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Differenciálás: </span>
              <span>{terv.differencialas}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Módszerek: </span>
              <span>{terv.modszerek}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Képességfejlesztés: </span>
              <span>{terv.kepessegfejlesztes}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Eszközök: </span>
              <span>{terv.eszkozok}</span>
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
