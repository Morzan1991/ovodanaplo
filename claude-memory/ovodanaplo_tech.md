---
name: OvodaNapló — technikai stack és build workflow
description: Electron + Vite + React + SQLite stack, Node 24 install gotchák, ASAR-repack workflow az NSIS hibák miatt.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---
# OvodaNapló tech stack

## Stack
- **Electron** 33.4 + **electron-vite** 2.3 + **Vite 5.4** (NEM Vite 6 — peer dep konflikt electron-vite-szel)
- **React 18** + **TypeScript 5.7** + **React Router 7**
- **Tailwind CSS** 3.4 + saját pasztel paletta (cream/sage/mauve/terra)
- **SQLite** via **better-sqlite3** + **Drizzle ORM** 0.36
- **docx** npm csomag (Word-export programatikusan)
- **Fraunces** (serif) + **Inter** (sans-serif) Google Fonts
- Adat: `%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db`

## Install workflow (Node 24 specifikus!)
A `npm install` önmagában NEM működik Node 24-en:
- better-sqlite3-nak nincs Node 24 prebuilt → kompilálni próbál → nincs MSVC → fail
- electron-vite `tsconfig.node.json`-ja `electron-vite/tsconfig.node.json`-ra hivatkozik → NEM létezik

**Megfelelő telepítés** (PowerShell-ben):
```
cd C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\app
npm install --ignore-scripts
npx electron-builder install-app-deps
cd node_modules\electron && node install.js
cd ..\..
npm run dev
```

Önálló **tsconfig.node.json** és **tsconfig.web.json** írva (NEM örököl külső csomagtól).

## Build + telepítő workflow
Az `npm run package:win` (electron-builder NSIS) **FAIL** Windows-on (admin nélkül szimlinket nem tud csinálni macOS dylib-ekhez a winCodeSign cache-ben). Workaround: **manuális ASAR repack** (mint a RapidTurn-nél).

**ASAR-frissítés workflow** (rebuild után):
```bash
taskkill /F /IM "OvodaNapló.exe"
cd app && npm run build
cp seed/weekly-templates.json dist-installer/win-unpacked/resources/seed/
cd dist-installer/win-unpacked/resources
npx asar extract app.asar app-extracted
cp -r ../../../out/. app-extracted/out/
rm app.asar && npx asar pack app-extracted app.asar
rm -rf app-extracted
```

**Asztali parancsikon**: `C:\Users\Lenovo\Desktop\OvodaNaplo.lnk` → `app\dist-installer\win-unpacked\OvodaNapló.exe`

## Architektúra
- **Main process** (Electron, Node.js): `src/main/index.ts`, `src/main/db/index.ts`, `src/main/ipc.ts`, `src/main/export-docx.ts`, `src/main/templates/generator.ts`
- **Preload** (contextBridge): `src/preload/index.ts` → exposes `window.api` typed API
- **Renderer** (React): `src/renderer/src/`
- **Shared**: `src/shared/schema.ts` (Drizzle séma), `src/shared/ipc-channels.ts` (IPC csatorna-nevek)

## Tudnivalók
- **`__dirname` ESM-ben**: explicit definíció `dirname(fileURLToPath(import.meta.url))` (Vite auto-injektálja, de defensive)
- **Seed mappa elérése**: `__dirname` szempontjából a `out/main/` 3 szint feljebb = `_ovodanaplo/` (dev) vagy `process.resourcesPath/seed` (prod)
- **CSP**: `script-src 'self' 'unsafe-inline'` szükséges, mert a `file://` protokoll nem `'self'` a default szerint
- **Preload kiterjesztés**: `.mjs` (NEM `.js`) — Vite SSR bundle-nek alapból
- **Magyar idézőjel JSON-ban**: `„...""` PÁR — záró-jelnek `"` (U+201D), NEM ASCII `"` — különben JSON parse fail
