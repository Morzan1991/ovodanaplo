# -*- coding: utf-8 -*-
"""
Ötletbank-bejegyzések készítése azokhoz a témákhoz, amelyekhez még nincs.

Miért: a 💡 Ötletek gomb a téma × terület metszéspontjára kínál javaslatokat az
`otletek-bank-*.json` fájlokból. Az újonnan felvett témákhoz nem tartozott
bejegyzés, így ott üresen maradt volna a korosztály-specifikus lista.

Mit tesz: a sablon saját, már kidolgozott tevékenységeit veszi át kiindulásnak
(ezek valódi, felhasználható ötletek), a szekció-fejléceket kihagyva. A
korosztály szerinti sorrendezést utána a `rendez_kor_szerint.py` végzi.

Futtatás:  python tools/otletbank_uj_temakhoz.py [--dry-run]
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

# Szekció-fejlécek — ezek nem ötletek, kimaradnak.
FEJLEC = re.compile(
    r"^(mesék|mondókák és versek|tornatermi tevékenységek|"
    r"csoportban/udvaron végzett mindennapos mozgás)\s*:?\s*$",
    re.I,
)


def main() -> int:
    dry = "--dry-run" in sys.argv
    sablonok = json.loads((SEED / "weekly-templates.json").read_text(encoding="utf-8"))["sablonok"]
    vegyes_ut = SEED / "otletek-bank-vegyes.json"
    bank = json.loads(vegyes_ut.read_text(encoding="utf-8"))

    hianyzo = []
    for s in sablonok:
        alap = re.sub(r"_v[12]$", "", s["azonosito"])
        if alap in bank["temak"]:
            continue
        if alap in [x[0] for x in hianyzo]:
            continue
        hianyzo.append((alap, s))

    if not hianyzo:
        print("Minden témához van már ötletbank-bejegyzés.")
        return 0

    for alap, s in hianyzo:
        cellak: dict[str, list[str]] = {}
        for terulet, szoveg in s["teruletek"].items():
            sorok = [
                x.strip()
                for x in (szoveg or "").split("\n")
                if x.strip() and not FEJLEC.match(x.strip())
            ]
            if sorok:
                cellak[terulet] = sorok
        bank["temak"][alap] = cellak
        print(f"  {alap:24} {sum(len(v) for v in cellak.values()):3} ötlet, "
              f"{len(cellak)} területen")

    if not dry:
        vegyes_ut.write_text(
            json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"\nMENTVE — témák összesen: {len(bank['temak'])}")
    else:
        print("\n(dry-run)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
