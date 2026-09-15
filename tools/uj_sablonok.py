# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadványból átvett KILENC új heti téma sablonjainak létrehozása.

A kiadvány 36 hete közül 27 a programunk meglévő témáira illik, kilenc viszont
olyan hetet dolgoz fel, ami eddig hiányzott:

  őszi zöldségek · Mihály-napi vásár · őszi kerti munkálatok · madárvonulás ·
  újévi népszokások · évszakok körforgása · napszakok és napirend ·
  fény és árnyék, mackók · Balázs-nap és iskolába készülés

Itt az öt NEM irodalmi terület tartalma, a cél/feladat és a metaadatok
szerepelnek. A Verselés, mesélés és az Ének, zene rovatot utána a
`tools/irodalom_beepites.py` tölti fel a korpuszból (abban már benne van a
kiadvány teljes irodalmi anyaga).

Futtatás: python tools/uj_sablonok.py [--dry-run]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed"

# Az iskola-előkészítő bontás minden sablonban ugyanaz a szerkezet.
IE = {
    "kulso_vilag": "Megfigyelőképesség\nSzókincs\nÉrzékszervi tapasztalás\nOk-okozati összefüggések",
    "verseles_meseles": "Szövegértés\nBeszédkészség\nHallási figyelem\nAuditív emlékezet",
    "rajzolas_festes": "Finommotorika\nSzem-kéz koordináció\nEszközhasználat\nKreatív gondolkodás",
    "enek_zene": "Figyelem\nRitmusérzék\nEmlékezet\nSzabálykövetés",
    "mozgas": "Nagymozgások\nTérbeli tájékozódás\nSzabálytudat\nEgyüttműködés",
}

UJ_SABLONOK = [
    {
        "azonosito": "osz_zoldsegek_v1",
        "cim": "Zöld paradicsom — őszi zöldségek",
        "kategoria": "ovodai",
        "javasoltHonap": "9",
        "javasoltSorrend": "3",
        "tema": "Őszi zöldségek, savanyítás, éléskamra",
        "cel": "A gyermekek ismerjék meg az ősz zöldségeit, tudják azokat megnevezni, "
               "megkülönböztetni a gyümölcsöktől. Szerezzenek tapasztalatot arról, "
               "mi terem a földben és mi a föld felett.",
        "feladat": "Valódi zöldségek bevitele, tapintása, szagolása, kóstolása. "
                   "A zöldségek felhasználásának (leves, saláta, savanyúság) bemutatása, "
                   "közös zöldségsaláta készítése.",
        "teruletek": {
            "kulso_vilag": "Ismertebb őszi zöldségek: paradicsom, paprika, sárgarépa, "
                           "petrezselyem, tök, káposzta, hagyma\nFöld alatt és föld felett "
                           "termő zöldségek megkülönböztetése\nZöldség és gyümölcs "
                           "különbsége\nSavanyítás, télre eltevés: mi kerül a kamrába?\n"
                           "A zöldségek szerepe az egészséges táplálkozásban",
            "matematika": "Halmazalkotás: föld alatt / föld felett termő zöldségek\n"
                          "Számlálás: hány szem paradicsom van a tálban\n"
                          "Sorbarendezés méret szerint: kicsi–nagyobb–legnagyobb sárgarépa\n"
                          "Összehasonlítás: hosszabb–rövidebb, vastagabb–vékonyabb\n"
                          "Színek szerinti csoportosítás",
            "rajzolas_festes": "Zöldségnyomat: kettévágott paprika, sárgarépa festékbe mártva\n"
                               "Zöldségek mintázása gyurmából\nKollázs: zöldségeskert ragasztása "
                               "színes papírból\nZöldséges kosár festése temperával",
            "hallas_ritmus": "Ritmus visszatapsolás: zöldségnevek ritmusa (pap-ri-ka, tök, "
                             "sár-ga-ré-pa)\nHalk-hangos megkülönböztetése",
            "mozgas": "Tornatermi tevékenységek:\nZöldségszedés-utánzás: guggolásból felállás, "
                      "nyújtózás\nTalicskázás párban a „termés” elszállítása\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Zöldségválogató futójáték két kosárhoz\nKapálás, gereblyézés utánzása",
        },
        "kepessegfejlesztes": "megfigyelőképesség, szókincsbővítés, érzékszervi tapasztalás, "
                              "halmazalkotás, számfogalom, finommotorika, egészségtudatosság",
        "eszkozok": "friss zöldségek, tálak, kés (felnőtt használatra), gyurma, tempera, "
                    "ecset, rajzlap, színes papír, ragasztó, kosarak",
    },
    {
        "azonosito": "mihaly_nap_v1",
        "cim": "Mihály-napi vásár",
        "kategoria": "nephagyomany",
        "javasoltHonap": "9",
        "javasoltSorrend": "4",
        "tema": "Mihály-nap, vásár, pásztorok, állatbehajtás",
        "cel": "A gyermekek ismerkedjenek meg a Mihály-napi vásár hagyományával és a "
               "pásztorok életével. Éljék át a vásári forgatag, az adásvétel játékos "
               "élményét.",
        "feladat": "Vásári helyzet megteremtése a csoportszobában: portékák, árusok, vevők. "
                   "A Mihály-napi néphagyomány (állatbehajtás, a gazdasági év fordulója) "
                   "életkorhoz mért bemutatása.",
        "teruletek": {
            "kulso_vilag": "Mihály-nap (szeptember 29.): a pásztorok behajtják a jószágot a "
                           "legelőről\nA vásár: mit árulnak, ki az árus, ki a vevő\n"
                           "Vásári portékák: mézeskalács, fajáték, kosár, cserépedény\n"
                           "Pásztorok élete, a nyáj őrzése\nA néphit szerint Mihály-nap után "
                           "már nem szólal meg a fecske",
            "matematika": "Vásárlás játék: pénzérmék számlálása, adás-vétel\n"
                          "Több-kevesebb: melyik árusnál van több portéka\n"
                          "Párosítás: portéka és ára\nHalmazalkotás a vásári áruk fajtái szerint",
            "rajzolas_festes": "Mézeskalács-forma mintázása sógyurmából, díszítése\n"
                               "Vásári portékák rajzolása, kivágása a boltos játékhoz\n"
                               "Kosárfonás papírcsíkokból\nPásztorbot, tarisznya készítése",
            "hallas_ritmus": "Vásári kikiáltó mondókák ritmusa\nHangerő-játék: halk és hangos "
                             "kínálás",
            "mozgas": "Tornatermi tevékenységek:\nTerelő-játék: a „nyáj” terelése akadályok "
                      "között\nZsákban ugrálás, vásári ügyességi próbák\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Adok-veszek szerepjáték mozgással\nKörbejárás, vásári séta",
        },
        "kepessegfejlesztes": "szókincsbővítés, szerepvállalás, számfogalom, közösségi érzés, "
                              "hagyományismeret, finommotorika, együttműködés",
        "eszkozok": "sógyurma, festék, kosarak, játékpénz, kendők, terítők, portékák, "
                    "képek a vásárról és a pásztorokról",
    },
    {
        "azonosito": "oszi_kerti_munkak_v1",
        "cim": "Rica, rica kukorica — őszi kerti munkálatok",
        "kategoria": "ovodai",
        "javasoltHonap": "10",
        "javasoltSorrend": "3",
        "tema": "Kukorica, betakarítás, őszi kerti munka",
        "cel": "A gyermekek ismerjék meg az őszi kerti munkákat és a kukorica útját a "
               "tövétől a morzsolásig. Szerezzenek örömteli tapasztalatot a saját kezű "
               "munkavégzésben.",
        "feladat": "Valódi kerti munka lehetőségének megteremtése: levélgereblyézés, "
                   "ágyás rendbetétele, kukoricamorzsolás. A munkaeszközök biztonságos "
                   "használatának megtanítása.",
        "teruletek": {
            "kulso_vilag": "A kukorica részei: szár, levél, cső, csuhé, szem, bajusz\n"
                           "Mi készül belőle: pattogatott kukorica, dara, liszt, takarmány\n"
                           "Őszi kerti munkák: levélgereblyézés, ágyás felásása, "
                           "hagyma ültetése\nMunkaeszközök: gereblye, ásó, kapa, talicska, "
                           "kesztyű\nA komposzt: a lehullott levél sorsa",
            "matematika": "Számlálás: hány szem van egy sorban a csövön\n"
                          "Becslés és mérés: mennyi szem fér egy pohárba\n"
                          "Sorozatok kukoricaszemekből, színek váltakozásával\n"
                          "Halmazalkotás: méret szerinti válogatás",
            "rajzolas_festes": "Kukoricacső nyomdázása festékbe forgatva\n"
                               "Csuhébaba készítése\nKukoricaszem-ragasztás körberajzolt formára\n"
                               "Őszi kert rajzolása zsírkrétával",
            "hallas_ritmus": "Ritmus visszatapsolás: ku-ko-ri-ca, cső, mor-zsol\n"
                             "Hangfelismerés: kukoricaszem-csörgő hangja",
            "mozgas": "Tornatermi tevékenységek:\nGereblyézés, kapálás utánzó mozgása\n"
                      "Talicskázás párban, karerősítés\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Levélgyűjtő verseny\nKukoricaszem-szedő ügyességi játék csipesszel",
        },
        "kepessegfejlesztes": "munkára nevelés, finommotorika, számfogalom, becslés, "
                              "kitartás, együttműködés, szókincsbővítés",
        "eszkozok": "kukoricacsövek, csuhé, gereblye, kis ásó, talicska, csipesz, poharak, "
                    "tempera, rajzlap, ragasztó",
    },
    {
        "azonosito": "madarvonulas_v1",
        "cim": "Gólya, gólya, gilice — madárvonulás",
        "kategoria": "ovodai",
        "javasoltHonap": "11",
        "javasoltSorrend": "4",
        "tema": "Költöző és itthon telelő madarak",
        "cel": "A gyermekek értsék meg, miért repülnek el ősszel egyes madarak, és melyek "
               "maradnak itthon. Alakuljon bennük érdeklődés és óvó magatartás a madarak "
               "iránt.",
        "feladat": "Madármegfigyelés az udvaron és képeken; a költöző és a telelő madarak "
                   "megkülönböztetése. A vonulás okának (táplálékhiány, hideg) egyszerű "
                   "megértetése.",
        "teruletek": {
            "kulso_vilag": "Költöző madarak: fecske, gólya, vadlúd, seregély\n"
                           "Itthon telelő madarak: veréb, cinege, feketerigó, harkály\n"
                           "Miért repülnek el? — nincs elég rovar, hideg jön\n"
                           "A vonulás: csapatban, V alakban, hosszú úton\n"
                           "Hogyan segíthetjük a maradókat? — az etető előkészítése",
            "matematika": "Számlálás: hány madár ül a dróton\nHalmazalkotás: elrepülő és "
                          "maradó madarak szétválogatása képekkel\n"
                          "Alakzat: V betű kirakása testtel, pálcikákkal\n"
                          "Több-kevesebb összehasonlítása",
            "rajzolas_festes": "Fecske hajtogatása papírból\nMadárraj festése ujjlenyomattal\n"
                               "Madáretető készítése tejesdobozból\nToll-lenyomat, "
                               "tollrajzolás vízfestékkel",
            "hallas_ritmus": "Madárhangok felismerése hangfelvételről\n"
                             "Ritmus visszatapsolás: gó-lya, fecs-ke, ci-ne-ge",
            "mozgas": "Tornatermi tevékenységek:\nMadárrepülés-utánzás: karlendítés, "
                      "lábujjhegyen futás\nFészekbe ugrás: karikába szökdelés\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Költöző madarak fogójáték\nV alakú vonulás közös futással",
        },
        "kepessegfejlesztes": "megfigyelőképesség, szókincsbővítés, ok-okozati összefüggések, "
                              "halmazalkotás, hallási figyelem, nagymozgások, természetszeretet",
        "eszkozok": "madárképek, hangfelvétel madárhangokról, távcső, tejesdoboz, madáreleség, "
                    "színes papír, vízfesték, karikák",
    },
    {
        "azonosito": "ujevi_nepszokasok_v1",
        "cim": "Új év, új esztendő — újévi népszokások",
        "kategoria": "nephagyomany",
        "javasoltHonap": "1",
        "javasoltSorrend": "1",
        "tema": "Évforduló, köszöntők, szerencsehozó szokások",
        "cel": "A gyermekek ismerkedjenek meg az újév köszöntésének hagyományaival, és "
               "értsék meg, hogy egy év véget ért, egy másik elkezdődött. Éljék át a jókívánság "
               "adásának örömét.",
        "feladat": "Újévi köszöntők, kántálók megtanítása; a szerencsehozó szokások "
                   "(malac, patkó, lencse) játékos bemutatása. Az évkezdés jelentőségének "
                   "megbeszélése a gyermekek élményei alapján.",
        "teruletek": {
            "kulso_vilag": "Az év vége és az új év kezdete — mit ünneplünk?\n"
                           "Újévi jókívánságok: mit kívánunk egymásnak\n"
                           "Szerencsehozó jelképek: malac, patkó, négylevelű lóhere, kéményseprő\n"
                           "Újévi ételek a néphagyományban: lencse, malac (a hal és a szárnyas "
                           "miért nem)\nA naptár: az év első napja, január",
            "matematika": "Számlálás visszafelé az évkezdéshez (10-től 1-ig)\n"
                          "Sorszámok: hányadik hónap a január\n"
                          "Halmazalkotás: szerencsehozó jelképek válogatása\n"
                          "Lencseszemek számlálása, becslése",
            "rajzolas_festes": "Szerencsemalac mintázása gyurmából\n"
                               "Patkó díszítése magvakkal, ragasztással\n"
                               "Újévi köszöntőlap készítése a családnak\n"
                               "Négylevelű lóhere nyomdázása",
            "hallas_ritmus": "Újévi köszöntők ritmusa, egyenletes lüktetés kopogtatással\n"
                             "Csörgő, csengő hangjának felismerése",
            "mozgas": "Tornatermi tevékenységek:\nUgrás patkó-alakzatba, karikákba\n"
                      "Kéményseprő-járás: egyensúlyozás padon\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Köszöntő-járás csoportosan, kopogtatással\nZajkeltő télűző körjárás",
        },
        "kepessegfejlesztes": "hagyományismeret, szókincsbővítés, számfogalom, sorszámok, "
                              "ritmusérzék, finommotorika, közösségi érzés",
        "eszkozok": "gyurma, magvak, ragasztó, színes papír, csengő, csörgő, karikák, "
                    "naptár, képek az újévi szokásokról",
    },
    {
        "azonosito": "evszakok_korforgas_v1",
        "cim": "Év, évszakok, hónapok — az idő körforgása",
        "kategoria": "ovodai",
        "javasoltHonap": "1",
        "javasoltSorrend": "2",
        "tema": "A négy évszak, a hónapok, az idő körforgása",
        "cel": "A gyermekek ismerjék fel a négy évszak jellemzőit és sorrendjét, értsék meg, "
               "hogy az évszakok körben követik egymást. Nagycsoportban ismerkedjenek a "
               "hónapok nevével.",
        "feladat": "Az évszakok jellemzőinek összegyűjtése a gyermekek saját élményeiből; "
                   "évszak-kör készítése a csoportszobába. Az időbeli sorrend gyakorlása "
                   "képekkel, mozgással.",
        "teruletek": {
            "kulso_vilag": "A négy évszak és jellemzői: tavasz, nyár, ősz, tél\n"
                           "Mi változik? — időjárás, növények, állatok, öltözködés\n"
                           "Az évszakok körben követik egymást — az évszak-kör\n"
                           "A hónapok neve, melyik évszakhoz tartozik (nagycsoport)\n"
                           "A saját születésnapom melyik évszakban van",
            "matematika": "Sorbarendezés: évszakképek időrendbe\n"
                          "Számlálás: négy évszak, tizenkét hónap\n"
                          "Halmazalkotás: ruhadarabok évszak szerint\n"
                          "Ciklus felismerése: mi következik a tél után",
            "rajzolas_festes": "Évszak-kör festése négy cikkben\n"
                               "Ugyanaz a fa négyszer — évszakonként\n"
                               "Kollázs: évszakhoz illő képek gyűjtése, ragasztása\n"
                               "Hónapnaptár készítése (nagycsoport)",
            "hallas_ritmus": "Évszakok nevének ritmusa: ta-vasz, nyár, ősz, tél\n"
                             "Évszakhoz illő zenerészletek felismerése",
            "mozgas": "Tornatermi tevékenységek:\nÉvszak-váltó futójáték négy sarokkal\n"
                      "Utánzó mozgások: hóesés, esőcsepp, levélhullás, napozás\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Körben járás — az év körforgása\nÉvszak-szoborjáték",
        },
        "kepessegfejlesztes": "időbeli tájékozódás, sorrendiség, szókincsbővítés, "
                              "megfigyelőképesség, emlékezet, halmazalkotás, logikus gondolkodás",
        "eszkozok": "évszakképek, naptár, színes papír, tempera, ragasztó, ruhadarabok, "
                    "zenerészletek a négy évszakról",
    },
    {
        "azonosito": "napszakok_napirend_v1",
        "cim": "Napok, napszakok, napirend — az idő múlása",
        "kategoria": "ovodai",
        "javasoltHonap": "1",
        "javasoltSorrend": "3",
        "tema": "Napszakok, a hét napjai, napirend",
        "cel": "A gyermekek tájékozódjanak a napszakokban, ismerjék a saját napirendjüket, "
               "és tudják, mi történik reggel, délben, este. Nagycsoportban ismerkedjenek "
               "a hét napjaival.",
        "feladat": "A napirend képekkel való megjelenítése a csoportszobában; a napszakokhoz "
                   "kötődő tevékenységek felidézése. Az időbeli fogalmak (előbb, utóbb, "
                   "tegnap, ma, holnap) természetes gyakorlása.",
        "teruletek": {
            "kulso_vilag": "Napszakok: reggel, délelőtt, dél, délután, este, éjszaka\n"
                           "Mit csinálunk az egyes napszakokban?\n"
                           "A nap járása: világos és sötét, napkelte, napnyugta\n"
                           "A hét napjai, hétköznap és hétvége (nagycsoport)\n"
                           "Tegnap, ma, holnap — a saját napunk felidézése",
            "matematika": "Sorbarendezés: napirendi képek időrendbe\n"
                          "Számlálás: a hét hét napja\nSorszámok: hányadik nap a szerda\n"
                          "Halmazalkotás: nappali és éjszakai tevékenységek",
            "rajzolas_festes": "Napirendi kép rajzolása: az én napom\n"
                               "Nappal és éjszaka festése — világos és sötét alap\n"
                               "Óra készítése papírtányérból (nagycsoport)\n"
                               "Napocska és hold mintázása",
            "hallas_ritmus": "A hét napjainak ritmizálása\n"
                             "Halk esti és hangos reggeli dallamok megkülönböztetése",
            "mozgas": "Tornatermi tevékenységek:\nÉbredés–nyújtózás–elalvás utánzó gyakorlatok\n"
                      "Napszakváltó jelre történő mozgásváltás\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Nap és hold fogójáték\nNapirend-pantomim: melyik napszakot mutatom",
        },
        "kepessegfejlesztes": "időbeli tájékozódás, sorrendiség, emlékezet, szókincsbővítés, "
                              "önállóság, szabálytudat, figyelem",
        "eszkozok": "napirendi képek, papírtányér, rajzlap, zsírkréta, tempera, "
                    "sötét és világos alapú papír, csengő",
    },
    {
        "azonosito": "feny_arnyek_mackok_v1",
        "cim": "Fény és árnyék — a mackók világa",
        "kategoria": "ovodai",
        "javasoltHonap": "2",
        "javasoltSorrend": "1",
        "tema": "Medvék, téli álom, fény és árnyék",
        "cel": "A gyermekek ismerjék meg a medvék életét és a téli álom jelenségét. "
               "Szerezzenek tapasztalatot a fény és az árnyék keletkezéséről, és éljék át "
               "a felfedezés örömét.",
        "feladat": "Fénnyel és árnyékkal végzett egyszerű kísérletek, árnyjáték szervezése. "
                   "A medve téli álmának és a gyertyaszentelői néphitnek életkorhoz mért "
                   "bemutatása.",
        "teruletek": {
            "kulso_vilag": "A medve élete: hol lakik, mit eszik, miért alszik télen\n"
                           "A téli álom: mely állatok alszanak át telet\n"
                           "Gyertyaszentelő (február 2.) és a medve-néphit\n"
                           "Fény és árnyék: honnan jön a fény, mikor keletkezik árnyék\n"
                           "Világos és sötét, átlátszó és átlátszatlan tárgyak",
            "matematika": "Méret szerinti sorbarendezés: mackócsalád nagyság szerint\n"
                          "Árnyék nagyságának változása a fényforrás távolságával\n"
                          "Halmazalkotás: téli álmot alvó és ébren maradó állatok\n"
                          "Párosítás: tárgy és az árnyéka",
            "rajzolas_festes": "Árnykép-rajzolás: a tárgy árnyékának körberajzolása\n"
                               "Mackó mintázása agyagból, gyurmából\n"
                               "Árnybábok készítése pálcikára ragasztott formákból\n"
                               "Barlang festése sötét alapon",
            "hallas_ritmus": "Halk-hangos játék: alvó mackó, ébredő mackó\n"
                             "Mély és magas hangok megkülönböztetése (nagy medve, kis medve)",
            "mozgas": "Tornatermi tevékenységek:\nMedvejárás négykézláb, mászás alagúton\n"
                      "Gördülés, gurulás — a mackó vackolása\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Alvó medve ébresztő játék\nÁrnyékfogó játék napsütésben",
        },
        "kepessegfejlesztes": "megfigyelőképesség, kísérletező kedv, ok-okozati összefüggések, "
                              "hallási differenciálás, nagymozgások, téri tájékozódás, kreativitás",
        "eszkozok": "zseblámpa, fehér lepedő vagy vetítővászon, pálcikák, sötét karton, "
                    "agyag vagy gyurma, mackófigurák, képek a medvékről",
    },
    {
        "azonosito": "balazs_nap_iskola_v1",
        "cim": "Balázs-nap — gyere velem iskolába",
        "kategoria": "nephagyomany",
        "javasoltHonap": "2",
        "javasoltSorrend": "2",
        "tema": "Balázs-napi hagyomány, iskolába készülés",
        "cel": "A gyermekek ismerkedjenek meg a Balázs-napi néphagyománnyal, és a "
               "nagycsoportosok hangolódjanak rá az iskolakezdésre. Oldódjon az "
               "iskolával kapcsolatos szorongás.",
        "feladat": "A balázsolás szokásának életkorhoz mért bemutatása; beszélgetés az "
                   "iskoláról a gyermeki kérdésekre építve. Iskolás szerepjáték, "
                   "iskolatáska-pakolás játékosan.",
        "teruletek": {
            "kulso_vilag": "Balázs-nap (február 3.): a torok védelmének hagyománya\n"
                           "Régen a balázsjárás: a gyerekeket iskolába hívogatták\n"
                           "Mi az iskola? Mi különbözik az óvodától?\n"
                           "Az iskolatáska és tartalma: füzet, tolltartó, könyv\n"
                           "A tanító néni, az osztály, a becsengetés",
            "matematika": "Számlálás: hány ceruza fér a tolltartóba\n"
                          "Halmazalkotás: mi kell az iskolába, mi nem\n"
                          "Sorbarendezés méret szerint: ceruzák, könyvek\n"
                          "Formák felismerése az iskolai eszközökön",
            "rajzolas_festes": "Iskolatáska rajzolása, díszítése\n"
                               "Balázs-napi gyertya készítése papírból\n"
                               "Saját név másolása, betűk formázása (nagycsoport)\n"
                               "Vonalvezetési gyakorlatok mintalapon",
            "hallas_ritmus": "Szótagolás: is-ko-la, tás-ka, ce-ru-za\n"
                             "Hangfelismerés: mivel kezdődik a szó (nagycsoport)",
            "mozgas": "Tornatermi tevékenységek:\nSorakozó, párban járás, jelre megállás\n"
                      "Célba dobás, ügyességi pálya — feladattartás\n"
                      "Csoportban/udvaron végzett mindennapos mozgás:\n"
                      "Balázsjárás: közös vonulás énekkel\nSzabálytartó csoportjátékok",
        },
        "kepessegfejlesztes": "feladattartás, szabálytudat, szókincsbővítés, hangzási "
                              "differenciálás, finommotorika, vonalvezetés, önbizalom",
        "eszkozok": "iskolatáska, füzet, tolltartó, ceruzák, mintalapok, gyertya, "
                    "színes papír, képek az iskoláról",
    },
]


def main() -> int:
    dry = "--dry-run" in sys.argv
    ut = SEED / "weekly-templates.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))
    megvan = {s["azonosito"] for s in adat["sablonok"]}

    uj = 0
    for sablon in UJ_SABLONOK:
        if sablon["azonosito"] in megvan:
            continue
        teljes = {
            "azonosito": sablon["azonosito"],
            "cim": sablon["cim"],
            "verzio": 1,
            "kategoria": sablon["kategoria"],
            "javasoltHonap": int(sablon["javasoltHonap"]),
            "javasoltSorrend": int(sablon["javasoltSorrend"]),
            "kapcsoloUnnep": None,
            "tema": sablon["tema"],
            "cel": sablon["cel"],
            "feladat": sablon["feladat"],
            # A két irodalmi területet az irodalom_beepites.py tölti fel a korpuszból.
            "teruletek": {
                "kulso_vilag": sablon["teruletek"]["kulso_vilag"],
                "matematika": sablon["teruletek"]["matematika"],
                "verseles_meseles": "",
                "rajzolas_festes": sablon["teruletek"]["rajzolas_festes"],
                "enek_zene": "",
                "hallas_ritmus": sablon["teruletek"]["hallas_ritmus"],
                "mozgas": sablon["teruletek"]["mozgas"],
            },
            "iskolaElokeszito": "",
            "iskolaElokeszitoTeruletek": dict(IE),
            "kepessegfejlesztes": sablon["kepessegfejlesztes"],
            "eszkozok": sablon["eszkozok"],
        }
        adat["sablonok"].append(teljes)
        uj += 1
        print(f"  + {sablon['azonosito']:26} {sablon['cim']}")

    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n{uj} új sablon (összesen {len(adat['sablonok'])})" + ("  (dry-run)" if dry else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
