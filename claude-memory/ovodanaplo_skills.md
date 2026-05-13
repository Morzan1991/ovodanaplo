---
name: OvodaNapló — Slash-skillek dokumentációja
description: 7 saját skill az OvodaNapló projekt minőségbiztosításához és deploy-jához. 2026-05-12-én létrehozva, ~/.claude/commands/ mappában.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---

# OvodaNapló — Slash-skillek dokumentációja

## Helyük
`C:\Users\Lenovo\.claude\commands\ovodanaplo-*.md` — 7 file, mind globális (minden Claude Code session-ben elérhető).

## A 7 skill

### 1. `/ovodanaplo-status` — Projekt állapot ellenőrzés
Egysoros áttekintés: sablon-szám, ötlet-bank, deploy állapot, DB méret, friss build.
- `--detail`: per-téma + per-terület bullet-eloszlás
- Output: táblázat 5-6 sorral (sablon DB, ötlet-bank, deploy, DB, build)

### 2. `/ovodanaplo-sablon-check` — Sablon-validátor
JSON minőség-ellenőrzés a `seed/weekly-templates.json`-on.
- 6 szekció: struktúra / felnőtt irodalom / bullet-szám / IE-területek / körjáték-szabály / téma-prefix dedup
- `--fix`: automatikus javítások (iskolaElokeszitoTeruletek hozzáadás, körjáték áthelyezés)
- `--tema=NEV`: csak egy témára (gyors)

### 3. `/ovodanaplo-irodalom-verify` — Irodalom-verifikáció
Tiltott (Toldi, Nemzeti dal, Ady-Karácsony stb.) ÉS megengedett (whitelist) szerző-mű kombináció ellenőrzés MIND a 4 forráson:
- weekly-templates.json
- otletek-bank-{vegyes,kicsi,kozepso,nagy}.json
- `--fix`: auto-csere óvodás alternatívára
- Konkrét csere-térkép (pl. Nemzeti dal → Anyám tyúkja)

### 4. `/ovodanaplo-deploy` — Biztonságos deploy
Build → ASAR extract → out/ csere → ASAR repack → verifikáció. Backup-rotation (max 5 backup), file-lock kezelés.
- `--skip-build` / `--skip-verify` / `--no-backup`
- Output: 10-soros lépés-táblázat zöld pipákkal

### 5. `/ovodanaplo-otletek-gen` — Kor-specifikus ötletek (watchdog-mentes)
A korábban elakadt AI agentek problémájára megoldás: KISEBB CHUNKOK (5-6 téma/agent). Sorozatos futtatás 4 korcsoportra.
- `--korcsoport=kicsi/kozepso/nagy/vegyes/mind`
- `--temak=mikulas,karacsony` (konkrét témákra)
- `--chunks=5` (chunk-méret)
- Időbecslés: 7 chunk × ~5-7 perc/chunk = ~35-50 perc/korcsoport
- MIND a 4 korcsoportra párhuzamosan: ~50 perc

### 6. `/ovodanaplo-docx-check` — KRÉTA-formátum-ellenőrzés
Generált .docx fájl formátum-megfelelősége a felhasználó `Hetiterv üres.docx` mintájához.
- 20 szakasz: betűtípus, bullet listák, alfejezetek, fejléc-hiány
- `--generate-and-check`: új heti tervet generál és exportál

### 7. `/ovodanaplo-onap-compliance` — ONAP-megfelelőség
Pedagógiai szempontok ellenőrzése: 7 területi teljesség, cél/feladat konkrétság, képességfejlesztés multi-domain (8+), eszközök realizmus, időbeli illeszkedés, differenciálás, magyar nyelvi minőség.
- `--tema=mikulas` vagy `--all`
- 10-pontos pontszám

## A 7 skill összefüggése

```
Heti munkamenet végén:
1. /ovodanaplo-sablon-check --fix         # Adat-minőség
2. /ovodanaplo-irodalom-verify --fix      # Irodalom-tisztítás
3. /ovodanaplo-onap-compliance --all      # Pedagógiai audit
4. /ovodanaplo-status --detail            # Áttekintés
5. /ovodanaplo-deploy                     # Build + deploy
6. /ovodanaplo-docx-check --generate-and-check  # Smoke teszt

Új ötletek igényekor:
1. /ovodanaplo-otletek-gen --korcsoport=kicsi --chunks=5
2. /ovodanaplo-sablon-check
3. /ovodanaplo-deploy
```

## Anthropic-skillek a projekthez relevánsak

A globális `anthropic-skills:*` skillek közül érdekes:
- **anthropic-skills:docx** — Word dokumentumok kezelése (KRÉTA-exporthoz hasznos lehet)
- **anthropic-skills:mcp-builder** — Ha valaha egyedi MCP-t építünk (pl. Magyar Irodalmi DB)
- **anthropic-skills:skill-creator** — Skill-finomítás, eval futtatás

## MCP-k

A `mcp-registry` keresés MIND a 4 keresési kulcsra üres eredményt adott (document/docx, sqlite, electron, education). NINCS releváns publikus MCP.

Ha az OvodaNapló egyedi MCP-t kapna, az `anthropic-skills:mcp-builder` skill-lel készíthető. Lehetséges MCP-jelöltek:
- **ovodanaplo-irodalom-mcp**: kereshetnék lokálisan 411 irodalmi tételt
- **ovodanaplo-szakmai-mcp**: ONAP keretrendszer, magyar óvodapedagógiai szókincs

Ezek azonban CSAK akkor készítendők, ha a felhasználó megosztásra/multi-felhasználós módra vált.

## Karbantartás

- A skillek `.md` fájlok, manuálisan szerkeszthetők
- Új OvodaNapló-skill: új `.md` a `~/.claude/commands/ovodanaplo-XXX.md`-vel
- A Claude Code automatikusan felfedezi indításkor
