"""Uj zold jeles napokat ad hozza:
- mehek_napja: Mehek vilagnapja (maj 20)
- erdok_napja: Erdok nemzetkozi napja (mar 21)

Mindketto 2-2 sablon-felel V1+V2 verzioval, OVODAS-szintu tartalom.
"""
import json
import os
import shutil

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')
DEPLOY = os.path.join(BASE, 'app', 'dist-installer', 'win-unpacked', 'resources', 'seed', 'weekly-templates.json')

UJ_SABLONOK = [
    # === MEHEK NAPJA (maj 20) ===
    {
        "azonosito": "mehek_napja_v1",
        "cim": "Méhek napja — beporzók és virágok",
        "verzio": 1,
        "kategoria": "vilagunnep",
        "javasoltHonap": 5,
        "javasoltSorrend": 3,
        "kapcsoloUnnep": "Méhek Világnapja",
        "tema": "Méhek világnapja, beporzók szerepe",
        "cel": "A gyermekek ismerjék meg a méhek életét, fontos szerepüket a természetben, alakuljon ki bennük a védelem iránti tisztelet és felelősség.",
        "feladat": "Élményszerű megismerés: méhész meghívása vagy méhészeti könyv. A méhek táplálkozásának, méz előállításának játékos bemutatása. A beporzás folyamatának életkori szintű ismertetése.",
        "teruletek": {
            "kulso_vilag": "Méhek élete: királynő, dolgozó, here\nA méhkaptár belseje, lépek\nMézgyűjtés folyamata: virág → nektár → méz\nMás beporzók: poszméhek, lepkék, pillangók\nMiért fontosak a méhek? (beporzás → gyümölcsök)\nMéhészeti termékek: méz, méhviasz, propolisz",
            "matematika": "Méhsejtek hexagon formája — geometria\nSzámlálás 10-es számkörben: hány méh, virág\nHalmazalkotás: méhek és virágok párosítása\nSorba rendezés: méret szerinti virágok",
            "verseles_meseles": "Mesék:\nFésűs Éva: A kis méhecske kalandjai\nNépi mese: A méhkirálynő\nMondókák és versek:\nWeöres Sándor: Méhek (rövid vers)\nDonászy Magda: Méhecske\nMentovics Éva: Zümmögő méhike\nGazdag Erzsi: Tavaszi virágok",
            "rajzolas_festes": "Méhecske rajzolása: sárga-fekete csíkok\nVirágoskert kollázs színes papírból\nMéhkaptár hexagon-mintázat festéssel\nGyurma méhecske antennával\nSzínezők: méhek és virágok",
            "enek_zene": "Méh, méh, méh, jöjj ide\nZümmögő dallamok improvizálása\nZh.: Saint-Saëns: A méh (rövid részlet)\nGryllus Vilmos méh-dalok",
            "hallas_ritmus": "Méh zümmögésének hangja — kísérelt utánzás\nHalk-hangos megkülönböztetés: csendes méh, hangos méh\nRitmus visszatapsolás: zü-zü-zü, mé-he-cske",
            "mozgas": "Tornatermi tevékenységek:\nMéhecske-utánzás: futás karok széttárva\nVirágról-virágra ugrálás karikákra\nCsoportban/udvaron végzett mindennapos mozgás:\nMézgyűjtés-szerű játék kosárral\nVirágkereső séta az udvaron"
        },
        "iskolaElokeszitoTeruletek": {
            "kulso_vilag": "Megfigyelőképesség\nTermészettudat\nFelelősségérzet\nÖsszefüggések felismerése\nSzókincsbővítés",
            "verseles_meseles": "Szövegértés\nKifejezőkészség\nHallási figyelem\nAuditív emlékezet\nKépzelet",
            "rajzolas_festes": "Finommotorika\nFormafelismerés (hexagon)\nSzínérzék\nKreativitás\nEsztétikai érzék",
            "enek_zene": "Hallási figyelem\nRitmusérzék\nDallamhallás\nÉneklési öröm\nÚjrahallgatás",
            "mozgas": "Nagymozgások\nTérbeli tájékozódás\nUtánzás\nEgyüttműködés\nMozgáskoordináció"
        },
        "iskolaElokeszito": "",
        "kepessegfejlesztes": "természetszeretet, szókincsbővítés, megfigyelőképesség, finommotorika, formafelismerés, ritmusérzék, nagymozgások, együttműködés, felelősségérzet, kreativitás",
        "eszkozok": "méh- és virág-képek, méhészeti könyv, sárga-fekete kartonpapír, festék, ecset, gyurma, mézminta (kostolásra), karikák, mozgás-eszközök"
    },
    {
        "azonosito": "mehek_napja_v2",
        "cim": "Méhek napja — méhészet, méz, hasznos rovarok",
        "verzio": 2,
        "kategoria": "vilagunnep",
        "javasoltHonap": 5,
        "javasoltSorrend": 3,
        "kapcsoloUnnep": "Méhek Világnapja",
        "tema": "Méhészet, méz előállítása, hasznos rovarok",
        "cel": "A gyermekek ismerjék meg a méhészet alapjait és a méz útját a kaptártól az asztalra. Tudják megkülönböztetni a hasznos rovarokat (méh, katica, szitakötő) a többi rovartól.",
        "feladat": "Konkrét tapasztalás: méz-kostolás, viaszgyertya megérintése. A méhész szakma tisztelete, a természet ajándékainak felismerése. A hasznos rovarok kategorizálása.",
        "teruletek": {
            "kulso_vilag": "Méhész munkája: gondozás, mézgyűjtés\nMézfajták: akác, hárs, rep, vegyes virág\nMézes ételek: mézes kenyér, mézes kalács\nMás hasznos rovarok: katicabogár, szitakötő, hangyák\nMiért nem szabad bántani a méheket?\nMi a teendő, ha mégis megcsíp egy méh? (alapszintű)",
            "matematika": "Mézes kenyér szeletek: hányad, fele, negyede\nSzámlálás 20-as számkörben: méhek, mézes üvegek\nMérés: kicsi - közepes - nagy mézes üveg\nÖsszehasonlítás: hány gramm méz, mennyi virág kell hozzá",
            "verseles_meseles": "Mesék:\nLázár Ervin: A négyszögletű kerek erdő — méh-fejezet\nCsukás István: Pom Pom és a méhecske\nFésűs Éva: A méhecske és a katica\nMondókák és versek:\nGazdag Erzsi: Méhecske, méhecske\nBartos Erika: Méhek a kertben\nNépi mondóka: Süss föl, nap",
            "rajzolas_festes": "Mézes kalács díszítése (papírból, ragasztással)\nMéhészeti eszközök rajzolása: kaptár, füstölő\nKatica, méh, szitakötő közös plakát\nÚjságpapír-méh: tekercselés, ragasztás\nMézszínű (sárga-narancs) festészet",
            "enek_zene": "Méhes-mondóka dallammal\nZh.: Mozart: Mehek zümmögése (improvizált rögtönzés)\nGryllus Vilmos: Rovarok dalai",
            "hallas_ritmus": "Méh zümmögés vs. szúnyog vs. légy — hangok megkülönböztetése\nRitmusos felismerés: zü-zü-zü vs. csip-csip\nDallamemlékezet játék",
            "mozgas": "Tornatermi tevékenységek:\nKaptár-építő játék hűtődobozokkal\nRovarok mozgásának utánzása: méh-repülés, hangya-csúszás\nCsoportban/udvaron végzett mindennapos mozgás:\nVirág-fogócska: kit fog meg a méh?\nNagyméretű kaptár-bújócska"
        },
        "iskolaElokeszitoTeruletek": {
            "kulso_vilag": "Megfigyelőképesség\nSzakma-tisztelet\nÖsszefüggések\nVeszélyfelismerés\nÉrzékszervi tapasztalás",
            "verseles_meseles": "Szövegértés\nNarratív készség\nKifejezőkészség\nFigyelem\nKépzelet",
            "rajzolas_festes": "Finommotorika\nKreativitás\nÚjrahasznosítás-érzék\nSzínvilág\nÖnállóság",
            "enek_zene": "Hallási figyelem\nRitmusérzék\nImprovizáció\nDallamemlékezet\nÉneklési öröm",
            "mozgas": "Nagymozgások\nUtánzás\nEgyüttműködés\nTérbeli tájékozódás\nKöltöztetésérzék"
        },
        "iskolaElokeszito": "",
        "kepessegfejlesztes": "természettudat, szakma-tisztelet, szókincsbővítés, mérés, finommotorika, kreativitás, ritmusérzék, dallamemlékezet, nagymozgások, együttműködés, megfigyelőképesség, érzékszervi tapasztalás",
        "eszkozok": "méz-minta, viaszgyertya, méhészeti könyv, papír, ragasztó, olló, ecset, festék, gyurma, kis dobozok, képek méhészetről, hangszóró"
    },
    # === ERDOK NAPJA (mar 21) ===
    {
        "azonosito": "erdok_napja_v1",
        "cim": "Erdők napja — fák és lakói",
        "verzio": 1,
        "kategoria": "vilagunnep",
        "javasoltHonap": 3,
        "javasoltSorrend": 3,
        "kapcsoloUnnep": "Erdők Nemzetközi Napja",
        "tema": "Erdők védelme, fák szerepe",
        "cel": "A gyermekek értsék meg az erdő fontosságát, ismerjék meg az erdei fákat és állatokat. Alakuljon ki bennük a természetvédő szemlélet.",
        "feladat": "Erdei séta szervezése. A fák részeinek (gyökér, törzs, ág, levél) megfigyelése. A különböző fajta fák (tölgy, fenyő, juhar, hárs) felismerése.",
        "teruletek": {
            "kulso_vilag": "Erdei fák: tölgy, fenyő, juhar, hárs, nyír\nFák részei: gyökér, törzs, ág, levél\nLombhullató vs. örökzöld fák\nErdei állatok: őz, róka, mókus, sün, vaddisznó\nMiért fontos az erdő? (oxigén, élőhely, fa)\nErdővédelem alapjai: ne dobjunk szemetet, ne tördeljük az ágakat",
            "matematika": "Levelek számlálása 10-es számkörben\nHalmazalkotás: lombhullató vs örökzöld\nMéret-összehasonlítás: kicsi-nagy fák\nFatörzs körmérete méréssel (kötéllel)",
            "verseles_meseles": "Mesék:\nFésűs Éva: A süni és a róka\nZelk Zoltán: A három nyúl\nNépmese: A kismalac és a farkasok\nMondókák és versek:\nNemes Nagy Ágnes: A fák\nNépi: Erdő mélyén\nWeöres Sándor: Galagonya",
            "rajzolas_festes": "Falevél-nyomat festékkel\nFa rajzolása ágakkal, levelekkel\nErdei kollázs: gyűjtött levelek ragasztásával\nGyurma erdei állatok\nÚjságpapír-fatörzs csavarással",
            "enek_zene": "Erdő, erdő, de magas vagy (közös éneklés)\nNépi: Megy a kocsi, fut a kocsi\nZh.: Vivaldi: 4 évszak — Tavasz részlet\nMadárhangok meghallgatása",
            "hallas_ritmus": "Erdei hangok: madárcsicsergés, levélsuhogás\nRitmus visszatapsolás: fa-tönk, le-vél, ág\nHalk-hangos: csendes erdő, viharzó erdő",
            "mozgas": "Tornatermi tevékenységek:\nFa-utánzás: állva, karok mint ágak\nMókus-szökdelés akadálypályán\nCsoportban/udvaron végzett mindennapos mozgás:\nFák közötti bújócska az udvaron\nLevélgyűjtés-séta"
        },
        "iskolaElokeszitoTeruletek": {
            "kulso_vilag": "Megfigyelőképesség\nTermészettudat\nFelelősségérzet\nSzókincsbővítés\nÖsszefüggések",
            "verseles_meseles": "Szövegértés\nKifejezőkészség\nHallási figyelem\nNarratív készség\nKépzelet",
            "rajzolas_festes": "Finommotorika\nTermészetes anyagok használata\nKreativitás\nSzem-kéz koordináció\nEsztétikai érzék",
            "enek_zene": "Hallási figyelem\nDallamhallás\nKözös éneklés\nMadár-hang felismerés\nRitmusérzék",
            "mozgas": "Nagymozgások\nTérbeli tájékozódás\nTermészetjárás\nEgyüttműködés\nÁllóképesség"
        },
        "iskolaElokeszito": "",
        "kepessegfejlesztes": "természetszeretet, megfigyelőképesség, szókincsbővítés, halmazalkotás, finommotorika, kreativitás, ritmusérzék, dallamhallás, nagymozgások, együttműködés, felelősségérzet, állóképesség",
        "eszkozok": "falevelek, gallyak, képek erdei fákról és állatokról, festék, ecset, gyurma, ragasztó, papír, hangszóró, madárhang-felvételek"
    },
    {
        "azonosito": "erdok_napja_v2",
        "cim": "Erdők napja — fa mint nyersanyag",
        "verzio": 2,
        "kategoria": "vilagunnep",
        "javasoltHonap": 3,
        "javasoltSorrend": 3,
        "kapcsoloUnnep": "Erdők Nemzetközi Napja",
        "tema": "Fa felhasználása, újrahasznosítás",
        "cel": "A gyermekek ismerjék meg a fa, mint nyersanyag sokoldalú felhasználását (bútor, papír, tüzifa). Alakuljon ki bennük a felelős erőforrás-használat tudata.",
        "feladat": "Fa-tárgyak megfigyelése: bútorok, játékok, ceruza. A papír-készítés folyamatának egyszerű bemutatása. Faanyag-újrahasznosítás ötletei.",
        "teruletek": {
            "kulso_vilag": "Fa-tárgyak körülöttünk: bútorok, ajtó, parketta, játékok\nPapír útja: fa → cellulóz → papír\nFa típusok: keményfa (tölgy) és puhafa (fenyő)\nFaanyag-újrahasznosítás: gyűjtjük a fát\nMiért ne irtsuk az erdőt? (élőhely + oxigén)\nA fa, mint élőlény: növekszik, lélegzik",
            "matematika": "Fa-rétegek (évgyűrűk) számlálása\nFatárgyak csoportosítása méret szerint\nHalmazalkotás: bútor, eszköz, papír\nSorba rendezés vastagság szerint",
            "verseles_meseles": "Mesék:\nMóra Ferenc: A cinege cipője (fa-kötödés)\nFésűs Éva: A barátságos öreg fa\nLázár Ervin: A négyszögletű kerek erdő — fa-fejezet\nMondókák és versek:\nWeöres Sándor: Buba éneke (fák)\nBerg Judit: Rumini és az erdő (részlet)\nGazdag Erzsi: Fák ébredése",
            "rajzolas_festes": "Fakéreg-nyomat agyagba\nÉvgyűrűk festése koncentrikus körökkel\nKis fagyenge (gally) faragási próba (felnőtt felügyelet)\nÚjrahasznosított papír-kollázs\nFatárgyak rajzolása (asztal, szék, ceruza)",
            "enek_zene": "Megy a vonat — szénszállító dal\nNépi: Erdő, erdő, kerek erdő\nZh.: Csajkovszkij: Csipkerózsika erdő-részlete\nRavel: Bolero (rövid részlet)",
            "hallas_ritmus": "Fa hangja: kopogás, törés, recsegés\nFavágás-utánzás: tap-tap ritmus\nKemény-puha hangok megkülönböztetése",
            "mozgas": "Tornatermi tevékenységek:\nFavágás-utánzás: két karral lengetés\nFa-mászás akadálypályán\nCsoportban/udvaron végzett mindennapos mozgás:\nFavágás-szerű csapatjáték\nKülönböző fák közötti séta-megfigyelés"
        },
        "iskolaElokeszitoTeruletek": {
            "kulso_vilag": "Megfigyelőképesség\nÖsszefüggések\nFelelősségérzet\nKörnyezettudat\nSzókincsbővítés",
            "verseles_meseles": "Szövegértés\nMetafora-érzék\nKifejezőkészség\nNarratív készség\nFigyelem",
            "rajzolas_festes": "Finommotorika\nTermészetes anyagok\nÚjrahasznosítás\nSzem-kéz koordináció\nKreativitás",
            "enek_zene": "Hallási figyelem\nDallamhallás\nRitmusérzék\nKlasszikus zene befogadása\nKözös éneklés",
            "mozgas": "Nagymozgások\nKaros mozgások\nEgyüttműködés\nIrányítás-követés\nÁllóképesség"
        },
        "iskolaElokeszito": "",
        "kepessegfejlesztes": "környezettudat, szókincsbővítés, halmazalkotás, finommotorika, újrahasznosítás-érzék, ritmusérzék, nagymozgások, együttműködés, megfigyelőképesség, esztétikai érzék",
        "eszkozok": "fakéreg, gallyak, papír, festék, ragasztó, fatárgyak (kanál, ceruza), képek erdőről és fagyártásról, hangszóró, akadálypálya-eszközök"
    },
]

# Beolvas, hozzaad, ment
with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

meglevo_azon = {s['azonosito'] for s in data['sablonok']}
hozzaadott = 0
for uj in UJ_SABLONOK:
    if uj['azonosito'] in meglevo_azon:
        print(f'  Duplikat: {uj["azonosito"]} - kihagyva')
        continue
    data['sablonok'].append(uj)
    hozzaadott += 1
    print(f'  + {uj["azonosito"]}: {uj["cim"]}')

# Verzio
data['_verzio'] = '2.5'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.5 — uj zold jeles napokkal: Mehek napja (maj 20), '
    'Erdok napja (mar 21). Mindketto V1+V2 verzioval, 10-10 bullet teruletenkent.'
)

# Sorrendezes
SCHOOL_YEAR_ORDER = {9:1, 10:2, 11:3, 12:4, 1:5, 2:6, 3:7, 4:8, 5:9, 6:10}
def sort_key(s):
    h = s.get('javasoltHonap', 99)
    return (SCHOOL_YEAR_ORDER.get(h, 99), s.get('javasoltSorrend', 99), s.get('azonosito', 'zzz'))
data['sablonok'].sort(key=sort_key)

with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
shutil.copy(TEMPLATES, DEPLOY)

print(f'\nHozzaadott uj sablonok: {hozzaadott}')
print(f'Osszes sablon: {len(data["sablonok"])}')
print(f'Mentve: {TEMPLATES} + deploy')
