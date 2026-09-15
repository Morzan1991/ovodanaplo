# -*- coding: utf-8 -*-
"""
A korcsoportos CÉL és FELADAT szövegek cseréje saját megfogalmazásra.

MIÉRT: lásd `tools/cel_feladat_szovegek.py`. A szövegek szó szerint a
„Tappancs" kiadványból származnak; a pedagógiai tartalom szabadon átvehető, a
megfogalmazás nem.

Mit tesz: a `seed/weekly-templates.json` `celKorcsoport` és `feladatKorcsoport`
mezőit a régi szöveg ujjlenyomata alapján lecseréli. Egy szöveg több sablonban is
szerepelhet (a v1/v2 változatok osztoznak rajta), mindegyik helyen cserél.

FONTOS: a `tools/celok_beepites.py` a saját, ONAP-alapú kiegészítéseinket fűzi a
szöveg végére. Az itteni csere UTÁN azt újra le kell futtatni, hogy a kiegészítés
a friss szöveg mögé kerüljön.

Futtatás: python tools/cel_feladat_ujrairas.py [--dry-run]
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from cel_feladat_szovegek import FINOMITAS, TORT_SZAVAK, UJ_SZOVEG  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed" / "weekly-templates.json"
MEZOK = ("celKorcsoport", "feladatKorcsoport")
# A kettétört szavak javítása a képességfejlesztés-listákra is vonatkozik.
MINDEN_MEZO = MEZOK + ("kepessegfejlesztesKorcsoport",)


def ujjlenyomat(szoveg: str) -> str:
    return hashlib.sha1(szoveg.encode("utf-8")).hexdigest()[:8]


def main() -> int:
    dry = "--dry-run" in sys.argv
    adat = json.loads(SEED.read_text(encoding="utf-8"))

    csere = 0
    erintett: set[str] = set()
    hianyzo: dict[str, tuple[str, str, str]] = {}

    for sablon in adat["sablonok"]:
        for mezo in MEZOK:
            reszek = sablon.get(mezo) or {}
            for kor, regi in list(reszek.items()):
                h = ujjlenyomat(regi)
                uj = UJ_SZOVEG.get(h)
                if uj is None:
                    hianyzo[h] = (sablon["azonosito"], mezo, kor)
                    continue
                if uj != regi:
                    reszek[kor] = uj
                    csere += 1
                    erintett.add(sablon["azonosito"])

    # Néhány mondatot magam is ugyanúgy fogalmaztam meg, ahogy a kiadványban áll.
    # Ez a lépés a MÁR lecserélt szövegeken is végigmegy, ezért újrafuttatható.
    finomitas = 0
    for sablon in adat["sablonok"]:
        for mezo in MEZOK:
            reszek = sablon.get(mezo) or {}
            for kor, szoveg in list(reszek.items()):
                uj = szoveg
                for regi, csereszoveg in FINOMITAS.items():
                    uj = uj.replace(regi, csereszoveg)
                if uj != szoveg:
                    reszek[kor] = uj
                    finomitas += 1

    # A PDF-kinyerés kettétört szavainak helyreállítása mindhárom mezőben.
    torott = 0
    for sablon in adat["sablonok"]:
        for mezo in MINDEN_MEZO:
            reszek = sablon.get(mezo) or {}
            for kor, szoveg in list(reszek.items()):
                uj = szoveg
                for regi, csereszoveg in TORT_SZAVAK.items():
                    uj = uj.replace(regi, csereszoveg)
                if uj != szoveg:
                    reszek[kor] = uj
                    torott += 1

    print(f"  lecserélt mező: {csere} · érintett sablon: {len(erintett)}")
    print(f"  kettétört szó javítva: {torott} mezőben")
    print(f"  finomított mező: {finomitas}")
    print(f"  már saját szöveg: {len(hianyzo)}")

    if not dry:
        SEED.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if csere:
            print("  FUTTASD UTÁNA: python tools/celok_beepites.py")
            print("                 python tools/mobil_tartalom.py")
    else:
        print("  (dry-run — semmi nem íródott ki)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
