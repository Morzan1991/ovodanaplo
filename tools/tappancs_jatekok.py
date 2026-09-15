# -*- coding: utf-8 -*-
"""
A „Tappancs” kiadvány JÁTÉKLEÍRÁSAINAK kinyerése.

A hetek jobb oldalának alján, a táblázat alatt a kiadvány külön felsorolja a hét
játékait a szabályukkal együtt:

    Postásjáték – A gyermekek egy sorban ülnek. A pedagógus súg az első gyermek
    fülébe egy szót, majd ő tovább súgja…
    Párfoglaló (fogójáték) – Párok futnak, a fogó egyedül van…

Ezek a táblázatban csak névvel szerepelnek, a szabályuk viszont itt van — ezért
érdemes a névhez csatolni.

A szakasz nem a sorhatárokból, hanem a saját alakjából ismerhető fel: „Név –
leírás”, utána a tördelt folytatás. Így nem függ attól, hol ér véget a táblázat.

Kimenet: tools/tappancs-jatekok.json
Futtatás: python tools/tappancs_jatekok.py "<pdf útvonala>"
"""

from __future__ import annotations

import json
import re
import sys
import warnings
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from pypdf import PdfReader  # noqa: E402
from tappancs_teljes import sorok  # noqa: E402

warnings.filterwarnings("ignore")

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

KIMENET = Path(__file__).resolve().parent / "tappancs-jatekok.json"

# „Játék neve (fajta) – leírás” — a gondolatjel a névtől elválasztva.
JATEK_RE = re.compile(r"^([A-ZÁÉÍÓÖŐÚÜŰ][^–]{2,45}?)\s+–\s+(.+)$")
# Forráshivatkozás, nem játék („… – Óvodapedagógusok enciklopédiája (20. o.)”).
FORRAS_RE = re.compile(r"(enciklopédi|kiadó|\d+\.\s*o\.|szerk\.|Nagycsoport\s*:)", re.I)


def jatekokEgyLapon(page) -> list[tuple[str, str]]:
    """A lap jobb oldalán található játékleírások (név, leírás) párokban."""
    sorLista = sorok(page, 688, 1200, ymax=10_000)
    talalatok: list[list[str]] = []
    for _y, t in sorLista:
        m = JATEK_RE.match(t)
        if m and not FORRAS_RE.search(t):
            talalatok.append([t])
        elif talalatok and not JATEK_RE.match(t):
            # tördelt folytatás — csak ha már elkezdődött a szakasz
            talalatok[-1].append(t)

    eredmeny: list[tuple[str, str]] = []
    for darabok in talalatok:
        egyben = " ".join(darabok)
        egyben = re.sub(r"\s+", " ", egyben).strip()
        m = JATEK_RE.match(egyben)
        if not m:
            continue
        nev = m.group(1).strip(" .,")
        leiras = m.group(2).strip()
        # a folytatás néha átcsúszik a következő oldal fejlécébe — levágjuk
        leiras = re.split(r"\s+(?=[A-ZÁÉÍÓÖŐÚÜŰ]{6,}\s)", leiras)[0].strip(" .")
        if len(leiras) >= 10:
            eredmeny.append((nev, leiras))
    return eredmeny


def main() -> int:
    if len(sys.argv) < 2:
        print("Használat: python tools/tappancs_jatekok.py <pdf>")
        return 2
    reader = PdfReader(sys.argv[1])

    hetek = []
    for lapIndex, page in enumerate(reader.pages):
        fejlec = [t for _y, t in sorok(page, 0, 1300, ymax=10_000) if _y > 740]
        honapSor = next((t for t in fejlec if re.search(r"H\s*É\s*T", t)), None)
        if not honapSor:
            continue
        m = re.search(r"([A-ZÁÉÍÓÖŐÚÜŰ]+)\s*,?\s*(\d+)\.?\s*H\s*É\s*T", honapSor)
        honap, hetSzam = (m.group(1), int(m.group(2))) if m else ("?", 0)
        jatekok = jatekokEgyLapon(page)
        hetek.append(
            {
                "lap": lapIndex + 1,
                "honap": honap,
                "het": hetSzam,
                "jatekok": [{"nev": n, "leiras": l} for n, l in jatekok],
            }
        )

    KIMENET.write_text(json.dumps(hetek, ensure_ascii=False, indent=1), encoding="utf-8")
    ossz = sum(len(h["jatekok"]) for h in hetek)
    print(f"{len(hetek)} hét, {ossz} játékleírás → {KIMENET.name}")
    ures = [h["het"] for h in hetek if not h["jatekok"]]
    if ures:
        print(f"  játék nélküli hetek: {len(ures)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
