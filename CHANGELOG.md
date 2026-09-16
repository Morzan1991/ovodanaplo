# Verziótörténet

## v2.11.14 — 2026-09-16 — a néphagyomány nem jogvédett

**Javítva: a program 316 közkincs műre azt írta, hogy szerzői jogvédelem alatt
áll.** Az Irodalom menüben egy szöveg nélküli mű megnyitásakor a program eddig a
`forrás` mező alapján döntötte el, hogy közkincs-e: csak akkor engedte beírni a
szöveget, ha abban szerepelt a „nép" szó. A tételek nagy része viszont a gondozott
korpuszból generálódik, annak pedig nincs `forrás` mezője — 485 szerző nélküli
műből 308-nál üresen maradt. Így népmesékre, mondókákra, népdalokra és találós
kérdésekre is azt írta a program, hogy jogvédettek. Ez nem igaz: a népi gyűjtés
közkincs.

Mostantól a szerző dönt — ahol nincs szerző, ott nincs kit védeni:

- népi műfaj szerző nélkül (népmese, népmonda, mondóka, dal, körjáték, altató,
  találós kérdés, valamint a néphagyományból való mese) → közkincs, a szöveg
  beírható és onnantól a programban marad;
- szerző nélküli vers vagy zenehallgatás → a program nem állít semmit, a
  pedagógus dönti el, beírja-e;
- ahol van szerző, ott marad a korábbi tájékoztatás.

Új modul és teszt: `lib/irodalom-jogallas.ts` és `irodalom-jogallas.test.ts`
(6 eset). 236 → 242 teszt.

**Dokumentáció.** A README verzió-jelvénye 2.11.12-n állt, miközben a szövege
2.11.13-at írt; az ÁTTEKINTÉS két helyen két különböző tesztszámot közölt (203 és
236). Mind a valós értékre javítva.

## v2.11.13 — 2026-09-15 — visszaállítás a visszaállítási kulccsal

**Javítva: a visszaállítási kulcsot a program sehol nem kérte be.** A kulcs arra
készült, hogy Windows-újratelepítés vagy profilsérülés után vissza lehessen nyitni
vele a naplót. Ha a felhasználó ilyenkor visszamásolta a
`%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db` fájlt, a program pont ekkor
rontotta el a dolgot:

- ha a `kulcs.dat` nem volt mellette, kérdés nélkül **új kulcsot** generált és
  tárolt el — a meglévő napló ezzel nem nyílt meg, a program nem indult, és a
  `kulcs.dat`-ban onnantól a rossz kulcs állt;
- ha a `kulcs.dat` is átkerült, de az új Windows-fiók nem tudta visszafejteni, a
  titkosított naplót **kulcs nélkül** próbálta megnyitni — így sem indult.

Mindkét esetben ablak nélkül futott tovább a háttérben, ezért újraindítani sem
lehetett.

Mostantól meglévő, titkosított naplóhoz a program soha nem készít új kulcsot, és
kulcs nélkül sem nyitja meg. Ha a tárolt kulcs hiányzik, nem fejthető vissza, vagy
nem ehhez a naplóhoz tartozik, induláskor egy kis ablakban **bekéri a
visszaállítási kulcsot**. A kulcsot csak olvasva próbálja ki az adatbázison: rossz
kulcsnál semmit nem ír, a naplót nem módosítja. A helyes kulcsot a Windows
védelmével eltárolja, a következő indítás már kérdés nélkül megy. Így gyógyul az
is, akinek a régi verzió már rossz kulcsot írt a `kulcs.dat`-ba: a program jelzi,
hogy a tárolt kulcs egy másik naplóé, és a visszaállítási kulccsal megnyílik.

Ha az adatbázis más okból nem nyitható meg (zárolt vagy sérült fájl), a program
hibaüzenetet ad és kilép — nem fut tovább ablak nélkül.

Új tesztek: `kulcsdontes.test.ts` (20 eset), `kulcsproba.test.ts` (7, valódi
titkosított fájlokon), `kulcsszoveg.test.ts` (6). 203 → 236 teszt.

## v2.11.12 — 2026-09-15 — a visszaállítási kulcsfájl védelme

**Tisztázás: a telepítő nem visz magával adatot.** A telepítőben csak a program
és a közös tartalom van (irodalom, sablonok, ötletek). A felhasználó adatai a
Windows-fiók adatmappájában élnek (`%APPDATA%\ovodanaplo\OvodaNaplo`). Ugyanazon
a gépen, ugyanazzal a fiókkal ezért minden újratelepítés ugyanazt a naplót nyitja
meg — ez szándékos, így egy frissítés nem töröl semmit. Más gépen vagy más
Windows-fiókkal a program üres naplóval indul.

**Javítva: az Asztalon lévő visszaállítási kulcsfájl felülírása.** Új titkosítási
kulcs minden olyan indításkor keletkezik, amikor az adatmappa üres: új gépen, új
fiókkal, próbatelepítésnél. A program ilyenkor kérdés nélkül az Asztalon lévő
`OvodaNaplo-visszaallitasi-kulcs.txt`-be írta a kulcsot, felülírva az ott lévőt.
Ha az egy másik, régebbi napló kulcsa volt, az a napló visszaállíthatatlanná vált
volna. Mostantól foglalt név esetén időbélyeges fájl készül, és a program jelzi,
hogy a korábbit nem írta felül. A Beállításokból indított kézi mentés is szabad
nevet ajánl fel.

Új teszt: `kulcsfajl.test.ts` (3 eset). 200 → 203 teszt.

## v2.11.11 — 2026-09-15 — logikai átvizsgálás, tartalmi hibák javítása

Végigvizsgáltuk a tartalmat szerkezeti, logikai és nyelvhelyességi szempontból.
Amit talált és javított:

**Lapfejlécek műként.** A kiadvány PDF-jéből négy tétel lapfejlécként került be
mondókaként: „MESÉLÉS" és „VERSELÉS". Ezek eltűntek.

**Csonka címek.** Három olyan tétel volt, amelynek a kinyerés levágta az elejét:
„anyának!", „fújása", „(pingponglabda) fújása". Visszaállíthatatlanok, ezért
kikerültek; a fújós játék az anyanyelvi játékok közt megmarad.

**OCR-hiba egy szerzőnévben.** „lllyés Gyula" — három kis L-lel, mert a kinyerés
a nagy I-t l-nek olvasta. A mű most „A háromágú tölgyfa tündére", a gyűjtő neve
a megjegyzésben.

**Műfaji tévedés.** Móra Ferenc „A didergő király" című **verse** az egyik
helyen meseként szerepelt. Volt egy „Március 15" című **népmese** is — ilyen nincs;
a két azonos című vers megmaradt.

**Szerző a cím mezőben.** Négy tételnél a szerző vagy a műfajcímke beleragadt a
címbe („Vers: Gyárfás Endre: Írogató"). Most a saját mezőjükben állnak.

**Rossz leírás azonos nevű játékokon.** A „Folytasd a sort!" a matematikában
mintasort folytat, anyanyelvi játékként viszont szavakat gyűjt — a seedben az
anyanyelvi soron a matematikai magyarázat állt. Összesen **16 sor** viselt olyan
leírást, amely egy másik, azonos nevű játékhoz tartozott. A `jatek_ujrairas.py`
mostantól akkor is odaadja a sornak a saját szövegét, ha már van rajta valamilyen
leírás — korábban csak az üres és a kiadványból származó sorokat nézte.

**Három játék két leírással.** A „Hangstaféta", a „Lábujjtorna" és a „Mondd egy
szóval!" két különböző megfogalmazást kapott az átíráskor. Egységesítve.

**Mondattöredékek.** Négy helyen egy zárójeles hozzáfűzés külön sorrá esett szét,
és a nyitó zárójel elveszett — így egy értelmetlen, „)"-re végződő sor keletkezett
(„Hol siklik a szán?)"). Visszaillesztve az előző mondatba.

**Nyelvhelyesség.** „A kenyér útja — a magtól **a** asztalig" → „az asztalig".

**Új: `tools/irodalom_takaritas.py`.** Az `irodalom_beepites.py` szándékosan csak
bővíti az irodalomtárat (230 olyan mű van benne, amely sosem volt a korpuszban —
Lázár Ervin, Csukás István, Arany János és társaik), ezért a korpuszból kijavított
tételek régi alakja bent ragadt. Ez a szkript vezeti ki őket, névre szólóan,
indoklással.

**Új őrzőteszt (`seed-irodalom.test.ts`, 8 eset).** Elbukik, ha visszakerül csupa
nagybetűs, kisbetűvel vagy zárójellel kezdődő cím, „Vers:"-sel kezdődő cím,
cím mezőbe ragadt szerző, „lll" kezdetű OCR-hiba, vagy magánhangzó előtt álló
„a" névelő egy sablon címében. A tesztek száma 192-ről 200-ra nőtt.

## v2.11.10 — 2026-09-15 — a mobil ág eltávolítása, csonka ötletsor javítása

**A mobil ág kikerült.** A `mobile/` mappa (Capacitor-alapú Android ötletelő) és
a hozzá tartozó két segédszkript (`tools/mobil_tartalom.py`,
`tools/mobil_ikon.py`) törlődött — összesen 38 fájl. Önálló, szinkron nélküli
ötletelő volt, amely a seedből generált másolatot vitte telefonra: minden
tartalomváltozás után külön lépést kívánt, és ez a lépés könnyen kimaradt, így a
telefonon észrevétlenül régi tartalom maradhatott. A kód a git előzményében
megmarad, onnan bármikor visszahozható.

**Egy csonka ötletsor javítva.** A „testünk" téma verselés-mesélés listájában a
nagycsoportnál „Találós kérdések az (anyanyelvi játék)" állt — a PDF-kinyerés
levágta a szót. A javító-tábla „az állatokról"-ra egészítette volna ki, ami ide
téves: az állatos változat az `erdo_allatai` témában áll, épen. A helyes alak —
amit ugyanennek a témának a középső csoportos listája is mutat — „Találós
kérdések az **érzékszervekről**". A seed és a tábla is erre javítva.

**Az átadási csomagból kimarad a `.git`.** A csomagoló eddig kihagyta a
fejlesztői jegyzeteket, de a verzióelőzményt belecsomagolta — abból viszont
visszanyerhetők voltak. A csomag így 477 fájl helyett 178, és tiszta
forrás-pillanatkép.

A program viselkedése egyébként változatlan; ez a kiadás a fenti tartalmi
javítást viszi be.

## v2.8 – v2.11.9 — 2026-09 — tartalom, jogtisztaság, szerkeszthetőség

Összefoglaló; a részletes indoklás a kód kommentjeiben és az `ATTEKINTES.md`-ben van.

**Tartalom.** A sablonok 85-ről 114-re, a témák 33-ról 65-re, az irodalomtár
383-ról 1 024 tételre, az ötletbank 2 310-ről 15 220 javaslatra nőtt. Az irodalmi
anyag gondozott korpuszból generálódik (`tools/korpusz/`), műfaj, korosztály és
téma szerint — ezzel megszűnt, hogy dal kerüljön a versek közé, vagy hogy mind a
négy korcsoport szó szerint ugyanazt kapja.

**Jogtisztaság.** A forráskiadványból szó szerint átvett szövegeket saját
megfogalmazásra cseréltük: 214 játékleírás, 210 korcsoportos cél- és
feladatszöveg, 351 ötletbank-sor. Három teszt őrzi, hogy ne kerülhessen vissza.

**Szerkeszthetőség.** Javítva a dokumentum nézet, ahol minden leütés után
elveszett a fókusz, és ahol az üres sor azonnal eltűnt. Az irodalmi
kiegészítő már csak gépeléskor ajánlkozik, és nem veszi el az Entert.

**Heti terv ütemezés.** Húsvét és pünkösd az ünnep ELŐTTI hétre kerül. Két mentő
lépés került a sablonválasztásba, hogy egy hétre eső két jeles nap közül a
vesztes ne maradjon ki az évből.

**Titkosítás.** SQLCipher, a kulcs a Windows DPAPI-védelmével tárolva,
visszaállítási kulccsal.

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
