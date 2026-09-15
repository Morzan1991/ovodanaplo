# -*- coding: utf-8 -*-
"""
Hibás tételek kivezetése a kereshető irodalomtárból.

MIÉRT KELL KÜLÖN SZKRIPT. Az `irodalom_beepites.py` szándékosan CSAK HOZZÁAD a
`seed/literature.json`-hoz: a tárban 230 olyan mű van, amely sosem volt a
korpuszban (Lázár Ervin, Csukás István, Arany János és társaik még a korpusz
előttről), ezeket egy teljes újraépítés kitörölné. Az árnyoldala viszont az,
hogy ha a korpuszból kijavítunk vagy kiveszünk egy tételt, a régi alak
ottmarad — és a felhasználó két változatot lát az Irodalom menüben.

Ez a szkript azt a néhány tételt vezeti ki, amely a PDF-kinyerés hibájából
került be. Nem mintára törlünk, hanem NÉVRE: minden sorhoz oda van írva, miért
megy, hogy egy későbbi olvasó is ellenőrizhesse.

A visszatérésük ellen a `seed-irodalom.test.ts` őrködik.

Futtatás: python tools/irodalom_takaritas.py [--dry-run]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed" / "literature.json"

# (tipus, cim) -> miért kerül ki
TORLENDO: dict[tuple[str, str], str] = {
    ("mondoka", "MESÉLÉS"): "lapfejléc a kiadványból, nem mű",
    ("mondoka", "VERSELÉS"): "lapfejléc a kiadványból, nem mű",
    ("mondoka", "anyának!"): "a cím eleje levágódott, visszaállíthatatlan töredék",
    ("mondoka", "fújása"): "töredék; ráadásul fújós játék, nem mondóka",
    ("mondoka", "(pingponglabda) fújása"): "töredék; fújós játék, nem mondóka",
    ("nepmese", "Március 15"): "nincs ilyen népmese; a két azonos című VERS megmarad",
    (
        "nepmese",
        "lllyés Gyula: A háromágú tölgyfa tündére",
    ): "OCR-hibás név; helyette „A háromágú tölgyfa tündére” áll a tárban",
    (
        "vers",
        "Vers: Gyárfás Endre: Írogató",
    ): "műfajcímke és szerző a címben; helyette Gyárfás Endre: Írogató",
    (
        "vers",
        "Vers: Gesztenye Gusztika",
    ): "műfajcímke a címben; helyette „Gesztenye Gusztika”",
    (
        "mese",
        "P. Ábrahám Ernő: A libák, a farkas meg a kiskakas",
    ): "szerző a címben; helyette a szerző mezőben szerepel",
}

# (tipus, régi cím) -> új cím. Olyan javítás, amely nem hoz létre új tételt,
# mert az összehasonlító kulcs kisbetűsít — a címet helyben kell rendbe tenni.
ATIRANDO: dict[tuple[str, str], str] = {
    ("vers", "nyárköszöntő"): "Nyárköszöntő",
}


def main() -> int:
    dry = "--dry-run" in sys.argv
    adat = json.loads(SEED.read_text(encoding="utf-8"))
    tetelek = adat["tetelek"]

    megmarad = []
    torolt = 0
    for t in tetelek:
        kulcs = (t.get("tipus"), t.get("cim"))
        miert = TORLENDO.get(kulcs)
        if miert:
            print(f"  törlés   {kulcs[0]:8} {kulcs[1]!r}")
            print(f"           → {miert}")
            torolt += 1
            continue
        megmarad.append(t)

    atirt = 0
    for t in megmarad:
        uj = ATIRANDO.get((t.get("tipus"), t.get("cim")))
        if uj and t["cim"] != uj:
            print(f"  javítás  {t['cim']!r} → {uj!r}")
            t["cim"] = uj
            atirt += 1

    if torolt == 0 and atirt == 0:
        print("  Az irodalomtár tiszta — nincs kivezetendő tétel.")
        return 0

    adat["tetelek"] = megmarad
    print(f"\n  {torolt} tétel törölve · {atirt} cím javítva · maradt {len(megmarad)}")
    if dry:
        print("  (dry-run — semmi nem íródott ki)")
        return 0
    SEED.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
