# -*- coding: utf-8 -*-
"""Őszi témák irodalmi anyaga — lásd `korpusz/base.py`."""

from .base import _t

# ============================================================================
# ŐSZ — szeptember, október, november
# ============================================================================

_t("tanevkezdes", [
    ("mondoka", None, "Sétálunk, sétálunk", "12", "körben járva, a névsor helyett is jó"),
    ("mondoka", None, "Ecc, pecc, kimehetsz", "123", "kiszámoló a játékok elosztásához"),
    ("mondoka", None, "Egyedem-begyedem, tengertánc", "123", "kiszámoló"),
    ("mondoka", None, "Hüvelykujjam almafa", "12", "ujjakkal játszható, ismerkedéshez"),
    ("mondoka", None, "Kerekecske, dombocska", "1", "ölbeli játék a beszoktatáshoz"),
    ("vers", "Zelk Zoltán", "Este jó, este jó", "123", "az otthon és az óvoda közti átmenethez"),
    ("vers", "Weöres Sándor", "Csiribiri", "123", "ritmusa megnyugtat, könnyen tanul"),
    ("mese", "Marék Veronika", "Boribon és Annipanni", "12", "elválás, biztonság"),
    ("mese", "Bartos Erika", "Bogyó és Babóca — Az új barát", "12", "ismerkedés az új gyerekekkel"),
    ("mese", "Marék Veronika", "Kippkopp és Tipptopp", "23", "barátkozás, együttlét"),
    ("dal", None, "Süss fel, nap", "12", "az első közös éneklésekhez"),
    ("dal", None, "Sétálunk, sétálunk", "12", "énekes séta a csoportszobában"),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", "csoportkovácsoló körjáték"),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", "kapus játék, mindenki sorra kerül"),
    ("zenehallgatas", "Gryllus Vilmos", "Maszkabál — válogatás", "123", "ismerkedő, oldott hangulathoz"),
])

_t("osz_kezdete", [
    ("mondoka", None, "Ess, eső, ess", "12", "az első őszi esőkhöz"),
    ("mondoka", None, "Csiga-biga, gyere ki", "12", "eső után, az udvaron"),
    ("vers", "Gazdag Erzsi", "Itt van az ősz", "123", "rövid, jól tanulható évszakvers"),
    ("vers", "Weöres Sándor", "Galagonya", "123", "őszi hangulat, gyönyörű ritmus"),
    ("vers", "Mentovics Éva", "Falevél", "12", "a lehulló levelekről"),
    ("vers", "Petőfi Sándor", "Itt van az ősz, itt van újra", "3", "csak az első versszak"),
    ("vers", "Nemes Nagy Ágnes", "Szeptember", "23", "az évszakváltásról"),
    ("mese", "Fésűs Éva", "Az őszi falevél", "12", "rövid, képekben gazdag"),
    ("nepmese", None, "A kóró és a kismadár", "23", "láncmese, remek ismétlődő szerkezet"),
    ("dal", None, "Ess, eső, ess", "12", "népi énekes játék"),
    ("dal", None, "Hopp, Juliska", "12", "párcserés énekes játék"),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Ősz", "123", ""),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — Ősz (részlet)", "23", "csendes pihenőhöz"),
])

_t("osz_termenyek", [
    ("mondoka", None, "Egy, megérett a meggy", "12", "számoló mondóka gyümölcsökkel"),
    ("mondoka", None, "Erre csörög a dió", "12", "bújócskás játék dióval"),
    ("mondoka", None, "Hüvelykujjam almafa", "12", "mondóka ujjakkal, az almafáról"),
    ("mondoka", None, "Csipp, csepp, egy csepp", "1", "rövid, gyümölcsmosáshoz"),
    ("vers", "Gazdag Erzsi", "Itt van az ősz", "123", ""),
    ("vers", "Weöres Sándor", "Galagonya", "123", "őszi bokor, gyümölcstermés"),
    ("vers", "Osvát Erzsébet", "Ősz elején", "23", ""),
    ("vers", "Csanádi Imre", "Naptár — Szeptember", "3", "hónapvers a betakarításról"),
    ("mese", "Szutyejev", "Az alma", "12", "osztozkodás, igazságosság"),
    ("nepmese", None, "A kismalac és a farkasok", "23", "őszi éléskamra, télre készülés"),
    ("dal", None, "Érik a szőlő", "123", "klasszikus szüreti énekes játék"),
    ("dal", None, "Lipem-lopom a szőlőt", "123", "szüreti énekes játék"),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", "szüreti mulatsághoz"),
    ("zenehallgatas", None, "Szüreti népdalcsokor", "123", "hangulatteremtéshez"),
])

# A mindenszentek hete csendes, megemlékező hét — nincs saját óvodai versanyaga,
# ezért a KORPUSZBAN MÁR SZEREPLŐ, valódi művek közül a halk, esti, családi
# hangulatúak kerülnek ide. Új művet szándékosan nem veszünk fel: a téma köré
# nem épült önálló óvodai repertoár, kitalálni pedig nem szabad.
_t("mindenszentek", [
    ("mondoka", None, "Gyertyafény, gyertyafény", "12", "gyertyagyújtás előtt, halkan"),
    ("mondoka", None, "Ess, eső, ess", "12", "borongós novemberi időhöz"),
    ("vers", "Donászy Magda", "Nagyanyónak", "12", "a családi emlékezéshez"),
    ("vers", "Zelk Zoltán", "Este jó, este jó", "123", "nyugodt, esti hangulat"),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", "csendes, ködös kép"),
    ("vers", "Arany János", "Családi kör (részlet)", "3", "a család együttléte, hosszabb figyelem"),
    ("mese", "Fésűs Éva", "Az őszi falevél", "12", "az elmúlás gyermeknyelven"),
    ("mese", "Fésűs Éva", "A ködmanó", "12", "novemberi, ködös hangulat"),
    ("anyanyelvi", None, "Csendjáték", "123", "Leülünk vagy lefekszünk a szőnyegre, és egy ideig csak a környező hangokra figyelünk. Az ünnep csendjére hangol."),
    ("dal", None, "Ég a gyertya, ég", "123", "körjáték a gyertyaláng köré"),
    ("altato", None, "Tente, baba, tente", "1", "megnyugtató zárás"),
    ("altato", None, "Aludj, baba, aludjál", "1", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Ősz", "12", ""),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — Ősz (részlet)", "23", ""),
    ("zenehallgatas", "Kodály Zoltán", "Gyermek- és női karok — részletek", "3", "halk, többszólamú hangzás"),
])

_t("osz_szinek", [
    ("mondoka", None, "Ess, eső, ess", "12", ""),
    ("mondoka", None, "Szél, szél, fúj a szél", "1", "levélkavargás utánzásához"),
    ("vers", "Mentovics Éva", "Falevél", "12", "a levelek színeiről"),
    ("vers", "Gazdag Erzsi", "Itt van az ősz", "123", ""),
    ("vers", "Nemes Nagy Ágnes", "Lila fecske", "12", "színek és madarak"),
    ("vers", "Kányádi Sándor", "Az elveszett követ", "3", "őszi kép, hosszabb figyelmet kíván"),
    ("vers", "Szabó Lőrinc", "Falusi hangverseny", "3", ""),
    ("mese", "Fésűs Éva", "Az őszi falevél", "12", ""),
    ("mese", "Zelk Zoltán", "A három nyúl", "23", "őszi-téli erdő"),
    ("dal", None, "Hull a szilva a fáról", "123", "őszi népdal, körjátékkal"),
    ("dal", None, "Érik a szőlő", "123", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — Ősz (részlet)", "23", ""),
])

_t("kodos_oszi_ido", [
    ("mondoka", None, "Ess, eső, ess", "12", ""),
    ("mondoka", None, "Csiga-biga, gyere ki", "12", "eső utáni sétához"),
    ("mondoka", None, "Süss fel, nap", "12", "borús idő után"),
    ("vers", "Zelk Zoltán", "Őszi mese", "23", ""),
    ("vers", "Nemes Nagy Ágnes", "Nyári rajz", "23", "összehasonlításnak a nyári képpel"),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", "csendes, ködös hangulat"),
    ("mese", "Fésűs Éva", "A ködmanó", "12", "a köd megszemélyesítése"),
    ("nepmese", None, "A vadgalamb és a szarka", "23", "fészeképítés esős időben"),
    ("dal", None, "Esik az eső", "12", ""),
    ("dal", None, "Ess, eső, ess", "12", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Esőcseppek", "12", "csendes pihenőhöz"),
])

_t("tok_fesztival", [
    ("mondoka", None, "Töröm, töröm a mákot", "12", "őrlő-mozdulat, konyhai munkákhoz"),
    ("mondoka", None, "Egy, megérett a meggy", "12", "számoló mondóka a termésekhez"),
    ("vers", "Osvát Erzsébet", "Ősz elején", "23", ""),
    ("vers", "Weöres Sándor", "Galagonya", "123", ""),
    ("mese", "Fésűs Éva", "A tökkelütött manó", "12", ""),
    ("nepmese", None, "A kis gömböc", "3", "vidám, ismétlődő szerkezetű"),
    ("nepmese", None, "A répa", "12", "óriás termés, közös erőfeszítés"),
    ("dal", None, "Hull a szilva a fáról", "123", ""),
    ("dal", None, "Érik a szőlő", "123", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "123", "őszi vitaminok, savanyítás"),
    ("zenehallgatas", None, "Szüreti népdalcsokor", "123", ""),
])

_t("egeszseges_eletmod", [
    ("mondoka", None, "Egy, megérett a meggy", "12", "gyümölcsök megnevezése"),
    ("mondoka", None, "Csipp, csepp, egy csepp", "1", "kézmosáshoz"),
    ("mondoka", None, "Töröm, töröm a mákot", "12", ""),
    ("vers", "Nemes Nagy Ágnes", "Gesztenyefalevél", "23", ""),
    ("vers", "Osvát Erzsébet", "Répa, retek, mogyoró", "12", "nyelvtörő is egyben"),
    ("mese", "Szutyejev", "Az alma", "12", "osztozkodás gyümölcsön"),
    ("nepmese", None, "A répa", "12", ""),
    ("mese", "Bartos Erika", "Bogyó és Babóca — a beteg katica", "12", "gondoskodás, gyógyulás"),
    ("dal", None, "Süt a pék", "12", "egészséges reggeli, kenyérsütés"),
    ("dal", None, "Hej, Vargáné káposztát főz", "123", ""),
    ("korjatek", None, "Érik a szőlő", "123", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Vitaminok", "12", ""),
])

_t("allatok_vilagnapja", [
    ("mondoka", None, "Csip-csip csóka", "1", "ölbeli játék madárral"),
    ("mondoka", None, "Egy kispipi, két kispipi", "1", "számoló mondóka"),
    ("mondoka", None, "Sárga csikó, csengő rajta", "12", ""),
    ("vers", "Tamkó Sirató Károly", "Pinty és ponty", "12", "állatnevek, remek ritmus"),
    ("vers", "Tamkó Sirató Károly", "Ha én cica volnék", "12", ""),
    ("vers", "Petőfi Sándor", "Anyám tyúkja", "23", "az állat mint családtag"),
    ("vers", "Nemes Nagy Ágnes", "Bors néni", "23", ""),
    ("mese", "Zelk Zoltán", "A három nyúl", "23", ""),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "123", "a legismertebb magyar állatmese"),
    ("mese", "Jakob és Wilhelm Grimm", "A brémai muzsikusok", "23", "állatok összefogása"),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("dal", None, "Egy kis malac", "1", ""),
    ("dal", None, "Cica, cica, cifra", "1", ""),
    ("dal", None, "Én elmentem a vásárba", "23", "állathangok halmozódó felsorolása"),
    ("korjatek", None, "Erre kakas, erre tyúk", "12", ""),
    ("zenehallgatas", "Camille Saint-Saëns", "Az állatok farsangja (részletek)", "23", "hangszerek és állatok párosítása"),
])

_t("haziallatok_kicsinyei", [
    ("mondoka", None, "Egy kispipi, két kispipi", "1", ""),
    ("mondoka", None, "Gyí, te, lovam", "1", "lovagoltató"),
    ("mondoka", None, "Sárga csikó, csengő rajta", "12", ""),
    ("mondoka", None, "Csip-csip csóka", "1", ""),
    ("vers", "Zelk Zoltán", "Párácska", "12", "anya és kicsinye"),
    ("vers", "Petőfi Sándor", "Anyám tyúkja", "23", ""),
    ("vers", "Tamkó Sirató Károly", "Sárga csizmás Mátyás", "12", ""),
    ("nepmese", None, "A farkas és a hét kecskegida", "12", "anya-kicsi, óvatosság"),
    ("nepmese", None, "A kismalac és a farkasok", "23", ""),
    ("mese", "Csukás István", "Süsü, a sárkány — részlet", "23", ""),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("dal", None, "Egy kis malac", "1", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
    ("dal", None, "Bárány, bárány, hat bárány", "12", "számolós dal"),
    ("korjatek", None, "Erre kakas, erre tyúk", "12", ""),
    ("korjatek", None, "Csömödöri legelőn", "23", ""),
])

_t("erdo_allatai", [
    ("mondoka", None, "Erdő szélén házikó", "12", ""),
    ("mondoka", None, "Erre csörög a dió", "12", "mókus téli készlete"),
    ("vers", "Zelk Zoltán", "Téli rege", "23", ""),
    ("vers", "Nemes Nagy Ágnes", "Mackó-mese", "12", ""),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", ""),
    ("mese", "Zelk Zoltán", "A három nyúl", "23", "erdei állatok, félelem és bátorság"),
    ("mese", "Fésűs Éva", "Csupafül", "12", "nyuszi-mese, télre készülés"),
    ("nepmese", None, "A kóró és a kismadár", "23", ""),
    ("nepmese", None, "A vadgalamb és a szarka", "23", "fészeképítés, tanulság"),
    ("dal", None, "Erdő mellett nem jó lakni", "23", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("korjatek", None, "Kinn a bárány, benn a farkas", "12", "fogójáték énekkel"),
    ("zenehallgatas", "Camille Saint-Saëns", "Az állatok farsangja (részletek)", "23", ""),
])

_t("erdok_napja", [
    ("mondoka", None, "Erdő szélén házikó", "12", ""),
    ("vers", "Kányádi Sándor", "Fenyőfa-mondóka", "12", ""),
    ("vers", "Nemes Nagy Ágnes", "Gesztenyefalevél", "23", ""),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", ""),
    ("vers", "Szabó Lőrinc", "Falusi hangverseny", "3", ""),
    ("mese", "Zelk Zoltán", "A három nyúl", "23", ""),
    ("mese", "Fésűs Éva", "A csodálatos nyárfa", "23", "fa-tisztelet, természetvédelem"),
    ("nepmese", None, "A kóró és a kismadár", "23", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "23", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Erdei dalok", "12", ""),
])

_t("kenyer_utja", [
    ("mondoka", None, "Süssünk, süssünk valamit", "12", "sütés-mondóka, énekelve is"),
    ("mondoka", None, "Töröm, töröm a mákot", "12", "őrlés, malom"),
    ("mondoka", None, "Ettem szőlőt, most érik", "23", ""),
    ("vers", "Gazdag Erzsi", "Kenyérsütés", "12", ""),
    ("vers", "Csanádi Imre", "Naptár — Augusztus", "3", "aratás"),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "123", ""),
    ("mese", "Fésűs Éva", "A kenyér meséje", "12", ""),
    ("nepmese", None, "A só", "3", "az étel és a munka becsülete, hosszabb mese"),
    ("dal", None, "Süt a pék", "12", ""),
    ("dal", None, "Süssünk, süssünk valamit", "12", ""),
    ("dal", None, "Három szabó legények", "23", "mesterségek dala"),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "123", ""),
    ("zenehallgatas", None, "Aratódal-csokor", "23", ""),
])

_t("marton_nap", [
    ("mondoka", None, "Aki Márton napján libát nem eszik", "23", "népi időjóslás, közmondás"),
    ("mondoka", None, "Gólya, gólya, gilice", "12", "vándormadarak elbúcsúztatása"),
    ("vers", "Gazdag Erzsi", "Márton napja", "12", ""),
    ("vers", "Kányádi Sándor", "Novemberi szél", "23", ""),
    ("mese", None, "Szent Márton legendája — a megosztott köpeny", "23", "segítőkészség, adakozás"),
    ("nepmese", None, "A hiszékeny farkas", "23", ""),
    ("dal", None, "Hess, páva, hess, páva", "23", "szárnyasok, népdal"),
    ("dal", None, "Én elmentem a vásárba", "23", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", "lámpásos felvonulás előtti bemelegítés"),
    ("zenehallgatas", None, "Lámpásos vonulódal-csokor", "123", ""),
])

_t("erzsebet_katalin", [
    ("mondoka", None, "Hej, Vargáné", "23", "névnapköszöntő"),
    ("mondoka", None, "Katalinka, szállj el", "12", ""),
    ("vers", "Donászy Magda", "Névnapi köszöntő", "12", ""),
    ("vers", "Kányádi Sándor", "Novemberi szél", "23", ""),
    ("mese", None, "Szent Erzsébet és a rózsacsoda", "23", "a hét névadó legendája"),
    ("nepmese", None, "Az okos lány", "3", "leleményesség"),
    ("dal", None, "Már megjöttünk ez helyre", "123", "köszöntő dal"),
    ("dal", None, "Hej, Vargáné káposztát főz", "123", ""),
    ("korjatek", None, "Fehér liliomszál", "123", "rózsa-motívum, körtánc"),
    ("zenehallgatas", None, "Névnapköszöntő népdalok", "23", ""),
])

_t("csalad", [
    ("mondoka", None, "Ez elment vadászni", "1", "mondóka a családtagokról, ujjakon számolva"),
    ("mondoka", None, "Kerekecske, dombocska", "1", ""),
    ("mondoka", None, "Höc, höc, katona", "1", "ölbeli lovagoltató"),
    ("vers", "Zelk Zoltán", "Este jó, este jó", "123", "a család esti együttléte"),
    ("vers", "József Attila", "Altató", "23", ""),
    ("vers", "Orgoványi Anikó", "Az én nagymamám", "123", ""),
    ("vers", "Donászy Magda", "Nagyanyónak", "123", ""),
    ("vers", "Arany János", "Családi kör (részlet)", "3", ""),
    ("mese", "Marék Veronika", "Boribon és Annipanni", "12", ""),
    ("mese", "Janikovszky Éva", "Ha én felnőtt volnék — részlet", "3", ""),
    ("nepmese", None, "A farkas és a hét kecskegida", "12", ""),
    ("dal", None, "Süss fel, nap", "12", ""),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("altato", None, "Tente, baba, tente", "1", ""),
    ("altato", None, "Aludj, baba, aludjál", "1", ""),
    ("zenehallgatas", "Halász Judit", "Micimackó", "12", ""),
])

_t("otthonunk", [
    ("mondoka", None, "Erdő szélén házikó", "12", "ház-mondóka mozdulatokkal"),
    ("mondoka", None, "Kis kertet kerítek", "12", ""),
    ("vers", "Zelk Zoltán", "Este jó, este jó", "123", ""),
    ("vers", "Nemes Nagy Ágnes", "Ki ette meg a nyarat?", "23", ""),
    ("vers", "Arany János", "Családi kör (részlet)", "3", ""),
    ("mese", "Marék Veronika", "Kippkopp és Tipptopp", "23", "otthonteremtés"),
    ("nepmese", None, "A három kismalac", "12", "házépítés, kitartás"),
    ("nepmese", None, "A kesztyű", "12", "befogadás, közös otthon"),
    ("dal", None, "Ég a gyertya, ég", "123", ""),
    ("dal", None, "Süss fel, nap", "12", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
])

_t("testunk", [
    ("mondoka", None, "Kerekecske, dombocska", "1", "testrészek megnevezése"),
    ("mondoka", None, "Hüvelykujjam almafa", "12", "ujjak, finommotorika"),
    ("mondoka", None, "Ez elment vadászni", "1", ""),
    ("mondoka", None, "Csipp, csepp, egy csepp", "1", "kézmosás"),
    ("vers", "Weöres Sándor", "Haragosi", "23", "mozgásra hívó ritmus"),
    ("vers", "Nemes Nagy Ágnes", "Tíz ujjam", "12", ""),
    ("vers", "Tamkó Sirató Károly", "Pinty és ponty", "12", ""),
    ("mese", "Bartos Erika", "Bogyó és Babóca — a beteg katica", "12", ""),
    ("nepmese", None, "A kesztyű", "12", ""),
    ("dal", None, "Hüvelykujjam", "1", ""),
    ("dal", None, "Kis kacsa fürdik", "1", "fürdés, tisztálkodás"),
    ("korjatek", None, "Tüzet viszek", "123", "futás, testérzet"),
    ("zenehallgatas", "Gryllus Vilmos", "Mosakodás", "12", ""),
])

_t("szinek_formak", [
    ("mondoka", None, "Katalinka, szállj el", "12", "piros-fekete, pöttyök"),
    ("mondoka", None, "Egy, kettő, három, négy", "12", ""),
    ("vers", "Nemes Nagy Ágnes", "Lila fecske", "12", "színek a képzeletben"),
    ("vers", "Mentovics Éva", "Falevél", "12", ""),
    ("vers", "Weöres Sándor", "Csiribiri", "123", ""),
    ("mese", "Fésűs Éva", "A szivárvány meséje", "12", ""),
    ("mese", "Szutyejev", "A vidám kiskacsa", "12", ""),
    ("dal", None, "Cifra palota", "23", "színek a szövegben"),
    ("dal", None, "Cica, cica, cifra", "1", ""),
    ("korjatek", None, "Fehér liliomszál", "123", ""),
    ("korjatek", None, "Csön, csön, gyűrű", "12", "formák, kör"),
])

_t("kozlekedes", [
    ("mondoka", None, "Ziki-zaka zakatol", "12", "vonat-ritmus"),
    ("mondoka", None, "Megy a hajó a Dunán", "12", ""),
    ("mondoka", None, "Poros úton", "12", ""),
    ("vers", "Gazdag Erzsi", "Megy a vonat", "123", ""),
    ("vers", "Mentovics Éva", "A közlekedés fortélyai", "23", "szabályok, biztonság"),
    ("vers", "Tamkó Sirató Károly", "Tengereczki Pál", "23", "utazás, képzelet"),
    ("mese", "Csukás István", "Pom Pom meséi — részlet", "23", ""),
    ("mese", "Bálint Ágnes", "Mazsola és Tádé — részlet", "12", ""),
    ("dal", None, "Megy a gőzös", "12", ""),
    ("dal", None, "Ennek a gazdának szép kocsija van", "23", ""),
    ("dal", None, "A part alatt", "23", ""),
    ("korjatek", None, "Aki nem lép egyszerre", "123", "menetelés, ütemtartás"),
    ("zenehallgatas", "Gryllus Vilmos", "Bicikli", "12", ""),
])

_t("foglalkozasok", [
    ("mondoka", None, "Jákobnak volt hat fia", "23", "mesterségek felsorolása"),
    ("mondoka", None, "Süssünk, süssünk valamit", "12", ""),
    ("mondoka", None, "Töröm, töröm a mákot", "12", ""),
    ("vers", "Fazekas Anna", "Fűrész, fejsze, kalapács", "123", "szerszámok, kézműves munka"),
    ("vers", "Gazdag Erzsi", "Kenyérsütés", "12", ""),
    ("vers", "Csanádi Imre", "A kőműves", "23", ""),
    ("mese", "Fésűs Éva", "Az ezüst hegedű", "23", ""),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "123", ""),
    ("nepmese", None, "Az okos lány", "3", ""),
    ("dal", None, "Süt a pék", "12", ""),
    ("dal", None, "Három szabó legények", "23", ""),
    ("dal", None, "Ennek a gazdának szép kocsija van", "23", ""),
    ("korjatek", None, "Komámasszony, hol az olló?", "23", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "123", ""),
])

_t("baratsag", [
    ("mondoka", None, "Sétálunk, sétálunk", "12", "párban, kézen fogva"),
    ("mondoka", None, "Erre csörög a dió", "12", "egymásra figyelés"),
    ("vers", "Petőfi Sándor", "Arany Lacinak (részlet)", "23", ""),
    ("vers", "Weöres Sándor", "Csiribiri", "123", ""),
    ("vers", "Nemes Nagy Ágnes", "Bors néni", "23", ""),
    ("mese", "Bartos Erika", "Bogyó és Babóca — Az új barát", "12", ""),
    ("mese", "Marék Veronika", "Kippkopp és Tipptopp", "23", ""),
    ("mese", "Lázár Ervin", "A Négyszögletű Kerek Erdő — részlet", "3", "elfogadás, másság"),
    ("nepmese", None, "A kesztyű", "12", "befogadás, összetartozás"),
    ("mese", "Jakob és Wilhelm Grimm", "A brémai muzsikusok", "23", "összefogás"),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
    ("korjatek", None, "Csön, csön, gyűrű", "12", ""),
])

_t("olvasni_jo", [
    ("mondoka", None, "Kinyitom a könyvet", "12", "könyvvel bánás, ráhangoló"),
    ("mondoka", None, "Egyedem-begyedem, tengertánc", "123", ""),
    ("vers", "Gazdag Erzsi", "Mesebolt", "123", ""),
    ("vers", "Mentovics Éva", "Meseország", "123", ""),
    ("vers", "Weöres Sándor", "Bóbita", "12", ""),
    ("vers", "Móra Ferenc", "Zengő ABC", "3", "betűk, iskola-előkészítés"),
    ("mese", "Lázár Ervin", "A Négyszögletű Kerek Erdő — részlet", "3", ""),
    ("mese", "Csukás István", "Pom Pom meséi — részlet", "23", "a mesélés öröméről"),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "123", ""),
    ("nepmese", None, "Az égig érő paszuly", "3", ""),
    ("dal", "Weöres Sándor", "Bóbita, bóbita táncol", "123", "megzenésített vers"),
    ("korjatek", None, "Egyszer egy királyfi", "23", ""),
    ("zenehallgatas", "Halász Judit", "Bóbita", "12", ""),
])
