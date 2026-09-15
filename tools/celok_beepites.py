# -*- coding: utf-8 -*-
"""
A heti sablonok CÉL és FELADAT mezőinek bővítése.

A meglévő — a hét szűk tartalmára szorítkozó — szöveg mögé odafűzi a témához
tartozó nevelési szándékot (`tools/korpusz/celok*.py`): egészséges életmódra
nevelés, érzelmi-erkölcsi és közösségi nevelés, környezettudatos magatartás,
anyanyelvi és értelmi fejlesztés. A meglévő szöveget NEM írja felül.

Ismételt futtatásra nem duplikál: ha a kiegészítés első mondata már benne van,
kihagyja a sablont.

Futtatás:  python tools/celok_beepites.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from korpusz.celok import CELOK  # noqa: E402
from korpusz import celok_tel_tavasz, celok_uj  # noqa: E402,F401  (regisztrálja a többi témát)

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed"


def elsoMondat(szoveg: str) -> str:
    """A kiegészítés első mondata — ezzel ismerjük fel, ha már be van építve."""
    m = re.match(r"[^.]{10,}\.", szoveg.strip())
    return (m.group(0) if m else szoveg[:60]).strip()


def osszefuz(meglevo: str | None, plusz: str) -> str | None:
    """A meglévő szöveg mögé fűzi a kiegészítést, ha még nincs benne."""
    alap = (meglevo or "").strip()
    if elsoMondat(plusz) in alap:
        return None  # már be van építve
    if not alap:
        return plusz
    if not alap.endswith((".", "!", "?")):
        alap += "."
    return f"{alap} {plusz}"


def main() -> int:
    dry = "--dry-run" in sys.argv
    ut = SEED / "weekly-templates.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))

    valtozott = 0
    hianyzo: set[str] = set()
    celHosszak: list[int] = []
    feladatHosszak: list[int] = []

    for s in adat["sablonok"]:
        tema = re.sub(r"_v[12]$", "", s["azonosito"])
        parok = CELOK.get(tema)
        if parok is None:
            hianyzo.add(tema)
            celHosszak.append(len(s.get("cel") or ""))
            feladatHosszak.append(len(s.get("feladat") or ""))
            continue

        celPlusz, feladatPlusz = parok
        ujCel = osszefuz(s.get("cel"), celPlusz)
        ujFeladat = osszefuz(s.get("feladat"), feladatPlusz)
        if ujCel is not None:
            s["cel"] = ujCel
            valtozott += 1
        if ujFeladat is not None:
            s["feladat"] = ujFeladat
            valtozott += 1
        celHosszak.append(len(s["cel"]))
        feladatHosszak.append(len(s["feladat"]))

    if hianyzo:
        print(f"  FIGYELEM — kiegészítés nélküli témák: {sorted(hianyzo)}")
    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    atlag = lambda xs: int(sum(xs) / len(xs))  # noqa: E731
    print(f"  {valtozott} mező bővítve" + ("   (dry-run)" if dry else ""))
    print(f"  cél átlagos hossz: {atlag(celHosszak)} karakter")
    print(f"  feladat átlagos hossz: {atlag(feladatHosszak)} karakter")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
