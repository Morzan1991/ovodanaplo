# -*- coding: utf-8 -*-
"""
A sablonok irodalmi hivatkozásainak helyre tétele műfaj szerint.

Mit rendez:
  • DAL vagy KÖRJÁTÉK a „Mondókák és versek” alatt  →  átkerül az Ének-zenéhez.
    (Ez volt a bejelentett hiba: a „Lipem-lopom a szőlőt” dal, mégis a versek
    között szerepelt.)
  • VERS / MESE / REGÉNY az Ének-zene alatt  →  átkerül a Verselés-meséléshez,
    a megfelelő alrészbe.
  • VERS vagy MONDÓKA a „Mesék:” alatt  →  a „Mondókák és versek” alá.
  • MESE / NÉPMESE / REGÉNY a „Mondókák és versek” alatt  →  a „Mesék:” alá.

Amit szándékosan NEM mozgat:
  • Zenehallgatás-sorok („Hallgatásra:”, „Zh.:”, „megzenésített”, „feldolgozás”) —
    ezek megzenésített versek, jó helyen vannak az ének-zenében.
  • Népi MONDÓKA az ének-zenében — az ONAP szerint az „Ének, zene, népi játék,
    tánc” terület anyaga a népi mondóka is, ez pedagógiailag helyes.
  • Az adatbázisban nem szereplő hivatkozásokat (nem tudjuk a műfajukat).

Futtatás:  python tools/sablon_irodalom_rendezes.py [--dry-run]
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

MESE_MUFAJ = {"mese", "nepmese", "nepmonda", "regeny", "verseskotet"}
VERS_MUFAJ = {"vers", "mondoka", "talalos_kerdes", "altato"}
ENEK_MUFAJ = {"dal", "koreplay", "zenehallgatas"}

# Ének-zenében maradhat akkor is, ha a mű maga vers: megzenésített / hallgatásra szánt.
ZENEHALLGATAS = re.compile(
    r"hallgatásra|^zh\.|megzenésített|feldolgozás|zenehallgatás|dallam|kaláka|halász judit",
    re.I,
)

# „Szerző: Cím” alakban a cím elé írt szerep-megjelölések, nem valódi szerzők.
NEM_SZERZO = re.compile(r"^(népi|népdal|mondókák és versek|mesék|versek|zh|hallgatásra|körjáték)", re.I)


def normalizal(szoveg: str) -> str:
    s = re.sub(r"\([^)]*\)", " ", szoveg)
    s = re.sub(r"\s*[—–]\s*[^—–]+$", "", s)
    s = re.sub(r"^(?:népi(?: mondóka)?|mondókák és versek|mesék)\s*:\s*", "", s, flags=re.I)
    s = re.sub(r"^[^:]{3,40}:\s*", "", s)
    s = re.sub(r"[…\.\,;!\?\"'’„”]+", " ", s)
    return re.sub(r"\s+", " ", s).strip().lower()


def main() -> int:
    dry = "--dry-run" in sys.argv
    muvek = json.loads((SEED / "literature.json").read_text(encoding="utf-8"))["tetelek"]
    fajl = SEED / "weekly-templates.json"
    adat = json.loads(fajl.read_text(encoding="utf-8"))

    index: dict[str, dict] = {}
    for m in muvek:
        index.setdefault(normalizal(m["cim"]), m)

    def szerzo_es_cim(sor: str) -> tuple[str | None, str]:
        """A sorból kiszedi a szerzőt (ha meg van adva) és a címet."""
        m = re.match(r"^([^:]{3,32}):\s*(.+)$", sor)
        if m and not NEM_SZERZO.match(m.group(1).strip()):
            return m.group(1).strip(), m.group(2).strip()
        m2 = re.match(r"^(.+?)\s+[—–]\s+([^—–]{3,32})$", sor)
        if m2 and not NEM_SZERZO.match(m2.group(2).strip()):
            return m2.group(2).strip(), m2.group(1).strip()
        return None, sor

    # Ha a sablon maga jelöli, hogy dalról van szó, azt elfogadjuk — több mű
    # létezik azonos címmel versként és dalként is.
    DAL_JELOLES = re.compile(r"\((?:nép)?dal|gyermekdal|énekes játék|körjáték", re.I)

    def mufaj(sor: str) -> str | None:
        """A hivatkozott mű műfaja — a szerzőt is figyelembe véve.

        Enélkül a „Gazdag Erzsi: Erdő, erdő” (vers) ráillett volna az azonos
        kezdetű „Erdő, erdő, de magas vagy” népdalra, és tévesen került volna
        át az ének-zenéhez.
        """
        szerzo, cim = szerzo_es_cim(sor)
        kulcs = normalizal(cim)
        if len(kulcs) < 4:
            return None

        def szerzo_egyezik(mu: dict) -> bool:
            if szerzo is None:
                return True
            musz = (mu.get("szerzo") or "").lower()
            if not musz:
                return False  # a sor szerzőt nevez meg, a találat népi → nem ugyanaz
            vezetek = szerzo.lower().split()[-1]
            return vezetek in musz or musz.split()[-1] in szerzo.lower()

        mu = index.get(kulcs)
        if mu is not None and szerzo_egyezik(mu):
            return mu["tipus"]
        jelolt = [
            v for k, v in index.items()
            if k and (k in kulcs or kulcs in k) and szerzo_egyezik(v)
        ]
        return jelolt[0]["tipus"] if len(jelolt) == 1 else None

    valtozasok: list[str] = []

    for s in adat["sablonok"]:
        ter = s["teruletek"]
        vm = (ter.get("verseles_meseles") or "").split("\n")
        ez = [x for x in (ter.get("enek_zene") or "").split("\n") if x.strip()]

        mesek: list[str] = []
        versek: list[str] = []
        elotte: list[str] = []
        hova = "elotte"
        for sor in vm:
            t = sor.strip()
            if not t:
                continue
            if re.match(r"^mes[ée]k\s*:$", t, re.I):
                hova = "mese"
                continue
            if re.match(r"^mond[óo]k[áa]k\s+[ée]s\s+versek\s*:$", t, re.I):
                hova = "vers"
                continue
            # Néhány sablonban a fejléc és a mű EGY sorban van
            # („Mondókák és versek: Sarkadi Sándor: Télkergetők”) — a fejlécet
            # levágjuk, és a sort a megfelelő alrészbe tesszük.
            beagyazott = re.match(
                r"^(mes[ée]k|mond[óo]k[áa]k\s+[ée]s\s+versek)\s*:\s*(.+)$", t, re.I
            )
            if beagyazott:
                hova = "mese" if beagyazott.group(1).lower().startswith("mes") else "vers"
                t = beagyazott.group(2).strip()
            {"elotte": elotte, "mese": mesek, "vers": versek}[hova].append(t)

        uj_enek = list(ez)
        # 1. Verselés-mesélésből ének-zenébe: dal / körjáték
        for lista, nev in ((mesek, "Mesék"), (versek, "Mondókák és versek")):
            for sor in list(lista):
                m = mufaj(sor)
                if m in {"dal", "koreplay"} or DAL_JELOLES.search(sor):
                    m = m or "dal"
                    lista.remove(sor)
                    if not any(normalizal(sor) == normalizal(x) for x in uj_enek):
                        uj_enek.append(sor)
                    valtozasok.append(f"{s['azonosito']:22} {nev} → Ének-zene: „{sor}” ({m})")

        # 2. Mesék ↔ Mondókák és versek csere
        for sor in list(mesek):
            if mufaj(sor) in VERS_MUFAJ:
                mesek.remove(sor)
                versek.append(sor)
                valtozasok.append(f"{s['azonosito']:22} Mesék → versek: „{sor}”")
        for sor in list(versek):
            if mufaj(sor) in MESE_MUFAJ:
                versek.remove(sor)
                mesek.append(sor)
                valtozasok.append(f"{s['azonosito']:22} versek → Mesék: „{sor}”")

        # 3. Ének-zenéből vissza CSAK a mesét/regényt hozzuk el.
        #
        # A verseket szándékosan NEM mozgatjuk ki innen: rengeteg gyermekvers
        # megzenésítve él az óvodai gyakorlatban (Weöres: Bóbita, Tamkó Sirató:
        # Ha én cica volnék, Megy a vonat), ezért az ének-zenében is a helyükön
        # vannak. Mesét vagy regényt viszont nem énekelünk.
        for sor in list(uj_enek):
            if ZENEHALLGATAS.search(sor):
                continue
            if mufaj(sor) in MESE_MUFAJ:
                uj_enek.remove(sor)
                mesek.append(sor)
                valtozasok.append(f"{s['azonosito']:22} Ének-zene → Mesék: „{sor}”")

        # újraépítés
        uj_vm: list[str] = list(elotte)
        if mesek:
            uj_vm.append("Mesék:")
            uj_vm.extend(mesek)
        if versek:
            uj_vm.append("Mondókák és versek:")
            uj_vm.extend(versek)
        ter["verseles_meseles"] = "\n".join(uj_vm)
        ter["enek_zene"] = "\n".join(uj_enek)

    print(f"ÁTHELYEZÉS ({len(valtozasok)}):")
    for v in valtozasok:
        print(f"   {v}")

    if not dry:
        adat["_utolso_frissites"] = "2026-09-06"
        fajl.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("\nMENTVE.")
    else:
        print("\n(dry-run)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
