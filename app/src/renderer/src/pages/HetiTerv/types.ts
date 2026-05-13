/**
 * Heti terv oldal közös típusok + konstansok.
 *
 * Ezeket a HetiTerv.tsx fő-komponens és az alkomponensek (OtletekModal,
 * DokumentumNezet, SablonValaszto, OsszegzoSzekcio, TeruletSzekciok)
 * is használják.
 */
import type { TeruletTipus } from '@shared/schema';

export interface TeruletAllapot {
  tipus: TeruletTipus;
  tartalom: string;
  iskolaElokeszito: string;
}

export interface TeruletDefinicio {
  tipus: TeruletTipus;
  cim: string;
  placeholder: string;
  szint: 'fo' | 'al';
  szuloTipus?: TeruletTipus;
}

/**
 * A 7 (5 fő + 2 al) ONAP-területi-tartalom-definíció.
 * Fő-szekciók: kulso_vilag, verseles_meseles, rajzolas_festes, enek_zene, mozgas.
 * Al-szekciók: matematika (kulso_vilag alá), hallas_ritmus (enek_zene alá).
 */
export const TERULET_DEFINICIO: TeruletDefinicio[] = [
  {
    tipus: 'kulso_vilag',
    cim: 'Külső világ tevékeny megismerésére nevelés',
    placeholder: 'Mit fognak megtapasztalni, megismerni a gyerekek a külső világból?',
    szint: 'fo',
  },
  {
    tipus: 'matematika',
    cim: 'Matematikai tartalom',
    placeholder: 'Számlálás, halmazok, formák, sorrendezés…',
    szint: 'al',
    szuloTipus: 'kulso_vilag',
  },
  {
    tipus: 'verseles_meseles',
    cim: 'Verselés, mesélés',
    placeholder: 'Mesék és mondókák, versek a hétre',
    szint: 'fo',
  },
  {
    tipus: 'rajzolas_festes',
    cim: 'Rajzolás, festés, mintázás, építés, képalakítás, kézimunka',
    placeholder: 'Alkotó tevékenységek',
    szint: 'fo',
  },
  {
    tipus: 'enek_zene',
    cim: 'Ének, zene, népi játék, tánc',
    placeholder: 'Énekek, körjátékok, zenehallgatás',
    szint: 'fo',
  },
  {
    tipus: 'hallas_ritmus',
    cim: 'Hallás és ritmusérzék fejlesztés',
    placeholder: 'Ritmusjáték, visszatapsolás, fogalompárok…',
    szint: 'al',
    szuloTipus: 'enek_zene',
  },
  {
    tipus: 'mozgas',
    cim: 'Mindennapos mozgás',
    placeholder: 'Tornatermi és udvari mozgásos tevékenységek',
    szint: 'fo',
  },
];

export interface SablonMeta {
  azonosito: string;
  cim: string;
  kategoria: string;
  javasoltHonap: number | null;
  javasoltSorrend: number | null;
  kapcsoloUnnep: string | null;
  verzio: number | null;
  tema: string;
}

/** Az "Ötletek böngészése" panel forrás-objektum típusa. */
export interface SablonOtletForras {
  azonosito: string;
  cim: string;
  verzio?: number | null;
  teruletek: Record<string, string>;
  iskolaElokeszitoTeruletek?: Record<string, string>;
  iskolaElokeszito?: string;
}
