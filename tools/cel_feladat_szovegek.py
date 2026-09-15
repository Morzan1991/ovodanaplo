# -*- coding: utf-8 -*-
"""
A heti tervek CÉL és FELADAT szövegei SAJÁT megfogalmazásban.

MIÉRT: a korcsoportonkénti cél- és feladatszövegek szó szerint a „Tappancs"
kiadványból kerültek a sablonokba. A szerzői jog a megfogalmazást védi, a
pedagógiai tartalmat nem: ugyanaz a nevelési szándék szabadon leírható más
szavakkal. Itt a hét célja és feladata változatlan, csak a szöveg a miénk.

Közben helyrejön a PDF-kinyerés kára is: a kettétört szavak („gyur mázás",
„felisme rése", „mes terek") és a mondat közepén elvágott töredékek.

A kulcs a RÉGI szöveg rövid ujjlenyomata (sha1 első 8 jegye), így a magyar
szöveget nem kell kulcsként átgépelni. A `tools/cel_feladat_ujrairas.py` ez
alapján cseréli le a `seed/weekly-templates.json` mezőit.

Egy szöveg több sablonhoz is tartozhat: a v1/v2 változatok osztoznak rajta,
ezért 438 mezőt 210 szöveg fed le.
"""

from __future__ import annotations

UJ_SZOVEG: dict[str, str] = {
    # ================= SZEPTEMBER =================
    # --- Tanévkezdés, csoportszabályok (tanevkezdes, _v1, _v2) ---
    "833e8e76": (
        "Ismerkedjenek meg az óvoda helyiségeivel, udvarával, a csoport felnőtteivel "
        "és társaival, és fogadják el a napirend rendjét. Az óvodába lépés első "
        "napjaitól kedvező érzelmi élmények érjék őket. Ébredjen fel bennük a "
        "mennyiségek és a formák iránti kíváncsiság, ez alapozza meg a matematikai "
        "szemléletet. Tapasztalják meg a saját magasságuk és súlyuk változását "
        "szemléletes összehasonlítással. A meséket filcbábbal jelenítjük meg. A "
        "látvány segítse hozzá őket ahhoz, hogy megszeressék a mesehallgatást. A "
        "közös vers- és mesehallgatás adjon nekik érzelmi biztonságot."
    ),
    "d552e1d6": (
        "Vegyék észre, mi változott a nyár óta a csoportban és önmagukon. Alakuljanak "
        "a társas kapcsolataik az együttélés szabályainak gyakorlásával. Keltsük fel "
        "az érdeklődésüket a mennyiségek és az összefüggések iránt, és hagyjuk, hogy "
        "játék közben fedezzék fel őket. A tapasztalás mindig játékos helyzetben "
        "történjen. A meséket filcbábbal dolgozzuk fel. A közös vers- és "
        "mesehallgatás adjon érzelmi biztonságot. Mesélés közben éljék át az együtt "
        "figyelés, a befogadás és a közös játék élményét."
    ),
    "2dbd9939": (
        "Elevenítsék fel a nyári élményeiket, és vegyék észre, mennyit változtak "
        "egymáson az évek alatt. Az élmények elmesélése segítse a mondatalkotást és a "
        "kifejezőkészséget. Fedezzék fel a körülöttük lévő világ mennyiségi és formai "
        "összefüggéseit. A tapasztalás játékos helyzetben, a gyerekek ötleteihez "
        "igazodva történjen. Alkossanak halmazokat többféle szempont szerint, és "
        "tudatosuljon bennük maga a fogalom. A meséket fakanálbábbal jelenítjük meg. "
        "A mese segítse az együttérzést és a szereplőkkel való azonosulást."
    ),
    "bdef5c0a": (
        "A technikák közül a gyurmázással ismerkednek meg. A színes, főzött gyurma "
        "keltse fel az érdeklődésüket a tevékenység iránt. Gömbölyítsenek, "
        "sodorjanak, és készítsenek formákat formalyukasztóval. Az éneklés örömöt "
        "jelentsen a gyerekeknek. Keltsük fel az érdeklődésüket a zene iránt, és "
        "alakítsuk a fogékonyságukat. Ismerjék meg az óvoda udvari és tornaszobai "
        "eszközeinek balesetmentes használatát. Ébredjen fel bennük a kedv a mozgásos "
        "tevékenységekhez."
    ),
    "c4ddb09b": (
        "Legyenek képesek egyszerűbb állatalakok önálló megformálására, a saját "
        "ötleteikre támaszkodva. Törekedjenek arra, hogy a forma térben is megálljon. "
        "Fejlődjön az esztétikai érzékük és a zenei ízlésük. Tanuljanak új énekes "
        "játékot, és mélyítsék el a korábban tanultakat. Ismerjék meg és sajátítsák "
        "el a mozgásos képességfejlesztő játékok szabályait. Tanulják meg az eszközök "
        "helyes használatát."
    ),
    "4c44c6c7": (
        "Élményrajz készítésekor törekedjenek a pontos, igényes munkára és a részletek "
        "megjelenítésére. Dolgozhatnak színes lapon, színes ceruzával, zsírkrétával, "
        "és festhetnek is. Egy lapon több technikát is használhatnak. Alakuljon a "
        "zenei tudatuk, és éljék át a zene örömét éneklés és mondókázás közben. "
        "Erősödjön a közösségi érzésük a dalos játékok együttes élményében. A "
        "mozgásfejlesztés örömteli, élményekre épülő legyen. Alakuljon ki bennük a "
        "mozgás szeretete és az ehhez szükséges készség."
    ),

    # --- Ősz kezdete, gyümölcsök (osz_kezdete, osz_termenyek_v1, _v2) ---
    "f394e67c": (
        "Ismerjék meg az őszi gyümölcsök tulajdonságait. A gyümölcsök megismerése és "
        "feldolgozása sokféle tevékenységre adjon alkalmat. Fedezzék fel a gyümölcsök "
        "formáját és részeit. A darabolás során érzékeljék a rész és az egész "
        "viszonyát. A mesét filcbábbal jelenítjük meg. A vers- és mesehallgatás "
        "segítse a beilleszkedésüket a csoportba. Alakuljon ki bennük az igény a "
        "csendes mesehallgatásra."
    ),
    "3df225c8": (
        "Élményt adó tevékenységeken keresztül bővüljön a tudásuk a szőlő "
        "feldolgozásáról és az ehhez használt eszközökről. Alkossanak halmazokat, és "
        "válogassák szét a gyümölcsöket a tulajdonságaik szerint. Változatos "
        "tevékenységekben szerezzenek tapasztalatot az őszi gyümölcsök jellemzőiről. "
        "A mesét diafilmen keresztül dolgozzuk fel. A mese érzékeltesse az olyan "
        "elvont fogalmakat, mint az önzés, a szerénység és a becsületesség."
    ),
    "f3026a56": (
        "Rendszerezzék a szüreti mulatság hagyományáról szerzett tapasztalataikat, "
        "akár tervezetten, akár spontán jutottak hozzájuk. A közös tevékenység "
        "elégítse ki a társas szükségleteiket. Fejlődjenek a matematikai képességeik "
        "számlálás, becslés, mérés és összehasonlítás közben. A must készítésekor "
        "becsüljék meg és mérjék le az űrtartalmat, különböző edényekbe és poharakba "
        "töltve. A mesét a fordulópontok illusztrálásával dolgozzuk fel. "
        "Tudatosodjon bennük a jó és a rossz, a követendő és az elutasítandó példa."
    ),
    "9ebed383": (
        "A technikák közül az ujjlenyomattal ismerkednek meg. Ismerjék meg a temperát "
        "és a nyomhagyás lehetőségét. Érezzék az óvodapedagógus segítő szándékát. A "
        "tevékenység örömöt adjon nekik. A térbeli mozgás utánzással alakuljon, a "
        "nagyobb gyerekek vezetésével. Az egyensúlyozó gyakorlatok alatt keltsük fel "
        "és tartsuk fenn a kedvüket. Segítsük őket az egyenes tartású járásban."
    ),
    "e148ecbd": (
        "Gazdagodjon az alkotókedvük egy tárgy megfestésével. Szokjanak hozzá a tiszta "
        "munkavégzéshez. Ismerjék el egymás munkáját. Érzékeljék az egyenletes "
        "lüktetést körjátékok közben. A tiszta énekléshez a fejlettségükhöz illő "
        "dalokat válasszunk. A mozgásos tevékenységek alatt maradjon meg a tudatos "
        "figyelmük. Alakuljon az egyenes testtartásuk: emelt fej, oldalsó "
        "középtartásban tartott kar."
    ),
    "6bc1d39b": (
        "Váljon magabiztossá az ollóhasználatuk. Törekedjenek a vonal menti vágásra. "
        "Készítsenek térbeli kompozíciót papírcsíkokból hajtott karikákból. Az énekes "
        "játékokban minden gyereknek jusson szerep és párválasztás. Gyakorolják az "
        "énekes játékokat, a mondókákat és az egyszerű tánclépéseket. A játékfűzés és "
        "a gyermektánc táncház jellegű formában menjen. Fejlődjön a "
        "mozgásügyességük. A feladatvégzést egyenes tartás és megfelelő kartartás "
        "segítse."
    ),

    # --- Zöld paradicsom, őszi zöldségek (osz_zoldsegek_v1) ---
    "a2879f1a": (
        "Ismerjék meg és szeressék meg azokat a zöldségeket, amelyeket az óvodában is "
        "gyakran esznek. Beszéljük meg, mivel segítik a zöldségek az egészségüket. A "
        "középsősök piacon vásárolt zöldségeit csoportosítsák szín, forma és alak "
        "szerint. A meséket dramatizálva dolgozzuk fel. Bátran vállalkozzanak "
        "szerepekre, érezve az óvodapedagógus támogatását. A mese eljátszása segítse "
        "a mélyebb megértést."
    ),
    "53d2203c": (
        "Piaci látogatás során ismerkedjenek meg az őszi zöldségekkel. A megvásárolt "
        "zöldségek tulajdonságait saláta készítése közben tapasztalják meg. "
        "Salátakészítés közben mérjék meg a zöldségek hosszát, többféle egységgel. "
        "Ismerkedjenek a hosszabb és a rövidebb fogalmával. A mesét a fordulópontok "
        "illusztrálásával dolgozzuk fel. A mese éreztesse a jótett helyébe jót várj "
        "gondolatát."
    ),
    "fc39e8f8": (
        "Alapozzuk meg az egészséges életmódot. Ismerjék fel az összefüggést a "
        "zöldség- és gyümölcsfogyasztás, valamint az egészségük között. Alakuljon "
        "bennük környezettudatos magatartás. Épüljön ki harmonikus viszonyuk a "
        "természettel. Saját élményű tevékenységben, a maguk módján sajátítsák el az "
        "összehasonlítás műveletét a zöldségeken. A mesét hurkapálca-bábbal "
        "jelenítjük meg. A mese éreztesse, hogy többet ésszel, mint erővel, és hogy a "
        "jó végül győzedelmeskedik a rossz fölött."
    ),
    "9f05a19d": (
        "Ismerkedjenek meg a festés eszközeivel. A marokecset használata készítse elő "
        "a későbbi helyes, magabiztos ceruza- és ecsetfogást. Festés közben éljék át "
        "az alkotás örömét. Az új inger keltse fel a kíváncsiságukat. Adjunk élményt, "
        "és ébresszük fel az éneklési kedvüket. Teremtsünk olyan légkört, amelyben "
        "szívesen kapcsolódnak be az énekes játékokba. Ébredjen fel bennük a kedv a "
        "mozgásos tevékenységekhez. Ismerjék meg a futás helyes technikáját. Tárgyak "
        "megkerülésével tudatosodjanak bennük a téri irányok."
    ),
    "63590672": (
        "Gazdagodjon az alkotótevékenységük egy új technikával. A mozaikozás közben "
        "ismerkedjenek az elemek egy vonalba rendezésével. Erősödjön az igényük a "
        "közös éneklésre. Az éneklés és a mondókázás kisebb csoportokban, az "
        "óvodapedagógus szervezésében történjen. Érzékeltessük a futás tempóját "
        "különböző jelekkel és tempóadással. Keltsük fel az érdeklődésüket a mozgásos "
        "játékok iránt."
    ),
    "393843ee": (
        "A fantáziájukra támaszkodva hozzanak létre minél egyedibb figurákat. A közös "
        "munka fejlessze az együttműködésüket, egymás segítését és elismerését. "
        "Adjunk alkalmat a zenei és a szóbeli fantázia kibontakozására, mozgáselemek "
        "kitalálására és kipróbálására. Erősödjön a zenei tudatuk. Az akadálypályát a "
        "gyerekekkel közösen állítsuk fel, ez teret ad a kreativitásuknak. A mozgás "
        "jótékony hatása alakítsa az egészséges életmódjukat."
    ),

    # --- Mihály-napi vásár (mihaly_nap_v1) ---
    "ed5ee3ae": (
        "Alakuljon a közösségi tudatuk a vásározás hagyományának megismerése közben. "
        "Vegyék észre a vásárfiák szépségét. Állapítsák meg a mennyiséget mérésekkel "
        "és összehasonlításokkal. Tudatosodjon bennük a több és a kevesebb fogalma. A "
        "piaci látogatás érzékeltesse a vásárfiák sokaságát. A meséket ujjbábbal "
        "jelenítjük meg. A mese éreztesse az együttműködés és az összetartozás erejét."
    ),
    "f69e5f0b": (
        "Alakuljon bennük az emberi munka megbecsülése. Legyenek kíváncsiak a mesterek "
        "munkájára. Formálódjon a pozitív énképük sikerélményen keresztül. "
        "Fejlődjenek az értelmi képességeik a figyelem összpontosításával és a "
        "mennyiségi viszonyok megállapításával. Alakuljon a számfogalmuk a "
        "tapasztalatszerzés során. A meséket síkbábbal dolgozzuk fel. A mese "
        "éreztesse a segítségnyújtás, az igazságosság és az őszinteség fontosságát."
    ),
    "1e381389": (
        "A Mihály-napi vásár szokásainak felelevenítése erősítse meg bennük a "
        "hagyományőrzés fontosságát. A vásár megszervezése fejlessze az "
        "együttműködésüket és az erkölcsi ítélőképességüket. Az élményekre épülő "
        "matematikai tapasztalatszerzés tartsa fenn a kedvüket. Alakuljon a "
        "számfogalmuk többféle helyzetben, változatos formában. A meséket "
        "marionettbábbal jelenítjük meg. A mese esztétikai forrás is: érzékeljék és "
        "élvezzék a szép szöveget."
    ),
    "80aa06c2": (
        "A tevékenység örömforrás legyen, ez segít megszerettetni velük a vizuális "
        "munkát. Sajátítsák el a dal szövegét. Jelentsen örömet a közös éneklés és a "
        "közös mozgás. Fejlődjön a mozgásuk játékos formában, a mozgásigényük "
        "kielégítésével. Ismerkedjenek meg a labdával."
    ),
    "51171e61": (
        "A kukoricalánc fűzéséhez maguk találjanak ki színritmust. Tudatosodjon bennük, "
        "hogy a tűvel óvatosan kell bánni. Ismételjék a mondókákat és a játékokat, "
        "végezzenek egyszerű tánclépéseket, és tanuljanak új játékot. Jelentsen "
        "örömet a közös éneklés és mozgás. Fejlődjön a tájékozódásuk és az "
        "alkalmazkodásuk úgy, hogy közben megmaradjon a szabad mozgáskedvük. Vegyenek "
        "részt szívesen a labdás tevékenységekben."
    ),
    "8339c86e": (
        "Játékos problémahelyzetben, forma létrehozása közben alakuljon az "
        "érzékelésük, az észlelésük és a kudarctűrésük. Az együttműködés jegyében "
        "bátran nyújtsanak egymásnak tényleges segítséget. Őrizzük a népszokásokat, és "
        "teremtsünk vásári hangulatot. Gyakorolják a játékfűzést és a gyermektáncot "
        "táncház jellegű formában. Fejlődjön a tájékozódásuk, az alkalmazkodásuk és a "
        "személyiségük akarati oldala."
    ),

    # --- Testünk, érzékszerveink (testunk) ---
    "f03dc618": (
        "Az életkori sajátosságokat és az egyéni különbségeket figyelembe véve, "
        "természetes élethelyzetekben ismertessük meg velük a főbb testrészeket és az "
        "érzékszerveket. A matematikai képességfejlesztő játékok a testrészek "
        "segítségével alakítsák a számfogalmukat. Fedezzék fel a tükörképüket, és a "
        "tükör segítségével azonosítsák a testrészeiket. A mesét ujjbábbal dolgozzuk "
        "fel. Ismerkedjenek a kéz és a láb szerepével, és azonosítsák magukon és "
        "egymáson. Az irodalmi anyagot utánzó mozdulatokkal játsszuk el: ez erősíti a "
        "pedagógus és a gyermek kapcsolatát, a biztonságérzetet és a testrészek "
        "tudatosítását."
    ),
    "ffab3724": (
        "A belső szükségleteikre építve adjunk sokszínű, összetett tevékenységeket, "
        "amelyekben megtapasztalják az érzékszervek működését, és azonosítani tudják a "
        "testrészeiket. A matematikai nevelés spontán módon, a napi tevékenységekbe "
        "ágyazva történjen. Adjunk olyan játékhelyzeteket, amelyekben a testrészek és "
        "a ruhadarabok párosításával megismerik a pár fogalmát. Az Öten című mesét "
        "ujjbábbal dolgozzuk fel. A tréfás versek és mesék alakítsák a "
        "humorérzéküket. Legyenek képesek megnevezni és azonosítani a testrészeket. "
        "Soroljanak fel kézzel és lábbal végzett cselekvéseket."
    ),
    "4805212a": (
        "Adjunk lehetőséget arra, hogy folyamatos tevékenység közben fedezzék fel az "
        "emberi test felépítését, a fontosabb belső szerveket és azok működését. "
        "Teremtsünk olyan helyzeteket az óvodai napban, amelyekben az érzékszerveik "
        "segítségével sokféle tapasztalatot gyűjthetnek. Tájékozódjanak a saját "
        "testükön, és gyakorolják a téri irányokat. A meséket bábbal dolgozzuk fel. A "
        "mese gazdagítsa a humorérzéküket és a képzeletüket. Legyenek képesek a "
        "kevésbé ismert testrészeket is azonosítani."
    ),
    "50226946": (
        "Ismerjék meg és mélyítsék el a ragasztás helyes technikáját. A testrészek "
        "felragasztása közben törekedjenek megnevezni és magukon is azonosítani "
        "azokat. Az éneklés örömöt jelentsen nekik. Keltsük fel az érdeklődésüket a "
        "zene iránt. A közvetlen cél a természetes mozgáskészségek fejlesztése "
        "alapmozgásokkal és mozgásos játékokkal. A testi képességeket természetes "
        "mozgásgyakorlatokkal fejlesztjük."
    ),
    "c7d2720a": (
        "Só-liszt gyurmával, temperával, színes papírral, zsírkrétával és "
        "pasztellkrétával jelenítsék meg saját magukat egy A/4-es rajzlapon. "
        "Törekedjenek a főbb testrészek és az érzékszervek ábrázolására. Szokjanak "
        "hozzá a tiszta munkavégzéshez. Fejlődjön az esztétikai érzékük és a zenei "
        "ízlésük. Tanuljanak új énekes játékot, és szilárdítsák meg a korábban "
        "tanultakat. Fejlődjön a ritmusérzékük ismert mondókán és dalon keresztül. "
        "Segítsük elő a mozgásszerveik fejlődését. A kúszógyakorlatok alakítsák a "
        "szem-kéz és a szem-láb összerendezettségét. A mozgásigényüket mozgásos "
        "játékokkal elégítsük ki."
    ),
    "3018c9d0": (
        "Színes só-liszt gyurmából formálják meg magukat részletesen, ügyelve az "
        "arányokra. Alakuljon a zenei tudatuk, és éljék át a zene örömét éneklés és "
        "mondókázás közben. Erősödjön a közösségi érzésük a dalos játékok együttes "
        "élményében. Biztosítsuk az életkoruknak megfelelő mozgástapasztalatokat. A "
        "csúszó- és mászógyakorlatok segítsék a helyes testtartást. Alakuljon ki "
        "bennük a mozgás szeretete."
    ),

    # ================= OKTÓBER =================
    # --- Állatok világnapja (allatok_vilagnapja, _v1, _v2) ---
    "88fc9e17": (
        "Bővüljön a tudásuk a környezetükben és a természetben megfigyelhető "
        "állatokról. Ismerkedjenek meg az állatok legjellemzőbb tulajdonságaival. "
        "Alkossanak halmazokat változó szempontok szerint: az állatok színe, "
        "tulajdonságai és tápláléka alapján. A meséket ujjbábbal jelenítjük meg. A "
        "mese alakítsa ki bennük az állatok szeretetét."
    ),
    "2fb21ca2": (
        "Értsék meg, miért fontos és milyen felelősség a madarak és a vadak etetése. "
        "Alakuljon bennük az állatok iránti szeretet. Ismerkedjenek meg az állatok "
        "legjellemzőbb tulajdonságaival. Tudatosodjon bennük az állatvédelem "
        "fontossága. Összetett tevékenységekben fejlődjön az elemi számolási "
        "készségük. Élményt adó tapasztalatszerzés közben, többféle helyzetben "
        "alakuljon a számfogalmuk. A meséket diafilmen keresztül dolgozzuk fel. A "
        "közös mesehallgatás és mesenézés élménye erősítse a csoport összetartását."
    ),
    "df5fabf7": (
        "Saját élményű, cselekvő tevékenységben, a tudásukra és képességeikre "
        "támaszkodva, egyéni módon ismerjék meg az állatfajokat és jellemzőiket. A "
        "kirándulás adjon alkalmat az illem és a közlekedés szabályainak "
        "gyakorlására. Alakuljon a számfogalmuk társasjáték készítése és a "
        "tapasztalatszerzés közben. Alkossanak halmazokat, és hasonlítsák össze őket "
        "mennyiség szerint, többféle szempont alapján: állatfaj, életmód, táplálkozás "
        "és szaporodás. A meséket dramatizálva dolgozzuk fel. A közös tevékenység "
        "erősítse a gyerekek egymáshoz fűződő viszonyát és egymás segítését."
    ),
    "23aa5482": (
        "Ismerjék meg a ragasztás helyes technikáját. Érezzék az alkotás örömét. A "
        "zenei anyag alakítsa ki bennük az állatok szeretetét. Játékos formában "
        "sajátítsák el a dobás helyes technikáját. Ébredjen fel bennük a kedv a "
        "mozgásos játékokhoz és a képességfejlesztéshez."
    ),
    "9bc83a4b": (
        "Törekedjenek a vonal menti vágásra és a helyes ollóhasználatra. Érezzék az "
        "alkotás örömét. Rögzítsük a korábbi ismereteket, és fejlesszük a "
        "ritmusérzéküket. Alakuljon a zenei emlékezetük. A páros gyakorlatok "
        "fejlesszék a közösségi érzésüket. Elevenítsük fel játékosan a kislabdadobás "
        "helyes technikáját. Tudatosodjon bennük a fogójáték szabálya."
    ),
    "f0bfbcbf": (
        "Bontakozzon ki a kreativitásuk és a kézügyességük az önálló munka során. "
        "Értékeljék elismerően egymás munkáját. Törekedjenek a részletek "
        "megjelenítésére. Szokjanak hozzá a tiszta munkavégzéshez. Rögzítsük a "
        "korábbi ismereteket, és fejlesszük a ritmusérzéküket. Adjuk tovább a zenei "
        "hagyományt, és formáljuk a zenei ízlésüket. A futógyakorlatok javítsák a "
        "reakcióidejüket. Az irány- és tempóváltások fejlesszék a nagymozgásaikat."
    ),

    # --- Az erdő állatai télre készülnek (erdo_allatai) ---
    "480653f1": (
        "Digitális eszközzel és természetismereti könyvekkel ismerjék meg a vadon élő "
        "állatok külső jegyeit. Alakuljon bennük az állatok iránti szeretet, "
        "együttérzés és beleélés. Állatos dominóval ismerkedjenek a pár fogalmával. A "
        "Dobj és mozogj játékban élő társasjáték részesei lehetnek: arra a mezőre "
        "lépnek, amelyik állatot a dobókockával dobták. A mesét ujjbábbal dolgozzuk "
        "fel. A mesén keresztül ismerjék meg az állatok téli életét. Alakuljon "
        "pozitív viszonyuk a természethez, és gazdagodjon az érzelemviláguk."
    ),
    "5a651898": (
        "Digitális eszközzel és természetismereti könyvekkel ismerjék meg a vadon élő "
        "állatok mozgását és életmódját. Szerezzenek ismereteket arról, miért fontos "
        "a madár- és a vadetetés. A Mi hiányzik? és a Mi változott meg? játékokat "
        "állatképekkel játsszuk: megcseréljük a sorrendet, vagy kiveszünk egy állatot "
        "a sorból. Játsszunk társasjátékot az erdő állataival készült pörgethető "
        "táblán. A mesét síkbábbal dolgozzuk fel. Az állatszereplőkkel való "
        "azonosulás erősítse a beleélő képességüket. A vers ösztönözze őket az "
        "állatok védelmére és a gondoskodásra."
    ),
    "4e154a57": (
        "Bővüljön a tudásuk a környezetükben és a természetben megfigyelhető "
        "állatokról. Tudatosodjon bennük az állatvédelem fontossága. Kövessük "
        "folyamatosan, hogyan hat az időjárás az emberre, a természetre és az "
        "állatokra. A gyerekek által készített Állatok háza játékkal, állatképekkel "
        "gyakoroljuk játékosan a számlálást. A mesét árnyjátékkal dolgozzuk fel. "
        "Figyeljék meg, majd fogalmazzák meg a mese tanulságát. A versek "
        "tudatosítsák, hogy az embernek fontos szerepe van a téli vadetetésben és az "
        "állatok gondozásában."
    ),
    "954b5358": (
        "Törekedjenek arra, hogy ragasztás előtt maguk rendezzék el a részeket. "
        "Gyakorolják a ragasztás helyes technikáját. A bábkészítés alakítsa az "
        "érzelemvilágukat. A halk és a hangos megkülönböztetése finomítja a "
        "hallásukat és a kifejezőkészségüket, és tartalmasabbá teszi a zenehallgatást. "
        "A testi és mozgásfejlődésüket rendszeres testmozgással és testedzéssel "
        "segítsük."
    ),
    "ff2312b5": (
        "Gyakorolják egy tárgy megfestését. Gyakorolják a térbeli rendezést és a "
        "tájékozódást. Törekedjenek a helyes olló- és ecsethasználatra, valamint az "
        "esztétikus munkára. Mondjanak el egy rövid mondókát vagy dalt végig halkan, "
        "majd végig hangosan. A mondóka vagy a dal közepén váltsunk hangerőt. "
        "Távolugrásnál csak magára a mozdulatra, az irányára és a pontos "
        "végrehajtására kelljen figyelniük. Hogy ne a tempó kösse le őket, álló "
        "helyzetből gyakoroltassuk."
    ),
    "76a160d9": (
        "Figyeljék meg az állatokat, és jelenítsék meg a legjellemzőbb vonásaikat. "
        "Törekedjenek az igényes munkára. Gyakorolják a szabadkézi rajzolást. "
        "Ismerjék el és dicsérjék meg egymás munkáját. A halk és a hangos "
        "különbségét mindig egymáshoz viszonyítva, hallhatóan érzékeltessük: "
        "beszéddel, zörejjel, mondókával, énekkel és hangszerrel. A sokszori "
        "bemutatásból ismerjék fel a különbséget. A nagyobbaknak néha ütemezhetünk "
        "is, vagyis nekifutásból ugranak, ez fejleszti a ritmusérzéküket. A helyes "
        "technikát azonban nekifutás nélkül gyakoroltassuk be."
    ),

    # --- Ősz színei, falevelek (osz_szinek_v1, _v2) ---
    "0cd5b6a4": (
        "A valóság felfedezése közben alakuljon ki bennük a természet szeretete. A "
        "kiránduláson fedezzék fel az évszak változásait, a terméseket és a színes "
        "leveleket. A saját érdeklődésükre és aktivitásukra építve szerezzenek "
        "tapasztalatot a szűkebb és tágabb környezetük formai, mennyiségi és térbeli "
        "viszonyairól. A gyűjtött termésekből alkossanak halmazokat. A mesét "
        "agyagbábbal dolgozzuk fel. A mese hőseinek tettei érzékeltessék a "
        "kapzsiságot, az irigységet és a kitartást."
    ),
    "70fae913": (
        "A valóság felfedezése közben alakuljon ki bennük a természet szeretete, és "
        "tanulják meg óvni azt, megbecsülve a természeti, az emberi és a tárgyi "
        "értékeket. A kiránduláson figyeljék meg az évszak jellemzőit. A környezetük "
        "megismerése közben jussanak matematikai tapasztalatokhoz, és használják is "
        "azokat a tevékenységeikben. Érzékeltessük a gyűjtött termések mennyiségét. A "
        "három kismalac és a farkas című mesét ujjbábbal dolgozzuk fel. A mese "
        "éreztesse az összetartozás és az együttműködés fontosságát."
    ),
    "e90ce397": (
        "Adjunk elegendő alkalmat, időt, helyet és eszközt a spontán és a szervezett "
        "tapasztalatszerzésre. A kiránduláson többféle szempontból figyeljék meg az "
        "őszi természetet és az időjárás változását. A halmaz elemeivel ismerkedjenek "
        "a párosítással, a sorszámokkal és a számlálással, és szemléletes "
        "gondolkodásukra támaszkodva végezzenek matematikai műveleteket. Gyakorolják "
        "a több és a kevesebb fogalmát. A mesét diafilm segítségével dolgozzuk fel. A "
        "mese éreztesse, hogy aki a kicsit nem becsüli, a nagyot nem érdemli."
    ),
    "2d78e31b": (
        "A közös munka erősítse az egymáshoz fűződő viszonyukat. A munkájuk "
        "elismerése növelje az önbizalmukat, a bátorságukat és a magabiztosságukat. "
        "Teremtsünk őszi hangulatot énekléssel és mondókázással. Formáljuk az "
        "esztétikai érzéküket. Mélyítsük el a korábbi dalokat és mondókákat, és "
        "hangoljuk össze az éneket a mozgással. A közvetlen cél a természetes "
        "mozgáskészségek fejlesztése alapmozgásokkal és mozgásos játékokkal. A testi "
        "képességeket természetes mozgásgyakorlatokkal fejlesztjük."
    ),
    "78d50882": (
        "Előre kifúrt, apróbb gesztenyéből és makkból fűzzenek nyakláncot úgy, hogy "
        "sorminta legyen felfedezhető benne. A közös játék segítse a társas "
        "készségeiket, és formálja a zenei ízlésüket. Szilárdítsuk meg a korábban "
        "tanult játékot. Alakítsunk ritmuszenekart saját készítésű hangszerekkel. Az "
        "egészséges életmód jegyében elégítsük ki a mozgásigényüket. Alakuljon ki "
        "bennük a rendszeres mozgás és a labdajátékok szeretete."
    ),
    "58ad6934": (
        "Gesztenyéből, makkból, tobozból és falevélből készítsenek állatokat saját "
        "ötlet alapján. Ösztönözzük őket térbeli alkotásra. Tökéletesítsük a "
        "térformákat és a kartartásokat, fejlesszük a hallásukat és a "
        "ritmusérzéküket. A zenei anyag teremtsen vidám őszi hangulatot, és mélyítse "
        "el a gyerekek kapcsolatát. Segítsük a mozgásszerveik fejlődését, a helyes "
        "testtartás kialakulását és a tartáshibák megelőzését. Alakuljon ki bennük a "
        "labdajátékok szeretete. Ismerkedjenek a dobásformákkal."
    ),

    # --- Őszi kerti munkálatok (oszi_kerti_munkak_v1) ---
    "cd8f4382": (
        "A piaci vásárlás adjon alkalmat cselekvő, sok érzékszervet foglalkoztató "
        "tapasztalásra. A gyerekek saját igényei épüljenek be a téma feldolgozásának "
        "egészébe. A középsősök piacon vásárolt zöldségeit csoportosítsák szín, forma "
        "és alak szerint. Ismerjék meg a zöldségek és a termések formai jegyeit, és "
        "tapasztalják meg a forma állandóságát. Keressenek hasonló formákat a "
        "környezetükben. A mesét síkbábbal dolgozzuk fel. A hősök tettei éreztessék "
        "az önzetlenséget, a jóságot és a segítőkészséget. Szokjanak hozzá a csendes "
        "mesehallgatáshoz."
    ),
    "152c4350": (
        "A hangsúly a valós élethelyzetek valódi megoldásán legyen. A téma "
        "feldolgozása tevékenységek sorozatából álljon, és mindegyikben legyen "
        "közvetlen, kézzelfogható tapasztalás, például vásárlás a piacon. Segítsük az "
        "egyéni megismerőképességük és a gondolkodásuk fejlődését. Tudatosodjon "
        "bennük a számlálás fogalma. Alakuljon a számfogalmuk változatos "
        "képességfejlesztő játékokkal. A mesét a főbb jelenetek illusztrálásával "
        "dolgozzuk fel. A mese éreztesse velük az átgondolt, pontos munka értékét."
    ),
    "0cc2b3b0": (
        "Teremtsünk lehetőséget az átélésre a saját környezetükből vett feladatokkal "
        "és azok megoldásával, például kukoricatöréssel. Adjunk vonzó "
        "tapasztalatszerzési alkalmakat, amelyekben tudásra tesznek szert és "
        "esztétikai élményt élnek át. Mérjék meg a zöldségek hosszát különböző "
        "egységekkel. Ismerkedjenek a hosszabb és a rövidebb fogalmával. A betakarítás "
        "adjon alkalmat arra, hogy spontán helyzetben, saját tapasztalatból "
        "érzékeljék a hosszabb és a rövidebb viszonyát. A meséket dramatizálva "
        "dolgozzuk fel. A tevékenység adjon közösségi élményt. Segítsék és biztassák "
        "egymást, és oldjanak meg együtt játékos problémahelyzeteket."
    ),
    "3612a205": (
        "Mélyítsük el a festés technikáját. Törekedjenek az egész felület "
        "befestésére, és a víz meg a festék arányos használatára. Éreztessük meg "
        "velük a zene örömét, és motiváljuk őket a zenei tevékenységre. A zenei anyag "
        "teremtsen vidám őszi hangulatot, és mélyítse el a gyerekek kapcsolatát. A "
        "kúszógyakorlatok fejlesszék a szem-kéz és a szem-láb összerendezettségét. A "
        "mozgásigényüket mozgásos játékokkal elégítsük ki."
    ),
    "be0b3a4f": (
        "A munka során ügyeljenek a folyékony ragasztó helyes használatára. "
        "Tudatosodjon bennük, hogy a pontos, odafigyelő munkának mindig szép "
        "eredménye lesz. Érzékeltessük a dalok és a mondókák ritmusát mozgással. "
        "Fejlesszük a zenei hallásukat. Tökéletesítsük a térformákat és a "
        "kartartásokat, fejlesszük a hallásukat és a ritmusérzéküket. Biztosítsuk az "
        "életkoruknak megfelelő mozgástapasztalatokat. A csúszó- és mászógyakorlatok "
        "segítsék a helyes testtartás kialakulását. Alakuljon ki bennük a mozgás "
        "szeretete."
    ),
    "cd975cf1": (
        "A kerti munkák témahéten a kirakandó formát maguk találják ki és rajzolják "
        "meg. Egy munkán többen is dolgozhatnak egyszerre, és a pattogatott kukoricát "
        "meg is festhetik. A felszabadult játék tartsa fenn az érdeklődésüket az ének "
        "és a zene iránt. Kapcsoljuk össze a tiszta éneklést a mozgással, és "
        "elevenítsük fel a korábbi játékokat és mondókákat. A természetes "
        "mozgáskészséget az alapmozgások, például az ugrások és a mélyugrás, valamint "
        "a mozgásos játékok gyakorlásával fejlesszük."
    ),

    # ================= NOVEMBER =================
    # --- Ködös, esős ősz (kodos_oszi_ido) ---
    "2215149e": (
        "Alapozzuk meg bennük a természet szeretetét. Változatos tevékenységekben "
        "figyeltessük meg az időjárás és az évszak változását. Tapasztalatszerzés "
        "közben figyeljék meg az ősz jellemzőit. Játékos tevékenységekben szerezzenek "
        "matematikai tapasztalatot. Érzékeltessük játékosan a hosszabb és a rövidebb "
        "fogalmát. Többféle tapasztalatszerzés során fedeztessük fel velük az ősz "
        "szépségét és jellemzőit. A mesét filcbábbal dolgozzuk fel. A versek és a "
        "mesék mutassák meg az időjárás változását."
    ),
    "b3c9b9d4": (
        "Élményt adó séta közben figyeltessük meg a természet változásait, és "
        "tudatosítsuk az évszak jellemzőit. Olyan tevékenységeket adjunk, amelyekben "
        "tapasztalatszerzéssel ismerik meg az új évszakot. Szemléletesen tudatosítsuk "
        "a pár fogalmát. Rendezzenek több dolgot párba, változatos tevékenységekben. "
        "Az előző év tapasztalataira építve sokrétűen fejlesszük a rendezés, a "
        "halmazalkotás és az összehasonlítás képességét. A mesét fakanálbábbal "
        "dolgozzuk fel. A versek és a mesék mutassák meg az időjárás változását. A "
        "mesében megjelenő összefogás és közös munka legyen példa a gyerekek előtt."
    ),
    "ad57803d": (
        "Tapasztalják meg az ok-okozati összefüggést az évszak és az időjárás "
        "változásában. Figyeltessük meg és ismertessük fel velük a megváltozott "
        "körülmények hatását: az öltözködésben, az állatok viselkedésében, a "
        "növényeken és az időjárásban. Fejlesszük a számlálási készségüket tízes "
        "számkörben. Az előző év tapasztalataira építve sokrétűen fejlesszük a "
        "képességeiket. Válogassák szét a ruhákat az időjárás szerint. Hozzanak létre "
        "halmazt, és nevezzék meg. Számlálják meg a halmazba gyűjtött ruhákat, és "
        "tárják fel a tulajdonságaikat: rövid és hosszú, hideg és meleg, vastag és "
        "vékony. A mesét a főbb jelenetek illusztrálásával dolgozzuk fel. A versek és "
        "a mesék mutassák meg az időjárás változását. A hős tettei érzékeltessék az "
        "olyan elvont fogalmakat, mint a becsület, az igazságosság és az őszinteség."
    ),
    "120ee49d": (
        "Ismerjék meg a festés helyes technikáját. A kiscsoportos foglalkozás erősítse "
        "az érzelmi biztonságukat, és alakítsa a társaikhoz és a felnőttekhez fűződő "
        "viszonyukat. Szerettessük meg velük a közös éneklést, és adjunk zenei "
        "élményt. Változatos módon értessük meg a halk és a hangos fogalmát. Az "
        "irány- és tempóváltások fejlesszék a nagymozgásaikat. A futógyakorlatok "
        "javítsák a reakcióidejüket."
    ),
    "bdf99165": (
        "Legyenek képesek sorminta létrehozására, a képességeikhez mérten két-három "
        "színnel. Szokjanak hozzá a tiszta munkavégzéshez. Jelentsen élményt nekik a "
        "közös mondókázás. Az éneklés adjon örömet. Változatos módon értessük meg a "
        "halk és a hangos fogalmát. Mozgassák a testrészeiket. Érzékeljék a tárgy és "
        "a test viszonyát, alakuljon az oldaliságuk. A támaszugrásnál a testhelyzet "
        "megváltozása közben tapasztalják meg, hol helyezkedik el a testük a térben."
    ),
    "b9d1e3f6": (
        "Biztassuk őket minél egyedibb, ötletesebb munkára, mintát is jelenítsenek meg "
        "a sál- és a sapkaformán. Ügyeljenek a tiszta munkavégzésre. Tanuljanak új "
        "mondókát, és mélyítsék el a korábbiakat. A közös játék segítse a társas "
        "készségeiket, és formálja a zenei ízlésüket. Fejlesszük a ritmusérzéküket és "
        "a hallásukat, és ismertessük fel a halk és a hangos különbségét. A padon "
        "végzett támaszugrás fejlessze az egyensúlyérzéküket. A testrészek "
        "mozgatásával és a testzónák tudatosításával fejlesszük a testsémájukat. A "
        "változó irányú mozgás fejlessze a térérzékelésüket."
    ),

    # --- Gólya, gólya, gilice — madárvonulás (madarvonulas_v1) ---
    "7fafb832": (
        "Az életkoruknak megfelelő ismeretszerzés közben gyűjtsenek tapasztalatot az "
        "állatfajokról és a tulajdonságaikról. Minél több állatfajt ismerjenek meg a "
        "természetes élőhelyén. Az ismerkedés közben szerezzenek tapasztalatot a "
        "madarakról, a háziállatokról és a vadállatokról. Fedezzék fel az állatok "
        "térbeli kiterjedését: a magasságukat, a hosszúságukat és a szélességüket. "
        "Végezzenek méréseket, mindig valamihez viszonyítva. A mesét árnyjátékkal "
        "dolgozzuk fel. Tudatosodjon bennük, hogy egyes madarak nálunk telelnek, "
        "mások elköltöznek, és csak tavasszal térnek vissza."
    ),
    "38478fef": (
        "Saját élményű tapasztalatszerzés közben ismerkedjenek a madárfajokkal. "
        "Digitális eszközzel mutassuk meg nekik, hogyan készülnek az állatok a télre. "
        "A számfogalmat alapozó tevékenységek foglalják magukban a párosítást, "
        "valamint az ugyanannyi és az ugyanakkora létrehozását. Fejezzék ki egy halmaz "
        "számosságát számlálással, és nevezzék meg egy elem helyét a sorban. A "
        "meséket filcbábbal dolgozzuk fel. Fogalmazzák meg, hogyan tudunk télen "
        "gondoskodni a madarakról."
    ),
    "a1a02e1f": (
        "Saját élményű tapasztalatszerzés közben ismerkedjenek a madárfajokkal. "
        "Digitális eszközzel mutassuk meg nekik, hogyan készülnek az állatok a télre, "
        "és hogyan tudunk gondoskodni róluk. Szerezzenek tapasztalatot a rész és az "
        "egész összetartozásáról. Madárképekből készített kirakóval maguk "
        "tapasztalják meg ezt a viszonyt. Állatképek hiányzó részeinek kiegészítésével "
        "fedezzék fel, hogy a rész az egészhez tartozik, és hogy az egész részekből "
        "épül fel. A mesét síkbábbal dolgozzuk fel. A mese tudatosítsa bennük, milyen "
        "fontos szerepe van az embernek a madarak és a vadon élő állatok téli "
        "gondozásában."
    ),
    "6b96f4af": (
        "A saját ujjbábjuk röptetése és a vele való játék alakítsa ki bennük a "
        "tevékenység szeretetét. Legyenek büszkék az alkotásukra, és dicsérjék meg "
        "egymás munkáját. Keltsük fel a figyelmüket új ingerrel és élménnyel. "
        "Fokozzuk az éneklési kedvüket. Fejlesszük a belső hallásukat: ismerjék fel a "
        "dalt a dallammotívumáról. A közvetlen cél a természetes mozgáskészségek "
        "fejlesztése alapmozgásokkal és mozgásos játékokkal. A testi képességeket "
        "természetes mozgásgyakorlatokkal fejlesztjük."
    ),
    "f8ced46c": (
        "Ismerjék meg és mélyítsék el a vágás helyes technikáját és a helyes "
        "eszközfogást. Gyakorolják a térbeli forma létrehozását. Fejlesszük a belső "
        "hallásukat: ismerjék fel a dalt a dallammotívumáról. Erősödjön az igényük a "
        "közös éneklésre. Az éneklés és a mondókázás kisebb csoportokban, az "
        "óvodapedagógus szervezésében történjen. Segítsük a mozgásszerveik "
        "fejlődését. Az egyensúlyozó gyakorlatok alakítsák a szem-kéz és a szem-láb "
        "összerendezettségét. A mozgásigényüket élményt adó mozgásos játékokkal "
        "elégítsük ki."
    ),
    "8ff85582": (
        "A többféle technika együttes használata fokozza a kreativitásukat és az "
        "alkotókedvüket. Gyakorolják a térbeli kompozíció létrehozását. A közös munka "
        "közben működjenek együtt, ismerjék el egymás munkáját, és bátran segítsenek "
        "egymásnak. Fejlesszük a belső hallásukat: ismerjék fel a dalt a "
        "dallammotívumáról. Adjunk alkalmat a zenei és a szóbeli fantázia "
        "kibontakozására, mozgáselemek kitalálására és kipróbálására. Erősödjön a "
        "zenei tudatuk. Biztosítsuk az életkoruknak megfelelő mozgástapasztalatokat. "
        "A járó-, futó- és mászógyakorlatok segítsék a helyes testtartást. Alakuljon "
        "ki bennük a mozgás szeretete."
    ),

    # --- Márton-nap (marton_nap, _v1, _v2) ---
    "677a9950": (
        "A látogatáson fedezzék fel a baromfiudvar lakóit. Ismerkedjenek meg a "
        "libával, a tulajdonságaival és a hangjával. A számlálás elsajátítása "
        "játéktevékenységbe ágyazva történjen. Fedezzék fel, hogy a mennyiségekhez "
        "számokat tudnak rendelni. A mesét termésbábbal dolgozzuk fel. A mesében "
        "megjelenő összefogás legyen jó példa a gyerekek előtt. Adjunk nekik átélhető "
        "esztétikai élményt."
    ),
    "999c69fb": (
        "Adjunk lehetőséget arra, hogy tapasztalás és folyamatos tevékenység közben "
        "fedezzék fel a liba jellemzőit. A hagyományőrzés jegyében gyűjtsenek "
        "tapasztalatot a Márton-napi szokásokról. Matematikai összefüggések "
        "felfedezésével sajátítsák el a több, a kevesebb és az ugyanannyi fogalmát. "
        "Libaképek párosításával ismerjék meg a páros kifejezéseket a matematika "
        "nyelvén. A mesét a főbb jelenetek illusztrálásával dolgozzuk fel. A mese "
        "közvetítse az anyanyelv szépségét, hogy érzelmi kötődés alakuljon ki bennük "
        "a saját nyelvükhöz."
    ),
    "e90c7138": (
        "Ismerkedjenek meg Márton legendájával, és a történet tanulságaiból "
        "alakuljon az erkölcsi érzékük és a beleélő képességük. Szervezzünk "
        "libalámpás felvonulást a családoknak. Irányított összehasonlításokkal "
        "szerezzenek matematikai tapasztalatot: szavakban, becsléssel, összeméréssel "
        "és különböző mérőeszközökkel. Mérjenek hosszúságot kirakott, változatos "
        "egységekkel. A mesét filcbábbal dolgozzuk fel. A hősök tettein keresztül "
        "ismerjenek meg olyan elvont fogalmakat, mint az igazságosság és a "
        "nagyravágyás."
    ),
    "9d2d4f2b": (
        "Ismerjék meg és mélyítsék el a festés és a ragasztás technikáját. A "
        "kézzelfogható tevékenység gazdagítsa a megismerő és az alkotó munkájukat. "
        "Ismerkedjenek különféle anyagokkal. Jelentsen örömet a közös éneklés és "
        "mozgás. Elevenítsük fel a mondókákat és a dalokat, és tanuljunk újakat. "
        "Ismerkedjenek a halk és a hangos fogalompárjával. Teremtsük meg a kedvet a "
        "mozgásos tevékenységekhez. Az egyéni fejlettségükhöz igazodó mozgásos "
        "játékokat és feladatokat adjunk."
    ),
    "8b9795d2": (
        "Törekedjenek az adott forma kirakására. Egy munkán akár ketten is "
        "dolgozhatnak, így alakul köztük az együttműködés. Mondókán és dalon "
        "keresztül ismerjék meg a libázás hagyományát. Alakítsanak ki és tartsanak "
        "meg térformákat a dalos játék közben. Ismerkedjenek a halk és a hangos "
        "fogalompárjával. Keltsük fel az érdeklődésüket a mozgásos játékok iránt. A "
        "függésgyakorlatok változatos formái segítsék a mozgáskoordinációjuk "
        "fejlődését."
    ),
    "ca391d68": (
        "A különböző technikák ötvözése segítse a fejlődésüket. Alakuljon az "
        "esztétikai érzékük és a szép iránti nyitottságuk. A lámpás felvonulásra "
        "gyakoroljuk a játékfűzést és a gyermektáncot táncház jellegű formában. "
        "Elevenítsük fel és gyakoroljuk a halk és a hangos fogalompárját. Formáljuk a "
        "zenei ízlésüket. Tudatosan és tervszerűen összeállított torna jellegű "
        "gyakorlatokkal adjunk teret a kreativitásuknak a testnevelés feladatainak "
        "megoldásában. A mozgás jótékony hatása alakítsa az egészséges életmódjukat."
    ),

    # ================= DECEMBER =================
    # --- Adventi készülődés (advent, _v1, _v2) ---
    "0c8194d4": (
        "Ismerjék meg a tél kezdetét és az advent jelentését. Hangolódjanak rá "
        "érzelmileg az ünnepre. Szerezzenek tapasztalatot a vendégvárásról, a "
        "vendégfogadásról és az ajándékozás öröméről. Matematikai összefüggések "
        "felfedezésével sajátítsák el a több, a kevesebb és az ugyanannyi fogalmát. A "
        "koszorú gyertyáinak, a gömböknek és a szaloncukroknak a párosításával "
        "ismerjék meg a páros kifejezéseket a matematika nyelvén. A meséket filcbábbal "
        "dolgozzuk fel. A mese formálja a gyermek érzelemvilágát. Segítsük a belső "
        "képek kialakulását."
    ),
    "17f357ff": (
        "Figyeljék meg, hogyan hat az időjárás a közvetlen környezetükre, az emberre, "
        "az állatokra és a természetre. Ismerjék meg a tél kezdetét és az advent "
        "jelentését. Hangolódjanak rá érzelmileg az ünnepre. Szerezzenek tapasztalatot "
        "a vendégvárásról, a vendégfogadásról és az ajándékozás öröméről. Az advent "
        "jelképeit, a koszorút, a gyertyákat, a gömböket és a szaloncukrokat "
        "csoportosítsák szín, forma és alak szerint. Ismerjék meg a formai jegyeket, "
        "és tapasztalják meg a forma állandóságát. Keressenek hasonló formákat a "
        "környezetükben. A meséket diafilm segítségével dolgozzuk fel. A mese "
        "tudatosítsa az önzetlen segítség értékét és a jótett helyébe jót várj "
        "gondolatát."
    ),
    "4b227638": (
        "Figyeljék meg, hogyan hat az időjárás a közvetlen környezetükre, az emberre, "
        "az állatokra és a természetre. Ismerjék meg a tél kezdetét és az advent "
        "jelentését. Hangolódjanak rá érzelmileg az ünnepre. Készülődjenek a "
        "karácsonyra, süssenek mézeskalácsot. Látogassunk el egy cukrászüzembe, és "
        "figyeljük meg a cukrászok munkáját és a süteménykészítés menetét. Mérjenek "
        "tömeget: a só-liszt gyurmához, a babaszobába készülő ünnepi süteményhez, majd "
        "a mézeshez szükséges anyagot különböző mérőegységekkel. Ismerjék meg az "
        "egységgel való mérés módját, és állapítsák meg a mérőszámot. Gyakorolják az "
        "összemérést: olvassák le a mérlegről, melyik a nehezebb és melyik a "
        "könnyebb. Ismerjék fel, ha a két oldalon egyforma nehéz tárgy van. A meséket "
        "a főbb jelenetek illusztrálásával dolgozzuk fel. A mese tágítsa a "
        "látókörüket, és közvetítse a szokásaink és hagyományaink értékét."
    ),
    "ce36415b": (
        "A karácsonyfadísz készítése hangoljon rá a közelgő ünnepre. Erősödjön bennük "
        "a szeretet és az összetartozás fontossága. Gyurmázás közben ismerjék meg a "
        "nyújtófa használatát. Énekléssel és mondókázással teremtsünk adventi "
        "hangulatot, és formáljuk az esztétikai érzéküket csengővel, xilofonnal. "
        "Szilárdítsuk meg a korábbi dalokat és mondókákat, és hangoljuk össze az "
        "éneket a mozgással. A torna jellegű, természetes támaszgyakorlatok az "
        "életkori és egyéni sajátosságokhoz igazodva fejlesszék sokoldalúan a "
        "képességeiket."
    ),
    "e3834ecd": (
        "A karácsonyfadísz készítése hangoljon rá a közelgő ünnepre. Erősödjön bennük "
        "a szeretet és az összetartozás fontossága. A közös munkában törekedjenek "
        "követni a kitalált sormintát. A közös játék segítse a társas készségeiket, és "
        "formálja a zenei ízlésüket. Szilárdítsuk meg a korábban tanult játékot. "
        "Gyakorolják az egyenletes lüktetést változatos módon. A pad fölött "
        "kifeszített zsinór átlépése nehezített körülmények közt fejlessze az "
        "egyensúlyérzéküket. Az egyensúlyfejlesztő mozgásos játék elégítse ki a testi "
        "szükségleteiket."
    ),
    "71d0e2d8": (
        "A karácsonyfadísz készítése hangoljon rá a közelgő ünnepre. Munka közben "
        "fogalmazzák meg, kinek miért fontos a karácsony, és ki szokott otthon "
        "gyertyát gyújtani. Tökéletesítsük a térformákat és a kartartásokat, "
        "fejlesszük a hallásukat és a ritmusérzéküket. A zenei anyag teremtsen vidám "
        "adventi hangulatot, és mélyítse el a gyerekek kapcsolatát. A természetes "
        "támaszgyakorlatok alakítsák az egészséges életmódjukat. A rézsútos padon és "
        "gerendán járás nehezített körülmények közt fejlessze az egyensúlyérzéküket."
    ),

    # --- Fenyőfa, díszek (fenyofa_diszek) ---
    "18f4bd39": (
        "Ösztönözzük és tartsuk fenn a természetes beszédkedvüket. Hallgassuk meg őket "
        "értő figyelemmel. Támogassuk a kérdéseiket, és feleljünk rájuk az ünneppel és "
        "a karácsonyi várakozással kapcsolatban. A családokkal közös készülődés "
        "közben ismerkedjenek a színekkel. Fedezzék fel az egyforma és a különböző "
        "színeket. A színek szétválogatása közben szerezzenek matematikai "
        "tapasztalatot a csoportosításról. A mesét fakanálbábbal dolgozzuk fel. "
        "Hallgassák figyelmesen és csendben a mesét. A mesék és a versek gazdagítsák "
        "az érzelemvilágukat."
    ),
    "d395b235": (
        "Adjunk a családoknak közös élményekkel teli délelőttöt. Tervezzünk és "
        "bonyolítsunk le változatos, esztétikai élményt adó kézműves foglalkozást. "
        "Tartsuk fenn a gyerekek és a szülők kedvét, segítsük az együtt munkálkodást, "
        "és készítsük elő a kellékeket. A családi kézműveskedés kellékeiből "
        "alkossanak halmazokat. A karácsonyi készülődés is adjon matematikai "
        "tapasztalatot, amelyet a tevékenységeikben használnak is. A mesét "
        "fakanálbábbal dolgozzuk fel. A mesék és a versek fordítsák a figyelmüket az "
        "ünnepvárásra és a szeretetre."
    ),
    "cb0c8328": (
        "Dramatizáljuk a karácsonyi betlehemezést, és mutassuk be a szülőknek. A "
        "magas színvonalú művészi élményhez készítsünk megfelelő jelmezt és kelléket. "
        "Adjunk a családoknak közös élményekkel teli délelőttöt. Tervezzünk és "
        "bonyolítsunk le változatos, esztétikai élményt adó kézműves foglalkozást. A "
        "halmaz elemeivel ismerkedjenek a számlálással, a párosítással és a "
        "sorszámokkal. Szemléletes gondolkodásukra támaszkodva végezzenek matematikai "
        "műveleteket. Változtassák meg a halmazok tulajdonságait hozzátevéssel, "
        "elvétellel és ugyanannyivá tétellel, így gyakorolják a több és a kevesebb "
        "fogalmát. A meséket leporelló technikával dolgozzuk fel. A mesék és a versek "
        "adják tovább a hagyományt. A mese közvetítse az anyanyelv szépségét, hogy "
        "érzelmi és gondolati kötődés alakuljon ki bennük a nyelvhez."
    ),
    "0aa61a1a": (
        "A foglalkozás növelje az önbizalmukat, a magabiztosságukat és a kitartásukat, "
        "és alakítsa ki bennük a vizuális tevékenység szeretetét."
    ),
    "e86ed5ee": (
        "Adjunk élményt a szülőkkel közös tevékenységgel. Éljék át a közös munka "
        "örömét szeretetteljes, meghitt légkörben. Ismerjék meg a csillámporos "
        "folyékony ragasztó helyes használatát. Teremtsük meg az ünnep hangulatát. A "
        "közös éneklés adjon élményt a szülőkkel együtt. A gyerekekkel való éneklés és "
        "zenélés adjon művészeti élményt a családoknak. A zene ereje erősítse a "
        "szeretetet és a családi köteléket. Használjuk ki, amit a téli időjárás kínál: "
        "hógolyózás, csúszkálás a jégen, szánkózás, nyomkeresés a hóban. Éljünk a "
        "fejlesztési lehetőségekkel, amelyeket az időjárás ad. Adjunk változatos, "
        "mozgásos tapasztalatokat és élményeket."
    ),
    "98c1d1ee": (
        "Adjunk élményt a szülőkkel közös tevékenységgel. Éljék át a közös munka "
        "örömét szeretetteljes, meghitt légkörben. Ismerjék meg a varrás technikáját. "
        "Szokjanak hozzá az odafigyelő, pontos munkavégzéshez."
    ),

    # --- Karácsony (karacsony, _v1, _v2) ---
    "ff0bb77b": (
        "Teremtsünk olyan érzelmi légkört, amelyben rá tudnak csodálkozni a "
        "környezetük jóságára és szépségére. A közös tevékenységhez szereteten "
        "alapuló, családias, nyugodt légkör kell. Minden gyerek felé kedvező érzelmi "
        "hatások irányuljanak. Gyakoroljuk és rögzítsük a matematikai fogalmakat, és "
        "segítsük a tapasztalatszerzést. Ösztönözzük és motiváljuk őket a "
        "tevékenységekre. A közös játék ösztönözze az együttműködésüket, és erősítse a "
        "türelmüket és a másik elfogadását. A mesét síkbábbal dolgozzuk fel. A vers és "
        "a mese hangoljon rá a karácsonyra, és segítse az érzelmi nevelést. Alakuljon "
        "az együttműködésük a mesehallgatás közben."
    ),
    "14cb449b": (
        "Adjunk olyan, nem mindennap használt eszközöket, anyagokat és "
        "tevékenységeket, amelyek jelzik az ünnep hangulatát, és kiemelik a "
        "készülődést a hétköznapokból. Kapcsolatteremtő játékokkal erősítsük a "
        "családi összetartozást. Tartsák be és tartassák be a szabályokat, és "
        "gyakorolják a feladattudatot és a feladat követését. A szabályjátékok "
        "erősítsék a társas és a baráti kapcsolataikat. Erősödjön a kudarctűrésük és "
        "a kitartásuk. A mesét termésbábbal dolgozzuk fel. A mese tudatosítsa, hogy a "
        "hiúság nem jó tulajdonság. A versben előforduló karácsonyi szavak készítsék "
        "elő az ünnepi hangulatot."
    ),
    "1c723a4a": (
        "Teremtsünk szereteten alapuló, családias, nyugodt légkört a közös "
        "tevékenységhez. Adjunk olyan, nem mindennap használt eszközöket, anyagokat és "
        "tevékenységeket, amelyek jelzik az ünnep hangulatát. Elevenítsük fel a téri "
        "tájékozódást, a relációs kifejezéseket és a viszonyfogalmakat. Ösztönözzük "
        "őket összefüggő beszédre. Erősítsük az együttműködésüket, és biztassuk őket "
        "egymás segítésére. Fejlesszük a logikus gondolkodásukat, a tartós, szándékos "
        "figyelmüket, az emlékezetüket és a megfigyelőképességüket. A meséket a főbb "
        "jelenetek illusztrálásával dolgozzuk fel. A szemléletes előadás és a mesét "
        "megjelenítő mozgalmas képsor erősítse a fantáziájukat és a képszerű "
        "látásmódjukat. Neveljük őket jóságra, szeretetre és megbecsülésre."
    ),
    "9a525c9e": (
        "Éreztessük meg velük az ajándékozás örömét. Az ajándék készítése erősítse az "
        "érzelmi kötődésüket, és gazdagítsa az érzelemvilágukat. Mélyítsük el a "
        "ragasztás helyes technikáját. Keltsük fel az érdeklődésüket, adjunk élményt, "
        "és alakítsuk a zenei készségeiket: az éneklést, a ritmusérzéket, a hallást, a "
        "mozgást és a zenehallgatást, formálva közben a zenei ízlésüket. A testi "
        "képességeket természetes mozgásgyakorlatokkal fejlesztjük. A közvetlen cél a "
        "természetes mozgáskészségek fejlesztése alapmozgásokkal és mozgásos "
        "játékokkal. Adjunk nekik mozgásos élményt."
    ),
    "d126f588": (
        "Az ajándék készítése erősítse az érzelmi kötődésüket, és gazdagítsa az "
        "érzelemvilágukat. Gyakorolják a térbeli alkotást és egy tárgy megmintázását. "
        "Mélyítsük el a folyékony ragasztó helyes használatát. A célunk zenekedvelő, "
        "zeneértő gyerekeket nevelni. Adjunk zenei igényességet, formáljuk az "
        "ízlésüket, és gazdagítsuk az érzelmeiket. Keltsük fel az érdeklődésüket, "
        "adjunk élményt, és alakítsuk a zenei készségeiket. Használjuk ki és "
        "élesszük a mozgásigényüket, az érdeklődésüket és a sikerre törekvésüket. A "
        "mozgásos képességfejlesztésen belül differenciáljunk a műveletek "
        "sorrendjében és bonyolultságában."
    ),
    "fc3d6f8d": (
        "Gyakorolják a hajtogatást origamipapírral. Ismerjék meg, hogyan hajtható és "
        "alakítható a papír. Kövessék pontosan és figyelmesen az óvodapedagógus "
        "útmutatását. Az ajándék készítése erősítse az érzelmi kötődésüket, és "
        "gazdagítsa az érzelemvilágukat. A célunk, hogy az életkoruknak megfelelő, "
        "zenei hagyományra épülő, minőségi zenét adjunk nekik, amely érzelmileg is "
        "mélyen megérinti őket. A feladatunk az élménynyújtás és a zenei készségek "
        "alakítása. Változatos mozgásfejlesztő játékokkal segítsük az egyes "
        "képességek fejlődését, valamint a jártasságok és a készségek kialakulását. "
        "Adjunk nekik mozgásos élményt."
    ),

    # --- Mikulás-várás (mikulas, _v1, _v2) ---
    "f4652ee0": (
        "Hangolódjanak rá a Mikulás-várásra, a gyermekkor egyik nagy ünnepére. Éljék "
        "át az izgatott várakozást és a készülődést, amelyet a meglepetés követ. "
        "Sejtelmesen, titokzatosan várjuk a Mikulást. A csoportszoba díszítése közben "
        "ismerkedjenek a színekkel. Fedezzék fel az egyforma és a különböző színeket. "
        "A színek szétválogatása közben szerezzenek matematikai tapasztalatot a "
        "csoportosításról. A mesét fakanálbábbal dolgozzuk fel. A mesék és a versek "
        "fokozzák a várakozást, és a szeretetteljes légkör oldja az esetleges "
        "félelmüket."
    ),
    "13a04ac1": (
        "Sejtelmesen várjuk a Mikulást, és számoljuk a napokat. Hangolódjanak rá a "
        "Mikulás-várásra, a gyermekkor egyik nagy ünnepére. Éljék át az izgatott "
        "várakozást és a készülődést, amelyet a meglepetés követ. A matematikai "
        "tapasztalatszerzés közben érzékeltessük a téri irányokat. A Mikulás "
        "érkezéséről szóló beszélgetésben tudatosodjanak az olyan fogalompárok, mint "
        "a fent és a lent vagy az alatta és a fölötte. A meséket filcbábbal dolgozzuk "
        "fel. Segítsük az együttérzést és a szereplőkkel való azonosulást. A mesék és "
        "a versek fokozzák a Mikulás-várást. Verseljenek bátran, tisztán ejtve a "
        "szavakat."
    ),
    "77db6df9": (
        "Ismerjék meg Miklós püspök történetét. Adjunk módot arra, hogy átéljék a "
        "Mikulás-várást. Csodálkozzanak rá a csodák világára, amely számukra a "
        "mesetudaton alapszik. Sejtelmesen várjuk a Mikulást, és számoljuk a napokat. "
        "Az igaz-hamis képességfejlesztő játék közben elevenítsük fel a logikai "
        "műveleteket, és gyakoroltassuk az állítást és a tagadást. Úgy szervezzük a "
        "tevékenységüket, hogy képessé váljanak a problémamegoldó gondolkodásra. A "
        "mesét a fontosabb jelenetek illusztrálásával dolgozzuk fel. A mese "
        "élményforrás is: vegyék észre és érzékeljék a szép szöveget. A mesék és a "
        "versek fokozzák a Mikulás-várást. Verseljenek tisztán ejtve a szavakat, "
        "megfelelő hangsúllyal és hangerővel."
    ),
    "f7a3a4b1": (
        "Mélyítsük el a festés helyes technikáját. Törekedjenek arra, hogy a megadott "
        "felületet ne áztassák el. A tevékenység hangoljon rá a Mikulás érkezésére. A "
        "zene segítsen átélni az ünnep varázsát. Az éneklés örömteli tevékenység "
        "legyen számukra. Keltsük fel az érdeklődésüket a zene iránt. A játék jellegű "
        "főgyakorlatok fejlesszék a mozgásos képességeiket, a mozgásügyességüket és a "
        "mozgáskultúrájukat. Mindvégig érvényesüljön a játékosság elve."
    ),
    "b5b581f3": (
        "Több technika használatával fokozzuk a kedvüket, és a tevékenység hangoljon "
        "rá a Mikulás érkezésére. Fejlődjön az esztétikai érzékük és a zenei ízlésük. "
        "Az éneklés örömteli tevékenység legyen számukra. A zene segítsen átélni az "
        "ünnep varázsát. Törekedjünk a test általános fejlesztésére. Adjunk elegendő "
        "időt az egyes képességek kialakulásához."
    ),
    "22baab64": (
        "A tevékenység alakítsa a síkbeli ábrázoló- és kifejezőképességüket. A munka "
        "hangoljon rá a Mikulás érkezésére. Beszélgessünk a korábbi személyes "
        "élményeikről. Alakuljon a zenei tudatuk, és éljék át a zene varázsát éneklés "
        "és mondókázás közben. Erősödjön a közösségi érzésük az együttes "
        "tevékenységben. Fejlődjön az esztétikai érzékük és a zenei ízlésük. A játék "
        "jellegű főgyakorlatok tegyék lehetővé a differenciált, összetett "
        "fejlesztést. Adjunk megfelelő eszközt ahhoz, hogy minél igényesebben "
        "végezhessék a feladatokat."
    ),

    # ================= JANUÁR =================
    # --- Évszakok körforgása (evszakok_korforgas_v1) ---
    "9ec4c429": (
        "Érzékeltessük és figyeltessük meg velük az évszakok váltakozását. "
        "Gazdagítsuk az érzelmi életüket, és erősítsük a közösségi érzésüket. "
        "Fedeztessük fel az összefüggést az időjárás és az öltözködés között. "
        "Alkossanak halmazokat az egyéni fejlettségükhöz mérten. Ismertessünk meg és "
        "készítsünk velük olyan matematikai képességfejlesztő játékokat, amelyek "
        "lehetővé teszik a differenciált fejlesztést. Az irodalom eszközével "
        "érzékeltessük a változást, az állandóságot és az idő múlását, és "
        "tudatosítsuk, hogy téli hónapban járunk."
    ),
    "e39ee97f": (
        "Érzékeltessük az idő múlását. Tudatosítsuk az évszakok változását. "
        "Készítsünk a gyerekekkel Melyik évszakban születtem? táblát és "
        "évszak-társasjátékot. Mutassuk meg nekik a téli környezet és a természet "
        "szépségét. A számlálás elsajátítása játéktevékenységbe ágyazva történjen. "
        "Versek és mesék segítségével, játékosan számláljuk az évet, a hónapokat, az "
        "évszakokat és a hét napjait. Az irodalom eszközével érzékeltessük a "
        "változást, az állandóságot és az idő múlását. A vers és a mese tudatosítsa "
        "bennük az évszakokat."
    ),
    "a1a4f26e": (
        "Ismerjék meg az év, a hónapok, az évszakok, a napok és a napszakok "
        "váltakozását. Érzékeltessük az idő múlását. Tudatosítsuk az évszakok "
        "változását. Készítsünk a gyerekekkel Melyik évszakban születtem? táblát és "
        "évszak-társasjátékot. Számláljuk játékosan az évet, a hónapokat, az "
        "évszakokat és a hét napjait. Fedezzék fel, hogy a mennyiségekhez számokat "
        "tudunk rendelni. Éreztessük meg az ok-okozati összefüggéseket, és számláljuk "
        "az évszakokat és a hónapokat. A nap-, hónap- és évszaksoroló versek és mesék "
        "segítsék a sorrendiség megfigyelését, valamint az évszakok és a hónapok "
        "megjegyzését."
    ),
    "0b2cadec": (
        "A tevékenység segítse a technika elmélyítését. A közös munka éreztesse meg "
        "velük az együtt dolgozás jó hatását. Éreztessük meg velük a zene örömét, és "
        "motiváljuk őket a zenei tevékenységre. A zenei anyag teremtsen vidám téli "
        "hangulatot, és mélyítse el a gyerekek kapcsolatát. A torna jellegű, "
        "természetes támaszgyakorlatok az életkori és egyéni sajátosságokhoz igazodva "
        "fejlesszék sokoldalúan a képességeiket."
    ),
    "0fb43264": (
        "Évszakfa készítésével, a vizuális nevelés eszközével szemléltessük az "
        "évszakokat és a körforgásukat. A közös munka éreztesse meg velük az együtt "
        "dolgozás jó hatását. Érzékeltessük a dalok és a mondókák ritmusát mozgással. "
        "Fejlesszük a zenei hallásukat. Tökéletesítsük a térformákat és a "
        "kartartásokat, fejlesszük a hallásukat és a ritmusérzéküket. A pad fölött "
        "kifeszített zsinór átlépése nehezített körülmények közt fejlessze az "
        "egyensúlyérzéküket. Az egyensúlyfejlesztő mozgásos játék elégítse ki a testi "
        "szükségleteiket."
    ),
    "c3789f2e": (
        "Legyenek képesek színt rendelni az egyes évszakokhoz, és közösen felosztani "
        "az évet. A közös munka éreztesse meg velük az együttműködés és az együtt "
        "dolgozás jó hatását. A felszabadult játék tartsa fenn az érdeklődésüket az "
        "ének és a zene iránt. Kapcsoljuk össze a tiszta éneklést a mozgással, és "
        "elevenítsük fel a korábbi játékokat és mondókákat. A természetes "
        "támaszgyakorlatok alakítsák az egészséges életmódjukat. A széksoron végzett "
        "szökdelés, ugrás és járás nehezített körülmények közt fejlessze az "
        "egyensúlyérzéküket."
    ),

    # --- Napszakok, napirend (napszakok_napirend_v1) ---
    "8d493767": (
        "Képek és digitális eszköz segítségével érzékeltessük a napszakok, a nappal "
        "és az éjszaka váltakozását. Az egyéni képességeiket figyelembe véve adjunk "
        "játékos képességfejlesztést. Spontán élményekre épülő tapasztalatot "
        "szerezzenek a nappal és az éjszaka jellemzőiről. Játékos feladatokkal "
        "érzékeltessük a helyes időbeli viszonyításokat és az időbeli tájékozódást. A "
        "mese és a versek élményszerűen ismertessék meg velük a hét napjait. "
        "Erősítsük bennük a csendes mesehallgatás igényét."
    ),
    "3b598fec": (
        "Az óvodai napirend bemutatásával érzékeltessük az idő múlását és a napszakok "
        "váltakozását. Egy nap eseményeit ábrázoló képek időrendbe rakásával "
        "érzékeltessük a napszakok változását. Számláljuk a hét napjait játékos, "
        "verses formában. Versmondás közben gyakoroljuk a hét napjainak számlálását. "
        "Alapozzuk meg és bővítsük a számfogalmukat az életkori sajátosságokhoz "
        "igazodva. A mese és a versek élményszerűen ismertessék meg velük a hét "
        "napjait, és segítsék a megjegyzésüket. Erősítsük bennük a csendes "
        "mesehallgatás igényét."
    ),
    "07391e58": (
        "Érzékeltessük az óra fontosságát, és fedeztessük fel az ok-okozati "
        "összefüggéseket. Napszakóra készítésével adjunk játékos tapasztalatot a napi "
        "tevékenységek rögzítéséhez. Tárjuk fel az összefüggéseket a napszakokkal és "
        "az idő múlásával kapcsolatban. Fedezzék fel az ismétlődéseket az idő "
        "múlásában. Játékos feladatokkal érzékeltessük az idő múlását, és kössünk "
        "cselekvéseket a napszakokhoz. A mese és a versek élményszerűen ismertessék "
        "meg velük a hét napjait, és segítsék a megjegyzésüket. Tudatosítsuk bennük a "
        "tegnap, a tegnapelőtt, a holnap és a holnapután fogalmát."
    ),
    "6d4d7fd7": (
        "Tudatosítsuk bennük, hogy éjszaka a Hold világít, nappal pedig a Nap. "
        "Mélyítsük el a ragasztás helyes technikáját. Az éneklés örömteli legyen "
        "számukra. Keltsük fel az érdeklődésüket a zene iránt, és alakítsuk a "
        "fogékonyságukat. A hossztengely körüli gurulás közben keltsük fel és "
        "tartsuk fenn a kedvüket. Teremtsük meg a gyakorláshoz a megfelelő "
        "feltételeket: elegendő teret, kellékeket és biztonságos körülményeket."
    ),
    "4f8dac17": (
        "A képelemek rendezése közben tárják fel a képek közötti viszonyokat és "
        "összefüggéseket a cselekmény alapján, és alakítsák ki az időrendet. "
        "Mélyítsük el a helyes ollóhasználatot. Fejlődjön az esztétikai érzékük és a "
        "zenei ízlésük. Tanuljanak új énekes játékot, és szilárdítsák meg a korábban "
        "tanultat. A mozgásos tevékenységek alatt maradjon meg a tudatos figyelmük. "
        "Alakuljon az egyenes testtartásuk. Sajátítsák el a gyakorlat pontos "
        "végrehajtását."
    ),
    "9f5c8313": (
        "Kézügyességükre támaszkodva jelenítsék meg, mit szoktak csinálni az egyes "
        "napszakokban, majd az óvodapedagógus segítségével készítsenek napszakórát. "
        "Biztassuk őket a pontos, vonal menti vágásra. Alakuljon a zenei tudatuk, és "
        "éljék át a zene varázsát éneklés és mondókázás közben. Erősödjön a "
        "közösségi érzésük a dalos játékok együttes élményében. Fejlődjön a "
        "mozgásügyességük. A feladatvégzést egyenes tartás és megfelelő kartartás "
        "segítse."
    ),

    # --- Téli sportok, öltözködés (teli_sportok_v1, _v2, teli_oltozkodes) ---
    "b1a24f6b": (
        "Fedezzék fel, hogyan változik az időjárás az új évszak érkezésével. "
        "Érzékeltessük az időjárás változását az öltözködésen keresztül. Nevezzék meg "
        "a télre jellemző ruhadarabokat. Éljék át a téli örömöket: a szánkózást, a "
        "hógolyózást és a hóemberépítést. Az évszakra jellemző tárgyak, jelenségek és "
        "ruhadarabok képeivel hozzanak létre halmazokat többféle szempont szerint. "
        "Segítsük őket abban, hogy a csoportosításhoz maguk állítsanak fel szabályt. "
        "A mesét termésbábbal dolgozzuk fel. A mese és a versek tudatosítsák bennük "
        "az évszak jellemzőit."
    ),
    "2dba5829": (
        "Keressék az ok-okozati összefüggést a téli időjárás és az öltözködésünk "
        "között. A téli ruhadarabok öltözőszekrényből való összegyűjtése adjon "
        "tapasztalatot. Az évszakok képeivel, a maguk alkotta változatokban, játékos "
        "formában fejlesszük a soralkotás képességét. A játékos feladatok közben "
        "éreztessük meg velük a ritmikus ismétlődést. A mesét bábbal dolgozzuk fel. A "
        "mese és a versek tudatosítsák bennük az évszak jellemzőit."
    ),
    "a084bda3": (
        "Az udvaron, élményekre építve figyeljék meg a téli természeti jelenségeket. "
        "Keressék az ok-okozati összefüggést a téli időjárás és a betegségek között: "
        "miért hiányzik most sok gyerek a csoportból? Fedezzék fel a különböző "
        "szempontok szerint halmazba gyűjtött ruhák további tulajdonságait. Adjunk "
        "matematikai tapasztalatot a rövid és a hosszú, a hideg és a meleg, a vastag "
        "és a vékony fogalompárjáról. A mesét hurkapálca-bábbal dolgozzuk fel. "
        "Alakuljon bennük az állatok szeretete, és tudatosodjon a téli gondoskodás "
        "fontossága."
    ),
    "a968b22f": (
        "Ismerjék meg és mélyítsék el a gömbölyítés technikáját. A munka közben "
        "tudatosodjon bennük, hogy a hóember három különböző méretű gömbből áll, alul "
        "a legnagyobbal, felül a legkisebbel. Az éneklés örömteli legyen számukra. "
        "Keltsük fel az érdeklődésüket a zene iránt. Játékos formában érzékeltessünk "
        "egyszerű dallamfordulatokat, majd énekeltessük vissza őket. A testi "
        "képességeket természetes mozgásgyakorlatokkal fejlesztjük. A közvetlen cél a "
        "természetes mozgáskészségek fejlesztése alapmozgásokkal és mozgásos "
        "játékokkal. Adjunk nekik mozgásos élményt."
    ),
    "ca484800": (
        "Törekedjenek a vonal menti vágásra és a körök pontos elhelyezésére. "
        "Filctollal egészítsék ki a hóember arcát. Erősödjön a cselekvési vágyuk és a "
        "munkakedvük. Fejlődjön az esztétikai érzékük és a zenei ízlésük. Tanuljanak "
        "új énekes játékot, és szilárdítsák meg a korábban tanultat. Érzékeltessük a "
        "motívumot, majd énekeltessük vissza ismert dalokon. Használjuk ki és "
        "élesszük a mozgásigényüket, az érdeklődésüket és a sikerre törekvésüket. A "
        "mozgásos képességfejlesztésen belül differenciáljunk a műveletek "
        "sorrendjében és bonyolultságában."
    ),
    "6da6f49b": (
        "Ismerjék meg a szövés technikáját. Figyelmüket összeszedve törekedjenek a "
        "pontos, odafigyelő munkára. Alakuljon a zenei tudatuk, és éljék át a zene "
        "varázsát éneklés és mondókázás közben. Erősödjön a közösségi érzésük a dalos "
        "játékok együttes élményében. Érzékeltessük a motívumot, majd énekeltessük "
        "vissza kitalált szöveggel. Változatos mozgásfejlesztő játékokkal segítsük a "
        "képességek fejlődését, valamint a jártasságok és a készségek kialakulását. "
        "Adjunk nekik mozgásos élményt."
    ),

    # --- Újévi népszokások (ujevi_nepszokasok_v1) ---
    "442dc481": (
        "Érzékeltessük az idő múlását. Tudatosítsuk az évszakok változását. "
        "Készítsünk a gyerekekkel Melyik évszakban születtem? táblát és "
        "évszak-társasjátékot. Mutassuk meg nekik a téli környezet és a természet "
        "szépségét. Hasonlítsanak össze: számláljanak, és fedezzék fel a mennyiségi "
        "különbségeket. Alkossanak halmazokat az életkoruknak megfelelően. A mesét "
        "kesztyűbábbal dolgozzuk fel. A bábozás adjon irodalmi élményt, és alakítsa a "
        "belső képi világukat."
    ),
    "199bb2fa": (
        "Ismerjék meg az újévi szokásokat, népszokásokat és hagyományokat. "
        "Gazdagítsuk az érzelmi életüket, és erősítsük a közösségi érzésüket. "
        "Fedeztessük fel az összefüggést az időjárás és az öltözködés között. "
        "Alkossanak halmazokat az egyéni fejlettségükhöz mérten. Ismertessünk meg és "
        "készítsünk velük olyan matematikai képességfejlesztő játékokat, amelyek "
        "lehetővé teszik a differenciált fejlesztést. A mesét bábbal dolgozzuk fel. "
        "Az irodalmi élmény segítse az érzelmi nevelésüket. A mese fejlessze a "
        "humorérzéküket."
    ),
    "377b7bd5": (
        "Elevenítsük fel az újévi szokásokat, népszokásokat és hagyományokat. "
        "Készítsenek köszöntőkártyát a szülőkkel közösen, rajzzal és írással. "
        "Ismerjék meg az év, a hónapok, az évszakok, a napok és a napszakok "
        "váltakozását. A számlálás elsajátítása játéktevékenységbe ágyazva történjen. "
        "Versek és mesék segítségével, játékosan számláljuk az évet, a hónapokat, az "
        "évszakokat és a hét napjait. Fedezzék fel, hogy a mennyiségekhez számokat "
        "tudnak rendelni. A mesét árnyjátékkal dolgozzuk fel. A mese tudatosítsa a "
        "jószívűséget és a mások megsegítését."
    ),
    "8fce1943": (
        "A gyakorlás alakítsa az eszközhasználatukat. A megadott színekből tetszés "
        "szerint mintázhatnak, és biztassuk őket arra is, hogy a fantáziájukra "
        "támaszkodva egyszerűbb kompozíciót hozzanak létre. Az éneklés örömteli "
        "legyen számukra. Keltsük fel az érdeklődésüket a zene iránt, és alakítsuk a "
        "fogékonyságukat. Fejlődjön az esztétikai érzékük és a zenei ízlésük. "
        "Fejlesszük a mozgásos képességeiket, a mozgásügyességüket és a "
        "mozgáskultúrájukat."
    ),
    "7f71ca4e": (
        "Ismerjék meg a vattaragasztás helyes technikáját. Törekedjenek valamilyen "
        "vizuális ritmus alkalmazására és a tiszta munkavégzésre. Fejlődjön az "
        "esztétikai érzékük és a zenei ízlésük. Az éneklés örömteli tevékenység "
        "legyen számukra. Alakuljon a zenei tudatuk, és éljék át a zene varázsát "
        "éneklés és mondókázás közben. Többszöri ismétléssel segítsük a biztos "
        "labdafogás kialakulását. Mindvégig érvényesüljön a játékosság elve. "
        "Törekedjünk a test általános fejlesztésére, és adjunk elegendő időt az egyes "
        "képességek kialakulásához."
    ),
    "56774a95": (
        "Törekedjenek arra, hogy bátran használják a színeket. Figyeljenek az arányok "
        "megtartására és a részletek kidolgozására. Ismerjék el egymás munkáját, és "
        "mondják el, kinek mi tetszik a társa alkotásában. Fejlődjön az esztétikai "
        "érzékük és a zenei ízlésük. Az éneklés örömteli tevékenység legyen számukra. "
        "Alakuljon a zenei tudatuk, és éljék át a zene varázsát éneklés és mondókázás "
        "közben. Erősödjön a közösségi érzésük az együttes tevékenységben. A játék "
        "jellegű főgyakorlatok tegyék lehetővé a differenciált, összetett "
        "fejlesztést. Adjunk megfelelő eszközt ahhoz, hogy minél igényesebben "
        "végezhessék a feladatokat. Többszöri ismétléssel segítsük a biztos "
        "labdafogás kialakulását."
    ),

    # ================= FEBRUÁR =================
    # --- Balázs-nap, iskolába készülés (balazs_nap_iskola_v1) ---
    "983eb9b9": (
        "Fedezzék fel, mi van az iskolatáskákban. Ismerkedjenek a családokkal. "
        "Beszéljük meg, kinek van iskolás testvére. Alkossanak halmazokat különböző "
        "tárgyak szétválogatásával, meghatározott tulajdonság szerint, például hogy "
        "szükség van-e arra a tárgyra vagy sem. A meséket a főbb jelenetek "
        "illusztrálásával dolgozzuk fel. A mese ismertesse meg és tudatosítsa a téli "
        "jelenségeket és a tél jellemzőit."
    ),
    "01b82904": (
        "Az értelmi érzelmeik fejlődése közben éljék át az iskolába készülés örömét. "
        "A látogatáson csodálkozzanak rá a termek méretére. A célunk, hogy jó "
        "érzésekkel gondoljanak az iskolakezdésre. Fejlesszük a tájékozódásukat "
        "síkban és térben. Fedezzék fel, hol vannak az iskolák, és milyen messze "
        "esnek az óvodától. Végezzenek irányított összehasonlításokat játékos "
        "feladatokkal: mi van messzebb, és mi van közelebb? A mesét filcbábbal "
        "dolgozzuk fel. A mese erősítse az érzelemvilágukat és a fantáziájukat, és "
        "alakítsa ki bennük az állatok szeretetét."
    ),
    "68acf9b2": (
        "Ismerkedjenek a diákok ünnepének, a balázsolásnak az eredetével. Ismerjék meg "
        "az általános iskola épületét és a tanítókat, pillantsanak bele az iskola "
        "életébe, találkozzanak iskolásokkal, és vegyenek részt egy tanórán. Játékos "
        "képességfejlesztő feladatokkal, például színes ceruzákkal és padokkal, "
        "rendeljenek számokat mennyiségekhez, és alakuljon a számfogalmuk. Rendezzenek "
        "sorba tárgyakat a saját elgondolásuk és többféle szempont szerint. Nézzük "
        "meg, mi van a táskában és mi az osztálytermekben. A meséket a főbb jelenetek "
        "illusztrálásával dolgozzuk fel. A mese oldja bennük az iskolától és az "
        "ismeretlentől való félelmet."
    ),
    "e8ac31fc": (
        "A közös munka éreztesse meg velük az együtt alkotás örömét. Törekedjenek "
        "arra, hogy ne áztassák el a csomagolópapírt. A cél az érzékelési készség "
        "megalapozása, a spontán mozgásösztönök összerendezése és a mozgás "
        "harmonikussá tétele. Mondókákon keresztül, irányított mozdulatokkal "
        "fejlesztjük a metrumérzéket. Változatos mozgásformákkal adjunk megfelelő "
        "terhelést. Tornaszerekkel és eszközökkel biztosítsuk a mindennapos mozgást."
    ),
    "5d4cd724": (
        "Ragasszanak háromszög és négyszög alakú síkidomokat ritmikus rendben. A "
        "ritmust maguk találhatják ki. A képességeikhez mérten adjunk lehetőséget "
        "bonyolultabb ritmus kitalálására is. A ritmusérzék fejlesztése a zenei "
        "nevelés alapfeladata: célja az érzékelési készség megalapozása, a spontán "
        "mozgásösztönök összerendezése és a mozgás harmonikussá tétele. A "
        "ritmusérzéket ritmuszenekar alakításával fejlesztjük. Játékos formában "
        "fejlesszük a természetes, harmonikus mozgásukat és a testi képességeiket. "
        "Szerettessük meg velük a mozgást. Alapozzuk meg az egészséges életmód "
        "szokásait."
    ),
    "18833a42": (
        "Éreztessük meg velük az ajándékozás örömét. Törekedjenek az igényes, pontos "
        "munkára és az esztétikus eredményre. Mélyítsük el a szövés technikáját, és "
        "adjunk módot két szín használatára. Alakítsuk ki azokat a tevékenységi "
        "formákat, amelyek nélkülözhetetlenek a ritmuselemek megfigyeléséhez és "
        "tudatosításához. A ritmusérzéket ritmuszenekar alakításával fejlesztjük. "
        "Adjunk teret a szabad mozgásgyakorlásnak. Gyakorolják az elemi "
        "nagymozgásokat: a járást, a futást, az ugrást, a csúszást, a kúszást és a "
        "mászást. Mozgásos képességfejlesztő játékokkal fejlesszük az "
        "egyensúlyérzéküket."
    ),

    # --- Egészséges életmód (egeszseges_eletmod_v1, _v2) ---
    "d09ff9ed": (
        "Ismerkedjenek az egészséges életmóddal. Az életkoruknak megfelelő módon "
        "szerezzenek tapasztalatot arról, mi nem egészséges, mitől leszünk betegek, és "
        "mit tehetünk az egészségünkért. Beszéljük meg, milyen jelei vannak a "
        "betegségnek. Bővítsük a tapasztalataikat az egyszerűbb geometriai formák "
        "felismerésében, megnevezésében, azonosításában és leképezésében. Fejlesszük "
        "az alak- és formaészlelésüket. A mesét ujjbábbal dolgozzuk fel. A mese "
        "tudatosítsa a rendszeres fogmosás és a szájápolás fontosságát, és erősítse "
        "bennük, hogy a fogorvostól nem kell félni."
    ),
    "f8d2ac81": (
        "Alakítsuk bennük az egészségtudatos táplálkozást. Változatos "
        "képességfejlesztő játékokban ismerkedjenek az egészséges és az egészségtelen "
        "ételekkel és italokkal. Változatos képességfejlesztő játékokkal alakuljon a "
        "számfogalmuk tízes számkörben. Teremtsünk olyan helyzeteket, amelyekben az "
        "érzékszerveik segítségével sokszínű tapasztalatot szereznek a számfogalom "
        "kialakulásához. A mesét diafilm segítségével dolgozzuk fel. A Makk Marci "
        "egészségnevelő sorozat e része a tisztálkodás fontosságára tanít."
    ),
    "27fd33f0": (
        "Adjunk változatos tapasztalatszerzési alkalmakat, amelyekből megtudhatják, "
        "mit tehetünk az egészségünk megóvásáért. Látogassunk el az orvosi rendelőbe, "
        "ahol megismerkedhetnek az orvos munkájával, és kérdezhetnek is. Ismertessünk "
        "meg újabb geometriai formákat és kifejezéseket: körcikk, kúp, henger és "
        "ovális. Fejlesszük az alak- és formaészlelésüket, valamint a formamásolásban "
        "való jártasságukat. A mesét a főbb jelenetek illusztrálásával dolgozzuk fel. "
        "A mese tudatosítsa az egészséges életmód fontosságát, és erősítse bennük, "
        "hogy az orvostól nem kell félni, hiszen az ő dolga a gyógyítás."
    ),
    "6472ada6": (
        "Gyurmázzanak színes só-liszt gyurmával. Törekedjenek egyszerűbb formák "
        "megjelenítésére. Ismerkedjenek a gyurmával való térbeli alkotás "
        "lehetőségével. Az éneklés örömteli legyen számukra. Keltsük fel az "
        "érdeklődésüket a zene iránt, és alakítsuk a fogékonyságukat. Játékos "
        "helyzetekben gyakorolják azokat a természetes mozgásformákat, amelyek "
        "segítik a helyes testtartás kialakulását. Segítsük az érzelmi nevelésüket "
        "együttműködéssel és vidám légkörrel."
    ),
    "87f0f342": (
        "A fantáziájukra és a kreativitásukra támaszkodva formázzanak meg minél "
        "eredetibb módon egyszerűbb zöldségeket és gyümölcsöket. Fejlődjön az "
        "esztétikai érzékük és a zenei ízlésük. Tanuljanak új énekes játékot, és "
        "szilárdítsák meg a korábbiakat. Gyakorolják a természetes mozgásokat "
        "eszközzel. Erősödjön a pozitív énképük és az önuralmuk. Segítsük az értelmi "
        "nevelésüket, a feladatok megértését és végrehajtását."
    ),
    "dcce98d2": (
        "Gyakorolják a térbeli alkotást és annak díszítését. Biztassuk őket pontos "
        "munkára. Alakuljon a zenei tudatuk, és éljék át a zene varázsát éneklés és "
        "mondókázás közben. Erősödjön a közösségi érzésük a dalos játékok együttes "
        "élményében. Örömteli, változatos gyakorlási formákkal és játékkal segítsük a "
        "mozgáskoordinációjuk fejlődését. Gyakoroltassuk az ismert mozgásformákat "
        "kiegészítő eszközzel is."
    ),

    # --- Farsang (farsang, _v1, _v2) ---
    "30e9d18a": (
        "A farsangi népszokásokkal ismerkedve bújjanak bele a meseláda jelmezeibe. A "
        "kiszebáb készítésénél a képességeiknek megfelelő feladatot kapjanak, például "
        "kitömik a babát. A feladatunk a farsang lényegének változatos érzékeltetése. "
        "A csoportszoba és a farsangi kellékek díszítése közben ismertessük fel velük "
        "a szín- és formaazonosságot, valamint a különbözőséget. Adjunk olyan "
        "képességfejlesztő játékokat, amelyekkel ez a matematikai tapasztalatszerzés "
        "játékos formában megvalósul. A mesét diafilm vetítésével dolgozzuk fel. "
        "Törekedjenek megérteni a mese cselekményét és a szereplőkkel történteket. A "
        "mese tudatosítsa a farsangi szokásokat."
    ),
    "d2bcc331": (
        "A farsangi mulatságra készülve szerezzenek élményekre épülő tapasztalatot. "
        "Gyűjtsünk ötleteket arról, hogyan kergethetnénk el a telet. Figyeljék meg a "
        "kiszebáb elégetését. Játékos formában, matematikai tapasztalatszerzés közben "
        "figyeltessük meg a hosszabb és a rövidebb viszonyát, például a díszítéshez "
        "készült girland, a bohóc cipője és kalapja vagy a csörögefánk hosszán. A "
        "mesét bábbal dolgozzuk fel. Legyenek képesek csendes, elmélyült "
        "mesehallgatásra. Vitassuk meg, mi lehetett az oka az állatok "
        "veszekedésének."
    ),
    "ffa649cb": (
        "Elevenítsük fel a farsangi népszokásokat közös tapasztalatszerzéssel: "
        "készítsünk és égessünk el együtt kiszebábot. A szülők részvételével "
        "szervezett jelmezes felvonulásra képességfejlesztő játékok gyűjtésével "
        "készüljünk. Készítsenek árnyképjátékot, amelyen felfedezhető a kép és az "
        "árnyék viszonya. Adjunk olyan képességfejlesztő játékokat, amelyekkel ez a "
        "matematikai tapasztalatszerzés játékos formában megvalósul, például fehér "
        "lepel mögé állított gyerek vagy tárgyak felismerésével. A mesét a főbb "
        "jelenetek illusztrálásával dolgozzuk fel. A mese tudatosítsa bennük a "
        "farsangi szokásokat. Váljanak jó ízlésű, értő hallgatóvá. Beszélgessünk a "
        "szereplők tulajdonságairól, hogy a jó vonások mintaként szolgáljanak."
    ),
    "4d4e58cc": (
        "Ismertessünk meg egy új technikát: a krepp-papírt golyóvá gyúrják, majd a "
        "felületre ragasztják. A munka közben ismerjék meg a farsangi népszokásainkat. "
        "Éneklés és mondókázás közben, egyenletes mozgásokkal érzékeltessük a "
        "metrumot. Az egyszerű tánclépések gyakorlása közben emeljük ki a zenei "
        "hangsúlyokat. Metrikus mozgásokkal fejlesszük az ütemérzéküket. Mozgásos "
        "képességfejlesztő játékokkal tartsuk fenn a természetes mozgáskedvüket, "
        "elégítsük ki a mozgásigényüket, és szerettessük meg velük a mozgást. "
        "Gyakorlási lehetőséggel bővítsük a mozgástapasztalataikat."
    ),
    "457166f3": (
        "Ragasszanak síkidomokat az általuk kitalált kompozícióban. Éljék át az "
        "alkotás örömét. Törekedjenek esztétikus eredményre. Munka közben "
        "beszélgessünk a télűző farsangi hagyományainkról. Érezzék meg a zene "
        "lüktetését, és tudják követni a mozdulataikkal. Ehhez adjunk különféle "
        "képességfejlesztő feladatokat: utánozzák a dalban és a mondókában előforduló "
        "tevékenységeket, és lépegessenek egyenletesen helyben járva, menetelve vagy "
        "körbejárva. Változatos mozgásos játékokkal aknázzuk ki az egyéni "
        "mozgásfejlesztés lehetőségeit. Tornaszerekkel és eszközökkel biztosítsuk a "
        "mindennapos mozgást a szabadban és a tornateremben egyaránt."
    ),
    "52e04041": (
        "Vágják ki önállóan az álarcot, majd az emlékezetükre és a fantáziájukra "
        "támaszkodva színezzék ki. Éljék át az alkotás örömét, és ismerjék el egymás "
        "munkáját. Nagycsoportban már fejlettebb mozgásra képesek: az egyenletes "
        "lüktetést esztétikus, egységes mozgással emelik ki. Gyakorolják a járást "
        "változatos térformákban, és a különböző tánclépéseket ismert dalokon és "
        "dalos játékokon. Gyakorlási lehetőséggel fejlesszük a mozgásszintjüket és "
        "bővítsük a mozgástapasztalataikat. Változatos mozgásformákkal adjunk "
        "megfelelő terhelést."
    ),

    # --- Fény és árnyék, mackók (feny_arnyek_mackok_v1) ---
    "a16ace19": (
        "Digitális eszközzel ismerkedjenek a medvékkel, és figyeltessük meg a külső "
        "jegyeiket. Építsenek medvebarlangot az otthonról hozott mackóknak. A gyűjtött "
        "medvéket csoportosítsák: alkossanak halmazokat szín és nagyság szerint, majd "
        "hasonlítsák össze őket a darabszámuk alapján. Tudatosítsuk a kisebb és a "
        "nagyobb fogalmát. Alakuljon a számfogalmuk. A mesét kesztyűbábbal dolgozzuk "
        "fel. A mese ismertesse meg a téli álom fogalmát, és nevelje őket az állatok "
        "szeretetére."
    ),
    "1b6dc54c": (
        "Digitális eszközzel ismertessük meg a medvék élőhelyét, életmódját és "
        "mozgását, és fedeztessük fel a medvefajták közti különbségeket. Az erdei "
        "kiránduláson hívjuk fel a figyelmüket a vadetetés fontosságára és "
        "felelősségére. Képességfejlesztő játékokkal szerezzenek tapasztalatot a "
        "fényről és az árnyékról. A gyűjtött képekkel játékosan fejlesszük a "
        "képességeiket. A medvefajok képeit csoportosítsák faj, méret és szín "
        "szerint, majd hasonlítsák össze a darabszámukat. A mesét bábbal dolgozzuk "
        "fel. Beszélgessünk a mesebeli medve tulajdonságairól, és gyűjtsük össze a jó "
        "és a rossz vonásokat. Elevenítsük fel és tudatosítsuk a téli álom fogalmát."
    ),
    "45716fba": (
        "Helyezzünk nagy hangsúlyt a hagyományőrzésre, ezen belül a gyertyaszentelő "
        "népszokásának megismerésére. Játékos tapasztalatszerzésen keresztül éljék "
        "át, vajon kint marad-e február másodikán a medve, vagy visszabújik a "
        "barlangjába. Készítsenek árnyképeket, majd azonosítsák őket az eredeti "
        "képpel. Ismertessük meg az árnyék és az árnykép fogalmát. "
        "Képességfejlesztő játékokkal szerezzenek tapasztalatot. A mesét fakanálbábbal "
        "dolgozzuk fel. Elevenítsük fel és tudatosítsuk a téli álom fogalmát. "
        "Gyűjtsük össze, milyen állatok alszanak még téli álmot. Ismertessünk meg "
        "történeteket a medve előbújásáról."
    ),
    "b99518c4": (
        "Mélyítsük el a ragasztás helyes technikáját. Munka közben bővítsük a "
        "tudásukat a medvéről és a téli életmódjáról. A játékot mi indítjuk el, és a "
        "saját mozgásunkkal irányítjuk, így adjuk meg a tempót. Ők egyszerű "
        "mozdulatokkal követik az óvodapedagógus éneklésének tempóváltását. Adjunk "
        "teret a szabad mozgásgyakorlásnak. Gyakorolják az elemi nagymozgásokat: a "
        "járást, a futást, az ugrást, a csúszást, a kúszást és a mászást. Mozgásos "
        "képességfejlesztő játékokkal fejlesszük az egyensúlyérzéküket."
    ),
    "f200069b": (
        "Törekedjenek a helyes ollóhasználatra és a vonal menti vágásra. Ragasztás "
        "előtt helyezzék el a részeket. Az éneklés és a mozgás tempóját az életkori "
        "sajátosságokhoz kell igazítani, és ezen belül tempótartásra kell nevelni "
        "őket. A feladat a szokásosnál gyorsabb és lassabb tempó közti különbség "
        "érzékeltetése és gyakorlati alkalmazása. Játékos formában fejlesszük a "
        "természetes, harmonikus mozgásukat és a testi képességeiket. Szerettessük "
        "meg velük a mozgást. Alapozzuk meg az egészséges életmód szokásait."
    ),
    "6b1a39b0": (
        "Rajzolják meg, majd vágják ki a fejdíszhez szükséges részeket. Törekedjenek "
        "az arányok és a méretek megtartására. A tempóváltást mondókán és dalos "
        "játékon keresztül, mozgással gyakoroltassuk. Éneklés vagy mondókázás közben "
        "járnak, tapsolnak, mozognak, az óvodapedagógus pedig dobbal váratlanul "
        "tempót vált, és ebben a tempóban kell folytatniuk. Változatos mozgásformákkal "
        "adjunk megfelelő terhelést. Tornaszerekkel és eszközökkel biztosítsuk a "
        "mindennapos mozgást a szabadban és a tornateremben egyaránt."
    ),

    # ================= MÁRCIUS =================
    # --- Március 15. (marcius_15, _v1, _v2) ---
    "9d17a618": (
        "A cél a szülőföldhöz kötődés alakítása. Élményt adó séták során ismerkedjenek "
        "a szűkebb és a tágabb lakóhelyükkel. Figyeljék meg a ló külső jegyeit a "
        "természetes környezetében. Matematikai képességfejlesztő játékokkal "
        "figyeltessük meg az alapformákat, például várépítés közben a "
        "játékszőnyegen, ahol megnevezzük a felhasznált építőelem formáját. A mesék és "
        "a versek ismertessék meg a nemzeti színeinket, és segítsék a megjegyzésüket. "
        "Tudatosítsuk bennük, hogy Magyarországon élünk."
    ),
    "180344dd": (
        "A cél a szülőföldhöz kötődés alakítása. Élményt adó kirándulásokon "
        "ismerkedjenek a szűkebb és a tágabb lakóhelyükkel. Végezzenek "
        "megfigyeléseket, összehasonlításokat és méréseket játékos formában. Jelöljük "
        "meg a térképen, ki hol lakik, és ki lakik közelebb vagy távolabb az "
        "óvodától. A mérőpontok és a mérőegységek megválasztásával differenciálhatjuk "
        "a fejlesztést. A hazafias versek és mesék ismertessék meg velük a tágabb "
        "környezetüket és hazánk múltját. Alakuljon ki bennük a haza és a városuk "
        "szeretete."
    ),
    "f03daf5a": (
        "Ismerkedjenek az 1848–49-es forradalom történetével. Játékos formában "
        "érzékeltessük a hazaszeretet és a szabadság fogalmát. Látogassunk el a "
        "helytörténeti múzeumba, és vegyünk részt a szabadságharchoz kapcsolódó "
        "múzeumi foglalkozáson. Emlékezzünk meg a parkban, és helyezzünk el "
        "nemzetiszínű zászlókat. Végezzenek megfigyeléseket és összehasonlításokat, "
        "ismerjék fel és csoportosítsák az azonosságokat és a különbségeket változatos "
        "formában. A tapasztalatszerző sétán szerzett ismereteket használjuk fel a "
        "játékos képességfejlesztésben, például a fegyverek méreténél. A hazafias "
        "versek és mesék ismertessék meg velük a tágabb környezetüket és hazánk "
        "múltját. Ismertessük az 1848-as forradalom és szabadságharc eseményeit. "
        "Alakuljon ki bennük a haza és a városuk szeretete."
    ),
    "9d390ece": (
        "Tudatosítsuk bennük a nemzeti színeinket. Gyakorolják az egymintás "
        "soralkotást parafanyomat technikával. Énekléssel és mondókázással teremtsünk "
        "ünnepi hangulatot, és formáljuk az esztétikai érzéküket. Szilárdítsuk meg a "
        "korábbi dalokat és mondókákat, és hangoljuk össze az éneket a mozgással. A "
        "mozgásról szerzett jó élmények sokoldalúan, harmonikusan fejlesszék a "
        "személyiségüket. Ehhez az egyéni képességeikhez legjobban illő tevékenységi "
        "formákat és természetes támaszgyakorlatokat hívjuk segítségül."
    ),
    "375be8e1": (
        "Törekedjenek a vonal menti vágásra. A munkájuk elismerése növelje az "
        "önbizalmukat, és ösztönözze őket arra, hogy tovább alkossanak. A közös játék "
        "segítse a társas készségeiket, és formálja a zenei ízlésüket. Szilárdítsuk "
        "meg a korábban tanult játékot. Alakítsunk ritmuszenekart saját készítésű "
        "hangszerekkel. Az egyéni szükségleteiket és képességeiket figyelembe véve "
        "adjunk teret a mozgásnak. Neveljük őket a mozgás szeretetére, és erősítsük "
        "az egészséges életvitelüket."
    ),
    "9359f70d": (
        "A közös munkában ragasszanak krepp-papírból formált golyókat. Munka közben "
        "törekedjenek az együttműködésre és egymás segítésére. Tökéletesítsük a "
        "térformákat és a kartartásokat, fejlesszük a hallásukat és a "
        "ritmusérzéküket. A zenei anyag teremtsen vidám tavaszi hangulatot, és "
        "mélyítse el a gyerekek kapcsolatát. Tartsuk fenn és fejlesszük a természetes "
        "mozgásukat, és szerettessük meg velük a mozgást vidám mozgásos játékokkal és "
        "érdekes eszközökkel, például botokkal."
    ),

    # --- Tavasz, időjárás és virágok (tavasz, _v1, _v2) ---
    "4d1fc4c9": (
        "Keltsük fel és elégítsük ki a természetes gyermeki kíváncsiságukat "
        "tapasztalatszerzéssel, a közvetlen környezetük megismerésén keresztül. "
        "Vegyék észre a környezetük szépségét, és azt, hogyan változik az évszakkal a "
        "növény- és az állatvilág. A matematikai tapasztalatszerzés is a "
        "kíváncsiságukra épüljön. A kavicsok összehasonlítása közben fedezzenek fel "
        "ellentétpárokat forma, nagyság és szín szerint: kicsi és nagy, vastag és "
        "vékony, gömbölyű és lapos. A meséket dramatizálva dolgozzuk fel. A versek és "
        "a mesék ismertessék meg és tudatosítsák a tavaszi időjárás fő jellemzőit. A "
        "dramatizálás növelje a közösségi élményt és a csoport összetartását."
    ),
    "2db883b5": (
        "Figyeljék meg a természet újjászületését és a környezetük változását. Az "
        "élményt adó sétán beszélgessünk a tavaszi természetről és az időjárás "
        "változásáról: honnan tudjuk, hogy jön a tavasz? A matematikai "
        "tapasztalatszerzés keltse fel a kíváncsiságukat, és adjon teret az egyéni "
        "fejlesztésnek. Különböző anyagok, például kavics és homok súlyát becsüljék "
        "meg, majd ellenőrizzék mérleggel. A mesét bábbal dolgozzuk fel. Beszéljék meg "
        "közösen a mese tanulságát, és bátran fogalmazzák meg a következtetéseiket. "
        "Bővüljön a tudásuk a tavaszi virágokról."
    ),
    "1a298b76": (
        "Ismerjék meg a szűkebb és a tágabb környezetük növényeit és állatait. A "
        "tapasztalatszerző sétán figyeljék meg a növény- és állatvilág változásait, "
        "ismerjék fel a rügyező fákat és a tavaszi virágokat. Fogalmazzák meg az "
        "évszakhoz fűződő személyes tapasztalataikat és érzéseiket. A számfogalom "
        "kialakulásához gyakorolják a számlálást: számoljanak el, ameddig tudnak, "
        "például a fák virágait vagy a hangyákat az udvaron. A matematikai "
        "tapasztalatszerzés keltse fel és elégítse ki a kíváncsiságukat. A mesét a "
        "főbb jelenetek illusztrálásával dolgozzuk fel. A mese által érzékeljék "
        "nyelvünk szépségét, és vegyék észre az ismeretlen szófordulatokat."
    ),
    "48eb781e": (
        "A munka során maguk állítsák össze a ragasztandó részeket. Ragasszanak "
        "magabiztosan, és figyeljenek a tiszta munkavégzésre. Bátran röptessék a "
        "munkáikat, ez is erősíti az önbizalmukat. Az óvodai ének-zene legfőbb célja, "
        "hogy gondos, türelmes munkával elérje a szükséges fejlődést. "
        "Légzőgyakorlatokkal segítsük a megfelelő hangmagasság elérését. Hozzanak "
        "létre különböző formákat szerpentines pálcával a levegőben vagy a földön. "
        "Nehezített körülmények között alakítsuk az egészséges életmódjukat, és "
        "fejlesszük az egyensúlyérzéküket."
    ),
    "4f24243e": (
        "Használják magabiztosan a munkához szükséges eszközöket. Törekedjenek a vonal "
        "menti vágásra és az esztétikus díszítésre. Gyakoroljunk játékhelyzetben, "
        "például babaaltatással, mert a természetes, barátságos viselkedés megnyugtatja "
        "a kicsiket, és maga az éneklés is feszültségoldó. A torna jellegű, "
        "természetes támaszgyakorlatok az életkori és egyéni sajátosságokhoz igazodva "
        "fejlesszék sokoldalúan a képességeiket."
    ),
    "ec911102": (
        "Hívjuk fel a figyelmüket arra, hogy a tűvel óvatosan kell bánni. A "
        "foglalkozáson gyakorolják az egyszerű öltéseket. Törekedjenek a pontos, "
        "odafigyelő munkára. Az éneklési készség a gyermek utánzási vágyára épül, "
        "ezért a dalokat hallás után tanítsuk. Adjunk módot a sokszori ismétlésre és "
        "gyakorlásra. Légzőgyakorlatokkal segítsük a megfelelő hangmagasság elérését. "
        "Egyensúlyfejlesztő mozgásos játékokkal elégítsük ki a testi szükségleteiket. "
        "Járjanak egyensúlyozva a padon szerpentinnel, előre és hátra, és dobjanak "
        "egy kézzel, felső dobással a szerpentines pálcával."
    ),

    # --- Tavaszi virágok (tavaszi_viragok) ---
    "29a8a788": (
        "A tavasz beköszöntével ismerjék meg az ilyenkor termő zöldségeket, "
        "gyümölcsöket és a nyíló virágokat. Játékos tapasztalatszerzés közben "
        "ismerkedjenek a színükkel, a formájukkal és az ízükkel. Csodálkozzanak rá az "
        "élettel teli természet szépségére. A nagyobbak által a piacon vásárolt "
        "gyümölcsöket és zöldségeket tapintva, összehasonlítva fedezzék fel a "
        "különböző méreteket. Állapítsák meg, melyik a legkisebb, a legnagyobb és a "
        "közepes. A meséket dramatizálva dolgozzuk fel. A dramatizálás fokozza az "
        "érdeklődésüket és az irodalom szeretetét. Törekedjenek arra, hogy a mese fő "
        "részeit önállóan mondják el."
    ),
    "46b168e1": (
        "Élményekre épülő tapasztalatszerzés közben fedezzék fel, milyen új "
        "zöldségeket és gyümölcsöket kóstolhatunk, és milyen színpompás virágokat "
        "láthatunk. A piacon vásárolt gyümölcsöket és zöldségeket tapintva, "
        "összehasonlítva fedezzék fel a különböző méreteket. Állapítsák meg, melyik a "
        "legkisebb, a legnagyobb és a közepes. Keressenek ellentéteket, "
        "azonosságokat és különbségeket. A mesét asztali bábbal dolgozzuk fel. A mese "
        "élményszerű bemutatása alakítsa az esztétikai ízlésüket, és teremtsen "
        "érzelmi hangulatot a befogadáshoz."
    ),
    "c2b5c090": (
        "Saját élményű tapasztalás során, piaci látogatáson vásároljanak zöldséget és "
        "gyümölcsöt a salátához. Ismerjék meg, melyik részüket fogyasztjuk. "
        "Érzékszerveik segítségével nevezzék meg az ízüket. A játékos matematikai "
        "képességfejlesztő játékokban ellentétpárokat keresve ismerkedjenek a vastag "
        "és a vékony, a hosszú és a rövid, a kicsi és a nagy fogalompárjával. "
        "Számlálással állapítsák meg a vásárolt termékek számát. A mesét a főbb "
        "jelenetek illusztrálásával dolgozzuk fel. Az irodalmi élmény segítse az "
        "érzelmi nevelésüket és új érzelmek kialakulását."
    ),
    "e7d335a6": (
        "Előkészítő munkaként közösen tépdeljük a színes papírokat. Törekedjenek arra, "
        "hogy a saját elképzelésük szerint hozzanak létre valamilyen kompozíciót. "
        "Bánjanak magabiztosan a stiftes ragasztóval. Mondókán keresztül, többféle "
        "módon érzékeltessük az egyenletes lüktetést: hajladozással jobbra-balra, "
        "ülve és állva, vagy ülve, kinyújtott lábbal sarokkoppantással. Az éneklés "
        "örömteli legyen számukra. Az alapvető testi képességek óvodáskorban "
        "különböző szintűek, és eltérő ütemben fejlődnek, ezért az életkorukhoz és a "
        "fejlettségükhöz illő mozgásfejlesztő játékokat adjunk."
    ),
    "a66d6638": (
        "Törekedjenek a virágformához szükséges vonal menti vágásra. Adjunk módot arra, "
        "hogy a virág formáját és színét a saját elképzelésük szerint válasszák. "
        "Alakuljon a zenei tudatuk, és éljék át a zene varázsát éneklés és mondókázás "
        "közben. Erősödjön a közösségi érzésük a dalos játékok együttes élményében. A "
        "hatalmas mozgásigényükből fakadó érdeklődést a soron következő "
        "mozgásfeladatra kell irányítani, és fenn kell tartani."
    ),
    "268f30c1": (
        "A közös munkában ismerkedjenek a kasírozás technikájával és a csirizzel. A "
        "foglalkozás előtt figyeljenek aktívan az óvodapedagógus magyarázatára és a "
        "menet bemutatására. Keltsük fel az érdeklődésüket a zene iránt, és alakítsuk "
        "a fogékonyságukat. Éljék át a zene varázsát éneklés és mondókázás közben. "
        "Erősödjön a közösségi érzésük a dalos játékok együttes élményében. A "
        "testgyakorlatokban, például a sorozatugrásban és a hajtott kötél alatti "
        "átfutásban vegyenek tevékenyen részt. A figyelmük és az érdeklődésük "
        "felkeltésével és ébren tartásával segíthetjük a nagymozgásaik fejlődését."
    ),

    # --- Víz Világnapja (viz_vilagnapja, _v1, _v2) ---
    "d7596f92": (
        "Dolgozzuk fel a víz témáját összetetten, több szempontból. Kiránduljunk a "
        "helyi vizes élőhelyekre, ez saját élményű tapasztalatot ad nekik. Játékos "
        "feladatokkal szerezzenek matematikai tapasztalatot: melyik pohárban van több "
        "víz? Állapítsuk meg becsléssel és méréssel, különböző méretű és alakú "
        "eszközökkel. A mesét műanyag káddal, vízzel és termésbábbal dolgozzuk fel. Az "
        "irodalom eszközével adjuk át a vízről szóló ismereteket. Hangolódjunk rá a "
        "víz világnapjára. Vitassuk meg a mesebeli béka viselkedését."
    ),
    "12c9c9b8": (
        "Játékos formában érzékeltessük, milyen szerepe van a víznek az életünkben. "
        "Szerezzenek tapasztalatot arról, mi mindenre használjuk a vizet. "
        "Kezdeményezzünk beszélgetést arról, miért nem élhetünk víz nélkül. Játékos "
        "feladatokkal szerezzenek matematikai tapasztalatot. Ismertessük fel velük az "
        "azonosságot és a különbséget: melyik üvegbe fér több és melyikbe kevesebb, a "
        "csapból és a közeli tóból vett minta alapján. Fedezzék fel, melyik víz "
        "sötétebb, világosabb, tisztább vagy zavarosabb. A mesét bábbal dolgozzuk fel. "
        "Az irodalom eszközével adjuk át a vízről szóló ismereteket. Hangolódjunk rá a "
        "víz világnapjára. Ismertessük meg velük a sok jó ember kis helyen is elfér "
        "közmondást."
    ),
    "d570a8bd": (
        "Adjunk új ismereteket a vízvédelemről. Hívjuk fel a figyelmüket a Föld "
        "értékeinek megóvására. Tudatosítsuk az ivóvizünk tisztaságának fontosságát. "
        "Játékos feladatokkal szerezzenek matematikai tapasztalatot. Mérjenek "
        "űrtartalmat különböző méretű poharakkal és edényekkel: melyik a könnyebb, "
        "melyik a nehezebb, melyikbe fér több és melyikbe kevesebb? Kísérletezzenek "
        "saját tapasztalás útján, szólaltassanak meg kristálypoharakat. A mesét a főbb "
        "jelenetek illusztrálásával ismertessük. Az irodalom eszközével adjuk át a "
        "vízről szóló ismereteket. Hangolódjunk rá a víz világnapjára. A mese nyelvi "
        "tapasztalatot ad, fokozza a beszédkedvüket, és erősíti a nyelvhez fűződő "
        "érzelmi és gondolati kötődésüket."
    ),
    "16d227c7": (
        "Adjunk módot egyszerűbb színritmusok megvalósítására. Igyekezzenek "
        "magabiztosan bánni a ragasztóval. Törekedjenek a tiszta munkavégzésre. "
        "Szerettessük meg velük a közös éneklést, és adjunk művészi zenei élményt. A "
        "hallásfejlesztés a hallási észlelést csiszolja, például csengőhangkereső "
        "játékokkal. Változatos módon érzékeltessük a halkat és a hangosat. Segítsük "
        "a mozgásszerveik fejlődését. A hossztengely körüli gurulás gyakorlása "
        "alakítsa a szem-kéz és a szem-láb összerendezettségét. A mozgásigényüket "
        "élményt adó mozgásos játékokkal elégítsük ki."
    ),
    "d551874b": (
        "Ha lehet, ők vágják fel a munkához szükséges kockákat. Szokjanak hozzá az "
        "odafigyelő, pontos munkavégzéshez. Ismételjék a mondókákat és a játékokat, "
        "végezzenek egyszerű tánclépéseket, és sajátítsák el az új játékot. Jelentsen "
        "örömet a közös éneklés és mozgás. Segítsük a mozgásszerveik fejlődését. A "
        "hossztengely körüli gurulás gyakorlása alakítsa a szem-kéz és a szem-láb "
        "összerendezettségét. A mozgásigényüket élményt adó mozgásos játékokkal "
        "elégítsük ki."
    ),
    "5fb20c4e": (
        "Ösztönözzük őket esztétikus munkára az ismert anyagokból. Több technika "
        "ötvözésével sarkalljuk őket kreatív gondolkodásra. Énekeljenek dalokat "
        "különböző hangképző szótagokkal. A zenei képességfejlesztés célja a helyes "
        "légzés, a test- és fejtartás szokásainak kialakítása, valamint a hangképzés "
        "és a hangzóformálás szabályainak elsajátítása. A természetes "
        "mozgáskészségeket az alapmozgások és a mozgásos játékok gyakorlásával "
        "fejlesszük."
    ),

    # ================= ÁPRILIS =================
    # --- Föld Napja (fold_napja, _v1, _v2) ---
    "bdc82371": (
        "A közös tevékenység szerettesse meg velük a természetet, kiemelve, miért "
        "fontos megóvni a Földet. Beszéljük meg, miért kell védeni a városi és az "
        "erdei fákat és növényeket. Elevenítsük fel és bővítsük a Földről tanultakat. "
        "Pontosítsuk a matematikai fogalmakat, segítsük a felismerésüket, és "
        "gyorsítsuk az előhívásukat. Keressük meg, melyik fa, növény vagy állat a "
        "legkisebb a valóságban. Végezzenek összehasonlításokat a természetben. A "
        "mesét síkbábbal dolgozzuk fel. A versek és a mesék alakítsák ki bennük a "
        "természet szeretetét. Hívjuk fel a figyelmüket arra, hogy nem szabad "
        "szemetelni."
    ),
    "ba52360c": (
        "Beszéljük meg a környezetvédelmet és azt, miért kell óvni a természeti "
        "kincseket. Nézzünk meg a laptopon egy videót a természetről, és "
        "beszélgessünk a Földről és a földrészekről. Pontosítsuk a matematikai "
        "fogalmakat, és segítsük a felismerésüket. A földgömbön érzékeltessük a "
        "többet, a kevesebbet és az ugyanannyit a víz és a szárazföld arányán. A "
        "mesét filcbábbal dolgozzuk fel. A versek és a mesék alakítsák ki bennük a "
        "természet szeretetét. Vitassuk meg, hogyan védhetjük meg a Földünket."
    ),
    "bec3f86f": (
        "Szerezzenek közvetlen tapasztalatot a palántázásról, a munka menetéről és az "
        "eszközeiről. Beszéljük meg, miért kell védeni a városi és az erdei fákat és "
        "növényeket. Elevenítsük fel és bővítsük a Földről tanultakat. Fejlesszük a "
        "logikus gondolkodásukat. Ismerjék fel az ok-okozati összefüggéseket a "
        "környezetvédelemben. Pontosítsuk a matematikai fogalmakat, segítsük a "
        "felismerésüket, és gyorsítsuk az előhívásukat. A mesét földgömb és bábok "
        "segítségével dolgozzuk fel. A versek és a mesék alakítsák ki bennük a "
        "természet szeretetét. Tudatosítsuk, miért fontos fát és virágot ültetni, és "
        "beszéljük meg, mit adnak nekünk ezek a növények. Mondják el a véleményüket "
        "bátran, érthetően és magabiztosan."
    ),
    "c9829d4d": (
        "A közös munkában éljék át az együtt tevékenykedés jó hatását. Az "
        "óvodapedagógus segítségével törekedjenek a felület kitöltésére és a tiszta "
        "munkavégzésre. Fejlődjön az esztétikai érzékük és a zenei ízlésük. "
        "Tanuljanak új énekes játékot, és szilárdítsák meg a korábban tanultat. "
        "Fejlődjön a mozgásügyességük. A feladatvégzést egyenes tartás és megfelelő "
        "kartartás segítse."
    ),
    "9166b8f0": (
        "Gyakorolják egy tárgy elkészítését. Törekedjenek a nagyobb hullámvonalak "
        "vonal menti vágására, valamint a tárgy felületének magabiztos festésére és a "
        "helyes ecsethasználatra. Az éneklés örömteli legyen számukra. Keltsük fel az "
        "érdeklődésüket a zene iránt, és alakítsuk a fogékonyságukat. A hossztengely "
        "körüli gurulás közben keltsük fel és tartsuk fenn a kedvüket. Teremtsük meg a "
        "gyakorláshoz a megfelelő teret, kellékeket és a biztonságos körülményeket."
    ),
    "50ba1d96": (
        "A hajtogatás nevelje őket pontos, odafigyelő munkára. Törekedjenek arra, hogy "
        "figyelemmel kísérjék az óvodapedagógus munkáját, majd a lehető "
        "legpontosabban utánozzák. Alakuljon a zenei tudatuk, és éljék át a zene "
        "varázsát éneklés és mondókázás közben. Erősödjön a közösségi érzésük a dalos "
        "játékok együttes élményében. A mozgásos tevékenységek alatt maradjon meg a "
        "tudatos figyelmük. Alakuljon az egyenes testtartásuk. A feladat közben "
        "sajátítsák el a gyakorlat pontos végrehajtását."
    ),

    # --- Húsvéti hét (husvet, husveti_het_v1, _v2) ---
    "71083acc": (
        "A baromfiudvarban tett látogatáson fedeztessük fel és figyeltessük meg az "
        "állatok tulajdonságait, külső jegyeit, életmódját, táplálkozását, "
        "szaporodását, gondozását és azt, mi hasznuk van az ember számára. Gyűjtsenek "
        "tojást a tyúkoktól a tojásfestéshez. Matematikai képességfejlesztő "
        "játékokkal hasonlítsák össze a kapott tojások méretét, és rendezzék őket "
        "sorba. Beszéljük meg, vajon mindegyik tojást ugyanaz az állat tojta, és "
        "keressük a választ digitális eszközzel. A mesét dramatizálva dolgozzuk fel. A "
        "mesék és a versek segítsenek ápolni a hagyományt és megismerni a húsvéti "
        "szokásokat. A dramatizálás növelje a közösségi élményt."
    ),
    "710a9c49": (
        "Ismertessük meg velük a húsvéti népi hagyományokat, különös tekintettel a "
        "közösen átélt élményekre. Ismerkedjenek azzal, mi mindenre használható a "
        "gazdasági udvar tyúkjaitól kapott tojás. Rendezzünk tojásgyűjtő versenyt. A "
        "tojáskeresés adjon alkalmat a számosság, a csoportosítás, a becslés, a mérés "
        "és az összehasonlítás gyakorlására. A megtalált tojásokat hasonlítsák össze, "
        "azonosítsák, és ismerjék fel a köztük lévő különbséget. A mesét kesztyűbábbal "
        "dolgozzuk fel. A mese és a versek bővítsék a tájékozottságukat az ünnep "
        "népies jellegéről és a húsvéthoz kapcsolódó szokásokról."
    ),
    "b15029ab": (
        "Ismertessük meg velük a húsvéti népi hagyományokat, hogy bővebb ismeretet "
        "szerezzenek a népszokásokról, a népi játékokról és az ünnep jelképeiről. "
        "Készítsünk komatálat. Szerezzenek közvetlen tapasztalatot az állatok körüli "
        "munkákról, és arról, hogy a háziállatoknak szükségük van az ember "
        "gondoskodására. A tojásdíszítés adjon matematikai tapasztalatot: milyen "
        "formákkal és mintákkal díszítsünk? Ismerjenek fel és folytassanak ritmikus "
        "sorozatokat. Fedeztessük fel velük a felezést, majd a szimmetriát. A mesét "
        "kesztyűbábbal dolgozzuk fel. A mese és a versek bővítsék a "
        "tájékozottságukat az ünnep népies jellegéről és a húsvéti szokásokról. "
        "Hasonlítsák össze a régi és a mai locsolkodást."
    ),
    "e3f4d0e8": (
        "A munka mélyítse el a sodrás és a gömbölyítés technikáját. Esztétikai "
        "érzékükre támaszkodva törekedjenek arra, hogy szépen helyezzék el a színes, "
        "sodort vagy gömbölyített gyurmát a laminált tojásformán. Ismertessünk meg "
        "velük tavaszi dalokat és húsvéti mondókákat. A zenei képességfejlesztés "
        "közben ismerkedjenek a metronómmal, amellyel az életkoruknak megfelelően "
        "tapasztalhatják meg a gyors és a lassú különbségét. Törekedjünk a test "
        "általános fejlesztésére, és adjunk elegendő időt az egyes képességek "
        "kialakulásához."
    ),
    "057f755d": (
        "Gyakorolják egy tárgy megfestését. Különösen figyeljenek az óvatos munkára, "
        "és hívjuk fel a figyelmüket arra, hogy a kukó törékeny. Ismertessünk meg "
        "velük tavaszi dalokat és húsvéti mondókákat. A zenei képességfejlesztés "
        "közben ismerkedjenek a metronómmal, amellyel az életkoruknak megfelelően "
        "tapasztalhatják meg a gyors és a lassú különbségét. A középsősöknél lassú és "
        "gyors járással is érzékeltethetjük a fogalompárt. A játék jellegű "
        "főgyakorlatok fejlesszék a mozgásos képességeiket, a mozgásügyességüket és a "
        "mozgáskultúrájukat. Mindvégig érvényesüljön a játékosság elve."
    ),
    "c33815c5": (
        "A közös munkában gömbölyítjük a krepp-papírt. Törekedjenek arra, hogy maguk "
        "találjanak ki valamilyen kompozíciót. Ismertessünk meg velük tavaszi dalokat "
        "és húsvéti mondókákat. A zenei képességfejlesztés közben ismerkedjenek a "
        "metronómmal, amellyel az életkoruknak megfelelően tapasztalhatják meg a "
        "gyors és a lassú különbségét. A nagycsoportosokkal mondókán, dalos játékon, "
        "mozgással is gyakoroltatjuk. A játék jellegű főgyakorlatok tegyék lehetővé a "
        "differenciált, összetett fejlesztést. Adjunk megfelelő eszközt ahhoz, hogy "
        "minél igényesebben végezhessék a feladatokat."
    ),

    # ================= MÁJUS =================
    # --- Anyák napja, család (anyak_napja_csalad, _v1, _v2) ---
    "db76adb4": (
        "Teremtsünk meghitt hangulatot, és hangoljuk rá őket érzelmileg az ünnepre. "
        "Fényképeket nézegetve mutassák be a családjukat. Szerezzük be az ajándék "
        "elkészítéséhez szükséges eszközöket. A számfogalom kialakulásához "
        "gyakorolják a számlálást. Állapítsák meg, hány főből áll a család. A "
        "behozott fotókról számlálják meg a családtagokat. A mese és a versek "
        "tudatosítsák bennük az édesanyák és a nagymamák megbecsülését, szeretetét és "
        "tiszteletét."
    ),
    "56479aa4": (
        "A készülődés jó alkalmat ad arra, hogy erősödjön a családon belüli érzelmi "
        "kötődés, az anya és a gyermek szeretetkapcsolata, és fejlődjön a szeretet "
        "képessége. Beszélgessünk arról, milyenek voltak kiskorukban. Készítsünk "
        "tablót a falra. A tabló készítése közben állapítsák meg, melyik családtag a "
        "kisebb, a nagyobb és ki ugyanakkora. Próbálkozzanak becsléssel és különböző "
        "mérőegységekkel. A mese és a versek tudatosítsák bennük az édesanyák és a "
        "nagymamák megbecsülését, szeretetét és tiszteletét. Törekedjenek arra, hogy "
        "a verseket érzéssel, magabiztosan, természetes hangerővel mondják el."
    ),
    "38b6039d": (
        "A készülődés jó alkalmat ad arra, hogy erősödjön a családon belüli érzelmi "
        "kötődés, az anya és a gyermek szeretetkapcsolata, és fejlődjön a szeretet "
        "képessége. Készítsenek ajándékot az anyukáknak és a nagymamáknak. A "
        "számfogalom kialakulásához gyakorolják a számlálást. Számlálják meg az anyák "
        "napi ajándékokat. Számlálják meg, kinek jön el a nagymamája vagy a "
        "keresztanyja. A mese és a versek tudatosítsák bennük az édesanyák és a "
        "nagymamák megbecsülését, szeretetét és tiszteletét. Törekedjenek arra, hogy "
        "a verseket érzéssel, magabiztosan, természetes hangerővel mondják el. A "
        "versek érzékeltessék, mennyi mindent köszönhetünk az édesanyánknak."
    ),
    "f01fbff8": (
        "Az ajándék készítése alakítsa az érzelemvilágukat. Törekedjenek esztétikus "
        "ajándékra. Az óvodáskorú gyermek mozgása egyszerű és természetes, ezért a "
        "zenei képességek fejlesztése közben is játékos tapasztalatszerzést adjunk. "
        "Járjanak különböző alakzatokban, egyszerű, ismétlődő mozdulatokkal. A "
        "hatalmas mozgásigényükből fakadó érdeklődést a soron következő feladatra, a "
        "függésre lábemeléssel és a lajhárfüggésre kell irányítanunk, és tartósan "
        "fenn kell tartanunk."
    ),
    "a60428b4": (
        "Az ajándék készítése alakítsa az érzelemvilágukat. Törekedjenek esztétikus "
        "ajándékra. A tánclépések igazodjanak a kicsik testi fejlettségéhez, "
        "mozgáskoordinációjához és értelmi képességeihez. Tánc közben igyekezzünk "
        "változatos térformát kialakítani. A testgyakorlatokban, a lábemeléses "
        "függésben és a lajhárfüggésben, valamint a játékban a figyelmük és az "
        "érdeklődésük felkeltésével és ébren tartásával biztosíthatjuk a tevékeny "
        "részvételüket."
    ),
    "a926af95": (
        "Az ékszertartót saját ötlet alapján, önállóan díszítsék. Az óvodapedagógus "
        "javasolja, hogy az ajándék készítésekor az édesanyjuk kedvenc színeit "
        "használják. A gyermektánc alapját az óvodában használt játékos mozdulatok "
        "adják. A szabályos, jól kialakított alakzatok fejlesztik a tér- és a "
        "formaérzéküket. Az alapvető testi képességek óvodáskorban különböző szintűek, "
        "és eltérő ütemben fejlődnek."
    ),

    # --- Foglalkozások, mesterségek (foglalkozasok, _v1, _v2) ---
    "7c10ff35": (
        "Keltsük fel az érdeklődésüket, és teremtsük meg a játékos tanulás "
        "feltételeit. Beszéljük meg, mit szeretnének megtudni. A beszélgetésből és a "
        "válaszaikból derüljön ki, milyen kérdések a legfontosabbak nekik ebben a "
        "témában. Matematikai képességfejlesztő játékokkal válogassanak tárgyakat és "
        "személyeket ábrázoló képeket, és rendeljék őket foglalkozásokhoz, "
        "mesterségekhez. A mesét a foglalkozások illusztrálásával dolgozzuk fel. A "
        "mese kapcsán bővüljön a tudásuk a mesterségekről. Legyenek képesek megnevezni "
        "az alapvető foglalkozásokat."
    ),
    "cf6ca58f": (
        "Keltsük fel a kíváncsiságukat a körülöttük lévő világ iránt. Beszéljük meg, "
        "mivel foglalkoznak a szüleik. Játékos képességfejlesztő feladatokkal "
        "ismerjék fel a munkaeszközöket és a szerszámokat. Matematikai "
        "képességfejlesztő játékokban azonosítsák és párosítsák a foglalkozásokról "
        "készült árnyképeket az eredetivel. A mesét fakanálbábbal dolgozzuk fel. A "
        "mese kapcsán bővüljön a tudásuk a mesterségekről. Adjunk módot arra, hogy "
        "megnevezzék a szüleik foglalkozását, és beszélgessünk arról, mik lesznek, ha "
        "nagyok lesznek."
    ),
    "62fc5ac1": (
        "Keltsük fel a kíváncsiságukat a mesterségek iránt, adjunk módot a "
        "kipróbálásukra, és szerettessük meg velük őket. Matematikai játékokkal "
        "gyakorolják a halmazképzést, egyénre szabott fejlesztéssel. Azonosítsanak és "
        "alkossanak halmazokat többféle szempont szerint, például gyűjtőfogalmak "
        "mentén: foglalkozások, szerszámok. A mesét a főbb jelenetek illusztrálásával "
        "dolgozzuk fel. A mese kapcsán bővüljön a tudásuk a mesterségekről. A mese "
        "éreztesse meg velük a magyar nyelv szépségét és árnyaltságát."
    ),
    "d3e2f01f": (
        "Ugyanannak a technikának két változatával erősítsük a kedvüket és az "
        "érdeklődésüket a tevékenység iránt. Törekedjenek a tiszta munkavégzésre. "
        "Nyomdázzanak magabiztosan, és ne áztassák át a papírt. A ritmusérzék "
        "fejlesztésének célja az érzékelési készség megalapozása, a spontán "
        "mozgásösztönök összerendezése és a mozgás harmonikussá tétele. Legyenek "
        "képesek a támaszugrás egyes szakaszait lendületesen, pontosan végrehajtani. "
        "Tapasztalják meg a változatos eszközökkel végzett mozgást."
    ),
    "d91c81c0": (
        "Gyakorolják egy tárgy elkészítését. Kis csoportban, a kreativitásukra "
        "támaszkodva valósítsák meg az ötleteiket, az óvodapedagógus tevékeny "
        "segítségével. Adjunk olyan tevékenységi formákat, amelyek elsajátítása "
        "nélkülözhetetlen a ritmuselemek megfigyeléséhez és tudatosításához. "
        "Különböző mozgásos képességfejlesztő játékokkal sajátítsák el a támasz- és a "
        "sorozatugrás technikáját. Tapasztalják meg a változatos eszközökkel végzett "
        "mozgást."
    ),
    "2e682f4a": (
        "Törekedjenek arra, hogy kitöltsék az A/4-es rajzlapot. Bátran használják a "
        "színeket, ügyeljenek az arányokra és a részletek megjelenítésére. Bánjanak "
        "magabiztosan a pasztellkrétával. Hangoztassák a dalok ritmusát éneklés "
        "közben. A zenei képességfejlesztésben előbb az óvodapedagógus, később a "
        "gyerekek által kitalált ritmust tapsolják vissza. Tapasztalják meg a "
        "változatos eszközökkel végzett mozgást. Legyenek képesek a támaszugrás egyes "
        "szakaszait lendületesen, pontosan végrehajtani. Különböző mozgásos "
        "képességfejlesztő játékokkal sajátítsák el a támasz- és a sorozatugrás "
        "technikáját."
    ),

    # --- Gyermeknap (gyermeknap_v1, _v2) ---
    "59dfeb30": (
        "A gyermeknap az óvoda egyik legfontosabb ünnepe, ezért szervezzünk hozzá "
        "nagyszabású rendezvényt a szülők és a gyerekek részvételével. Keltsük fel a "
        "matematikai érdeklődésüket, és játékos formában fedeztessük fel velük az "
        "összefüggéseket. A csoportba járó gyerekeken végezzenek nehezebb és könnyebb "
        "összehasonlításokat. A mesét kesztyűbábbal dolgozzuk fel. A mese alakítsa a "
        "humorérzéküket. Beszéljük meg közösen a mese tanulságát. A mese éreztesse "
        "meg velük, milyen tulajdonság a mohóság."
    ),
    "2558bc11": (
        "A gyerekekkel közösen elevenítsük fel a kedvenc játékaikat, és készítsük el "
        "hozzájuk az eszközöket és a kellékeket. Díszítsük fel velük együtt az udvart "
        "az előre elkészített díszekkel. Játékosan, a gyerekek igényeihez és "
        "ötleteihez igazodva fedezzék fel a mennyiségi és a formai összefüggéseket. "
        "Alkossanak halmazokat többféle szempont szerint, és tudatosuljon bennük maga "
        "a fogalom. A gyerekeken, a külső tulajdonságaik alapján ismerjenek fel "
        "azonosságot és különbséget. A mesét filcbábbal dolgozzuk fel. Beszéljük meg "
        "közösen a mese tanulságát. A mese ismertesse meg a levendula fő jellemzőit."
    ),
    "9ac1939b": (
        "A nagycsoportosok segítségével szervezzünk érdekes, vidám játékokat a "
        "gyermeknapra. Találjunk ki játékokat, és készítsük elő az eszközöket. A "
        "vendégek fogadásához süssünk süteményt, és vásároljuk meg a hozzávalókat. A "
        "gyerekekkel közösen készítsünk plakátot és meghívót a rendezvényre. "
        "Érzékeljék a mennyiségi különbségeket, fejlődjön az összehasonlító "
        "képességük, és ismerjék fel az azonosságokat és a különbségeket. A plakát és "
        "a meghívó készítése közben gyakorolják az alapirányokat, a jobbot és a "
        "balt. A mesét a virágok képeinek bemutatásával dolgozzuk fel. A tevékenység "
        "közben bővüljön a tudásuk a virágokról. A mese alakítsa az érzelmi életüket "
        "és a szép iránti fogékonyságukat."
    ),
    "ecb5b318": (
        "Készítsünk a gyerekekkel közösen játékeszközt. Gyakorolják egy tárgy "
        "megfestését. Díszítsenek ecsettel, több színnel, a saját elképzelésük "
        "szerint. Énekléssel és mondókázással teremtsünk vidám hangulatot. Formáljuk "
        "az esztétikai érzéküket. Szilárdítsuk meg a korábbi dalokat és mondókákat, és "
        "hangoljuk össze az éneket a mozgással. A közvetlen cél a természetes "
        "mozgáskészségek fejlesztése alapmozgásokkal és mozgásos játékokkal. A testi "
        "képességeket természetes mozgásgyakorlatokkal és labdajátékokkal fejlesztjük."
    ),
    "faf505fe": (
        "Készítsünk a gyerekekkel közösen játékeszközt. Mintázzanak színes papírból "
        "kivágott formákkal. Törekedjenek esztétikus munkára. A közös játék segítse a "
        "társas készségeiket, és formálja a zenei ízlésüket. Szilárdítsuk meg a "
        "korábban tanult játékot. Alakítsunk ritmuszenekart különböző hangszerekkel. "
        "Zenés műsorral kedveskedjünk az óvodába látogató vendégeknek. Az egészséges "
        "életmód jegyében elégítsük ki a mozgásigényüket. Alakuljon ki bennük a "
        "rendszeres mozgás és a labdajátékok szeretete. A testi képességeket "
        "természetes mozgásgyakorlatokkal fejlesztjük."
    ),
    "dc841b44": (
        "Az óvodapedagógus javaslatára beszéljék meg, majd vázlatban készítsék el a "
        "tervezett munkát. Együttműködve osszák fel egymás között a festendő felületet "
        "és a mintát. Törekedjenek arra, hogy ötlettel és tettel is segítsék egymást. "
        "Tökéletesítsük a térformákat és a kartartásokat, fejlesszük a hallásukat és "
        "a ritmusérzéküket. Alakítsunk ritmuszenekart különböző hangszerekkel. Zenés "
        "műsorral kedveskedjünk az óvodába látogató vendégeknek. Segítsük a "
        "mozgásszerveik fejlődését, a helyes testtartás kialakulását és a tartáshibák "
        "megelőzését. Alakuljon ki bennük a labdajátékok szeretete, és ismerkedjenek "
        "a dobásformákkal."
    ),

    # --- Közlekedés (kozlekedes, _v1, _v2) ---
    "d2b88a7b": (
        "Tudatosítsuk és szilárdítsuk meg a helyes gyalogos és kerékpáros "
        "közlekedést. A nagy kerékpártúrán magabiztosan vegyenek részt. Ismerjék meg "
        "a rendőr és a vasutas munkáját. Gyakorolják a gyalogos, a kerékpáros és a "
        "tömegközlekedést. Az album készítésekor csoportosítsák a közlekedési "
        "eszközöket többféle szempont szerint. Hasonlítsák össze a halmazok "
        "számosságát a több, a kevesebb és az ugyanannyi viszonyával. A mesét a főbb "
        "jelenetek illusztrálásával dolgozzuk fel. Mesehallgatás után beszéljük meg "
        "közösen a szereplők tulajdonságait és a mese tanulságát. Tudatosítsuk, hogy "
        "az irigység és a fennhéjázás nem jó tulajdonság."
    ),
    "88f4b29b": (
        "Tudatosítsuk és szilárdítsuk meg a helyes gyalogos és kerékpáros "
        "közlekedést. A nagy kerékpártúrán magabiztosan vegyenek részt. Ismerjék meg "
        "a rendőr és a vasutas munkáját. Kis csoportokban közlekedjünk a településen "
        "gyalog, a nagyokkal pedig kerékpárral. Tudatosítsuk és szilárdítsuk meg a "
        "szabályokat. A különböző közlekedési eszközökkel tett kirándulások és a "
        "képességfejlesztő játékok adjanak matematikai tapasztalatot. Közlekedés "
        "közben fedeztessük fel velük a térbeli viszonyokat. A vonatos kiránduláson "
        "gyakorolják a tő- és a sorszámlálást. A mesét bábbal dolgozzuk fel. "
        "Törekedjenek csendes, figyelmes mesehallgatásra. Neveljük őket jó ízlésű, "
        "értő hallgatóvá. Bátran mondják el a véleményüket a mese kapcsán."
    ),
    "19da6332": (
        "Tudatosítsuk és szilárdítsuk meg a helyes gyalogos és kerékpáros "
        "közlekedést. A nagy kerékpártúrán magabiztosan vegyenek részt. Ismerjék meg "
        "a rendőr és a vasutas munkáját. Kis csoportokban közlekedjünk a településen "
        "gyalog, a nagyokkal pedig kerékpárral. Tudatosítsuk és szilárdítsuk meg a "
        "szabályokat. A különböző közlekedési eszközökkel tett kirándulások és a "
        "képességfejlesztő játékok adjanak matematikai tapasztalatot. Közlekedés "
        "közben fedeztessük fel velük a térbeli viszonyokat. A vonatos kiránduláson "
        "gyakorolják a tő- és a sorszámlálást. A mesét diafilm segítségével dolgozzuk "
        "fel. A mese ismertesse meg és tudatosítsa a helyes közlekedést. "
        "Beszélgessünk a jelzőlámpa színeinek jelentéséről, és arról, melyik színnél "
        "mit kell tenni."
    ),
    "0850cc2f": (
        "Készítsünk a gyerekekkel közösen játékeszközt. Fokozzuk a kedvüket ahhoz, "
        "hogy minél szebb, kidolgozottabb úttestet készítsenek, hiszen később "
        "játszani fognak vele. Fejlődjön az esztétikai érzékük és a zenei ízlésük. "
        "Tanuljanak új énekes játékot, és szilárdítsák meg a korábban tanultat. "
        "Mozgassák a testrészeiket, és érzékeljék a tárgy és a test viszonyát, "
        "alakuljon az oldaliságuk. Tapasztalják meg, hol helyezkedik el a testük a "
        "térben."
    ),
    "72b19632": (
        "Gyakorolják egy tárgy elkészítését. Törekedjenek a részletek megjelenítésére, "
        "és bátran kérjenek további eszközt a saját ötleteik megvalósításához. Munka "
        "közben ismerjék el egymás munkáját. Az éneklés örömteli legyen számukra. "
        "Keltsük fel az érdeklődésüket a zene iránt, és alakítsuk a fogékonyságukat. "
        "A testrészek mozgatásával és a testzónák tudatosításával fejlesszük a "
        "testsémájukat. A változó irányú mozgás fejlessze a térérzékelésüket."
    ),
    "8c721909": (
        "A kreativitásukra támaszkodva készítsenek minél egyedibb járműveket színes "
        "papírból, filctollal, ollóval és ragasztóval. Alakuljon a zenei tudatuk, és "
        "éljék át a zene varázsát éneklés és mondókázás közben. Erősödjön a közösségi "
        "érzésük a dalos játékok együttes élményében. Mozgassák a testrészeiket, és "
        "érzékeljék a tárgy és a test viszonyát, alakuljon az oldaliságuk. "
        "Tapasztalják meg, hol helyezkedik el a testük a térben."
    ),

    # --- Méhek világnapja (mehek_napja_v1, _v2) ---
    "4ede8d2b": (
        "A közös tevékenységben ismerkedjenek a méz tulajdonságaival. Kóstoljanak "
        "többféle mézet az óvodába látogató méhész segítségével, aki több fajtát is "
        "hozott. A számfogalom kialakulásához gyakorolják a számlálást. Számláljanak "
        "meg annyi méhecskét, amennyit csak tudnak. A mesét hurkapálca-bábbal "
        "dolgozzuk fel. A mese ismertesse meg a méhek életmódját. Hallgassák "
        "figyelmesen végig a mesét, és közben fejlődjön a belső képi világuk."
    ),
    "7b15f6b6": (
        "Szerezzenek közvetlen tapasztalatot a szorgos méhek munkájáról egy "
        "méhészetben, ahol megismerhetik a méz fajtáit és a méhész feladatait. A "
        "játék az a tevékenység, amely a gyermek minden igényét és szükségletét ki "
        "tudja elégíteni. Játékos keretek között fejlesszük a rész-egész észlelést. A "
        "mesét filcbábbal dolgozzuk fel. Beszéljük meg közösen a mese tanulságát. "
        "Milyen tulajdonságai vannak a két szereplőnek? Gyűjtsük össze a jó és a "
        "rossz vonásokat. A szereplőkkel való azonosulás alakítsa az együttérzésüket."
    ),
    "e4c6a77e": (
        "Látogassunk el egy méhészetbe, ahol a természetes gyermeki kíváncsiságuk "
        "felébred, és a közvetlen környezet megismerésén keresztül tapasztalatot is "
        "szereznek. Az élményt adó tevékenységek megtervezése ad esélyt arra, hogy a "
        "megtapasztalható matematikai tartalom vonzó formában kerüljön eléjük; a "
        "méhészetben készült képekkel fejlesszük a rész-egész észlelést. A mesét "
        "mézeskaláccsal és kesztyűbábbal dolgozzuk fel. Beszéljük meg közösen a mese "
        "tanulságát. Milyen tulajdonságai vannak a két szereplőnek? Gyűjtsük össze a "
        "jó és a rossz vonásokat. Kerek, egész mondatokban, bátran mondják el a "
        "véleményüket. A szereplőkkel való azonosulás alakítsa az együttérzésüket."
    ),
    "ddce7f92": (
        "Ébresszük fel az alkotókedvüket és a kreativitásukat. Fessenek magabiztosan, "
        "és törekedjenek arra, hogy a vonalon belül maradjanak. Figyeljenek arra, hogy "
        "ne áztassák el a papírt. A dallamvisszhang játékban a gyermek megérzi a "
        "zenei építőelemek egységét, ezzel alapfokon fejlődik a zenei formaérzéke. A "
        "kitalált szöveg legyen játékos és az alkalomhoz illő. A játék jellegű "
        "főgyakorlatok fejlesszék a mozgásos képességeiket, a mozgásügyességüket és a "
        "mozgáskultúrájukat. Mindvégig érvényesüljön a játékosság elve."
    ),
    "573afaa9": (
        "Ismertessük meg velük a fonalragasztást mint új technikát. Törekedjenek minél "
        "fantáziadúsabb szárnyak létrehozására és esztétikus munkára. A kitalált "
        "szöveg legyen játékos és az alkalomhoz illő. A dallamvisszhang játékban a "
        "gyermek megérzi a zenei építőelemek egységét, ezzel alapfokon fejlődik a "
        "zenei formaérzéke. Törekedjünk a test általános fejlesztésére, és adjunk "
        "elegendő időt az egyes képességek kialakulásához. Mindvégig érvényesüljön a "
        "játékosság elve."
    ),
    "5b1832b1": (
        "A kreativitásukra támaszkodva tervezzék meg és fessék le a témához illő "
        "kompozíciót. Törekedjenek a tiszta munkavégzésre. A visszhangéneklést az "
        "teszi érdekesebbé, hogy már nemcsak szövege és ritmusa, hanem dallama is "
        "van. A ritmikai változatok mellett most dallamfordulatokkal bővítjük a "
        "lehetőségeket. A kitalált szöveg legyen játékos és az alkalomhoz illő. A "
        "játék jellegű főgyakorlatok tegyék lehetővé a differenciált, összetett "
        "fejlesztést. Adjunk megfelelő eszközt ahhoz, hogy minél igényesebben "
        "végezhessék a feladatokat."
    ),
}


# Néhány mondatot önkéntelenül ugyanúgy fogalmaztam meg, ahogy a kiadványban áll.
# Ezek elég hosszúak ahhoz, hogy egyéni megfogalmazásnak számítsanak, ezért itt
# cseréljük őket. A rövid szakkifejezések („számfogalom alakítása", „Törekedjenek
# a tiszta munkavégzésre") maradnak: azok a szakma közös szókincséhez tartoznak,
# nem egyéni-eredeti szövegek, így nem is állnak szerzői jogi védelem alatt.
FINOMITAS: dict[str, str] = {
    "Tudatosodjon bennük, hogy a pontos, odafigyelő munkának mindig szép eredménye lesz.":
        "Lássák meg, hogy a türelemmel, figyelmesen elkészített munka a végén szép lesz.",
    "Mondókákon keresztül, irányított mozdulatokkal fejlesztjük a metrumérzéket.":
        "A metrumérzéket mondókázás közben, vezetett mozdulatokkal alakítjuk.",
    "Tudatosodjon bennük a jó és a rossz, a követendő és az elutasítandó példa.":
        "Váljon világossá előttük, mi a helyes és mi a helytelen, melyik tettet érdemes követni.",
    "Törekedjenek a virágformához szükséges vonal menti vágásra.":
        "A virág formájához igyekezzenek pontosan a vonalat követve vágni.",
    "Törekedjenek arra, hogy ne áztassák el a csomagolópapírt.":
        "Ügyeljenek arra, hogy a csomagolópapír ne legyen túl nedves.",
    "Csodálkozzanak rá az élettel teli természet szépségére.":
        "Vegyék észre, milyen szép az ébredő, élettel teli természet.",
    "Törekedjenek arra, hogy bátran használják a színeket.":
        "Merjenek bátran nyúlni a színekhez.",
    "A nagy kerékpártúrán magabiztosan vegyenek részt.":
        "Vegyenek részt biztonságosan a nagy kerékpártúrán.",
}

for _kulcs, _ertek in list(UJ_SZOVEG.items()):
    for _regi, _uj in FINOMITAS.items():
        if _regi in _ertek:
            _ertek = _ertek.replace(_regi, _uj)
    UJ_SZOVEG[_kulcs] = _ertek


# A PDF-kinyerés a sorvégi elválasztásnál szóközt hagyott a szó közepén. Ezek a
# `kepessegfejlesztesKorcsoport` felsorolásokban maradtak bent, amelyeket nem
# fogalmaztunk újra (azok szakkifejezés-listák, nem összefüggő szövegek).
# FIGYELEM: csak olyan párt szabad ide venni, ami valóban egy szó — az „az ok"
# például jogos szókapcsolat, nem elgépelés.
TORT_SZAVAK: dict[str, str] = {
    "egyen súlyérzék": "egyensúlyérzék",
    "foga lom": "fogalom",
    "szám lálás": "számlálás",
    "er kölcsi": "erkölcsi",
    "meglát tatása": "megláttatása",
    "emlé kezet": "emlékezet",
    "em lékezet": "emlékezet",
    "szókincs bővítés": "szókincsbővítés",
    "fi gyelem": "figyelem",
    "megfigyelőké pesség": "megfigyelőképesség",
    "ész lelés": "észlelés",
    "test tartás": "testtartás",
    "helyes test tartás": "helyes testtartás",
}
