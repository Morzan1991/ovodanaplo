# -*- coding: utf-8 -*-
"""Téli témák irodalmi anyaga — december, január, február. Lásd `base.py`."""

from .base import _t

_t("advent", [
    ("mondoka", None, "Gyertyafény, gyertyafény", "12", "gyertyagyújtáshoz"),
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", "adventi csend"),
    ("vers", "Donászy Magda", "Karácsonyi köszöntő", "12", ""),
    ("vers", "Weöres Sándor", "Száncsengő", "12", "várakozás, téli hangulat"),
    ("vers", "Kányádi Sándor", "Aki fázik", "23", ""),
    ("mese", "Fésűs Éva", "A négy gyertya", "123", "az adventi koszorú négy gyertyájáról"),
    ("mese", "Marék Veronika", "Kippkopp karácsonya", "12", ""),
    ("dal", None, "Ég a gyertya, ég", "123", "a gyertyagyújtás dala"),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("dal", None, "Ó, szép fenyő", "23", ""),
    ("zenehallgatas", None, "Adventi énekek — csendes válogatás", "123", "gyertyagyújtás alatt"),
])

_t("mikulas", [
    ("mondoka", None, "Mikulás, Mikulás, kedves Mikulás", "1", "a legkisebbeknek"),
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("vers", "Donászy Magda", "Mikulás", "12", ""),
    ("vers", "Donászy Magda", "Mikulás kérdezi", "123", ""),
    ("vers", "Mentovics Éva", "Mikulásváró", "12", ""),
    ("vers", "Weöres Sándor", "Száncsengő", "12", "a szán érkezése"),
    ("mese", None, "Szent Miklós legendája — az aranyalmák", "23", "a Mikulás eredete"),
    ("mese", "Fésűs Éva", "A Mikulás csizmája", "12", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", "a Mikulás-váró dal"),
    ("dal", "Donászy Magda", "Télapó itt van", "12", "megzenésített vers"),
    ("dal", None, "Mikulás, Mikulás, kedves Mikulás", "1", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Mikulás-dalok", "12", ""),
])

_t("luca_nap", [
    ("mondoka", None, "Luca, Luca, kity-koty", "23", "a hagyományos Luca-napi kotyoló"),
    ("mondoka", None, "Kis kertet kerítek", "12", "a Luca-búza elvetéséhez"),
    ("vers", "Gazdag Erzsi", "Luca napja", "23", ""),
    ("vers", "Kányádi Sándor", "Aki fázik", "23", ""),
    ("mese", None, "A Luca-szék meséje", "3", "népi hiedelem, hosszabb figyelmet kíván"),
    ("nepmese", None, "A kis gömböc", "3", ""),
    ("nepmese", None, "Az okos lány", "3", ""),
    ("dal", None, "Kis kece lányom", "23", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "123", "a Luca-napi tiltott és engedett munkák"),
    ("zenehallgatas", None, "Luca-napi kotyolók", "23", ""),
])

_t("fenyofa_diszek", [
    ("mondoka", None, "Töröm, töröm a mákot", "12", "díszek, sütemények készítéséhez"),
    ("mondoka", None, "Süssünk, süssünk valamit", "12", ""),
    ("vers", "Weöres Sándor", "Suttog a fenyves", "12", ""),
    ("vers", "Weöres Sándor", "Kis karácsonyi ének", "12", ""),
    ("vers", "Donászy Magda", "Karácsonyi köszöntő", "12", ""),
    ("mese", "Marék Veronika", "Kippkopp karácsonya", "12", ""),
    ("mese", "Fésűs Éva", "A kis fenyő", "12", "a fa, amelyik díszt kapott"),
    ("mese", "Hans Christian Andersen", "A kis fenyőfa", "3", "hosszabb, nagycsoportnak"),
    ("dal", None, "Ó, szép fenyő", "23", ""),
    ("dal", None, "Kis karácsony, nagy karácsony", "123", ""),
    ("dal", None, "Ég a gyertya, ég", "123", ""),
    ("zenehallgatas", "Pjotr Iljics Csajkovszkij", "Diótörő — Virágkeringő", "23", "díszítés közben"),
])

_t("karacsony", [
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("mondoka", None, "Gyertyafény, gyertyafény", "12", ""),
    ("vers", "Weöres Sándor", "Kis karácsonyi ének", "12", ""),
    ("vers", "Donászy Magda", "Karácsonyi köszöntő", "12", ""),
    ("vers", "József Attila", "Betlehemi királyok", "3", ""),
    ("vers", "Weöres Sándor", "Száncsengő", "12", ""),
    ("mese", "Marék Veronika", "Kippkopp karácsonya", "12", ""),
    ("mese", "Fésűs Éva", "A karácsonyi kismadár", "12", ""),
    ("mese", None, "A betlehemi történet — egyszerű elbeszélésben", "23", ""),
    ("dal", None, "Kis karácsony, nagy karácsony", "123", ""),
    ("dal", None, "Pásztorok, pásztorok", "23", ""),
    ("dal", None, "Mennyből az angyal", "23", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("zenehallgatas", None, "Csendes éj — hangszeres feldolgozás", "123", ""),
])

_t("mezeskalacs", [
    ("mondoka", None, "Süssünk, süssünk valamit", "12", "a hét fő mondókája"),
    ("mondoka", None, "Töröm, töröm a mákot", "12", ""),
    ("mondoka", None, "Süti, süti pogácsát", "1", "tapsoltató"),
    ("vers", "Gazdag Erzsi", "Kenyérsütés", "12", ""),
    ("vers", "Donászy Magda", "Karácsonyi köszöntő", "12", ""),
    ("mese", None, "A mézeskalács kisfiú", "12", "ismétlődő szerkezet, könnyen bekapcsolódnak"),
    ("nepmese", None, "Jancsi és Juliska", "3", "mézeskalács-házikó, bátrabb csoportnak"),
    ("dal", None, "Süt a pék", "12", ""),
    ("dal", None, "Süssünk, süssünk valamit", "12", ""),
    ("dal", None, "Kis karácsony, nagy karácsony", "123", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "123", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Karácsonyi dalok", "12", ""),
])

_t("teli_madaretetes", [
    ("mondoka", None, "Csip-csip csóka", "1", ""),
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("vers", "Móra Ferenc", "A cinege cipője", "123", "a téli madáretetés klasszikus verse"),
    ("vers", "Tamkó Sirató Károly", "Csivitelő", "12", "madárhang-utánzás"),
    ("vers", "Nemes Nagy Ágnes", "Téli reggel", "12", ""),
    ("vers", "Zelk Zoltán", "Téli rege", "23", ""),
    ("mese", "Fésűs Éva", "A karácsonyi kismadár", "12", ""),
    ("nepmese", None, "A kóró és a kismadár", "23", ""),
    ("nepmese", None, "A vadgalamb és a szarka", "23", ""),
    ("dal", None, "Csip-csip csóka", "1", "ölbeli játék dallammal"),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("dal", None, "Hess, páva, hess, páva", "23", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Madárdalok", "12", ""),
])

_t("teli_oltozkodes", [
    ("mondoka", None, "Hüvelykujjam almafa", "12", "kesztyűhúzás előtt, ujjtorna"),
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("mondoka", None, "Kerekecske, dombocska", "1", ""),
    ("vers", "Móra Ferenc", "A cinege cipője", "123", "cipő, öltözék, télre készülés"),
    ("vers", "Nemes Nagy Ágnes", "Téli reggel", "12", ""),
    ("vers", "Móra Ferenc", "A didergő király", "3", "hosszabb, nagycsoportnak"),
    ("nepmese", None, "A kesztyű", "12", "kesztyű, meleg, befogadás"),
    ("mese", "Fésűs Éva", "Csupafül", "12", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("dal", None, "Esik a hó, fúj a szél", "12", ""),
    ("korjatek", None, "Aki nem lép egyszerre", "123", "csizmás menetelés"),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — Tél (részlet)", "23", ""),
])

_t("teli_sportok", [
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("mondoka", None, "Hinta, palinta", "12", "lendület, egyensúly"),
    ("vers", "Weöres Sándor", "Száncsengő", "12", "szánkózás"),
    ("vers", "Weöres Sándor", "Haragosi", "23", "mozgásra hívó ritmus"),
    ("vers", "Nemes Nagy Ágnes", "Téli reggel", "12", ""),
    ("vers", "Zelk Zoltán", "Téli rege", "23", ""),
    ("mese", "Fésűs Éva", "A hóember szíve", "12", ""),
    ("mese", "Zelk Zoltán", "A három nyúl", "23", "havas erdő"),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("dal", None, "Esik a hó, fúj a szél", "12", ""),
    ("korjatek", None, "Tüzet viszek", "123", "futójáték a hóban is"),
    ("korjatek", None, "Kinn a bárány, benn a farkas", "12", ""),
])

_t("ho_es_jeg", [
    ("mondoka", None, "Hull a hó, hull a hó", "1", ""),
    ("mondoka", None, "Csipp, csepp, egy csepp", "1", "olvadás, csepegés"),
    ("vers", "Weöres Sándor", "Olvadás", "123", "a jég és a víz átalakulása"),
    ("vers", "Nemes Nagy Ágnes", "Téli reggel", "12", ""),
    ("vers", "Weöres Sándor", "Száncsengő", "12", ""),
    ("vers", "Zelk Zoltán", "Téli rege", "23", ""),
    ("mese", "Fésűs Éva", "A hóember szíve", "12", ""),
    ("mese", "Hans Christian Andersen", "A hókirálynő — részlet", "3", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("dal", None, "Esik a hó, fúj a szél", "12", ""),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — Tél (részlet)", "23", "a kísérletek alatt"),
])

_t("magyar_kultura", [
    ("mondoka", None, "Egyedem-begyedem, tengertánc", "123", "népi kiszámoló mint hagyomány"),
    ("mondoka", None, "Hej, Vargáné", "23", ""),
    ("vers", "Weöres Sándor", "Csiribiri", "123", ""),
    ("vers", "Petőfi Sándor", "Anyám tyúkja", "23", ""),
    ("vers", "Arany János", "Rege a csodaszarvasról (részlet)", "3", "eredetmonda"),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "123", ""),
    ("nepmese", None, "Fehérlófia", "3", "a magyar népmesekincs csúcsa, részletekben mesélve"),
    ("nepmese", None, "A só", "3", ""),
    ("dal", None, "Tavaszi szél vizet áraszt", "23", "a legismertebb magyar népdal"),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("dal", None, "Kis kece lányom", "23", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("zenehallgatas", "Kodály Zoltán", "Háry János — Intermezzo", "23", ""),
    ("zenehallgatas", "Bartók Béla", "Gyermekeknek — részletek", "23", "népdalfeldolgozások"),
])

_t("farsang", [
    ("mondoka", None, "Zsipp-zsupp, kenderzsupp", "12", "vidám, pörgős"),
    ("mondoka", None, "Egyedem-begyedem, tengertánc", "123", ""),
    ("vers", "Gazdag Erzsi", "Itt a farsang, áll a bál", "123", "a farsang klasszikus verse"),
    ("vers", "Weöres Sándor", "Haragosi", "23", ""),
    ("vers", "Weöres Sándor", "A tündér", "12", "jelmez, átváltozás"),
    ("mese", "Fésűs Éva", "A tréfás manó", "12", ""),
    ("nepmese", None, "A kis gömböc", "3", "vidám, hangos mese"),
    ("mese", None, "A busójárás története", "23", "télűzés, maszkok"),
    ("dal", None, "Egy boszorka van", "123", "jelmezes körjáték"),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("dal", None, "Most viszik, most viszik Danikáné lányát", "23", ""),
    ("korjatek", None, "Egyszer egy királyfi", "23", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Maszkabál", "123", "a farsang dala"),
])

_t("matyas_nap", [
    ("mondoka", None, "Mátyás, Mátyás, jégtörő", "23", "népi időjárás-jóslás"),
    ("mondoka", None, "Süss fel, nap", "12", ""),
    ("vers", "Weöres Sándor", "Olvadás", "123", "a néphit szerint Mátyás jeget tör"),
    ("vers", "Arany János", "Mátyás anyja (részlet)", "3", ""),
    ("nepmese", None, "Mátyás király és az okos lány", "3", ""),
    ("nepmese", None, "A rátóti csikótojás", "3", "Mátyás-mesekör, humor"),
    ("nepmese", None, "Az okos lány", "3", ""),
    ("mese", "Fésűs Éva", "A tréfás manó", "12", ""),
    ("dal", None, "Kis kece lányom", "23", ""),
    ("dal", None, "Most jöttem Erdélyből", "3", ""),
    ("korjatek", None, "Adj, király, katonát", "3", "királyos csoportjáték"),
    ("zenehallgatas", "Kodály Zoltán", "Háry János — Intermezzo", "23", ""),
])
