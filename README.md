# ÓvodaNapló

> Lokális desktop alkalmazás óvodapedagógusoknak — heti tervek, projektek, reflexiók.
> Magyar UI, ONAP-megfelelőség, KRÉTA-kompatibilis DOCX-export, **zéro cloud**.

[![Verzió](https://img.shields.io/badge/verzi%C3%B3-2.11.15-FDD0DC)](./CHANGELOG.md)
[![Platform](https://img.shields.io/badge/platform-Windows-blue)](#telep%C3%ADt%C3%A9s)
[![Lokál](https://img.shields.io/badge/cloud-NINCS-success)](#adatv%C3%A9delem)

## Mit tud?

- **114 heti sablon** (65 téma, V1+V2 változatok) — 39 magyar jeles nap + szezonális témák
- **15 213 tevékenység-ötlet** korcsoport szerint szűrve (kicsi / középső / nagy / vegyes)
- **1 005 valós irodalmi mű** — kiegészítés gépelés közben a területek tartalmában
- **Heti terv-szerkesztő** 7 ONAP-területtel + iskola-előkészítő szekciókkal
- **Foglalkozás-tervezet** 19 mezővel — KRÉTA-DOCX export
- **Projektterv** 5 szekciós űrlap — KRÉTA-DOCX export
- **Évek közötti full-text keresés** (SQLite FTS5)
- **71 képesség** 6 kategóriában — a heti tervhez kapcsolható, és a szövegbe is bekerül
- **"Tavaly ilyenkor"** emlékeztető — korábbi évek hasonló hetére visszatekintés
- **Reflexiók** heti / foglalkozás / projekt szinten

## Kódellenőrzéshez

Ha a programot át kell néznie valakinek, az [**ATTEKINTES.md**](./ATTEKINTES.md)
a belépési pont: felépítés, indítás, a generált tartalom láncolata, ismert hibák
és javasolt olvasási sorrend.

## Telepítés

### Felhasználói

A `npm run package:win` egy NSIS-telepítőt készít a `app/dist-installer/` mappába
(`ÓvodaNapló Setup x.y.z.exe`). Ezt kell futtatni. A telepítő nincs aláírva, ezért
a Windows SmartScreen figyelmeztet; a „További információ" alatt lehet továbblépni.

Az adatbázis első indításkor jön létre:
`%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db`

### Fejlesztői

```bash
cd app && npm install && npm run dev
```

Részletek: [**ATTEKINTES.md**](./ATTEKINTES.md), új gép beállítása:
[HANDOVER.md](./HANDOVER.md).

## Mappa-struktúra

```
ovodanaplo/
├── app/                      # Electron alkalmazás (TypeScript + React + Drizzle ORM)
│   ├── src/main/             # főprocesz (IPC, adatbázis, titkosítás, DOCX-export)
│   ├── src/preload/          # contextBridge — ez a teljes window.api
│   ├── src/renderer/         # React felület
│   ├── src/shared/           # main és renderer közt osztott kód (séma, zod, ünnepnaptár)
│   └── dist-installer/       # build kimenet (gitignore)
├── seed/                     # GENERÁLT tartalom — kézzel ne szerkeszd
├── tools/                    # Python: a seed előállítása és karbantartása
├── schema/                   # adatbázis-séma dokumentáció
├── marketing/                # landing oldal
├── claude-commands/          # fejlesztői segéd-parancsok
├── ATTEKINTES.md             # ← kódellenőrzéshez ez a belépési pont
├── HANDOVER.md               # új gép beállítása
└── CHANGELOG.md              # verziótörténet
```

## Verzió

**2.11.15** — lásd [CHANGELOG.md](./CHANGELOG.md) a részletekért.

## Adatvédelem

- **Minden adat a gépen marad** (SQLite + JSON fájlok)
- **Az adatbázis titkosított** (SQLCipher). A kulcs a Windows saját védelmével (DPAPI) tárolódik, így másik gépre másolva az adatbázis nem olvasható
- **Visszaállítási kulcs**: Windows-újratelepítés vagy profilsérülés után visszamásolt naplónál a program induláskor bekéri, és csak azt a kulcsot fogadja el, amely valóban nyitja a naplót
- **Napi biztonsági mentés**, 30 példány megtartásával
- **NINCS cloud, NINCS telemetria, NINCS tracking**
- Adatvédelmi detektor figyelmeztet, ha a szöveg gyermek-azonosítót tartalmazna (SNI, BTMN, "egy kisfiú/kislány", stb.)

## Licenc

UNLICENSED — privát használat. A repo Morzan1991 GitHub-fiókján privát.

## Köszönet

- Az óvodapedagógus-tanácsadó (a felesége, Mazsola csoport) — minden szakmai követelmény
- ONAP (Óvodai Nevelés Országos Alapprogramja) — pedagógiai struktúra
- Magyar irodalom (Móra, Weöres, Csukás, József Attila, Marék Veronika, Bartos Erika, Lázár Ervin, Berg Judit) — 1 005 mű
- Anthropic Claude Opus 4.7 — fejlesztési párprogramozás

---

*"Egy szülő szeretete azé az óvodapedagógusé, aki minden gyermekre úgy néz, mint a sajátjára."*
