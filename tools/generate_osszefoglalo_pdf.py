# -*- coding: utf-8 -*-
"""
ÓvodaNapló — összefoglaló ismertető PDF.

A program előnyeit mutatja be egy óvodapedagógus szemszögéből, a felület
pasztell rózsaszín arculatához igazodó tipográfiával.

Kimenet: az Asztalra, `OvodaNaplo_Ismerteto.pdf` néven.
Futtatás: python tools/generate_osszefoglalo_pdf.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_marketing_doksi import szamok  # noqa: E402

from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

# --- Arculat (a program tailwind-palettájából) --------------------------------
CREAM = colors.HexColor("#FEF8FA")
INK = colors.HexColor("#3B2A30")
ROZSA_100 = colors.HexColor("#FBE9EE")
ROZSA_200 = colors.HexColor("#F5D2DC")
ROZSA_500 = colors.HexColor("#D87B9C")
ROZSA_700 = colors.HexColor("#9C4D6A")
HALVANY = colors.HexColor("#8A7480")

WIN = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"


def font_regisztral() -> tuple[str, str, str]:
    """Talpas cím- és talpatlan kenyérbetű regisztrálása (magyar ékezetekkel)."""
    parok = [
        ("Cim", ["georgiab.ttf", "timesbd.ttf"]),
        ("Szoveg", ["calibri.ttf", "arial.ttf", "segoeui.ttf"]),
        ("SzovegFel", ["calibrib.ttf", "arialbd.ttf", "segoeuib.ttf"]),
    ]
    nevek = []
    for nev, fajlok in parok:
        for f in fajlok:
            ut = WIN / f
            if ut.exists():
                pdfmetrics.registerFont(TTFont(nev, str(ut)))
                nevek.append(nev)
                break
        else:
            nevek.append("Helvetica")
    return tuple(nevek)  # type: ignore[return-value]


CIM_F, SZOVEG_F, SZOVEG_FEL = font_regisztral()

# A <b> és <i> csak akkor működik, ha a betűcsalád tagjai össze vannak kapcsolva.
_dolt = WIN / "calibrii.ttf"
if _dolt.exists():
    pdfmetrics.registerFont(TTFont("SzovegDolt", str(_dolt)))
    pdfmetrics.registerFontFamily(
        SZOVEG_F, normal=SZOVEG_F, bold=SZOVEG_FEL, italic="SzovegDolt", boldItalic=SZOVEG_FEL
    )
else:
    pdfmetrics.registerFontFamily(SZOVEG_F, normal=SZOVEG_F, bold=SZOVEG_FEL)

S_CIMLAP = ParagraphStyle(
    "cimlap", fontName=CIM_F, fontSize=30, leading=35, textColor=ROZSA_700,
    alignment=TA_CENTER, spaceAfter=6,
)
S_ALCIM = ParagraphStyle(
    "alcim", fontName=SZOVEG_F, fontSize=13, leading=19, textColor=HALVANY,
    alignment=TA_CENTER, spaceAfter=18,
)
S_H1 = ParagraphStyle(
    "h1", fontName=CIM_F, fontSize=16, leading=20, textColor=ROZSA_700,
    spaceBefore=15, spaceAfter=8,
)
S_TEST = ParagraphStyle(
    "test", fontName=SZOVEG_F, fontSize=10.2, leading=14.5, textColor=INK,
    alignment=TA_JUSTIFY, spaceAfter=7,
)
S_KIEMELT = ParagraphStyle(
    "kiemelt", fontName=SZOVEG_F, fontSize=11.5, leading=18, textColor=INK,
    alignment=TA_CENTER,
)
S_SZAM = ParagraphStyle(
    "szam", fontName=CIM_F, fontSize=21, leading=24, textColor=ROZSA_700,
    alignment=TA_CENTER,
)
S_SZAM_CIMKE = ParagraphStyle(
    "szamcimke", fontName=SZOVEG_F, fontSize=8.5, leading=11, textColor=HALVANY,
    alignment=TA_CENTER,
)
S_LABLEC = ParagraphStyle(
    "lablec", fontName=SZOVEG_F, fontSize=8, textColor=HALVANY, alignment=TA_CENTER
)


def hatter(canvas, doc):
    """Krémszínű lap, felül vékony rózsaszín sáv, alul oldalszám."""
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setFillColor(ROZSA_200)
    canvas.rect(0, A4[1] - 0.45 * cm, A4[0], 0.45 * cm, stroke=0, fill=1)
    # Egyoldalas ismertetőn az oldalszám felesleges — csak a 2. laptól írjuk ki.
    if doc.page > 1:
        canvas.setFillColor(HALVANY)
        canvas.setFont(SZOVEG_F, 8)
        canvas.drawCentredString(A4[0] / 2, 1.1 * cm, f"ÓvodaNapló · {doc.page}. oldal")
    canvas.restoreState()


def szamdoboz(adatok: list[tuple[str, str]]) -> Table:
    """Nagy számok egy sorban, halvány rózsaszín dobozokban."""
    cellak = [
        [Paragraph(sz, S_SZAM) for sz, _ in adatok],
        [Paragraph(c, S_SZAM_CIMKE) for _, c in adatok],
    ]
    t = Table(cellak, colWidths=[4.2 * cm] * len(adatok))
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), ROZSA_100),
                ("BOX", (0, 0), (-1, -1), 0.5, ROZSA_200),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, CREAM),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 10),
            ]
        )
    )
    return t


def elony(cim: str, szoveg: str) -> KeepTogether:
    """Egy előny: rózsaszín pöttyel jelölt cím + magyarázat."""
    return KeepTogether(
        [
            Paragraph(f'<font color="#D87B9C">•</font>&nbsp;&nbsp;<b>{cim}</b>', ParagraphStyle(
                "elonycim", parent=S_TEST, fontName=SZOVEG_FEL, fontSize=11.5,
                leading=15, spaceAfter=1, alignment=0,
            )),
            Paragraph(szoveg, ParagraphStyle(
                "elonyszoveg", parent=S_TEST, leftIndent=14, spaceAfter=11,
            )),
        ]
    )


def main() -> int:
    # A kimenet helye megadható paraméterként is (pl. ha a fájl épp meg van nyitva).
    argok = [a for a in sys.argv[1:] if not a.startswith("-")]
    kimenet = (
        Path(argok[0])
        if argok
        else Path(os.path.expanduser("~")) / "Desktop" / "OvodaNaplo_Ismerteto.pdf"
    )

    doc = BaseDocTemplate(
        str(kimenet), pagesize=A4,
        leftMargin=2.4 * cm, rightMargin=2.4 * cm,
        topMargin=1.7 * cm, bottomMargin=1.6 * cm,
        title="ÓvodaNapló — ismertető", author="ÓvodaNapló",
    )
    keret = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="fo")
    doc.addPageTemplates([PageTemplate(id="alap", frames=[keret], onPage=hatter)])

    e: list = []

    # --- Fejléc ---
    e.append(Spacer(1, 0.8 * cm))
    e.append(Paragraph("ÓvodaNapló", S_CIMLAP))
    e.append(Paragraph(
        "Tervezőprogram óvodapedagógusoknak — heti terv, foglalkozás, projekt",
        S_ALCIM))
    # A számokat a seed-fájlokból olvassuk, hogy soha ne avuljanak el.
    sz = szamok()
    e.append(szamdoboz([
        (str(sz["tema"]), "kész heti téma"),
        (f'{sz["otlet"]:,}'.replace(",", " "), "tevékenység-ötlet"),
        (f'{sz["irodalom"]:,}'.replace(",", " "), "mese, vers, dal"),
    ]))
    e.append(Spacer(1, 0.8 * cm))
    e.append(Paragraph(
        "<i>„A tervezés maradjon szakmai munka — a keresgélés, másolgatás és formázás "
        "legyen a programé.”</i>", S_KIEMELT))

    # --- Előnyök, tömören ---
    e.append(Paragraph("Miért éri meg?", S_H1))
    for cim, szoveg in [
        ("Kész az egész év",
         "A program a nevelési év minden hetére témát javasol, az ünnepekhez igazítva — "
         "a mozgó ünnepeket (farsang, húsvét, advent) évről évre kiszámolja. Egyetlen "
         "hét sem marad téma nélkül, és egyik sem ismétlődik."),
        ("A korosztályhoz igazodik",
         "Kis-, középső, nagy- vagy vegyes csoport: az ötletek, az irodalom és az "
         "iskola-előkészítő rész is ehhez igazodik — a képernyőn és a Word-fájlban is."),
        ("Kész tartalom, szabadon átírva",
         f"{sz['sablon']} kidolgozott sablon mind a hét tevékenységi területre, korosztályhoz illő "
         "ötletekkel és valódi óvodás irodalommal. A sablon kiindulás, nem kényszer."),
        ("Word-fájl az oviKRÉTA-hoz",
         "A kész terv egy gombnyomással .docx fájlba menthető a megszokott felépítésben."),
        ("A munkád biztonságban van",
         "Amit írsz, magától mentődik; a program naponta biztonsági másolatot készít. "
         "Minden a saját gépeden marad, titkosítva — internet nélkül is működik."),
    ]:
        e.append(elony(cim, szoveg))

    # --- Mit tartalmaz + kezdés egy sorban ---
    e.append(Paragraph("Mit találsz benne?", S_H1))
    e.append(Paragraph(
        "<b>Naptár</b> — a nevelési év ünnepekkel, saját eseményekkel és kelléklistával. &nbsp;·&nbsp; "
        "<b>Heti terv</b> — az ONAP hét területe egy oldalon, ötletekkel. &nbsp;·&nbsp; "
        "<b>Projektek</b> és <b>Reflexiók</b> — hosszabb témák és tapasztalatok. &nbsp;·&nbsp; "
        "<b>Irodalom</b> — kereshető mese-, vers- és daltár. &nbsp;·&nbsp; "
        "<b>Keresés</b> — a korábbi évek terveiben.",
        S_TEST))

    e.append(Paragraph("Három lépés az első tervig", S_H1))
    e.append(Paragraph(
        "<b>1.</b> Beállításokban add meg a csoport korosztályát. &nbsp; "
        "<b>2.</b> A Naptárban hozd létre a nevelési évet — a program végigtervezi a heteket. &nbsp; "
        "<b>3.</b> Nyisd meg a hetet, és írd át, ahogy nektek jó.",
        S_TEST))
    e.append(Spacer(1, 0.25 * cm))
    e.append(Paragraph(
        "A programban a <b>Súgó</b> menüpont bármikor elmagyarázza, mi mire való.",
        S_KIEMELT))

    doc.build(e)
    print(f"Elkészült: {kimenet}")
    print(f"Méret: {kimenet.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
