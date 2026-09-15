# -*- coding: utf-8 -*-
"""
Korosztályos ének-kiegészítés a Tappancs-kiadványból átvett új témákhoz.

A forrás nem minden hétnél ad mindhárom korcsoportnak dalt, ezért ezekben a
témákban a kis- és a nagycsoport ugyanazt a listát kapta volna. Itt pótoljuk a
korosztályhoz illő énekes anyagot a klasszikus óvodai repertoárból: a kicsiknek
ölbeli és egyszerű énekes játékot, a nagyoknak összetettebb népi játékot és
igazi népdalt.
"""

from .base import _t

_t("osz_zoldsegek", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Csip-csip csóka", "1", "ölbeli játék dallammal"),
    ("dal", None, "Hopp, Juliska", "2", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "23", "káposztasavanyítás, télre eltevés"),
    ("dal", None, "Én elmentem a vásárba", "3", ""),
    ("dal", None, "Cifra palota", "3", ""),
    ("zenehallgatas", None, "Szüreti népdalcsokor", "123", ""),
])

_t("mihaly_nap", [
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("dal", None, "Egy kis malac", "1", ""),
    ("korjatek", None, "Erre kakas, erre tyúk", "12", "állatbehajtás játékkal"),
    ("dal", None, "Én elmentem a vásárba", "23", "a vásári forgatag dala"),
    ("dal", None, "Hess, páva, hess, páva", "3", ""),
    ("dal", None, "Most jöttem Erdélyből", "3", ""),
    ("korjatek", None, "Adj, király, katonát", "3", ""),
    ("zenehallgatas", None, "Vásári és pásztornóták", "23", ""),
])

_t("oszi_kerti_munkak", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Ess, eső, ess", "1", "az őszi vetés öntözéséhez"),
    ("dal", None, "Beültettem kis kertemet", "12", ""),
    ("korjatek", None, "Hej, Vargáné káposztát főz", "23", ""),
    ("dal", None, "Érik a szőlő", "23", ""),
    ("dal", None, "Kis kece lányom", "3", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Ősz", "123", ""),
])

_t("madarvonulas", [
    ("dal", None, "Csip-csip csóka", "1", ""),
    ("dal", None, "Kis kacsa fürdik", "1", ""),
    ("dal", None, "Gólya, gólya, gilice", "12", "a vándormadarak búcsúztatója"),
    ("dal", None, "Hess, páva, hess, páva", "23", ""),
    ("dal", None, "Erdő mellett nem jó lakni", "3", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("zenehallgatas", "Gryllus Vilmos", "Madárdalok", "12", ""),
])

_t("ujevi_nepszokasok", [
    ("dal", None, "Ég a gyertya, ég", "1", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Már megjöttünk ez helyre", "23", "a köszöntés dala"),
    ("dal", None, "Hopp, Juliska", "2", ""),
    ("dal", None, "Kis kece lányom", "3", ""),
    ("korjatek", None, "Elvesztettem zsebkendőmet", "23", ""),
    ("zenehallgatas", None, "Újévi köszöntők, kántálók", "23", ""),
])

_t("napszakok_napirend", [
    ("altato", None, "Tente, baba, tente", "1", "a délutáni pihenőhöz"),
    ("dal", None, "Süss fel, nap", "1", "a reggeli ébredéshez"),
    ("dal", None, "Ciróka, maróka", "12", "ölbeli játék"),
    ("dal", None, "Esik az eső", "2", ""),
    ("korjatek", None, "Aki nem lép egyszerre", "23", "menetelés, ütemtartás"),
    ("dal", None, "Cifra palota", "3", ""),
    ("zenehallgatas", None, "Reggeli és esti hangulatú zenék", "123", "a napszakok hangulata"),
])

_t("balazs_nap_iskola", [
    ("dal", None, "Sétálunk, sétálunk", "1", ""),
    ("dal", None, "Süss fel, nap", "1", ""),
    ("korjatek", None, "Lánc, lánc, eszterlánc", "12", ""),
    ("dal", None, "Hopp, Juliska", "2", ""),
    ("korjatek", None, "Adj, király, katonát", "3", "sorakozó, szabálytartás"),
    ("dal", None, "Most jöttem Erdélyből", "3", ""),
    ("zenehallgatas", "Kodály Zoltán", "Gyermek- és nőikarok — részletek", "3", ""),
])

_t("evszakok_korforgas", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Esik az eső", "1", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", "a tél a körben"),
    ("dal", None, "Tavaszi szél vizet áraszt", "3", ""),
    ("korjatek", None, "Bújj, bújj, zöld ág", "123", "körben járás — az év körforgása"),
    ("zenehallgatas", "Antonio Vivaldi", "A négy évszak — négy rövid részlet", "23",
     "a négy évszak összehasonlítása zenében"),
])

_t("feny_arnyek_mackok", [
    ("dal", None, "Süss fel, nap", "1", ""),
    ("dal", None, "Boci, boci tarka", "1", ""),
    ("dal", None, "Hull a pelyhes fehér hó", "12", ""),
    ("korjatek", None, "Kinn a bárány, benn a farkas", "23", ""),
    ("dal", None, "Erdő, erdő, de magas vagy", "3", ""),
    ("zenehallgatas", None, "Mély és magas hangszerek — medve és kismedve", "123", ""),
])
