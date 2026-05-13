# OvodaNapló

> Lokális desktop alkalmazás óvodapedagógusoknak — heti tervek, projektek, reflexiók.
> Magyar UI, ONAP-megfelelőség, KRÉTA-kompatibilis DOCX-export, **zéro cloud**.

[![Verzió](https://img.shields.io/badge/verzi%C3%B3-2.7.0-FDD0DC)](./CHANGELOG.md)
[![Platform](https://img.shields.io/badge/platform-Windows-blue)](#telep%C3%ADt%C3%A9s)
[![Lokál](https://img.shields.io/badge/cloud-NINCS-success)](#adatv%C3%A9delem)

## Mit tud?

- **85 heti sablon** (33 téma, V1+V2 verziók) — 21 magyar ünnep + szezonális témák
- **2310 ötlet** korcsoport-szerinti szűréssel (kicsi / közepes / nagy / vegyes)
- **383 valós irodalmi mű** — autocomplete a területenkénti tartalomban
- **Heti terv-szerkesztő** 7 ONAP-területtel + iskola-előkészítő szekciókkal
- **Foglalkozás-tervezet** 19 mezővel — KRÉTA-DOCX export
- **Projektterv** 5 szekciós űrlap — KRÉTA-DOCX export
- **Évek közötti full-text keresés** (SQLite FTS5)
- **71 képesség-tag** 6 kategóriában — heti tervhez kapcsolható chip-rendszer
- **"Tavaly ilyenkor"** emlékeztető — korábbi évek hasonló hetére visszatekintés
- **Reflexiók** heti / foglalkozás / projekt szinten

## Telepítés

### Felhasználói (alapfutó)

A telepítő nem-szignáció miatt a Windows Defender szóhasználatos. **Egyetlen biztonságos út**:

1. Másold át a `_ovodanaplo/app/dist-installer/win-unpacked/` mappa **TELJES** tartalmát egy célmappába (pl. `C:\Program Files\OvodaNapló\`)
2. Az `OvodaNapló.exe`-re jobb klikk → "Asztali parancsikon létrehozása"
3. Indítsd a parancsikonról

Az adatbázis automatikusan létrejön: `%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db`

### Fejlesztői

Lásd: [**HANDOVER.md**](./HANDOVER.md) — teljes átadási dokumentum (Node, npm, Claude Code, GitHub setup egy új gépen).

## Mappa-struktúra

```
_ovodanaplo/
├── app/                      # Electron alkalmazás (TypeScript + React + Drizzle ORM)
│   ├── src/main/             # Electron main process (IPC, DB, DOCX-export)
│   ├── src/preload/          # contextBridge API
│   ├── src/renderer/         # React renderer (UI)
│   ├── src/shared/           # Közös típusok + Zod schemák
│   └── dist-installer/       # Build output (gitignore)
├── seed/                     # JSON-adatok (templates, otletek-bank, literature)
├── tools/                    # Python szkriptek (build, verify, e2e tests)
├── marketing/                # Landing oldal
├── claude-commands/          # Claude Code slash-skill-ek (7 db)
├── claude-memory/            # Claude Code memory-fájlok (8 db)
├── HANDOVER.md               # Átadási dokumentum másik gép setup-hoz
└── CHANGELOG.md              # Verzió-történet
```

## Verzió

**2.7.0** — 2026-05-13 — lásd [CHANGELOG.md](./CHANGELOG.md) a részletekért.

## Adatvédelem

- **Minden adat LOKÁLISAN** tárolódik (SQLite + JSON fájlok)
- **NINCS cloud, NINCS telemetria, NINCS tracking**
- Adatvédelmi detektor figyelmeztet, ha a szöveg gyermek-azonosítót tartalmazna (SNI, BTMN, "egy kisfiú/kislány", stb.)

## Licenc

UNLICENSED — privát használat. A repo Morzan1991 GitHub-fiókján privát.

## Köszönet

- Az óvodapedagógus-tanácsadó (a felesége, Mazsola csoport) — minden szakmai követelmény
- ONAP (Óvodai Nevelés Országos Alapprogramja) — pedagógiai struktúra
- Magyar irodalom (Móra, Weöres, Csukás, József Attila, Marék Veronika, Bartos Erika, Lázár Ervin, Berg Judit) — 383 mű
- Anthropic Claude Opus 4.7 — fejlesztési párprogramozás

---

*"Egy szülő szeretete azé az óvodapedagógusé, aki minden gyermekre úgy néz, mint a sajátjára."*
