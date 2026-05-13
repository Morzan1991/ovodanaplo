# OvodaNapló

Pedagógiai műhely magyar óvodapedagógusoknak — heti tervek, projektek, foglalkozás-tervezetek, reflexiók szerkesztése magyar ünnepi naptárral és KRÉTA-kompatibilis DOCX/PDF exporttal.

**Stack**: Electron + Vite + React + TypeScript + Tailwind + SQLite (Drizzle ORM).
**Cél platform**: Windows 10/11 (Linux/macOS működhet, nem tesztelt).
**Adat helye**: `%APPDATA%\OvodaNaplo\` — minden lokálisan, semmi felhő.

---

## Előfeltételek (egyszeri telepítés)

### 1. Node.js 20+ (LTS)

Töltsd le innen: <https://nodejs.org/> — válaszd a **LTS** verziót (jelenleg 20.x vagy 22.x).

Ellenőrzés a PowerShell-ben:

```powershell
node --version    # v20.x.x vagy újabb
npm --version     # 10.x.x vagy újabb
```

### 2. Visual Studio Build Tools (csak, ha a `better-sqlite3` nem talál prebuilt binárist)

A `better-sqlite3` általában **prebuilt** Windows-bináriskkal érkezik, de néha le kell fordítania natívan. Ha a `npm install` hibát ad „node-gyp" / „MSBuild" hibával:

1. Töltsd le: <https://visualstudio.microsoft.com/visual-cpp-build-tools/>
2. Telepítéskor jelöld be: **„Desktop development with C++"** workload.
3. Vagy egyszerűbb: PowerShell admin módban:

   ```powershell
   npm install --global windows-build-tools
   ```

   (Ez egy régebbi, de még működő automatikus telepítő.)

Általában **nem kell** ezt megcsinálni — próbáld először az `npm install`-t.

### 3. Git (opcionális, verziókezeléshez)

<https://git-scm.com/download/win>

---

## Telepítés

```powershell
cd C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\app
npm install
```

Az `npm install` automatikusan futtatja az `electron-builder install-app-deps` parancsot (`postinstall`-ban), ami az Electron-verzióhoz igazítja a natív modulokat (`better-sqlite3`).

---

## Futtatás fejlesztői módban

```powershell
cd C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\app
npm run dev
```

Mit csinál:
- elindítja a Vite dev szervert (renderer hot reload-dal)
- elindítja az Electron főproceszt
- megnyit egy ablakot az alkalmazással
- a DevTools külön ablakban nyílik (fejlesztői módban)

Első indításkor:
1. A `%APPDATA%\OvodaNaplo\ovodanaplo.db` fájl létrejön.
2. A táblák kialakulnak.
3. A seed adatok (irodalom, ünnepek, képességek) betöltődnek a `../seed/*.json`-ból.
4. A „Naptár" képernyő egy nevelési-év létrehozási formot mutat.

---

## Funkciók — jelen állapot (MVP 1. fázis vége)

✅ Kész:
- Electron + React + Tailwind + SQLite váz
- Adatmodell (12 tábla, Drizzle séma)
- IPC API (heti terv, projekt, reflexió, esemény, irodalom, beállítások)
- Magyar ünnepi naptár (~37 tétel, előtöltve)
- Irodalmi adatbázis (~85 tétel, csak valós szerzőktől)
- Képesség-tag rendszer (~70 tétel)
- Nevelési-év létrehozás
- Heti terv szerkesztő (6 ONAP-terület)
- Naptári éves nézet (hetekre bontva, ünnepekkel)
- Reflexiók, projektek, irodalom-böngésző (alapszint)
- Beállítások (pedagógus, óvoda, csoport)
- Lokális auto-backup (indításkor egyszer/nap)
- Adatvédelmi inline figyelmeztetés (kvázi-azonosító kulcsszavakra)

⏳ Hamarosan (következő ciklus):
- DOCX export (KRÉTA-feltöltésre, az intézményi Word-sablon szerint)
- PDF export
- Foglalkozás-tervezet részletes szerkesztő (motiváció, fő rész, befejezés, stb.)
- Projektterv részletes szerkesztő (a `Könyv projektterv.docx` táblázatos struktúrája)
- Heti reflexió szerkesztő (területenként)
- Irodalom autocomplete a tervezetekben
- Tag-rendszer multi-select
- Eszközlista auto-aggregálás

---

## Buildelés (telepítő készítése)

```powershell
npm run package:win
```

Ez:
1. Lefuttatja a TypeScript fordítást
2. Bundle-eli a renderer-t Vite-tal
3. Bundle-eli a main + preload-ot
4. Electron-builder NSIS-telepítőt készít → `dist-installer\OvodaNapló Setup X.X.X.exe`

A `dist-installer\` mappa végtermékét lehet odaadni a feleségednek telepítésre.

---

## Adattár szerkezet

A `%APPDATA%\OvodaNaplo\` mappán belül:

```
ovodanaplo.db          ← fő SQLite adatbázis
ovodanaplo.db-wal      ← write-ahead log
ovodanaplo.db-shm      ← shared memory
backups/
  ├── ovodanaplo-2026-05-11.db   ← napi snapshot (max 10 megőrizve a 2. ciklusban)
  └── ...
exports/               ← generált DOCX/PDF (a 2. ciklusban)
```

Backup módja: a teljes `OvodaNaplo` mappát másold OneDrive-ra, USB-re, vagy bárhova.

---

## Hibakeresés

### „Cannot find module 'better-sqlite3'"
A `postinstall` lépés nem futott le rendesen. Manuálisan:

```powershell
npx electron-builder install-app-deps
```

### „Vite dev server hangs / nem nyit ablakot"
- Ellenőrizd, hogy a `5173` port szabad-e
- Próbáld újra: zárd be az összes Electron procceszt a Task Managerben, majd `npm run dev`

### „SQLite syntax error"
A DB séma nem szinkron. A legbiztosabb: zárd be az appot, töröld a `%APPDATA%\OvodaNaplo\ovodanaplo.db*` fájlokat, és indítsd újra. **VIGYÁZAT**: ez törli az adatokat. Csak fejlesztés alatt csináld!

### „Tűzfal / SmartScreen blokkol"
- Az első futtatáskor a Windows Defender SmartScreen figyelmeztet (nem ismert kiadó).
- Klikk: „Részletek" → „Futtatás mindenképpen".
- Hosszú távon: kódaláíró tanúsítvány kell (~30 000 Ft/év), de ez később.

---

## Mappastruktúra

```
app/
├── electron.vite.config.ts       ← Vite konfiguráció (main + preload + renderer)
├── drizzle.config.ts             ← Drizzle Kit konfiguráció (migrációkhoz)
├── package.json
├── tailwind.config.js
├── tsconfig*.json                ← TypeScript (composite projektek)
├── src/
│   ├── shared/                   ← main és renderer közös típusai
│   │   ├── schema.ts             ← Drizzle SQLite séma
│   │   └── ipc-channels.ts       ← IPC csatorna-nevek
│   ├── main/                     ← Electron főprocesz (Node.js)
│   │   ├── index.ts              ← app életciklus, ablak-létrehozás
│   │   ├── ipc.ts                ← IPC handlerek (DB-műveletek)
│   │   └── db/
│   │       └── index.ts          ← SQLite init, seed, backup
│   ├── preload/
│   │   ├── index.ts              ← contextBridge: window.api
│   │   └── index.d.ts            ← globális típus-deklaráció
│   └── renderer/                 ← React UI
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx           ← routing
│           ├── index.css         ← Tailwind + custom classok
│           ├── components/
│           │   └── Layout.tsx
│           ├── lib/
│           │   └── utils.ts      ← cn(), dátum-formatter, adatvéd-detect
│           └── pages/
│               ├── Naptar.tsx          ← éves naptári nézet
│               ├── HetiTerv.tsx        ← heti terv szerkesztő
│               ├── Projektek.tsx       ← projektek listája
│               ├── Reflexiok.tsx       ← reflexiók listája
│               ├── Irodalom.tsx        ← irodalmi adatbázis böngésző
│               └── Beallitasok.tsx     ← pedagógus + óvoda + csoport
└── README.md                     ← ez a fájl
```

---

## Fejlesztői megjegyzések

- **TypeScript composite projects**: `tsconfig.json` referenciaként hivatkozik a node és web alprojektekre. Külön-külön gyorsabb a hibakeresés.
- **Drizzle ORM**: típusbiztos SQLite query-k. A séma a `src/shared/schema.ts`-ben van.
- **IPC**: minden DB-művelet a main process-ben fut. A renderer csak `window.api.*` hívásokon keresztül kommunikál. Sandbox: be.
- **CSP**: szigorú Content Security Policy a `renderer/index.html`-ben — csak Google Fonts kivétel.
- **Magyar nyelv mindenhol**: változónevek, IPC csatornanevek, UI szövegek mind magyarul. Csak a framework-szintű kulcsszavak (React, Drizzle, stb.) angolok.

---

## Licenc

Privát projekt, nem terjesztendő. © Lisztmaier Gábor, 2026.
