# -*- coding: utf-8 -*-
"""
Duplikátumok megszüntetése a korpuszban: a névtelen ikertétel szerzőt kap.

MI A HELYZET. Ugyanaz a mű kétszer szerepelt az Irodalom menüben: egyszer
szerzővel („A brémai muzsikusok — Jakob és Wilhelm Grimm"), egyszer névtelen
népmeseként. A felhasználó döntése: maradjon a SZERZŐS alak.

MIÉRT ITT KELL JAVÍTANI. Az `irodalom_beepites.py` a szerző+cím párosból képez
kulcsot, és csak azt adja hozzá az irodalomtárhoz, ami még nincs benne. Ha a
korpuszban marad a névtelen alak, a következő generálás visszateszi. A típust is
igazítjuk: a Grimm- és Benedek Elek-mesék nem népmeseként, hanem meseként
szerepelnek — így a heti tervekben is a helyes műfaj-címke jelenik meg.

Két tétel egyszerűen törlődik, mert NINCS ilyen mű:
  - „Petőfi Sándor: Tavasz" — Petőfinek nincs ilyen verse (az „Itt van az ősz,
    itt van újra" a hasonló kezdetű);
  - „Móra Ferenc: Mit ír a fecske?" — Mórának nincs ilyen verse (van
    „Fecskehívogató" és „A fecskék").

Futtatás: python tools/korpusz_duplikatum_javitas.py [--dry-run]
"""

from __future__ import annotations

import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

KORPUSZ = Path(__file__).resolve().parent / "korpusz"

# (fájl, régi sorrészlet) -> új sorrészlet. A sor többi része (korosztály,
# megjegyzés) érintetlen marad, ezért csak a tuple elejét cseréljük.
CSERE: list[tuple[str, str, str]] = [
    # A brémai muzsikusok — Grimm-mese, nem magyar népmese
    ("osz.py", '("nepmese", None, "A brémai muzsikusok"', '("mese", "Jakob és Wilhelm Grimm", "A brémai muzsikusok"'),
    # A nyulacska harangocskája — Benedek Elek átirata
    ("kiegeszites.py", '("nepmese", None, "A nyulacska harangocskája"', '("mese", "Benedek Elek", "A nyulacska harangocskája"'),
    ("tavasz.py", '("nepmese", None, "A nyulacska harangocskája"', '("mese", "Benedek Elek", "A nyulacska harangocskája"'),
    # Holle anyó — Grimm
    ("tappancs.py", '("nepmese", None, "Holle anyó"', '("mese", "Jakob és Wilhelm Grimm", "Holle anyó"'),
    # Jancsi és Juliska — Grimm
    ("tel.py", '("nepmese", None, "Jancsi és Juliska"', '("mese", "Jakob és Wilhelm Grimm", "Jancsi és Juliska"'),
    # Szóló szőlő… — Benedek Elek
    ("tappancs.py", '("nepmese", None, "Szóló szőlő, mosolygó alma, csengő barack"', '("mese", "Benedek Elek", "Szóló szőlő, mosolygó alma, csengő barack"'),
    # Télapó itt van — Donászy Magda megzenésített verse
    ("tappancs.py", '("dal", None, "Télapó itt van"', '("dal", "Donászy Magda", "Télapó itt van"'),
    # Itt a farsang, áll a bál — Gazdag Erzsi verse, énekelve is
    ("tappancs.py", '("dal", None, "Itt a farsang, áll a bál"', '("dal", "Gazdag Erzsi", "Itt a farsang, áll a bál"'),
    # A suszter manói — egységes szerzőnév
    ("tappancs.py", '("mese", "Grimm testvérek", "A suszter manói"', '("mese", "Jakob és Wilhelm Grimm", "A suszter manói"'),
]

# Teljes sorok, amelyek törlődnek (nem létező művek).
TORLENDO: list[tuple[str, str]] = [
    ("tavasz.py", '("vers", "Petőfi Sándor", "Tavasz", "23", ""),'),
    ("tavasz.py", '("vers", "Móra Ferenc", "Mit ír a fecske?", "123", "a nap klasszikus verse"),'),
]


def main() -> int:
    dry = "--dry-run" in sys.argv
    valtozas = 0

    for fajl, regi, uj in CSERE:
        ut = KORPUSZ / fajl
        szoveg = ut.read_text(encoding="utf-8")
        db = szoveg.count(regi)
        if db == 0:
            print(f"  (már rendben) {fajl}: {regi[:52]}…")
            continue
        szoveg = szoveg.replace(regi, uj)
        valtozas += db
        print(f"  {db}x {fajl}: {regi[:46]}…")
        print(f"        -> {uj[:64]}…")
        if not dry:
            ut.write_text(szoveg, encoding="utf-8")

    for fajl, sor in TORLENDO:
        ut = KORPUSZ / fajl
        szoveg = ut.read_text(encoding="utf-8")
        talalt = [s for s in szoveg.split("\n") if s.strip() == sor]
        if not talalt:
            print(f"  (már nincs meg) {fajl}: {sor[:52]}…")
            continue
        sorok = [s for s in szoveg.split("\n") if s.strip() != sor]
        valtozas += len(talalt)
        print(f"  TÖRLÉS {len(talalt)}x {fajl}: {sor[:60]}…")
        if not dry:
            ut.write_text("\n".join(sorok), encoding="utf-8")

    print(f"\n  {valtozas} korpusz-sor érintve" + ("  (dry-run)" if dry else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
