---
name: OvodaNapló v2.6 — aktuális élő állapot 2026-05-12 vége
description: Aktuális állapot a session végén. 85 sablon, 2310 ötlet, 383 irodalom (28 felnőtt mű kiszedve), 7 saját skill, marketing landing oldal. Audit: 8.6/10 technikai, 9.2/10 szakmai.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---

# OvodaNapló v2.6 — 2026-05-12 vége

## ⚡ Mit kell tudni egy kontextus-újraindításkor

**Az alkalmazás működik élesben** (felesége gépén, asztali parancsikon). 2026-05-12 napon átfogó fejlesztés zajlott: a session előtt v2.0 → ma este v2.6.

**Beszélgetés-ID**: `1ea729df-ffec-48c4-97f6-b14a2137a56a`

## 📊 Aktuális verziók

| Komponens | Verzió | Méret | Megjegyzés |
|---|---|---|---|
| `weekly-templates.json` | **v2.5** | 322 KB | 85 sablon, 33 téma |
| `otletek-bank-{vegyes,kicsi,kozepso,nagy}.json` | **v2.5** | 4 × 133 KB | 2310 bullet/korcsoport (mind ugyanaz!) |
| `literature.json` | **v2.6** | 117 KB | 383 tétel (28 felnőtt mű kiszedve) |
| `app.asar` | **v0.1.0** | 48 MB | friss build 22:47 |

## 🎯 Ma elért fejlesztések

### 1. Sablon-bővítés (v2.4 → v2.5)

**A) Iskola előkészítő tevékenység üres bug — javítva**
- 21 legacy sablonhoz hozzáadva `iskolaElokeszitoTeruletek` mind az 5 főterületre
- Generic IE-tartalom terület-szerintén (Megfigyelőképesség, Szókincs, Finommotorika, Ritmusérzék, Nagymozgások stb.)
- Renderer fallback: meglévő heti terv betöltésekor, ha üres az IE, a sablon-cím alapján visszakereshet
- `IskolaElokeszito` komponens: üres szöveg → nem mutatja a fejlécet

**B) Körjáték áthelyezés mozgás → ének-zene — 20 sor**
- Script: `tools/fix_legacy_ie_es_korjatek.py`
- A "Körjáték:" prefixű sorokat keresi a `mozgas` területen, áthelyezi az `enek_zene`-re
- Indok: népi ének-tánc tevékenység, NEM nagymotorikus mozgás

**C) Zöld jeles napok bővítése — 4 új sablon**
- `mehek_napja_v1` (Méhek napja — beporzók és virágok) — május 20
- `mehek_napja_v2` (Méhek napja — méhészet, méz, hasznos rovarok) — május 20
- `erdok_napja_v1` (Erdők napja — fák és lakói) — március 21
- `erdok_napja_v2` (Erdők napja — fa mint nyersanyag) — március 21
- A meglévő 4 zöld nap mellé: Állatok világnapja, Víz Világnapja, Föld Napja, Madarak és Fák Napja

### 2. Ötlet-bank generálás (v2.5)

**Háttér**: A 4 AI agent (kicsi/közepes/nagy/vegyes) elakadt 600s watchdog-on. A 2170 bullet egyetlen JSON-ban túl nagy stream-elt válaszhoz.

**Helyette Python szkripttel** (`tools/build_otletek_bank.py`):
- Forrás: a meglévő 85 sablon bulletjei + 70 generic óvodás bullet
- Aggregálás téma-prefix alapján (V1+V2+legacy)
- Headerek (Mesék:, Mondókák, Tornatermi:) kiszűrve
- Deduplikálás kis-betűs egyezéssel
- Pontosan 10 bullet/téma/terület = **2310 bullet/korcsoport**
- 4 fájl: `otletek-bank-{vegyes,kicsi,kozepso,nagy}.json`

**FONTOS**: a 4 fájl **JELENLEG UGYANAZT a tartalmat** tartalmazza (alias). A `kicsi`/`kozepso`/`nagy` csak cimke-szinten különbözik. **Kor-specifikus differenciálás ELHALASZTVA** (lásd: TODO-3).

### 3. Irodalmi DB-tisztítás (v2.6)

**28 felnőtt/iskolás mű kivéve a 411-ből → 383**

Kivett (kifejezetten NEM óvodás):
- **Petőfi** (8): Nemzeti dal, A Tisza, Fa leszek ha..., Falu végén kurta kocsma, Füstbe ment terv, Az árva kislány, Szeptember végén, János vitéz részlet
- **Arany** (4): Toldi (1. ének), A fülemile, Szondi két apródja, A Toldi estéje (részlet)
- **Vörösmarty** (2): Szózat, A vén cigány
- **Ady** (4): Karácsony (2×), Őrizem a szemed, Fél-fáldobott kő
- **Kosztolányi** (4): Hajnali részegség, Mostan színes tintákról álmodom, Boldog szomorú dal, Ilona
- **Babits** (2): Új leoninusok, Esti kérdés
- **Tóth Árpád** (2): Esti sugárkoszorú, Körúti hajnal
- **József Attila** (1): Kertész leszek
- **Népmonda** (1): Toldi Miklós

**Maradt 383 tétel**, mind óvodás-szintű:
- 67 vers (csak gyermekversek)
- 90 mese, 40 népmese, 40 mondóka
- 39 regény (Csukás, Janikovszky, Marék, Bartos, Berg Judit, Varró Dániel)
- 37 dal, 36 találós kérdés, 10 körjáték, 9 verseskötet, 7 zenehallgatás, 5 népmonda, 3 altató

**Megjegyzés**: a `Berzsián és Dideki` (Lázár Ervin) MARADT — szereplő-név Lázár Ervin meseregényében (NEM Berzsenyi!).

**DB seed-loader frissítve** (`src/main/db/index.ts`):
- A meglévő DB-ben a `sajat=0` (seed-eredetű) tételeket, amelyek már nincsenek a JSON-ban → automatikusan törli
- A felhasználó saját tételei (`sajat=1`) érintetlenek
- Naplózza: `[db] Irodalom seed: N tétel törölve (már nincs a JSON-ban).`

### 4. Renderer-fixek

**HetiTerv.tsx** módosítások:
- Hook order fix korábban (useCallback-eket a feltételes return elé)
- Új state: `aktualisSablonAzonosito`, `csakAktualisTema`, `korSpecifikusOtletek`, `korcsoport`
- `nyitOtletekPanel` 4 lépéses fallback: hónap → aktuális hónap → minden hónap → sablonokLista() loop
- Téma-prefix fuzzy egyezés (husvet ↔ husveti_het, osz_kezdete ↔ osz_termenyek)
- "Üres tervezet" gomb resetel `aktualisSablonAzonosito`-t is
- Meglévő heti terv: heurisztikus sablon-visszakeresés a téma-cím alapján

**OtletekModal** UI:
- 2 szekciós panel: ⭐ KIEMELT (10 kor-specifikus) + 📚 ALTERNATÍV (sablon-bullettek)
- Korcsoport-cimke mauve háttérrel a fejlécben
- Toggle: 📌 Csak ehhez a témához / 📅 Minden téma a hónapból
- Auto-fallback banner ha <10 javaslat
- Alapérték: `csakAktualisTema = false` (mindig sok ötlet)

### 5. Új feature-ök az UI-ban

**Nevelési évhez korcsoport** (új mező a `nevelesi_evek` táblába):
- `NevelesiEvLetrehozas` UI: új korcsoport-dropdown (vegyes/kicsi/közepes/nagy)
- Mini-migráció (`db/index.ts`): `ALTER TABLE nevelesi_evek ADD COLUMN korcsoport TEXT DEFAULT 'vegyes'`

**Pasztell rózsaszín színvilág** (tailwind.config.js):
- `sage` palette HEX-csere: zöld → pasztell rózsaszín (#FDF5F8 → #52273A)
- `mauve` és `terra` paletták összehangolva
- 59 hivatkozás 8 fájlban automatikusan átszínezve

### 6. 7 új Claude Code slash-skill (~/.claude/commands/)

Mind külön `.md` fájl, globálisan elérhető minden Claude Code session-ben:

1. **`/ovodanaplo-status`** — Egysoros áttekintés (sablon-szám, ötlet-bank, deploy)
2. **`/ovodanaplo-sablon-check`** — JSON minőség-ellenőrzés (6 szekció, opt. --fix)
3. **`/ovodanaplo-irodalom-verify`** — Tiltott (Toldi, Nemzeti dal stb.) + whitelist szerző-mű
4. **`/ovodanaplo-deploy`** — Build → ASAR extract → csere → repack → verifikáció
5. **`/ovodanaplo-otletek-gen`** — Kor-specifikus ötletek **kisebb chunkokkal** (watchdog-mentes)
6. **`/ovodanaplo-docx-check`** — KRÉTA-formátum-ellenőrzés (20 szakasz)
7. **`/ovodanaplo-onap-compliance`** — ONAP-megfelelőség audit (pedagógiai)

Részletesen lásd: `ovodanaplo_skills.md`

### 7. Marketing landing oldal

**Hely**: `C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/marketing/landing.html` (50 KB)

- Önálló HTML, beágyazott CSS+JS, csak Google Fonts külső
- 13 szekció: Hero, Funkciók, Kinek készült, Összehasonlító táblázat, Munkafolyamat-timeline, Adatvédelem, Tartalmi gazdagság, Témakörök hónaponként, Compliance badges, Idézet, FAQ, Footer
- Pasztell rózsaszín design (egyezik az app sage palette-jével)
- Fraunces + Inter fontok, reszponzív, animált
- Sticky navbar, hover-effektek, fade-in IntersectionObserver

### 8. Audit eredmények

**Technikai**: 8.6/10 (szétbontás: arch 9, DB 9, IPC 7, bundle 8, kód-komplex 7, tooling 9)
**Szakmai**: 9.2/10 (ONAP 10, irodalom 10, mélység 9, differenciálás 7, mennyiség 10, KRÉTA 10)
**UX**: 8/10
**Adat-tartalom**: 5 000+ egység (85 sablon + 2310×4 bullet + 383 irodalom + 71 képesség + 37 ünnep)

## 🔴 NYITOTT TODO-k (priortás-sorrendben)

### KRITIKUS (most)
1. **Heti-terv törlés UI** — Naptáron + HetiTerv-en törlés-gomb (IPC handler létezik, csak UI hiányzik)
2. **Iskola előkészítő mező a foglalkozás-tervezetben** — séma + UI bővítés

### MAGAS (1-2 hét)
3. **Kor-specifikus differenciálás teljes** — Fázis B: bullet-annotációk regex+keyword alapon
4. **Sablonválasztó meglévő tervnél is** — most csak új tervnél
5. **Irodalom autocomplete** — 383 mű gépelés-közben
6. **HetiTerv.tsx refaktor** — 1336 sor → 5 alkomponens
7. **Reflexiók listából szerkesztés** — flow hiányzik

### KÖZEPES (1 hónap)
8. IPC input-validáció (Zod runtime check)
9. Heti terv másolása előző hétről
10. Projektterv részletes szerkesztő (Könyv projektterv.docx-alapján)
11. Tag-rendszer multi-select képességek (71-es seedből)
12. Évek közötti full-text keresés (SQLite FTS5)
13. Eszközlista auto-aggregálás kibővítése

### ALACSONY (jövő)
14. Unit + e2e tesztek (Vitest + Playwright)
15. "Tavaly ilyenkor" emlékeztető
16. Frissítés-mechanizmus (electron-updater)
17. AI-javaslat (lokális Llama vagy API)
18. Megosztás kollégákkal (jövő multi-user)
19. Mobil PWA read-only
20. Téma-cím duplikáció figyelmeztetés

Részletes ütemezés: `ovodanaplo_pending.md`

## 📂 Fájl-elhelyezések

```
C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/
├── app/                                # Electron alkalmazás
│   ├── src/
│   │   ├── main/
│   │   │   ├── ipc.ts                  # 39 IPC handler
│   │   │   ├── export-docx.ts          # KRÉTA-DOCX
│   │   │   ├── templates/generator.ts  # loadSablonok, loadOtletekBank
│   │   │   └── db/index.ts             # 12 SQLite tábla, mini-migráció
│   │   ├── renderer/src/pages/
│   │   │   ├── HetiTerv.tsx            # 1336 sor (refaktor-érett)
│   │   │   ├── FoglalkozasSzerkeszto.tsx
│   │   │   ├── Naptar.tsx              # NevelesiEvLetrehozas + korcsoport
│   │   │   ├── Irodalom.tsx
│   │   │   ├── HetiReflexio.tsx
│   │   │   ├── Beallitasok.tsx
│   │   │   └── Projektek.tsx           # 39 sor (csak lista, BŐVÍTENDŐ)
│   │   ├── shared/
│   │   │   ├── schema.ts               # Drizzle séma
│   │   │   └── ipc-channels.ts         # 39 csatorna
│   │   └── preload/index.ts            # contextBridge API
│   ├── dist-installer/win-unpacked/
│   │   ├── OvodaNapló.exe (188 MB)
│   │   └── resources/
│   │       ├── app.asar (48 MB, friss 22:47)
│   │       ├── app.asar.bak-pre-v2-templates (52 MB)
│   │       ├── app.asar.bak-pre-bullets (52 MB)
│   │       └── seed/                   # JSON adatfájlok (deploy)
│   └── package.json                    # Electron 33, React 18, TS 5.7
├── seed/                               # JSON adatok (forrás)
│   ├── weekly-templates.json (322 KB, v2.5, 85 sablon)
│   ├── otletek-bank-vegyes.json (133 KB, 2310 bullet)
│   ├── otletek-bank-kicsi.json (alias)
│   ├── otletek-bank-kozepso.json (alias)
│   ├── otletek-bank-nagy.json (alias)
│   ├── literature.json (117 KB, v2.6, 383 tétel)
│   ├── hungarian-holidays.json (37 ünnep)
│   └── kepessegek.json (71 képesség)
├── tools/                              # Python dev-scripts
│   ├── merge_templates.py
│   ├── merge_literature.py
│   ├── build_otletek_bank.py
│   ├── fix_legacy_ie_es_korjatek.py
│   ├── normalizal_legacy.py
│   ├── zold_napok_uj.py
│   ├── kiszedo_felnotti_versek.py
│   ├── javit_irodalom_es_ie.py
│   └── sablon-outputs/                 # AI agent kimenetek (5 fájl)
├── marketing/
│   └── landing.html (50 KB)            # ÚJ ma este
└── schema/, mockups/, PROJECT.md
```

## 💾 Adattár (felhasználói gépén)

```
C:/Users/Lenovo/AppData/Roaming/ovodanaplo/OvodaNaplo/
└── ovodanaplo.db                       # ~256 KB SQLite
```

Automatikus backup naponta egyszer az AppData mappa egy alkönyvtárába.

## 🛠️ Fejlesztői workflow ASAR repack-kel

```bash
# 1. Forrás módosítás (src/)
# 2. Build
cd app && npm run build

# 3. ASAR extract + csere + repack
cd dist-installer/win-unpacked/resources
rm -rf app_extracted
npx asar extract app.asar app_extracted
rm -rf app_extracted/out/renderer/assets/index-*.js
rm -rf app_extracted/out/renderer/assets/index-*.css
cp -r ../../../../out/* app_extracted/out/
npx asar pack app_extracted app.asar
rm -rf app_extracted

# 4. Seed JSON sync
cp ../../../../seed/*.json seed/

# Vagy egyetlen kommanddal:
# /ovodanaplo-deploy
```

## 🚨 Kritikus szabályok (a session-ben többször megerősítve)

1. **CSAK valós, óvodás-szintű irodalom** — SOSEM generálj AI-val új művet az irodalmi DB-be
2. **NE használj felnőtt verseket** — Toldi, Nemzeti dal, Ady-Karácsony, A Tisza, walesi bárdok, Szózat, Vörösmarty/Madách/Kosztolányi/Babits/Tóth Árpád/Berzsenyi felnőtt versei
3. **Engedett szerzők**: Petőfi (csak Anyám tyúkja, Itt van az ősz), Móra, József Attila (Altató, Mama, Tedd a kezed, Betlehemi királyok), Weöres, Csukás, Lázár Ervin, Marék Veronika, Donászy, Fésűs Éva, Gazdag Erzsi, Mentovics Éva, Nemes Nagy Ágnes (gyermekversek!), Bartos Erika, Berg Judit, Zelk Zoltán, népi mondókák/dalok/mesék
4. **Vegyes csoport (3-7 éves)** — a felhasználó konkrét helyzete (Mazsola csoport)
5. **Magyar UI + magyar dokumentumok** — minden gomb, minden üzenet magyar
6. **KRÉTA-kompatibilis DOCX** — Times New Roman 12pt, bullet pontok, fejléc nélkül
7. **Lokális adattárolás** — semmi cloud, semmi tracking
8. **Adatvédelem**: SNI-detektor a tartalom-mezőkben

## 📝 Folytatáshoz szükséges info egy új session-ben

Ha új kontextusban folytatod:
1. Olvasd: `MEMORY.md` index + ez a fájl (`ovodanaplo_v2.6_state.md`)
2. Konkrét feladatok: `ovodanaplo_pending.md`
3. Skill-ek: `ovodanaplo_skills.md`
4. Indító parancs: `/ovodanaplo-status` (egysoros állapot-áttekintés)
5. Beszélgetés-ID: `1ea729df-ffec-48c4-97f6-b14a2137a56a`

A felhasználó utolsó üzenete ebben a session-ben: "Ments mindent."
