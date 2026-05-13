# Verzió-történet

Az OvodaNapló verziók és változtatások részletes naplója.

## v2.7.0 — 2026-05-13 — **A nagy session**

**16+1 új feature** + 2 bugfix + e2e teszt-infrastruktúra egy munkamenetben.

### 🆕 Új funkciók

| # | Feature | Részlet |
|---|---|---|
| 1 | Heti-terv törlés UI | × hover-gomb Naptáron, 🗑 gomb HetiTerv-en, konfirmációval |
| 2 | Iskola-előkészítő mező foglalkozás-tervezetben | séma + UI + DOCX-export |
| 3 | Kor-specifikus differenciálás (Fázis B) | regex+keyword klasszifikáció a 2310 bullet-re (28-37/fájl szűrve) |
| 4 | Sablonválasztó meglévő tervnél | felülíráshoz konfirmáció + V1↔V2 ajánlás |
| 5 | Irodalom autocomplete | 383 mű, 2 területen, kurzor-token-detektor |
| 6 | HetiTerv refaktor (3 etap) | 1448 → 647 sor (-55%), 6 alkomponens |
| 7 | Reflexiók szűrés + szerkesztés-link | + foglalkozás-tervezet 404 bugfix |
| 8 | IPC Zod-validáció | 10 kritikus handler runtime védelmen |
| 9 | Heti terv másolása előző hétről | "(másolat)" prefix, max 10 forrás |
| 10 | Projektterv szerkesztő + DOCX-export | 19 mező, 5 szekció, KRÉTA-formátum |
| 11 | Tag-rendszer multi-select képességek | 71 chip 6 kategóriában, M-N tábla |
| 12 | SQLite FTS5 full-text keresés | virtuális tábla + 6 trigger + új page |
| 13 | Eszközlista bővítés | 32 → 105+ kulcsszó 4 kategóriában szinonimákkal |
| 14 | Vitest unit tesztek | 61 teszt PASS (utils, eszközök, Zod schemák) |
| 15 | "Tavaly ilyenkor" emlékeztető | ±3 nap tűréshatár, max 5 korábbi heti terv |
| 20 | Téma-cím duplikáció figyelmeztetés | + V1↔V2 alternatív sablon-ajánlás |
| ➕ | Új év létrehozása BÁRMIKOR | korábban csak első indításnál |
| ➕ | Év CASCADE törlése | kétszeres konfirmációval, kapcsolódó tartalom-listával |

### 🐛 Bugfix-ok

- **`hetiTervTorol` FK-failure**: a heti terv sima delete-tel törlésnél `FOREIGN KEY constraint failed` lépett volna fel, ha kapcsolódó foglalkozás-tervezet vagy reflexió volt. Javítva: CASCADE-tranzakció (reflexiók → foglalkozás → heti terv).
- **Foglalkozás-tervezet 404**: a "Reflexió írása" link a `/foglalkozas/{id}/reflexio`-ra mutatott — nem létező route. Javítva: `/reflexiok` központi oldalra.

### 🏗 Infrastruktúra

- **GitHub privát repo**: [Morzan1991/ovodanaplo](https://github.com/Morzan1991/ovodanaplo)
- **`gh` CLI v2.92** telepítve
- **`tools/verify_state.py`**: automatikus állapot-ellenőrzés (TODO-1..5 string-check, FTS5 + seed-eloszlás + git státusz)
- **`tools/e2e_test.py`**: temp SQLite DB-n CRUD + CASCADE + FTS5 + M-N flow-teszt (10/10 PASS)
- **Vitest setup** + 61 unit teszt (3 fájl: utils, eszközök, Zod-schemák)
- **Rollback-tagek**: `pre-todo6-refactor`, `post-todo6-refactor`, `post-todo-1-13-all-completed`, `final-session-2026-05-13`

### 📊 Bundle-statisztikák

| Komponens | Méret | Volt (pre-session) |
|---|---|---|
| `app.asar` | 48 MB | 45.78 MB |
| renderer JS | 593 KB | 522 KB |
| renderer CSS | 35 KB | 31 KB |
| main JS | 63 KB | 57 KB |
| HetiTerv.tsx | 720 sor | 1448 sor |
| Új komponensek | 6 + KepessegMultiSelect, MasolasModal, Kereses, ProjektSzerkeszto, IrodalomAutoComplete, UjNevelesiEvModal | — |

---

## v2.6 — 2026-05-12 — **OvodaNapló alap-csomag**

**Pre-session állapot** — a 2026-05-13-as nagy session előtt.

- 85 heti sablon (322 KB)
- 2310 ötlet/korcsoport (4 fájl alias)
- 383 irodalmi tétel (28 felnőtt mű kiszedve)
- 7 saját Claude Code skill (`/ovodanaplo-*`)
- Marketing landing oldal (HTML, 50 KB)
- Audit: 8.6/10 technikai, 9.2/10 szakmai

Részletek: `claude-memory/ovodanaplo_v2.6_state.md`

---

## v2.0 — 2026-05-11 körüli — **Első éles**

A felesége asztali parancsikonja, a Fázis 2 KÉSZ állapot.

- Electron + React + Drizzle ORM + SQLite (better-sqlite3)
- Node 24 install gotcha (electron install.js + `--ignore-scripts`)
- ASAR-repack workflow (NSIS-install Windows-on nem működik admin nélkül)

Részletek: `claude-memory/ovodanaplo_tech.md`
