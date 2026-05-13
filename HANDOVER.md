# OvodaNapló — fejlesztői átadás (HANDOVER)

> Teljes setup-instrukciók egy másik gépre, ahol ugyanaz a **Claude Code** fut, csak másik fiókkal.

**Cél**: a fejlesztést folyamatosan, kontextus-vesztés nélkül folytatható legyen az új gépen.

---

## 0. Mit kell előzetesen tudnod

- **GitHub repo**: https://github.com/Morzan1991/ovodanaplo (PRIVÁT)
- **Verzió**: 2.7.0 (2026-05-13)
- **Tech stack**: Electron 33 + TypeScript 5.7 + React 18 + Drizzle ORM + better-sqlite3
- **Platform**: Windows (a felhasználó NSIS-installer nélkül futtatja az `.exe`-t a `win-unpacked/`-ból)

---

## 1. Előfeltételek a célgépen

### Telepítendő szoftverek

| Eszköz | Verzió | Telepítés |
|---|---|---|
| **Git for Windows** | 2.40+ | https://git-scm.com/download/win |
| **Node.js** | 24.x LTS | https://nodejs.org (Windows MSI installer) |
| **Python** | 3.10+ | https://python.org (a build-szkriptekhez) |
| **GitHub CLI (`gh`)** | 2.x | `winget install --id GitHub.cli` vagy MSI |
| **Claude Code** | latest | https://claude.ai/code |

### Git globális config

```bash
git config --global user.name "Morzan1991"
git config --global user.email "lisztmaiergabor@gmail.com"
```

(Vagy a saját identitásoddal — a commit-tárgy az legyen, ami releváns.)

---

## 2. GitHub hozzáférés

A repo **privát**, tehát a másik fiók csak akkor klónozhatja, ha:

### Opció A — collaborator hozzáadás

1. Az **eredeti tulajdonos** (Morzan1991) elmegy a https://github.com/Morzan1991/ovodanaplo/settings/access oldalra
2. "Add people" → az új GitHub felhasználónév
3. Az új felhasználó elfogadja a meghívást

### Opció B — gh device flow

Az új gépen:

```bash
gh auth login
# Válaszd: GitHub.com → HTTPS → Login with web browser
# Egy 8-karakteres kódot kapsz → írd be a https://github.com/login/device-en
```

Onnantól `git clone` privát repó-t is működik.

---

## 3. Repo klónozás + függőségek

```bash
# 1. Klónozás
cd C:/Users/USERNAME/Desktop/CODE  # vagy bárhova
git clone https://github.com/Morzan1991/ovodanaplo.git _ovodanaplo
cd _ovodanaplo

# 2. NPM függőségek (FONTOS: --ignore-scripts az electron post-install hibák elkerülésére!)
cd app
npm install --ignore-scripts

# 3. Az electron-native modulokat utólag külön build-eljük
npx electron-rebuild
# VAGY ha hibázik:
node node_modules/electron/install.js
npm run postinstall

# 4. TypeScript-check
npm run typecheck

# 5. Unit tesztek
npm test
# Várt: 61 teszt PASS

# 6. Build
npm run build
```

### Gyakori hiba: better-sqlite3 native modul

Ha `npm install` után a `npm run dev` panaszkodik `better-sqlite3`-ra:

```bash
npm rebuild better-sqlite3 --runtime=electron --target=33.0.0 --dist-url=https://electronjs.org/headers
```

---

## 4. Claude Code setup

Az új gépen a Claude Code-nak **3 dolgot kell tudnia**:

### 4.1 Slash-skill-ek

A `_ovodanaplo/claude-commands/` mappa **7 fájlt** tartalmaz:
- `ovodanaplo-status.md`
- `ovodanaplo-sablon-check.md`
- `ovodanaplo-irodalom-verify.md`
- `ovodanaplo-deploy.md`
- `ovodanaplo-otletek-gen.md`
- `ovodanaplo-docx-check.md`
- `ovodanaplo-onap-compliance.md`

**Másold át** a `~/.claude/commands/` mappába (Windows: `C:\Users\USERNAME\.claude\commands\`):

```bash
# Bash / Git Bash
mkdir -p ~/.claude/commands/
cp _ovodanaplo/claude-commands/*.md ~/.claude/commands/

# PowerShell
mkdir -Force "$env:USERPROFILE\.claude\commands"
Copy-Item _ovodanaplo\claude-commands\*.md "$env:USERPROFILE\.claude\commands\"
```

Onnantól a Claude Code-ban használható: `/ovodanaplo-status`, `/ovodanaplo-deploy`, stb.

### 4.2 Memóriafájlok

A `_ovodanaplo/claude-memory/` mappa **8 fájlt** tartalmaz — a projekt teljes kontextusa.

A Claude Code memory-mappáját a projekt-specifikus prefix-szel kódolja. Az eredeti gépen ez:
```
C:\Users\Lenovo\.claude\projects\C--Users-Lenovo-Desktop-CODE\memory\
```

Az új gépen ez **a saját project-mappádtól függ**. Ha a project-mappa `C:/Users/USER/Desktop/CODE`, akkor a Claude memory-mappa: `C:\Users\USER\.claude\projects\C--Users-USER-Desktop-CODE\memory\`.

**Lépések**:

1. Indítsd el a Claude Code-ot a `_ovodanaplo` mappában (vagy a parent `CODE` mappában)
2. Csak ezzel jön létre az automatikus memory-mappa
3. Másold át az `_ovodanaplo/claude-memory/*.md` fájlokat oda

A `MEMORY.md` indexet kézzel kell frissíteni — adjuk hozzá a 8 új topic-bejegyzést. (Az eredeti `MEMORY.md`-t a Claude Code automatikusan generálja, csak az új topic-fájlokat kell odamásolni.)

### 4.3 Project CLAUDE.md

A repo gyökerében legyen egy `CLAUDE.md` vagy `_ovodanaplo/CLAUDE.md` ami a projekt-specifikus instrukciókat tartalmazza. **A repo nem tartalmaz ilyet** (a parent CODE-mappa CLAUDE.md-je a RapidTurn-specifikus).

A javasolt `_ovodanaplo/CLAUDE.md` tartalom: lásd a [B függeléket](#b-f%C3%BCggel%C3%A9k--claudemd-mintap%C3%A9ldas) lent.

---

## 5. Tesztelés az új gépen

### 5.1 Backend teszt
```bash
cd _ovodanaplo
python tools/e2e_test.py
# Várt: 10/10 lépés PASS, "MINDEN BACKEND-FLOW PASS"
```

### 5.2 Unit tesztek
```bash
cd _ovodanaplo/app
npm test
# Várt: 61 teszt PASS
```

### 5.3 Verify-state
```bash
cd _ovodanaplo
python tools/verify_state.py
# Várt: minden TODO-1..5 string-check PASS
```

### 5.4 Build + indítás
```bash
cd _ovodanaplo/app
npm run build
# A `dist-installer/win-unpacked/OvodaNapló.exe`-t kell elindítani
# Az adatbázis automatikusan létrejön: %APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db
```

---

## 6. Fejlesztési workflow (folytatáshoz)

### Új feature implementálás

1. **Backup** a változtatott fájlról: `_bak/<task>-<dátum>/` mappába másolni
2. **Branch** opcionálisan: `git checkout -b feature/<név>`
3. **Implementálás**: src/ módosítás
4. **Verifikáció**:
   ```bash
   cd app
   npm run typecheck
   npm test
   npm run build
   ```
5. **ASAR repack** (a tényleges deploy-hoz):
   ```bash
   cd app/dist-installer/win-unpacked/resources
   rm -rf app_extracted
   npx asar extract app.asar app_extracted
   rm -rf app_extracted/out/renderer/assets/index-*.js
   rm -rf app_extracted/out/renderer/assets/index-*.css
   cp -r ../../../out/* app_extracted/out/
   npx asar pack app_extracted app.asar
   rm -rf app_extracted
   ```
6. **E2E teszt** ha DB-séma változott: `python tools/e2e_test.py`
7. **Commit + push**: `git add . && git commit -m "feat: ..." && git push`
8. **Memória frissítés**: az új topic-fájlokat a `~/.claude/projects/.../memory/`-ba

### "Ments mindent" parancs

A felhasználó a `ments mindent` parancsra elvárja:
1. `python tools/verify_state.py` — előbb ellenőrzés
2. `git add . && git commit -m "..."` — lokál
3. `git push` — GitHub
4. Memória-frissítés a `~/.claude/.../memory/`-ban

---

## 7. Backup és rollback

### Rollback-tagek a main branch-en

| Tag | Mit jelöl |
|---|---|
| `pre-todo6-refactor` | TODO-1..5 utáni stabil állapot, HetiTerv refaktor ELŐTT |
| `post-todo6-refactor` | TODO-6 utáni állapot (refaktor kész) |
| `post-todo-1-13-all-completed` | TODO-1..13 mind kész |
| `final-session-2026-05-13` | A teljes 16+1 feature session vége |

```bash
# Visszaállás:
git reset --hard <tag-név>

# Vagy konkrét commit:
git log --oneline -20
git reset --hard <commit-hash>
```

### Lokál backup-mappák

A `_ovodanaplo/_bak/` mappa minden nagy TODO előtt készít egy másolatot:
- `_bak/todo1-heti-terv-torles-2026...`
- `_bak/todo2-foglalkozas-ie-2026...`
- `_bak/todo3-kor-specifikus-2026...`
- ...stb.

Ezek **fájlrendszer-szintű** rollback-pontok — akár Git állapota nélkül is használhatók.

---

## 8. Aktuális TODO-állapot

**MIND a 13 közepes + 3 alacsony TODO KÉSZ** (kivéve: 16, 17, 18, 19 — explicit kihagyva user-igény alapján; 14B Playwright E2E — későbbi).

A részletes pending lista: `claude-memory/ovodanaplo_pending.md`

---

## 9. Felhasználó-átadás (felesége vagy más)

Az **OvodaNapló.exe** (`app/dist-installer/win-unpacked/`) **ON-OFF módon másolható** egy másik Windows-gépre is:

1. Másold át a teljes `win-unpacked/` mappát (~250 MB)
2. Az `OvodaNapló.exe`-re jobb klikk → "Asztali parancsikon létrehozása"
3. Az adatbázis automatikusan létrejön a Windows-felhasználó `%APPDATA%`-jában

A felesége gépén a fejlesztői Node/Python NEM kell — csak a Windows + a `win-unpacked/` mappa.

---

## A függelék — Hasznos parancsok

```bash
# Teljes verifikáció
python tools/verify_state.py --build  # ÚJRA-build előtte
python tools/e2e_test.py              # Backend e2e

# Unit tesztek (61 db)
cd app && npm test
cd app && npm run test:watch  # fejlesztés közben

# DOCX export tesztelés
# (a UI-on át a HetiTerv → "Letöltés .docx-ként" gomb)

# GitHub repo state
gh repo view --web Morzan1991/ovodanaplo
gh pr list
gh issue list
```

---

## B függelék — `CLAUDE.md` mintapéldás (új gépre)

Ha a `_ovodanaplo/`-ban CLAUDE.md-t akarsz létrehozni (a Claude Code automatikusan beolvassa a project-instrukciókat), íme egy mintapéldás:

```markdown
# OvodaNapló — fejlesztési protokoll

## Kötelező szabályok minden szerkesztés előtt:

1. MINDIG ellenőrizd a verify_state.py-t a változtatás után:
   `python tools/verify_state.py`

2. Új feature előtt készíts backup-ot:
   `cp <fájl> _bak/<task>-<dátum>/`

3. Mentés (`ments mindent` parancs):
   - python tools/verify_state.py
   - git add . && git commit
   - git push
   - memory-fájlok frissítése

## Architektúra

- Electron 33 + React 18 + TypeScript 5.7 + Drizzle ORM + better-sqlite3
- Main process: `src/main/` (IPC, DB, DOCX-export)
- Preload: `src/preload/index.ts` (contextBridge)
- Renderer: `src/renderer/src/` (React)
- Common types: `src/shared/`
- Tests: `src/**/*.test.ts` (Vitest)

## Kötelezően magyar UI

Minden gomb, üzenet, label MAGYAR. Az adatbázis is magyar mezőnevekkel
(pedagogus_neve, hetiTervId, stb.). A kód viszont angol (változónevek,
függvénynevek), kivéve ahol a domain-szöveg magyar.

## Tesztelés szerkesztés után

- TypeScript: `npm run typecheck`
- Unit: `npm test`
- E2E backend: `python tools/e2e_test.py`
- Build: `npm run build`
- A 17-lépéses wizard flow regression: manuális (RapidTurn-mintát követve)

## Nyelv

- Kommunikáció a felhasználóval: magyarul
- Kód, változónevek, kommentek: angolul (kivétel: a domain-mezők magyarul)
```

---

## C függelék — A repo szerkezeti map

```
_ovodanaplo/
├── README.md                    # Felhasználói rövid leírás
├── HANDOVER.md                  # EZ a fájl
├── CHANGELOG.md                 # Verzió-történet
│
├── app/                         # Electron alkalmazás
│   ├── package.json             # NPM csomag-meta
│   ├── tsconfig.{node,web}.json # TypeScript config
│   ├── electron.vite.config.ts  # electron-vite build config
│   ├── vitest.config.ts         # Vitest test config
│   ├── drizzle.config.ts        # Drizzle ORM config
│   ├── postcss.config.js        # Tailwind/PostCSS
│   ├── tailwind.config.js       # Tailwind paletta
│   │
│   ├── src/
│   │   ├── main/                # Electron main process
│   │   │   ├── index.ts         # Main bootstrap
│   │   │   ├── ipc.ts           # IPC handler-ek (39+)
│   │   │   ├── ipc-validate.ts  # Zod validate helper
│   │   │   ├── db/index.ts      # SQLite séma + seed-loader
│   │   │   ├── export-docx.ts   # DOCX-export (heti+foglalkozás+projekt)
│   │   │   └── templates/       # Sablon-betöltés
│   │   │
│   │   ├── preload/index.ts     # contextBridge API
│   │   ├── preload/index.d.ts   # Window type declarations
│   │   │
│   │   ├── renderer/src/        # React renderer
│   │   │   ├── App.tsx          # Router
│   │   │   ├── main.tsx         # React entry
│   │   │   ├── index.css        # Tailwind + global stílusok
│   │   │   ├── components/      # Reusable komponensek
│   │   │   │   ├── Layout.tsx               # Top-bar
│   │   │   │   ├── IrodalomAutoComplete.tsx # TODO-5
│   │   │   │   ├── KepessegMultiSelect.tsx  # TODO-11
│   │   │   │   └── UjNevelesiEvModal.tsx    # új év létrehozás
│   │   │   ├── pages/           # Útvonal-szintű oldalak
│   │   │   │   ├── Naptar.tsx               # Főoldal (havi nézet)
│   │   │   │   ├── HetiTerv.tsx             # Heti terv szerkesztő (647 sor)
│   │   │   │   ├── HetiTerv/                # Alkomponensek (TODO-6 refaktor)
│   │   │   │   ├── HetiReflexio.tsx         # Heti reflexió szerkesztő
│   │   │   │   ├── FoglalkozasSzerkeszto.tsx
│   │   │   │   ├── Projektek.tsx            # Projekt-lista
│   │   │   │   ├── ProjektSzerkeszto.tsx    # Projekt-űrlap (TODO-10A)
│   │   │   │   ├── Reflexiok.tsx
│   │   │   │   ├── Kereses.tsx              # FTS5 (TODO-12)
│   │   │   │   ├── Irodalom.tsx
│   │   │   │   └── Beallitasok.tsx
│   │   │   └── lib/
│   │   │       ├── utils.ts                 # Pure helpers
│   │   │       ├── utils.test.ts            # Vitest (17 teszt)
│   │   │       ├── eszkoz-kulcsszavak.ts    # TODO-13 (105+ kulcsszó)
│   │   │       └── eszkoz-kulcsszavak.test.ts
│   │   │
│   │   └── shared/              # Main + renderer közös
│   │       ├── schema.ts        # Drizzle ORM séma
│   │       ├── ipc-channels.ts  # IPC csatorna-nevek
│   │       └── schemas/
│   │           ├── ipc.ts       # Zod-schemák (TODO-8)
│   │           └── ipc.test.ts  # Vitest (31 teszt)
│   │
│   └── dist-installer/          # Build output (gitignore)
│       └── win-unpacked/        # Az élő Electron app
│           ├── OvodaNapló.exe
│           └── resources/
│               ├── app.asar
│               └── seed/        # Deploy-másolat
│
├── seed/                        # Forrás JSON-adatok
│   ├── weekly-templates.json    # 85 heti sablon (322 KB)
│   ├── otletek-bank-{vegyes,kicsi,kozepso,nagy}.json
│   ├── literature.json          # 383 irodalmi mű
│   ├── hungarian-holidays.json
│   └── kepessegek.json          # 71 képesség 6 kategóriában
│
├── tools/                       # Python szkriptek
│   ├── verify_state.py          # Állapot-ellenőrzés
│   ├── e2e_test.py              # E2E backend teszt
│   ├── build_kor_specifikus_bank.py  # TODO-3
│   ├── build_otletek_bank.py
│   └── ... (egyéb build-scriptek)
│
├── claude-commands/             # Claude Code slash-skill-ek
│   └── ovodanaplo-*.md (7 db)
│
├── claude-memory/               # Claude Code memory topic-fájlok
│   └── ovodanaplo_*.md (8 db)
│
├── _bak/                        # Backup-mappák (gitignore)
│   └── todo*-* (9 db)
│
├── marketing/
│   └── landing.html             # Marketing oldal (50 KB)
│
├── PROJECT.md                   # Projekt-történet (régebbi, v2.0-ig)
└── schema/                      # Drizzle migrációs SQL-ek
```

---

**Kérdéseid?** Az eredeti session során a Claude Opus 4.7 (1M context) szabadon "együtt-implementálta" a 16+1 új feature-t. A memóriafájlok tartalmazzák a teljes nyomdát, hogy a következő Claude is "ott folytassa", ahol az előző hagyta.

🌸 Sok sikert a folytatáshoz!
