# -*- coding: utf-8 -*-
"""
Az ötletbank nem irodalmi sorainak cseréje saját megfogalmazásra.

MIÉRT: lásd `tools/otlet_szovegek.py`. A külső világ, a matematika, a
rajzolás-festés, a hallás-ritmus és a mozgás javaslatai szó szerint a
„Tappancs" kiadványból kerültek be. A tevékenység gondolata szabadon átvehető, a
megfogalmazás nem.

Hol cserél: mind a négy `seed/otletek-bank-*.json` fájlban, továbbá a
`seed/weekly-templates.json` területi szövegeiben — ugyanaz a sor mindkét helyen
előfordulhat.

Futtatás: python tools/otlet_ujrairas.py [--dry-run]
"""

from __future__ import annotations

import glob
import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from otlet_szovegek import UJ_OTLET  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent.parent
SEED = GYOKER / "seed"


def ujjlenyomat(sor: str) -> str:
    """A régi sor kulcsa: szóköz-normalizált, kisbetűs alak ujjlenyomata."""
    return hashlib.sha1(re.sub(r"\s+", " ", sor).strip().lower().encode("utf-8")).hexdigest()[:8]


def main() -> int:
    dry = "--dry-run" in sys.argv
    csere = 0
    erintett_temak: set[str] = set()

    # --- ötletbankok ---
    for ut in sorted(SEED.glob("otletek-bank-*.json")):
        adat = json.loads(ut.read_text(encoding="utf-8"))
        valtozott = 0
        for tema, teruletek in adat["temak"].items():
            for terulet, lista in teruletek.items():
                if not isinstance(lista, list):
                    continue
                ujak = []
                for sor in lista:
                    uj = UJ_OTLET.get(ujjlenyomat(sor))
                    if uj and uj != sor:
                        ujak.append(uj)
                        valtozott += 1
                        erintett_temak.add(tema)
                    else:
                        ujak.append(sor)
                # Az átírás után két sor azonossá válhat — a másolatot kivesszük.
                latott: set[str] = set()
                egyedi = []
                for s in ujak:
                    k = re.sub(r"\s+", " ", s).strip().lower()
                    if k in latott:
                        continue
                    latott.add(k)
                    egyedi.append(s)
                teruletek[terulet] = egyedi
        csere += valtozott
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  {ut.name:26} {valtozott:4} sor")

    # --- sablonok területi szövegei ---
    ut = SEED / "weekly-templates.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))
    sablonCsere = 0
    for sablon in adat["sablonok"]:
        for terulet, szoveg in (sablon.get("teruletek") or {}).items():
            if not szoveg:
                continue
            sorok = szoveg.split("\n")
            ujak = []
            for sor in sorok:
                uj = UJ_OTLET.get(ujjlenyomat(sor))
                if uj and uj != sor.strip():
                    ujak.append(uj)
                    sablonCsere += 1
                else:
                    ujak.append(sor)
            if ujak != sorok:
                sablon["teruletek"][terulet] = "\n".join(ujak)
    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  weekly-templates.json      {sablonCsere:4} sor")

    print(f"\n  összesen {csere + sablonCsere} sor · {len(erintett_temak)} téma")
    if dry:
        print("  (dry-run — semmi nem íródott ki)")
    elif csere or sablonCsere:
        print("  FUTTASD UTÁNA: python tools/mobil_tartalom.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
