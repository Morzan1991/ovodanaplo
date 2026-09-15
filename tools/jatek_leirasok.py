# -*- coding: utf-8 -*-
"""
A játékleírások SAJÁT megfogalmazásban.

MIÉRT: a játékok leírása korábban szó szerint a Tappancs-kiadványból került az
ötletbankba, a tördelési hibákkal együtt. A szerzői jog a megfogalmazást védi,
nem a játékot magát — a népi és óvodai játékok szabálya közkincs, egy konkrét
leírás viszont a szerzőé. Itt ugyanaz a játék szerepel, más szavakkal.

A kulcs a játék nevének ékezet nélküli, kisbetűs alakja, hogy ne kelljen a
neveket kézzel átgépelni: a beépítő a seedben talált nevet hagyja meg, és csak a
gondolatjel utáni leírást cseréli le.

A `TOROLENDO` halmazba a kinyerés szemetje került: a kiadvány lapfejlécei
(„FÖLD NAPJA — ÁPRILIS 22. RAJZOLÁS, FESTÉS…"), amelyek soha nem is voltak
játékok.

Használat: tools/jatek_ujrairas.py olvassa be.
"""

from __future__ import annotations

# Lapfejlécek, nem játékok — ezeket töröljük az ötletbankból.
TOROLENDO: set[str] = {
    "felvirradtunk_mihaly_napra",
    "fold_napja",
    "gyere_velem_iskolaba",
    "mehek_napja",
}

UJ_LEIRAS: dict[str, str] = {
    # --- Anyanyelvi és beszédfejlesztő játékok ---
    "a_fele_sem_igaz_anyanyelvi_jatek": "Olyan mondatot mondunk, amelynek csak az egyik fele igaz, a másik képtelenség. A gyerekek megkeresik a hibát, és helyesen mondják el.",
    "befejezetlen_mondat_anyanyelvi_jatek": "Elkezdünk egy mondatot az egészséges életmódról, a gyerekek megismétlik, majd a maguk szavaival befejezik.",
    "csendjatek_anyanyelvi_jatek": "Leülünk vagy lefekszünk a szőnyegre, és egy ideig csak a környező hangokra figyelünk. Az ünnep csendjére hangol.",
    "ha_hallod_a_hangot_tapsolj_anyanyelvi_jatek": "Szavakat sorolunk, a gyerekek pedig tapsolnak, valahányszor meghallják az előre megbeszélt hangot.",
    "hangstafeta_anyanyelvi_jatek": "Félkörben ülünk. Az első gyerek egy levegővel hangoztat egy szótagot, ameddig bírja, majd érintéssel adja tovább a szomszédjának.",
    "hangutanzos": "A kisebbek állatok és járművek hangját utánozzák. A nagyobbak egymást: megfigyelik, milyen hangerővel és hangsúllyal beszél a társuk, és azt próbálják visszaadni.",
    "jatek_a_szavakkal": "Elkezdünk egy szót, a gyerekek fejezik be. Például: bö…, sa…",
    "manocska_jatek": "A nyelv tornáztatása: a nyelv a manócska, aki körbejárja a házát, vagyis a szájat, és megnézi, rendben van-e minden.",
    "mit_csinalsz": "Az első gyerek megkérdezi, mit csinálsz. A társa egy szóval felel, például játszom. A következő erre kérdez rá: mit játszol. Addig megy, amíg van új kérdés.",
    "mit_latsz_a_kepen_anyanyelvi_jatek": "A kisebbeknek egy képet mutatunk a vásárról, és beszélgetésre hívjuk őket róla. A nagyobbaknak több képet is adhatunk, azokból közösen történetet találunk ki.",
    "mondatalkotos_anyanyelvi_jatek": "Két-három tárgyat ábrázoló képet teszünk a gyerekek elé, ők pedig egy mondatba foglalják őket.",
    "mondd_egy_szoval": "Gyűjtőfogalomhoz szavakat sorolunk, vagy fordítva: a gyerek nevezi meg a gyűjtőfogalmat a felsorolt szavakhoz.",
    # Ugyanaz a játék, a kiadványban másik hét alatt, kissé más névvel.
    "mondd_egy_szoval_anyanyelvi_jatek": "Felsorolt szavakhoz a gyerekek megkeresik a közös gyűjtőfogalmat.",
    "folytasd_a_sort_anyanyelvi_jatek": "Egy témához tartozó szavakat gyűjtünk sorban, például tél, virágok, szerszámok.",
    "hangstafeta": "Két csapat verseng. Az első gyerek addig hangoztat egy hangot, ameddig bírja, majd megérinti a társát, aki folytatja. Melyik csapat bírja tovább?",
    "robotnyelv_anyanyelvi_jatek": "Szótagolva, robotosan beszélünk. Előbb két szótagú szavakkal és nevekkel, később hosszabbakkal.",
    "szolanc_anyanyelvi_jatek": "Sorban ülünk. Az első gyerek mond egy szót, a következő megismétli és hozzátesz egyet, a harmadik már hármat mond. Addig tart, amíg emlékeznek a sorra.",
    "mire_gondolok": "Egy vásárfia jellemzőit soroljuk, a gyerekek pedig kitalálják, melyikre gondoltunk.",
    "barkochba": "Kitalálós játék: eldöntendő kérdésekkel jönnek rá a gyerekek, melyik állatra vagy madárra gondoltunk.",
    "liccs_loccs_megjott_a_kishajo_barkochba": "A kisebbeknek mi soroljuk annak a tulajdonságait, amit a kishajó hozott. A nagyobbak már maguk kérdeznek rá, így ismerkednek a barkochba menetével.",
    "ki_vagyok_en": "Páros játék állatos fejdísszel. A gyerek a saját fejdíszéről kérdez, a párja csak igennel vagy nemmel felelhet, amíg ki nem találja, milyen állat lett.",
    "kakukktojas": "Egy témakörhöz tartozó képek közé keverünk egy oda nem illőt, és megkeressük, melyik az.",
    "levego_fold_viz": "Állatokat sorolunk, a gyerekek pedig megmondják, hol élnek. A nagyobbak már maguk is mondhatnak állatot.",
    "talalos_kerdesek_a_mikulasrol": "Találós kérdések a Mikulásról; a gyerekek a jellemzőkből következtetnek a megfejtésre.",
    "talalos_kerdesek_az_allatokrol": "Találós kérdések vadon élő és háziállatokról.",
    "mimetikus_jatek_mestersegekrol": "Közösen eljátsszuk, hogyan vizsgál a doktor néni, hogyan biciklizik a postás, hogyan rúgja a labdát a focista.",
    "azt_gondoltam_hogy": "Elkezdjük a mondatot, majd némán eljátszunk egy cselekvést. A gyerekek felismerik, és befejezik a mondatot. Aki eltalálta, ő gondolhat következőnek.",
    "azt_szeretem_a_legjobban_anyaban_hogy": "Körben mindenki megfogalmazza egy mondatban, mit szeret a legjobban az édesanyjában.",
    "ez_en_vagyok": "Jellemző tulajdonságok elmondása alapján ismerjük fel egymást.",
    "keress_es_talalj_meg": "Zenés párválasztás: mindenki olyan társat keres, akin ugyanaz a külső jellemző látszik.",
    "szervusz": "Zenére sétálunk a vásárban, és akivel szembetalálkozunk, annak köszönünk, minden körben másképp.",
    "tortenet_kitalalasa_kepekrol": "Egymás mellé tett képekből egy felnőtt napja rajzolódik ki. Közösen történetet találunk ki hozzá.",
    "hogy_jon_sorba": "Egy kislány napját mutató képeket rakunk sorba. A kisebbek kevesebb képpel dolgoznak, a nagyobbak többel, és történetet is fűzhetnek hozzá.",
    "osszegyurt_tortenet": "Két-három ismert mese képeit összekeverjük. A gyerekek szétválogatják, sorrendbe teszik, majd elmesélik őket.",

    # --- Fúvó- és légzőgyakorlatok ---
    "fujasok_anyanyelvi_jatek": "Tollpihét vagy pingponglabdát fújunk le az asztalról.",
    "fujasok_valtozatosan_anyanyelvi_jatek": "Libatollat fújunk az asztalon úgy, hogy le ne essen róla. Akadálypályát is építhetünk neki.",
    "fuvogyakorlat_tollpihevel_anyanyelvi_jatek": "Felakasztott tollpihét fújunk. A nagyobbak versenyezhetnek, ki bírja tovább egy levegővel, vagy ki ér előbb a szakasz végére.",
    "fuvogyakorlatok_termessel_anyanyelvi_jatek": "Sógyurmából pályát formálunk az asztalon, és fújással vezetjük végig rajta a terméseket.",
    "felakasztott_hopihek_vattapamacs_fujasa_anyanyelvi_jatek": "Zsinórra akasztott vattapamacsot fújunk, hogy meglendüljön.",
    "szivoszallal_hopehely_vattapamacs_fujasa_anyanyelvi_jatek": "Szívószállal fújjuk végig a vattapamacsot. A kisebbeknek egyenes szakaszon, a nagyobbaknak hullámos pályán.",
    "kishajo_fujasa_vizen_anyanyelvi_jatek": "Dióhéjból készült hajót fújunk a víz felszínén. A nagyobbak versenyezhetnek, kié ér előbb a kikötőbe.",
    "gyertyalang_tancoltatasa_anyanyelvi_jatek": "A gyertya lángját fújjuk közelebbről és távolabbról, de csak annyira, hogy táncoljon, és el ne aludjon.",
    "lufiember_anyanyelvi_jatek": "Légzőgyakorlat: lufiemberré válunk. Orron át felfújjuk magunkat, majd a szánkon lassan kiengedjük a levegőt.",
    "lufifujo_verseny_anyanyelvi_jatek": "Ki tudja hamarabb felfújni a lufit? Utána filctollal arcot is rajzolhatunk neki.",
    "csibejatek": "Tányérra apró magvakat szórunk, és a gyerekek kéz nélkül, csak a szájukkal szedegetik fel.",
    "zizieves": "A kisebbek kéz nélkül esznek a magokból. A nagyobbak már csücsörítve, ügyesebben.",

    # --- Fogójátékok ---
    "allatfogo_fogojatek": "Akit a fogó elkap, továbbfuthat, ha mond egy állatnevet.",
    "csipeszes_fogo_fogojatek": "Mindenki hátára csipeszt teszünk, a fogó pedig igyekszik minél többet begyűjteni.",
    "elefantfogo_fogojatek": "A fogó megfogja az orrát, és a keletkezett résen átdugja a másik karját, így lesz elefánt. Akit elkap, szintén elefántfogóvá válik.",
    "eledelszerzo_fogojatek": "A tér közepére szórt babzsákokat egyesével kell a szélre hordani úgy, hogy közben a fogó ne érjen utol.",
    "erintofogo_fogojatek": "Labdás fogó: akit megérintenek, átveszi a labdát, és ő lesz az új fogó.",
    "erintofogo_labdaval_fogojatek": "Labdás fogó: a labda az érintéssel gazdát cserél, és az új gazdája lesz a fogó.",
    "fecskefogo_fogojatek": "A párok kézen fogva fészket alkotnak. Egy gyerek a fecske, egy a sas: a fecske bármelyik fészekbe bemenekülhet.",
    "felperces_fogo_fogojatek": "A fogójáték fél percig tart, utána megszámoljuk, hány gyereket kapott el a fogó.",
    "gombafogo_fogojatek": "Akit elkapnak, leguggol, és onnantól ő a fogó.",
    "kukacfogo_fogojatek": "Akit a fogó megérint, hozzákapaszkodik, és párban futnak tovább. Négy gyereknél kettéválnak.",
    "majomfogo_fogojatek": "A tér közepén alacsonyan kötelet feszítünk ki, azon átugorva vagy alatta átbújva lehet közlekedni. A fogó ugyanígy közelít.",
    "pacas_fogocska_fogojatek": "Akit a fogó elkap, hozzáragad, és együtt futnak tovább.",
    "parfoglalo_fogojatek": "A párok együtt futnak, a fogó egyedül van. Akit megérint, azzal helyet cserél.",
    "parosfogo_fogojatek": "Egy pár a fogó. Ha elkapnak két gyereket, azok is párként fognak tovább.",
    "santa_roka_fogojatek": "Mindenki négykézláb, egyik lábát felhúzva közlekedik, a fogó is így közelít.",
    "sapkafogo_fogojatek": "Két fogó sapkát kap, és az a dolguk, hogy a menekülők fejére tegyék.",
    "szalaggyujto_fogojatek": "Mindenki nadrágjába hátul szalagot fűzünk. A fogó azt húzza ki, akit elér.",
    "szincapa_fogojatek": "A két vonal közötti sáv a tenger, benne a cápa. Amikor kimond egy színt, mindenki átfut a túlpartra; akin az a szín van, azt a cápa nem foghatja meg.",
    "terpeszfogo_haz_nelkuli_fogojatek": "Akit elkapnak, terpeszben megáll. A társai a lába között átbújva szabadíthatják ki.",
    "uldozo_koveto_fogojatek": "Futás közben szerpentint adogatunk tovább. A fogó csak azt üldözheti, akinél éppen a szalag van, így az átadással ki lehet cselezni.",
    "kakas_es_a_tyukok_fogojatek": "A kakas zsámolyon alszik, a tyúkok kapirgálnak körülötte. Amikor a kakas elkukorékolja magát, mindenki szalad.",
    "hazas_eger_parban_fogojatek": "Párban állunk, az egyik guggol, a másik terpeszben áll. Jelre a kisegér átbújik a terpesz alatt, és elfutnak; a következő jelre vissza a saját házba.",
    "gyere_be_a_hazba_hazas_fogojatek": "Székek közé rögzített karikákból házat építünk. Futkározunk körülötte, jelre pedig a karikákon vagy a székek között bebújunk.",
    "ki_meg_be_hazas_fogojatek": "Csoszogva közlekedünk, a fogó egy középre rajzolt körben áll. Be kell jutni a körbe úgy, hogy ne érjen el senkit.",
    "roller_a_garazsba_hazas_fogojatek": "A talpunk alatt babzsákot tolva kerülgetjük a padot. A fogó ugyanígy közlekedik; aki időben leül a padra, biztonságban van.",
    "sok_cica_egy_kutya_hazas_fogojatek": "A tér közepén a kutyaház. A cicák körbefutnak és figyelnek; ha a kutya kibújik, a két szemközti sarokba menekülnek.",
    "ugorj_es_bujj_hazas_fogojatek": "A fogó elől a padra felfutva vagy a szer alá bebújva lehet biztonságba kerülni.",
    "sarkany_farka_ugyessegi_fogojatek": "Egyes sorban egymás derekát fogva sárkányt alkotunk. Az utolsó gyerek derekába zsebkendőt tűzünk, és a sárkánynak el kell kapnia a saját farkát.",
    "harmas_cica": "Két gyerek kézen fogva áll, ők az egerek, velük szemben a cica. Az egerek elengedik egymást és szétfutnak; akinek nem lesz párja, ő lesz az új cica.",
    "bombazo_labdajatek": "A fogó labdával próbálja megérinteni a többieket.",

    # --- Futó- és helyfoglaló játékok ---
    "autok_a_garazsba_futojatek": "Babzsákkal a kézben körbefutunk, jelre pedig beállunk a kijelölt sávba, ahol a fogó már nem érhet el.",
    "autos_jatek_futojatek": "Zöld tárcsára szabad a futás, pirosra azonnal meg kell állni.",
    "baglyos_futojatek": "Sötétedést jelzünk lámpaoltással vagy képpel; ilyenkor a baglyok szabadon repülhetnek.",
    "bujj_az_oduba_futojatek": "A mókusok körbefutnak az ágakon. A „Jön a sas!” kiáltásra karikákon átbújva menekülnek az odúba.",
    "cserebere_futojatek": "A terem két végében szemben állnak a csapatok, középen padsorral. Jelre egymás felé futnak, a pad fölött átadják az eszközt, majd gyorsan vissza.",
    "fecskek_a_droton_futojatek": "A terem két végében kifeszített kötélre állunk, mint fecskék a drótra. Jelre szembefutással helyet cserélünk.",
    "feltek_e_a_medvetol_futojatek": "A gyerekek a vonal mögül indulnak, a medve középen áll. Jelre át kell futni a túloldalra, a medvének pedig el kell kapnia valakit.",
    "fuss_haza_futojatek": "Kötélből házat formálunk a földön, és jelre mindenki beugrik.",
    "fussunk_futojatek": "Szabad futás a kijelölt területen, jelre pedig gyors befutás a megbeszélt helyre, például a buszok a garázsba.",
    "futas_atfutassal_futojatek": "Jelre a szemközti vonalig futunk, közben tárgyakon átlépve.",
    "futas_targyhordassal_futojatek": "Eszközzel a kézben szétszórtan futkározunk. Jelre megállunk terpeszben, és a fejünk fölé emeljük az eszközt.",
    "golyak_a_toban_utanzojatek": "A tó körül járkálunk, tapsra pedig berepülünk a körkötéllel jelzett tóba.",
    "keszulj_futojatek": "Amíg szól a zene, a tér szélére kikészített eszközök felé futunk. Amikor elhallgat, gyorsan helyet kell foglalni.",
    "korhinta_futojatek": "Körben futunk, majd adott jelre irányt váltunk.",
    "krumpliultetes_futojatek": "A terem két oldalán öt-öt hengert állítunk fel, középre szivacslabdákat szórunk. Minél többet kell a hengerekbe gyűjteni.",
    "levegoben_futojatek": "Hosszú vonalat rajzolunk vagy ragasztunk a padlóra, ez lesz a kötél, amelyen a kötéltáncosnak végig kell futnia.",
    "mokusok_ki_a_hazbol_helyfoglalo_jatek": "Jelre mindenki kifut a házából, a következő jelre pedig újat keres magának.",
    "szaladj_az_erdobe_futojatek": "Kijelölt területen futunk, az akadályok a fák. Jelre mindenki talál magának egy fát, és terpeszben megáll mellette.",
    "tapados_jatek_futojatek": "Futás után jelre mindenki rátapad valamire az utasítás szerint.",
    "talald_meg_a_hazad_helyfoglalo_jatek": "A tér szélén babzsákok fekszenek. Az akadály körüli futás után jelre mindenkinek házat, vagyis babzsákot kell találnia.",
    "karikas_helyfoglalo": "A karikába csak annyi gyerek állhat, amennyi a felmutatott táblán szerepel.",
    "szekfoglalo": "A székeket körbe állítjuk, üléssel kifelé. Amíg szól a zene, körbetáncolunk; csendre le kell ülni, és a székek száma egyre fogy.",
    "tuz_viz_repulo": "Lassan futkározunk, jelre megállunk. „Tűz” kiáltásra hasra fekszünk, „víz”-re székre vagy bordásfalra állunk, „repülő”-re oldalsó középtartással futunk tovább.",
    "arviz_ugyessegi_jatek": "Tágas körben ülünk. „Árvíz”-nél mindenki felmászik a székére, „tűz”-nél a földre guggol, „hóvihar”-nál pedig visszaül a helyére.",
    "lopakodo": "A rajtvonalról indulva halkan lopakodunk a háttal álló társ mögé. Amikor megfordul, mindenkinek mozdulatlanná kell válnia; aki megmozdul, kiesik.",
    "vakjatek": "Egy gyerek bekötött szemmel indul el középről. Akihez odaér, óvatosan más irányba fordítja.",

    # --- Labda- és egyensúlyjátékok ---
    "add_tovabb_labdajatek": "Labda továbbadása társnak: állva, sétálva, majd futás közben is.",
    "kapd_el_labdajatek": "Labdapattogtatás többféleképpen: járva, futva, egy kézzel, két kézzel, váltott kézzel.",
    "kidobo_labdajatek": "A játék labdafeldobással indul. Aki megszerzi a labdát, megáll, és megpróbálja kidobni valamelyik társát.",
    "kugli_labdajatek": "A kör közepén álló gyerek a kuglibaba, akit labdagurítással kell kiütni.",
    "labdacica_korben_labdajatek": "A körben állók egymásnak gurítják vagy dobják a labdát, a középen álló pedig igyekszik elkapni.",
    "labda_porazon_labdajatek": "A labdára másfél-két méteres madzagot kötünk, a másik végét a gyerek csuklójára. A madzag miatt nem gurul el, a cél, hogy le se essen.",
    "takaros_labda_labdajatek": "Körben megfogjuk egy takaró szélét, a közepére labdát vagy lufit teszünk, és úgy egyensúlyozunk, hogy le ne essen.",
    "tatott_szaju_jegesmedve_labdajatek": "Papírból nagy szájú jegesmedvefejet készítünk, a háta mögé zsákot rögzítünk. Maroklabdával célzunk bele alsó és felső dobással.",
    "labda_egyensulyozas": "Két gyerek a testével tart egy labdát. Egymás kezét foghatják, de a labdához nem érhetnek. Ha megy, kettővel is megpróbálhatják.",
    "labdaegyensulyozas_egyensulyjatek": "Páros egyensúlyozás: a labdát csak a testükkel tarthatják, a kezükkel nem érinthetik.",
    "lufidobalas_egyensulyjatek": "Négyes csoportokban kört alkotunk és megfogjuk egymás kezét. Úgy kell a lufit fent tartani, hogy közben senki ne engedje el a másikat.",
    "lufidobalas_ugyessegi_jatek": "A lufik minél tovább maradjanak a levegőben.",
    "paros_felhuzos_paros_egyensulyjatek": "Szemben ülünk a földön, talpak a földön, lábujjak összeérnek. Előrehajolva megfogjuk egymás kezét, és felhúzzuk a másikat, majd ugyanígy leülünk.",
    "patakugras": "Két párhuzamos vonallal patakot jelölünk a földön. A szélességét a gyerekek korához igazítjuk, és sorban átugranak egyik partról a másikra.",

    # --- Ügyességi és versenyjátékok ---
    "artistak_vagyunk_ugyessegi_jatek": "Cirkuszi artistaként egyensúlyozunk: kötélen, padon, zsámolyon, ferde felületen, tyúklépésben.",
    "barlangjaras_akadalyjatek": "Barlangkutatóként haladunk végig egy akadálysoron: karikákon átbújva, alattuk átcsúszva, labirintusban tájékozódva.",
    "hernyojaras_ugyessegi_jatek": "Nyolc-tíz gyerek egymás mögé áll terpeszben. A sor végén álló négykézláb átmászik a lábak alatt, majd elöl feláll terpeszbe.",
    "kenguruk_ugyessegi_jatek": "Kenguruként hordunk eszközöket egyik házból a másikba: szökdelve, páros lábon, térd közé szorított babzsákkal.",
    "labujjtorna": "Zokni nélkül, a szőnyegen ülve a lábujjunkkal csipegetjük fel a játékokat.",
    "labujjtorna_ugyessegi_jatek": "Lábujjal emelgetünk fel apró tárgyakat a szőnyegen, zokni nélkül.",
    "trambulin": "Ugrálás a trambulinon, többféle módon és ritmusban.",
    "rajzolas_ugyessegi_jatek": "Labirintust rajzolunk vagy ragasztunk a teremben, az udvaron. Ki tud végigmenni rajta anélkül, hogy eltévedne?",
    "karikaguritas_padok_kozott_versenyjatek": "Karikát gurítva kerüljük meg a kijelölt tárgyat. A feladat többféleképpen nehezíthető.",
    "kovesd_a_nyomot_versenyjatek": "Kéz és láb alakú formákat rakunk a padlóra, és többféle módon kell végigjutni rajtuk.",
    "nyomkovetes_ugyessegi_jatek": "Kéz- és lábnyomokon haladunk végig, változó sorrendben és tempóban.",
    "pincerverseny": "Két csapat verseng: akadályokat kerülgetve visznek végig valamit, például tollaslabda-ütőn babzsákot vagy fakanálon pingponglabdát.",
    "pincerverseny_akadalyverseny": "Akadályokat kerülgetve, pincérként viszünk végig egy tárgyat: fakanálon labdát, ütőn babzsákot.",
    "seta_a_babzsakkal": "A csoportot két részre osztjuk, egymással szemben, körülbelül húsz lépésre. Az elöl álló a fejére tesz egy babzsákot, óvatosan átsétál vele, átadja a szemközti társnak, ő pedig a sor végére áll.",
    "sorverseny": "Négy oszlopban állunk fel a ferde pad mögött. Fellépés, lefutás akadály kerülésével, visszafutás a pad átlépésével.",
    "sorverseny_futas_egyeni_versengessel": "Sorverseny gyors futással, egy tárgy megkerülésével.",
    "talicskazas_combfogassal_versenyjatek": "Csoportokban talicskázva versenyzünk, közben egy tárgyat is meg kell kerülni.",
    "ugra_bugra_versenyjatek": "Füves területen kijelölt pályán füles labdán ugrálva versenyzünk.",
    "versenyautok_versenyjatek": "Mászás és járás kijelölt, hatvan-hetven centis sávokban, a vonalak között.",
    "vidd_a_kaptarba_gyujtogeto_versenyjatek": "Méhecskeként gyűjtjük a nektárt futás közben, többféleképpen: babzsákkal a fejen, szalagot fogva, két kézzel a hátunk mögött.",
    "ki_csuszik_messzebbre_a_jegen_versenyjatek": "Lecsúszunk a jégen, majd a gyerekek által javasolt eszközzel lemérjük, ki jutott messzebbre.",
    "szankoverseny": "Ki csúszik messzebbre a dombról? A távolságot a gyerekek által választott eszközzel mérjük le.",
    "babzsakdobo_csapatverseny": "A teret kötéllel megfelezzük. Jelre mindkét csapat igyekszik átdobálni a babzsákokat a másik térfélre; a záró jelnél megszámoljuk, hol maradt kevesebb.",
    "varostrom": "Konzervdobozokból vagy kockákból várat építünk: alul három, rajta kettő, a tetején egy. Labdával kell ledönteni, a távolságot a gyerekek korához igazítva.",
    "lovoldozes": "Nagy csomagolópapírt zsírkrétával megfelezünk, mindkét térfélen tíz-tíz pontot rajzolunk. Egy-egy gyors vonallal kell eltalálni a másik pontjait; amit már eltaláltunk, azt nem lehet újra.",
    "bontodaru": "Zsinóron lógó golyót lengetünk egy építőkockákból emelt torony fölött, és megpróbáljuk ledönteni.",
    "celba_dobas_hogolyoval": "Puha hógolyóval célba dobás. A célt a gyerekek ötletei alapján állítjuk össze.",
    "papirtepes": "Körben ülünk. Az első gyerek kettétép egy papírt, a felét továbbadja, a szomszédja is megfelezi és adja tovább. Addig megy, amíg már nem lehet széttépni.",

    # --- Megfigyelés, emlékezet, tapintás ---
    "elbujt_targyak": "Kendő alá félig kilátszó tárgyakat és ruhadarabokat rejtünk, a gyerekek pedig felismerik őket.",
    "felvillantott_kepek": "Rövid ideig mutatunk egy képet, azután a részleteiről kérdezünk.",
    "gyufaszal_figurak_epitese": "Három pálcikából egyszerű formát rakunk ki, letakarjuk, a gyerek pedig emlékezetből építi újra.",
    "gyongysorok": "Háromféle színű gyöngyből mintát kezdünk fűzni, a gyerekek folytatják a sort. A minta fokozatosan nehezedhet.",
    "folytasd_a_sort": "Gyümölcsökből kirakott sorozat szabályát felismerve folytatjuk a mintát.",
    "gyujtsd_es_rakd": "Terméseket válogatunk saját tálba megadott szempont szerint, akár versenyben.",
    "hol_a_parja": "Nagy terítő alatt kell megtalálni az összetartozó párokat.",
    "parkereso": "A képeket kirakjuk az asztalra, a párjukat a gyerekek kezébe adjuk. Minél gyorsabban egymásra kell tenni az összeillőket.",
    "mi_valtozott_meg": "Gyümölcsökkel játsszuk: megváltoztatjuk a darabszámot vagy a sorrendet, és megkeressük, mi lett más.",
    "valami_megvaltozott": "Tavaszhoz, méhekhez kapcsolódó tárgyakat teszünk sorba. Megfigyeljük, majd észrevesszük a változást: cserét, elvételt vagy hozzátételt.",
    "memoriabujocska": "Körben állunk, mondókára körbejárunk. Megállunk, egy gyereknek bekötjük a szemét, valaki pedig elbújik a körből. A hunyónak ki kell találnia, ki hiányzik.",
    "mi_van_a_kosaramban": "Letakart kosárban tapintással ismerjük fel a gyümölcsöket.",
    "mi_van_a_zsakban": "Zöldségeket ismerünk fel tapintással, a kézzel érzékelhető tulajdonságaik alapján.",
    "tapints_meg": "Letakart kosárba nyúlva, tapintással találjuk ki, mit fogtunk meg.",
    "zsakbamacska": "Zsákba rejtünk néhány jól ismert tárgyat, például fésűt, kulcsot, kanalat, almát. A gyerek egy kézzel benyúl, és tapintással felismeri őket.",
    "mit_rajzoltam_a_hatadra": "A gyerek hátára formát rajzolunk, neki pedig ki kell találnia, mi az.",
    "mit_visz_a_repulo": "A repülő csak játékokat szállít. Mindenki felel a kérdésre, de előbb megismétli, amit a társai mondtak.",
    "hol_csorog": "A kiscsoportosok megkeresik, honnan jön a csörgés. A középsősöknél már bekötjük a szemet, a nagyoknál pedig a párjuk navigálja a keresőt.",
    "hol_csorog_a_szancsengo": "A kisebbek megkeresik a csengés forrását a csoportszobában.",
    "melyik_allat_hangjat_hallod": "Ismert állatok hangfelvételét hallgatjuk meg, felismerjük és utánozzuk őket.",
    "melyik_jarmu_hangjat_hallod": "Járművek hangját hallgatjuk meg, felismerjük és utánozzuk őket.",
    "allatok_hangjanak_felismerese": "Állathangokat ismerünk fel; a helyes megfejtésért lábnyomot gyűjtünk.",
    "lovacska_hangjanak_utanzasa": "Mimetikus játékkal utánozzuk a lovacska hangját és mozgását.",
    "dobble": "Két kártyát összevetve megkeressük azt a képet, amelyik mindkettőn szerepel.",
    "jatek_a_bohocos_kartyakkal": "Bohócos kártyákkal gyakoroljuk a gyors felismerést és a fürge reagálást.",
    "matrixjatek": "Ötször ötös játéktáblát készítünk, és a megadott szabály szerint rakjuk ki a mezőket.",
    "szoges_tabla": "Szöges táblán gumival kerítünk be egy formát, a gyerek pedig ugyanazt rakja ki. Nehezíthetjük számmal vagy színnel is.",
    "szamlalunk": "Vásárfiákat ábrázoló számkártyákat készítünk; mindenki annyit vehet el, amennyit dobott.",
    "allatok_haza": "A dobókocka dönti el, melyik állat költözhet a házba.",
    "dobj_es_mozogj": "Élő társasjáték állatképekkel. Dobás után csak az léphet, aki felismeri az állatot, és mond rá egy jellemzőt.",
    "szinkereso": "A gyerekek választanak egy színt, majd megkeresik a környezetünkben lévő zöldségeken.",

    # --- Mozgásos és utánzó játékok ---
    "csinald_amit_mondok": "Elmondott feladatok pontos végrehajtása, babzsákkal vagy anélkül.",
    "csondben_add_tovabb": "Körben szorosan állva, a hátunk mögött adunk tovább egy tárgyat. A kör közepén álló postás próbálja tetten érni, kinél van.",
    "bizalomjatek": "Párban játsszuk: az egyik gyereknek bekötjük a szemét, a párja pedig szóban vezeti végig.",
    "bujkalo_nyuszi_tajekozodo_jatek": "Székeket helyezünk el a térben, a nyuszik pedig az elhangzó utasítás szerint bújnak el a róka elől.",
    "egeres": "A földre körülbelül egyméteres oldalú háromszöget rajzolunk, a csúcsainál három gyerek guggol átfogott térddel, ők a csuprok. A többiek láncban kerülgetik őket.",
    "horgaszos_jatek": "Körben ülünk, a kezünket a térdünk fölött tartjuk. A horgász körbejár, sorra megsimogatja a halacskákat, vagyis a kezeket, és közben mondókát mond. Az utolsó ütemnél rá akar ütni valakinek a kezére; ha sikerül, helyet cserélnek.",
    "hova_szall_a_pillango": "Mindenki kap egy pillangó ujjbábot, amely arra a testrészre száll, amelyiket mondjuk. Ha jól megy, már csak mutatjuk, és a gyerekek utánozzák.",
    "kapcsolodas_zenes_jatek": "Amíg szól a vidám zene, mozgásban vagyunk; amikor elhallgat, mindenki megáll.",
    "karmester": "Kijelölünk egy karmestert, aki kitalál és bemutat egy mozdulatsort, majd választ valakit, aki utánozza.",
    "korbe_korbe_ismerkedos_labdajatek": "Körben állva adogatjuk egymásnak a labdát, akár többel is egyszerre.",
    "lazitojatek": "Háton fekve követjük az utasításokat: lazítás, a jobb kar, majd a bal láb lengetése.",
    "mondd_el_mi_a_szabalya": "Körben ülünk vagy állunk, középen a labdával. Megfigyeljük, milyen rend szerint adjuk tovább; aki rájön a szabályra, elmondja, és beállhat a körbe.",
    "mosolyjatek": "Képeket vagy tárgyakat mutatunk. Amelyiknek örülni lehet, arra kissé nyitott ajakkal mosolygunk; a szomorúra nem.",
    "setalunk_guggolos_jatek": "Mondókázva körbesétálunk, és a záró csüccs szóra mindenki leguggol.",
    "utanozz_a_tukor_elott": "A tükör elé állunk egymás mellé. A kisebbek kéz- és lábemelést, integetést, fejbiccentést utánoznak, a nagyobbak hosszabb mozdulatsort.",
    "varazslojatek": "Az óvodapedagógus a varázsló. Egy gyerek kimegy, a bent maradóval közben történik valamilyen varázslat, és a visszatérőnek észre kell vennie, mi változott.",
    "az_en_csaladom": "Mindenki húz egyet a behozott családi fényképekből, és felismeri, kié. Utána beszélgetünk arról, hányan vannak a családban, ki kire hasonlít.",
    "gyere_velem_a_vasarba": "Piacot rendezünk be a csoportszobában, és játékpénzt készítünk hozzá.",

    # --- Csak a korpuszban szereplő anyanyelvi játékok ---
    "hopihe_fujasa": "Felakasztott vattapamacsot fújunk. A nagyobbaknál másféle könnyű anyagot is felakaszthatunk, és összevetjük, melyiket könnyebb megmozdítani.",
    "meseld_el_mi_tortent": "A szüreti mulatságról mesélnek a gyerekek a saját szavaikkal.",
    "postasjatek": "Sorban ülünk. Az első gyerek fülébe egy szót súgunk, ő továbbadja a szomszédjának, és a sor végén hangosan kimondják, mi jutott el odáig. A kisebbeknek szót, a nagyoknak már rövid mondatot is súghatunk.",
    "szolanc": "Sorban egymás után szavakat mondunk, amelyeket a következőnek meg kell jegyeznie és megismételnie. Törekszünk olyan szavakra, amelyekből mondat is összeáll.",
}

# A PDF-kinyerés két játék nevét néha egybeolvasztotta, vagy félbevágta. Ezek nem
# szerzői jogi kérdések, csak elrontott sorok — itt tesszük helyre őket.
JAVITAS: dict[str, str | None] = {
    # rossz sor -> helyes név (None = törlendő, mert nem maradt belőle semmi)
    "(versenyjáték)": None,
    "Szalaggyakorlat Lufidobálás (egyensúlyjáték)": "Lufidobálás (egyensúlyjáték)",
    "Szalaggyakorlat Lufidobálás (egyensúly játék)": "Lufidobálás (egyensúlyjáték)",
    "Body-roll gyakorlatok Pincérverseny (akadályverseny)": "Pincérverseny (akadályverseny)",
    "Buzogánygyakorlatok Csipeszes fogó (fogójáték)": "Csipeszes fogó (fogójáték)",
    "Találós kérdések az (anyanyelvi játék)": "Találós kérdések az állatokról (anyanyelvi játék)",
}

# A kiadvány ugyanazt a játékot hol a műfaj-megjelöléssel, hol anélkül nevezi meg.
# A rövid alak ugyanazt a leírást kapja, nem írjuk le kétszer.
for _hosszu, _rovid in [
    ("a_fele_sem_igaz_anyanyelvi_jatek", "a_fele_sem_igaz"),
    ("befejezetlen_mondat_anyanyelvi_jatek", "befejezetlen_mondat"),
    ("csendjatek_anyanyelvi_jatek", "csendjatek"),
    ("fujasok_anyanyelvi_jatek", "fujasok"),
    ("fujasok_valtozatosan_anyanyelvi_jatek", "fujasok_valtozatosan"),
    ("fuvogyakorlat_tollpihevel_anyanyelvi_jatek", "fuvogyakorlat_tollpihevel"),
    ("fuvogyakorlatok_termessel_anyanyelvi_jatek", "fuvogyakorlatok_termessel"),
    ("gyertyalang_tancoltatasa_anyanyelvi_jatek", "gyertyalang_tancoltatasa"),
    ("ha_hallod_a_hangot_tapsolj_anyanyelvi_jatek", "ha_hallod_a_hangot_tapsolj"),
    ("kishajo_fujasa_vizen_anyanyelvi_jatek", "kishajo_fujasa_vizen"),
    ("lufiember_anyanyelvi_jatek", "lufiember"),
    ("lufifujo_verseny_anyanyelvi_jatek", "lufifujo_verseny"),
    ("mit_latsz_a_kepen_anyanyelvi_jatek", "mit_latsz_a_kepen"),
    ("mondatalkotos_anyanyelvi_jatek", "mondatalkotos"),
    ("robotnyelv_anyanyelvi_jatek", "robotnyelv"),
    ("szivoszallal_hopehely_vattapamacs_fujasa_anyanyelvi_jatek", "szivoszallal_hopehely_vattapamacs_fujasa"),
    ("felakasztott_hopihek_vattapamacs_fujasa_anyanyelvi_jatek", "felakasztott_hopihek_vattapamacs_fujasa"),
]:
    UJ_LEIRAS.setdefault(_rovid, UJ_LEIRAS[_hosszu])
