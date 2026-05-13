# OvodaNapló — Setup új gépen

> **Cél**: a teljes fejlesztési projekt setup-ja egy másik Windows-gépre. A repo most már **PUBLIKUS** — autentikáció nélkül klónozható.

**Add be ezt a dokumentumot az új gépen futó Claude Code-nak**, és az segít végigmenni a lépéseken. A dokumentum végén egy "Indító parancs" rész is van, amit közvetlenül beillesztheted az új Claude Code session-be.

---

## 🎯 Mit kell csinálni az új gépen

1. Telepítendő szoftverek (Git, Node, Python, Claude Code)
2. Repo klónozása GitHub-ról
3. NPM telepítés és build
4. Tesztek futtatása (verifikáció)
5. Claude Code skill + memory átadás
6. Indító parancs a Claude Code-nak

---

## 0. Előfeltételek — szoftverek telepítése

Ha még nincs telepítve a gépen, telepítsd ezeket (mind ingyenes):

| Eszköz | Letöltés | Megjegyzés |
|---|---|---|
| **Git for Windows** | https://git-scm.com/download/win | Alapbeállítások OK |
| **Node.js 24 LTS** | https://nodejs.org | A "LTS" verziót válaszd, ne a "Current"-et |
| **Python 3.10+** | https://python.org/downloads/windows | A tesztek futtatásához |
| **Claude Code** | https://claude.ai/code | Az új fiókkal való belépés |

A telepítések után **indítsd újra a terminálodat** (PowerShell vagy Git Bash), hogy a `node`, `git`, `python` parancsok elérhetők legyenek.

---

## 1. Repo klónozás (a publikus URL-ről)

### A — Nyisd meg a célmappát Windows Explorer-rel

A `_ovodanaplo`-t valahova le kell tölteni. Ajánlott hely:

```
C:\Users\<USERNAME>\Desktop\Claude\CODE
```

(A `<USERNAME>` helyére a saját Windows-felhasználónév kerül.)

### B — Nyiss terminált a mappában (kerüld a szóköz-problémákat!)

1. Az Explorer-ben menj a CODE mappába
2. **Az üres területen jobb-klikk** → **"Open in Terminal"** (vagy "Megnyitás terminálban")
3. A megnyíló parancssor **már a megfelelő mappában** van — nem kell `cd`-zni szóközös mappa-nevekkel

### C — Klónozás

```bash
git clone https://github.com/Morzan1991/ovodanaplo.git
cd ovodanaplo
ls
```

**Várt eredmény** — látnod kell:
```
app/  seed/  tools/  claude-commands/  claude-memory/
README.md  HANDOVER.md  CHANGELOG.md  SETUP_NEW_MACHINE.md
```

Ha valami hiányzik, állj meg és jelezz.

---

## 2. NPM függőségek telepítése (kritikus: `--ignore-scripts`!)

A `_ovodanaplo` mappában:

```bash
cd app
npm install --ignore-scripts
npm run postinstall
```

A `--ignore-scripts` kell az Electron-natív modulok (különösen `better-sqlite3`) post-install hibáit elkerülni. Az `npm run postinstall` aztán külön lefuttatja a megfelelő electron-builder install lépést.

### Ha az `npm install` után a `npm run dev` hibázik a `better-sqlite3`-mal:

```bash
npm rebuild better-sqlite3 --runtime=electron --target=33.0.0 --dist-url=https://electronjs.org/headers
```

---

## 3. Verifikáció — minden átment-e?

### 3.1 — TypeScript

```bash
npm run typecheck
```

**Várt**: csendes (= PASS). Ha hibák, azok a `tsc` output-jában.

### 3.2 — Vitest unit tesztek (61 darab)

```bash
npm test
```

**Várt**:
```
Test Files  3 passed (3)
Tests       61 passed (61)
```

### 3.3 — Backend e2e teszt (Python)

A `_ovodanaplo` gyökerében:

```bash
cd ..
python tools/e2e_test.py
```

**Várt**: `MINDEN BACKEND-FLOW PASS — 16+1 feature CRUD-műveletei mind működnek.`

### 3.4 — Build

```bash
cd app
npm run build
```

**Várt**: pár másodperc, létrehozza az `out/` mappát.

---

## 4. Indítás (próba)

### Fejlesztői mód (live reload):

```bash
npm run dev
```

→ Az OvodaNapló ablak felugrik üres adatbázissal. Az SQLite DB automatikusan létrejön itt: `%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db`

### Élesben (Windows-os EXE):

A `npm run dev`-nél a fejlesztői build fut. Ha a tényleges felhasználónak (pl. a feleségednek) telepítendő `OvodaNapló.exe` kell, futtasd:

```bash
npm run package:win
```

Ez **5-10 perc** és létrehozza a `app/dist-installer/win-unpacked/OvodaNapló.exe`-t. (FIGYELEM: a `dist-installer/` `.gitignore`-d, csak helyileg!)

---

## 5. Claude Code setup (kontextus-átadás)

### 5.1 — Slash-skill-ek másolása

A `claude-commands/` mappa **7 fájlt** tartalmaz (`/ovodanaplo-status`, `/ovodanaplo-deploy`, stb.). Ezek a Claude Code-ban `/parancs` formában hívhatók.

**Git Bash-ben** (a `_ovodanaplo` gyökerében):

```bash
mkdir -p ~/.claude/commands
cp claude-commands/*.md ~/.claude/commands/
ls ~/.claude/commands/
```

**Vagy PowerShell-ben**:

```powershell
mkdir -Force "$env:USERPROFILE\.claude\commands"
Copy-Item claude-commands\*.md "$env:USERPROFILE\.claude\commands\"
```

Onnantól a Claude Code-ban `/ovodanaplo-status`, `/ovodanaplo-deploy`, stb. mind működnek.

### 5.2 — Memóriafájlok másolása

A `claude-memory/` mappa **8 topic-fájlt** tartalmaz a projekt teljes kontextusával.

**Először indítsd el a Claude Code-ot** a `_ovodanaplo` (vagy a parent CODE) mappában — ezzel létrejön az automatikus memory-mappa.

A pontos útvonal a Windows-felhasználónévtől és a mappa-szerkezettől függ. Példa:

```
C:\Users\<USERNAME>\.claude\projects\C--Users-<USERNAME>-Desktop-Claude-CODE\memory\
```

(A mappa-név a project-elérési útból generálódik, `\` → `-` cserékkel.)

**Bash-ben** (cseréld a `<USERNAME>`-et a saját Windows-felhasználónevedre):

```bash
cp claude-memory/*.md "/c/Users/<USERNAME>/.claude/projects/C--Users-<USERNAME>-Desktop-Claude-CODE/memory/"
```

**Vagy keresd meg manuálisan**:

1. Indítsd el a Claude Code-ot
2. A session log-jában látni fogod a memory-mappa elérési útját (vagy egy `MEMORY.md` fájl-hivatkozást)
3. Másold a `claude-memory/*.md` fájlokat oda

---

## 6. Indító parancs a Claude Code-ban

Miután minden setup kész, az új Claude Code session-ben **az első üzeneted ez lehet**:

```
Új gépen folytatok egy OvodaNapló-fejlesztést. A projekt-mappa: _ovodanaplo/.

Olvasd a memóriából (claude-memory/):
- ovodanaplo_v2.6_state.md — pre-session állapot (85 sablon, 2310 ötlet)
- ovodanaplo_github.md — GitHub-repo + handover infó + TODO-1..13 + 14A + 15 + 20 mind kész
- ovodanaplo_pending.md — eredeti TODO-lista (mind már kész, kivéve 14B Playwright + 16/17/18/19 kihagyva)

Aktuális verzió: 2.7.0 (final-session-2026-05-13 tag).

Először futtasd: /ovodanaplo-status

Aztán kérlek, várj utasításra mit szeretnék csinálni.
```

A Claude Code beolvassa a memóriafájlokat, és tudja a teljes projekt-kontextust.

---

## 7. Aktuális állapot (2026-05-13 vége)

| Komponens | Érték |
|---|---|
| **Verzió** | 2.7.0 (handover-ready) |
| **Git tag** | `v2.7.0-handover-ready` |
| **Unit tesztek** | 61/61 PASS |
| **E2E backend** | 10/10 PASS |
| **GitHub** | PUBLIKUS (Morzan1991/ovodanaplo) |
| **Bundle** | 48 MB ASAR, 593 KB renderer JS |

### Mi készült el a 2026-05-13-i session-ben

**MIND a 13 közepes-prioritású TODO + 3 alacsony + 1 bugfix kész**:
1. Heti-terv törlés UI
2. IE-mező a foglalkozás-tervezetben
3. Kor-specifikus differenciálás (Fázis B)
4. Sablonválasztó meglévő tervnél
5. Irodalom autocomplete
6. HetiTerv refaktor (1448→647 sor)
7. Reflexiók szűrés + szerkesztés
8. IPC Zod-validáció
9. Heti terv másolása előző hétről
10. Projektterv szerkesztő + DOCX-export
11. Képesség multi-select
12. SQLite FTS5 full-text keresés
13. Eszközlista 32→105+ kulcsszó
14A. Vitest unit tesztek (61 db)
15. "Tavaly ilyenkor" emlékeztető
20. Téma-cím duplikáció figyelmeztetés
➕ Új nevelési év létrehozása + törlése
➕ `hetiTervTorol` cascade-bugfix

**Nem készült** (explicit user-kihagyás):
- TODO-14B: Playwright E2E tesztek
- TODO-16: electron-updater frissítés-feed
- TODO-17: AI-javaslat
- TODO-18: Cloud sync / megosztás
- TODO-19: Mobil PWA

---

## 8. Hibakezelés

| Hiba | Megoldás |
|---|---|
| `git clone`: "Repository not found" | A repo már publikus — talán proxy / DNS gond. Vagy ellenőrizd az URL-t |
| `npm install`: Electron post-install fail | `--ignore-scripts` flag (lásd 2. lépés) |
| `better-sqlite3` natív modul hiba | `npm rebuild better-sqlite3 ...` (lásd 2. lépés) |
| `cd`: "too many arguments" | Idézőjelek a szóközös mappa-névhez, VAGY Explorer-rel "Open in Terminal" |
| Claude Code nem találja a skilleket | `~/.claude/commands/` mappa létezik? Indítsd újra a Claude-ot |
| Memóriafájlok nem jelennek meg | Először indítsd el a Claude Code-ot a CODE mappában, hogy a memory-mappa létrejöjjön |
| Vitest tesztek hibáznak | Tisztítsd a `node_modules`-t: `rm -rf node_modules && npm install --ignore-scripts && npm run postinstall` |

---

## 9. Referencia-dokumentumok a repo-ban

- **`README.md`** — projekt-overview, telepítés (felhasználói)
- **`HANDOVER.md`** — részletes átadási doksi (300+ sor), minden szempont
- **`CHANGELOG.md`** — verzió-történet (v2.7.0, v2.6, v2.0)
- **`claude-memory/`** — 8 memory-topic-fájl (kontextus-mentés)
- **`claude-commands/`** — 7 slash-skill-fájl

---

## Sikeres setup után

Az új Claude Code session-ben a teljes projekt-kontextusra reagál (a memóriafájlok beolvasásával), és bárhonnan folytathatod ahol az eredeti session abbahagyta. A `/ovodanaplo-status` parancs egy gyors állapot-áttekintést ad.

A fejlesztés alapja:
- **Git workflow**: `git pull` előbb, `git add` + `git commit` + `git push` a változások után
- **Backup**: minden nagy változtatás előtt a `_bak/<task>-<dátum>/` mappába másolj
- **Tesztelés**: `npm test` (Vitest) + `python tools/e2e_test.py` (e2e) minden nagyobb módosítás után
- **Verifikáció**: `python tools/verify_state.py` egy gyors állapot-check

🌸 Sok sikert a folytatáshoz!
