# -*- coding: utf-8 -*-
"""
Az irodalmi adatbázis műfaji hibáinak javítása.

Két hibacsoportot rendez:

  1. DUPLIKÁTUMOK — ugyanaz a mű kétszer, gyakran ELTÉRŐ műfajjal
     (pl. „Boci, boci tarka” egyszer dalként, egyszer versként). Emiatt a
     kereső hol az egyiket, hol a másikat kínálta, és a sablon-ellenőrzés
     is hol jónak, hol rossznak látta ugyanazt a hivatkozást.

  2. MŰFAJ-TÉVESZTÉS — jól ismert művek rossz besorolással
     (pl. a „Mátyás király és az igazmondó juhász” népmonda, nem vers).

A program a meglévő adatbázisokban is átvezeti ezeket: a seed-szinkron a
cím+szerző kulcs alapján frissíti a műfajt, és törli a JSON-ból kivett tételeket.

Futtatás:  python tools/irodalom_javitas.py [--dry-run]
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

P = Path(__file__).resolve().parent.parent / "seed" / "literature.json"

# --- 1. Kivezetendő duplikátumok: (cím, műfaj) -> melyik marad -----------------
# A megtartott példány műfaja a pedagógiailag pontosabb.
TORLENDO = [
    ("Boci, boci, tarka", "vers"),       # marad: „Boci, boci tarka” (dal)
    ("Hull a pelyhes", "vers"),          # marad: „Hull a pelyhes fehér hó” (dal)
    ("Bújj, bújj zöld ág", "dal"),       # marad: „Bújj, bújj, zöld ág” (körjáték)
    ("Hinta-palinta", "mondoka"),        # marad: „Hinta, palinta”
    ("Süsü a sárkány", "regeny"),        # marad: „Süsü, a sárkány” (mese)
    ("Süss fel, nap", "mondoka"),        # marad: „Süss fel nap” — dalra javítva
]

# --- 2. Műfaj-javítások: cím -> új műfaj + indoklás ----------------------------
MUFAJ_JAVITAS = {
    "Süss fel nap": ("dal", "Énekes népi mondóka — az óvodában éneklik, az ének-zene anyaga."),
    "Esik az eső": ("dal", "„Esik az eső, hajlik a vessző” — énekelt népi dallam."),
    "Mátyás király és az igazmondó juhász": (
        "nepmonda",
        "Mátyás-mondakör, a forrás is népmondát jelöl — nem vers.",
    ),
    "Csip-csip csóka": (
        "mondoka",
        "Ölbeli ujj-játék mondóka (a témái között is szerepel az ujj_jatek), nem dal.",
    ),
}

# A megmaradó példányokra átörökítendő témák (a törölt duplikátumból).
TEMA_OROKLES = {
    "Süss fel nap": ["idojaras", "nap", "tavasz"],
    "Hinta, palinta": ["hintazas", "mozgas", "jatek"],
}


def main() -> int:
    dry = "--dry-run" in sys.argv
    adat = json.loads(P.read_text(encoding="utf-8"))
    tetelek = adat["tetelek"]
    elotte = len(tetelek)

    # 1. duplikátumok törlése
    torolve = []
    maradok = []
    for x in tetelek:
        if (x["cim"], x["tipus"]) in TORLENDO:
            torolve.append(f"{x['cim']} [{x['tipus']}]")
            continue
        maradok.append(x)

    # 2. műfaj-javítás
    javitva = []
    for x in maradok:
        if x["cim"] in MUFAJ_JAVITAS:
            uj, indok = MUFAJ_JAVITAS[x["cim"]]
            if x["tipus"] != uj:
                javitva.append(f"{x['cim']}: {x['tipus']} → {uj}  ({indok})")
                x["tipus"] = uj
        if x["cim"] in TEMA_OROKLES:
            meglevo = x.get("temak") or []
            if isinstance(meglevo, str):
                meglevo = [t.strip() for t in meglevo.split(",") if t.strip()]
            x["temak"] = sorted(set(meglevo) | set(TEMA_OROKLES[x["cim"]]))

    adat["tetelek"] = maradok
    adat["_verzio"] = "1.2"
    adat["_utolso_frissites"] = "2026-09-06"

    print(f"TÖRÖLT DUPLIKÁTUM ({len(torolve)}):")
    for x in torolve:
        print(f"   {x}")
    print(f"\nMŰFAJ-JAVÍTÁS ({len(javitva)}):")
    for x in javitva:
        print(f"   {x}")
    print(f"\nMűvek: {elotte} → {len(maradok)}")

    if not dry:
        P.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("\nMENTVE.")
    else:
        print("\n(dry-run — nem írtunk fájlt)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
