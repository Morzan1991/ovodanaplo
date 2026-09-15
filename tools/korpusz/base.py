# -*- coding: utf-8 -*-
"""
Gondozott irodalmi korpusz — mondókák, versek, mesék, dalok témák szerint.

MIÉRT: az ötletbank `verseles_meseles` és `enek_zene` listái korábban a sablonok
szabad szövegű sorai voltak. Ebből három baj származott:
  1. műfaji keveredés (a „Lipem-lopom a szőlőt” dal a versek közé került),
  2. téma-tévesztés (csibés-katicás mondóka az őszi gyümölcsök hetében),
  3. a négy korcsoport listája szóról szóra azonos volt — csak a sorrend tért el.

Ez a fájl az egyetlen igazságforrás: minden mű MŰFAJJAL, KOROSZTÁLLYAL és
TÉMÁKKAL szerepel. Az ötletbankot és a sablonok irodalmi sorait ebből generálja
a `tools/irodalom_beepites.py`.

MEZŐK
  műfaj    : mondoka | vers | mese | nepmese | talalos   -> Verselés, mesélés
             dal | korjatek | zenehallgatas | altato     -> Ének, zene
  szerző   : None a népköltés/népdal esetén
  korok    : "1"=kiscsoport (3–4), "2"=középső (4–5), "3"=nagy (5–7); pl. "12"
  megjegyzés: rövid, gyakorlati kiegészítés (opcionális, a listában „— …”)

ALAPELV: inkább kevesebb tétel, de mind valódi, óvodában ténylegesen használt mű.
Egy művet több témánál is fel lehet sorolni — a beépítő egyesíti a témáit.
"""

from __future__ import annotations

# (műfaj, szerző, cím, korok, megjegyzés)
Mu = tuple[str, str | None, str, str, str]

KORPUSZ: dict[str, list[Mu]] = {}


def _t(tema: str, tetelek: list[Mu]) -> None:
    KORPUSZ.setdefault(tema, []).extend(tetelek)


# Melyik műfaj melyik ONAP-tevékenységi területre való. Ez a leképezés zárja ki,
# hogy dal kerüljön a versek közé (és fordítva).
MUFAJ_TERULET: dict[str, str] = {
    "mondoka": "verseles_meseles",
    "vers": "verseles_meseles",
    "mese": "verseles_meseles",
    "nepmese": "verseles_meseles",
    "talalos": "verseles_meseles",
    "anyanyelvi": "verseles_meseles",
    "dal": "enek_zene",
    "korjatek": "enek_zene",
    "altato": "enek_zene",
    "zenehallgatas": "enek_zene",
}

# Így nevezzük meg a műfajt a listában, hogy az óvónő ránézésre lássa, mi az.
MUFAJ_CIMKE: dict[str, str] = {
    "mondoka": "Mondóka",
    "vers": "Vers",
    "mese": "Mese",
    "nepmese": "Népmese",
    "talalos": "Találós kérdés",
    "anyanyelvi": "Anyanyelvi játék",
    "dal": "Dal",
    "korjatek": "Énekes körjáték",
    "altato": "Altató",
    "zenehallgatas": "Zenehallgatás",
}

# Sorrend a listán belül: a rövid, mozgásos anyag elöl, a hosszabb hátul.
MUFAJ_SORREND: dict[str, int] = {
    "mondoka": 0,
    "vers": 1,
    "talalos": 2,
    "mese": 3,
    "nepmese": 4,
    "anyanyelvi": 5,
    "dal": 0,
    "korjatek": 1,
    "altato": 2,
    "zenehallgatas": 3,
}


