# ÓvodaNapló — áttekintés kódellenőrzéshez

Ez a dokumentum ahhoz készült, hogy egy kívülálló fejlesztő fél nap alatt
átlássa a projektet, le tudja fordítani, futtatni és érdemben át tudja nézni.

A kód és a kommentek **magyarul** vannak, mert egyetlen felhasználója egy magyar
óvodapedagógus, és a tartalom is magyar szakmai anyag. Az azonosítók is magyarok
(`hetiTerv`, `nevelesiEv`, `korcsoport`), ezt nem érdemes „megjavítani".

---

## 1. Mi ez a program

Windowsra készült asztali alkalmazás egyetlen óvodapedagógus számára. Heti
terveket, foglalkozás-tervezeteket, projekteket és reflexiókat ír vele, majd
Word-fájlba exportál, amit az intézményi rendszerbe (KRÉTA / oviKRÉTA) tölt fel.

Keretrendszer: az **Óvodai nevelés országos alapprogramja** (ONAP) hét
tevékenységi területe. Ez a hetes bontás a program gerince, minden adatszerkezet
ezt követi:

| Azonosító | Terület |
|---|---|
| `kulso_vilag` | Külső világ tevékeny megismerése |
| `matematika` | Matematikai tartalom |
| `verseles_meseles` | Verselés, mesélés |
| `rajzolas_festes` | Rajzolás, festés, mintázás |
| `enek_zene` | Ének, zene |
| `hallas_ritmus` | Hallás és ritmusérzék |
| `mozgas` | Mozgás |

Négy korcsoport: `kicsi` (3–4 év), `kozepso` (4–5), `nagy` (5–7), `vegyes` (3–7).

**Fontos tervezési megkötések** (ezek nem hiányosságok, hanem döntések):

- Egyfelhasználós. Nincs bejelentkezés, nincs jogosultságkezelés, nincs szerver.
- Minden adat a gépen marad. Nincs hálózati hívás, nincs analitika, nincs
  telemetria. A tartalombiztonsági szabály (CSP) `connect-src 'self'`.
- Offline működik. Nincs online függőség futásidőben.

---

## 2. Indítás

```bash
cd app
npm install
npm run dev          # fejlesztői indítás, élő újratöltéssel
npm test             # 192 teszt
npm run typecheck    # főprocesz + renderer külön tsconfig
npm run package:win  # NSIS telepítő a dist-installer mappába
```

Node 24, Python 3.12 (csak a tartalom-generáló szkriptekhez kell).

A `better-sqlite3` natív modul, `electron-rebuild` fut a `postinstall`-ban. Ha a
fordítás elhasal, a Visual Studio Build Tools hiánya a szokásos ok.

---

## 3. Felépítés

Szokásos Electron hármas. A `app/src` alatt:

```
main/        főprocesz — 4 768 sor
  index.ts        ablak, biztonsági szabályok, életciklus
  ipc.ts          51 IPC-csatorna, ez a tényleges API-felület
  db/index.ts     séma, migrációk, seed-betöltés, mentés
  db/kulcs.ts     titkosítási kulcs kezelése
  export-docx.ts  Word-export (KRÉTA-formátum)
  templates/      heti terv generálás sablonokból
preload/     276 sor — contextBridge, ez a teljes `window.api`
renderer/    React felület — 6 983 sor
  pages/          képernyők (HetiTerv, Naptar, Projektek, Reflexiok…)
  components/     közös elemek
  lib/            tiszta függvények, ezek tesztelve vannak
shared/      main és renderer közt osztott kód — 1 082 sor
  schema.ts       Drizzle-séma
  unnepnaptar.ts  mozgó ünnepek számítása
  schemas/ipc.ts  bemenet-ellenőrzés (zod)
```

Adatfolyam: **renderer → `window.api` (preload) → IPC → main → Drizzle → SQLite**.
A renderernek nincs közvetlen fájl- vagy adatbázis-elérése.

---

## 4. Adattárolás és biztonság

- **SQLite**, a `better-sqlite3-multiple-ciphers` csomagon keresztül (npm alias
  alatt `better-sqlite3` néven). WAL mód, bekapcsolt idegen kulcsok.
- **SQLCipher titkosítás.** A kulcs 256 bit véletlen (`randomBytes(32)`), és az
  Electron `safeStorage`-ével (Windowson DPAPI) titkosítva, külön fájlban ül.
  Másik gépre másolva az adatbázis nem olvasható.
- **Visszaállítási kulcs.** A felhasználó kimentheti szövegfájlba, ez az egyetlen
  módja a helyreállításnak, ha a Windows-profil elvész.
- **Napi biztonsági mentés** indításkor, WAL-checkpoint után, méret-ellenőrzéssel,
  30 példány megtartásával.

Az ablak `contextIsolation: true`, `nodeIntegration: false`. A `sandbox` viszont
`false` — ezt érdemes megnézni, hogy visszakapcsolható-e. A külső linkek
fehérlistán mennek át, a navigáció le van tiltva.

---

## 5. A tartalom GENERÁLT — ez a legfontosabb tudnivaló

A `seed/` mappa 34 800 sornyi JSON-t tartalmaz: heti terv sablonokat, egy
1 024 tételes irodalomtárat és négy korcsoportos ötletbankot 15 220 javaslattal.

**Ezt a mappát nem szabad kézzel szerkeszteni.** A `tools/` alatti Python-szkriptek
állítják elő, és az újragenerálás felülírná a kézi módosítást.

A lánc:

```
tools/korpusz/*.py          gondozott irodalmi korpusz (műfaj, korosztály, téma)
tools/jatek_leirasok.py     játékleírások saját megfogalmazásban
tools/cel_feladat_szovegek.py  korcsoportos cél- és feladatszövegek
tools/otlet_szovegek.py     ötletbank-sorok
        ↓  a *_beepites.py / *_ujrairas.py szkriptek építik be
seed/*.json
```

A szkriptek **idempotensek**: kétszer lefuttatva a második futás nem változtat
semmit. Ez ellenőrizhető a fájlok ellenőrzőösszegével.

### Miért így

A tartalom nagy része egy nyomtatott óvodai kiadványból (a „Tappancs") indult ki.
A pedagógiai ötlet szabadon átvehető, a megfogalmazás nem, ezért **minden átvett
szöveget újraírtunk** saját szavakkal: 214 játékleírást, 210 cél- és
feladatszöveget és 351 ötletbank-sort.

Ezt három teszt őrzi (`jatekleiras.test.ts`, `celfeladat.test.ts`,
`seed-szerzoi-jog.test.ts`): összevetik a teljes seedet a kiadványból kinyert
szöveggel, és elbuknak, ha 45 karakternél hosszabb egyezés kerül vissza. A
küszöb azért 45, mert az ennél rövidebb egyezések szakkifejezések
(„számfogalom alakítása"), azok nem állnak védelem alatt.

Az irodalomtárban teljes szöveggel csak közkincs szerepel: 102 népköltés,
valamint Petőfi, Arany, Móra és József Attila művei. A többi 910 tételnél csak a
cím és a szerző van tárolva.

---

## 6. Tesztek

192 teszt, `vitest`. Nincs böngészős vagy végponttól végpontig futó teszt, a
felületet kézzel próbáltuk. A tesztek nagy része tiszta függvényekre és a
generált tartalom helyességére megy:

- ünnepnaptár, mozgó ünnepek dátuma hat évre előre;
- a heti terv generálás: minden fő ünnep kap sablont, nincs üres hét;
- irodalmi besorolás: dal nem kerül a versek közé;
- a Word-export szerkezete;
- szerzői jogi őrszemek (fent).

---

## 7. Ismert hibák és nyitott kérdések

Ezeket egy 2026. szeptemberi átvizsgálás találta, egyik sem javított:

1. **Ablakbezáráskor elveszhet az utolsó ~2,5 másodperc.** Az automentés
   késleltetett; a `beforeunload` elindítja a mentést, de az IPC aszinkron, és a
   főprocesz `before-quit`-ben azonnal zárja az adatbázist. Verseny van a kettő
   közt. Elnavigálásnál nincs gond, csak az ablak bezárásánál.
   Érintett: `renderer/src/pages/HetiTerv.tsx` (~400. sor), `main/index.ts:189`.

2. **13 IPC-handler nem ellenőrzi a bemenetét**, 26 igen. Kihasználható rés nem
   látszik (a hívó a saját renderer, minden lekérdezés paraméteres), de
   következetlen. Lásd `main/ipc.ts`.

3. **`sandbox: false`** a `BrowserWindow`-on. Megnézendő, hogy a preload
   átalakítható-e sandbox-kompatibilisre.

4. **Két npm-sebezhetőség** (`drizzle-orm`, `nanoid`), egyik sem érinti ezt a
   kódot: az egyik dinamikus tábla- és oszlopneveket igényelne, a másik negatív
   méretet. A drizzle frissítése töréssel jár.

5. **A biztonsági mentések ugyanazon a lemezen vannak**, mint az éles adat.
   Gépvesztés esetén minden odavész. Nincs gépen kívüli másolat.

6. **19 helyen natív `alert` / `confirm`** fut. Működik, de kilóg a felület
   megjelenéséből.

---

## 8. Hol érdemes kezdeni

Javasolt sorrend, ha az a kérdés, hogy megbízható-e a program:

1. `app/src/main/db/index.ts` — séma, migrációk, seed-betöltés, mentés. Itt van a
   legtöbb kockázat, mert ez ír a felhasználó adataira. Külön figyelmet érdemel a
   `seedIrodalom`: korábban felülírta a kézzel beírt szövegeket, most `sajat = 0`
   szűréssel és `jsonSzoveg ?? meglevo.szoveg` logikával védi őket.
2. `app/src/main/db/kulcs.ts` — kulcskezelés, rövid fájl.
3. `app/src/main/index.ts` — ablakbeállítások, külső link, navigáció.
4. `app/src/main/ipc.ts` — a teljes API-felület, 51 csatorna.
5. `app/src/renderer/src/pages/HetiTerv.tsx` — a legösszetettebb képernyő, itt
   fut az automentés és a sablonkezelés.
6. `app/src/main/export-docx.ts` — a Word-export, mert a végtermék ezen múlik.

A `tools/` mappa átnézése csak akkor szükséges, ha a tartalom előállítása a
kérdés. A felhasználó szempontjából az a `seed/`-ben már kész.

---

## 9. Ami NINCS a csomagban

- `node_modules/` — `npm install` állítja elő (774 MB az `app` alatt).
- `app/dist-installer/` — a kész telepítő és a kicsomagolt build, 563 MB.
- `.git/` — a verzióelőzmény. A csomag így egy tiszta forrás-pillanatkép; a
  teljes előzményhez a GitHub-repóba kell meghívás. (Azért marad ki, mert a
  fejlesztői jegyzetek kihagyása enélkül nem érne semmit: a `.git` visszaadná
  őket.)

A teljes projektmappa a gépen 1,4 GB; ebből a forráskód és a tartalom 8,9 MB. A
különbség mind újraelőállítható.
- **A felhasználó adatbázisa és annak mentései.** Ezek valódi, gyermekekre
  vonatkozó adatokat tartalmaznak (köztük sajátos nevelési igényre utaló
  megjegyzéseket), ezért szándékosan kimaradtak. A program üres adatbázissal
  indul, a `seed/` tartalmát betöltve.

Ha az ellenőrzéshez valódi adat kell, azt a felhasználótól külön kell kérni, és
csak anonimizálva érdemes átadni.
