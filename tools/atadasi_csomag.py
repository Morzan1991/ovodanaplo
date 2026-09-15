# -*- coding: utf-8 -*-
"""
Átadási csomag készítése kódellenőrzéshez.

MIÉRT KÜLÖN SZKRIPT: a projektmappa egyszerű tömörítése két hibát követne el.
Egyrészt belekerülne a `node_modules` és a 126 MB-os telepítő, másrészt — és ez
a súlyosabb — belekerülnének a felhasználó TITKOSÍTATLAN adatbázis-mentései,
amelyek valódi gyermekekre vonatkozó adatokat tartalmaznak.

Ez a szkript névsor alapján zár ki, és a végén ELLENŐRZI is, hogy nem maradt-e
bent adatfájl. Ha talál ilyet, nem készíti el a csomagot.

Futtatás: python tools/atadasi_csomag.py [cél-útvonal.zip]
"""

from __future__ import annotations

import os
import sys
import zipfile
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent.parent

# Mappák, amelyek sosem kerülnek a csomagba.
KIZART_MAPPA = {
    "node_modules",      # npm install előállítja
    "dist-installer",    # 126 MB kész telepítő
    "out", "dist", "build", "win-unpacked", ".vite", ".gradle",
    "__pycache__",
    "_biztonsagi-mentes-2026-09-05",  # SZEMÉLYES ADAT
    "claude-memory", ".claude",       # a fejlesztőasszisztens jegyzetei
}

# Kiterjesztések, amelyek sosem kerülnek a csomagba.
KIZART_KITERJESZTES = {
    ".db", ".db-wal", ".db-shm",   # adatbázis
    ".exe", ".blockmap", ".asar", ".rar", ".zip",
    ".tsbuildinfo", ".pyc",
}

# Amit a végső ellenőrzés gyanúsnak tekint (adatszivárgás elleni háló).
TILTOTT_MINTA = (".db", "biztonsagi-mentes", "visszaallitasi-kulcs")


def osszegyujt() -> list[Path]:
    ki: list[Path] = []
    for gyoker, mappak, nevek in os.walk(GYOKER):
        mappak[:] = [m for m in mappak if m not in KIZART_MAPPA]
        for nev in nevek:
            ut = Path(gyoker) / nev
            if ut.suffix.lower() in KIZART_KITERJESZTES:
                continue
            ki.append(ut)
    return sorted(ki)


def main() -> int:
    cel = Path(sys.argv[1]) if len(sys.argv) > 1 else GYOKER.parent / "ovodanaplo-forras.zip"
    fajlok = osszegyujt()

    # Biztonsági háló: ha bármi adatfájlnak látszik, inkább nem készül csomag.
    gyanus = [f for f in fajlok if any(m in str(f).lower() for m in TILTOTT_MINTA)]
    if gyanus:
        print("LEÁLLÍTVA — adatfájlnak látszó tétel került a listába:")
        for g in gyanus[:10]:
            print("   ", g.relative_to(GYOKER))
        return 1

    meret = sum(f.stat().st_size for f in fajlok)
    print(f"  {len(fajlok)} fájl, {meret / 1024 / 1024:.1f} MB")

    if cel.exists():
        cel.unlink()
    with zipfile.ZipFile(cel, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in fajlok:
            z.write(f, Path("ovodanaplo") / f.relative_to(GYOKER))

    print(f"  kész: {cel}  ({cel.stat().st_size / 1024 / 1024:.1f} MB tömörítve)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
