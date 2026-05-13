/**
 * IPC végpontok regisztrálása.
 * Minden DB-művelet itt zajlik — a renderer csak invoke()-on keresztül kéri.
 */

import { ipcMain, app, shell, dialog, BrowserWindow } from 'electron';
import { writeFileSync } from 'node:fs';
import { eq, desc, like, or, and } from 'drizzle-orm';
import { IpcChannels } from '../shared/ipc-channels.js';
import {
  beallitasok,
  nevelesiEvek,
  hetiTervek,
  projektek,
  foglalkozasTervezetek,
  reflexiok,
  esemenyek,
  irodalom,
  unnepek,
  kepessegek,
  hetiTervKepesseg,
  teruletek,
  type UjHetiTerv,
  type UjReflexio,
  type UjBeallitas,
  type UjEsemeny,
  type UjFoglalkozasTervezet,
  type UjProjekt,
  type UjNevelesiEv,
  type UjIrodalom,
  type UjTerulet,
  type Beallitas,
} from '../shared/schema.js';
import { getDb, getSqlite, createBackup } from './db/index.js';
import { hetiTervToDocx, foglalkozasToDocx } from './export-docx.js';
import { validate } from './ipc-validate.js';
import {
  ujBeallitasSchema,
  ujNevelesiEvSchema,
  ujHetiTervSchema,
  hetiTervTeljesSchema,
  ujFoglalkozasSchema,
  ujProjektSchema,
  ujReflexioSchema,
  ujEsemenySchema,
  ujIrodalomSchema,
  irodalomKeresesSchema,
} from '../shared/schemas/ipc.js';
import {
  hetekAzEvben,
  sablonHezKivalasztas,
  tervezetEgyHetbol,
  loadSablonok,
  otletekTemara,
  type SablonAdat,
} from './templates/generator.js';
import { join } from 'node:path';

export function registerIpcHandlers(): void {
  const db = getDb();

  // -------- Beállítások --------
  ipcMain.handle(IpcChannels.beallitasokGet, () => {
    const rows = db.select().from(beallitasok).limit(1).all();
    return rows[0] ?? null;
  });

  ipcMain.handle(IpcChannels.beallitasokSave, (_e, raw: unknown) => {
    const data = validate(IpcChannels.beallitasokSave, raw, ujBeallitasSchema) as UjBeallitas;
    const existing = db.select().from(beallitasok).limit(1).all();
    if (existing.length > 0) {
      return db
        .update(beallitasok)
        .set(data)
        .where(eq(beallitasok.id, existing[0].id))
        .returning()
        .get();
    }
    return db.insert(beallitasok).values(data).returning().get();
  });

  // -------- Nevelési év --------
  ipcMain.handle(IpcChannels.nevelesiEvLista, () => {
    return db.select().from(nevelesiEvek).orderBy(desc(nevelesiEvek.kezdo)).all();
  });

  ipcMain.handle(IpcChannels.nevelesiEvAktiv, () => {
    return db.select().from(nevelesiEvek).where(eq(nevelesiEvek.aktiv, 1)).limit(1).all()[0] ?? null;
  });

  ipcMain.handle(IpcChannels.nevelesiEvLetrehoz, (_e, raw: unknown) => {
    const data = validate(IpcChannels.nevelesiEvLetrehoz, raw, ujNevelesiEvSchema) as UjNevelesiEv;
    // Aktívvá tesszük, többit deaktiváljuk
    if (data.aktiv) {
      db.update(nevelesiEvek).set({ aktiv: 0 }).run();
    }
    return db.insert(nevelesiEvek).values(data).returning().get();
  });

  // -------- Heti tervek --------
  ipcMain.handle(IpcChannels.hetiTervLista, (_e, nevelesiEvId?: number) => {
    if (nevelesiEvId) {
      return db
        .select()
        .from(hetiTervek)
        .where(eq(hetiTervek.nevelesiEvId, nevelesiEvId))
        .orderBy(hetiTervek.kezdoDatum)
        .all();
    }
    return db.select().from(hetiTervek).orderBy(desc(hetiTervek.kezdoDatum)).all();
  });

  ipcMain.handle(IpcChannels.hetiTervBetolt, (_e, id: number) => {
    return db.select().from(hetiTervek).where(eq(hetiTervek.id, id)).limit(1).all()[0] ?? null;
  });

  ipcMain.handle(IpcChannels.hetiTervMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.hetiTervMent, raw, ujHetiTervSchema) as UjHetiTerv & {
      id?: number;
    };
    if (data.id) {
      const { id, ...updateData } = data;
      return db
        .update(hetiTervek)
        .set({ ...updateData, modositva: Math.floor(Date.now() / 1000) })
        .where(eq(hetiTervek.id, id))
        .returning()
        .get();
    }
    return db.insert(hetiTervek).values(data).returning().get();
  });

  ipcMain.handle(IpcChannels.hetiTervTorol, (_e, id: number) => {
    return db.delete(hetiTervek).where(eq(hetiTervek.id, id)).returning().get();
  });

  // Heti terv + területek együtt betöltve
  ipcMain.handle(IpcChannels.hetiTervTeljesBetolt, (_e, id: number) => {
    const terv = db.select().from(hetiTervek).where(eq(hetiTervek.id, id)).limit(1).all()[0];
    if (!terv) return null;
    const teruletekLista = db
      .select()
      .from(teruletek)
      .where(eq(teruletek.hetiTervId, id))
      .orderBy(teruletek.sorrend)
      .all();
    return { ...terv, teruletek: teruletekLista };
  });

  // Heti terv + területek mentése tranzakcióban
  ipcMain.handle(IpcChannels.hetiTervTeljesMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.hetiTervTeljesMent, raw, hetiTervTeljesSchema) as (UjHetiTerv & {
      id?: number;
    }) & { teruletek: Array<Omit<UjTerulet, 'hetiTervId'> & { id?: number }> };
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      const { id, teruletek: ujTeruletek, ...tervData } = data;
      let tervRow;
      if (id) {
        tervRow = db
          .update(hetiTervek)
          .set({ ...tervData, modositva: Math.floor(Date.now() / 1000) })
          .where(eq(hetiTervek.id, id))
          .returning()
          .get();
      } else {
        tervRow = db.insert(hetiTervek).values(tervData).returning().get();
      }

      // Régi területek törölve, újak beszúrva (egyszerűbb mint diff-eelni)
      db.delete(teruletek).where(eq(teruletek.hetiTervId, tervRow.id)).run();

      const mentettTeruletek = [];
      for (const ut of ujTeruletek) {
        const { id: _id, ...teruletData } = ut;
        void _id;
        const teruletRow = db
          .insert(teruletek)
          .values({ ...teruletData, hetiTervId: tervRow.id })
          .returning()
          .get();
        mentettTeruletek.push(teruletRow);
      }
      return { ...tervRow, teruletek: mentettTeruletek };
    });
    return tx();
  });

  /**
   * TODO-9: Heti terv másolása egy korábbi hét tartalmából.
   * Másolódik: téma "(másolat)" prefixszel, cél/feladat/differenciálás/módszerek/
   * képességfejlesztés/eszközök + a 7 terület tartalma + iskolaElokeszito.
   * Új modositva/letrehozva timestamp. A reflexiók NEM kerülnek át.
   */
  ipcMain.handle(IpcChannels.hetiTervMasolas, (_e, raw: unknown) => {
    const params = raw as {
      forrasHetiTervId: number;
      ujKezdoDatum: string;
      ujZaroDatum: string;
      ujNevelesiEvId?: number | null;
    };
    if (
      !params ||
      typeof params.forrasHetiTervId !== 'number' ||
      typeof params.ujKezdoDatum !== 'string' ||
      typeof params.ujZaroDatum !== 'string'
    ) {
      throw new Error('[hetiTervMasolas] érvénytelen paraméterek');
    }
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // 1. Forrás heti terv betöltése
      const forras = db
        .select()
        .from(hetiTervek)
        .where(eq(hetiTervek.id, params.forrasHetiTervId))
        .limit(1)
        .all()[0];
      if (!forras) throw new Error('[hetiTervMasolas] forrás heti terv nem található');

      // 2. Új heti terv beszúrása (új dátumok, téma "(másolat)" prefixszel)
      const ujTema = forras.tema ? `(másolat) ${forras.tema}` : '(másolat)';
      const ujTervAdat = {
        nevelesiEvId: params.ujNevelesiEvId ?? forras.nevelesiEvId,
        projektId: forras.projektId,
        hetSzama: null,
        kezdoDatum: params.ujKezdoDatum,
        zaroDatum: params.ujZaroDatum,
        tema: ujTema,
        cel: forras.cel,
        feladat: forras.feladat,
        differencialas: forras.differencialas,
        modszerek: forras.modszerek,
        kepessegfejlesztes: forras.kepessegfejlesztes,
        eszkozok: forras.eszkozok,
      };
      const ujTerv = db.insert(hetiTervek).values(ujTervAdat).returning().get();

      // 3. Területek másolása
      const forrasTeruletek = db
        .select()
        .from(teruletek)
        .where(eq(teruletek.hetiTervId, params.forrasHetiTervId))
        .orderBy(teruletek.sorrend)
        .all();

      const ujTeruletek = [];
      for (const t of forrasTeruletek) {
        const ujT = db
          .insert(teruletek)
          .values({
            hetiTervId: ujTerv.id,
            tipus: t.tipus,
            tartalom: t.tartalom,
            iskolaElokeszito: t.iskolaElokeszito,
            sorrend: t.sorrend,
          })
          .returning()
          .get();
        ujTeruletek.push(ujT);
      }

      return { ...ujTerv, teruletek: ujTeruletek };
    });
    return tx();
  });

  // -------- Projektek --------
  ipcMain.handle(IpcChannels.projektLista, (_e, nevelesiEvId?: number) => {
    if (nevelesiEvId) {
      return db
        .select()
        .from(projektek)
        .where(eq(projektek.nevelesiEvId, nevelesiEvId))
        .orderBy(projektek.kezdoDatum)
        .all();
    }
    return db.select().from(projektek).orderBy(desc(projektek.kezdoDatum)).all();
  });

  ipcMain.handle(IpcChannels.projektBetolt, (_e, id: number) => {
    return db.select().from(projektek).where(eq(projektek.id, id)).limit(1).all()[0] ?? null;
  });

  ipcMain.handle(IpcChannels.projektMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.projektMent, raw, ujProjektSchema) as UjProjekt & {
      id?: number;
    };
    if (data.id) {
      const { id, ...updateData } = data;
      return db
        .update(projektek)
        .set({ ...updateData, modositva: Math.floor(Date.now() / 1000) })
        .where(eq(projektek.id, id))
        .returning()
        .get();
    }
    return db.insert(projektek).values(data).returning().get();
  });

  // -------- Foglalkozás-tervezetek --------
  ipcMain.handle(IpcChannels.foglalkozasLista, (_e, hetiTervId?: number) => {
    if (hetiTervId) {
      return db
        .select()
        .from(foglalkozasTervezetek)
        .where(eq(foglalkozasTervezetek.hetiTervId, hetiTervId))
        .all();
    }
    return db.select().from(foglalkozasTervezetek).orderBy(desc(foglalkozasTervezetek.idopont)).all();
  });

  ipcMain.handle(IpcChannels.foglalkozasBetolt, (_e, id: number) => {
    return (
      db.select().from(foglalkozasTervezetek).where(eq(foglalkozasTervezetek.id, id)).limit(1).all()[0] ??
      null
    );
  });

  ipcMain.handle(IpcChannels.foglalkozasMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.foglalkozasMent, raw, ujFoglalkozasSchema) as UjFoglalkozasTervezet & {
      id?: number;
    };
    if (data.id) {
      const { id, ...updateData } = data;
      return db
        .update(foglalkozasTervezetek)
        .set({ ...updateData, modositva: Math.floor(Date.now() / 1000) })
        .where(eq(foglalkozasTervezetek.id, id))
        .returning()
        .get();
    }
    return db.insert(foglalkozasTervezetek).values(data).returning().get();
  });

  // -------- Reflexiók --------
  ipcMain.handle(IpcChannels.reflexioLista, (_e, opts?: { hetiTervId?: number; foglalkozasId?: number; projektId?: number }) => {
    if (opts?.hetiTervId) {
      return db.select().from(reflexiok).where(eq(reflexiok.hetiTervId, opts.hetiTervId)).all();
    }
    if (opts?.foglalkozasId) {
      return db.select().from(reflexiok).where(eq(reflexiok.foglalkozasId, opts.foglalkozasId)).all();
    }
    if (opts?.projektId) {
      return db.select().from(reflexiok).where(eq(reflexiok.projektId, opts.projektId)).all();
    }
    return db.select().from(reflexiok).orderBy(desc(reflexiok.letrehozva)).all();
  });

  ipcMain.handle(IpcChannels.reflexioMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.reflexioMent, raw, ujReflexioSchema) as UjReflexio & {
      id?: number;
    };
    if (data.id) {
      const { id, ...updateData } = data;
      return db
        .update(reflexiok)
        .set({ ...updateData, modositva: Math.floor(Date.now() / 1000) })
        .where(eq(reflexiok.id, id))
        .returning()
        .get();
    }
    return db.insert(reflexiok).values(data).returning().get();
  });

  // -------- Események --------
  ipcMain.handle(IpcChannels.esemenyLista, (_e, nevelesiEvId?: number) => {
    if (nevelesiEvId) {
      return db.select().from(esemenyek).where(eq(esemenyek.nevelesiEvId, nevelesiEvId)).orderBy(esemenyek.datum).all();
    }
    return db.select().from(esemenyek).orderBy(esemenyek.datum).all();
  });

  ipcMain.handle(IpcChannels.esemenyMent, (_e, raw: unknown) => {
    const data = validate(IpcChannels.esemenyMent, raw, ujEsemenySchema) as UjEsemeny & {
      id?: number;
    };
    if (data.id) {
      const { id, ...updateData } = data;
      return db.update(esemenyek).set(updateData).where(eq(esemenyek.id, id)).returning().get();
    }
    return db.insert(esemenyek).values(data).returning().get();
  });

  // -------- Irodalom --------
  ipcMain.handle(IpcChannels.irodalomKereses, (_e, raw: unknown) => {
    const opts = validate(IpcChannels.irodalomKereses, raw, irodalomKeresesSchema) as {
      tipus?: string;
      szoveg?: string;
      korcsoport?: string;
    };
    const conditions = [];
    if (opts.tipus) conditions.push(eq(irodalom.tipus, opts.tipus as never));
    if (opts.korcsoport) conditions.push(eq(irodalom.korcsoport, opts.korcsoport));
    if (opts.szoveg) {
      const term = `%${opts.szoveg}%`;
      conditions.push(or(like(irodalom.cim, term), like(irodalom.szerzo, term)));
    }
    const q = db.select().from(irodalom);
    if (conditions.length > 0) {
      return q.where(and(...conditions)).orderBy(irodalom.cim).limit(50).all();
    }
    return q.orderBy(irodalom.cim).limit(50).all();
  });

  ipcMain.handle(IpcChannels.irodalomHozzaad, (_e, raw: unknown) => {
    const data = validate(IpcChannels.irodalomHozzaad, raw, ujIrodalomSchema) as UjIrodalom;
    return db.insert(irodalom).values({ ...data, sajat: 1 }).returning().get();
  });

  // -------- Ünnepek --------
  ipcMain.handle(IpcChannels.unnepekListaEvre, () => {
    return db
      .select()
      .from(unnepek)
      .orderBy(unnepek.honap, unnepek.nap)
      .all();
  });

  // -------- Képességek --------
  ipcMain.handle(IpcChannels.kepessegekLista, () => {
    return db.select().from(kepessegek).orderBy(kepessegek.kategoria, kepessegek.nev).all();
  });

  /** TODO-11: Egy heti terv kapcsolt képességei (M-N JOIN). */
  ipcMain.handle(IpcChannels.hetiTervKepessegekLista, (_e, hetiTervId: number) => {
    if (typeof hetiTervId !== 'number') {
      throw new Error('[hetiTervKepessegekLista] érvénytelen hetiTervId');
    }
    // JOIN: heti_terv_kepesseg ⋈ kepessegek
    const rows = db
      .select({
        id: kepessegek.id,
        nev: kepessegek.nev,
        kategoria: kepessegek.kategoria,
        iskolaElokeszito: kepessegek.iskolaElokeszito,
      })
      .from(hetiTervKepesseg)
      .innerJoin(kepessegek, eq(hetiTervKepesseg.kepessegId, kepessegek.id))
      .where(eq(hetiTervKepesseg.hetiTervId, hetiTervId))
      .orderBy(kepessegek.kategoria, kepessegek.nev)
      .all();
    return rows;
  });

  /**
   * TODO-11: Heti terv ↔ képesség kapcsolatok REPLACE-ALL mentése.
   * Törli az adott heti tervhez tartozó összes M-N sort, majd beszúrja az újakat.
   * Tranzakcióban, hogy ne maradjon inkonzisztens állapot.
   */
  ipcMain.handle(IpcChannels.hetiTervKepessegekMent, (_e, raw: unknown) => {
    const params = raw as { hetiTervId: number; kepessegIds: number[] };
    if (
      !params ||
      typeof params.hetiTervId !== 'number' ||
      !Array.isArray(params.kepessegIds)
    ) {
      throw new Error('[hetiTervKepessegekMent] érvénytelen paraméterek');
    }
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // Törlés
      db.delete(hetiTervKepesseg)
        .where(eq(hetiTervKepesseg.hetiTervId, params.hetiTervId))
        .run();
      // Beszúrás (csak ha van mit)
      const egyediek = Array.from(new Set(params.kepessegIds.filter((k) => typeof k === 'number')));
      for (const kid of egyediek) {
        db.insert(hetiTervKepesseg)
          .values({ hetiTervId: params.hetiTervId, kepessegId: kid })
          .run();
      }
      return { siker: true, count: egyediek.length };
    });
    return tx();
  });

  // -------- Backup --------
  ipcMain.handle(IpcChannels.backupKeszit, () => {
    return createBackup();
  });

  // -------- Sablon-alapú generálás --------
  ipcMain.handle(IpcChannels.hetiTervekGeneralasEvre, (_e, nevelesiEvId: number) => {
    try {
      console.log('[generalas] Start, nevelési év id:', nevelesiEvId);
      const ev = db.select().from(nevelesiEvek).where(eq(nevelesiEvek.id, nevelesiEvId)).limit(1).all()[0];
      if (!ev) return { siker: false, hiba: 'Nevelési év nem található' };
      console.log('[generalas] Nevelési év:', ev.kezdo, '→', ev.zaro);

      // Csoport típusa a beállításokból — differenciálás-szöveg ehhez illesztett
      const beall = db.select().from(beallitasok).limit(1).all()[0];
      const csoportTipus = beall?.csoportTipus ?? 'vegyes';
      console.log('[generalas] Csoport típusa:', csoportTipus);

      const meglevoTervek = db
        .select()
        .from(hetiTervek)
        .where(eq(hetiTervek.nevelesiEvId, nevelesiEvId))
        .all();
      const meglevoDatumok = new Set(meglevoTervek.map((t) => t.kezdoDatum));
      console.log('[generalas] Meglévő tervek:', meglevoTervek.length);

      const unnepekLista = db.select().from(unnepek).all();
      const hetek = hetekAzEvben(ev.kezdo, ev.zaro);
      console.log('[generalas] Generálható hetek száma:', hetek.length);

      const hasznaltSablonok = new Set<string>();
      let generaltak = 0;

      const sqlite = getSqlite();
      const tx = sqlite.transaction(() => {
        for (let i = 0; i < hetek.length; i++) {
          const hetKezdo = hetek[i];
          const hetKezdoIso = hetKezdo.toISOString().split('T')[0];

          if (meglevoDatumok.has(hetKezdoIso)) continue;

          const sablon = sablonHezKivalasztas(hetKezdo, unnepekLista, hasznaltSablonok);
          if (sablon) hasznaltSablonok.add(sablon.azonosito);

          const tervezet = tervezetEgyHetbol(hetKezdo, i + 1, sablon, csoportTipus);

          const tervRow = db
            .insert(hetiTervek)
            .values({
              nevelesiEvId: nevelesiEvId,
              hetSzama: tervezet.hetSzama,
              kezdoDatum: tervezet.kezdoDatum,
              zaroDatum: tervezet.zaroDatum,
              tema: tervezet.tema || null,
              cel: tervezet.cel || null,
              feladat: tervezet.feladat || null,
              differencialas: tervezet.differencialas,
              modszerek: tervezet.modszerek,
              kepessegfejlesztes: tervezet.kepessegfejlesztes || null,
              eszkozok: tervezet.eszkozok || null,
            })
            .returning()
            .get();

          for (const t of tervezet.teruletek) {
            if (!t.tartalom.trim() && !t.iskolaElokeszito.trim()) continue;
            db.insert(teruletek).values({
              hetiTervId: tervRow.id,
              tipus: t.tipus as never,
              tartalom: t.tartalom,
              iskolaElokeszito: t.iskolaElokeszito,
              sorrend: t.sorrend,
            }).run();
          }

          generaltak++;
        }
      });
      tx();
      console.log('[generalas] Kész:', generaltak, 'generálva');

      return { siker: true, generaltak, kihagyott: hetek.length - generaltak };
    } catch (err) {
      const hibaUzenet = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
      console.error('[generalas] HIBA:', hibaUzenet);
      return { siker: false, hiba: hibaUzenet };
    }
  });

  // -------- Sablon-meta + teljes betöltés --------
  ipcMain.handle(IpcChannels.sablonokLista, () => {
    try {
      const sablonok = loadSablonok();
      return sablonok.map((s) => ({
        azonosito: s.azonosito,
        cim: s.cim,
        kategoria: s.kategoria,
        javasoltHonap: s.javasoltHonap ?? null,
        javasoltSorrend: s.javasoltSorrend ?? null,
        kapcsoloUnnep: s.kapcsoloUnnep ?? null,
        verzio: s.verzio ?? null,
        tema: s.tema,
      }));
    } catch (err) {
      console.error('[sablon] lista hiba:', err);
      return [];
    }
  });

  ipcMain.handle(IpcChannels.sablonBetolt, (_e, azonosito: string): SablonAdat | null => {
    try {
      const sablonok = loadSablonok();
      return sablonok.find((s) => s.azonosito === azonosito) ?? null;
    } catch (err) {
      console.error('[sablon] betölt hiba:', err);
      return null;
    }
  });

  ipcMain.handle(IpcChannels.sablonAjanloDatumra, (_e, datumIso: string): SablonAdat | null => {
    try {
      const datum = new Date(datumIso);
      const unnepekLista = db.select().from(unnepek).all();
      return sablonHezKivalasztas(datum, unnepekLista, new Set());
    } catch (err) {
      console.error('[sablon] ajanlo hiba:', err);
      return null;
    }
  });

  /**
   * Egy adott hónaphoz tartozó ÖSSZES sablon (V1+V2+legacy) teljes tartalma.
   * Az "Ötletek böngészése" panelhoz: a felhasználó látja az összes alternatív
   * tevékenység-javaslatot és válogathat belőle.
   */
  ipcMain.handle(IpcChannels.sablonokHonapra, (_e, honap: number): SablonAdat[] => {
    try {
      const sablonok = loadSablonok();
      return sablonok.filter((s) => s.javasoltHonap === honap);
    } catch (err) {
      console.error('[sablon] honapra hiba:', err);
      return [];
    }
  });

  /**
   * Korcsoport-specifikus ötlet-bank.
   * Visszaadja egy adott korcsoport + téma + terület hármas 10 bulletjét.
   * Pl. otletekBank('kicsi', 'mikulas', 'verseles_meseles') -> 10 bullet.
   */
  ipcMain.handle(
    IpcChannels.otletekBank,
    (_e, korcsoport: string, tema: string, terulet: string): string[] => {
      try {
        return otletekTemara(korcsoport, tema, terulet);
      } catch (err) {
        console.error('[otletekBank] hiba:', err);
        return [];
      }
    },
  );

  // -------- Export --------
  ipcMain.handle(IpcChannels.exportHetiTervDocx, async (e, hetiTervId: number) => {
    const terv = db.select().from(hetiTervek).where(eq(hetiTervek.id, hetiTervId)).limit(1).all()[0];
    if (!terv) return { siker: false, hiba: 'Heti terv nem található' };

    const teruletekLista = db
      .select()
      .from(teruletek)
      .where(eq(teruletek.hetiTervId, hetiTervId))
      .all();

    const beallitasArr = db.select().from(beallitasok).limit(1).all();
    const beallitas: Beallitas | null = beallitasArr[0] ?? null;

    const sender = BrowserWindow.fromWebContents(e.sender);
    const tema = (terv.tema || 'heti-terv').replace(/[<>:"/\\|?*]/g, '-').slice(0, 60);
    const javasoltNev = `${terv.kezdoDatum}_${tema}.docx`;

    const eredmeny = await dialog.showSaveDialog(sender ?? new BrowserWindow(), {
      title: 'Heti terv mentése .docx-ként',
      defaultPath: javasoltNev,
      filters: [{ name: 'Word dokumentum', extensions: ['docx'] }],
    });
    if (eredmeny.canceled || !eredmeny.filePath) {
      return { siker: false, hiba: 'megszakítva' };
    }

    try {
      const buffer = await hetiTervToDocx({
        hetiTerv: terv,
        teruletek: teruletekLista,
        beallitas,
      });
      writeFileSync(eredmeny.filePath, buffer);
      return { siker: true, utvonal: eredmeny.filePath };
    } catch (err) {
      console.error('[export] DOCX hiba:', err);
      return { siker: false, hiba: String(err) };
    }
  });

  ipcMain.handle(IpcChannels.exportFoglalkozasDocx, async (e, foglalkozasId: number) => {
    const foglalkozas = db
      .select()
      .from(foglalkozasTervezetek)
      .where(eq(foglalkozasTervezetek.id, foglalkozasId))
      .limit(1)
      .all()[0];
    if (!foglalkozas) return { siker: false, hiba: 'Foglalkozás-tervezet nem található' };

    const beallitasArr = db.select().from(beallitasok).limit(1).all();
    const beallitas: Beallitas | null = beallitasArr[0] ?? null;

    const sender = BrowserWindow.fromWebContents(e.sender);
    const tema = (foglalkozas.tema || 'foglalkozas').replace(/[<>:"/\\|?*]/g, '-').slice(0, 60);
    const javasoltNev = `foglalkozas_${tema}.docx`;

    const eredmeny = await dialog.showSaveDialog(sender ?? new BrowserWindow(), {
      title: 'Foglalkozás-tervezet mentése .docx-ként',
      defaultPath: javasoltNev,
      filters: [{ name: 'Word dokumentum', extensions: ['docx'] }],
    });
    if (eredmeny.canceled || !eredmeny.filePath) {
      return { siker: false, hiba: 'megszakítva' };
    }

    try {
      const buffer = await foglalkozasToDocx({ foglalkozas, beallitas });
      writeFileSync(eredmeny.filePath, buffer);
      return { siker: true, utvonal: eredmeny.filePath };
    } catch (err) {
      console.error('[export] DOCX hiba:', err);
      return { siker: false, hiba: String(err) };
    }
  });

  // -------- App --------
  ipcMain.handle(IpcChannels.appVerzio, () => {
    return app.getVersion();
  });

  ipcMain.handle(IpcChannels.appAdattarMegnyit, () => {
    const dir = join(app.getPath('userData'), 'OvodaNaplo');
    return shell.openPath(dir);
  });

  console.log('[ipc] IPC handlerek regisztrálva.');
}
