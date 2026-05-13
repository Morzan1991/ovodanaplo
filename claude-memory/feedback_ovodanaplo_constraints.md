---
name: OvodaNapló — kötelező szabályok és preferenciák
description: A felhasználó által explicit megfogalmazott kemény szabályok az OvodaNapló projektben (no AI literature, lokális, magyar UI, stb.)
type: feedback
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---
# OvodaNapló — kemény szabályok

## 1. Mesék/versek/dalok CSAK valós szerzőktől
**Why**: A felhasználó explicit kérése. A nyelvi modellek hajlamosak hihetően hangzó, de **kitalált** magyar gyermekirodalmat „javasolni" (pl. nem létező Weöres-vers vagy Lázár Ervin mese). Tilos.
**How to apply**: 
- AI SOHA nem generál új művet az irodalom-adatbázisba
- Csak a `seed/literature.json` 84 előtöltött tételéből vagy a felhasználó által hozzáadott művekből választhat
- Minden javaslatnál kötelező a szerző + forrás mező
- Új mű felvitelekor a UI kötelezővé teszi a szerző-megadást

## 2. Adatok kizárólag lokálisan
**Why**: User explicit kérése (2026-05-11), GDPR egyszerűsítés. Gyerekek nevei nem szerepelnek, de még a pedagógus szöveg is privát.
**How to apply**:
- SQLite a `%APPDATA%\ovodanaplo\OvodaNaplo\`-ban
- Backup OneDrive-mappára szinkronizálható, de mi nem implementálunk cloud-sync-et
- Megosztás-funkció **csak 3. fázisban**, ha kifejezetten kéri

## 3. Magyar UI mindenhol
**Why**: User explicit preferencia. A felesége magyar óvodapedagógus.
**How to apply**:
- Minden gombfelirat, üzenet, label, error magyarul
- Változó- és tábla-nevek is magyarul a kódban (pl. `hetiTervek`, `teruletek`, `beallitasok`)
- Csak framework-szintű angol marad (React, Drizzle, stb.)

## 4. Adatvédelmi inline figyelmeztetők (nem tilt, csak figyelmeztet)
**Why**: A user 2017-es reflexióiban szerepel „SNI-s gyermekünk", „beszédprobléma" — különleges adat GDPR Art. 9 alatt, indirekt-azonosító kis csoportban.
**How to apply**:
- Mintázatok: `SNI`, `BTMN`, „sajátos nevelési igény", „beszédprobléma", „egy kisfiú", „egy kislány", „diagnoszt", „betegsége"
- A `vanAdatvedelmiKockazat()` függvény a `src/renderer/src/lib/utils.ts`-ben
- Figyelmeztető megjelenik a HetiTerv, FoglalkozasSzerkeszto, HetiReflexio oldalon
- **NEM blokkolja a mentést** — csak megjeleníti hogy „érdemes általánosabban fogalmazni"

## 5. NEM kell auto-évi generálás
**Why**: User 2026-05-12 explicit kérése: „Elég lenne amúgy egy heti generálás az adott hétre, nem kell a teljes évet kitöltse."
**How to apply**:
- A sablon-választó NEM dolgozik teljes évre
- Új heti terv készítésénél megjelenik a sablon-dropdown
- A user 21 sablon közül választhat (saját doksijai + magyar ünnepek)
- Az „Évre generálás" gombot 2026-05-12 estén eltávolítottuk

## 6. Word-formátum egyezzen a `Hetiterv üres.docx`-szel
**Why**: User kifejezett kérése — a generált DOCX feltöltendő oviKRÉTA-ba, intézmény-kompatibilis formátum kell.
**How to apply**:
- Times New Roman 12 pt
- A 6 ONAP-terület címek pontosan: „Külső világ tevékeny megismerésére nevelés:", „Verselés, mesélés:", stb.
- „Matematikai tartalom:" és „Hallás és ritmusérzék fejlesztés:" külön alszekcióként, kisebb címmel
- Lezáró rész: Cél, Feladat, Differenciálás, Módszerek, Képességfejlesztés, Eszközök

## 7. Az óvoda + csoport név JOGOSAN szerepelhet
**Why**: User kérdezte 2026-05-11 — válasz: NEM személyes adat, intézmény (jogi személy) + csoport-megnevezés („Mazsola csoport") nem azonosító önmagában.
**How to apply**:
- A Beállítások-ban beállítható, és minden DOCX fejlécbe automatikusan megjelenik
- A reflexió-szövegekkel KOMBINÁLVA viszont közvetett azonosítást teremthet → ez a 4. szabály témája
