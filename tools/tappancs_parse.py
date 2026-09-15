# -*- coding: utf-8 -*-
"""
A „Tappancs” heti tervezet-gyűjtemény kiolvasása strukturált JSON-ba.

A kiadvány 36 hetet dolgoz fel (szeptember–május), hetenként EGY könyvoldalpáron:
  bal oldal : Külső világ (környezeti) | Külső világ (matematikai) | Verselés, mesélés
  jobb oldal: Rajzolás, festés | Ének, zene | Mozgás
Mindkét oldalon három sáv — kiscsoport, középső, nagycsoport —, alattuk ugyanígy
a „CÉL, FELADAT”, majd a „FEJLESZTÉSI TERÜLETEK” blokk.

A PDF egy lapján a teljes oldalpár szerepel, ezért hasábonként kell szétvágni.
A szöveget koordinátákkal olvassuk (pypdf visitor): x szerint hasábokba, y
szerint sávokba rendezzük. A sávcímkék (Kiscsoport…) függőlegesen KÖZÉPRE vannak
igazítva, ezért a sávhatár két szomszédos címke felezőpontja.

Kimenet: tools/tappancs.json
Futtatás: python tools/tappancs_parse.py "<pdf útvonala>"
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

KIMENET = Path(__file__).resolve().parent / "tappancs.json"

# Hasábhatárok (x) oldalanként, a fejlécek helyzete alapján.
BAL_HASABOK = [("kulso_vilag", 118, 258), ("matematika", 258, 398), ("verseles_meseles", 398, 600)]
JOBB_HASABOK = [("rajzolas_festes", 688, 828), ("enek_zene", 828, 968), ("mozgas", 968, 1200)]
BAL_CIMKE = (95, 118)
JOBB_CIMKE = (660, 688)

KOROK = ["kicsi", "kozepso", "nagy"]
BLOKKOK = ["tartalom", "cel_feladat", "fejlesztes"]

CIMKE_RE = re.compile(r"^(Kiscsoport|Középső\s*csoport|Középső|Nagycsoport)$")


def darabok(page) -> list[tuple[float, float, str]]:
    """(x, y, szöveg) hármasok a lapról."""
    talalatok: list[tuple[float, float, str]] = []

    def latogato(text, cm, tm, font_dict, font_size):  # noqa: ANN001
        t = text.strip()
        if t:
            talalatok.append((round(tm[4], 1), round(tm[5], 1), t))

    page.extract_text(visitor_text=latogato)
    return talalatok


# A kilenc sáv címkéi mindig ebben a sorrendben követik egymást.
MINTA = ["kicsi", "kozepso", "nagy"] * 3


def cimkeNev(t: str) -> str | None:
    if t.startswith("Kis"):
        return "kicsi"
    if t.startswith("Közép"):
        return "kozepso"
    if t.startswith("Nagy"):
        return "nagy"
    return None


def cimkeSavok(elemek: list[tuple[float, float, str]], cimkeX: tuple[float, float]) -> list[float] | None:
    """
    A kilenc sávcímke y-koordinátája fentről lefelé.

    A PDF-ből néha hiányzik egy-egy címke (elforgatott szövegdarab), ezért a
    megtaláltakat a rögzített Kis–Közép–Nagy mintára illesztjük, a hiányzókat
    pedig a szomszédok között lineárisan pótoljuk.
    """
    talalt: list[tuple[float, str]] = []
    for x, y, t in elemek:
        nev = cimkeNev(t) if cimkeX[0] <= x < cimkeX[1] and CIMKE_RE.match(t) else None
        if nev is None:
            continue
        if talalt and abs(talalt[-1][0] - y) < 6:
            continue  # a kétsoros „Középső / csoport” második fele
        talalt.append((y, nev))
    talalt.sort(key=lambda e: -e[0])

    # Illesztés a mintára: minden megtalált címke a minta következő egyező helyére.
    helyek: dict[int, float] = {}
    i = 0
    for y, nev in talalt:
        while i < 9 and MINTA[i] != nev:
            i += 1
        if i >= 9:
            break
        helyek[i] = y
        i += 1
    if len(helyek) < 5:
        return None

    # Hiányzó helyek pótlása a szomszédok közti egyenletes osztással.
    ismert = sorted(helyek)
    # Ha az elejéről hiányzik címke, visszafelé is extrapolálunk.
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
    # A végén hiányzók: az utolsó ismert távolságát folytatjuk.
    ismert = sorted(helyek)
    if ismert[-1] < 8:
        lepes = (helyek[ismert[-2]] - helyek[ismert[-1]]) if len(ismert) > 1 else 60.0
        for k in range(ismert[-1] + 1, 9):
            helyek[k] = helyek[k - 1] - lepes
    return [helyek[i] for i in range(9)]


def hatarok(ys: list[float], tetoY: float) -> list[tuple[float, float]]:
    """Sávhatárok: két szomszédos, középre igazított címke felezőpontja."""
    hat = []
    for i, y in enumerate(ys):
        felso = tetoY if i == 0 else (ys[i - 1] + y) / 2
        also = 0.0 if i == len(ys) - 1 else (y + ys[i + 1]) / 2
        hat.append((also, felso))
    return hat


def szovegSavban(
    elemek: list[tuple[float, float, str]], xtol: float, xig: float, also: float, felso: float
) -> str:
    """Az adott téglalapba eső darabok sorokba fűzve."""
    benne = [(x, y, t) for x, y, t in elemek if xtol <= x < xig and also <= y < felso]
    if not benne:
        return ""
    benne.sort(key=lambda e: (-e[1], e[0]))
    sorok: list[list[str]] = []
    elozoY: float | None = None
    for _x, y, t in benne:
        if elozoY is not None and abs(elozoY - y) <= 3:
            sorok[-1].append(t)
        else:
            sorok.append([t])
            elozoY = y
        elozoY = y
    # Az elválasztójeles sorvégeket összevonjuk („szoká-\nsokkal” → „szokásokkal”).
    szoveg = "\n".join(re.sub(r"\s+", " ", " ".join(s)).strip() for s in sorok)
    szoveg = re.sub(r"(\w)-\n(\w)", r"\1\2", szoveg)
    return szoveg.strip()


def main() -> int:
    if len(sys.argv) < 2:
        print("Használat: python tools/tappancs_parse.py <pdf>")
        return 2
    reader = PdfReader(sys.argv[1])

    hetek = []
    kihagyott = []
    for lapIndex, page in enumerate(reader.pages):
        elemek = darabok(page)
        if len(elemek) < 50:
            continue

        fejlecSorok = sorted({(y, t) for x, y, t in elemek if y > 690}, reverse=True)
        honapSor = next((t for _y, t in fejlecSorok if re.search(r"H\s*É\s*T", t)), None)
        if not honapSor:
            continue
        m = re.search(r"([A-ZÁÉÍÓÖŐÚÜŰ]+)\s*,?\s*(\d+)\.?\s*H\s*É\s*T", honapSor)
        honap, hetSzam = (m.group(1), int(m.group(2))) if m else ("?", 0)
        # a téma címe a legfelső, nem-hónap sor
        cimJeloltek = [t for _y, t in fejlecSorok if t != honapSor and len(t) > 8]
        cim = cimJeloltek[0] if cimJeloltek else ""

        balYs = cimkeSavok(elemek, BAL_CIMKE)
        jobbYs = cimkeSavok(elemek, JOBB_CIMKE)
        if not balYs or not jobbYs:
            kihagyott.append((lapIndex + 1, cim, bool(balYs), bool(jobbYs)))
            continue

        tetoBal = max(y for x, y, t in elemek if BAL_HASABOK[0][1] <= x < 600 and y > balYs[0])
        tetoJobb = max(y for x, y, t in elemek if JOBB_HASABOK[0][1] <= x and y > jobbYs[0])
        balHat = hatarok(balYs, tetoBal)
        jobbHat = hatarok(jobbYs, tetoJobb)

        het: dict = {"lap": lapIndex + 1, "honap": honap, "het": hetSzam, "cim": cim, "blokkok": {}}
        for bi, blokk in enumerate(BLOKKOK):
            het["blokkok"][blokk] = {}
            for ki, kor in enumerate(KOROK):
                also, felso = balHat[bi * 3 + ki]
                jAlso, jFelso = jobbHat[bi * 3 + ki]
                cella = {}
                for nev, x1, x2 in BAL_HASABOK:
                    cella[nev] = szovegSavban(elemek, x1, x2, also, felso)
                for nev, x1, x2 in JOBB_HASABOK:
                    cella[nev] = szovegSavban(elemek, x1, x2, jAlso, jFelso)
                het["blokkok"][blokk][kor] = cella
        hetek.append(het)

    KIMENET.write_text(json.dumps(hetek, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(hetek)} hét kiolvasva → {KIMENET}")
    if kihagyott:
        print("Kihagyott lapok (nem sikerült a sávokat azonosítani):")
        for lap, cim, b, j in kihagyott:
            print(f"  lap {lap}: {cim[:50]}  bal={b} jobb={j}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
