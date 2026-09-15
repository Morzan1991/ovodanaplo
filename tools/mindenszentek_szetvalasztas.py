# -*- coding: utf-8 -*-
"""
A Mindenszentek anyagának kiemelése a Tök-fesztivál ötletbankjából.

MIÉRT: a „Mindenszentek hagyományai óvodás szinten" sablon rossz azonosítót kapott
(`tok_fesztival_v2`), pedig nem a Tök-fesztivál másik változata, hanem külön téma.
Az ötletbank a `_v1`/`_v2` sablonokat az alapnév alá vonja össze, ezért a
mécsesről, a temetőlátogatásról és a krizantémról szóló javaslatok a
„Tök-fesztivál, őszi termények" téma alá kerültek — oda nem illenek.

A sablon átnevezését a `tools/sablon_unnep_javitas.py` végzi; ez a szkript a
NÉGY ötletbankban végzi el a szétválasztást:

  - a Mindenszentek-sablon saját sorai átkerülnek egy új `mindenszentek` témába,
  - a Tök-fesztiválban csak az marad, ami tényleg oda való,
  - a mindkét sablonban szereplő sorok maradnak a Tök-fesztiválban is.

Futtatás: python tools/mindenszentek_szetvalasztas.py [--dry-run]
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
KOROK = ("kicsi", "kozepso", "nagy", "vegyes")

FORRAS = "mindenszentek"        # az új téma azonosítója
EREDETI = "tok_fesztival"       # innen emeljük ki
MARAD = "tok_fesztival_v1"      # ennek a sorai maradnak a Tök-fesztiválban

# Szekció-fejlécek — ezek nem ötletek.
FEJLEC = re.compile(
    r"^(mesék|mondókák és versek|mondókák, versek|tornatermi tevékenységek|"
    r"anyanyelvi játék|csoportban/udvaron végzett mindennapos mozgás)\s*:?\s*$",
    re.I,
)


def sorok(sablon: dict) -> dict[str, set[str]]:
    return {
        terulet: {
            x.strip()
            for x in (szoveg or "").split("\n")
            if x.strip() and not FEJLEC.match(x.strip())
        }
        for terulet, szoveg in sablon["teruletek"].items()
    }


def main() -> int:
    dry = "--dry-run" in sys.argv
    sablonok = {
        s["azonosito"]: s
        for s in json.loads((SEED / "weekly-templates.json").read_text(encoding="utf-8"))["sablonok"]
    }
    if FORRAS not in sablonok:
        print(f"  Nincs `{FORRAS}` sablon — előbb fusson a tools/sablon_unnep_javitas.py")
        return 1

    ms = sorok(sablonok[FORRAS])
    tf = sorok(sablonok[MARAD]) if MARAD in sablonok else {}

    for kor in KOROK:
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        temak = adat["temak"]
        regi = temak.get(EREDETI, {})

        uj_ms: dict[str, list[str]] = {}
        uj_tf: dict[str, list[str]] = {}
        for terulet, lista in regi.items():
            # Csak az kerül át, ami a Mindenszentek-sablonban van, a Tök-fesztiválban
            # viszont nincs — a közös sorok mindkét témában helytállóak.
            atvisz = ms.get(terulet, set()) - tf.get(terulet, set())
            marad = [x for x in lista if x not in atvisz]
            visz = [x for x in lista if x in atvisz]
            if marad:
                uj_tf[terulet] = marad
            if visz:
                uj_ms[terulet] = visz

        # A sablon sorait NEM töltjük fel egységesen: a bankban korosztályonként más
        # anyag gyűlt össze (más irodalom, más nehézségű feladatok), és ezt a
        # különbséget megőrizzük — az azonos listák korábban is jogos panasz voltak.

        temak[EREDETI] = uj_tf
        temak[FORRAS] = uj_ms
        print(
            f"  {kor:8} tök-fesztivál {sum(len(v) for v in regi.values()):3}"
            f" → {sum(len(v) for v in uj_tf.values()):3} ötlet ·"
            f" mindenszentek {sum(len(v) for v in uj_ms.values()):3} ötlet"
        )
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("\n(dry-run)" if dry else "\n  MENTVE — futtasd utána: python tools/mobil_tartalom.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
