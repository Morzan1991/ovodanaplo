---
name: OvodaNapló — GitHub repo + verifikáció 2026-05-13
description: Külön GitHub repó az OvodaNapló-nak (Morzan1991/ovodanaplo, privát). Lokál + remote git workflow. verify_state.py automatikus állapot-ellenőrzés.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---

# OvodaNapló — GitHub repo + verifikáció (2026-05-13)

## Külön a RapidTurn-től

A felhasználó explicit kérése: **"ne keveredjen a rapidturn-el"**. Külön repo, külön git-mappa.

| Komponens | Érték |
|---|---|
| **GitHub repo** | https://github.com/Morzan1991/ovodanaplo |
| **Láthatóság** | privát |
| **Lokál git** | `C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/.git/` |
| **Branch** | `main` |
| **Felhasználó** | Morzan1991 (lisztmaiergabor@gmail.com) |
| **Auth** | gh CLI (token a Windows credential manager-ben) |
| **gh telepítve** | `C:/Program Files/GitHub CLI/gh.exe` (v2.92.0) |

## .gitignore (kritikus kizárások)

- `node_modules/`, `app/out/`, `app/dist-installer/` — build-artefactok (NE commit, 188 MB EXE + 48 MB ASAR)
- `_bak/`, `*.bak-*` — saját backup-mappák
- `*.db`, `*.sqlite*` — lokál adat (felhasználói tartalom)
- `__pycache__/`, `*.pyc` — Python cache

A `seed/` mappa (gyökérben) **commit-olva** — ez a forrás-tartalom. A `dist-installer/.../resources/seed/` csak deploy-másolat (ignored).

## Mentési workflow ("Ments mindent" kérésre)

1. `python tools/verify_state.py` — előbb ellenőrzés
2. `git add . && git commit -m "..."` — lokál commit
3. `git push` — GitHub remote
4. Memória-frissítés (ez a `MEMORY.md` + topic-fájlok itt)

## verify_state.py — automatikus állapot-ellenőrzés

Hely: `C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/tools/verify_state.py`

Mit ellenőriz:
1. Build artefactok (`out/main`, `out/preload`, `out/renderer/assets/`)
2. ASAR méret + módosítás dátuma (40-100 MB között)
3. **Bundle string check** TODO-1..5-re (a renderer + main JS-ben):
   - TODO-1: `hetiTervTorol`, `torolHetiTerv`, "Biztosan törlöd", `btn-danger-outline`
   - TODO-2: `iskolaElokeszito`, "Iskola előkészítő tevékenység", "ONAP", `iskola_elokeszito`, `foglalkozas_tervezetek`
   - TODO-4: "Felülírja", `aktualisSablonAzonosito`, "Sablon alkalmazása"
   - TODO-5: `IrodalomAutoComplete`, `getCurrentToken`, "Nincs találat"
   - Foglalkozás-lista: `foglalkozasLista`, `setFoglalkozasok`
4. Seed-fájlok (4 ötlet-bank, weekly-templates, literature) — TODO-3 kor-szűrés aktív-e (bullet-diff a vegyes-től)
5. Git állapot (uncommitted fájlok, ahead/behind a remote-tól)
6. Manuális tesztelési checklist (felhasználói)

Kimenetek: ✅ OK / ⚠️ WARN / ❌ ERR / ℹ️ INFO

Exit code: 0 ha minden OK, 1 ha kritikus hiba van.

Opciók:
- `--quick`: csak fájl-check (nem fut typecheck/build)
- `--build`: ÚJRA-build előtte + checkek

## TODO-1..7 elkészültek 2026-05-13-án — MIND A 7 KÉSZ

Lásd részleteket: `ovodanaplo_v2.6_state.md` + Beszélgetés-ID `1ea729df`.

A 2026-05-13-i session-ben:
- **TODO-1**: Heti-terv törlés UI (Naptár + HetiTerv) — `hetiTervTorol` IPC + btn-danger-outline
- **TODO-2**: Iskola előkészítő mező a foglalkozás-tervezetben (séma + UI + DOCX) — mini-migráció ALTER TABLE
- **TODO-3**: Kor-specifikus differenciálás Fázis B (28-37 bullet/fájl szűrve regex+keyword)
  - `tools/build_kor_specifikus_bank.py` — KOR_MARKEREK szótár, idézőjelekkel
- **TODO-4**: Sablonválasztó meglévő tervnél is (konfirmációval) — `aktualisSablonAzonosito` value
- **TODO-5**: Irodalom autocomplete (383 mű, 2 területen) — új `components/IrodalomAutoComplete.tsx`
- **TODO-6**: HetiTerv refaktor 1448 → 647 sor (-55%), 5 új komponens + types.ts
  - `pages/HetiTerv/`: OtletekModal, DokumentumNezet, SablonValaszto, OsszegzoSzekcio, TeruletSzekciok, types
  - Etap A+B+C külön commit a `refactor/hetiterv-szetbontas` branch-en, merge `--no-ff` a main-be
  - Tag `pre-todo6-refactor` és `post-todo6-refactor` rollback-pontokhoz
- **TODO-7**: Reflexiók szűrés + szerkesztés-link + üres-állapot (Reflexiok.tsx 47 → 115 sor)
  - FoglalkozasSzerkeszto 404-es link bugfix → `/reflexiok`
- **Mini-task**: Foglalkozás-tervezetek listája a heti terv jobb oldalsávjában

**Mind a 7 TODO commit-olva + push-olva a Morzan1991/ovodanaplo main branch-en.**
A `pending` lista 1-7 elemei teljesítve.

---

## 2026-05-13 — TODO-8..13 KÉSZ (kivéve 10 Stage B)

A session folytatásban a közepes-prioritású 6 TODO-ból **5 teljesen kész**:

- **TODO-8**: IPC input-validáció Zod-dal — 10 kritikus handler validálva
  - Új: `shared/schemas/ipc.ts` (10 Zod schema), `main/ipc-validate.ts` (helper)
- **TODO-9**: Heti terv másolása előző hétről — új IPC `hetiTervMasolas` + MasolasModal
  - "(másolat)" prefix a témára, max 10 legutóbbi terv listája
- **TODO-10 Stage A**: Projektterv részletes szerkesztő — új `ProjektSzerkeszto.tsx` (330 sor)
  - 19 mezős űrlap, 5 szekciós tagolás (alapadatok, pedagógiai feladatok 4 dimenzió, tevékenységek, produktumok+eszközök, IE+szokások)
  - Router: `/projektek/uj` + `/projektek/:id/szerkesztes`
- **TODO-10 Stage B**: Projektterv DOCX-export (`Könyv projektterv.docx` formátum)
  - `export-docx.ts`-be új `projektToDocx()` függvény (~145 sor)
  - 'PROJEKTTERV' címsor 18pt + 5 szekciófejléc 14pt félkövér + Times New Roman 12pt
  - Új IPC `exportProjektDocx(projektId)` + UI gomb a ProjektSzerkeszto action bar-on
- **TODO-11**: Tag-rendszer multi-select képességek — új `KepessegMultiSelect.tsx`
  - 71 képesség 6 kategóriába, kategóriánként színkód (sky/yellow/mauve/sage/terra/ink)
  - 2 új IPC: `hetiTervKepessegekLista` + `hetiTervKepessegekMent` (M-N replace-all)
- **TODO-12**: SQLite FTS5 full-text keresés — `heti_terv_fts` virtuális tábla
  - 6 trigger a sync-hez (heti_tervek + teruletek)
  - Új page: `Kereses.tsx` snippet-tel + `<mark>`-kiemeléssel
  - Navbar bővítve: '🔍 Keresés' link
- **TODO-13**: Eszközlista 32 → 105+ kulcsszó kategorizálva
  - Új: `lib/eszkoz-kulcsszavak.ts` (kezmuves 40 / mozgas 25 / enek 15 / kreativ 25)
  - `lookupEszkozok()` szinonimákkal és kategória-sorrendben

**Tag**: `post-todo-1-13-all-completed` (rollback-pont mind a 13 TODO után).
**Bundle**: renderer JS 578 KB, ASAR 48 MB.

A `pending` lista **1-13 eleme MIND TELJESÍTVE**. A 14, 15, 20 KÉSŐBB is befejezve:
- **TODO-15**: "Tavaly ilyenkor" emlékeztető — új IPC hetiTervekTavalyiEvbol (±3 nap), HetiTerv jobb oldalsávján mauve-csíkos kártya
- **TODO-20**: Téma-cím duplikáció figyelmeztetés — sablonAlkalmazasa-ban LIKE-keresés + V1↔V2 alternatív ajánlás
- **TODO-14 Stage A**: Vitest unit tesztek — 61/61 PASS (utils, eszkoz-kulcsszavak, IPC schemák). **Stage B (Playwright E2E) későbbi session-re marad.**

**A felhasználó explicit kijelentette**: NEM kell 16 (frissítés-feed), 17 (AI), 18 (cloud sync), 19 (PWA).

**Végső tag**: `final-session-2026-05-13` — a teljes 2026-05-13 session-rögzítője.

## Hasznos parancsok

```bash
# Verifikáció
python tools/verify_state.py

# Commit + push
cd C:/Users/Lenovo/Desktop/CODE/_ovodanaplo
"C:/Program Files/Git/cmd/git.exe" add .
"C:/Program Files/Git/cmd/git.exe" commit -m "..."
"C:/Program Files/Git/cmd/git.exe" push

# Rollback egy commitre (ha valami elromlik)
"C:/Program Files/Git/cmd/git.exe" log --oneline -10
"C:/Program Files/Git/cmd/git.exe" reset --hard <commit-hash>

# gh repo state
"C:/Program Files/GitHub CLI/gh.exe" repo view --web Morzan1991/ovodanaplo
```
