# -*- coding: utf-8 -*-
"""
Irodalmi hivatkozások ellenőrzése a heti terv sablonokban.

Két hibatípust keres:

  A) MŰFAJ-TÉVESZTÉS — a mű nem oda való szekcióban szerepel.
     Pl. a "Lipem-lopom a szőlőt" DAL, mégis a "Mondókák és versek" alatt állt.

  B) TÉMA-ELTÉRÉS — a mű témái nem érintkeznek a sablon témájával.
     Pl. a szüreti "Lipem-lopom a szőlőt" a Madarak és Fák Napja sablonban.

A műfajt és a témákat a `seed/literature.json` adja (383 mű), a sablonokat a
`seed/weekly-templates.json`. Csak jelez — nem módosít.

Futtatás:  python tools/irodalom_ellenorzes.py
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

# Melyik szekcióba milyen műfaj való.
MESE_MUFAJOK = {"mese", "nepmese", "nepmonda", "regeny", "verseskotet"}
VERS_MUFAJOK = {"vers", "mondoka", "talalos_kerdes", "altato"}
ENEK_MUFAJOK = {"dal", "koreplay", "zenehallgatas"}

# Nem műcím, hanem szekció-fejléc vagy tevékenység-leírás.
FEJLEC = re.compile(
    r"^(mesék|mondókák és versek|versek|mondókák|dalok|énekek|"
    r"tornatermi tevékenységek|csoportban/udvaron.*|hallás.*fejlesztés.*)\s*:?\s*$",
    re.I,
)


def betolt():
    muvek = json.loads((SEED / "literature.json").read_text(encoding="utf-8"))["tetelek"]
    sablonok = json.loads((SEED / "weekly-templates.json").read_text(encoding="utf-8"))["sablonok"]
    return muvek, sablonok


def normalizal(szoveg: str) -> str:
    """Cím tisztítása: zárójeles megjegyzés, szerző, írásjelek nélkül."""
    s = re.sub(r"\([^)]*\)", " ", szoveg)          # (népi), (népdal) …
    s = re.sub(r"\s*[—–-]\s*[^—–-]+$", "", s)      # „Cím — Szerző"
    s = re.sub(r"^[^:]{3,40}:\s*", "", s)          # „Szerző: Cím"
    s = re.sub(r"[…\.\,;!\?\"'’„”]+", " ", s)
    return re.sub(r"\s+", " ", s).strip().lower()


def temakeszlet(x) -> set[str]:
    v = x.get("temak")
    if isinstance(v, list):
        return {t.strip().lower() for t in v if t.strip()}
    if isinstance(v, str):
        return {t.strip().lower() for t in v.split(",") if t.strip()}
    return set()


def sablon_kulcsszavak(s) -> set[str]:
    """A sablon témájából képzett kulcsszavak, a művek témáival való összevetéshez."""
    szoveg = " ".join([s.get("cim", ""), s.get("tema", ""), s.get("azonosito", "")]).lower()
    return {sz for sz in re.split(r"[^a-záéíóöőúüű]+", szoveg) if len(sz) > 4}


def main() -> int:
    muvek, sablonok = betolt()

    # cím -> mű (normalizált kulccsal)
    index: dict[str, dict] = {}
    for m in muvek:
        index.setdefault(normalizal(m["cim"]), m)

    mufaj_hibak: list[tuple] = []
    tema_hibak: list[tuple] = []
    ismeretlen: list[tuple] = []

    for s in sablonok:
        kulcsszavak = sablon_kulcsszavak(s)
        for terulet in ("verseles_meseles", "enek_zene"):
            szoveg = s["teruletek"].get(terulet) or ""
            szekcio = "mese" if terulet == "verseles_meseles" else "enek"
            for sor in szoveg.split("\n"):
                sor = sor.strip()
                if not sor:
                    continue
                if FEJLEC.match(sor):
                    # A verseles_meseles két részre bomlik.
                    if sor.lower().startswith("mondók") or sor.lower().startswith("versek"):
                        szekcio = "vers"
                    elif sor.lower().startswith("mesék"):
                        szekcio = "mese"
                    continue

                kulcs = normalizal(sor)
                if len(kulcs) < 4:
                    continue
                mu = index.get(kulcs)
                if mu is None:
                    # részleges egyezés (a sablon néha rövidít)
                    jeloltek = [v for k, v in index.items() if k and (k in kulcs or kulcs in k)]
                    mu = jeloltek[0] if len(jeloltek) == 1 else None
                if mu is None:
                    ismeretlen.append((s["azonosito"], terulet, sor))
                    continue

                elvart = {"mese": MESE_MUFAJOK, "vers": VERS_MUFAJOK, "enek": ENEK_MUFAJOK}[szekcio]
                if mu["tipus"] not in elvart:
                    mufaj_hibak.append((s["azonosito"], terulet, szekcio, sor, mu["tipus"], mu["cim"]))

                kozos = temakeszlet(mu) & kulcsszavak
                if not kozos and temakeszlet(mu):
                    tema_hibak.append(
                        (s["azonosito"], s.get("cim", ""), terulet, mu["cim"], sorted(temakeszlet(mu))[:5])
                    )

    print(f"Sablonok: {len(sablonok)} | Művek: {len(muvek)}\n")

    print(f"=== A) MŰFAJ-TÉVESZTÉS: {len(mufaj_hibak)} ===")
    for az, ter, szek, sor, tipus, cim in mufaj_hibak:
        hova = {"mese": "Mesék", "vers": "Mondókák és versek", "enek": "Ének-zene"}[szek]
        print(f"  {az:22} {hova:20} <- „{sor}”  (az adatbázisban: {tipus})")

    print(f"\n=== B) LEHETSÉGES TÉMA-ELTÉRÉS: {len(tema_hibak)} ===")
    for az, cim, ter, mucim, temak in tema_hibak[:60]:
        print(f"  {az:22} ({cim[:26]:26}) {ter[:9]:9} <- „{mucim}”  témái: {', '.join(temak)}")
    if len(tema_hibak) > 60:
        print(f"  … és további {len(tema_hibak) - 60}")

    print(f"\n=== C) AZ ADATBÁZISBAN NEM SZEREPLŐ HIVATKOZÁS: {len(ismeretlen)} ===")
    for az, ter, sor in ismeretlen[:40]:
        print(f"  {az:22} {ter[:9]:9} <- „{sor}”")
    if len(ismeretlen) > 40:
        print(f"  … és további {len(ismeretlen) - 40}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
