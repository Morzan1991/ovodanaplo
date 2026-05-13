/**
 * IPC végpontok regisztrálása.
 * Minden DB-művelet itt zajlik — a renderer csak invoke()-on keresztül kéri.
 */

import { ipcMain, app, shell, dialog, BrowserWindow } from 'electron';
import { writeFileSync } from 'node:fs';
import { eq, desc, like, or, and, inArray } from 'drizzle-orm';
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
import { hetiTervToDocx, foglalkozasToDocx, projektToDocx } from './export-docx.js';
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
    // K4 fix: get → if-exist update : insert TRANZAKCIÓBAN, hogy két párhuzamos hívás ne hozzon létre duplikátumot.
    // (Korábban: ha két IPC kérés egyszerre futott, mindkettő üres existing-ot látott → két INSERT.)
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
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
    return tx();
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

  /**
   * Egy nevelési év kapcsolódó tartalmainak darabszáma.
   * Konfirmáció előtt mutatjuk a felhasználónak, hogy lássa mi vész el.
   */
  ipcMain.handle(IpcChannels.nevelesiEvStatistika, (_e, id: number) => {
    if (typeof id !== 'number') return { hetiTervek: 0, projektek: 0, esemenyek: 0, foglalkozasok: 0, reflexiok: 0 };
    const hetiTervRows = db.select({ id: hetiTervek.id }).from(hetiTervek).where(eq(hetiTervek.nevelesiEvId, id)).all();
    const projektRows = db.select({ id: projektek.id }).from(projektek).where(eq(projektek.nevelesiEvId, id)).all();
    const hetiIds = hetiTervRows.map((h) => h.id);
    const projektIds = projektRows.map((p) => p.id);
    // foglalkozas-tervezetek a heti-terven keresztül kapcsolódnak
    const foglalkozasok = hetiIds.length > 0
      ? db.select({ id: foglalkozasTervezetek.id }).from(foglalkozasTervezetek).where(inArray(foglalkozasTervezetek.hetiTervId, hetiIds)).all().length
      : 0;
    // reflexiók: heti, foglalkozás, projekt — összegzés
    // K1 fix: paraméteres inArray Drizzle-vel raw .join(',') helyett (SQL injection védelem + best practice)
    let reflexioCount = 0;
    if (hetiIds.length > 0) {
      reflexioCount += db.select({ id: reflexiok.id }).from(reflexiok).where(inArray(reflexiok.hetiTervId, hetiIds)).all().length;
    }
    if (projektIds.length > 0) {
      reflexioCount += db.select({ id: reflexiok.id }).from(reflexiok).where(inArray(reflexiok.projektId, projektIds)).all().length;
    }
    const esemenyekCount = db.select({ id: esemenyek.id }).from(esemenyek).where(eq(esemenyek.nevelesiEvId, id)).all().length;
    return {
      hetiTervek: hetiTervRows.length,
      projektek: projektRows.length,
      esemenyek: esemenyekCount,
      foglalkozasok,
      reflexiok: reflexioCount,
    };
  });

  /**
   * Nevelési év CASCADE törlése — tranzakcióban.
   *
   * Törlési sorrend (FK megsértés elkerülésére):
   *  1. reflexiok (heti/foglalkozas/projekt-kapcsolatok)
   *  2. foglalkozas_tervezetek (heti tervhez kapcsolódók)
   *  3. heti_tervek — CASCADE töröli: teruletek, heti_terv_kepesseg
   *  4. projektek
   *  5. esemenyek
   *  6. nevelesi_evek
   *
   * Ha az aktív évet töröltük, automatikusan a legfrissebb másikra váltunk.
   */
  ipcMain.handle(IpcChannels.nevelesiEvTorol, (_e, id: number) => {
    if (typeof id !== 'number') throw new Error('[nevelesiEvTorol] érvénytelen id');
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // 1. Lekérdezzük a kapcsolódó id-kat
      const hetiIds = db.select({ id: hetiTervek.id }).from(hetiTervek).where(eq(hetiTervek.nevelesiEvId, id)).all().map((h) => h.id);
      const projektIds = db.select({ id: projektek.id }).from(projektek).where(eq(projektek.nevelesiEvId, id)).all().map((p) => p.id);
      const foglalkozasIds = hetiIds.length > 0
        ? db.select({ id: foglalkozasTervezetek.id }).from(foglalkozasTervezetek).where(inArray(foglalkozasTervezetek.hetiTervId, hetiIds)).all().map((f) => f.id)
        : [];

      // 2. Reflexiók — heti/foglalkozas/projekt szerint
      if (hetiIds.length > 0) {
        db.delete(reflexiok).where(inArray(reflexiok.hetiTervId, hetiIds)).run();
      }
      if (foglalkozasIds.length > 0) {
        db.delete(reflexiok).where(inArray(reflexiok.foglalkozasId, foglalkozasIds)).run();
      }
      if (projektIds.length > 0) {
        db.delete(reflexiok).where(inArray(reflexiok.projektId, projektIds)).run();
      }

      // 3. Foglalkozás-tervezetek
      if (foglalkozasIds.length > 0) {
        db.delete(foglalkozasTervezetek).where(inArray(foglalkozasTervezetek.id, foglalkozasIds)).run();
      }

      // 4. Heti tervek (a teruletek + heti_terv_kepesseg CASCADE-el törlődik)
      if (hetiIds.length > 0) {
        db.delete(hetiTervek).where(inArray(hetiTervek.id, hetiIds)).run();
      }

      // 5. Projektek
      if (projektIds.length > 0) {
        db.delete(projektek).where(inArray(projektek.id, projektIds)).run();
      }

      // 6. Események
      db.delete(esemenyek).where(eq(esemenyek.nevelesiEvId, id)).run();

      // 7. Maga a nevelési év
      const torolt = db.delete(nevelesiEvek).where(eq(nevelesiEvek.id, id)).returning().all();
      if (torolt.length === 0) {
        throw new Error('Nevelési év nem található');
      }

      // 8. Ha aktív év volt: a legfrissebb másikat tegyük aktívvá
      let ujAktivId: number | null = null;
      const volt_aktiv = torolt[0].aktiv === 1;
      if (volt_aktiv) {
        const masikEvek = db.select().from(nevelesiEvek).orderBy(desc(nevelesiEvek.kezdo)).limit(1).all();
        if (masikEvek.length > 0) {
          db.update(nevelesiEvek).set({ aktiv: 1 }).where(eq(nevelesiEvek.id, masikEvek[0].id)).run();
          ujAktivId = masikEvek[0].id;
        }
      }
      return { siker: true, ujAktivId };
    });
    return tx();
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

  /**
   * Heti terv CASCADE-elt törlése.
   * A FK constraint-ek miatt sorrend kötelező:
   *  1. reflexiok (heti_terv_id és foglalkozas_id-n keresztül)
   *  2. foglalkozas_tervezetek
   *  3. heti_tervek (a teruletek + heti_terv_kepesseg CASCADE-elnek)
   */
  ipcMain.handle(IpcChannels.hetiTervTorol, (_e, id: number) => {
    if (typeof id !== 'number') throw new Error('[hetiTervTorol] érvénytelen id');
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // Kapcsolódó foglalkozás-tervezetek id-ja (a reflexiók törléséhez)
      const foglalkozasIds = db
        .select({ id: foglalkozasTervezetek.id })
        .from(foglalkozasTervezetek)
        .where(eq(foglalkozasTervezetek.hetiTervId, id))
        .all()
        .map((f) => f.id);

      // 1. Reflexiók: a heti terv KÖZVETLENÜL kapcsolódó + foglalkozás-kapcsoltak
      db.delete(reflexiok).where(eq(reflexiok.hetiTervId, id)).run();
      if (foglalkozasIds.length > 0) {
        db.delete(reflexiok).where(inArray(reflexiok.foglalkozasId, foglalkozasIds)).run();
      }

      // 2. Foglalkozás-tervezetek
      db.delete(foglalkozasTervezetek).where(eq(foglalkozasTervezetek.hetiTervId, id)).run();

      // 3. Maga a heti terv (teruletek + heti_terv_kepesseg CASCADE)
      return db.delete(hetiTervek).where(eq(hetiTervek.id, id)).returning().get();
    });
    return tx();
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

  // Projekt törlése (kapcsolódó reflexiók törölve, heti tervek projektId-ja NULL-ra)
  ipcMain.handle(IpcChannels.projektTorol, (_e, id: number) => {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new Error('[projektTorol] érvénytelen id');
    }
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // 1. Kapcsolódó heti tervek projektId-ja → NULL (heti tervek megmaradnak)
      db.update(hetiTervek).set({ projektId: null }).where(eq(hetiTervek.projektId, id)).run();

      // 2. Projekthez kötött reflexiók törlése
      db.delete(reflexiok).where(eq(reflexiok.projektId, id)).run();

      // 3. Maga a projekt
      const torolt = db.delete(projektek).where(eq(projektek.id, id)).returning().all();
      if (torolt.length === 0) {
        throw new Error(`Projekt nem található: id=${id}`);
      }
      return { id, sikeres: true };
    });
    return tx();
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

  // Foglalkozás-tervezet törlése (kapcsolódó reflexiók is törölve)
  ipcMain.handle(IpcChannels.foglalkozasTorol, (_e, id: number) => {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new Error('[foglalkozasTorol] érvénytelen id');
    }
    const sqlite = getSqlite();
    const tx = sqlite.transaction(() => {
      // 1. Kapcsolódó reflexiók törlése
      db.delete(reflexiok).where(eq(reflexiok.foglalkozasId, id)).run();

      // 2. Maga a foglalkozás
      const torolt = db.delete(foglalkozasTervezetek).where(eq(foglalkozasTervezetek.id, id)).returning().all();
      if (torolt.length === 0) {
        throw new Error(`Foglalkozás nem található: id=${id}`);
      }
      return { id, sikeres: true };
    });
    return tx();
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

  // M6: egyedi reflexió-törlés (eddig csak heti terven keresztül CASCADE volt elérhető)
  ipcMain.handle(IpcChannels.reflexioTorol, (_e, id: number) => {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new Error('[reflexioTorol] érvénytelen id');
    }
    const torolt = db.delete(reflexiok).where(eq(reflexiok.id, id)).returning().get();
    if (!torolt) {
      throw new Error(`Reflexió nem található: id=${id}`);
    }
    return { id: torolt.id, sikeres: true };
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

  /**
   * TODO-20: Téma-duplikáció ellenőrzés.
   * Visszaadja az olyan heti terveket az adott nevelési évben, amelyek témája
   * részben (LIKE %{normCim}%) tartalmazza a sablon-címet. A `kivetelId` paraméterrel
   * az aktuális heti tervet ki lehet hagyni (szerkesztéskor).
   */
  ipcMain.handle(IpcChannels.hetiTervekTemaDuplikacio, (_e, raw: unknown) => {
    const params = raw as { cim: string; nevelesiEvId?: number | null; kivetelId?: number | null };
    if (!params || typeof params.cim !== 'string' || params.cim.trim().length === 0) return [];
    // A "(másolat) " prefixet kihagyjuk a keresésből, hogy szebben matchelje
    const tisztaCim = params.cim.replace(/^\(m[áa]solat\)\s*/i, '').trim();
    if (tisztaCim.length < 3) return [];
    const term = `%${tisztaCim}%`;
    const conditions = [like(hetiTervek.tema, term)];
    if (params.nevelesiEvId) {
      conditions.push(eq(hetiTervek.nevelesiEvId, params.nevelesiEvId));
    }
    let q = db.select().from(hetiTervek).where(and(...conditions)).orderBy(hetiTervek.kezdoDatum).all();
    if (params.kivetelId) {
      q = q.filter((t) => t.id !== params.kivetelId);
    }
    return q;
  });

  /**
   * TODO-15: "Tavaly ilyenkor" emlékeztető — az adott dátum hónap-napjához tartozó
   * heti tervek korábbi évekből. Pl. ha most október 12. van, kérjük le az előző
   * 5 év október 10-15. közötti heti terveit.
   *
   * Kerekítés: a `kezdoDatum` hónap-napjához ±3 nap tűréshatáron belül.
   */
  ipcMain.handle(IpcChannels.hetiTervekTavalyiEvbol, (_e, datum: unknown) => {
    if (typeof datum !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return [];
    const sqlite = getSqlite();
    // SQLite-ban a strftime('%m-%d', kezdoDatum) adja a hónap-napot
    // ±3 nap tűréshatár a hét-csúszás kompenzálására
    try {
      const rows = sqlite
        .prepare(
          `SELECT * FROM heti_tervek
           WHERE
             substr(kezdo_datum, 6, 5) BETWEEN ? AND ?
             AND substr(kezdo_datum, 1, 4) != ?
           ORDER BY kezdo_datum DESC
           LIMIT 5`,
        )
        .all(
          (() => {
            // -3 nap a hónap-napból
            const d = new Date(datum);
            d.setDate(d.getDate() - 3);
            return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })(),
          (() => {
            const d = new Date(datum);
            d.setDate(d.getDate() + 3);
            return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          })(),
          datum.slice(0, 4),
        );
      return rows;
    } catch (err) {
      console.error('[hetiTervekTavalyiEvbol] hiba:', err);
      return [];
    }
  });

  /**
   * TODO-12: FTS5 keresés a heti tervek között.
   * A kereső-szöveg minimum 2 karakter, különben üres tömb.
   * A találatok a heti_terv_fts virtuális tábla MATCH operátorán át.
   */
  ipcMain.handle(IpcChannels.keresesHetiTervekben, (_e, kereses: unknown) => {
    if (typeof kereses !== 'string' || kereses.trim().length < 2) return [];
    const sqlite = getSqlite();
    // FTS5 query — a felhasználói szöveget átalakítjuk biztonságosabb formára:
    // - dupla idézőjelek escape (FTS5 phrase-query)
    // - * suffix-szel prefix-match minden szóra
    const escaped = kereses.trim().replace(/"/g, '""');
    const ftsQuery = escaped
      .split(/\s+/)
      .filter((s) => s.length > 0)
      .map((s) => `"${s}"*`)
      .join(' ');
    try {
      const rows = sqlite
        .prepare(
          `SELECT t.*, snippet(heti_terv_fts, -1, '<mark>', '</mark>', '…', 12) AS snippet
           FROM heti_terv_fts
           INNER JOIN heti_tervek t ON heti_terv_fts.heti_terv_id = t.id
           WHERE heti_terv_fts MATCH ?
           ORDER BY rank
           LIMIT 50`,
        )
        .all(ftsQuery);
      return rows;
    } catch (err) {
      console.error('[keresesHetiTervekben] FTS hiba:', err);
      return [];
    }
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

    // K3 fix: ne hozzunk létre orphan BrowserWindow-t fallback-ben.
    // Az Electron dialog.showSaveDialog window-paraméter opcionális — ha sender null, hívjuk window nélkül.
    const sender = BrowserWindow.fromWebContents(e.sender);
    const tema = (terv.tema || 'heti-terv').replace(/[<>:"/\\|?*]/g, '-').slice(0, 60);
    const javasoltNev = `${terv.kezdoDatum}_${tema}.docx`;

    const dialogOpts = {
      title: 'Heti terv mentése .docx-ként',
      defaultPath: javasoltNev,
      filters: [{ name: 'Word dokumentum', extensions: ['docx'] }],
    };
    const eredmeny = sender
      ? await dialog.showSaveDialog(sender, dialogOpts)
      : await dialog.showSaveDialog(dialogOpts);
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

    // K3 fix: orphan window helyett opcionális window-paraméter.
    const sender = BrowserWindow.fromWebContents(e.sender);
    const tema = (foglalkozas.tema || 'foglalkozas').replace(/[<>:"/\\|?*]/g, '-').slice(0, 60);
    const javasoltNev = `foglalkozas_${tema}.docx`;

    const dialogOpts = {
      title: 'Foglalkozás-tervezet mentése .docx-ként',
      defaultPath: javasoltNev,
      filters: [{ name: 'Word dokumentum', extensions: ['docx'] }],
    };
    const eredmeny = sender
      ? await dialog.showSaveDialog(sender, dialogOpts)
      : await dialog.showSaveDialog(dialogOpts);
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

  /** TODO-10 Stage B: Projektterv DOCX-export */
  ipcMain.handle(IpcChannels.exportProjektDocx, async (e, projektId: number) => {
    const projekt = db
      .select()
      .from(projektek)
      .where(eq(projektek.id, projektId))
      .limit(1)
      .all()[0];
    if (!projekt) return { siker: false, hiba: 'Projekt nem található' };

    const beallitasArr = db.select().from(beallitasok).limit(1).all();
    const beallitas: Beallitas | null = beallitasArr[0] ?? null;

    // K3 fix: orphan window helyett opcionális window-paraméter.
    const sender = BrowserWindow.fromWebContents(e.sender);
    const cim = (projekt.cim || 'projekt').replace(/[<>:"/\\|?*]/g, '-').slice(0, 60);
    const javasoltNev = `projekt_${cim}.docx`;

    const dialogOpts = {
      title: 'Projektterv mentése .docx-ként',
      defaultPath: javasoltNev,
      filters: [{ name: 'Word dokumentum', extensions: ['docx'] }],
    };
    const eredmeny = sender
      ? await dialog.showSaveDialog(sender, dialogOpts)
      : await dialog.showSaveDialog(dialogOpts);
    if (eredmeny.canceled || !eredmeny.filePath) {
      return { siker: false, hiba: 'megszakítva' };
    }

    try {
      const buffer = await projektToDocx({ projekt, beallitas });
      writeFileSync(eredmeny.filePath, buffer);
      return { siker: true, utvonal: eredmeny.filePath };
    } catch (err) {
      console.error('[export] Projekt DOCX hiba:', err);
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
