# -*- coding: utf-8 -*-
"""
Az ÓvodaNapló mobil-ikonjának előállítása minden képernyősűrűségre.

Az ikon ugyanaz a jelkép, mint az asztali programban: lekerekített sarkú, tömör
rózsaszín négyzet, benne krémszínű, talpas nagy Ó betű. A hosszú Ó fontos — a
program neve ÓvodaNapló.

Amit kiír (a Capacitor által generált fájlokat felülírva):
  mipmap-*/ic_launcher.png             — hagyományos, lekerekített ikon
  mipmap-*/ic_launcher_round.png       — kör alakú változat
  mipmap-*/ic_launcher_foreground.png  — adaptív ikon előtere (átlátszó háttéren)
  values/ic_launcher_background.xml     — az adaptív ikon háttérszíne

Az adaptív ikonnál a rendszer vág (kör, négyzet, csepp — gyártófüggő), és csak a
középső ~66% biztosan látszik. Az Ó ezért a biztonságos zónába kerül.

Futtatás: python tools/mobil_ikon.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent.parent
RES = GYOKER / "mobile" / "android" / "app" / "src" / "main" / "res"

ROZSA = (216, 123, 156, 255)   # #D87B9C — az asztali app fő színe
KREM = (254, 248, 250, 255)    # #FEF8FA

# Sűrűség → (hagyományos ikon mérete, adaptív előtér mérete)
SURUSEGEK = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

# Nagy felbontáson rajzolunk, majd lekicsinyítünk — így a görbék simák lesznek.
MINTAVETEL = 8

WIN_FONTS = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
BETU_JELOLTEK = ["georgiab.ttf", "timesbd.ttf", "constanb.ttf", "arialbd.ttf"]


def betu(meret: int) -> ImageFont.FreeTypeFont:
    for nev in BETU_JELOLTEK:
        ut = WIN_FONTS / nev
        if ut.exists():
            return ImageFont.truetype(str(ut), meret)
    return ImageFont.load_default(meret)


def o_betu_rajz(kep: Image.Image, doboz: float, kozep: tuple[float, float]) -> None:
    """A krémszínű Ó a megadott dobozmérethez igazítva, optikailag középre."""
    d = ImageDraw.Draw(kep)
    f = betu(int(doboz))
    # Az anchor="mm" a betű befoglaló dobozát középre teszi; az ékezet miatt a
    # betűtest kissé lejjebb kerül, ezt egy kevés eltolással hozzuk vissza.
    bal, fent, jobb, lent = d.textbbox((0, 0), "Ó", font=f, anchor="lt")
    magassag = lent - fent
    d.text(
        (kozep[0], kozep[1] + magassag * 0.06),
        "Ó",
        font=f,
        fill=KREM,
        anchor="mm",
    )


def hagyomanyos(meret: int) -> Image.Image:
    """Lekerekített sarkú, tömör rózsaszín ikon a betűvel."""
    n = meret * MINTAVETEL
    kep = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(kep)
    d.rounded_rectangle((0, 0, n - 1, n - 1), radius=int(n * 0.22), fill=ROZSA)
    o_betu_rajz(kep, n * 0.52, (n / 2, n / 2))
    return kep.resize((meret, meret), Image.LANCZOS)


def kor(meret: int) -> Image.Image:
    n = meret * MINTAVETEL
    kep = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(kep)
    d.ellipse((0, 0, n - 1, n - 1), fill=ROZSA)
    o_betu_rajz(kep, n * 0.48, (n / 2, n / 2))
    return kep.resize((meret, meret), Image.LANCZOS)


def eloter(meret: int) -> Image.Image:
    """
    Adaptív előtér: csak a betű, átlátszó háttéren.

    A 108 dp-s vászonból a rendszer legfeljebb a középső 72 dp-t mutatja, ezért a
    betű ehhez a biztonságos zónához méreteződik, nem a teljes vászonhoz.
    """
    n = meret * MINTAVETEL
    kep = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    o_betu_rajz(kep, n * 0.34, (n / 2, n / 2))
    return kep.resize((meret, meret), Image.LANCZOS)


def main() -> int:
    if not RES.exists():
        print(f"Nincs meg a res mappa: {RES}")
        print("Előbb fusson le: cd mobile && npx cap add android")
        return 1

    for suruseg, (ikon, elo) in SURUSEGEK.items():
        mappa = RES / f"mipmap-{suruseg}"
        mappa.mkdir(parents=True, exist_ok=True)
        hagyomanyos(ikon).save(mappa / "ic_launcher.png")
        kor(ikon).save(mappa / "ic_launcher_round.png")
        eloter(elo).save(mappa / "ic_launcher_foreground.png")
        print(f"  {suruseg:8} ikon {ikon}px · előtér {elo}px")

    hatter = RES / "values" / "ic_launcher_background.xml"
    hatter.parent.mkdir(parents=True, exist_ok=True)
    hatter.write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        '    <color name="ic_launcher_background">#D87B9C</color>\n'
        "</resources>\n",
        encoding="utf-8",
    )
    print(f"  háttérszín: #D87B9C → {hatter.relative_to(GYOKER)}")

    # A Play Áruház 512×512-es ikont kér a bolti laphoz.
    bolti = GYOKER / "mobile" / "bolt"
    bolti.mkdir(parents=True, exist_ok=True)
    hagyomanyos(512).save(bolti / "play-ikon-512.png")
    print(f"  bolti ikon 512px → {(bolti / 'play-ikon-512.png').relative_to(GYOKER)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
