/**
 * KepessegMultiSelect — chip-rendszer a heti terv ↔ képesség kapcsolatokhoz.
 *
 * 71 képesség 6 kategóriába: értelmi, kommunikációs, erkölcsi, művészeti, testi, egyéb.
 * Színkód kategóriánként (a pasztell paletta alapján).
 *
 * Megjelenítés:
 *  - Kategória-bontás: minden kategória külön szekció
 *  - Chip-ek: aktív (kiválasztva) / inaktív (kattintható) állapot
 *  - Iskola-előkészítő képességek külön jelöléssel (📚 emoji)
 *
 * Használat:
 *   <KepessegMultiSelect
 *     osszesKepesseg={kepessegek}
 *     valasztottIds={selectedIds}
 *     onValtozas={setSelectedIds}
 *   />
 */

import { useMemo } from 'react';
import type { Kepesseg } from '@shared/schema';

interface Props {
  /** A teljes képesség-lista (a `kepessegekLista` IPC-ből). */
  osszesKepesseg: Kepesseg[];
  /** A kiválasztott képességek ID-ja. */
  valasztottIds: Set<number>;
  /** Callback a kiválasztás változására. */
  onValtozas: (ujIds: Set<number>) => void;
}

/** Kategória → cimke + szín-osztály mapping (pasztell paletta). */
const KATEGORIA_META: Record<string, { cimke: string; szin: string; aktivSzin: string }> = {
  ertelmi: {
    cimke: 'Értelmi',
    szin: 'border-sky-200 text-sky-700 hover:bg-sky-50',
    aktivSzin: 'bg-sky-100 border-sky-400 text-sky-800',
  },
  kommunikacios: {
    cimke: 'Kommunikációs',
    szin: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50',
    aktivSzin: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  },
  erkolcsi: {
    cimke: 'Erkölcsi-szociális',
    szin: 'border-mauve-200 text-mauve-700 hover:bg-mauve-50',
    aktivSzin: 'bg-mauve-100 border-mauve-400 text-mauve-800',
  },
  muveszeti: {
    cimke: 'Művészeti',
    szin: 'border-sage-200 text-sage-700 hover:bg-sage-50',
    aktivSzin: 'bg-sage-100 border-sage-400 text-sage-800',
  },
  testi: {
    cimke: 'Testi-mozgásos',
    szin: 'border-terra-400 text-terra-600 hover:bg-terra-400/10',
    aktivSzin: 'bg-terra-400/30 border-terra-600 text-terra-600',
  },
  egyeb: {
    cimke: 'Egyéb',
    szin: 'border-ink/20 text-ink/60 hover:bg-ink/5',
    aktivSzin: 'bg-ink/10 border-ink/40 text-ink/80',
  },
};

/** A kategóriák megjelenítési sorrendje. */
const KATEGORIA_SORREND = ['ertelmi', 'kommunikacios', 'erkolcsi', 'muveszeti', 'testi', 'egyeb'];

export default function KepessegMultiSelect({
  osszesKepesseg,
  valasztottIds,
  onValtozas,
}: Props) {
  // Kategóriánként csoportosítva
  const csoportositott = useMemo(() => {
    const cs: Record<string, Kepesseg[]> = {};
    for (const k of osszesKepesseg) {
      const kat = k.kategoria ?? 'egyeb';
      if (!cs[kat]) cs[kat] = [];
      cs[kat].push(k);
    }
    // Rendezés a kategóriákon belül a név szerint
    for (const kat in cs) {
      cs[kat].sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
    }
    return cs;
  }, [osszesKepesseg]);

  const toggle = (id: number) => {
    const uj = new Set(valasztottIds);
    if (uj.has(id)) uj.delete(id);
    else uj.add(id);
    onValtozas(uj);
  };

  if (osszesKepesseg.length === 0) {
    return (
      <div className="text-xs italic text-ink/50">Betöltés vagy nincs képesség-adat…</div>
    );
  }

  return (
    <div className="space-y-3">
      {KATEGORIA_SORREND.filter((kat) => csoportositott[kat]?.length).map((kat) => {
        const meta = KATEGORIA_META[kat] ?? KATEGORIA_META.egyeb;
        const lista = csoportositott[kat]!;
        const kivalasztottBenne = lista.filter((k) => valasztottIds.has(k.id)).length;
        return (
          <div key={kat}>
            <div className="text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1.5 flex items-center gap-2">
              <span>{meta.cimke}</span>
              {kivalasztottBenne > 0 && (
                <span className="text-[10px] text-ink/40">
                  ({kivalasztottBenne}/{lista.length})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lista.map((k) => {
                const aktiv = valasztottIds.has(k.id);
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => toggle(k.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition ${
                      aktiv ? meta.aktivSzin : meta.szin
                    }`}
                    title={k.iskolaElokeszito ? 'Iskola-előkészítő képesség' : undefined}
                  >
                    {k.iskolaElokeszito ? '📚 ' : ''}
                    {k.nev}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="pt-2 border-t border-sage-100 text-xs text-ink/50">
        {valasztottIds.size > 0
          ? `Összesen ${valasztottIds.size} képesség kiválasztva.`
          : 'Még nincs képesség kiválasztva — kattints a chip-ekre.'}
      </div>
    </div>
  );
}
