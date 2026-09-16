"""
OvodaNapló v2.7.0 — Használati útmutató PDF generátor.
Kimenet: C:/Users/Lenovo X1/Desktop/OvodaNaplo_Hasznalati_Utmutato.pdf
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Magyar ékezetes karakterek megjelenítéséhez TrueType font kell.
# A Windows beépített Arial/Calibri-jét használjuk.
FONT_CANDIDATES = [
    ("Arial", r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\arialbd.ttf",
     r"C:\Windows\Fonts\ariali.ttf"),
    ("Calibri", r"C:\Windows\Fonts\calibri.ttf", r"C:\Windows\Fonts\calibrib.ttf",
     r"C:\Windows\Fonts\calibrii.ttf"),
]

FONT_NAME = "Helvetica"  # fallback
FONT_BOLD = "Helvetica-Bold"
FONT_ITAL = "Helvetica-Oblique"

for name, reg, bold, ital in FONT_CANDIDATES:
    if os.path.exists(reg):
        try:
            pdfmetrics.registerFont(TTFont(name, reg))
            FONT_NAME = name
            if os.path.exists(bold):
                pdfmetrics.registerFont(TTFont(name + "-Bold", bold))
                FONT_BOLD = name + "-Bold"
            if os.path.exists(ital):
                pdfmetrics.registerFont(TTFont(name + "-Italic", ital))
                FONT_ITAL = name + "-Italic"
            break
        except Exception:
            continue

# ============================================================
# Stílusok
# ============================================================

styles = getSampleStyleSheet()

# Pasztell rózsaszín / mauve paletta (a OvodaNapló brand-jeivel összhangban)
ROZSASZIN = colors.HexColor("#D8A6B0")  # mauve-300
SAGE = colors.HexColor("#7C9A8F")  # sage-700
SAGE_LIGHT = colors.HexColor("#E8EFEC")  # sage-50
INK = colors.HexColor("#3A3438")  # ink
INK_60 = colors.HexColor("#7A6F73")
PAPER = colors.HexColor("#FAF7F5")
ACCENT = colors.HexColor("#B85A6E")  # sötétebb rózsaszín

cim_stilus = ParagraphStyle(
    name="Cim",
    parent=styles["Title"],
    fontName=FONT_BOLD,
    fontSize=28,
    leading=34,
    textColor=ACCENT,
    spaceAfter=12,
    alignment=TA_CENTER,
)

alcim_stilus = ParagraphStyle(
    name="Alcim",
    parent=styles["Normal"],
    fontName=FONT_ITAL,
    fontSize=14,
    leading=18,
    textColor=INK_60,
    spaceAfter=24,
    alignment=TA_CENTER,
)

h1_stilus = ParagraphStyle(
    name="H1",
    parent=styles["Heading1"],
    fontName=FONT_BOLD,
    fontSize=20,
    leading=26,
    textColor=ACCENT,
    spaceBefore=18,
    spaceAfter=10,
    keepWithNext=True,
)

h2_stilus = ParagraphStyle(
    name="H2",
    parent=styles["Heading2"],
    fontName=FONT_BOLD,
    fontSize=15,
    leading=20,
    textColor=SAGE,
    spaceBefore=12,
    spaceAfter=6,
    keepWithNext=True,
)

h3_stilus = ParagraphStyle(
    name="H3",
    parent=styles["Heading3"],
    fontName=FONT_BOLD,
    fontSize=12,
    leading=16,
    textColor=INK,
    spaceBefore=8,
    spaceAfter=4,
    keepWithNext=True,
)

szoveg_stilus = ParagraphStyle(
    name="Szoveg",
    parent=styles["Normal"],
    fontName=FONT_NAME,
    fontSize=10.5,
    leading=15,
    textColor=INK,
    spaceAfter=8,
    alignment=TA_JUSTIFY,
)

bullet_stilus = ParagraphStyle(
    name="Bullet",
    parent=szoveg_stilus,
    leftIndent=18,
    bulletIndent=6,
    spaceAfter=4,
)

tip_stilus = ParagraphStyle(
    name="Tip",
    parent=szoveg_stilus,
    fontName=FONT_ITAL,
    backColor=SAGE_LIGHT,
    borderColor=SAGE,
    borderWidth=0,
    borderPadding=8,
    leftIndent=8,
    rightIndent=8,
    spaceBefore=6,
    spaceAfter=12,
    textColor=INK,
)

kod_stilus = ParagraphStyle(
    name="Kod",
    parent=szoveg_stilus,
    fontName="Courier",
    fontSize=9,
    backColor=colors.HexColor("#F5F2F0"),
    borderPadding=4,
    leftIndent=8,
    rightIndent=8,
)

toc_stilus = ParagraphStyle(
    name="Toc",
    parent=szoveg_stilus,
    fontSize=11,
    leading=18,
    leftIndent=12,
    spaceAfter=2,
)


# ============================================================
# Helper-ek
# ============================================================

def p(text, style=szoveg_stilus):
    return Paragraph(text, style)

def h1(text):
    return Paragraph(text, h1_stilus)

def h2(text):
    return Paragraph(text, h2_stilus)

def h3(text):
    return Paragraph(text, h3_stilus)

def bullet(text):
    return Paragraph(f"• {text}", bullet_stilus)

def tip(text):
    return Paragraph(f"<b>💡 Tipp:</b> {text}", tip_stilus)

def figyelem(text):
    s = ParagraphStyle(name="Fig", parent=tip_stilus,
                       backColor=colors.HexColor("#FFF4E0"),
                       borderColor=colors.HexColor("#E0A040"))
    return Paragraph(f"<b>⚠ Figyelem:</b> {text}", s)

def szakasz_tabla(rows, col_widths=None):
    t = Table(rows, colWidths=col_widths or [4 * cm, 11 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
        ("FONTNAME", (0, 0), (0, -1), FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LEADING", (0, 0), (-1, -1), 13),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TEXTCOLOR", (0, 0), (0, -1), SAGE),
        ("TEXTCOLOR", (1, 0), (-1, -1), INK),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#E8DDD8")),
    ]))
    return t


# ============================================================
# Tartalom
# ============================================================

story = []

# CÍMLAP
story.append(Spacer(1, 4 * cm))
story.append(p("📚", ParagraphStyle(name="Emoji", fontSize=72, alignment=TA_CENTER, leading=80)))
story.append(Spacer(1, 0.5 * cm))
story.append(Paragraph("OvodaNapló", cim_stilus))
story.append(Paragraph("Pedagógiai műhely magyar óvodapedagógusoknak", alcim_stilus))

cimlap_info = Table(
    [
        ["Verzió:", "2.7.0"],
        ["Platform:", "Windows (Electron)"],
        ["Adattár:", "Lokális SQLite (felhőmentes)"],
        ["Készítő:", "Lisztmaier Gábor"],
    ],
    colWidths=[4 * cm, 8 * cm],
    hAlign="CENTER",
)
cimlap_info.setStyle(TableStyle([
    ("FONTNAME", (0, 0), (-1, -1), FONT_NAME),
    ("FONTNAME", (0, 0), (0, -1), FONT_BOLD),
    ("FONTSIZE", (0, 0), (-1, -1), 11),
    ("TEXTCOLOR", (0, 0), (0, -1), SAGE),
    ("TEXTCOLOR", (1, 0), (-1, -1), INK),
    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story.append(cimlap_info)
story.append(Spacer(1, 3 * cm))
story.append(p("HASZNÁLATI ÚTMUTATÓ",
              ParagraphStyle(name="x", fontSize=14, alignment=TA_CENTER,
                             textColor=SAGE, fontName=FONT_BOLD)))
story.append(PageBreak())

# TARTALOMJEGYZÉK
story.append(h1("Tartalomjegyzék"))
toc_items = [
    ("1.", "Bevezető — miről szól az OvodaNapló?", "3"),
    ("2.", "Telepítés és indítás", "4"),
    ("3.", "A felhasználói felület áttekintése", "5"),
    ("4.", "Első indítás — Beállítások", "6"),
    ("5.", "Naptár — a kezdő képernyő", "7"),
    ("6.", "Heti tervek készítése", "8"),
    ("7.", "Sablonok és az ötletbörze", "11"),
    ("8.", "Foglalkozás-tervezetek", "13"),
    ("9.", "Projektek (több hetes témák)", "15"),
    ("10.", "Reflexiók — visszatekintés a héten", "16"),
    ("11.", "Keresés — évek közötti FTS5 keresés", "17"),
    ("12.", "Irodalmi tár (383 mű)", "18"),
    ("13.", "Export — DOCX és PDF dokumentumok", "19"),
    ("14.", "Adatbiztonság — backup és adattár", "20"),
    ("15.", "Tippek a hatékony használathoz", "21"),
    ("16.", "Hibaelhárítás", "22"),
    ("17.", "Specifikációk és technikai részletek", "23"),
]
for num, cim, oldal in toc_items:
    story.append(Paragraph(
        f"<b>{num}</b>&nbsp;&nbsp;{cim}"
        f"<font color='#7A6F73'>&nbsp;&nbsp;&nbsp;…&nbsp;&nbsp;&nbsp;{oldal}</font>",
        toc_stilus,
    ))
story.append(PageBreak())

# ============================================================
# 1. BEVEZETŐ
# ============================================================
story.append(h1("1. Bevezető — miről szól az OvodaNapló?"))
story.append(p(
    "Az <b>OvodaNapló</b> egy magyar nyelvű, asztali alkalmazás óvodapedagógusok "
    "számára. A célja: <b>egy helyen</b> kezelje azt a teljes pedagógiai dokumentációt, "
    "amit eddig külön Word- és Excel-fájlokban, kézzel írt füzetekben vezetett "
    "a pedagógus."
))
story.append(p(
    "A program <b>lokálisan</b> fut a számítógépén — nincs felhő, nincs előfizetés, "
    "nincs internetkapcsolat. Az adatok a saját gépén tárolódnak, és csak Ön fér hozzájuk."
))

story.append(h2("Mit tud a program?"))
story.append(bullet("<b>Heti tervek</b> készítése előre összeállított sablonok alapján "
                    "(85 sablon, az óvodai év minden hetére)"))
story.append(bullet("<b>Ötletbörze</b> — 2310 konkrét pedagógiai ötlet "
                    "(téma × területek × korcsoport bontásban)"))
story.append(bullet("<b>Foglalkozás-tervezetek</b> részletes szerkesztése "
                    "(motiváció, fő rész, befejezés, eszközök, képességfejlesztés stb.)"))
story.append(bullet("<b>Projektek</b> — több hetes átfogó témák kezelése (pl. „Húsvét”, „Ősz”)"))
story.append(bullet("<b>Reflexiók</b> — heti vagy foglalkozás-szintű visszatekintés"))
story.append(bullet("<b>Irodalmi tár</b> — 383 magyar óvodás versek, mesék, mondókák, "
                    "korcsoport és téma szerint kereshetően"))
story.append(bullet("<b>Évek közötti keresés</b> — FTS5 teljes-szöveges keresés "
                    "minden heti tervben"))
story.append(bullet("<b>„Tavaly ilyenkor”</b> — emlékeztető a korábbi évek azonos heteinek "
                    "tartalmáról"))
story.append(bullet("<b>Téma-duplikáció figyelmeztetés</b> — figyelmeztet, ha már "
                    "alkalmazott egy témát az adott évben"))
story.append(bullet("<b>Képesség-rendszer</b> — 71 előre definiált pedagógiai képesség, "
                    "amelyeket a heti tervekhez rendelhet"))
story.append(bullet("<b>DOCX és PDF export</b> — a hivatalos minta-formátumok szerint"))
story.append(bullet("<b>Automatikus mentés</b> — minden változás azonnal SQLite adatbázisba kerül"))
story.append(bullet("<b>Automatikus backup</b> — napi mentés a megnyitáskor"))

story.append(h2("Kinek készült?"))
story.append(p(
    "Az alkalmazást elsősorban <b>aktívan tervező-dokumentáló óvodapedagógusok</b> "
    "számára terveztük, akik a tervezés és a reflexió folyamatát egy átlátható, "
    "magyar nyelvű felületen szeretnék kezelni — papír és kézzel írott napló helyett."
))
story.append(tip(
    "Az OvodaNapló nem cseréli le a kreativitást és a pedagógiai döntéseket — "
    "ezek mindig a pedagógus kezében maradnak. A program azonban segít: gyors "
    "sablon-választással, ötletbankkal, automatizált összegzéssel és kényelmes "
    "kereséssel sok időt takarít meg."
))
story.append(PageBreak())

# ============================================================
# 2. TELEPÍTÉS
# ============================================================
story.append(h1("2. Telepítés és indítás"))

story.append(h2("Rendszerkövetelmények"))
rendszer = szakasz_tabla([
    ["Operációs rendszer", "Windows 10 vagy 11 (64-bit)"],
    ["RAM", "Minimum 4 GB, ajánlott 8 GB"],
    ["Lemezterület", "200 MB szabad hely + az adatbázis méretéhez (jellemzően 50 MB / év)"],
    ["Felbontás", "Minimum 1280×800, ajánlott 1920×1080"],
    ["Internet", "NEM szükséges — minden lokálisan fut"],
])
story.append(rendszer)

story.append(h2("Telepítés"))
story.append(p(
    "Az OvodaNaplót <b>nem kell hagyományosan telepíteni</b> — egy mappás, "
    "hordozható (portable) változat formájában jut el Önhöz:"
))
story.append(bullet("Másolja át az <b>OvodaNapló</b> mappát egy tetszőleges helyre "
                    "(pl. <i>Dokumentumok</i> vagy <i>C:\\Programok</i>)"))
story.append(bullet("Nyissa meg a mappát, és kattintson duplán az <b>OvodaNapló.exe</b> fájlra"))
story.append(bullet("A program azonnal elindul — első indításkor néhány másodperc az "
                    "adatbázis inicializálása"))

story.append(h2("Asztali parancsikon"))
story.append(p(
    "Az új gépre települt változat egy <b>asztali parancsikont</b> hoz létre "
    "(OvodaNapló.lnk), így a programot az asztalról egy kattintással indíthatja. "
    "Ha a parancsikon hiányzik, jobb-klikkel az <b>OvodaNapló.exe</b>-re kattintva "
    "újra létrehozható (<i>Küldés → Asztal (Parancsikon létrehozása)</i>)."
))

story.append(h2("Az adattár helye"))
story.append(p("A program a saját felhasználói profilján belül tárolja az adatokat:"))
story.append(Paragraph(
    "<font face='Courier' size='9'>"
    "C:\\Users\\&lt;felhasználónév&gt;\\AppData\\Roaming\\ovodanaplo\\"
    "</font>",
    kod_stilus,
))
story.append(p(
    "Ez a mappa tartalmazza az <b>ovodanaplo.db</b> SQLite adatbázist, "
    "a backup-okat, és a beállításokat. <b>Beállítások → Adattár megnyitása</b> "
    "gombbal közvetlenül elérhető."
))
story.append(figyelem(
    "Ha a programot egy másik gépre szeretné átvinni, NE csak az exe-t másolja, "
    "hanem az AppData\\Roaming\\ovodanaplo mappát is — itt vannak az adatai!"
))
story.append(PageBreak())

# ============================================================
# 3. FELÜLET
# ============================================================
story.append(h1("3. A felhasználói felület áttekintése"))

story.append(p(
    "Az OvodaNapló <b>pasztell rózsaszín</b> színpalettájú, kellemes, „papírszerű” "
    "felülettel dolgozik. A bal oldalon függőleges menü, a többi rész a kiválasztott "
    "oldal tartalma."
))

story.append(h2("Főmenü (bal oldali sáv)"))
menu_tabla = szakasz_tabla([
    ["Naptár", "Az aktuális hónap heti tervei kalendáriumos nézetben — innen indul minden."],
    ["Heti tervek", "Az aktuális vagy egy kiválasztott hét részletes tervezete."],
    ["Projektek", "Több hetes átfogó témák listája és szerkesztője."],
    ["Reflexiók", "A heti és projekt-reflexiók listája szűrhetően."],
    ["Keresés", "Évek közötti teljes-szöveges keresés a tervekben."],
    ["Irodalom", "A 383 művet tartalmazó óvodás irodalmi tár."],
    ["Beállítások", "Pedagógus adatok, csoport, backup és adattár-elérés."],
])
story.append(menu_tabla)

story.append(h2("Jellemző UI-elemek"))
story.append(bullet("<b>Pasztell zöld gomb</b> — pozitív akció (mentés, új létrehozás)"))
story.append(bullet("<b>Halvány szürke gomb</b> — másodlagos akció (mégse, vissza)"))
story.append(bullet("<b>🗑 piros ikon</b> — törlés (mindig confirm-dialóggal!)"))
story.append(bullet("<b>✏ ceruza ikon</b> — szerkesztés"))
story.append(bullet("<b>📋 ikon</b> — másolás"))
story.append(bullet("<b>💭 idézőjel ikon</b> — „Tavaly ilyenkor” emlékeztető"))
story.append(bullet("<b>Pill / chip</b> — kategória-címke (pl. mese, vers, ének)"))

story.append(h2("Billentyűparancsok"))
story.append(bullet("<b>Ctrl + S</b> — Mentés (ahol releváns)"))
story.append(bullet("<b>Ctrl + F</b> — Keresés mező-fókusz (Keresés oldalon)"))
story.append(bullet("<b>Tab / Shift+Tab</b> — Mezők közti navigáció"))
story.append(bullet("<b>Esc</b> — Modális ablak bezárása"))
story.append(PageBreak())

# ============================================================
# 4. BEÁLLÍTÁSOK
# ============================================================
story.append(h1("4. Első indítás — Beállítások"))

story.append(p(
    "Az első indításnál a legfontosabb tennivaló a saját <b>pedagógusi adatainak</b> "
    "beállítása. Ezek az adatok automatikusan beleíródnak minden generált DOCX és "
    "PDF dokumentumba (heti terv, foglalkozás-tervezet, projektterv)."
))

story.append(h2("Kötelező mezők"))
beall_tabla = szakasz_tabla([
    ["Pedagógus neve", "Az Ön teljes neve, ahogy a dokumentumokban szerepelnie kell"],
    ["Óvoda neve", "Az intézmény hivatalos neve"],
    ["Óvoda címe", "Teljes postai cím (utca, házszám, település, irányítószám)"],
    ["Csoport neve", "A csoportja egyéni neve (pl. „Katica”, „Pillangó”, „Napsugár”)"],
    ["Csoport típusa", "Vegyes (3–7), Kicsi (3–4), Középső (4–5) vagy Nagy (5–7)"],
])
story.append(beall_tabla)

story.append(p(
    "A <b>csoport típusa</b> különösen fontos: ez határozza meg, hogy az ötletbörzében "
    "milyen korcsoport-specifikus ötleteket lát. Vegyes csoportnál a teljes tartomány "
    "(3–7 éves) elérhető."
))

story.append(h2("További funkciók a Beállítások oldalon"))
story.append(bullet("<b>App verzió</b> — az aktuálisan futó program verziószáma "
                    "(jelenleg: <b>2.7.0</b>)"))
story.append(bullet("<b>Adattár megnyitása (Intéző)</b> — egy kattintással eljuthat "
                    "az AppData mappához, ahol az adatbázis és a backup-ok találhatók"))
story.append(bullet("<b>Manuális backup most</b> — bármikor elkészíthet egy biztonsági "
                    "mentést az aktuális állapotról"))

story.append(tip(
    "Töltse ki minden mezőt, mielőtt elkezdene heti terveket készíteni. "
    "Így a generált dokumentumok azonnal hivatalos formában lesznek készre — "
    "nem kell utólag kézzel beleírni a fejlécbe!"
))
story.append(PageBreak())

# ============================================================
# 5. NAPTÁR
# ============================================================
story.append(h1("5. Naptár — a kezdő képernyő"))

story.append(p(
    "A program indításkor a <b>Naptár</b> oldal jelenik meg — itt látja az "
    "aktuális hónap heti terveit egy kalendáriumos elrendezésben."
))

story.append(h2("Mit lát a Naptár oldalon?"))
story.append(bullet("<b>Hónapnavigáció</b> — előre/hátra a hónapok között"))
story.append(bullet("<b>Nevelési év választó</b> — a több éven át használt programban "
                    "válthat a 2024/25, 2025/26 stb. évek között"))
story.append(bullet("<b>Heti kártyák</b> — minden hét egy-egy kártya, a hét témájával, "
                    "dátumtartományával, és a kapcsolódó tartalom-jelzőkkel "
                    "(reflexió van-e, hány foglalkozás-tervezet, stb.)"))
story.append(bullet("<b>Hiányzó hetek</b> — a tervezetlen hetek halvány kerettel jelennek "
                    "meg, „+ Új heti terv” gombbal"))
story.append(bullet("<b>Ünnepek</b> — a magyar állami és iskolai ünnepek színes "
                    "csíkkal kiemelve"))

story.append(h2("Új heti terv készítése a Naptárból"))
story.append(p("Két módon kezdhet új heti tervet:"))
story.append(bullet("Egy üres hét „+ Új heti terv” gombjára kattintva → előre kitöltött "
                    "kezdő dátummal nyílik a HetiTerv oldal"))
story.append(bullet("A felül lévő „+ Új heti terv” gombbal → szabadon választhat dátumot"))

story.append(h2("Egész év generálása sablonokból"))
story.append(p(
    "A Naptár tetején található egy különleges funkció: <b>„Évi tervek generálása "
    "sablonból”</b>. Ezzel egyetlen kattintással létrehozhatja a teljes "
    "nevelési év heti terveit a 85 előre kidolgozott sablon alapján — mindegyik "
    "héthez a hozzá leginkább illő témát rendeli a program (hónapra, ünnepekre stb. "
    "tekintettel)."
))
story.append(figyelem(
    "Az „Évi tervek generálása” csak akkor működik, ha még nincs heti terv "
    "az adott évre. Meglévő tervek nem íródnak felül."
))
story.append(PageBreak())

# ============================================================
# 6. HETI TERVEK
# ============================================================
story.append(h1("6. Heti tervek készítése"))

story.append(p(
    "A <b>heti terv</b> az OvodaNapló legrészletesebb és leggyakrabban használt "
    "felülete. Itt rögzíti a hét pedagógiai célját, témáját, és területenként "
    "(énekes-játék, vers-mese, matematika stb.) a konkrét tervet."
))

story.append(h2("Alap-mezők"))
alap_tabla = szakasz_tabla([
    ["Kezdő/záró dátum", "A hét két határa (alapból a hétfő–péntek)"],
    ["Téma", "A hét egységes témája (pl. „Ősz erdejében”)"],
    ["Cél", "A heti pedagógiai cél megfogalmazása"],
    ["Feladat", "Konkrét feladatok, amelyek a célt szolgálják"],
    ["Differenciálás", "Hogyan differenciál — alapszöveg adva, szabadon szerkeszthető"],
    ["Módszerek", "Választható: bemutatás, magyarázat, gyakorlás, stb."],
    ["Eszközök", "A héten használt eszközök listája (automatikusan aggregált)"],
])
story.append(alap_tabla)

story.append(h2("Területek (a 7 tevékenységi forma)"))
story.append(p(
    "A heti terv lényege a <b>7 területre</b> bontott tartalom. Minden területnek "
    "saját szekciója van a héti terv-szerkesztőben:"
))
teruletek = szakasz_tabla([
    ["1. Vers, mese", "Versek, mesék, mondókák — irodalmi anyag a héten"],
    ["2. Ének-zene", "Dalok, mondókák, énekes játékok, hangszerhasználat"],
    ["3. Rajzolás, kézművesség", "Vizuális tevékenység — festés, gyurma, papírmunka"],
    ["4. Mozgás", "Testnevelés, mozgásos játékok, finom-mozgás"],
    ["5. Külső világ", "Természetismeret, környezeti megfigyelés, kísérlet"],
    ["6. Matematika", "Számfogalom, mennyiségi, mértani gondolkodás"],
    ["7. Játék, munka", "Szabad játék, csoportos játék, munkajellegű tevékenység"],
])
story.append(teruletek)

story.append(p(
    "Minden területnek <b>saját bekezdés-szerkesztője</b> van. Tetszőleges hosszúságú "
    "szöveg, lista, vagy strukturált bekezdés írható bele."
))

story.append(h2("Mentés és változások"))
story.append(p(
    "A heti terv minden mezője <b>automatikusan mentődik</b> a kattintás után "
    "(focus-out), vagy a felül látható <b>„Mentés”</b> gombbal explicit módon is. "
    "A sikeres mentés után rövid „✓ Mentve” visszajelzést kap."
))

story.append(h2("Másolás előző hétről"))
story.append(p(
    "Új heti terv készítésekor (vagy meglévő esetén is) használhatja a <b>„📋 Másolás "
    "előző hétről”</b> funkciót:"
))
story.append(bullet("Felugró ablak: válasszon az utolsó 10 heti tervből"))
story.append(bullet("A program átmásolja az összes területet, célt, feladatot, "
                    "iskola-előkészítőt"))
story.append(bullet("A téma elé „(másolat)” jelölés kerül, hogy láthatóan különbözzön"))
story.append(bullet("Ezután szabadon szerkesztheti a tartalmat az aktuális héthez"))

story.append(h2("Heti terv törlése"))
story.append(p(
    "Egy heti terv törléséhez a HetiTerv-oldal jobb felső sarkában található piros "
    "<b>🗑 Törlés</b> gomb, vagy a Naptár-oldal kártyáján a kontextus-menü. A törlés "
    "konfirmációt kér, és <b>tranzakcióban kaszkádol</b>: a hozzá tartozó területek, "
    "foglalkozás-tervezetek és reflexiók is törlődnek."
))
story.append(figyelem(
    "A törlés visszavonhatatlan. Ha nem biztos benne, készítsen előtte manuális "
    "backup-ot a Beállításokban."
))
story.append(PageBreak())

# ============================================================
# 7. SABLONOK ÉS ÖTLETBÖRZE
# ============================================================
story.append(h1("7. Sablonok és az ötletbörze"))

story.append(p(
    "Az OvodaNapló <b>85 sablonja</b> és <b>2310 ötlete</b> a program szíve. "
    "Ezek mind az óvodai év konkrét időszakaira (hónapokra, ünnepekre) szabottak, "
    "és magyar pedagógiai szakirodalomra támaszkodnak."
))

story.append(h2("A sablon-választó"))
story.append(p(
    "Új heti terv (vagy üres heti terv) megnyitásakor megjelenik a "
    "<b>sablon-választó</b>. Itt:"
))
story.append(bullet("Az adott hónapra ajánlott sablonok közül választhat"))
story.append(bullet("Minden sablon mutat egy rövid bevezetőt, témát, célt"))
story.append(bullet("A „⭐ Legjobban ajánlott” jelzéssel az aktuális dátumra legjobb "
                    "sablon jelölve van"))
story.append(bullet("A „Sablon alkalmazása” gomb átmásolja a sablon tartalmát a "
                    "heti tervbe — területenként, célok, feladatok mind"))

story.append(tip(
    "Akkor is felhasználhatja a sablon-választót, ha már korábban kezdte el a "
    "tervet — a v2.7.0-tól megnyitható meglévő terven is. A program rákérdez, "
    "hogy felülírja-e a meglévő tartalmat."
))

story.append(h2("Az ötletbörze panel"))
story.append(p(
    "Minden terület mellett található egy <b>„💡 Ötletek”</b> gomb. Erre kattintva "
    "egy oldalpanel nyílik a 2310 ötlet közül a témához és területhez illő bullet-ek "
    "listájával."
))
story.append(h3("Az ötletbörze szerkezete"))
story.append(bullet("<b>Téma × Terület × Korcsoport</b> bontás"))
story.append(bullet("Egy területre ~10 konkrét bullet (rövid, pedagógiailag használható)"))
story.append(bullet("A bullet-ek átmásolhatók a heti terv adott területébe"))
story.append(bullet("Bármely bullet szerkeszthető a heti tervben — a program nem "
                    "korlátozza a kreativitását"))

story.append(h3("Korcsoport-specifikus szűrés"))
story.append(p(
    "A v2.7.0 jelenlegi „Fázis B”-jében a 2310 ötlet <b>kor-marker tag-ekkel</b> "
    "van ellátva (pl. „ujj-festés” = kicsi, „memoriter” = nagy). A kiválasztott "
    "csoport-típus alapján a program <b>kiemelten</b> mutatja a kornak megfelelő "
    "bullet-eket, de mindet megnézheti."
))

story.append(h2("Téma-duplikáció figyelmeztetés"))
story.append(p(
    "Ha sablont választ vagy témát ad meg, és az az évben már szerepelt egy másik "
    "héten, a program figyelmeztet:"
))
story.append(p(
    "<i>„Figyelem: a(z) ’Ősz erdejében’ témát már alkalmazta 2025-09-22 hetén. "
    "Szeretne egy alternatív sablont választani?”</i>",
    ParagraphStyle(name="ex", parent=szoveg_stilus, leftIndent=16,
                   fontName=FONT_ITAL, textColor=INK_60)
))
story.append(bullet("A program automatikusan ajánl egy alternatív sablont, ha van "
                    "(V2 ha V1-et használt, vagy fordítva)"))
story.append(bullet("A figyelmeztetés <b>nem kötelezi</b> a változtatásra — szabadon "
                    "folytathatja a tervet"))

story.append(h2("„Tavaly ilyenkor” emlékeztető"))
story.append(p(
    "Ha legalább egy teljes nevelési évet vezetett az OvodaNaplóban, a heti "
    "terv oldal jobb alján megjelenik egy <b>„💭 Tavaly ilyenkor”</b> panel:"
))
story.append(bullet("A korábbi évek azonos időszakának (±3 nap) heti terveit listázza"))
story.append(bullet("Egy kattintással megnyithatja a tavalyi tervet referenciaként"))
story.append(bullet("Kiváló az ismétlődő ünnepekhez (Mikulás, Karácsony, Húsvét)"))
story.append(PageBreak())

# ============================================================
# 8. FOGLALKOZÁS-TERVEZETEK
# ============================================================
story.append(h1("8. Foglalkozás-tervezetek"))

story.append(p(
    "Míg a <b>heti terv</b> az adott hét egész tartalmát átfogja, a "
    "<b>foglalkozás-tervezet</b> egy <b>konkrét foglalkozás</b> részletes leírása. "
    "A program a hivatalos foglalkozás-tervezet sémát követi."
))

story.append(h2("Új foglalkozás-tervezet készítése"))
story.append(p(
    "Egy heti terv jobb oldali kártyáján megtalálja a kapcsolódó foglalkozás-tervezetek "
    "listáját és a <b>„+ Új foglalkozás-tervezet”</b> linket. Erre kattintva "
    "a FoglalkozasSzerkeszto oldal nyílik meg."
))

story.append(h2("Mezők — a hivatalos séma"))
fogl_tabla = szakasz_tabla([
    ["Pedagógus neve", "A Beállításokból automatikusan kitöltve"],
    ["Helyszín", "Pl. „csoportszoba”, „udvar”, „tornaterem”"],
    ["Időpont", "Dátum + időtartomány (pl. 2026-05-13 9:00–9:30)"],
    ["Csoport", "Csoport neve és típusa (Beállításokból)"],
    ["Tevékenységi forma", "Vers-mese, ének-zene, vizuális, mozgás stb. (7 kategória)"],
    ["Téma", "A foglalkozás konkrét témája"],
    ["Cél", "A foglalkozás célja"],
    ["Feladat", "Konkrét feladatok"],
    ["Korcsoport", "3–4, 4–5, 5–7, vagy vegyes"],
    ["Időtartam", "Percben"],
    ["Eszközök", "A foglalkozáshoz szükséges összes eszköz"],
    ["Motiváció", "Hogyan vezeti be — első percek"],
    ["Fő rész", "A foglalkozás középpontja"],
    ["Befejezés", "Lezáró tevékenység, levezetés"],
    ["Munkaforma", "Egyéni, kiscsoportos, frontális"],
    ["Módszerek", "Bemutatás, magyarázat, beszélgetés, játék stb."],
    ["Differenciálás", "Hogyan illeszti különböző korú/szintű gyerekekhez"],
    ["Képességfejlesztés", "Mely képességek fejlődnek a foglalkozáson"],
    ["Iskola-előkészítő szempontok", "A nagycsoportos / iskolára felkészítő szempontok "
                                       "(v2.7.0 új mező!)"],
])
story.append(fogl_tabla)

story.append(h2("Foglalkozás-tervezet törlése"))
story.append(p(
    "A heti terv oldalán a foglalkozás-tervezet sora <b>hover-on</b> mutat egy "
    "<b>🗑 ikont</b>. Erre kattintva, confirm-dialógus után törlődik a tervezet "
    "és minden hozzá tartozó reflexió (tranzakcióban)."
))

story.append(h2("Export DOCX-be"))
story.append(p(
    "A FoglalkozasSzerkeszto jobb felső sarkában található <b>„DOCX export”</b> "
    "gomb. A generált .docx fájl megfelel az óvodai foglalkozás-tervezet hivatalos "
    "formátumának, és tartalmazza a Beállításokban megadott pedagógusi adatokat."
))
story.append(PageBreak())

# ============================================================
# 9. PROJEKTEK
# ============================================================
story.append(h1("9. Projektek (több hetes átfogó témák)"))

story.append(p(
    "A <b>projekt</b> egy több hetes átfogó pedagógiai téma — például „Olvasni jó”, "
    "„Húsvét”, „Ősz”, „Foglalkozások bemutatása”. Egy projekthez több heti terv "
    "tartozhat, közös céllal és témával."
))

story.append(h2("Új projekt létrehozása"))
story.append(p(
    "<b>Projektek oldal</b> → <b>„+ Új projekt”</b> gomb → megnyílik a részletes "
    "ProjektSzerkeszto oldal (19 mezős hivatalos formátum)."
))

story.append(h2("A projekt mezői"))
projekt_tabla = szakasz_tabla([
    ["Cím", "A projekt megnevezése (pl. „Olvasni jó”)"],
    ["Időtartam", "Kezdő és záró dátum"],
    ["Cél", "A projekt pedagógiai célja"],
    ["Téma", "Központi téma, ami összeköti a heteket"],
    ["4 fő feladat", "A projektet alkotó négy fő feladat (séma szerint)"],
    ["Bevontak", "Kik vesznek részt — pedagógus, gyerekek, szülők, vendég"],
    ["Előkészületek", "Mit kell beszerezni / előkészíteni"],
    ["Alkotó tevékenységek", "Művészeti és kézműves elemek"],
    ["Játékok", "Beépített játékok listája"],
    ["Szabályok", "Csoport-szabályok, beleegyezések"],
    ["Produktumok", "Mit hoz létre a projekt végére (kiállítás, könyv, előadás)"],
    ["Munka", "Munkajellegű tevékenységek"],
    ["Eszközök", "Összes eszköz aggregálva"],
    ["IE összesített", "Iskola-előkészítő szempontok átfogóan"],
    ["Szokások", "Új szokások, amelyeket a projekt bevezet"],
])
story.append(projekt_tabla)

story.append(h2("Projekt összekapcsolása heti tervvel"))
story.append(p(
    "Egy heti terv készítésekor megadhatja, hogy az adott hét egy <b>projekt része-e</b>. "
    "A projekt-választó listából választhat. A kapcsolat kétirányú:"
))
story.append(bullet("A heti terven látszik, hogy melyik projekt része"))
story.append(bullet("A projekt-szerkesztőn látszik, hogy mely hetekkel van összekötve"))

story.append(h2("Projekt törlése"))
story.append(p(
    "A Projektek oldalon minden projekt-kártya jobb oldalán található <b>🗑 Törlés</b> "
    "gomb. A törlés confirm-dialógust kér, és:"
))
story.append(bullet("Törli a projekthez kötött <b>reflexiókat</b>"))
story.append(bullet("A kapcsolódó <b>heti tervek MEGMARADNAK</b>, csak a projekt-kapcsolat "
                    "szűnik meg (a heti tervek önállóan is teljes értékűek)"))
story.append(bullet("Maga a projekt rekord törlődik"))

story.append(h2("Export DOCX-be"))
story.append(p(
    "A projekt-szerkesztő jobb felső sarkában található <b>„DOCX export”</b> gomb "
    "egy a hivatalos „Könyv projektterv.docx” sémának megfelelő dokumentumot generál."
))
story.append(PageBreak())

# ============================================================
# 10. REFLEXIÓK
# ============================================================
story.append(h1("10. Reflexiók — visszatekintés a héten"))

story.append(p(
    "A <b>reflexió</b> az adott hét, foglalkozás vagy projekt pedagógusi értékelése. "
    "„Hogyan ment? Mit tanultam? Mit változtatnék?” — ezt a folyamatos tanulást "
    "támogatja a program."
))

story.append(h2("Háromféle reflexió"))
ref_tabla = szakasz_tabla([
    ["Heti reflexió", "Egy egész hét értékelése — a HetiReflexio oldalon érhető el "
                       "minden héti tervhez"],
    ["Foglalkozás-reflexió", "Egy konkrét foglalkozás-tervezet végrehajtásának értékelése"],
    ["Projekt-reflexió", "Egy projekt zárása utáni átfogó értékelés"],
])
story.append(ref_tabla)

story.append(h2("Reflexió írása"))
story.append(bullet("Heti tervről: <b>„Reflexió”</b> gomb a HetiTerv oldalon"))
story.append(bullet("Foglalkozás-tervezetről: a tervezet oldalon a reflexió-szekció"))
story.append(bullet("Projekt-reflexió: a projekt-szerkesztőn"))

story.append(h2("A reflexió mezői"))
story.append(bullet("<b>Tartalom</b> — szabad-szöveges értékelés"))
story.append(bullet("<b>Terület típusa</b> — opcionális, mely területre vonatkozik "
                    "(vers-mese, ének, stb.)"))
story.append(bullet("<b>Források</b> — opcionális, irodalmi hivatkozások, ötletek "
                    "forrásai"))
story.append(bullet("<b>Létrehozás dátuma</b> — automatikusan rögzítve"))

story.append(h2("Reflexiók listája"))
story.append(p(
    "A főmenü <b>„Reflexiók”</b> oldalán minden eddig írt reflexió listáját látja:"
))
story.append(bullet("Szűrhető <b>típus</b> szerint (heti / foglalkozás / projekt)"))
story.append(bullet("Szűrhető <b>dátum</b> szerint"))
story.append(bullet("Minden reflexió sorának <b>„Szerkesztés”</b> linkje a megfelelő "
                    "tervhez visz"))
story.append(bullet("Egyedi reflexió-törlés is lehetséges (v2.7.0 új funkció!)"))

story.append(tip(
    "A reflexió írása nem csak pedagógiai követelmény — saját tanulási eszközévé is "
    "válhat. Ha rendszeresen reflektál, év végén látja a fejlődését, és a "
    "„Tavaly ilyenkor” emlékeztető a régi reflexiókat is megmutatja!"
))
story.append(PageBreak())

# ============================================================
# 11. KERESÉS
# ============================================================
story.append(h1("11. Keresés — évek közötti FTS5 keresés"))

story.append(p(
    "A <b>Keresés</b> oldal SQLite FTS5 teljes-szöveges keresőjével <b>egy-két "
    "ezredmásodperc</b> alatt megtalálja, hogy egy adott szó vagy kifejezés "
    "<b>melyik heti tervben</b> szerepelt — akár évekre visszamenőleg."
))

story.append(h2("Mit indexel a program?"))
story.append(bullet("Heti terv minden szöveges mezője: téma, cél, feladat, módszerek, "
                    "differenciálás, eszközök"))
story.append(bullet("Mind a 7 terület tartalma"))
story.append(bullet("Foglalkozás-tervezetek és projektek (bővítés folyamatban)"))

story.append(h2("Keresés használata"))
story.append(bullet("<b>Egyszerű keresés</b>: írja be a kulcsszót (pl. „mézeskalács”)"))
story.append(bullet("<b>Több szó</b>: AND-elve keres (összes szó megtalálható)"))
story.append(bullet("<b>Frázis-keresés</b>: tegye idézőjelbe (pl. \"szín és forma\")"))
story.append(bullet("<b>Ékezet-tolerancia</b>: az SQLite FTS5 magyar Unicode-érzékenyen "
                    "keres"))

story.append(h2("Találatok megjelenítése"))
story.append(p(
    "A találatok lista-formátumban jelennek meg, mindegyik kártyán:"
))
story.append(bullet("A heti terv <b>témája</b> és <b>dátuma</b>"))
story.append(bullet("A találat <b>kontextusa</b> — előtte/utána ~30 karakter"))
story.append(bullet("A találat <b>helye</b> (melyik mező / terület)"))
story.append(bullet("Egy kattintással <b>megnyitható</b> az adott heti terv"))

story.append(tip(
    "A keresés különösen hasznos visszamenőlegesen: év elején eszébe jut, hogy "
    "tavaly volt egy jó mézeskalács-projekt, és pár másodperc alatt megtalálja "
    "az akkori heti terveket és reflexiókat."
))
story.append(PageBreak())

# ============================================================
# 12. IRODALOM
# ============================================================
story.append(h1("12. Irodalmi tár (383 mű)"))

story.append(p(
    "Az OvodaNapló <b>383 valódi magyar óvodás irodalmi művet</b> tartalmaz: "
    "verseket, meséket, mondókákat, kiszámolókat. Mind ellenőrzött, valós alkotás "
    "— a program <b>SOSEM generál ki nem létező irodalmat</b>!"
))

story.append(h2("Az irodalmi tár tartalma"))
story.append(bullet("<b>Versek</b> (~150) — pl. Weöres Sándor, Móricz Zsigmond, "
                    "Nemes Nagy Ágnes, Devecseri Gábor, Zelk Zoltán művei"))
story.append(bullet("<b>Mesék</b> (~120) — Benedek Elek, Móra Ferenc, Lev Tolsztoj "
                    "feldolgozásai stb."))
story.append(bullet("<b>Mondókák</b> (~70) — népi gyűjtésű, ősi mondókák"))
story.append(bullet("<b>Kiszámolók és játékok</b> (~43) — szövegekkel"))

story.append(h2("Kategorizálás"))
story.append(p("Minden mű ellátva:"))
story.append(bullet("<b>Típus</b>: vers / mese / mondóka / kiszámoló / játék"))
story.append(bullet("<b>Forrás</b>: szerző, kötet, gyűjtemény"))
story.append(bullet("<b>Korcsoport</b>: 3–4 / 4–5 / 5–7 / vegyes"))
story.append(bullet("<b>Témák</b>: pl. ősz, tavasz, állatok, család, ünnepek, "
                    "barátság, érzelmek"))
story.append(bullet("<b>Teljes szöveg</b> (a közdomén művek esetén)"))

story.append(h2("Keresés és szűrés"))
story.append(bullet("Cím / szerző alapján gyors keresés"))
story.append(bullet("Téma-szűrő (multi-select)"))
story.append(bullet("Korcsoport-szűrő"))
story.append(bullet("Típus-szűrő"))

story.append(h2("Saját irodalom hozzáadása"))
story.append(p(
    "Az „Új irodalom hozzáadása” gombbal feltöltheti a saját, helyileg kedvelt "
    "verseit, meséit. Ezek megkülönböztetve jelennek meg (külön ikon), és "
    "ugyanúgy szűrhetők, kereshetők, és a heti tervek vers-mese vagy "
    "ének-zene területébe beilleszthetők."
))

story.append(h2("Autocomplete a heti tervben"))
story.append(p(
    "A heti terv <b>vers-mese</b> és <b>ének-zene</b> területein, ha legalább "
    "2 karaktert ír be, megjelenik egy <b>autocomplete-lista</b> a 383 mű "
    "találataiból (max. 10). <b>Tab</b> vagy <b>Enter</b> beilleszti a teljes művet."
))
story.append(PageBreak())

# ============================================================
# 13. EXPORT
# ============================================================
story.append(h1("13. Export — DOCX és PDF dokumentumok"))

story.append(p(
    "Az OvodaNapló a tartalmait <b>professzionális Word (.docx)</b> és <b>PDF</b> "
    "dokumentumokká exportálja. Ezek a fájlok közvetlenül szakmai szemlén bemutathatók, "
    "vagy hivatalos dokumentációként archiválhatók."
))

story.append(h2("Heti terv DOCX export"))
story.append(p(
    "A HetiTerv oldal jobb felső sarkán <b>„📄 DOCX export”</b> gomb. A kapott "
    "fájl tartalma:"
))
story.append(bullet("Fejléc: óvoda neve, címe, pedagógus neve, csoport (Beállításokból)"))
story.append(bullet("A hét dátum-tartománya, témája, célja, feladatai"))
story.append(bullet("Differenciálás, módszerek táblázatban"))
story.append(bullet("Mind a 7 terület külön szekcióban"))
story.append(bullet("Eszközlista aggregálva"))
story.append(bullet("Képességek (ha vannak hozzárendelve)"))

story.append(h2("Foglalkozás-tervezet DOCX export"))
story.append(p(
    "A FoglalkozasSzerkeszto „📄 DOCX export” gombja a hivatalos óvodai "
    "foglalkozás-tervezet formátumát generálja, az összes 19 mezővel."
))

story.append(h2("Projektterv DOCX export"))
story.append(p(
    "A Projekt-szerkesztő „📄 DOCX export” gombja a hivatalos „Könyv projektterv.docx” "
    "sémának megfelelő dokumentumot generál."
))

story.append(h2("PDF export"))
story.append(p(
    "PDF-be exportáláshoz a programnak van egy általános <b>„PDF export”</b> "
    "funkciója a heti terv oldalán. Ez a DOCX-ot generálja először, majd "
    "automatikusan PDF-fé konvertálja (Electron beépített funkció)."
))

story.append(tip(
    "A DOCX kimenetet a Microsoft Word-ben még szerkesztheti, mielőtt nyomtatja "
    "vagy beadja — a program a kiindulási formátumot adja, az utolsó simítás "
    "a tiéd."
))

story.append(h2("Hová kerülnek a fájlok?"))
story.append(p(
    "Minden export-műveletnél megnyílik a Windows <b>„Mentés mint”</b> párbeszédpanel, "
    "ahol kiválaszthatja a célmappát. Az alapértelmezett mappa az utoljára "
    "használt hely, vagy első alkalommal a <i>Dokumentumok</i> mappa."
))
story.append(PageBreak())

# ============================================================
# 14. BACKUP
# ============================================================
story.append(h1("14. Adatbiztonság — backup és adattár"))

story.append(p(
    "Az OvodaNapló minden adata <b>egyetlen SQLite fájlban</b> tárolódik: "
    "<b>ovodanaplo.db</b>. Ez a fájl tartalmazza a heti terveket, projekteket, "
    "reflexiókat, foglalkozás-tervezeteket, és a saját irodalmi bővítéseket."
))

story.append(h2("Automatikus napi backup"))
story.append(p(
    "A program <b>indításkor automatikusan</b> ellenőrzi, hogy készült-e ma backup, "
    "és ha nem, létrehoz egyet:"
))
story.append(Paragraph(
    "<font face='Courier' size='9'>"
    "C:\\Users\\&lt;Ön&gt;\\AppData\\Roaming\\ovodanaplo\\backups\\"
    "ovodanaplo-2026-05-13.db"
    "</font>",
    kod_stilus,
))
story.append(p(
    "A backup mappa a régi mentéseket is megtartja. A v2.7.0 óta a backup-készítés "
    "<b>atomikus</b>: tmp fájlba másol, majd átnevezi (ON DELETE CASCADE szinten), "
    "és minimum 10 KB méret-ellenőrzéssel megakadályozza a részleges hibás backup-okat."
))

story.append(h2("Manuális backup"))
story.append(p(
    "Bármikor készíthet manuális backup-ot:"
))
story.append(bullet("<b>Beállítások</b> oldal → <b>„Manuális backup most”</b> link"))
story.append(bullet("A program azonnal létrehoz egy mentést, és visszajelzést ad "
                    "a teljes elérési útról"))
story.append(bullet("Ha ma már volt backup, üzenetet kap: <i>„Backup már létezett (ma)”</i>"))

story.append(h2("Visszaállítás backup-ból"))
story.append(p(
    "A visszaállítás <b>jelenleg manuálisan</b> történik:"
))
story.append(bullet("Zárja be az OvodaNaplót"))
story.append(bullet("Nyissa meg az adattárat: <b>Beállítások → Adattár megnyitása</b> "
                    "(vagy a fenti elérési úton)"))
story.append(bullet("Nevezze át az aktuális <b>ovodanaplo.db</b>-t pl. "
                    "<b>ovodanaplo-elromlott.db</b>-re (biztosítékként)"))
story.append(bullet("Másolja át a backup mappából a kiválasztott <b>ovodanaplo-YYYY-MM-DD.db</b> "
                    "fájlt, és nevezze át <b>ovodanaplo.db</b>-re"))
story.append(bullet("Indítsa el az OvodaNaplót — a kiválasztott napi állapot van visszaállítva"))

story.append(figyelem(
    "Ne másoljon át backup-fájlt menet közben! Csak akkor, ha a program zárva van. "
    "Élő SQLite fájl másolása korrupcióhoz vezethet."
))

story.append(h2("Külső backup (felhő, USB)"))
story.append(p(
    "Bár a program <b>nem készít automatikusan felhő-backup-ot</b>, ajánljuk, hogy "
    "hetente egyszer manuálisan másolja át a teljes <b>ovodanaplo</b> mappát egy "
    "USB-meghajtóra, OneDrive-ra vagy más külső tárolóra. Ez az igazi adatbiztonság."
))
story.append(PageBreak())

# ============================================================
# 15. TIPPEK
# ============================================================
story.append(h1("15. Tippek a hatékony használathoz"))

story.append(h2("Munkafolyamat-javaslat"))
story.append(bullet("<b>Hétfő reggel</b>: nézze meg az aktuális heti tervet, "
                    "frissítse, ha szükséges"))
story.append(bullet("<b>Hétfő-péntek</b>: foglalkozás-tervezeteket készít az adott "
                    "napra (előző este vagy reggel)"))
story.append(bullet("<b>Péntek délután / hétvége</b>: heti reflexió írása "
                    "a tapasztalatokról"))
story.append(bullet("<b>Vasárnap este / hétfő reggel</b>: a következő hét tervezete "
                    "— innen az „új heti terv” sablon-választóval indul"))

story.append(h2("Időtakarékos trükkök"))
story.append(bullet("Az <b>„Egész év generálása sablonból”</b> egy minutum alatt "
                    "felépíti az egész évi vázat. Utána csak finomítani kell, "
                    "nem a nulláról kezdeni"))
story.append(bullet("A <b>„Másolás előző hétről”</b> ismétlődő témáknál (pl. "
                    "minden héten van vers-mese) hatalmas időmegtakarítás"))
story.append(bullet("Az <b>autocomplete</b> a vers-mese mezőben pillanatok alatt "
                    "beilleszti a teljes művet — nem kell kézzel gépelni"))
story.append(bullet("A <b>„💡 Ötletek”</b> panel két kattintással ad 10 új ötletet "
                    "ahhoz a területhez"))
story.append(bullet("A <b>keresés</b> kiküszöböli a „hova írtam tavaly azt a verset?” "
                    "kérdést"))

story.append(h2("Jó pedagógiai gyakorlat"))
story.append(bullet("<b>Reflektáljon hetente</b> — még ha csak 2-3 mondatot is. "
                    "Év végén értékes naplót kap saját fejlődéséről"))
story.append(bullet("<b>Használja a képesség-rendszert</b> — a 71 előre definiált "
                    "képesség-tag a heti tervhez rendelve segít követni, mely "
                    "képességek hangsúlyosak a teljes évben"))
story.append(bullet("<b>Vegye komolyan a differenciálást</b> — a program ad egy "
                    "alapszöveget, de személyre szabva sokkal hatékonyabb"))
story.append(bullet("<b>Bővítse az irodalmi tárat</b> — ha kedvelt verseit, "
                    "meséit beleteszi a saját bővítésbe, többé soha nem kell "
                    "keresni utánuk"))

story.append(h2("Csoporttípus-specifikus tippek"))
story.append(bullet("<b>Vegyes csoport</b>: használja az ötletbörze korcsoport-jelölését "
                    "a differenciáláshoz — egyazon témán belül kicsi, középső, nagy "
                    "feladatokat találhat"))
story.append(bullet("<b>Nagycsoport</b>: az <b>iskola-előkészítő szempontok</b> mező "
                    "(foglalkozás-tervezetben és projektben) kiemelten fontos"))
story.append(bullet("<b>Kicsi csoport</b>: az ötletek nagy része egyszerű, "
                    "érzékszervi tevékenység — itt a kreativitás és játékosság "
                    "fontosabb a strukturált tartalomnál"))
story.append(PageBreak())

# ============================================================
# 16. HIBAELHÁRÍTÁS
# ============================================================
story.append(h1("16. Hibaelhárítás"))

story.append(h2("A program nem indul"))
story.append(bullet("<b>Ellenőrizze:</b> a <b>OvodaNapló.exe</b> mellett ott van-e "
                    "a <b>resources</b> mappa és a <b>node_modules</b> mappa? "
                    "Ha nem, a telepítés hiányos"))
story.append(bullet("<b>Próbálja:</b> jobb-klikk → „Futtatás rendszergazdaként”"))
story.append(bullet("<b>Antivírus blokkolhatja</b> — adja hozzá kivételhez az "
                    "OvodaNapló mappát"))

story.append(h2("Adatok eltűntek / hibás megjelenítés"))
story.append(bullet("<b>Indítson backup-visszaállítást</b> a fenti útmutató szerint "
                    "(14. fejezet)"))
story.append(bullet("Nyissa meg az adattárat (Beállítások → Adattár megnyitása) "
                    "és ellenőrizze, hogy az <b>ovodanaplo.db</b> fájl ott van-e"))
story.append(bullet("Ha a fájl 0 byte, állítsa vissza tegnapi backup-ból"))

story.append(h2("Lassú működés"))
story.append(bullet("<b>Túl sok backup felhalmozódik?</b> Manuálisan törölje a régi "
                    "(több hónappal előtti) backup-fájlokat az adattárból"))
story.append(bullet("<b>Adatbázis fragmentált?</b> SQLite VACUUM nyomható, "
                    "de általában nem szükséges év közben"))
story.append(bullet("<b>Más program eszik memóriát?</b> Az Electron 4 GB RAM mellett "
                    "is jól fut, de ha mellette még böngésző és Word is fut, "
                    "lehet, hogy lassul"))

story.append(h2("DOCX export hibás formátum"))
story.append(bullet("<b>Word nyitja meg a fájlt?</b> Próbálja LibreOffice-szal vagy "
                    "Google Docs-szal megnyitni — a Word régebbi verziói rosszul "
                    "kezelik a modern .docx-eket"))
story.append(bullet("<b>Hibás ékezet?</b> A program Unicode-ot használ, a Word "
                    "néha codepage-konverzió miatt rosszul jelenít — frissítse a Word-öt"))

story.append(h2("Nincs ötlet / sablon az adott területhez"))
story.append(bullet("<b>Korcsoport ellenőrzés</b>: a Beállításokban a megfelelő "
                    "csoporttípus van-e állítva?"))
story.append(bullet("<b>A téma túl specifikus?</b> Próbáljon általánosabb témát "
                    "kiválasztani — pl. „Ősz” helyett „Évszakok”"))
story.append(bullet("Ha tényleg üres a panel, használja az <b>„Új irodalom hozzáadása”</b> "
                    "funkciót, és bővítse a saját tárát"))

story.append(h2("Kérdés vagy hiba bejelentése"))
story.append(p(
    "A program <b>privát fejlesztés</b>, GitHub-repó-val: "
    "<b>github.com/Morzan1991/ovodanaplo</b>. Hiba bejelentéséhez használja "
    "a repó <b>Issues</b> rovatát. A pontos hiba-leíráshoz csatolja:"
))
story.append(bullet("Mit csinált, mielőtt a hiba megjelent"))
story.append(bullet("Hibaüzenet pontos szövege (képernyőkép)"))
story.append(bullet("A program verziószáma (Beállítások oldal)"))
story.append(bullet("Az operációs rendszer verziója"))
story.append(PageBreak())

# ============================================================
# 17. SPECIFIKÁCIÓK
# ============================================================
story.append(h1("17. Specifikációk és technikai részletek"))

story.append(h2("Verziók"))
spec_tabla = szakasz_tabla([
    ["App verzió", "2.7.0 (2026-05-13 állapot)"],
    ["Electron", "33.x"],
    ["React", "18.x"],
    ["TypeScript", "5.7.x"],
    ["SQLite", "better-sqlite3 11.x"],
    ["ORM", "Drizzle 0.36.x"],
    ["Validáció", "Zod 4.4.x"],
    ["Tesztkeret", "Vitest (61 teszt)"],
])
story.append(spec_tabla)

story.append(h2("Tartalom-statisztika"))
content_tabla = szakasz_tabla([
    ["Sablonok száma", "85 (havi és ünnepi témákra optimalizálva)"],
    ["Ötletek száma", "2310 (téma × terület × korcsoport bontás)"],
    ["Irodalmi tár", "383 valós magyar óvodás mű"],
    ["Képességek", "71 előre definiált pedagógiai képesség-tag"],
    ["Ünnepek", "Magyar állami és iskolai ünnepek 2024–2030"],
])
story.append(content_tabla)

story.append(h2("Adatbázis-struktúra"))
story.append(p("A program SQLite adatbázisa a következő fő táblákból áll:"))
story.append(bullet("<b>beallitasok</b> — pedagógusi és csoport-adatok"))
story.append(bullet("<b>nevelesi_evek</b> — több nevelési év kezelése"))
story.append(bullet("<b>heti_tervek</b> — a heti tervek fő rekordjai"))
story.append(bullet("<b>teruletek</b> — a 7 terület tartalma heti tervenként"))
story.append(bullet("<b>projektek</b> — projekt-fejezetek"))
story.append(bullet("<b>foglalkozas_tervezetek</b> — részletes foglalkozás-tervek"))
story.append(bullet("<b>reflexiok</b> — heti/foglalkozás/projekt reflexiók"))
story.append(bullet("<b>esemenyek</b> — egyedi naptári események"))
story.append(bullet("<b>irodalom</b> — irodalmi művek (seed + saját)"))
story.append(bullet("<b>unnepek</b> — ünnepek táblája"))
story.append(bullet("<b>kepessegek</b> — képesség-katalógus"))
story.append(bullet("<b>heti_terv_kepesseg</b> — M-N kapcsoló heti tervek és képességek között"))
story.append(bullet("<b>FTS5</b> virtuális tábla a kereséshez"))

story.append(h2("Adatvédelem"))
story.append(bullet("<b>100% lokális</b> — semmi adat nem hagyja el a gépet"))
story.append(bullet("<b>Nincs telemetria</b> — a program nem küld használati adatokat"))
story.append(bullet("<b>Nincs felhasználói fiók</b> — nincs is online azonosítás"))
story.append(bullet("<b>Open-source eszközök</b>: Electron, React, SQLite, mind nyílt forrású"))

story.append(h2("Licenc és felhasználás"))
story.append(p(
    "Az OvodaNapló <b>privát fejlesztés</b>. A program magán-célú használatra "
    "ingyenes a célközösség számára. A forrás-kód a Morzan1991/ovodanaplo "
    "GitHub-repón hozható elő (privát repó, hozzáférés egyeztetéssel)."
))

# Záró oldal
story.append(Spacer(1, 2 * cm))
story.append(p(
    "<i>Ez a használati útmutató az OvodaNapló v2.7.0 állapota szerint készült "
    "(2026-05-13). Új verziók megjelenésével a tartalom változhat. A legfrissebb "
    "változat a Beállítások menüpontban ellenőrizhető.</i>",
    ParagraphStyle(name="end", parent=szoveg_stilus, alignment=TA_CENTER,
                   textColor=INK_60, fontName=FONT_ITAL)
))

story.append(Spacer(1, 1 * cm))
story.append(p("📚", ParagraphStyle(name="endemoji", fontSize=36,
                                     alignment=TA_CENTER, leading=40)))

story.append(Spacer(1, 0.5 * cm))
story.append(p(
    "<b>OvodaNapló</b> — Pedagógiai műhely magyar óvodapedagógusoknak",
    ParagraphStyle(name="endsub", parent=szoveg_stilus, alignment=TA_CENTER,
                   textColor=ACCENT, fontName=FONT_BOLD)
))


# ============================================================
# Page decorator: oldalszám és fejléc
# ============================================================

def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT_NAME, 8)
    canvas.setFillColor(INK_60)
    # Oldalszám
    canvas.drawCentredString(A4[0] / 2, 1 * cm, f"— {doc.page} —")
    # Fejléc-vonal és cím
    if doc.page > 1:
        canvas.setFillColor(SAGE)
        canvas.setFont(FONT_ITAL, 8)
        canvas.drawString(2 * cm, A4[1] - 1.2 * cm,
                          "OvodaNapló v2.7.0 — Használati útmutató")
        canvas.setStrokeColor(SAGE_LIGHT)
        canvas.setLineWidth(0.5)
        canvas.line(2 * cm, A4[1] - 1.4 * cm, A4[0] - 2 * cm, A4[1] - 1.4 * cm)
    canvas.restoreState()


# ============================================================
# Build
# ============================================================

output_path = r"C:\Users\Lenovo X1\Desktop\OvodaNaplo_Hasznalati_Utmutato.pdf"

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=2 * cm,
    leftMargin=2 * cm,
    topMargin=2 * cm,
    bottomMargin=2 * cm,
    title="OvodaNapló v2.7.0 — Használati útmutató",
    author="Lisztmaier Gábor",
    subject="Pedagógiai műhely magyar óvodapedagógusoknak",
)

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

print(f"[OK] PDF generated: {output_path}")
print(f"[OK] File size: {os.path.getsize(output_path) / 1024:.1f} KB")
