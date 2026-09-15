# ÓvodaNapló — mobil (ötletelő)

Önálló, ingyenes Android-alkalmazás óvodapedagógusoknak. Nem heti tervet ír,
hanem **ötleteléshez** való: a teljes tartalomtár a zsebben, korosztály szerint
szűrve.

- Csomagnév: `hu.lisztmaier.ovodanaplo`
- Nincs fiók, nincs szerver, nincs analitika, nincs szinkron.
- A telefonon egyedül a **választott korosztály** és a **kedvencek** tárolódnak.

## Miért Capacitor és nem React Native

Az asztali program React + Tailwind felülete így nagyrészt újrahasznosítható, és
a tartalom ugyanabból a `seed/` mappából jön. Külön natív felület esetén a 30
komponenst újra kellene írni, cserébe ez az app úgysem tesz semmi natívat a
megosztáson kívül.

## Miért nincs adatbázis

A teljes tartalom 1,25 MB JSON. Ennyi elfér a memóriában, gyorsan kereshető, és
így nincs natív SQLite-függőség, migráció, sem első indítási feltöltés. A négy
korcsoport ötletbankja külön fájl, dinamikus importtal — csak az töltődik be,
amelyiket éppen nézi a felhasználó.

## Tartalom frissítése

A `src/tartalom/` mappa **generált**, kézzel ne szerkeszd:

```bash
npm run tartalom     # python ../tools/mobil_tartalom.py
```

Ez a közös `seed/`-ből dolgozik, így az asztali és a mobil app tartalma nem tud
szétcsúszni.

## „Ez a hét" a kezdőképernyőn

Az óvónő hétben tervez, nem hónapban, ezért a kezdőképernyő legfelső eleme az
aktuális nevelési hét: dátumhatár, sorszám, a hét témája és a hétre eső jeles
napok.

A számítás (`src/lib/hetek.ts`) az asztali program szabályait ülteti át
(`app/src/shared/unnepnaptar.ts` + `app/src/main/templates/generator.ts`), hogy a
két felület ne mondjon mást ugyanarra a hétre:

- a mozgó ünnepeket (húsvét, farsang, advent, anyák napja…) évre SZÁMÍTJUK, mert
  a seedben álló dátum egy konkrét évhez tartozik;
- a hétvégére eső ünnep a szomszédos munkanapra tolódik;
- téma-választás: **ünnep > hónap+sorrend > hónap**;
- a nevelési év szept. 1-től jún. 30-ig tart, a téli szünet hetei kimaradnak.

Mivel a telefonon nincs adatbázis (nincs „már felhasznált sablon" tárolva), a
teljes nevelési évet minden hívásnál végigosztjuk, és abból olvassuk ki az
aktuális hetet — 41 hét, ezredmásodperc, évenként gyorsítótárazva.

Ezt a logikát teszt védi (`src/lib/hetek.test.ts`), mert ha elcsúszik, a
telefonon csendben más téma jelenne meg, mint a heti tervben:

```bash
npm test
```

## Fejlesztés

```bash
npm install
npm run dev          # http://localhost:5180
npm run typecheck
npm run build
```

## Android build

```bash
npm run android      # fordit + telepit + elindit a csatlakoztatott telefonon
```

Elso forditas ~5 perc, utana ~6 masodperc.

Ket gepspecifikus buktatot kellett megoldani; mindkettot az `android-build.cmd`
es az `android/gradle.properties` kezeli:

1. **A felhasznaloi Temp mappaban elromlott az AF_UNIX socket** — a `connect`
   "Invalid argument" hibaval elhasal. A Java NIO selectora Windowson erre epul,
   ezert a Gradle daemon indulas utan azonnal leall ("Unable to establish
   loopback connection"). A forditas ezert egy kulon build-temp mappat hasznal TEMP-kent a C: gyokereben.
   A `-Djava.io.tmpdir` **nem eleg** — a JDK a kornyezeti valtozot olvassa.
2. **Az Android Studio JDK 25-tel erkezett**, a Gradle 8.11 / AGP 8.7 viszont
   JDK 17-21-re keszult. A forditas a kulon telepitett Temurin JDK 21-et
   hasznalja; a Studio sajat Javaja erintetlen.

## Ikon

Az ikon GENERÁLT, ne rajzold újra kézzel:

```bash
python ../tools/mobil_ikon.py
```

Rózsaszín (#D87B9C) lekerekített négyzet, benne krémszínű talpas Ó — ugyanaz a
jelkép, mint az asztali programban. A szkript minden képernyősűrűségre kiírja a
hagyományos, a kör alakú és az adaptív ikont, valamint a Play Áruházhoz kért
512×512-es változatot (`bolt/play-ikon-512.png`).

Az adaptív ikonnál a gyártó vág (kör, négyzet, csepp), és csak a középső ~66%
biztosan látszik — az Ó ezért ehhez a biztonságos zónához méretezett.

## Play Console

- A fiókban már van éles verziójú alkalmazás (`com.drehixstudio.cnc`), ezért a
  személyes fiókokra vonatkozó zárt teszt követelményét a fiók már teljesítette.
  Az ÓvodaNaplóhoz **új alkalmazást** kell létrehozni.
- **Célközönség: felnőttek** (óvodapedagógusok). A tartalom óvodásokról szól, de
  a felhasználó felnőtt — így nem lép életbe a Families program többletkövetelménye.
- Az adatbiztonsági űrlapon **„nem gyűjt adatot"** a helyes válasz, amíg nincs
  benne analitika. Ne kerüljön bele.
