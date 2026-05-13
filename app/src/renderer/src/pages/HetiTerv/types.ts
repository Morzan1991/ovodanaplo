/**
 * Heti terv oldal közös típusok.
 *
 * Ezeket a HetiTerv.tsx fő-komponens és az alkomponensek (OtletekModal,
 * DokumentumNezet, stb.) is használják.
 */
import type { TeruletTipus } from '@shared/schema';

export interface TeruletAllapot {
  tipus: TeruletTipus;
  tartalom: string;
  iskolaElokeszito: string;
}

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
