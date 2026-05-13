---
name: OvodaNapló — folytatandó feladatok (priorzitás-sorrendben)
description: 20 TODO-elemes ütemterv prioritás szerint. 2026-05-12 estén abbahagyva.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---

# OvodaNapló — Folytatandó feladatok

**2026-05-12 estén abbahagyva** (v2.6 állapotban).

A teljes audit alapján 20 fejlesztési feladat azonosítva. Prioritás-mátrix:

| Szint | Hatás | Idő |
|---|---|---|
| 🔴 KRITIKUS | Napi használat blokkoló | Most |
| 🟠 MAGAS | Jelentős UX-javulás | 1-2 hét |
| 🟡 KÖZEPES | Kényelmi, finomítás | 1 hónap |
| 🟢 ALACSONY | Jövő-távlat | Q3-Q4 |

---

## 🔴 KRITIKUS

### TODO-1: Heti-terv törlés UI (1-2 óra)
- Naptáron + HetiTerv-en törlés-gomb (piros ×)
- Konfirmáló dialógus
- IPC handler (`hetiTervTorol`) MÁR LÉTEZIK, csak UI hiányzik

### TODO-2: Iskola előkészítő mező a foglalkozás-tervezetben (30 perc)
- `FoglalkozasSzerkeszto.tsx` új textarea
- `foglalkozas_tervezetek` táblába új `iskola_elokeszito` mező + mini-migráció

---

## 🟠 MAGAS PRIORITÁS

### TODO-3: Kor-specifikus differenciálás (2-3 óra Fázis B)
- **JELENLEG**: 4 ötlet-bank fájl, de mind ugyanaz a tartalom (vegyes)
- **Fázis B (gyors)**: bullet-annotációk regex+keyword alapon
  - `KOR_MARKEREK`: pl. 'ujj-festés' → kicsi; '10-es számkör' → közepes; 'memoriter' → nagy
  - Python szkript: a 2310 bullet-et megcímkézi `[korok]` taggel
  - UI a választott korcsoport bullet-jeit szűri
- **Fázis A (lassabb, későbbi)**: AI agent kisebb chunkokkal — `/ovodanaplo-otletek-gen` skill
  - 5-6 téma/agent × 4 korcsoport × 7 terület × 10 bullet
  - 28 agent-futás sorban, ~3-5 óra

### TODO-4: Sablonválasztó meglévő tervnél is (1 óra)
- Eltávolítani a `!params.id` feltételt a sablon-választó megjelenítéséből
- "Sablon alkalmazása" gomb felülírja a tartalmat (konfirmációval)

### TODO-5: Irodalom autocomplete (3-4 óra)
- Új `<IrodalomAutoComplete>` komponens
- Min. 2 karakter után query: 383 mű, max 10 találat
- Tab/Enter beilleszt
- A `verseles_meseles`, `enek_zene` textarea-knál detektor
- IPC `irodalomKereses` MÁR LÉTEZIK

### TODO-6: HetiTerv.tsx refaktor (4-6 óra)
- 1336 sor → 5 alkomponens
- Új mappa: `src/renderer/src/pages/HetiTerv/`
  - `index.tsx` (~200 sor)
  - `HetiTervHeader.tsx`, `SablonValaszto.tsx`, `TeruletSzekcio.tsx`
  - `OsszegzoSzekcio.tsx`, `EszkozLista.tsx`
  - `OtletekModal.tsx`, `DokumentumNezet.tsx`
  - `hooks/useHetiTervBetolt.ts`, `useSablon.ts`, `useOtletek.ts`, `useMentes.ts`
- Regression-tesztelés kötelező

### TODO-7: Reflexiók listából szerkesztés (1-2 óra)
- `Reflexiok.tsx` bővítése "Szerkesztés" gombbal minden sorhoz
- → `/heti-terv/:id/reflexio` route (létezik)
- Szűrés típus / dátum szerint
- "Még nincs reflexió" jelzés

---

## 🟡 KÖZEPES PRIORITÁS

### TODO-8: IPC input-validáció Zod-dal (4-6 óra)
- `npm install zod`
- Új mappa: `src/shared/schemas/ipc.ts`
- 39 IPC handler-re schema írás
- Bónusz: shared types

### TODO-9: Heti terv másolása előző hétről (1.5 óra)
- Naptár / HetiTerv: "📋 Másolás előző hétről" gomb
- Felugró: melyik hetet (utolsó 10 közül)
- Másolás: minden terület tartalom + iskolaElokeszito + cél/feladat
- "(másolat)" jelölés a témán

### TODO-10: Projektterv részletes szerkesztő (8-10 óra)
- ÚJ `src/renderer/src/pages/ProjektSzerkeszto.tsx`
- Séma létezik (19 oszlop): cím, dátum, cél, téma, 4 feladat, bevontak, előkészületek, alkotó-tev., játékok, szabályok, produktumok, munka, eszközök, IE-összesített, szokások
- 4-5 tab/szakasz csoportosítás
- DOCX export `Könyv projektterv.docx` formátum

### TODO-11: Tag-rendszer multi-select képességek (3-4 óra)
- `<KepessegMultiSelect>` komponens
- 71 képesség-seed alapján chip-rendszer
- Színkód kategóriánként (kognitív, motoros, szociális, érzelmi)
- M-N tábla létezik (`heti_terv_kepesseg`), csak UI hiányzik

### TODO-12: Évek közötti full-text keresés (4-6 óra)
- `CREATE VIRTUAL TABLE heti_terv_fts USING fts5(...)` SQLite FTS5
- Trigger szinkronizáláshoz
- Új `/kereses` oldal
- Top-bar: "Keresés" link

### TODO-13: Eszközlista auto-aggregálás (2-3 óra)
- ~30 → 100+ kulcsszó
- Kategorizálva: kézműves, mozgás, ének, kreatív
- Forrás: a 2310 ötlet-bank bullet-jeit elemezzük

---

## 🟢 ALACSONY PRIORITÁS (jövő)

### TODO-14: Tesztek (15-20 óra)
- Phase 1 Unit (Vitest): `generator.ts`, `export-docx.ts`, `utils.ts`
- Phase 2 E2E (Playwright): új heti terv flow, sablon-választás, ötletek panel
- Cél: 70% main + 50% renderer code coverage

### TODO-15: "Tavaly ilyenkor" emlékeztető (2 óra)
- Oldalsó panel (aside)
- Lekérdezés: `WHERE strftime('%m-%d', kezdoDatum) = ?`
- Heti terv kártya + "Megnyitás" gomb

### TODO-16: Frissítés-mechanizmus (3-4 óra)
- electron-updater integráció (csak ha publikus deploy lesz)
- Settings → "Frissítés ellenőrzése" gomb (manuális)
- GitHub Releases vagy egyéni FTP

### TODO-17: AI-javaslat (8-12 óra)
- Phase 1: API-hívás (Anthropic Claude / OpenAI)
- Phase 2: Ollama + Llama 3.2 / Phi-3 lokálisan
- KÖTELEZŐ korlátozás: SOSEM generál ki nem létező irodalmi művet

### TODO-18: Megosztás kollégákkal (20-40 óra)
- Phase 1: Export/import JSON
- Phase 2: Cloud sync (Hetzner CPX11 ~1500 Ft/hó)
- CSAK ha a felhasználó kéri

### TODO-19: Mobil PWA read-only (6-8 óra)
- Renderer kód már React, futtatható böngészőben
- Minimalista PWA: csak olvasás
- Service Worker offline-hoz
- Browser local cache

### TODO-20: Téma-cím duplikáció figyelmeztetés (1 óra)
- Sablon-választáskor: ha már alkalmazta korábban, figyelmeztet
- Alternatív sablon ajánlása (V2 ha V1-et használt, vagy fordítva)

---

## Ütemezés összesítés

| Hét | Feladatok | Munka |
|---|---|---|
| **Most** | TODO 1, 2 (KRITIKUS) | ~3 óra |
| **1. hét** | TODO 3-Fázis B, 4, 5, 7 (MAGAS) | ~10 óra |
| **2-3. hét** | TODO 6 (refaktor), 8, 9, 10 | ~20 óra |
| **1 hónap** | TODO 11, 12, 13 | ~12 óra |
| **Q3-Q4** | TODO 14-20 | 30+ óra |

**KRITIKUS + MAGAS + KÖZEPES összesen**: **~45 óra**

---

## Mit ELHALASZTOTTUNK / EZIDEIG NEM csináltunk

- Kor-specifikus differenciálás teljes megvalósítása (4 különböző bank-tartalom)
  - Helyette: alias-bank, mind a 4 ugyanazt a vegyes-tartalmat kapja
  - A kor-cimke a UI-ban informatív, manuális finomítás javasolt
- Tesztek (egyetlen unit teszt sincs)
- Heti-terv törlés UI

## Mire NE időt költeni

- **Auto-évi generálás** — user explicit kérése: NEM kell ✓
- **NSIS-installer** — nem működik Windows admin nélkül, ASAR-repack workflow OK
- **Frissítési feed** — egy-felhasználós app, manuális csere elég
- **Cloud sync** — felhasználó ellenezte, lokális adat kell
