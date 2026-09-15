# -*- coding: utf-8 -*-
"""
A heti tervek CÉL és FELADAT mezőinek bővítése témánként.

MIÉRT: a sablonok célja és feladata eddig 1–2 mondat volt, jellemzően csak a hét
szűk tartalmáról („ismerjék meg az ősz gyümölcseit"). A heti tervben viszont a
hét TELJES nevelési szándéka ott a helye: az ONAP átfogó feladatai — egészséges
életmódra nevelés, érzelmi-erkölcsi és közösségi nevelés, anyanyelvi és értelmi
fejlesztés, környezettudatos magatartás — a hét témájához kötve.

Ez a fájl témánként két-két kiegészítő gondolatot ad: mit akarunk elérni (CÉL) és
mit teszünk érte (FELADAT). A `tools/celok_beepites.py` fűzi hozzá a meglévő
szöveghez, ismétlés nélkül.

A `_c(téma, cél-kiegészítés, feladat-kiegészítés)` hívások regisztrálnak.
"""

from __future__ import annotations

CELOK: dict[str, tuple[str, str]] = {}


def _c(tema: str, cel: str, feladat: str) -> None:
    CELOK[tema] = (cel, feladat)


# ---------------------------------------------------------------- ŐSZ ---------

_c(
    "tanevkezdes",
    "A gyermekek érezzék biztonságban magukat az óvodai környezetben, ismerjék meg "
    "és fogadják el a csoport együttélési szokásait. Alakuljon bennük az óvodához, "
    "a társakhoz és a felnőttekhez fűződő bizalmas, elfogadó kapcsolat.",
    "Az érzelmi biztonság megteremtése barátságos, befogadó légkörrel; a napirend "
    "és a szokásrend fokozatos, játékos gyakoroltatása. Az újonnan érkezők segítése "
    "a beilleszkedésben, a régiek bevonása a fogadásukba. Az önkiszolgálás "
    "(kézmosás, öltözködés, terítés) lépéseinek türelmes gyakorlása.",
)

_c(
    "osz_kezdete",
    "A gyermekek figyeljék meg az évszakváltás jeleit a közvetlen környezetükben, és "
    "tudjanak róla egyszerű mondatokkal beszámolni. Alakuljon bennük a természet "
    "változásai iránti nyitottság és a környezettudatos magatartás alapja.",
    "Rendszeres udvari és sétán szerzett tapasztalatszerzés biztosítása; az "
    "időjárás napi megfigyelése és jelölése. Az évszakhoz igazodó, réteges "
    "öltözködés szokásának alakítása. A megfigyelések szókincsének bővítése, a "
    "gyermeki kérdések türelmes megválaszolása.",
)

_c(
    "osz_termenyek",
    "Erősödjön a gyermekekben az egészséges életmódra nevelés a gyümölcs- és "
    "zöldségfogyasztás kapcsán: kedveljék meg a friss termést, és értsék meg, hogy "
    "a napi gyümölcs, zöldség a testük egészségét szolgálja. Alakuljon bennük a "
    "földben végzett munka és a termést gondozó ember iránti megbecsülés.",
    "Napi gyümölcs- és zöldségkóstoló szervezése, közös gyümölcssaláta készítése a "
    "gyermekek tevékeny részvételével; az étkezés előtti kézmosás és a kulturált "
    "étkezés szokásainak erősítése. A termések sokféleségének érzékszervi "
    "megtapasztaltatása (íz, illat, tapintás, hang). A betakarítás munkafolyamatának "
    "bemutatása képekkel, beszélgetéssel, szerepjátékkal.",
)

_c(
    "osz_szinek",
    "Finomodjon a gyermekek színérzéke és megfigyelőképessége az őszi természet "
    "színgazdagságán keresztül. Éljék át az esztétikai élményt, és tudják azt "
    "alkotásban, mozgásban, szóban is kifejezni.",
    "Séta szervezése a színek gyűjtésére, a levelek formájának, színárnyalatainak "
    "összehasonlítása. Változatos technikák és anyagok kínálása az alkotáshoz, a "
    "gyermeki elképzelés szabadságának meghagyásával. A színek, árnyalatok pontos "
    "megnevezésével a szókincs bővítése.",
)

_c(
    "kodos_oszi_ido",
    "A gyermekek ismerjék meg a késő őszi időjárás jelenségeit, és tanulják meg, "
    "hogyan öltözzenek, viselkedjenek hűvös, párás, esős időben. Erősödjön az "
    "egészségük védelmét szolgáló szokásrend.",
    "Az időjárásnak megfelelő öltözködés és a szabad levegőn töltött idő "
    "biztosítása rossz időben is; a mozgásigény kielégítése a csoportszobában. "
    "A megfázás megelőzésének (kézmosás, zsebkendőhasználat, réteges öltözés) "
    "természetes gyakoroltatása. Az esős napok hangulatának oldása mesével, "
    "zenével, közös játékkal.",
)

_c(
    "tok_fesztival",
    "A gyermekek szerezzenek sokoldalú tapasztalatot az őszi termésekről, és éljék "
    "át a közös készülődés, ünneplés örömét. Alakuljon bennük a néphagyomány iránti "
    "fogékonyság.",
    "Valódi termések bevitele, szabad kézbevétele, vizsgálata; a tökből készülő "
    "ételek megismertetése kóstolással. Közös díszítés, lampionkészítés szervezése, "
    "a gyermeki ötletek beépítésével. A közös munka során az együttműködés, "
    "egymásra figyelés erősítése.",
)

_c(
    "egeszseges_eletmod",
    "Alakuljon ki a gyermekekben az egészséges életmód iránti igény: a napi "
    "gyümölcs- és zöldségfogyasztás, a rendszeres mozgás, a tisztálkodás és a "
    "megfelelő pihenés természetes szokássá váljon. Tudják megkülönböztetni az "
    "egészséget szolgáló és az azt rontó szokásokat.",
    "Napi vitamin-kóstoló és a bőséges folyadékfogyasztás biztosítása; a testápolási "
    "teendők önálló, helyes sorrendű végzésének gyakoroltatása. A mindennapos "
    "mozgás örömtelivé tétele, a szabad levegőn töltött idő maximalizálása. "
    "Beszélgetés a betegségről, gyógyulásról a gyermekek élményeire építve.",
)

_c(
    "allatok_vilagnapja",
    "Mélyüljön el a gyermekekben az állatok iránti felelősségérzet és védelmük "
    "igénye. Ismerjék fel, hogy az állatnak is szüksége van táplálékra, vízre, "
    "otthonra és gondoskodásra.",
    "Az állatgondozás konkrét lehetőségeinek megteremtése (etetés, itatás, "
    "megfigyelés); beszélgetés a felelős állattartásról a gyermekek otthoni "
    "tapasztalatai alapján. Az állatok hangjának, mozgásának utánzása a "
    "kifejezőkészség fejlesztésére. A bántalmazás elutasításának érzelmi "
    "megalapozása mesén, példán keresztül.",
)

_c(
    "haziallatok_kicsinyei",
    "A gyermekek ismerjék fel a háziállatokat és kicsinyeiket, tudják őket "
    "megnevezni és párosítani. Erősödjön bennük az anya-gyermek kapcsolat "
    "biztonságának érzelmi élménye az állatvilág példáján keresztül.",
    "Képes és — ha lehetséges — valóságos találkozás biztosítása az állatokkal; "
    "az állat és kicsinye nevének pontos megtanítása. Az állatok hasznának "
    "(tej, tojás, gyapjú) egyszerű bemutatása. Szerepjáték-lehetőség kínálása a "
    "gondoskodás átéléséhez.",
)

_c(
    "erdo_allatai",
    "A gyermekek értsék meg, hogyan készülnek az erdő állatai a télre, és lássák "
    "meg az élőlények és az évszakok összefüggését. Alakuljon bennük az erdő mint "
    "élőhely iránti tisztelet.",
    "Erdei séta vagy képes megfigyelés szervezése; a téli készülődés (gyűjtögetés, "
    "vackolás, téli álom) egyszerű megértetése. Az ok-okozati összefüggések "
    "kereséséhez kérdések feltevése, a gyermeki gondolkodás megvárása. "
    "Az erdő rendjének megóvása — szemetelés nélküli kirándulás — mint természetes "
    "elvárás.",
)

_c(
    "erdok_napja",
    "A gyermekek fedezzék fel a fák jelentőségét az ember és az állatok életében, "
    "és alakuljon bennük a természet védelmére irányuló, tevékeny magatartás.",
    "Fák megfigyelése, összehasonlítása (törzs, levél, termés); faültetés vagy "
    "gondozás lehetőségének megteremtése. A fából készült tárgyak gyűjtése, "
    "vizsgálata. A papírtakarékosság, újrahasznosítás szokásának megalapozása a "
    "csoport mindennapjaiban.",
)

_c(
    "kenyer_utja",
    "A gyermekek kövessék végig a búza útját a magtól az asztalig, és értsék meg a "
    "sok kéz munkáját, amely a kenyérben van. Alakuljon bennük a kenyér és az "
    "élelem megbecsülése.",
    "A folyamat lépéseinek megjelenítése képekkel, munkaeszközökkel, "
    "szerepjátékkal; a gabonaszemek, a liszt és a tészta érzékszervi vizsgálata. "
    "Közös tésztagyúrás, sütés szervezése a gyermekek tevékeny részvételével. "
    "A kenyérrel való bánás (nem dobáljuk, nem hagyjuk el) szokásának alakítása.",
)

_c(
    "marton_nap",
    "A gyermekek ismerkedjenek meg a Márton-napi néphagyománnyal és Szent Márton "
    "jóságos alakjával. Erősödjön bennük a segítőkészség, az adakozás öröme és a "
    "közös ünneplés élménye.",
    "A legenda érzelemgazdag elmesélése, beszélgetés a megosztásról a gyermekek "
    "saját élményei alapján. A lámpás elkészítése és a felvonulás megszervezése; "
    "a népi időjárás-jóslások játékos megismertetése. A közös vonulás során az "
    "egymásra figyelés és a biztonságos közlekedés gyakorlása.",
)

_c(
    "erzsebet_katalin",
    "A gyermekek ismerjék meg az Erzsébet- és Katalin-napi hagyományokat, és éljék "
    "át a névnapi köszöntés, egymás megajándékozásának örömét. Alakuljon bennük a "
    "figyelmesség és a hála kifejezésének készsége.",
    "A rózsacsoda legendájának elmesélése, beszélgetés a jótettről. Névnapi "
    "köszöntő tanulása, apró ajándék készítése egymásnak. A Katalin-ág vízbe "
    "állítása és rendszeres megfigyelése — a várakozás és a gondoskodás "
    "megtapasztalása.",
)

_c(
    "csalad",
    "A gyermekek tudják megnevezni a családtagjaikat és a köztük lévő kapcsolatokat. "
    "Erősödjön bennük a családhoz tartozás biztonsága, és tanulják meg elfogadni, "
    "hogy a családok sokfélék lehetnek.",
    "Érzelmi biztonságot adó, elfogadó légkör megteremtése a családról szóló "
    "beszélgetésekhez; minden gyermek családképének tiszteletben tartása. "
    "Fényképek, rajzok bevonása a felidézésbe. A családi szerepek eljátszásához "
    "gazdag eszközkészlet és idő biztosítása a szerepjátékban.",
)

_c(
    "otthonunk",
    "A gyermekek ismerjék meg a lakóhelyük, otthonuk jellemzőit, és tudják, hol "
    "laknak. Alakuljon bennük az otthon melege, biztonsága iránti érzelmi kötődés "
    "és a rend iránti igény.",
    "A ház részeinek, a lakás helyiségeinek és rendeltetésének megismertetése "
    "képekkel, építőjátékkal. Séta a környéken, a jellegzetes épületek "
    "megfigyelése. A csoportszoba rendjének közös megőrzése — a saját tér "
    "gondozásának természetes gyakorlása.",
)

_c(
    "testunk",
    "A gyermekek ismerjék meg testrészeiket, érzékszerveiket és azok szerepét. "
    "Alakuljon bennük egészséges testkép, a saját test elfogadása és megóvásának "
    "igénye.",
    "Az érzékszervek működésének megtapasztaltatása játékos kísérletekkel "
    "(tapintó-, íz-, hangfelismerő játékok). A testápolási teendők helyes "
    "sorrendjének gyakoroltatása. Beszélgetés arról, mi tesz jót és mi árt a "
    "testünknek; a testi különbözőség elfogadásának érzelmi megalapozása.",
)

_c(
    "szinek_formak",
    "A gyermekek ismerjék fel és nevezzék meg a színeket és az alapformákat, tudják "
    "azokat összehasonlítani, csoportosítani. Fejlődjön a vizuális "
    "megfigyelőképességük és a matematikai gondolkodásuk alapja.",
    "Változatos, sokféle színű és formájú eszköz biztosítása a szabad "
    "válogatáshoz, rendezéshez. A színkeverés megtapasztaltatása festéssel. "
    "A formák felfedeztetése a környezet tárgyain, sétán is. A pontos "
    "megnevezésekkel a szókincs és a fogalomalkotás támogatása.",
)

_c(
    "kozlekedes",
    "A gyermekek ismerjék meg a közlekedési eszközöket és a gyalogos közlekedés "
    "alapvető szabályait. Alakuljon bennük a biztonságos, szabálykövető és másokra "
    "figyelő magatartás.",
    "A gyalogátkelőhely, a jelzőlámpa használatának gyakorlása sétán és "
    "szerepjátékban egyaránt. A járművek csoportosítása (szárazföldi, vízi, légi) "
    "a gyermeki tapasztalatokra építve. Beszélgetés a biztonsági eszközökről "
    "(gyermekülés, sisak, láthatósági mellény).",
)

_c(
    "foglalkozasok",
    "A gyermekek ismerkedjenek meg a felnőttek munkájával, a mesterségek "
    "eszközeivel és termékeivel. Alakuljon bennük a munka és a dolgozó ember "
    "megbecsülése, és éledjen fel a saját munkavégzés öröme.",
    "A szülők foglalkozásának bevonása a beszélgetésbe; ha lehet, munkahely "
    "meglátogatása vagy vendég meghívása. Valódi szerszámok biztonságos "
    "kipróbálásának lehetősége. A szerepjátékhoz gazdag kellékkészlet és elegendő, "
    "megszakítás nélküli idő biztosítása.",
)

_c(
    "baratsag",
    "Erősödjön a gyermekekben a társak iránti figyelem, az együttérzés és a "
    "segítőkészség. Tanuljanak meg konfliktust szóval rendezni, bocsánatot kérni és "
    "megbocsátani.",
    "Az együttműködést kívánó, közös sikerélményt adó játékok szervezése. "
    "A konfliktusok kísérése: a gyermekek segítése abban, hogy megfogalmazzák, mit "
    "éreznek és mit szeretnének. A kirekesztés következetes, ítélkezés nélküli "
    "kezelése; a másság elfogadásának érzelmi megalapozása mesével.",
)

_c(
    "olvasni_jo",
    "A gyermekek szeressék meg a könyvet és a mesehallgatást, alakuljon ki bennük az "
    "olvasóvá nevelés alapja: a mesére való figyelem és a belső képalkotás "
    "képessége.",
    "Napi mesélés biztosítása nyugodt, meghitt körülmények között; a könyvek "
    "szabad, önálló használatának lehetővé tétele. A könyvvel való bánás (lapozás, "
    "helyretétel, óvás) szokásának alakítása. Könyvtárlátogatás vagy csoportszobai "
    "„mesesarok” berendezése a gyermekekkel közösen.",
)
