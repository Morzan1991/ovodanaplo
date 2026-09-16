# -*- coding: utf-8 -*-
"""
Korosztályos kiegészítések — főként nagycsoportos ének-zene és irodalom.

MIÉRT KÜLÖN FÁJL: az évszakos részekben a mű ott szerepel, ahol témába vág. Az
első ellenőrzés viszont azt mutatta, hogy a nagycsoport (5–7 év) ének-zene
listái soványak: a klasszikus ölbeli és egyszerű énekes játékok (Boci-boci,
Süss fel nap) a kicsiké, a nagyoknak összetettebb, több szereplős népi játék és
igazi népdal való. Itt pótoljuk ezeket, témánként.

Ugyanígy pótoljuk azokat a témákat, ahol a kiscsoportnak (3–4 év) volt kevés
rövid, ölbeli anyaga.
"""

from .base import _t

# --- Ősz ---------------------------------------------------------------------

_t("tanevkezdes", [
    ("dal", None, "Ég a gyertya, ég", "23", "közös körjáték a csoport összeszokásához"),
    ("korjatek", None, "Csön, csön, gyűrű", "23", "figyelem, egymásra hangolódás"),
    ("dal", None, "Hej, Vargáné káposztát főz", "3", ""),
])

_t("osz_kezdete", [
    ("dal", None, "Hull a szilva a fáról", "123", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("dal", None, "Kis kece lányom", "3", ""),
])

_t("osz_szinek", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Ess, eső, ess", "1", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
])

_t("kodos_oszi_ido", [
    ("dal", None, "Hull a szilva a fáról", "123", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
    ("dal", None, "Cifra palota", "23", ""),
    ("vers", "Kányádi Sándor", "Novemberi szél", "3", ""),
    ("nepmese", None, "A hiszékeny farkas", "3", ""),
])

_t("tok_fesztival", [
    ("nepmese", None, "A kismalac és a farkasok", "3", ""),
    ("dal", None, "Cifra palota", "23", ""),
])

_t("egeszseges_eletmod", [
    ("vers", "Csanádi Imre", "Naptár — Szeptember", "3", ""),
    ("nepmese", None, "A kis gömböc", "3", "vidám láncmese az evésről"),
    ("nepmese", None, "A só", "3", "az étel becsülete"),
    ("dal", None, "Én elmentem a vásárba", "23", ""),
    ("korjatek", None, "Komámasszony, hol az olló?", "23", ""),
])

_t("allatok_vilagnapja", [
    ("dal", None, "Csömödöri legelőn", "23", ""),
    ("korjatek", None, "Kinn a bárány, benn a farkas", "23", ""),
    ("dal", None, "Hess, páva, hess, páva", "3", ""),
])

_t("haziallatok_kicsinyei", [
    ("vers", "Nemes Nagy Ágnes", "Bors néni", "3", ""),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "3", ""),
    ("dal", None, "Én elmentem a vásárba", "23", ""),
    ("dal", None, "Hess, páva, hess, páva", "23", ""),
    ("korjatek", None, "Komámasszony, hová mégy?", "23", ""),
])

_t("erdo_allatai", [
    ("dal", None, "Csip-csip csóka", "1", ""),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("dal", None, "Csömödöri legelőn", "23", ""),
    ("dal", None, "Kis kece lányom", "3", ""),
])

_t("erdok_napja", [
    ("mondoka", None, "Erre csörög a dió", "12", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Csip-csip csóka", "1", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("dal", None, "Cifra palota", "23", ""),
])

_t("kenyer_utja", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Komámasszony, hol az olló?", "23", ""),
    ("dal", None, "Én elmentem a vásárba", "3", ""),
])

_t("marton_nap", [
    ("mondoka", None, "Egy kispipi, két kispipi", "1", ""),
    ("mese", "Fésűs Éva", "A kis liba vándorútja", "12", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
])

_t("erzsebet_katalin", [
    ("mondoka", None, "Kis kertet kerítek", "12", ""),
    ("vers", "Donászy Magda", "Nagyanyónak", "123", ""),
    ("dal", None, "Nyílik a rózsa", "12", ""),
])

_t("csalad", [
    ("dal", None, "Én elmentem a vásárba", "23", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
    ("dal", None, "Már megjöttünk ez helyre", "3", ""),
])

_t("otthonunk", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("korjatek", None, "Csön, csön, gyűrű", "23", ""),
    ("dal", None, "Cifra palota", "23", ""),
])

_t("testunk", [
    ("vers", "Weöres Sándor", "Csiribiri", "3", ""),
    ("nepmese", None, "A kiskakas gyémánt félkrajcárja", "3", ""),
    ("nepmese", None, "A kis gömböc", "3", ""),
    ("dal", None, "Hüvelykujjam", "12", ""),
    ("korjatek", None, "Csön, csön, gyűrű", "23", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
])

_t("szinek_formak", [
    ("vers", "Nemes Nagy Ágnes", "Lila fecske", "3", ""),
    ("nepmese", None, "A kesztyű", "3", ""),
    ("mese", "Fésűs Éva", "A szivárvány meséje", "3", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
    ("dal", None, "Nyílik a rózsa", "23", ""),
])

_t("kozlekedes", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
    ("dal", None, "Most jöttem Erdélyből", "3", ""),
])

_t("foglalkozasok", [
    ("dal", None, "Süt a pék", "1", ""),
    ("dal", None, "Süssünk, süssünk valamit", "1", ""),
])

_t("baratsag", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Sétálunk, sétálunk", "1", ""),
    ("dal", None, "Hej, Vargáné káposztát főz", "3", ""),
    ("korjatek", None, "Adj, király, katonát", "3", ""),
])

_t("olvasni_jo", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Sétálunk, sétálunk", "1", ""),
    ("korjatek", None, "Egyszer egy királyfi", "23", ""),
    ("dal", None, "Kis kece lányom", "3", ""),
    ("korjatek", None, "Adj, király, katonát", "3", ""),
])

# --- Tél ---------------------------------------------------------------------

_t("advent", [
    ("dal", None, "Kis karácsony, nagy karácsony", "1", ""),
    ("vers", "József Attila", "Betlehemi királyok", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("dal", None, "Pásztorok, pásztorok", "3", ""),
    ("dal", None, "Mennyből az angyal", "3", ""),
])

_t("mikulas", [
    ("dal", None, "Kis karácsony, nagy karácsony", "123", ""),
    ("dal", None, "Ég a gyertya, ég", "123", ""),
    ("vers", "Weöres Sándor", "Kis karácsonyi ének", "3", ""),
    ("nepmese", None, "A só", "3", "az ajándék igazi értéke"),
    ("dal", None, "Hull a pelyhes fehér hó", "3", ""),
])

_t("luca_nap", [
    ("mondoka", None, "Süssünk, süssünk valamit", "12", ""),
    ("mese", "Fésűs Éva", "A négy gyertya", "12", ""),
    ("dal", None, "Ég a gyertya, ég", "123", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
])

_t("fenyofa_diszek", [
    ("dal", None, "Hull a pelyhes fehér hó", "1", ""),
    ("vers", "József Attila", "Betlehemi királyok", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("mese", None, "A betlehemi történet — egyszerű elbeszélésben", "3", ""),
])

_t("karacsony", [
    ("dal", None, "Ég a gyertya, ég", "1", ""),
    ("vers", "Kányádi Sándor", "Aki fázik", "3", ""),
    ("mese", "Hans Christian Andersen", "A kis gyufaáruslány", "3", "megrendítő, nagycsoportnak"),
])

_t("mezeskalacs", [
    ("nepmese", None, "A kis gömböc", "3", ""),
    ("vers", "József Attila", "Betlehemi királyok", "3", ""),
    ("dal", None, "Mennyből az angyal", "3", ""),
    ("korjatek", None, "Komámasszony, hol az olló?", "23", ""),
])

_t("teli_madaretetes", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Kinn a bárány, benn a farkas", "12", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
    ("dal", None, "Cifra palota", "23", ""),
])

_t("teli_oltozkodes", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
    ("vers", "Zelk Zoltán", "Téli rege", "3", ""),
    ("nepmese", None, "A hiszékeny farkas", "3", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "3", ""),
])

_t("teli_sportok", [
    ("nepmese", None, "A három kismalac", "3", ""),
    ("korjatek", None, "Adj, király, katonát", "3", "havas udvaron is remek"),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
    ("dal", None, "Aki nem lép egyszerre", "23", ""),
])

_t("ho_es_jeg", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "12", ""),
    ("nepmese", None, "A hiszékeny farkas", "3", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("korjatek", None, "Tüzet viszek", "23", ""),
])

_t("magyar_kultura", [
    ("mondoka", None, "Ecc, pecc, kimehetsz", "1", ""),
    ("mondoka", None, "Hüvelykujjam almafa", "1", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
])

_t("matyas_nap", [
    ("mondoka", None, "Süssünk, süssünk valamit", "1", ""),
    ("dal", None, "Esik az eső", "12", "olvadás, csepegő eresz"),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("mese", "Fésűs Éva", "A tökkelütött manó", "1", ""),
    ("dal", None, "Süss fel, nap", "12", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "12", ""),
])

# --- Tavasz, nyár ------------------------------------------------------------

_t("marcius_15", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "12", ""),
])

_t("viz_vilagnapja", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
])

_t("tavasz", [
    ("dal", None, "Esik az eső", "1", ""),
    ("dal", None, "Nyuszi ül a fűben", "1", ""),
])

_t("tavaszi_viragok", [
    ("vers", "Csanádi Imre", "Naptár — Április", "3", ""),
    ("nepmese", None, "A répa", "3", ""),
    ("nepmese", None, "Az égig érő paszuly", "3", "növekedés, magból óriás növény"),
])

_t("husvet", [
    ("vers", "Devecseri Gábor", "Bárány Boldizsár (részlet)", "3", ""),
    ("mese", "Benedek Elek", "A nyulacska harangocskája", "3", ""),
    ("dal", None, "A pünkösdi rózsa", "3", ""),
    ("korjatek", None, "Fehér liliomszál", "3", ""),
])

_t("husveti_het", [
    ("dal", None, "Orgona ága", "3", ""),
    ("korjatek", None, "Fehér liliomszál", "3", ""),
])

_t("kolteszet_napja", [
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "23", ""),
])

_t("fold_napja", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Esik az eső", "1", ""),
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
])

_t("kerti_munkak", [
    ("nepmese", None, "Az égig érő paszuly", "3", ""),
    ("nepmese", None, "A kis gömböc", "3", ""),
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
])

_t("madarak_fak_napja", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
])

_t("anyak_napja_csalad", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Hopp, Juliska", "1", ""),
    ("korjatek", None, "Fehér liliomszál", "123", ""),
])

_t("mehek_napja", [
    ("dal", None, "Katalinka, szállj el", "1", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("vers", "Weöres Sándor", "Galagonya", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("mese", "Fésűs Éva", "A csodálatos nyárfa", "3", ""),
])

_t("kert_kis_lakoi", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Beültettem kis kertemet", "12", ""),
    ("vers", "Szabó Lőrinc", "Falusi hangverseny", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
])

_t("punkosd", [
    ("mondoka", None, "Süss fel, nap", "1", ""),
    ("vers", "Gazdag Erzsi", "Itt a tavasz", "1", ""),
    ("dal", None, "Beültettem kis kertemet", "12", ""),
    ("dal", None, "Ispiláng, ispiláng", "12", ""),
])

_t("nagycsoportos_bucsu", [
    ("mondoka", None, "Ecc, pecc, kimehetsz", "12", ""),
    ("vers", "Weöres Sándor", "Bóbita", "12", ""),
    ("mese", "Marék Veronika", "Boribon és Annipanni", "12", ""),
    ("dal", None, "Hopp, Juliska", "12", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "123", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
])

_t("nyari_gyumolcsok", [
    ("vers", "Weöres Sándor", "Galagonya", "3", ""),
    ("nepmese", None, "A kis gömböc", "3", ""),
    ("dal", None, "Érik a szőlő", "3", ""),
    ("dal", None, "Cifra palota", "23", ""),
])

_t("nyari_idojaras", [
    ("dal", None, "Süt a nap, süt a nap", "1", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", ""),
    ("vers", "Weöres Sándor", "Csiribiri", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
])

_t("napvedelem", [
    ("dal", None, "Esik az eső", "12", ""),
    ("vers", "Csanádi Imre", "Naptár — Június", "3", ""),
    ("nepmese", None, "A kóró és a kismadár", "3", ""),
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
])
