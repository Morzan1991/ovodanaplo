# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadvány NEM irodalmi anyagának beépítése az ötletbankba.

Az irodalmat (vers, mese, dal) a korpusz kezeli. Itt a másik négy terület
tartalma kerül át korcsoportonként — külső világ, matematika, rajzolás-festés,
mozgás —, valamint az ének-hasáb hallás-ritmus feladatai.

A kiadvány cellái összefüggő szövegek; ezeket mondatokra bontjuk, mert az
ötletbank soronként egy javaslatot vár. Csak az kerül be, ami még nincs benne
(ékezet- és központozás-független összehasonlítással).

Bemenet : tools/tappancs-teljes.json (a `tappancs_teljes.py` kimenete)
Futtatás: python tools/tappancs_otletek.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tappancs_korpusz import TEMA_TERKEP  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent
SEED = GYOKER.parent / "seed"
BEMENET = GYOKER / "tappancs-teljes.json"

# Ezeket a hasábokat vesszük át; az irodalmat a korpusz adja.
ATVETT = ["kulso_vilag", "matematika", "rajzolas_festes", "mozgas"]
# Az ének-hasábból csak a hallás-ritmus feladatok kellenek.
RITMUS_RE = re.compile(
    r"(egyenletes lüktetés|ritmus|hallás|hangjának felismerése|halk|hangszín|"
    r"magas.*mély|gyors.*lassú|dallam|hangerő|hangutánz)", re.I
)

KOROK = ["kicsi", "kozepso", "nagy"]


def mondatokra(cellaSzoveg: str) -> list[str]:
    """
    A cella szövegét önálló javaslatokra bontja.

    A sortörés a kiadványban tördelés, nem tagolás: a kisbetűvel folytatódó
    sorokat visszafűzzük az előzőhöz, majd mondatokra vágunk.
    """
    if not cellaSzoveg.strip():
        return []
    sorok = [s.strip() for s in cellaSzoveg.split("\n") if s.strip()]
    bekezdesek: list[str] = []
    for s in sorok:
        if bekezdesek and (s[:1].islower() or bekezdesek[-1].rstrip()[-1:] not in ".!?)"):
            bekezdesek[-1] = bekezdesek[-1].rstrip() + " " + s
        else:
            bekezdesek.append(s)

    javaslatok: list[str] = []
    for b in bekezdesek:
        # mondathatár: pont + szóköz + nagybetű (a rövidítéseket nem bontjuk)
        for mondat in re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÖŐÚÜŰ])", b):
            m = re.sub(r"\s+", " ", mondat).strip().rstrip(" .")
            if len(m) >= 8:
                javaslatok.append(m)
    return javaslatok


def kulcs(sor: str) -> str:
    """Összehasonlító alak: kis-nagybetű és központozás nélkül."""
    s = sor.lower()
    s = re.sub(r"[^\wáéíóöőúüű ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main() -> int:
    dry = "--dry-run" in sys.argv
    hetek = json.loads(BEMENET.read_text(encoding="utf-8"))

    # (tema, kor, terulet) -> javaslatok
    uj: dict[tuple[str, str, str], list[str]] = {}
    for h in hetek:
        temak = TEMA_TERKEP.get((h["honap"], h["het"]))
        if not temak:
            continue
        tartalom = h["blokkok"]["tartalom"]
        for kor in KOROK:
            cella = tartalom[kor]
            for terulet in ATVETT:
                for j in mondatokra(cella.get(terulet, "")):
                    for tema in temak:
                        uj.setdefault((tema, kor, terulet), []).append(j)
            # az ének-hasábból a hallás-ritmus feladatok
            for j in mondatokra(cella.get("enek_zene", "")):
                if RITMUS_RE.search(j):
                    for tema in temak:
                        uj.setdefault((tema, kor, "hallas_ritmus"), []).append(j)

    hozzaadva = 0
    kihagyva = 0
    for kor in KOROK + ["vegyes"]:
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        for (tema, forrasKor, terulet), javaslatok in uj.items():
            # a vegyes bank mindhárom korcsoport anyagát megkapja
            if kor != "vegyes" and forrasKor != kor:
                continue
            if tema not in adat["temak"]:
                continue
            lista = adat["temak"][tema].setdefault(terulet, [])
            meglevo = {kulcs(x) for x in lista}
            for j in javaslatok:
                k = kulcs(j)
                if k in meglevo:
                    kihagyva += 1
                    continue
                meglevo.add(k)
                lista.append(j)
                hozzaadva += 1
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  otletek-bank-{kor} kész")

    print(f"\nÚj javaslat: {hozzaadva} · ismétlés miatt kihagyva: {kihagyva}"
          + ("   (dry-run)" if dry else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
