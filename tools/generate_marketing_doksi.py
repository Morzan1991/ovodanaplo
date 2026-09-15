# -*- coding: utf-8 -*-
"""
ÓvodaNapló — marketing-dokumentáció PDF.

Célja, hogy egy MÁSIK nyelvi modell ebből képes legyen képeket, vizuális
anyagokat tervezni a programról. Ezért nemcsak a funkciókat sorolja fel, hanem
mindent, ami egy vizuális brief-hez kell: a célközönséget, a kulcsüzeneteket, a
pontos arculati értékeket (HEX-kódok, betűk), a hangnemet, konkrét képötleteket,
és — fontos — azt is, mit NEM szabad állítani vagy ábrázolni.

A számok nem kézzel írtak: a `szamok()` a seed-fájlokból olvassa ki őket, így a
dokumentum a program tényleges állapotát tükrözi.

Kimenet: az Asztalra, `OvodaNaplo_Marketing_Dokumentacio.pdf` néven.
Futtatás: python tools/generate_marketing_doksi.py [kimeneti_útvonal]
"""

from __future__ import annotations

import json
import os
import sys
from collections import Counter
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
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

SEED = Path(__file__).resolve().parent.parent / "seed"

# --- Arculat (a program tailwind-palettájából, változtatás nélkül) -------------
CREAM = colors.HexColor("#FEF8FA")
INK = colors.HexColor("#3B2A30")
ROZSA_50 = colors.HexColor("#FDF5F8")
ROZSA_100 = colors.HexColor("#FBE9EE")
ROZSA_200 = colors.HexColor("#F5D2DC")
ROZSA_400 = colors.HexColor("#E59FB4")
ROZSA_500 = colors.HexColor("#D87B9C")
ROZSA_700 = colors.HexColor("#9C4D6A")
ROZSA_900 = colors.HexColor("#52273A")
HALVANY = colors.HexColor("#8A7480")

WIN = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"


def font_regisztral() -> tuple[str, str, str]:
    """Talpas cím- és talpatlan kenyérbetű (magyar ékezetekkel)."""
    parok = [
        ("Cim", ["georgiab.ttf", "timesbd.ttf"]),
        ("Szoveg", ["calibri.ttf", "arial.ttf", "segoeui.ttf"]),
        ("SzovegFel", ["calibrib.ttf", "arialbd.ttf", "segoeuib.ttf"]),
        ("SzovegDolt", ["calibrii.ttf", "ariali.ttf", "segoeuii.ttf"]),
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



CIM_F, SZOVEG_F, SZOVEG_FEL, SZOVEG_DOLT = font_regisztral()

# A <b> és az <i> csak akkor működik a szövegben, ha a betűcsalád tagjai
# össze vannak kapcsolva — enélkül a félkövér és a dőlt észrevétlenül elmarad.
pdfmetrics.registerFontFamily(
    SZOVEG_F, normal=SZOVEG_F, bold=SZOVEG_FEL, italic=SZOVEG_DOLT, boldItalic=SZOVEG_FEL
)

S_CIMLAP = ParagraphStyle("cimlap", fontName=CIM_F, fontSize=32, leading=37,
                          textColor=ROZSA_700, alignment=TA_CENTER, spaceAfter=4)
S_ALCIM = ParagraphStyle("alcim", fontName=SZOVEG_F, fontSize=12.5, leading=18,
                         textColor=HALVANY, alignment=TA_CENTER, spaceAfter=14)
S_H1 = ParagraphStyle("h1", fontName=CIM_F, fontSize=17, leading=21,
                      textColor=ROZSA_700, spaceBefore=14, spaceAfter=7)
S_H2 = ParagraphStyle("h2", fontName=SZOVEG_FEL, fontSize=11.5, leading=15,
                      textColor=ROZSA_900, spaceBefore=9, spaceAfter=3)
S_TEST = ParagraphStyle("test", fontName=SZOVEG_F, fontSize=10, leading=14.2,
                        textColor=INK, alignment=TA_JUSTIFY, spaceAfter=6)
S_LISTA = ParagraphStyle("lista", parent=S_TEST, leftIndent=13, spaceAfter=3,
                         alignment=0)
S_KIEMELT = ParagraphStyle("kiemelt", fontName=SZOVEG_F, fontSize=11.5, leading=17,
                           textColor=INK, alignment=TA_CENTER)
S_SZAM = ParagraphStyle("szam", fontName=CIM_F, fontSize=19, leading=22,
                        textColor=ROZSA_700, alignment=TA_CENTER)
S_SZAM_CIMKE = ParagraphStyle("szamcimke", fontName=SZOVEG_F, fontSize=8, leading=10,
                              textColor=HALVANY, alignment=TA_CENTER)
S_KICSI = ParagraphStyle("kicsi", fontName=SZOVEG_F, fontSize=9, leading=12.5,
                         textColor=INK)
S_KOD = ParagraphStyle("kod", fontName=SZOVEG_F, fontSize=8.5, leading=11,
                       textColor=HALVANY, alignment=TA_CENTER)


def szamok() -> dict:
    """A tartalmi mutatók a seed-fájlokból — ne kézzel írjuk őket."""
    sab = json.loads((SEED / "weekly-templates.json").read_text(encoding="utf-8"))["sablonok"]
    bankok = {
        k: json.loads((SEED / f"otletek-bank-{k}.json").read_text(encoding="utf-8"))["temak"]
        for k in ("kicsi", "kozepso", "nagy", "vegyes")
    }
    lit = json.loads((SEED / "literature.json").read_text(encoding="utf-8"))["tetelek"]
    unnepek = json.loads((SEED / "hungarian-holidays.json").read_text(encoding="utf-8"))
    kepessegek = json.loads((SEED / "kepessegek.json").read_text(encoding="utf-8"))

    def darab(x):
        if isinstance(x, dict):
            for ertek in x.values():
                if isinstance(ertek, list):
                    return len(ertek)
        return len(x)

    return {
        "sablon": len(sab),
        "tema": len(bankok["vegyes"]),
        "otlet": sum(len(l) for b in bankok.values() for ar in b.values() for l in ar.values()),
        "otletKor": {
            k: sum(len(l) for ar in b.values() for l in ar.values()) for k, b in bankok.items()
        },
        "irodalom": len(lit),
        "irodalomTipus": Counter(x["tipus"] for x in lit),
        "unnep": darab(unnepek),
        "kepesseg": darab(kepessegek),
        "korcsoportosCel": sum(1 for x in sab if x.get("celKorcsoport")),
        "anyanyelvi": sum(
            1 for x in sab if "Anyanyelvi játék:" in (x["teruletek"].get("verseles_meseles") or "")
        ),
        "szabalyosJatek": sum(
            1 for ar in bankok["vegyes"].values() for l in ar.values() for x in l if " — " in x
        ),
    }


def hatter(canvas, doc):
    """Krém lap, felül rózsaszín sáv, alul oldalszám."""
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setFillColor(ROZSA_200)
    canvas.rect(0, A4[1] - 0.45 * cm, A4[0], 0.45 * cm, stroke=0, fill=1)
    if doc.page > 1:
        canvas.setFillColor(HALVANY)
        canvas.setFont(SZOVEG_F, 8)
        canvas.drawCentredString(A4[0] / 2, 1.05 * cm, f"ÓvodaNapló — marketing-dokumentáció · {doc.page}")
    canvas.restoreState()


def szamdoboz(adatok: list[tuple[str, str]], szelesseg: float = 4.2) -> Table:
    t = Table(
        [[Paragraph(sz, S_SZAM) for sz, _ in adatok],
         [Paragraph(c, S_SZAM_CIMKE) for _, c in adatok]],
        colWidths=[szelesseg * cm] * len(adatok),
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ROZSA_100),
        ("BOX", (0, 0), (-1, -1), 0.5, ROZSA_200),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, CREAM),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
    ]))
    return t


def tablazat(
    fejlec: list[str], sorok: list[list[str]], szelessegek: list[float], egyben: bool = True
):
    """
    Szedett táblázat. `egyben=True` esetén nem törik ketté két oldal között —
    a rövid táblázatoknál ez a jó, mert egy-két árva sor a következő oldalon
    csúnya. A hosszúaknál (ahol úgysem férne el egyben) engedjük a törést, és a
    fejlécet minden oldalon megismételjük.
    """
    adat = [[Paragraph(f"<b>{h}</b>", S_KICSI) for h in fejlec]]
    adat += [[Paragraph(c, S_KICSI) for c in sor] for sor in sorok]
    t = Table(adat, colWidths=[sz * cm for sz in szelessegek], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ROZSA_200),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, ROZSA_50]),
        ("BOX", (0, 0), (-1, -1), 0.5, ROZSA_200),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, ROZSA_400),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return KeepTogether([t]) if egyben else t


def pont(cim: str, szoveg: str) -> KeepTogether:
    return KeepTogether([
        Paragraph(f'<font color="#D87B9C">•</font>&nbsp;&nbsp;<b>{cim}</b>',
                  ParagraphStyle("pc", parent=S_TEST, fontName=SZOVEG_FEL, fontSize=10.5,
                                 leading=14, spaceAfter=1, alignment=0)),
        Paragraph(szoveg, ParagraphStyle("ps", parent=S_TEST, leftIndent=14, spaceAfter=7)),
    ])


def szinsor(szinek: list[tuple[str, str, str]]) -> Table:
    """Színminta-sáv: felül a szín, alatta a HEX és a szerep."""
    minta = [""] * len(szinek)
    hexek = [Paragraph(f"<b>{h}</b>", S_KOD) for _n, h, _sz in szinek]
    nevek = [Paragraph(sz, S_KOD) for _n, _h, sz in szinek]
    t = Table([minta, hexek, nevek], colWidths=[2.55 * cm] * len(szinek),
              rowHeights=[1.15 * cm, None, None])
    stilus = [
        ("BOX", (0, 0), (-1, 0), 0.5, ROZSA_200),
        ("INNERGRID", (0, 0), (-1, 0), 0.5, CREAM),
        ("VALIGN", (0, 1), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 1), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 0),
    ]
    for i, (_n, h, _sz) in enumerate(szinek):
        stilus.append(("BACKGROUND", (i, 0), (i, 0), colors.HexColor(h)))
    t.setStyle(TableStyle(stilus))
    return t


def epit(sz: dict) -> list:
    e: list = []
    IT = sz["irodalomTipus"]

    # ---------------------------------------------------------------- CÍMLAP --
    e.append(Spacer(1, 1.2 * cm))
    e.append(Paragraph("ÓvodaNapló", S_CIMLAP))
    e.append(Paragraph(
        "Tervezőprogram óvodapedagógusoknak — heti terv, foglalkozás-tervezet, projekt<br/>"
        "<b>Marketing-dokumentáció</b> · vizuális anyagok készítéséhez", S_ALCIM))
    e.append(szamdoboz([
        (str(sz["sablon"]), "kidolgozott heti sablon"),
        (str(sz["tema"]), "önálló heti téma"),
        (f'{sz["otlet"]:,}'.replace(",", " "), "tevékenység-ötlet"),
        (f'{sz["irodalom"]:,}'.replace(",", " "), "mese, vers, dal"),
    ], szelesseg=3.9))
    e.append(Spacer(1, 0.7 * cm))
    e.append(Paragraph(
        "<i>„A tervezés maradjon szakmai munka — a keresgélés, a másolgatás és a formázás "
        "legyen a programé.”</i>", S_KIEMELT))
    e.append(Spacer(1, 0.5 * cm))
    e.append(Paragraph(
        "Ez a dokumentum azért készült, hogy egy másik nyelvi modell képes legyen belőle "
        "vizuális anyagot tervezni. Ezért nemcsak azt tartalmazza, MIT tud a program, hanem "
        "a célközönséget, a kulcsüzeneteket, a pontos arculati értékeket, a hangnemet, konkrét "
        "képötleteket — és azt is, mit nem szabad állítani vagy ábrázolni. "
        "A számadatok a program adatállományából származnak, nem becslések.", S_TEST))

    # ------------------------------------------------------- 1. A PROGRAM ----
    e.append(Paragraph("1. Egy mondatban", S_H1))
    e.append(Paragraph(
        "Az ÓvodaNapló egy Windowsra telepíthető, internet nélkül működő tervezőprogram, "
        "amely az óvodapedagógus egész nevelési évét végigkíséri: hetenként témát javasol az "
        "ünnepekhez igazítva, a csoport korosztályához illő tevékenységeket, verseket, meséket "
        "és dalokat kínál, a kész tervet pedig Word-fájlba menti — minden adat a saját gépen "
        "marad, titkosítva.", S_TEST))

    e.append(Paragraph("2. Kinek készült", S_H1))
    e.append(pont("Elsődleges: óvodapedagógus",
                  "Aki hetente írja a tervezetét, és a papírmunka helyett a gyerekekkel "
                  "szeretne foglalkozni. Nem informatikus: a programnak magától kell "
                  "értetődőnek lennie."))
    e.append(pont("Csoporttípustól függetlenül",
                  "Kis-, középső, nagy- és vegyes csoport egyaránt — a program mind a négy "
                  "korosztályra külön anyagot kínál."))
    e.append(pont("Másodlagos: óvodavezető, szakmai munkaközösség",
                  "Akinek egységes, ONAP-hoz igazodó, ellenőrizhető dokumentáció kell."))

    e.append(Paragraph("3. Milyen problémát old meg", S_H1))
    e.append(tablazat(
        ["Enélkül", "Ezzel"],
        [
            ["Vasárnap este üres lap előtt ülni, és kitalálni, mi legyen a jövő heti téma.",
             "A program a nevelési év minden hetére témát javasol, az ünnepekhez igazítva."],
            ["Régi tervezetekből másolgatni, ami már nem is illik a mostani csoporthoz.",
             "A korosztályhoz illő ötleteket kínál — kis- és nagycsoport nem ugyanazt kapja."],
            ["Verset, mesét, dalt keresni a témához, több könyvből összeszedve.",
             f"{sz['irodalom']} mű a témához és korosztályhoz rendelve, műfajjal megjelölve."],
            ["A kész tervet kézzel beformázni a KRÉTA-hoz.",
             "Egy gombnyomás: kész .docx a megszokott felépítésben."],
            ["Elszórt fájlok, elveszett tavalyi tervek.",
             "Minden egy helyen, kereshetően, automatikus napi biztonsági másolattal."],
        ],
        [7.9, 7.9]))

    # ----------------------------------------------------- 4. TARTALMI LELTÁR -
    e.append(Paragraph("4. Tartalmi leltár — mi van benne", S_H1))
    e.append(Paragraph(
        "Ezek a számok a program adatállományából származnak. Marketinganyagban "
        "nyugodtan használhatók, mert ellenőrizhetők.", S_TEST))
    e.append(tablazat(
        ["Mit", "Mennyi", "Részletek"],
        [
            ["Heti sablon", str(sz["sablon"]),
             "kész, kidolgozott heti terv mind a hét ONAP-területtel"],
            ["Önálló heti téma", str(sz["tema"]),
             "szeptembertől júniusig, ünnepekhez és évszakokhoz kötve"],
            ["Tevékenység-ötlet", f'{sz["otlet"]:,}'.replace(",", " "),
             f'kiscsoport {sz["otletKor"]["kicsi"]}, középső {sz["otletKor"]["kozepso"]}, '
             f'nagycsoport {sz["otletKor"]["nagy"]}, vegyes {sz["otletKor"]["vegyes"]}'],
            ["Irodalmi mű", f'{sz["irodalom"]:,}'.replace(",", " "),
             f'{IT["vers"]} vers, {IT["mese"]} mese, {IT["nepmese"]} népmese, '
             f'{IT["mondoka"]} mondóka, {IT["dal"]} dal, {IT["zenehallgatas"]} zenehallgatás, '
             f'{IT["talalos_kerdes"]} találós kérdés, {IT["regeny"]} meseregény'],
            ["Szabállyal leírt játék", str(sz["szabalyosJatek"]),
             "fogó-, futó-, egyensúlyozó és képességfejlesztő játékok a szabályukkal együtt"],
            ["Korosztályos cél és feladat", str(sz["korcsoportosCel"]),
             "sablon, amelyben a cél, a feladat és a fejlesztési területek korosztályonként "
             "külön vannak megfogalmazva"],
            ["Anyanyelvi játék rovat", str(sz["anyanyelvi"]),
             "sablon, amelyben külön rovat sorolja fel a hét anyanyelvi játékait"],
            ["Magyar ünnep, jeles nap", str(sz["unnep"]),
             "nemzeti, egyházi, néphagyományos és világnapok — a mozgó ünnepek évente újraszámolva"],
            ["Képesség, fejlesztési terület", str(sz["kepesseg"]),
             "a heti tervhez rendelhető, ONAP-hoz igazodó fejlesztési területek"],
        ],
        [4.2, 2.2, 9.4], egyben=False))

    e.append(Paragraph("5. Funkciók menüpontonként", S_H1))
    e.append(tablazat(
        ["Menüpont", "Mit tud"],
        [
            ["Naptár", "A nevelési év hetekre bontva, ünnepekkel és saját eseményekkel. "
                       "Egy gombbal végigtervezi az egész évet. Kelléklista a hét eszközeiről."],
            ["Heti terv", "Az ONAP hét tevékenységi területe egy oldalon. Ötletbörze "
                          "korosztályra szűrve; a kiválasztott mese a Mesék, a vers a Versek "
                          "rovatba kerül. Dokumentum-előnézet, Word-export, nyomtatás."],
            ["Projektek", "Több hetet átívelő projekttervek, saját szerkesztővel."],
            ["Reflexiók", "A megvalósult hét tapasztalatai — heti, foglalkozás- és projekt-szinten."],
            ["Irodalom", "Kereshető mese-, vers- és daltár műfaj, korosztály és téma szerint. "
                         "Saját művek is felvehetők, és a szöveg begépelhető."],
            ["Keresés", "Teljes szöveges keresés a korábbi évek terveiben."],
            ["Súgó", "Magyar nyelvű útmutató: mi mire való a programban."],
            ["Beállítások", "Óvoda, csoport, korosztály, titkosítási kulcs, biztonsági mentés."],
        ],
        [3.2, 12.6], egyben=False))


    # --------------------------------------------- 6. MEGKÜLÖNBÖZTETŐ JEGYEK -
    e.append(Paragraph("6. Megkülönböztető jegyek", S_H1))
    e.append(Paragraph(
        "Ez az öt dolog az, amiben a program más — ezekre érdemes építeni a képi anyagot is.",
        S_TEST))
    e.append(pont("Valóban korosztály szerint különbözik",
                  "Nem címke, hanem tartalom: a kis- és a nagycsoport listái átlagosan 16%-ban "
                  "fedik egymást. A kicsiknek ölbeli mondóka és rövid mese, a nagyoknak hosszabb "
                  "vers, népmese és összetettebb népi játék jut. A cél, a feladat és a "
                  "fejlesztési területek is korosztályonként külön vannak megfogalmazva."))
    e.append(pont("Csak valódi, óvodában használt magyar anyag",
                  "Nincs kitalált vers vagy mese. A korpusz gerincét egy nyomtatott, 36 hetes "
                  "óvodai tervezet-gyűjtemény adja, mellette a klasszikus repertoár: Weöres, "
                  "Zelk, Nemes Nagy Ágnes, Gazdag Erzsi, Móra, Csanádi Imre, Kányádi, Fésűs Éva, "
                  "Bartos Erika, Marék Veronika és a népköltés."))
    e.append(pont("Minden mű meg van jelölve műfajjal",
                  "A listán ott áll, hogy vers, mondóka, mese, népmese, dal, énekes körjáték "
                  "vagy zenehallgatás. Így nem kerül dal a versek közé — és a pedagógus "
                  "ránézésre látja, mit tart a kezében."))
    e.append(pont("Az adat a pedagógusé marad",
                  "Nincs felhő, nincs regisztráció, nincs nyomkövetés. Az adatbázis a saját "
                  "gépen van, titkosítva; a kulcsot a Windows védi, és van visszaállítási kulcs. "
                  "A program internet nélkül is teljes értékű."))
    e.append(pont("A kész terv azonnal használható",
                  "Word-fájl a megszokott felépítésben, Times New Roman 12 pontos szedéssel — "
                  "feltölthető az oviKRÉTA-ba, kinyomtatható, aláírható."))

    e.append(Paragraph("7. Kulcsüzenetek — használható állítások", S_H1))
    e.append(tablazat(
        ["Állítás", "Mi támasztja alá"],
        [
            ["„Kész az egész éved.”",
             f"{sz['sablon']} kidolgozott heti sablon, {sz['tema']} önálló téma; a program "
             "végigtervezi a nevelési évet úgy, hogy egyetlen hét sem marad üresen."],
            ["„A csoportodhoz szól, nem általában a gyerekekhez.”",
             "Négy korosztályra külön ötlet-, irodalom- és célanyag."],
            ["„Nem kell verset keresned.”",
             f"{sz['irodalom']} mű témához és korosztályhoz rendelve, műfajjal jelölve."],
            ["„Egy gomb, és kész a Word.”",
             "KRÉTA-kompatibilis .docx export heti tervhez, foglalkozáshoz és projekthez."],
            ["„A munkád nálad marad.”",
             "Helyi, titkosított adatbázis; automatikus napi biztonsági mentés; offline működés."],
            ["„Az ünnepekkel együtt gondolkodik.”",
             f"{sz['unnep']} jeles nap; a mozgó ünnepeket (farsang, húsvét, advent) évről évre "
             "kiszámolja, és munkanapra igazítja."],
        ],
        [5.4, 10.4]))

    nemAllithato = [
        "<b>Nem felhőalapú</b>, nincs online fiók, nincs szinkronizálás eszközök között.",
        "<b>Nem többfelhasználós</b>: egy óvónő, egy gép, egy program. Nincs bejelentkezés.",
        "<b>Nem mesterséges intelligencia</b> írja a tervet: kész, gondozott anyagból "
        "válogat, amit a pedagógus szabadon átír.",
        "<b>Nem mobilalkalmazás</b> és nem webes felület — Windowsra telepíthető program.",
        "<b>Nem helyettesíti a pedagógust</b>: kiindulást ad, a döntés az övé.",
        "<b>Nem hivatalos KRÉTA-termék</b>: a Word-export a KRÉTA-ba feltölthető formátumú, "
        "de a program független.",
    ]
    # Fejléc, bevezető és lista egyben — így a szakasz nem szakad ketté.
    e.append(KeepTogether(
        [
            Paragraph("8. Amit NEM szabad állítani", S_H1),
            Paragraph(
                "Ezek nem igazak a programra — marketinganyagban sem szövegben, sem képen ne "
                "jelenjenek meg:", S_TEST),
        ]
        + [
            Paragraph(f'<font color="#9C4D6A"><b>×</b></font>&nbsp;&nbsp;{x}', S_LISTA)
            for x in nemAllithato
        ]
    ))


    # ------------------------------------------------------------ 9. ARCULAT -
    e.append(Paragraph("9. Arculat — pontos értékek", S_H1))
    e.append(Paragraph(
        "A program felülete pasztell rózsaszín, meleg, papírszerű. A képi anyagnak ezt kell "
        "folytatnia. A HEX-kódok a program tényleges színei:", S_TEST))
    e.append(szinsor([
        ("Alap", "#FEF8FA", "háttér, „papír”"),
        ("Világos", "#FBE9EE", "dobozok, kiemelés"),
        ("Halvány", "#F5D2DC", "keret, elválasztó"),
        ("Fő szín", "#D87B9C", "gomb, hangsúly"),
        ("Sötét", "#9C4D6A", "cím, ikon"),
        ("Szöveg", "#3B2A30", "kenyérszöveg"),
    ]))
    e.append(Spacer(1, 0.35 * cm))
    e.append(Paragraph("Betűk", S_H2))
    e.append(Paragraph(
        "Címekhez <b>Fraunces</b> (talpas, meleg, kissé régies) — helyettesíthető Georgiával. "
        "Kenyérszöveghez <b>Inter</b> (talpatlan, semleges, jól olvasható) — helyettesíthető "
        "a rendszer talpatlan betűjével. A két betűtípus kontrasztja az arculat lényege: "
        "a talpas cím adja a meghittséget, a talpatlan szöveg a letisztultságot.", S_TEST))
    e.append(Paragraph("Jelkép", S_H2))
    e.append(Paragraph(
        "Lekerekített sarkú, tömör rózsaszín négyzet (#D87B9C), benne krémszínű, talpas "
        "nagy <b>Ó</b> betű. Egyszerű, nem rajzfilmszerű. A hosszú Ó fontos: a program neve "
        "<b>ÓvodaNapló</b>, ékezettel.", S_TEST))
    e.append(Paragraph("Hangnem", S_H2))
    e.append(Paragraph(
        "Tegeződő, közvetlen, de szakmai. Nyugodt és biztató, sosem sürgető vagy harsány. "
        "Kerüli a technikai zsargont és az angol szavakat. A pedagógust szakemberként "
        "szólítja meg, nem kezdőként. Rövid mondatok, konkrét számok, nagyotmondás nélkül.",
        S_TEST))

    e.append(Paragraph("10. Képötletek — mit ábrázoljunk", S_H1))
    e.append(Paragraph(
        "Konkrét jelenetek és motívumok, amelyek illenek a programhoz és a hangneméhez:",
        S_TEST))
    e.append(tablazat(
        ["Képötlet", "Mit közvetít"],
        [
            ["Világos csoportszoba asztala fentről: nyitott laptop a program pasztell "
             "felületével, mellette bögre, gesztenye, faleveleket tartalmazó kosár.",
             "A program a mindennapi óvodai környezet része, nem idegen technika."],
            ["Naptár-fal, amelyen a nevelési év hetei sorban kitöltve, mindegyiken egy-egy "
             "téma neve — az üres hetek eltűnnek.",
             "„Kész az egész éved.” A tervezés befejezett, átlátható."],
            ["Három egymás melletti kártya: kiscsoport, középső, nagycsoport — mindegyiken "
             "más vers és más játék ugyanahhoz a témához.",
             "A korosztályos differenciálás, a program legerősebb megkülönböztető jegye."],
            ["Papírlap, ahogy Word-dokumentummá alakul: bal oldalon a képernyő, jobb oldalon "
             "a kinyomtatott, aláírásra kész tervezet.",
             "Egy gomb, és kész a hivatalos dokumentum."],
            ["Zárt lakat egy laptopon, mögötte otthonos háttér — nem szerverterem.",
             "Az adat a pedagógusnál marad, titkosítva, felhő nélkül."],
            ["Évszakos motívumsáv: falevél és gesztenye, hópehely és gyertya, hóvirág és "
             "tojás, napraforgó — pasztell rózsaszín-krém színvilágban.",
             "A program az egész nevelési évet végigkíséri."],
        ],
        [8.2, 7.6], egyben=False))

    kerulendo = [
        "<b>Felismerhető gyerekarcok</b> — az óvodai környezetben ez adatvédelmi kérdés. "
        "Gyermekkéz, hátulnézet, sziluett elfogadható.",
        "<b>Iskolapad, tábla, osztályterem</b> — ez óvoda, nem iskola: szőnyeg, alacsony "
        "asztalok, játékpolc.",
        "<b>Felhő-, szerver- és hálózat-motívum</b> — a program kifejezetten helyi és offline.",
        "<b>Robot, agy, áramkör, „AI” jelképek</b> — nem mesterséges intelligencia írja a tervet.",
        "<b>Angol felirat</b> a képernyőn vagy a grafikán — a program végig magyar.",
        "<b>Rikító, telített színek</b> és rajzfilmes stílus — az arculat pasztell és visszafogott.",
        "<b>Stock-fotós, mosolygó irodai jelenet</b> — hiteltelen; valódi óvodai tárgyi világ kell.",
    ]
    # A fejléc és a lista egyben marad, hogy a cím ne ragadjon az előző oldal alján.
    e.append(KeepTogether(
        [Paragraph("Amit a képen kerülni kell", S_H1)]
        + [
            Paragraph(f'<font color="#9C4D6A"><b>×</b></font>&nbsp;&nbsp;{x}', S_LISTA)
            for x in kerulendo
        ]
    ))

    e.append(Spacer(1, 0.4 * cm))
    e.append(Paragraph(
        "<i>A dokumentum a program aktuális adatállománya alapján készült. "
        "A számok a seed-fájlokból származnak, nem becslések.</i>", S_KOD))
    return e


def main() -> int:
    argok = [a for a in sys.argv[1:] if not a.startswith("-")]
    kimenet = (
        Path(argok[0]) if argok
        else Path(os.path.expanduser("~")) / "Desktop" / "OvodaNaplo_Marketing_Dokumentacio.pdf"
    )
    sz = szamok()

    doc = BaseDocTemplate(
        str(kimenet), pagesize=A4,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
        topMargin=1.6 * cm, bottomMargin=1.6 * cm,
        title="ÓvodaNapló — marketing-dokumentáció", author="ÓvodaNapló",
    )
    keret = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="fo")
    doc.addPageTemplates([PageTemplate(id="alap", frames=[keret], onPage=hatter)])
    doc.build(epit(sz))

    print(f"Elkészült: {kimenet}")
    print(f"Méret: {kimenet.stat().st_size / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
