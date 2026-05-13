/**
 * Preload szkript.
 * A renderer számára kontextus-izoláltan elérhetővé teszi az IPC API-t.
 *
 * Hívható így a renderer oldalon:
 *   window.api.hetiTervLista()
 *   window.api.hetiTervMent({...})
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '../shared/ipc-channels.js';
import type {
  Beallitas,
  UjBeallitas,
  NevelesiEv,
  UjNevelesiEv,
  Projekt,
  UjProjekt,
  HetiTerv,
  UjHetiTerv,
  Terulet,
  UjTerulet,
  FoglalkozasTervezet,
  UjFoglalkozasTervezet,
  Reflexio,
  UjReflexio,
  Esemeny,
  UjEsemeny,
  Irodalom,
  UjIrodalom,
  Unnep,
  Kepesseg,
} from '../shared/schema.js';

export type HetiTervTeljes = HetiTerv & { teruletek: Terulet[] };
export type ExportEredmeny =
  | { siker: true; utvonal: string }
  | { siker: false; hiba: string };
export interface SablonTeljes {
  azonosito: string;
  cim: string;
  kategoria: string;
  javasoltHonap?: number;
  javasoltSorrend?: number;
  kapcsoloUnnep?: string;
  verzio?: number; // 1 vagy 2 — kettős verziók ugyanazon témán
  tema: string;
  cel: string;
  feladat: string;
  teruletek: Record<string, string>;
  iskolaElokeszito: string; // legacy — csak kulso_vilag-é
  iskolaElokeszitoTeruletek?: Record<string, string>; // új — minden főterülethez külön
  kepessegfejlesztes: string;
  eszkozok: string;
}

const api = {
  // Beállítások
  beallitasokGet: (): Promise<Beallitas | null> => ipcRenderer.invoke(IpcChannels.beallitasokGet),
  beallitasokSave: (data: UjBeallitas): Promise<Beallitas> =>
    ipcRenderer.invoke(IpcChannels.beallitasokSave, data),

  // Nevelési év
  nevelesiEvLista: (): Promise<NevelesiEv[]> => ipcRenderer.invoke(IpcChannels.nevelesiEvLista),
  nevelesiEvAktiv: (): Promise<NevelesiEv | null> => ipcRenderer.invoke(IpcChannels.nevelesiEvAktiv),
  nevelesiEvLetrehoz: (data: UjNevelesiEv): Promise<NevelesiEv> =>
    ipcRenderer.invoke(IpcChannels.nevelesiEvLetrehoz, data),

  // Heti tervek
  hetiTervLista: (nevelesiEvId?: number): Promise<HetiTerv[]> =>
    ipcRenderer.invoke(IpcChannels.hetiTervLista, nevelesiEvId),
  hetiTervBetolt: (id: number): Promise<HetiTerv | null> =>
    ipcRenderer.invoke(IpcChannels.hetiTervBetolt, id),
  hetiTervMent: (data: UjHetiTerv & { id?: number }): Promise<HetiTerv> =>
    ipcRenderer.invoke(IpcChannels.hetiTervMent, data),
  hetiTervTorol: (id: number): Promise<HetiTerv> =>
    ipcRenderer.invoke(IpcChannels.hetiTervTorol, id),
  hetiTervTeljesBetolt: (id: number): Promise<HetiTervTeljes | null> =>
    ipcRenderer.invoke(IpcChannels.hetiTervTeljesBetolt, id),
  hetiTervTeljesMent: (
    data: UjHetiTerv & {
      id?: number;
      teruletek: Array<Omit<UjTerulet, 'hetiTervId'> & { id?: number }>;
    },
  ): Promise<HetiTervTeljes> => ipcRenderer.invoke(IpcChannels.hetiTervTeljesMent, data),
  /**
   * Másolja egy meglévő heti terv tartalmát egy új heti tervre (új dátumokkal).
   * Másolódik: téma "(másolat)" jelöléssel, cél, feladat, eszközök, területek
   * tartalma + iskolaElokeszito. A reflexiók NEM kerülnek át.
   */
  hetiTervMasolas: (params: {
    forrasHetiTervId: number;
    ujKezdoDatum: string;
    ujZaroDatum: string;
    ujNevelesiEvId?: number | null;
  }): Promise<HetiTervTeljes> => ipcRenderer.invoke(IpcChannels.hetiTervMasolas, params),
  hetiTervekGeneralasEvre: (
    nevelesiEvId: number,
  ): Promise<
    | { siker: true; generaltak: number; kihagyott: number }
    | { siker: false; hiba: string }
  > => ipcRenderer.invoke(IpcChannels.hetiTervekGeneralasEvre, nevelesiEvId),
  sablonokLista: (): Promise<
    Array<{
      azonosito: string;
      cim: string;
      kategoria: string;
      javasoltHonap: number | null;
      javasoltSorrend: number | null;
      kapcsoloUnnep: string | null;
      verzio: number | null;
      tema: string;
    }>
  > => ipcRenderer.invoke(IpcChannels.sablonokLista),
  sablonBetolt: (
    azonosito: string,
  ): Promise<SablonTeljes | null> => ipcRenderer.invoke(IpcChannels.sablonBetolt, azonosito),
  sablonAjanloDatumra: (datumIso: string): Promise<SablonTeljes | null> =>
    ipcRenderer.invoke(IpcChannels.sablonAjanloDatumra, datumIso),
  sablonokHonapra: (honap: number): Promise<SablonTeljes[]> =>
    ipcRenderer.invoke(IpcChannels.sablonokHonapra, honap),
  otletekBank: (korcsoport: string, tema: string, terulet: string): Promise<string[]> =>
    ipcRenderer.invoke(IpcChannels.otletekBank, korcsoport, tema, terulet),

  // Projektek
  projektLista: (nevelesiEvId?: number): Promise<Projekt[]> =>
    ipcRenderer.invoke(IpcChannels.projektLista, nevelesiEvId),
  projektBetolt: (id: number): Promise<Projekt | null> =>
    ipcRenderer.invoke(IpcChannels.projektBetolt, id),
  projektMent: (data: UjProjekt & { id?: number }): Promise<Projekt> =>
    ipcRenderer.invoke(IpcChannels.projektMent, data),

  // Foglalkozás-tervezetek
  foglalkozasLista: (hetiTervId?: number): Promise<FoglalkozasTervezet[]> =>
    ipcRenderer.invoke(IpcChannels.foglalkozasLista, hetiTervId),
  foglalkozasBetolt: (id: number): Promise<FoglalkozasTervezet | null> =>
    ipcRenderer.invoke(IpcChannels.foglalkozasBetolt, id),
  foglalkozasMent: (data: UjFoglalkozasTervezet & { id?: number }): Promise<FoglalkozasTervezet> =>
    ipcRenderer.invoke(IpcChannels.foglalkozasMent, data),

  // Reflexiók
  reflexioLista: (opts?: {
    hetiTervId?: number;
    foglalkozasId?: number;
    projektId?: number;
  }): Promise<Reflexio[]> => ipcRenderer.invoke(IpcChannels.reflexioLista, opts),
  reflexioMent: (data: UjReflexio & { id?: number }): Promise<Reflexio> =>
    ipcRenderer.invoke(IpcChannels.reflexioMent, data),

  // Események
  esemenyLista: (nevelesiEvId?: number): Promise<Esemeny[]> =>
    ipcRenderer.invoke(IpcChannels.esemenyLista, nevelesiEvId),
  esemenyMent: (data: UjEsemeny & { id?: number }): Promise<Esemeny> =>
    ipcRenderer.invoke(IpcChannels.esemenyMent, data),

  // Irodalom
  irodalomKereses: (opts: {
    tipus?: string;
    szoveg?: string;
    korcsoport?: string;
  }): Promise<Irodalom[]> => ipcRenderer.invoke(IpcChannels.irodalomKereses, opts),
  irodalomHozzaad: (data: UjIrodalom): Promise<Irodalom> =>
    ipcRenderer.invoke(IpcChannels.irodalomHozzaad, data),

  // Ünnepek
  unnepekListaEvre: (): Promise<Unnep[]> => ipcRenderer.invoke(IpcChannels.unnepekListaEvre),

  // Képességek
  kepessegekLista: (): Promise<Kepesseg[]> => ipcRenderer.invoke(IpcChannels.kepessegekLista),
  /** TODO-11: Egy heti terv kapcsolt képességeinek lekérése (M-N) */
  hetiTervKepessegekLista: (hetiTervId: number): Promise<Kepesseg[]> =>
    ipcRenderer.invoke(IpcChannels.hetiTervKepessegekLista, hetiTervId),
  /** TODO-11: Heti terv ↔ képesség kapcsolatok mentése (replace-all) */
  hetiTervKepessegekMent: (params: {
    hetiTervId: number;
    kepessegIds: number[];
  }): Promise<{ siker: boolean; count: number }> =>
    ipcRenderer.invoke(IpcChannels.hetiTervKepessegekMent, params),

  // Export
  exportHetiTervDocx: (hetiTervId: number): Promise<ExportEredmeny> =>
    ipcRenderer.invoke(IpcChannels.exportHetiTervDocx, hetiTervId),
  exportFoglalkozasDocx: (foglalkozasId: number): Promise<ExportEredmeny> =>
    ipcRenderer.invoke(IpcChannels.exportFoglalkozasDocx, foglalkozasId),

  // Backup
  backupKeszit: (): Promise<string | null> => ipcRenderer.invoke(IpcChannels.backupKeszit),

  // App
  appVerzio: (): Promise<string> => ipcRenderer.invoke(IpcChannels.appVerzio),
  appAdattarMegnyit: (): Promise<string> => ipcRenderer.invoke(IpcChannels.appAdattarMegnyit),
};

contextBridge.exposeInMainWorld('api', api);

export type OvodaNaploApi = typeof api;
