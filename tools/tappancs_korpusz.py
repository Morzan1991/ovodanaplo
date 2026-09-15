# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadványból kinyert irodalom beépítése a korpuszba.

Bemenet : tools/tappancs-irodalom.json (a `tappancs_kinyeres.py` kimenete)
Kimenet : tools/korpusz/tappancs.py — generált modul, a többi korpuszrésszel
          azonos alakban regisztrálja a műveket.

A kiadvány 36 hete közül 27 a programunk meglévő témáira illik; a maradék 9 új
témát hoz (őszi zöldségek, Mihály-nap, őszi kerti munkák, madárvonulás, újévi
népszokások, évszakok körforgása, napszakok, fény-árnyék, Balázs-nap). Az új
témák a `TAPPANCS_UJ_TEMAK` szótárban szerepelnek.

Futtatás: python tools/tappancs_korpusz.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent
BEMENET = GYOKER / "tappancs-irodalom.json"
JATEKOK = GYOKER / "tappancs-jatekok.json"
KIMENET = GYOKER / "korpusz" / "tappancs.py"

# A kiadvány hete (hónap-rövidítés + hetszám) → a programunk témaazonosítója.
TEMA_TERKEP: dict[tuple[str, int], list[str]] = {
    ("SZEPTEMBER", 1): ["tanevkezdes"],
    ("SZEPTEMBER", 2): ["osz_termenyek", "osz_kezdete"],
    ("SZEPTEMBER", 3): ["osz_zoldsegek"],
    ("SZEPTEMBER", 4): ["mihaly_nap"],
    ("OKTÓBER", 1): ["allatok_vilagnapja"],
    ("OKTÓBER", 2): ["kodos_oszi_ido"],
    ("OKTÓBER", 3): ["oszi_kerti_munkak"],
    ("OKTÓBER", 4): ["osz_szinek"],
    ("NOVEMBER", 1): ["testunk"],
    ("NOVEMBER", 2): ["marton_nap"],
    ("NOVEMBER", 3): ["egeszseges_eletmod"],
    ("NOVEMBER", 4): ["madarvonulas"],
    ("DECEMBER", 1): ["advent"],
    ("DECEMBER", 2): ["mikulas"],
    ("DECEMBER", 3): ["karacsony"],
    ("DECEMBER", 4): ["fenyofa_diszek"],
    ("JANUÁR", 1): ["ujevi_nepszokasok"],
    ("JANUÁR", 2): ["evszakok_korforgas"],
    ("JANUÁR", 3): ["napszakok_napirend"],
    ("JANUÁR", 4): ["teli_oltozkodes", "teli_sportok"],
    ("FEBRUÁR", 1): ["feny_arnyek_mackok"],
    ("FEBRUÁR", 2): ["balazs_nap_iskola"],
    ("FEBRUÁR", 3): ["farsang"],
    ("FEBRUÁR", 4): ["erdo_allatai"],
    ("MÁRCIUS", 1): ["testunk"],
    ("MÁRCIUS", 2): ["marcius_15"],
    ("MÁRCIUS", 3): ["viz_vilagnapja"],
    ("MÁRCIUS", 4): ["foglalkozasok"],
    ("ÁPRILIS", 1): ["husveti_het", "husvet"],
    ("ÁPRILIS", 2): ["tavasz"],
    ("ÁPRILIS", 3): ["fold_napja"],
    ("ÁPRILIS", 4): ["mehek_napja"],
    ("MÁJUS", 1): ["anyak_napja_csalad"],
    ("MÁJUS", 2): ["kozlekedes"],
    ("MÁJUS", 3): ["tavaszi_viragok"],
    ("MÁJUS", 4): ["gyermeknap"],
}

KOR_JEGY = {"kicsi": "1", "kozepso": "2", "nagy": "3"}

# Az itt szereplő címek nem művek, hanem feladatleírások — kihagyjuk.
NEM_MU = re.compile(
    r"(gyakorl|éneklés|végzés|fejleszt|szilárdít|utánzás|kiemelés|biztosít|"
    r"csoportban|mozgásra|hangképző|dalokon|játékokon|feldolgozás|ismétlés|"
    r"megfigyelés|beszélgetés|^Versek|^Mesék|^Mese|^Dalok)", re.I
)


def tisztit(cim: str) -> str:
    """Egységes cím: felesleges pontok, három pont és szóközök nélkül."""
    c = re.sub(r"\s+", " ", cim).strip()
    c = c.rstrip("…").strip(" .,;:")
    # A kiadvány néha eligazítást tesz a cím elé („Advent 1. hetére: …”).
    c = re.sub(r"^[^:]*\d[^:]*:\s*", "", c)
    return c


def mufaj(cim: str, forras: str) -> str | None:
    """Műfaj a forrás-rovat és a cím alakja alapján."""
    if NEM_MU.search(cim) or len(cim) < 4:
        return None
    vanSzerzo = bool(re.match(r"^[A-ZÁÉÍÓÖŐÚÜŰ][^:]{2,40}:\s+\S", cim))
    if forras == "dalok":
        return "dal"
    if forras == "mesek":
        return "mese" if vanSzerzo else "nepmese"
    # versek rovat: szerző nélküli, rövid szöveg jellemzően népi mondóka
    if vanSzerzo:
        return "vers"
    return "mondoka" if len(cim) <= 34 else "vers"


# Egyszavas szerzőnevek, amelyek szabályosak (a többinél két szót várunk).
EGYSZAVAS_SZERZO = {"Szutyejev", "Andersen", "Aiszóposz", "Ezópus", "La Fontaine"}


def szerzoE(nev: str) -> bool:
    """
    Valódi szerzőnév-e a kettőspont előtti rész?

    A kiadványban néha eligazítás áll a cím előtt („Advent 1. hetére: …”), ezt
    nem szabad szerzőként átvenni.
    """
    if any(ch.isdigit() for ch in nev):
        return False
    szavak = nev.split()
    if len(szavak) >= 2 and all(sz[:1].isupper() or sz in {"és", "testvérek"} for sz in szavak):
        return True
    return nev in EGYSZAVAS_SZERZO


def szetszed(cim: str) -> tuple[str | None, str]:
    """„Szerző: Cím” szétbontása."""
    m = re.match(r"^([A-ZÁÉÍÓÖŐÚÜŰ][^:]{2,40}):\s+(.+)$", cim)
    if m and szerzoE(m.group(1).strip()):
        return (m.group(1).strip(), m.group(2).strip())
    return (None, cim)


def anyanyelviJatekok() -> dict[tuple[str, int], list[tuple[str, str]]]:
    """
    A kiadvány játékleírásai közül az anyanyelviek, hetenként.

    A táblázat csak a játék NEVÉT adja meg, a szabályát a lap alján — ezt a
    megjegyzésbe tesszük, hogy a pedagógus a heti tervben is lássa, hogyan megy.
    """
    if not JATEKOK.exists():
        return {}
    sys.path.insert(0, str(GYOKER))
    from tappancs_jatek_beepites import terulet  # noqa: PLC0415

    eredmeny: dict[tuple[str, int], list[tuple[str, str]]] = {}
    for h in json.loads(JATEKOK.read_text(encoding="utf-8")):
        for j in h["jatekok"]:
            if terulet(j["nev"], j["leiras"]) == "verseles_meseles":
                eredmeny.setdefault((h["honap"], h["het"]), []).append(
                    (j["nev"].strip(" .,"), j["leiras"].strip(" ."))
                )
    return eredmeny


def main() -> int:
    hetek = json.loads(BEMENET.read_text(encoding="utf-8"))
    jatekok = anyanyelviJatekok()

    # (tema, mufaj, szerzo, cim) -> korok halmaza
    gyujto: dict[tuple[str, str, str | None, str], set[str]] = {}
    # (tema, cim) -> szabály-leírás
    leirasok: dict[tuple[str, str], str] = {}
    ismeretlenHet = []

    for h in hetek:
        temak = TEMA_TERKEP.get((h["honap"], h["het"]))
        if not temak:
            ismeretlenHet.append((h["honap"], h["het"], h["cim"]))
            continue
        # a lap alján felsorolt anyanyelvi játékok — mindhárom korcsoportnak
        for nev, leiras in jatekok.get((h["honap"], h["het"]), []):
            tisztaNev = tisztit(nev)
            for tema in temak:
                gyujto.setdefault((tema, "anyanyelvi", None, tisztaNev), set()).update("123")
                leirasok[(tema, tisztaNev)] = leiras

        for kor, tartalom in h["korok"].items():
            jegy = KOR_JEGY[kor]
            anyanyelvi = tartalom.get("anyanyelvi_jatek", "").strip()
            if anyanyelvi and len(anyanyelvi) >= 4 and not NEM_MU.search(anyanyelvi):
                for tema in temak:
                    gyujto.setdefault(
                        (tema, "anyanyelvi", None, tisztit(anyanyelvi)), set()
                    ).add(jegy)
            for rovat in ("versek", "mesek", "dalok"):
                for nyers in tartalom.get(rovat, []):
                    cim = tisztit(nyers)
                    mf = mufaj(cim, rovat)
                    if mf is None:
                        continue
                    szerzo, tisztaCim = szetszed(cim)
                    # Egy cellában néha vesszővel sorolnak két mesét
                    # („A kesztyű, Visszajött a répa”) — szétválasztjuk.
                    darabok = (
                        [d.strip() for d in tisztaCim.split(", ")]
                        if szerzo is None
                        and mf in {"mese", "nepmese"}
                        and re.search(r", [A-ZÁÉÍÓÖŐÚÜŰ]", tisztaCim)
                        else [tisztaCim]
                    )
                    for darab in darabok:
                        if len(darab) < 4:
                            continue
                        for tema in temak:
                            gyujto.setdefault((tema, mf, szerzo, darab), set()).add(jegy)

    # Modul kiírása
    sorok: list[str] = [
        "# -*- coding: utf-8 -*-",
        '"""',
        "A „Tappancs” heti tervezet-gyűjteményből átvett irodalom (GENERÁLT FÁJL).",
        "",
        "Forrás: a kiadvány 36 hetének Verselés, mesélés és Ének, zene rovata,",
        "korcsoportonként. A kinyerést a `tools/tappancs_kinyeres.py`, a modul",
        "előállítását a `tools/tappancs_korpusz.py` végzi — kézzel ne szerkeszd,",
        "mert a következő generálásnál elveszik.",
        '"""',
        "",
        "from .base import _t",
        "",
    ]

    temakSzerint: dict[str, list[tuple[str, str | None, str, str]]] = {}
    for (tema, mf, szerzo, cim), korok in gyujto.items():
        temakSzerint.setdefault(tema, []).append((mf, szerzo, cim, "".join(sorted(korok))))

    for tema in sorted(temakSzerint):
        sorok.append(f'_t("{tema}", [')
        for mf, szerzo, cim, korok in sorted(temakSzerint[tema], key=lambda e: (e[0], e[2])):
            sz = f'"{szerzo}"' if szerzo else "None"
            cimEsc = cim.replace('"', "'")
            megj = leirasok.get((tema, cim), "").replace('"', "'")
            sorok.append(f'    ("{mf}", {sz}, "{cimEsc}", "{korok}", "{megj}"),')
        sorok.append("])")
        sorok.append("")

    KIMENET.write_text("\n".join(sorok), encoding="utf-8")

    print(f"{len(gyujto)} tétel {len(temakSzerint)} témában → {KIMENET.name}")
    from collections import Counter
    c = Counter(mf for _t_, mf, _s, _c in gyujto)
    print("  műfaj szerint:", dict(c))
    ujak = sorted(set(temakSzerint) - set(json.loads(
        (GYOKER.parent / "seed" / "otletek-bank-vegyes.json").read_text(encoding="utf-8")
    )["temak"]))
    print(f"  ÚJ témák ({len(ujak)}):", ujak)
    if ismeretlenHet:
        print("  térképezetlen hetek:", ismeretlenHet)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
