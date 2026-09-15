# -*- coding: utf-8 -*-
"""
A sablon-változatok ünnep-kötésének helyreállítása és ellenőrzése.

MI VOLT A HIBA. Minden témához két változat (`_v1`, `_v2`) tartozik, sok esetben
az eredeti sablon mellett. Egy család tagjainak ugyanahhoz a hónaphoz és
ugyanahhoz a jeles naphoz kell tartozniuk — különben a heti terv generálása rossz
hétre teszi a témát. Két eltérés maradt bent:

1. `advent_v1` / `advent_v2` — nem kapta meg a `kapcsoloUnnep: "Advent kezdete"`
   kötést, és november lett a hónapja december helyett. Emiatt az „Adventi
   készülődés" november közepére került, két héttel az advent kezdete ELÉ. A
   mobil appban súlyosabb volt: ott a változatok egy témává olvadnak össze az
   alapnév alatt, így a hibás változat elnyelte az ünnep-kötést hordozó eredeti
   `advent` sablont, és az adventi hét egyáltalán nem jött elő.

2. `tok_fesztival_v2` — ez NEM a Tök-fesztivál másik változata, hanem egy önálló
   téma („Mindenszentek hagyományai óvodás szinten"), csak rossz azonosítót
   kapott. A mobilon emiatt teljesen eltűnt (beolvadt a Tök-fesztiválba), az
   asztali programban pedig a két különböző téma egy családnak látszott. Az új
   azonosítója `mindenszentek`. A Tök-fesztivál pedig megkapja a saját jeles
   napját, hogy ne a hónap-sorrend szerencséjén múljon, melyik hétre kerül.

A szkript a végén ELLENŐRZI is az összes változat-családot, hogy ilyen eltérés ne
fordulhasson elő újra észrevétlenül; eltérésnél nem nulla kilépési kóddal áll le.

Futtatás: python tools/sablon_unnep_javitas.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed" / "weekly-templates.json"

# Rosszul elnevezett sablonok: régi azonosító → új azonosító.
ATNEVEZES = {"tok_fesztival_v2": "mindenszentek"}

# Hiányzó ünnep-kötések, amelyeket nem lehet a családból örökölni.
UNNEP_POTLAS = {"tok_fesztival_v1": "Tök-fesztivál (őszi)"}

# A családon belül egységesítendő ütemezési mezők. A szöveges tartalom marad a
# változaté — csak az „mikor kerüljön elő" adat egységesül.
UTEMEZES = ("javasoltHonap", "javasoltSorrend", "kapcsoloUnnep")


def csaladok(sablonok: list[dict]) -> dict[str, list[dict]]:
    csoport: dict[str, list[dict]] = defaultdict(list)
    for s in sablonok:
        csoport[re.sub(r"_v[12]$", "", s["azonosito"])].append(s)
    return csoport


def minta(tagok: list[dict]) -> dict:
    """A család mérvadó tagja: az eredeti (változat nélküli), különben a `_v1`."""
    for t in tagok:
        if not t["azonosito"].endswith(("_v1", "_v2")):
            return t
    return tagok[0]


def main() -> int:
    szaraz = "--dry-run" in sys.argv
    adat = json.loads(SEED.read_text(encoding="utf-8"))
    sablonok = adat["sablonok"]
    valtozas = 0

    # 1. Rosszul elnevezett sablonok
    for s in sablonok:
        uj = ATNEVEZES.get(s["azonosito"])
        if uj:
            print(f"  átnevezés: {s['azonosito']} → {uj}  ({s['cim']})")
            s["azonosito"] = uj
            valtozas += 1

    # 2. Hiányzó ünnep-kötés pótlása
    for s in sablonok:
        unnep = UNNEP_POTLAS.get(s["azonosito"])
        if unnep and s.get("kapcsoloUnnep") != unnep:
            print(f"  {s['azonosito']:26} kapcsoloUnnep: {s.get('kapcsoloUnnep')!r} → {unnep!r}")
            s["kapcsoloUnnep"] = unnep
            valtozas += 1

    # 3. Ütemezési mezők egységesítése a családon belül
    for tagok in csaladok(sablonok).values():
        if len(tagok) < 2:
            continue
        forras = minta(tagok)
        for s in tagok:
            if s is forras:
                continue
            for mezo in UTEMEZES:
                var, alap = s.get(mezo), forras.get(mezo)
                # A sorrendet csak akkor igazítjuk, ha a mérvadó tagnak van ilyenje.
                if alap is None and mezo == "javasoltSorrend":
                    continue
                if var != alap:
                    print(f"  {s['azonosito']:26} {mezo}: {var!r} → {alap!r}")
                    s[mezo] = alap
                    valtozas += 1

    # 4. Ellenőrzés
    hibak = []
    for alap, tagok in csaladok(sablonok).items():
        kulcsok = {(t.get("javasoltHonap"), t.get("kapcsoloUnnep")) for t in tagok}
        if len(kulcsok) > 1:
            hibak.append(f"{alap}: {sorted(kulcsok, key=str)}")
    if hibak:
        print("\n  ELTÉRŐ CSALÁDOK MARADTAK:")
        for h in hibak:
            print("   ", h)
        return 1

    if valtozas == 0:
        print("  Minden változat egyezik a családjával — nincs javítanivaló.")
        return 0
    if szaraz:
        print(f"\n  [dry-run] {valtozas} mező módosulna.")
        return 0

    SEED.write_text(
        json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"\n  {valtozas} mező javítva → {SEED.name}")
    print("  FUTTASD UTÁNA: python tools/mobil_tartalom.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
