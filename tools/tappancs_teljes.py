# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadvány TELJES kiolvasása — mind a hat terület, mindhárom blokk.

Szerkezet hetenként (egy könyvoldalpáron):
  hasábok : Külső világ (környezeti) | Külső világ (matematikai) | Verselés, mesélés
            Rajzolás, festés | Ének, zene | Mozgás
  blokkok : tartalom → cél/feladat → fejlesztési területek
  sávok   : kiscsoport, középső, nagycsoport

MIÉRT RÉSALAPÚ A VÁGÁS: a sávcímkék középre igazítottak és hiányosan olvashatók
ki, ezért nem használhatók határnak. A hasábon BELÜL viszont a sortávolság
egyenletes (9,2 pont), a cellák között pedig legalább 22 pont a rés — így a
cellahatár egyértelmű. Minden hasáb kilenc cellát ad (3 blokk × 3 korcsoport);
ha egy cella üres, a darabszám kevesebb, ilyenkor a sávcímkékhez rendeljük őket.

Kimenet: tools/tappancs-teljes.json
Futtatás: python tools/tappancs_teljes.py "<pdf útvonala>"
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

KIMENET = Path(__file__).resolve().parent / "tappancs-teljes.json"

HASABOK = [
    ("kulso_vilag", 118, 258),
    ("matematika", 258, 398),
    ("verseles_meseles", 398, 600),
    ("rajzolas_festes", 688, 828),
    ("enek_zene", 828, 968),
    ("mozgas", 968, 1200),
]
CIMKE_SAV = {"bal": (95, 118), "jobb": (660, 688)}

KOROK = ["kicsi", "kozepso", "nagy"]
BLOKKOK = ["tartalom", "cel_feladat", "fejlesztes"]

# A cellán belüli sortávolság 9,2 pont, a cellák között legalább 14,3 —
# a kettő között tiszta a határ, ezért 12 pont a küszöb.
CELLA_RES = 12.0
# Egy oldalfél három hasábja együtt adja ki a sorhatárokat: a nyolc legnagyobb
# függőleges rés a nyolc sorhatár (3 blokk × 3 korcsoport = 9 sáv).
SORHATAROK_SZAMA = 8
# A hasábfejlécek e fölött vannak (oldalcím, területnév).
FEJLEC_ALATT = 700.0


def sorok(page, x1: float, x2: float, ymax: float = FEJLEC_ALATT) -> list[tuple[float, str]]:
    """(y, szöveg) sorok az adott hasábból, a fejlécek nélkül."""
    darabok: list[tuple[float, float, str]] = []

    def latogato(text, cm, tm, fd, fs):  # noqa: ANN001
        t = text.strip()
        x, y = round(tm[4], 1), round(tm[5], 1)
        if t and x1 <= x < x2 and y < ymax:
            darabok.append((x, y, t))

    page.extract_text(visitor_text=latogato)
    darabok.sort(key=lambda e: (-e[1], e[0]))

    osszevont: list[tuple[float, str]] = []
    for _x, y, t in darabok:
        if osszevont and abs(osszevont[-1][0] - y) <= 3:
            osszevont[-1] = (osszevont[-1][0], osszevont[-1][1] + " " + t)
        else:
            osszevont.append((y, t))
    return [(y, re.sub(r"\s+", " ", t).strip()) for y, t in osszevont]


# A kilenc sáv címkéi mindig ebben a sorrendben követik egymást.
MINTA = ["kicsi", "kozepso", "nagy"] * 3


def cimkeNev(t: str) -> str | None:
    """
    A sávcímke neve. A „Középső csoport” két sorban áll, és a PDF-ből néha
    fordított sorrendben olvasható ki („csoport Középső”), ezért nem a sor
    elejét, hanem a tartalmát vizsgáljuk.
    """
    if "Kiscsoport" in t:
        return "kicsi"
    if "Közép" in t:
        return "kozepso"
    if "Nagycsoport" in t:
        return "nagy"
    return None


def cimkeHelyek(page, oldal: str) -> list[float] | None:
    """
    A kilenc sávcímke y-koordinátája fentről lefelé.

    A PDF-ből néha hiányzik egy-egy címke (elforgatott szövegdarab), ezért a
    megtaláltakat a rögzített Kis–Közép–Nagy mintára illesztjük, a hiányzókat a
    szomszédok között lineárisan pótoljuk. A pótolt érték csak közelítő — arra
    viszont elég, hogy a valódi sorhatárt közrefogja.
    """
    x1, x2 = CIMKE_SAV[oldal]
    talalt: list[tuple[float, str]] = []
    for y, t in sorok(page, x1, x2):
        nev = cimkeNev(t)
        if nev is None:
            continue
        if talalt and abs(talalt[-1][0] - y) < 6:
            continue  # a kétsoros „Középső / csoport” második fele
        talalt.append((y, nev))
    talalt.sort(key=lambda e: -e[0])

    helyek: dict[int, float] = {}
    i = 0
    for y, nev in talalt:
        while i < 9 and MINTA[i] != nev:
            i += 1
        if i >= 9:
            break
        helyek[i] = y
        i += 1
    if len(helyek) < 4:
        return None

    ismert = sorted(helyek)
    if ismert[0] > 0 and len(ismert) > 1:
        lepes = (helyek[ismert[0]] - helyek[ismert[1]]) / (ismert[1] - ismert[0])
        for k in range(ismert[0] - 1, -1, -1):
            helyek[k] = helyek[k + 1] + lepes
    ismert = sorted(helyek)
    for a, b in zip(ismert, ismert[1:]):
        if b - a > 1:
            lepes = (helyek[a] - helyek[b]) / (b - a)
            for k in range(a + 1, b):
                helyek[k] = helyek[a] - lepes * (k - a)
    ismert = sorted(helyek)
    if ismert[-1] < 8:
        lepes = (helyek[ismert[-2]] - helyek[ismert[-1]]) if len(ismert) > 1 else 60.0
        for k in range(ismert[-1] + 1, 9):
            helyek[k] = helyek[k - 1] - lepes
    return [helyek[i] for i in range(9)]


def sorhatarok(oldalSorok: list[float], cimkek: list[float] | None) -> list[float]:
    """
    A kilenc sáv nyolc határa egy oldalfélen.

    A sorhatárnál MINDEGYIK hasáb üres, ezért a három hasáb sorait együtt nézve
    ott nagy a függőleges rés. Pusztán „a nyolc legnagyobb rés” viszont téved:
    egy cellán belüli szekcióváltás (pl. „Versek…” után „Mese:”) is nyithat 14
    pontos rést, és akkor egy valódi határ kimarad, amitől az egész oldal
    eggyel elcsúszik.

    Ezért a címkék fogják közre a keresést: két szomszédos sávcímke KÖZÖTT
    keressük a legnagyobb rést — így pontosan nyolc, jó helyen lévő határ lesz.
    """
    ys = sorted(set(oldalSorok), reverse=True)
    resek = [((ys[i] + ys[i + 1]) / 2, ys[i] - ys[i + 1]) for i in range(len(ys) - 1)]

    if cimkek is None or len(cimkek) != 9:
        legnagyobbak = sorted(resek, key=lambda r: -r[1])[:SORHATAROK_SZAMA]
        return sorted((kozep for kozep, _res in legnagyobbak), reverse=True)

    hatarok: list[float] = []
    for felso, also in zip(cimkek, cimkek[1:]):
        jeloltek = [(kozep, res) for kozep, res in resek if also < kozep < felso]
        if jeloltek:
            hatarok.append(max(jeloltek, key=lambda r: r[1])[0])
        else:
            hatarok.append((felso + also) / 2)
    return hatarok


def cellakra(sorLista: list[tuple[float, str]], hatarok: list[float]) -> list[list[tuple[float, str]]]:
    """A hasáb sorait a megadott sorhatárok mentén kilenc cellába osztja."""
    cellak: list[list[tuple[float, str]]] = [[] for _ in range(len(hatarok) + 1)]
    for y, t in sorLista:
        i = 0
        while i < len(hatarok) and y < hatarok[i]:
            i += 1
        cellak[i].append((y, t))
    return cellak


def szoveg(cella: list[tuple[float, str]]) -> str:
    """A cella sorai egy szöveggé, az elválasztójelek feloldásával."""
    sorokList = [t for _y, t in cella]
    egyben: list[str] = []
    for s in sorokList:
        if egyben and egyben[-1].endswith("-") and s and s[0].islower():
            egyben[-1] = egyben[-1][:-1] + s
        else:
            egyben.append(s)
    osszes = "\n".join(egyben).strip()
    # A kiadvány betűritkítása miatt néhol szóköz szakítja ketté a szót
    # („folyamatai nak”, „fejlődé sének”). Ezek a töredékek önmagukban nem
    # magyar szavak, ezért biztonságosan visszafűzhetők.
    return re.sub(
        r"(\w)\s(nak|nek|ban|ben|val|vel|ból|ből|tól|től|hoz|hez|höz|ról|ről|"
        r"nál|nél|ként|kor|sének|sának|tása|tése|zása|zése)\b",
        r"\1\2",
        osszes,
    )


def main() -> int:
    if len(sys.argv) < 2:
        print("Használat: python tools/tappancs_teljes.py <pdf>")
        return 2
    reader = PdfReader(sys.argv[1])

    hetek = []
    gyanus = []
    for lapIndex, page in enumerate(reader.pages):
        fejlec = sorok(page, 0, 1300, ymax=10_000)
        fejlec = [(y, t) for y, t in fejlec if y > 740]
        honapSor = next((t for _y, t in fejlec if re.search(r"H\s*É\s*T", t)), None)
        if not honapSor:
            continue
        m = re.search(r"([A-ZÁÉÍÓÖŐÚÜŰ]+)\s*,?\s*(\d+)\.?\s*H\s*É\s*T", honapSor)
        honap, hetSzam = (m.group(1), int(m.group(2))) if m else ("?", 0)
        cim = next((t for _y, t in fejlec if t != honapSor and len(t) > 8), "")

        # oldalfelenként: a címkék keretezik, a rések pontosítják a sorhatárokat
        balHatarok = sorhatarok(
            [y for y, _t in sorok(page, 118, 600)], cimkeHelyek(page, "bal")
        )
        jobbHatarok = sorhatarok(
            [y for y, _t in sorok(page, 688, 1200)], cimkeHelyek(page, "jobb")
        )

        het: dict = {
            "lap": lapIndex + 1, "honap": honap, "het": hetSzam, "cim": cim,
            "blokkok": {b: {k: {} for k in KOROK} for b in BLOKKOK},
        }
        for nev, x1, x2 in HASABOK:
            hatarok = balHatarok if x2 <= 620 else jobbHatarok
            cellak = cellakra(sorok(page, x1, x2), hatarok)
            ures = sum(1 for c in cellak if not c)
            if ures:
                gyanus.append((lapIndex + 1, nev, ures))
            for i, cella in enumerate(cellak):
                het["blokkok"][BLOKKOK[i // 3]][KOROK[i % 3]][nev] = szoveg(cella)
        hetek.append(het)

    KIMENET.write_text(json.dumps(hetek, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(hetek)} hét → {KIMENET.name}")
    ossz = 6 * len(hetek)
    print(f"  hiánytalan hasáb: {ossz - len(gyanus)}/{ossz}")
    if gyanus:
        from collections import Counter
        print("  üres cellát tartalmazó hasábok:", Counter(g[1] for g in gyanus))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
