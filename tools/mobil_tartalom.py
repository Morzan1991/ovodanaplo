# -*- coding: utf-8 -*-
"""
A mobil app tartalom-csomagjának előállítása a közös `seed/` mappából.

MIÉRT KÜLÖN CSOMAG: az asztali program mind a nyolc seed-fájlt beolvassa (1,8 MB
tömörítve), de a mobil app csak böngészésre és ötletelésre való — nem ír heti
tervet, nem exportál Wordbe. Ezért csak azt visszük át, amire ott szükség van, és
a sablonokból is csak a fejadatokat, nem a hét terület teljes szövegét (az az
ötletbankban amúgy is benne van, korcsoportonként).

FONTOS: ez a fájl a `seed/`-ből GENERÁL. Ha bővül a tartalom, elég újra futtatni —
így az asztali és a mobil app soha nem csúszik szét.

Kimenet: mobile/src/tartalom/*.json
Futtatás: python tools/mobil_tartalom.py
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

GYOKER = Path(__file__).resolve().parent.parent
SEED = GYOKER / "seed"
KIMENET = GYOKER / "mobile" / "src" / "tartalom"

KOROK = ["kicsi", "kozepso", "nagy", "vegyes"]

# A hét ONAP-terület megjelenítési neve és sorrendje a mobilon.
TERULETEK = [
    ("kulso_vilag", "Külső világ"),
    ("matematika", "Matematika"),
    ("verseles_meseles", "Verselés, mesélés"),
    ("rajzolas_festes", "Rajzolás, festés"),
    ("enek_zene", "Ének, zene"),
    ("hallas_ritmus", "Hallás, ritmus"),
    ("mozgas", "Mozgás"),
]


def olvas(nev: str) -> dict:
    return json.loads((SEED / nev).read_text(encoding="utf-8"))


def ir(nev: str, adat) -> int:
    KIMENET.mkdir(parents=True, exist_ok=True)
    szoveg = json.dumps(adat, ensure_ascii=False, separators=(",", ":"))
    (KIMENET / nev).write_text(szoveg, encoding="utf-8")
    return len(szoveg.encode("utf-8"))


def main() -> int:
    meret = {}

    # --- Témák: a sablonok fejadatai, változatok nélkül összevonva -------------
    sablonok = olvas("weekly-templates.json")["sablonok"]
    temak: dict[str, dict] = {}
    for s in sablonok:
        alap = re.sub(r"_v[12]$", "", s["azonosito"])
        meglevo = temak.get(alap)
        # a téma neve a v1-é (a v2 gyakran csak egy másik megfogalmazás)
        if meglevo is None or (s.get("verzio") or 9) < (meglevo.get("_v") or 9):
            temak[alap] = {
                "id": alap,
                "cim": s["cim"],
                "honap": s.get("javasoltHonap"),
                "sorrend": s.get("javasoltSorrend"),
                "tema": s.get("tema", ""),
                "kategoria": s.get("kategoria", ""),
                # a jeles naphoz kötődő témák a mobil „Ez a hét" kártyájához kellenek
                "unnep": s.get("kapcsoloUnnep") or "",
                "cel": s.get("cel", ""),
                "feladat": s.get("feladat", ""),
                "kepessegek": s.get("kepessegfejlesztes", ""),
                "celKor": s.get("celKorcsoport") or {},
                "feladatKor": s.get("feladatKorcsoport") or {},
                "kepessegKor": s.get("kepessegfejlesztesKorcsoport") or {},
                "_v": s.get("verzio") or 9,
            }

    # ŐRSZEM: a `_v1`/`_v2` változatok ugyanazon alapnév alá olvadnak, mint az
    # eredeti sablon, és a mobil csak EGY témát lát belőlük. Ha a család tagjai más
    # ünnephez vagy hónaphoz tartoznak, akkor az összevonás némán eldob egy kötést
    # — és az adott ünnepi hét témája nyomtalanul eltűnik a telefonról. Ezt nem
    # foltozzuk itt, mert a seedben kell rendben lennie; inkább leállunk.
    elteres = []
    for s in sablonok:
        alap = re.sub(r"_v[12]$", "", s["azonosito"])
        cel = temak.get(alap)
        if cel is None:
            continue
        if (s.get("kapcsoloUnnep") or "") != cel["unnep"] or s.get("javasoltHonap") != cel["honap"]:
            elteres.append(
                f"{s['azonosito']}: honap={s.get('javasoltHonap')} unnep={s.get('kapcsoloUnnep')!r}"
                f"  ≠  {alap}: honap={cel['honap']} unnep={cel['unnep']!r}"
            )
    if elteres:
        print("  ELTÉRŐ SABLON-CSALÁD — az összevonás kötést dobna el:")
        for e in elteres:
            print("   ", e)
        print("  Futtasd: python tools/sablon_unnep_javitas.py")
        return 1

    for t in temak.values():
        t.pop("_v", None)
    meret["temak.json"] = ir(
        "temak.json",
        sorted(temak.values(), key=lambda t: (t["honap"] or 99, t["sorrend"] or 99, t["cim"])),
    )

    # --- Ötletek korcsoportonként --------------------------------------------
    for kor in KOROK:
        bank = olvas(f"otletek-bank-{kor}.json")["temak"]
        # csak a hét ismert területet visszük, rögzített sorrendben
        tisztitott = {
            tema: {kulcs: ar[kulcs] for kulcs, _nev in TERULETEK if ar.get(kulcs)}
            for tema, ar in bank.items()
        }
        meret[f"otletek-{kor}.json"] = ir(f"otletek-{kor}.json", tisztitott)

    # --- Irodalomtár ----------------------------------------------------------
    lit = olvas("literature.json")["tetelek"]
    meret["irodalom.json"] = ir(
        "irodalom.json",
        [
            {
                "tipus": x["tipus"],
                "cim": x["cim"],
                **({"szerzo": x["szerzo"]} if x.get("szerzo") else {}),
                **({"korcsoport": x["korcsoport"]} if x.get("korcsoport") else {}),
                **({"temak": x["temak"]} if x.get("temak") else {}),
                **({"szoveg": x["szoveg"]} if x.get("szoveg") else {}),
            }
            for x in lit
        ],
    )

    # --- Ünnepek --------------------------------------------------------------
    unnepek = olvas("hungarian-holidays.json")
    lista = unnepek if isinstance(unnepek, list) else next(
        (v for v in unnepek.values() if isinstance(v, list)), []
    )
    meret["unnepek.json"] = ir("unnepek.json", lista)

    # --- Területnevek a felülethez -------------------------------------------
    meret["teruletek.json"] = ir(
        "teruletek.json", [{"id": i, "nev": n} for i, n in TERULETEK]
    )

    ossz = sum(meret.values())
    for nev, m in meret.items():
        print(f"  {m / 1024:7.0f} KB  {nev}")
    print(f"  {ossz / 1024:7.0f} KB  ÖSSZESEN → {KIMENET.relative_to(GYOKER)}")
    print(f"\n  témák: {len(temak)} · irodalom: {len(lit)} · ünnep: {len(lista)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
