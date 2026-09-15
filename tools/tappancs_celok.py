# -*- coding: utf-8 -*-
"""
A „Tappancs” korcsoportonkénti cél/feladat és fejlesztési területek beépítése.

A kiadvány minden hétnél KORCSOPORTONKÉNT külön fogalmazza meg, mit akarunk
elérni és mely képességeket fejlesztjük — a kiscsoportnál az ismerkedést és az
érzékszervi tapasztalást, a nagycsoportnál a rendszerezést és az összefüggéseket.
A programunk sablonjában eddig egyetlen, közös szöveg volt.

Mit ír a sablonba:
  celKorcsoport[kor]                  ← külső világ + matematika + verselés cél-cellái
  feladatKorcsoport[kor]              ← rajzolás + ének + mozgás cél-cellái
  kepessegfejlesztesKorcsoport[kor]   ← mind a hat hasáb fejlesztési területei

A program a `korcsoportraSzabott()` függvényben ezeket használja a közös szöveg
helyett, ha a csoport kis-, középső vagy nagycsoport (vegyesnél az általános
marad, mert ott mindhárom szint jelen van).

Futtatás: python tools/tappancs_celok.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tappancs_korpusz import TEMA_TERKEP  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent
SEED = GYOKER.parent / "seed"
BEMENET = GYOKER / "tappancs-teljes.json"

KOROK = ["kicsi", "kozepso", "nagy"]
# Melyik hasábok szólnak a megismerésről (cél) és melyek a tevékenységről (feladat).
CEL_HASABOK = ["kulso_vilag", "matematika", "verseles_meseles"]
FELADAT_HASABOK = ["rajzolas_festes", "enek_zene", "mozgas"]
MINDEN_HASAB = CEL_HASABOK + FELADAT_HASABOK


def mondatok(szoveg: str) -> list[str]:
    """A cella szövege mondatokra, a tördelés feloldásával."""
    if not szoveg.strip():
        return []
    egyben = re.sub(r"\s*\n\s*", " ", szoveg)
    egyben = re.sub(r"\s+", " ", egyben).strip()
    darabok = re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÖŐÚÜŰ])", egyben)
    return [d.strip() for d in darabok if len(d.strip()) >= 10]


def osszefuz(cellak: list[str]) -> str:
    """Több hasáb szövegét egy bekezdéssé, ismétlés nélkül."""
    latott: set[str] = set()
    eredmeny: list[str] = []
    for cella in cellak:
        for m in mondatok(cella):
            kulcs = re.sub(r"[^\wáéíóöőúüű]+", " ", m.lower()).strip()
            if kulcs in latott:
                continue
            latott.add(kulcs)
            eredmeny.append(m if m.endswith((".", "!", "?")) else m + ".")
    return " ".join(eredmeny)


def kepessegek(cellak: list[str]) -> str:
    """A fejlesztési területek felsorolása, ismétlés nélkül, vesszős listaként."""
    latott: set[str] = set()
    elemek: list[str] = []
    for cella in cellak:
        szoveg = re.sub(r"\s*\n\s*", " ", cella)
        # a kiadvány pontokkal és vesszőkkel is tagol
        for nyers in re.split(r"[.;]\s*|,\s*(?=[A-ZÁÉÍÓÖŐÚÜŰ])", szoveg):
            e = re.sub(r"\s+", " ", nyers).strip(" .,;:")
            if len(e) < 4:
                continue
            # A fejlesztési területek alatt néhány lapon játékleírás következik
            # („Postásjáték – A gyermekek egy sorban ülnek…”). Az képességnévnek
            # rövid: a hosszú, gondolatjeles magyarázatoknál elvágjuk a sort.
            if len(e) > 60 or " – " in e or re.match(r"^(nagy|közép|kis)\w*\s*:", e, re.I):
                break
            kulcs = e.lower()
            if kulcs in latott:
                continue
            latott.add(kulcs)
            elemek.append(e[0].lower() + e[1:] if e[:1].isupper() and " " in e else e)
    return ", ".join(elemek)


def main() -> int:
    dry = "--dry-run" in sys.argv
    hetek = json.loads(BEMENET.read_text(encoding="utf-8"))

    # tema -> kor -> (cel, feladat, kepessegek)
    adatok: dict[str, dict[str, tuple[str, str, str]]] = {}
    for h in hetek:
        temak = TEMA_TERKEP.get((h["honap"], h["het"]))
        if not temak:
            continue
        cf = h["blokkok"]["cel_feladat"]
        fj = h["blokkok"]["fejlesztes"]
        for kor in KOROK:
            cel = osszefuz([cf[kor].get(x, "") for x in CEL_HASABOK])
            feladat = osszefuz([cf[kor].get(x, "") for x in FELADAT_HASABOK])
            kep = kepessegek([fj[kor].get(x, "") for x in MINDEN_HASAB])
            for tema in temak:
                # ha egy témához több hét is tartozik, az elsőt tartjuk meg
                adatok.setdefault(tema, {}).setdefault(kor, (cel, feladat, kep))

    ut = SEED / "weekly-templates.json"
    sablonAdat = json.loads(ut.read_text(encoding="utf-8"))
    valtozott = 0
    for s in sablonAdat["sablonok"]:
        tema = re.sub(r"_v[12]$", "", s["azonosito"])
        korAdat = adatok.get(tema)
        if not korAdat:
            continue
        celMap, feladatMap, kepMap = {}, {}, {}
        for kor, (cel, feladat, kep) in korAdat.items():
            if cel:
                celMap[kor] = cel
            if feladat:
                feladatMap[kor] = feladat
            if kep:
                kepMap[kor] = kep
        if celMap:
            s["celKorcsoport"] = celMap
        if feladatMap:
            s["feladatKorcsoport"] = feladatMap
        if kepMap:
            s["kepessegfejlesztesKorcsoport"] = kepMap
        if celMap or feladatMap or kepMap:
            valtozott += 1

    if not dry:
        ut.write_text(json.dumps(sablonAdat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"{valtozott} sablon kapott korcsoportos cél/feladat/fejlesztés adatot"
          + ("   (dry-run)" if dry else ""))
    print(f"  téma lefedve: {len(adatok)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
