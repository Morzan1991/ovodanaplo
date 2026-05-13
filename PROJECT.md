# OvodaNapló — Pedagógiai műhely óvodapedagógusoknak

> Lokális desktop alkalmazás magyar óvodapedagógusok dokumentációs munkájának támogatására. Heti tervek, projekt-tervek, foglalkozás-tervezetek és reflexiók szerkesztése, magyar ünnepi naptárral, irodalmi adatbázissal és KRÉTA-kompatibilis DOCX/PDF exporttal.

## Pozicionálás

| Eszköz | Mire való |
|---|---|
| **oviKRÉTA** (kötelező, állami) | Hivatalos csoportnapló, mulasztási, törzskönyv |
| **OvodaNapló** (ez a projekt) | A pedagógus **gondolkodási és tervezési műhelye** |

A két eszköz egymást kiegészíti. Az OvodaNapló kimenete (DOCX) feltölthető oviKRÉTA csatolmányként.

## Pedagógiai alapvetés

Az ONAP (Óvodai Nevelés Országos Alapprogramja) szerinti hat tevékenységi terület minden hetiterv- és projekttervben kötelezően megjelenik:

1. **Külső világ tevékeny megismerésére nevelés** (matematikai tartalom alszekcióval)
2. **Verselés, mesélés** (mesék + mondókák/versek)
3. **Rajzolás, festés, mintázás, építés, képalakítás, kézimunka**
4. **Ének, zene, népi játék, tánc** (hallás- és ritmusérzék-fejlesztéssel)
5. **Mindennapos mozgás** (tornatermi + csoportban/udvaron)

Minden tevékenységi területnél megjelölhető az „Iskola előkészítő tevékenység" rész (5–7 éves korosztály).

## Technikai stack

```
Frontend:     Electron + Vite + React + TypeScript
UI:           Tailwind CSS + shadcn/ui (radix primitívek)
DB:           SQLite + better-sqlite3 (embedded, gyors)
ORM:          Drizzle ORM (TypeScript-natív, lightweight)
Export:       docx npm csomag (Word), Electron print-to-PDF (PDF)
Packaging:    electron-builder → Inno Setup telepítő
Update-feed:  RapidTurn-szerű mechanizmus
Adat helye:   %APPDATA%/OvodaNaplo/
```

**Költségek**: 0 Ft/hó (lokális, nincs hosting).

## Adatbiztonság

- **Lokális** SQLite adatbázis a felhasználó gépén
- **Háromrétegű backup**:
  1. Automatikus heti snapshot a `backups/` mappába (utolsó 10 megőrizve)
  2. OneDrive/Dropbox-mappa szinkron (opcionális, mi nem implementáljuk a felhőt — csak Windows-szinkron mappára írunk)
  3. Manuális USB-export ZIP-be
- **Inline adatvédelmi figyelmeztetések**: ha SNI, viselkedési minta vagy kvázi-azonosító megjelenik a szövegben — javaslat általánosabb megfogalmazásra (NEM tilt)

## Fő funkciók (fázisonként)

### 1. fázis — MVP (~3 hét fejlesztés)
- [x] Nevelési év naptári-térkép (drag-drop, rugalmas időszakok)
- [x] Heti terv szerkesztő (6 ONAP-terület + lezáró rész)
- [x] Projekt-terv szerkesztő (1–3 hetes átfogó téma, táblázatos)
- [x] Foglalkozás-tervezet szerkesztő (egyedi tevékenységre)
- [x] Reflexió szerkesztő (foglalkozás + heti + projekt szintű)
- [x] Magyar ünnepi naptár előtöltve
- [x] Irodalmi adatbázis (versek, mesék, dalok valós szerzőkkel, ~80 induló tétel)
- [x] DOCX export (intézményi formátum, KRÉTA-feltöltésre)
- [x] PDF export
- [x] Lokális auto-backup
- [x] Inno Setup telepítő

### 2. fázis — Kényelmi funkciók (~2 hét)
- Sablon-bank (tavalyi tervek újrahasznosítása)
- Évek közötti full-text keresés (SQLite FTS5)
- „Tavaly ilyenkor" emlékeztető
- Tag-rendszer (képességfejlesztés multi-select)
- Eszközlista auto-aggregálás (szövegből → eszközmező)
- Képek (esemény-szintű, név nélkül)
- Update-feed mechanizmus

### 3. fázis — Jövőbeli (opcionális)
- Megosztás kollégákkal (akkor cloud szükséges)
- AI-javaslat helyi Llama-modellel (csak adatbázisból, nem generál!)
- oviKRÉTA API integráció (ha lesz)
- Mobil quick-note PWA (read-only nézet)

## Mappastruktúra

```
_ovodanaplo/
├── PROJECT.md                    ← ez a dokumentum
├── tools/                        ← fejlesztői segédek
│   ├── read_docx.py             ← docx-tartalom kiolvasó (referencia)
│   └── read_docx_rest.py
├── schema/
│   └── schema.ts                 ← Drizzle SQLite séma
├── seed/
│   ├── literature.json           ← versek/mesék/dalok DB (~80 tétel)
│   ├── hungarian-holidays.json   ← magyar ünnepi naptár
│   └── kepessegek.json           ← képességfejlesztés tagek
├── mockups/
│   └── heti-terv.html            ← statikus UI mockup
└── app/                          ← maga az Electron alkalmazás
    ├── package.json
    ├── electron.vite.config.ts
    ├── tsconfig*.json
    ├── tailwind.config.ts
    ├── src/
    │   ├── main/                 ← Electron main process
    │   ├── preload/
    │   └── renderer/             ← React UI
    └── README.md                 ← futtatási útmutató
```

## Design irányelvek

- **Színpaletta**: krémfehér háttér (#FAF7F2), zsálya-zöld accent (#8FA88B), mályva másodlagos (#C9A4A8), mély tinta szöveg (#2D2A26). Évszakos akcens-váltakozás.
- **Tipográfia**: cím Fraunces (lágy serif), törzs Inter (sans-serif). 16–18 pt törzs.
- **Layout**: bal oldali navigáció, középen szerkesztő, jobb oldali kontextus-panel.
- **Nyomtatás**: külön „hivatalos" rendering (Times New Roman 12, fekete-fehér, intézményi sablon-szerű).
- **Glassmorphism TILOS** — letisztult, „papír-érzetű" pedagógiai eszköz.

## Adatvédelmi alapelvek

- Lokális adatok, nincs hálózati átvitel
- Az óvoda + csoport nevek megengedettek (jogi személy, nem személyes adat)
- A reflexiókban inline figyelmeztetők gyermekekre vonatkozó kvázi-azonosítóknál
- Mesék/versek csak **valós szerzőktől**, forrás-mezővel
- AI **soha nem generál** verset vagy mesét — csak az adatbázisból választ

## Fejlesztési alapelvek

- Magyar nyelvű UI minden részletre
- Kevesebb klikkelés > több automatizmus (eszközlista auto, tag-rendszer, sablonra építés)
- Word-formátum egyezzen a feltöltött `Hetiterv üres.docx`-szel
- Egy ember el tudja tartani 5+ éven át
- A bemenetek a felhasználó dokumentumai legyenek a forrás (15 minta-docx alapozott)

## Referenciák

- ONAP: 363/2012. (XII. 17.) Korm. rendelet
- oviKRÉTA: tudasbazis.ekreta.hu
- Storypark (ihlet): „Learning Stories" pedagógiai dokumentáció minta
- A pedagógus 15 dokumentuma (forrás-anyagok)
