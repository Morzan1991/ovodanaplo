# -*- coding: utf-8 -*-
"""
A szó szerint átvett játékleírások cseréje saját megfogalmazásra.

MIÉRT: a játékok leírása a „Tappancs" kiadványból került az ötletbankba, szó
szerint, a tördelési hibákkal együtt. A szerzői jog a megfogalmazást védi, nem
magát a játékot: a népi és óvodai játékok szabálya közkincs, de egy konkrét
leírás a szerzőé. Ez a szkript ugyanazokat a játékokat hagyja a programban, csak
a saját szövegünkkel (lásd `tools/jatek_leirasok.py`).

Amit tesz:
  - a négy `seed/otletek-bank-*.json` fájlban és a `seed/weekly-templates.json`
    sablonjaiban megkeresi azokat a sorokat, amelyek a kiadványból származó
    leírást tartalmaznak (a `tools/tappancs-jatekok.json` alapján),
  - a játék NEVÉT meghagyja, a gondolatjel utáni leírást lecseréli,
  - a lapfejlécekből lett álkategóriákat („FÖLD NAPJA — ÁPRILIS 22. …") törli.

Futtatás: python tools/jatek_ujrairas.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from jatek_leirasok import JAVITAS, TOROLENDO, UJ_LEIRAS  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent.parent
SEED = GYOKER / "seed"
KOROK = ("kicsi", "kozepso", "nagy", "vegyes")
GONDOLATJEL = " — "


def kulcs(nev: str) -> str:
    """A név ékezet nélküli, kisbetűs alakja — ez köti össze a saját leírással."""
    bontott = unicodedata.normalize("NFKD", nev)
    tiszta = "".join(c for c in bontott if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "_", tiszta.lower()).strip("_")


def kiadvanyi_leirasok() -> set[str]:
    """A kiadványból kinyert leírások eleje — ezekről ismerjük fel az érintett sorokat."""
    adat = json.loads((GYOKER / "tools" / "tappancs-jatekok.json").read_text(encoding="utf-8"))
    minta = set()
    for lap in adat:
        for jatek in lap.get("jatekok", []):
            leiras = re.sub(r"\s+", " ", (jatek.get("leiras") or "")).strip()
            if len(leiras) > 40:
                minta.add(leiras.lower()[:40])
    return minta


def uj_sor(sor: str) -> str | None:
    """A sor új alakja, vagy None, ha törölni kell. Változatlan sornál önmaga."""
    nev = sor.split(GONDOLATJEL)[0].strip() if GONDOLATJEL in sor else sor.strip()

    # Elrontott kinyerés: összeolvadt vagy félbevágott név.
    if nev in JAVITAS:
        javitott = JAVITAS[nev]
        if javitott is None:
            return None
        nev = javitott

    k = kulcs(nev)
    if k in TOROLENDO:
        return None
    uj = UJ_LEIRAS.get(k)
    if uj is None:
        return sor if GONDOLATJEL in sor else nev
    return f"{nev}{GONDOLATJEL}{uj}"


def korpuszt_atir(dry: bool) -> int:
    """
    Az anyanyelvi játékok leírása a KORPUSZBAN is szó szerinti volt.

    Ez fontosabb, mint a seed: a sablonok irodalmi szekcióját az
    `irodalom_beepites.py` a korpuszból generálja újra, tehát ha itt marad a
    kiadvány szövege, a következő generálás visszaírná a seedbe.
    """
    minta = re.compile(
        r'\("anyanyelvi",\s*(None|"[^"]*"),\s*"([^"]+)",\s*"([0-9]+)",\s*"([^"]*)"\)'
    )
    valtozas = 0
    for ut in sorted((GYOKER / "tools" / "korpusz").glob("*.py")):
        szoveg = ut.read_text(encoding="utf-8")

        def csere(m: re.Match[str]) -> str:
            nonlocal valtozas
            szerzo, nev, korok, megj = m.groups()
            uj = UJ_LEIRAS.get(kulcs(nev))
            if uj is None or uj == megj:
                return m.group(0)
            valtozas += 1
            return f'("anyanyelvi", {szerzo}, "{nev}", "{korok}", "{uj}")'

        ujSzoveg = minta.sub(csere, szoveg)
        if ujSzoveg != szoveg and not dry:
            ut.write_text(ujSzoveg, encoding="utf-8")
    print(f"  korpusz: {valtozas} anyanyelvi játék leírása átírva")
    return valtozas


def main() -> int:
    dry = "--dry-run" in sys.argv
    korpuszt_atir(dry)
    minta = kiadvanyi_leirasok()
    norm = lambda s: re.sub(r"\s+", " ", s).lower()  # noqa: E731
    erintett = lambda s: any(m in norm(s) for m in minta)  # noqa: E731

    csere = torles = valtozatlan = 0

    def lista_atir(lista: list[str]) -> list[str]:
        nonlocal csere, torles, valtozatlan
        ki: list[str] = []
        for s in lista:
            # Az érintett sorokon kívül azokat is átnézzük, amelyeknek NINCS
            # leírásuk: ha van hozzájuk sajátunk, most kapják meg. Így a
            # névtöredékből lett sorok is rendbe jönnek.
            nev = s.split(GONDOLATJEL)[0].strip() if GONDOLATJEL in s else s.strip()
            potolhato = GONDOLATJEL not in s and (kulcs(nev) in UJ_LEIRAS or nev in JAVITAS)
            if not erintett(s) and not potolhato:
                ki.append(s)
                continue
            uj = uj_sor(s)
            if uj is None:
                torles += 1
            elif uj == s:
                valtozatlan += 1
                ki.append(s)
            else:
                csere += 1
                ki.append(uj)

        # Az átírás után két eltérően megfogalmazott sor ugyanazzá válhat
        # („Szalaggyakorlat Lufidobálás" és „Lufidobálás"), ezért a listán belül
        # kiszedjük az ismétlődést. Az első előfordulás marad.
        latott: set[str] = set()
        egyedi: list[str] = []
        for s in ki:
            k = re.sub(r"[^0-9a-zà-ÿőű ]+", " ", s.lower())
            k = re.sub(r"\s+", " ", k).strip()
            if k in latott:
                continue
            latott.add(k)
            egyedi.append(s)
        return egyedi

    for kor in KOROK:
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        for teruletek in adat["temak"].values():
            for terulet, lista in teruletek.items():
                if isinstance(lista, list):
                    teruletek[terulet] = lista_atir(lista)
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  otletek-bank-{kor} kész")

    ut = SEED / "weekly-templates.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))
    for sablon in adat["sablonok"]:
        for terulet, szoveg in sablon["teruletek"].items():
            if not szoveg:
                continue
            sorok = szoveg.split("\n")
            ujak = lista_atir(sorok)
            if ujak != sorok:
                sablon["teruletek"][terulet] = "\n".join(ujak)
    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("  weekly-templates kész")

    print(f"\n  átírva: {csere} · törölve: {torles} · saját leírás nélkül maradt: {valtozatlan}")
    if dry:
        print("  (dry-run — semmi nem íródott ki)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
