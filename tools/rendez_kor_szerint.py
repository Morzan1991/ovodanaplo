"""
Korosztály szerinti SORRENDEZÉS az ötlet-bankokban.

Előzmény: a kor-specifikus bankok korábban SZŰRÉSSEL készültek, majd — mert a
szűrés után kevés bullet maradt egy cellában — általános ötletekkel töltötték fel
őket. Emiatt a három korosztály bankja gyakorlatilag azonos lett: a látható 10
ötlet a cellák 86%-ában szó szerint megegyezett, a középső bankban pedig egyetlen
egyedi ötlet sem volt.

Ez a szkript más elven dolgozik: MINDEN ötlet minden bankban benne marad (semmi
nem vész el), de cellánként a korosztályhoz illő kerül előre. A program cellánként
10-et mutat, így a pedagógus ténylegesen a korosztályához illő listát látja,
miközben lejjebb görgetve a többi is elérhető.

Futtatás:  python tools/rendez_kor_szerint.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed"

# --- Korjelzők ---------------------------------------------------------------
# Csak olyan jelzők, amelyek VALÓBAN egy korosztályra jellemzőek. Az általános
# óvodai tevékenységek (körjáték, mesehallgatás, gyurmázás) szándékosan kimaradnak.

KICSI_JELZOK = [
    r"ujj-?fest", r"tapint", r"simogat", r"ringat", r"bölcső", r"babusgat",
    r"dúdol", r"csörg", r"csengety", r"beszoktat", r"vigasztal",
    r"utánz", r"gurul", r"hempereg", r"mászás", r"kúszás",
    r"nagymozgás", r"nagyméretű", r"vastag ceruza", r"pacsi",
    r"egyszerű", r"rövid mondóka", r"két-?három", r"\b1-?3-ig\b",
    r"beszoktatás", r"babajáték", r"babakocsi", r"kisautó",
]

NAGY_JELZOK = [
    r"betű", r"hangokra bont", r"hangfelismer", r"szótagol", r"memoriter",
    r"10-es számkör", r"20-ig", r"sorszám", r"tőszám", r"számfogalom",
    r"sorrendez", r"reláció", r"összehasonlít", r"következtet", r"elemz",
    r"grafomotor", r"ceruzafogás", r"vonalvezet", r"irányok", r"tájékozód",
    r"iskola-?előkészít", r"önállóan", r"szabályjáték", r"csapatverseny",
    r"stratégia", r"tervez", r"összefüggés", r"kitartó", r"bonyolult",
    r"emlékezetből", r"visszaszámlál", r"csoportosít.*szempont",
]

KICSI_RE = [re.compile(p, re.I) for p in KICSI_JELZOK]
NAGY_RE = [re.compile(p, re.I) for p in NAGY_JELZOK]


def jelzok(szoveg: str) -> tuple[int, int, int]:
    """(kicsi-jelzők, nagy-jelzők, összetettség) egy ötletre."""
    k = sum(1 for r in KICSI_RE if r.search(szoveg))
    n = sum(1 for r in NAGY_RE if r.search(szoveg))
    # Összetettség: a hosszabb, több lépcsős leírás a nagyobbaknak való.
    ossz = (1 if len(szoveg) > 90 else 0) + (1 if szoveg.count(",") >= 2 else 0)
    return k, n, ossz


def pontszam(szoveg: str, korcsoport: str) -> int:
    k, n, ossz = jelzok(szoveg)
    if korcsoport == "kicsi":
        return 3 * k - 3 * n - ossz
    if korcsoport == "nagy":
        return 3 * n - 3 * k + ossz
    # Középső: se nem kisgyermekes, se nem iskola-előkészítő — a semleges és az
    # enyhén összetett ötletek illenek ide leginkább.
    return -abs(3 * k - 3 * n) + (2 if k == 0 and n == 0 else 0) + (1 if ossz == 1 else 0)


def main() -> int:
    dry = "--dry-run" in sys.argv
    vegyes = json.loads((SEED / "otletek-bank-vegyes.json").read_text(encoding="utf-8"))

    for kc in ("kicsi", "kozepso", "nagy"):
        ut = SEED / f"otletek-bank-{kc}.json"
        bank = json.loads(ut.read_text(encoding="utf-8"))
        uj_temak: dict[str, dict[str, list[str]]] = {}

        for tema, teruletek in vegyes["temak"].items():
            uj_temak[tema] = {}
            for terulet, otletek in teruletek.items():
                # Minden ötlet megmarad; csak a sorrend változik. Az azonos
                # pontszámúak eredeti sorrendje megmarad (stabil rendezés).
                uj_temak[tema][terulet] = sorted(
                    otletek, key=lambda x: -pontszam(x, kc)
                )

        bank["temak"] = uj_temak
        bank["_megjegyzes"] = (
            "Korosztály szerint SORRENDEZETT ötlet-bank. Minden ötlet benne van "
            "(semmi nem vész el), de a korosztályhoz leginkább illő kerül előre — "
            "a program cellánként az első 10-et mutatja."
        )
        if not dry:
            ut.write_text(
                json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
            )
        print(f"  {kc}: {sum(len(v) for t in uj_temak.values() for v in [list(t.values())[0]] ) and ''}"
              f"{sum(len(lista) for t in uj_temak.values() for lista in t.values())} ötlet rendezve")

    print("\nKÉSZ." if not dry else "\n(dry-run — nem írtunk fájlt)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
