# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadvány irodalmi és zenei anyagának kinyerése korcsoportonként.

MIÉRT NEM A GEOMETRIA DÖNT: a táblázat sávcímkéi függőlegesen középre igazítottak
és a PDF-ből hiányosan olvashatók ki, ezért a sávhatárok csak közelítők. A
tartalom viszont szabályos: minden korcsoport cellája ugyanazzal a záró elemmel
végződik —
  Verselés, mesélés :  „Anyanyelvi játék: …”
  Ének, zene        :  a hallás/ritmus feladat („Egyenletes lüktetés…”,
                        „Egymás hangjának felismerése.”)
Ezekre a lezárókra vágjuk három cellára a hasábot, így a korcsoport-hozzárendelés
biztos.

Kimenet: tools/tappancs-irodalom.json
Futtatás: python tools/tappancs_kinyeres.py "<pdf útvonala>"
"""

from __future__ import annotations

import json
import re
import sys
import warnings
from pathlib import Path

from pypdf import PdfReader

warnings.filterwarnings("ignore")

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

KIMENET = Path(__file__).resolve().parent / "tappancs-irodalom.json"

VERSELES_X = (398, 600)
ENEK_X = (828, 968)
KOROK = ["kicsi", "kozepso", "nagy"]

# Csupa nagybetűs hasáb- és oldalfejlécek — ezek nem tartalom.
FEJLEC_RE = re.compile(r"^[A-ZÁÉÍÓÖŐÚÜŰ0-9 ,.\-–…!?]+$")

# A verselés-cella lezárója.
ANYANYELVI_RE = re.compile(r"^Anyanyelvi\s+játék", re.I)
# Az ének-cella lezárója: hallás- és ritmusfeladat.
RITMUS_RE = re.compile(
    r"(egyenletes lüktetés|ritmus|hallás|hangjának felismerése|halk|hangszín|"
    r"magas.*mély|gyors.*lassú|dallam)", re.I
)
# Szekció-fejlécek a verselés cellán belül.
SZEKCIO_RE = re.compile(r"^(Versek|Mondókák|Versek,\s*mondókák|Mese|Mesék|Vers)\s*:?\s*$", re.I)


def oszlopSorok(page, x1: float, x2: float) -> list[str]:
    """Az adott hasáb sorai fentről lefelé, elválasztójelek összevonásával."""
    darabok: list[tuple[float, float, str]] = []

    def latogato(text, cm, tm, fd, fs):  # noqa: ANN001
        t = text.strip()
        if t and x1 <= round(tm[4], 1) < x2:
            darabok.append((round(tm[4], 1), round(tm[5], 1), t))

    page.extract_text(visitor_text=latogato)
    darabok.sort(key=lambda e: (-e[1], e[0]))

    sorok: list[str] = []
    elozoY: float | None = None
    for _x, y, t in darabok:
        if elozoY is not None and abs(elozoY - y) <= 3:
            sorok[-1] += " " + t
        else:
            sorok.append(t)
        elozoY = y
    tiszta = [re.sub(r"\s+", " ", s).strip() for s in sorok]
    # sorvégi elválasztás összevonása
    egyben: list[str] = []
    for s in tiszta:
        if egyben and egyben[-1].endswith("-") and s and s[0].islower():
            egyben[-1] = egyben[-1][:-1] + s
        else:
            egyben.append(s)
    return [s for s in egyben if s]


def cellakra(sorok: list[str], lezaro: re.Pattern) -> list[list[str]]:
    """A hasáb sorait három korcsoport-cellára vágja a lezáró elemek mentén."""
    cellak: list[list[str]] = []
    aktualis: list[str] = []
    varSort = False
    for s in sorok:
        aktualis.append(s)
        if varSort:
            # A lezáró csak a kettőspont volt („Anyanyelvi játék:”), a megnevezés
            # a következő sorban áll — az is ehhez a cellához tartozik.
            varSort = False
            cellak.append(aktualis)
            aktualis = []
            if len(cellak) == 3:
                break
            continue
        if lezaro.search(s):
            if s.rstrip().endswith(":"):
                varSort = True
                continue
            cellak.append(aktualis)
            aktualis = []
            if len(cellak) == 3:
                break
    return cellak


def verselesFeldolgoz(cella: list[str]) -> dict:
    """Egy verselés-cella szétbontása versekre, mesékre és anyanyelvi játékra."""
    versek: list[str] = []
    mesek: list[str] = []
    anyanyelvi = ""
    hova = None
    for sor in cella:
        if FEJLEC_RE.match(sor) and len(sor) > 12:
            continue  # hasábfejléc
        if ANYANYELVI_RE.match(sor):
            anyanyelvi = re.sub(r"^Anyanyelvi\s+játék\s*:?\s*", "", sor, flags=re.I).strip()
            hova = "anyanyelvi"
            continue
        if hova == "anyanyelvi":
            # a megnevezés a fejléc utáni sorban állt
            anyanyelvi = (anyanyelvi + " " + sor).strip()
            continue
        m = SZEKCIO_RE.match(sor)
        if m:
            hova = "mese" if m.group(1).lower().startswith("mes") else "vers"
            continue
        cel = mesek if hova == "mese" else versek
        # a tördelt címek folytatását az előző sorhoz fűzzük
        if cel and not re.match(r"^[A-ZÁÉÍÓÖŐÚÜŰ]", sor) and len(sor) < 40:
            cel[-1] += " " + sor
        else:
            cel.append(sor)
    return {
        "versek": [v.strip(" .") for v in versek if v.strip()],
        "mesek": [v.strip(" .") for v in mesek if v.strip()],
        "anyanyelvi_jatek": anyanyelvi.strip(" ."),
    }


def dalCimE(sor: str) -> bool:
    """
    Dalcím-e a sor?

    Az ének-hasábba néha átcsúszik a cél/feladat prózája (hosszú, pontra végződő
    mondatok) és a tördelt sorok maradéka („keresztül”, „széken ülve”). A dalokat
    a kiadvány három jegye különbözteti meg: rövidek, nagybetűvel kezdődnek, és
    jellemzően három ponttal végződnek.
    """
    if len(sor) > 45 or len(sor) < 4:
        return False
    if not sor[:1].isupper():
        return False
    # A kiadványban a dalcímek három ponttal végződnek („Hüvelykujjam almafa…”).
    # Ez a legmegbízhatóbb jegy: a feladatleírások sosem így végződnek.
    return sor.endswith("…")


def enekFeldolgoz(cella: list[str]) -> dict:
    """Egy ének-cella szétbontása dalokra és hallás-ritmus feladatra."""
    dalok: list[str] = []
    ritmus: list[str] = []
    for sor in cella:
        if FEJLEC_RE.match(sor) and len(sor) > 12:
            continue
        if RITMUS_RE.search(sor):
            ritmus.append(sor)
        elif dalCimE(sor):
            dalok.append(sor)
    return {
        "dalok": [d.strip(" .") for d in dalok if d.strip()],
        "hallas_ritmus": [r.strip() for r in ritmus if r.strip()],
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("Használat: python tools/tappancs_kinyeres.py <pdf>")
        return 2
    reader = PdfReader(sys.argv[1])

    hetek = []
    for lapIndex, page in enumerate(reader.pages):
        fejlec: list[tuple[float, str]] = []

        def latogato(text, cm, tm, fd, fs):  # noqa: ANN001
            t = text.strip()
            if t and round(tm[5], 1) > 690:
                fejlec.append((round(tm[5], 1), t))

        page.extract_text(visitor_text=latogato)
        honapSor = next((t for _y, t in sorted(fejlec, reverse=True) if re.search(r"H\s*É\s*T", t)), None)
        if not honapSor:
            continue
        m = re.search(r"([A-ZÁÉÍÓÖŐÚÜŰ]+)\s*,?\s*(\d+)\.?\s*H\s*É\s*T", honapSor)
        honap, hetSzam = (m.group(1), int(m.group(2))) if m else ("?", 0)
        cim = next(
            (t for _y, t in sorted(fejlec, reverse=True) if t != honapSor and len(t) > 8), ""
        )

        versCellak = cellakra(oszlopSorok(page, *VERSELES_X), ANYANYELVI_RE)
        enekCellak = cellakra(oszlopSorok(page, *ENEK_X), RITMUS_RE)

        het = {"lap": lapIndex + 1, "honap": honap, "het": hetSzam, "cim": cim, "korok": {}}
        for i, kor in enumerate(KOROK):
            het["korok"][kor] = {
                **(verselesFeldolgoz(versCellak[i]) if i < len(versCellak) else
                   {"versek": [], "mesek": [], "anyanyelvi_jatek": ""}),
                **(enekFeldolgoz(enekCellak[i]) if i < len(enekCellak) else
                   {"dalok": [], "hallas_ritmus": []}),
            }
        het["hiany"] = [
            k for k, v in het["korok"].items() if not v["versek"] and not v["mesek"]
        ]
        hetek.append(het)

    KIMENET.write_text(json.dumps(hetek, ensure_ascii=False, indent=1), encoding="utf-8")
    hianyos = [h for h in hetek if h["hiany"]]
    print(f"{len(hetek)} hét kinyerve → {KIMENET}")
    print(f"  versek/mesék összesen: "
          f"{sum(len(v['versek']) + len(v['mesek']) for h in hetek for v in h['korok'].values())}")
    print(f"  dalok összesen: {sum(len(v['dalok']) for h in hetek for v in h['korok'].values())}")
    if hianyos:
        print(f"  FIGYELEM — hiányos hetek: {[(h['lap'], h['hiany']) for h in hianyos]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
