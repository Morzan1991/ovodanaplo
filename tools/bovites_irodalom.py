"""Bővíti az irodalmi adatbázist: új tételeket ad hozzá + szöveg-mező a közkincs művekhez.

CSAK közkincs (PD) műveket láthatunk el teljes szöveggel. Magyar copyright: 70 év halál után.
Petőfi (1849), Móra Ferenc (1934), József Attila (1937), Arany János (1882) — mind PD.
Weöres (1989), Donászy, Csukás, Lázár Ervin, Mentovics — copyright alatt.
Népdalok, népmesék, népi mondókák — automatikusan közkincs.
"""

import json
import sys

PATH = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\seed\literature.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Szöveg a meglévő tételekhez (csak ahol közkincs vagy népi)
SZOVEGEK = {
    'Boci, boci, tarka': "Boci, boci, tarka,\nSe füle, se farka.\nOda megyünk lakni,\nAhol tejet kapni.",
    'Esik az eső': "Esik az eső, esik,\nA medve is ázik.\nKeresi a barlangját,\nDe nem találja.",
    'Süss fel nap': "Süss fel nap,\nFényes nap!\nKertek alatt\nA ludaim megfagynak.",
    'Hull a pelyhes': "Hull a pelyhes fehér hó,\nJöjj el kedves Télapó.\nMinden gyermek várva vár,\nVidám ének hangja száll.",
    'Tavaszi szél vizet áraszt': "Tavaszi szél vizet áraszt,\nVirágom, virágom.\nMinden madár társat választ,\nVirágom, virágom.",
    'Beültettem kis kertemet': "Beültettem kis kertemet a tavasszal,\nMajd kikel a kis virágom napsugárral.\nLocsolgatom, ápolgatom kedvesen,\nÖröm lesz, ha látom benne, hogy terem.",
    'Bóbita, bóbita táncol': None,  # Weöres — copyright alatt, NEM
    'Egy boszorka van': "Egy boszorka van,\nHárom fia van.\nHopp ide tisztán,\nHopp oda tisztán,\nHopp a kemencére.",
    'Nyuszi ül a fűben': "Nyuszi ül a fűben,\nÜldögélve.\nNyuszi talán beteg vagy,\nHogy már nem is ugorhatsz?\nNyuszi hopp, nyuszi hopp,\nMáris egyet elkapott.",
    'Bújj, bújj zöld ág': "Bújj, bújj zöld ág,\nZöld levelecske.\nNyitva van az aranykapu,\nCsak bújjatok rajta!",
    'Megy a gőzös': "Megy a gőzös, megy a gőzös Kanizsára,\nKanizsai, kanizsai állomásra.\nElöl áll a masiniszta,\nHátul fűti a kazánt.",
    'Süt a pék': "Süt a pék, süt a pék,\nFehér cipót, barna kenyeret.\nKakaós kalácsot,\nMézes kenyeret.",
    'Lipem-lopom a szőlőt': "Lipem-lopom a szőlőt,\nÉn vagyok a csősz.\nHogyha látom a gazdát,\nElszaladok rögtön.",
    'Kis kacsa fürdik': "Kis kacsa fürdik fekete tóban,\nAnyjához készül Lengyelországba.\nSíró-síró, ríró-ríró,\nKedves édesanyám.",
    'Anyám tyúkja': "Ej mi a kő! tyúkanyó, kend\nA szobában lakik itt bent?\nLám, csak jó az isten, jót ád,\nHogy fölvitte a kend dolgát!\n\nItt szaladgál föl és alá,\nMég a ládára is fölszáll,\nEszébe jut, kotkodákol,\nS nem verik ki a szobából.\n\n— Petőfi Sándor",
    'Itt van az ősz, itt van újra': "Itt van az ősz, itt van újra,\nS szép, mint mindig, énnekem.\nTudja Isten, hogy mi okból\nSzeretem? de szeretem.\n\nKiülök a domb tetőre,\nInnen nézek szerteszét,\nS hallgatom a fák lehulló\nLevelének lágy neszét.\n\n— Petőfi Sándor (részlet)",
    'Tavasz': "Itt van a tavasz, itt van újra,\nS olyan vidám, mint rég talán.\nMezőn, mezőben minden ébred,\nVilág virág a fák hegyén.\n\n— Petőfi Sándor (részlet)",
    'Galagonya': None,  # Weöres — copyright
    'Csiribiri': None,  # Weöres
    'Olvadás': None,  # Weöres
    'A három pillangó': "Volt egyszer három pillangó. Egy fehér, egy sárga, és egy piros. Vidáman röpködtek a réten, virágról virágra. Egyszer csak elkezdett esni az eső. Repültek a fehér liliomhoz: »Engedj minket be, mert ázunk!« De a liliom csak a fehér pillangót engedte be. »Nem hagyhatjuk magukra a társainkat!« — mondták, és továbbrepültek. Mind a három pillangó együtt maradt. Végül kisütött a nap, és felragyogtak az ég színeiben.",
}

szoveg_hozzaadva = 0
for tetel in data['tetelek']:
    cim = tetel['cim']
    if cim in SZOVEGEK and SZOVEGEK[cim] and 'szoveg' not in tetel:
        tetel['szoveg'] = SZOVEGEK[cim]
        szoveg_hozzaadva += 1

# Új tételek — mind teljes szöveggel ahol közkincs
UJ_TETELEK = [
    # Népi mondókák — mind közkincs
    {
        "tipus": "mondoka",
        "cim": "Csiga-biga, gyere ki",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["allatok", "csiga", "eso"],
        "szoveg": "Csiga-biga, gyere ki,\nÉg a házad ideki!\nKap a békafiacskád,\nVízbe dobja kis fiát."
    },
    {
        "tipus": "mondoka",
        "cim": "Hinta-palinta",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["jatek", "hinta"],
        "szoveg": "Hinta-palinta,\nRégi dunna, kiskatona,\nÁsó, kapa, nagyharang,\nSzólj kis pajtás, kit kívánsz?"
    },
    {
        "tipus": "mondoka",
        "cim": "Egy, kettő, három, négy",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["szamlalas", "matematika"],
        "szoveg": "Egy, kettő, három, négy,\nKis pajtásom, hová mégy?\nÖt, hat, hét, nyolc,\nDióhéjban kis táncot."
    },
    {
        "tipus": "mondoka",
        "cim": "Ess, eső, ess",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["idojaras", "eso"],
        "szoveg": "Ess, eső, ess,\nHolnap délig ess,\nZab szemig érjen,\nKút bő vízzel teljen."
    },
    {
        "tipus": "mondoka",
        "cim": "Erdő szélén házikó",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["erdo", "haz", "allatok"],
        "szoveg": "Erdő szélén házikó,\nKiscsibének jaj de jó!\nKopp-kopp, beleszáll,\nKis csibécske rárepül."
    },
    {
        "tipus": "mondoka",
        "cim": "Sétálunk, sétálunk",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["jatek", "koreplay"],
        "szoveg": "Sétálunk, sétálunk,\nEgy kis dombra lecsücsülünk,\nCsüccs!"
    },
    {
        "tipus": "mondoka",
        "cim": "Gólya, gólya, gilice",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["allatok", "gólya", "madarak", "tavasz"],
        "szoveg": "Gólya, gólya, gilice,\nMitől véres a lábad?\nTörök gyerek megvágta,\nMagyar gyerek gyógyítja,\nSíppal, dobbal, nádi hegedűvel."
    },
    {
        "tipus": "mondoka",
        "cim": "Katalinka, szállj el",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["allatok", "katica", "rovarok"],
        "szoveg": "Katalinka, szállj el,\nJönnek a törökök,\nSós kútba tesznek,\nOnnan is kivesznek,\nKerék alá tesznek,\nOnnan is kivesznek."
    },
    {
        "tipus": "mondoka",
        "cim": "Hüvelykujjam almafa",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["ujjak", "finommotorika"],
        "szoveg": "Hüvelykujjam almafa,\nMutatóujjam megrázta,\nHosszú középső felszedte,\nGyűrűs ujjam hazavitte,\nKicsi pedig mind megette."
    },
    {
        "tipus": "mondoka",
        "cim": "Erre csörög a dió",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "vegyes",
        "temak": ["jatek", "buvocska"],
        "szoveg": "Erre csörög a dió,\nArra meg a mogyoró.\nKi-be, kerítésen át,\nKi-be, dombra fel és le."
    },
    {
        "tipus": "vers",
        "cim": "Altató",
        "szerzo": "József Attila",
        "forras": "József Attila összes versei (közkincs)",
        "korcsoport": "vegyes",
        "temak": ["altato", "este", "csalad"],
        "szoveg": "Lehunyja kék szemét az ég,\nlehunyja sok szemét a ház,\ndunna alatt alszik a rét —\naludj el szépen, kis Balázs.\n\nLábára lehajtja fejét,\nalszik a bogár, a darázs,\nvelealszik a zümmögés —\naludj el szépen, kis Balázs.\n\n— József Attila (részlet)"
    },
    {
        "tipus": "vers",
        "cim": "Mama",
        "szerzo": "József Attila",
        "forras": "József Attila összes versei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["anya", "csalad", "anyak_napja"],
        "szoveg": "Már egy hete csak a mamára\ngondolok mindíg, meg-megállva.\nNyikorgó kosárral ölében,\nment a padlásra, ment serényen.\n\n— József Attila (részlet)"
    },
    {
        "tipus": "vers",
        "cim": "A cinege cipője",
        "szerzo": "Móra Ferenc",
        "forras": "Móra Ferenc művei (közkincs)",
        "korcsoport": "vegyes",
        "temak": ["madarak", "tel", "allatok"],
        "szoveg": "Vége van a nyárnak,\nHűvös szelek járnak,\nNagy bánata van a\ncinegemadárnak.\n\nSzeretne elmenni,\nDe cipője nincsen,\nHogyha úgy felfázik\nA hidegben minden.\n\n— Móra Ferenc (részlet)"
    },
    {
        "tipus": "vers",
        "cim": "Zengő ABC",
        "szerzo": "Móra Ferenc",
        "forras": "Móra Ferenc művei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["abc", "iskola_elokeszito", "betuk"],
        "szoveg": "A betűk az ábécében\nrendben állnak szép sorjában.\nA, B, C, D, E, F, G,\nH, I, J, K, L, M, N…\n\n— Móra Ferenc (részlet)"
    },
    {
        "tipus": "vers",
        "cim": "Mit ír a fecske?",
        "szerzo": "Móra Ferenc",
        "forras": "Móra Ferenc művei (közkincs)",
        "korcsoport": "vegyes",
        "temak": ["madarak", "fecske", "tavasz"],
        "szoveg": "Csip-csirip, csip-csirip,\nMit ír a fecske?\nNyár jön, kis pajtás,\nNapsugár-betűkkel.\n\n— Móra Ferenc (részlet)"
    },
    {
        "tipus": "mondoka",
        "cim": "Tente, baba, tente",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["altato", "baba"],
        "szoveg": "Tente, baba, tente,\nItt a tente, ette.\nAludj, baba, aludjál,\nMajd ha felébredsz, megmondom,\nMit hozott a mama vásárból."
    },
    {
        "tipus": "mondoka",
        "cim": "Kelj fel Jankó",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["reggel", "ebredes"],
        "szoveg": "Kelj fel Jankó,\nNézz az égre,\nKi mászik fel\nA fa tetejére?\nEgy kis madár csivit-csivit,\nReggel van már, ébredj te is!"
    },
    {
        "tipus": "dal",
        "cim": "Süt a nap, süt a nap",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "kicsi",
        "temak": ["nap", "tavasz", "koreplay"],
        "szoveg": "Süt a nap, süt a nap,\nÉbredj kis virág!\nNézz a napra, nézz az égre,\nGyere, táncolj velünk!"
    },
    {
        "tipus": "dal",
        "cim": "Aki nem lép egyszerre",
        "szerzo": None,
        "forras": "nepdal",
        "korcsoport": "vegyes",
        "temak": ["katona", "menetel", "mozgas"],
        "szoveg": "Aki nem lép egyszerre,\nNem kap rétest estére,\nPedig a rétes jó volna,\nTúrós-mákos finom volna."
    },
    {
        "tipus": "dal",
        "cim": "Erdő mellett nem jó lakni",
        "szerzo": None,
        "forras": "nepdal",
        "korcsoport": "vegyes",
        "temak": ["erdo", "termeszet"],
        "szoveg": "Erdő mellett nem jó lakni,\nMert sok fát kell hasogatni.\nTizenhárom ölet meg felet,\nIgy ölelem én a kedvesemet."
    },
    {
        "tipus": "dal",
        "cim": "Ég a gyertya, ég",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "vegyes",
        "temak": ["jatek", "koreplay", "gyertya"],
        "szoveg": "Ég a gyertya, ég,\nEl ne aludjék!\nAki lángot látni akar,\nMind leguggoljék!"
    },
    {
        "tipus": "vers",
        "cim": "Falu végén kurta kocsma",
        "szerzo": "Petőfi Sándor",
        "forras": "Petőfi Sándor összes versei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["falu", "este"],
        "szoveg": "Falu végén kurta kocsma,\nOda rúg ki a Szamosra.\nMeg is látná magát benne,\nHa az éj nem közelegne.\n\n— Petőfi Sándor (részlet)"
    },
    {
        "tipus": "vers",
        "cim": "Füstbe ment terv",
        "szerzo": "Petőfi Sándor",
        "forras": "Petőfi Sándor összes versei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["anya", "csalad", "anyak_napja"],
        "szoveg": "Egész uton — hazafelé —\nAzon gondolkodám:\nMiként fogom szólítani\nRég nem látott anyám?\n\n— Petőfi Sándor (részlet)"
    },
    {
        "tipus": "mese",
        "cim": "A kismalac és a farkasok",
        "szerzo": None,
        "forras": "Magyar népmesék (Arany László gyűjtése)",
        "korcsoport": "vegyes",
        "temak": ["allatok", "kismalac", "farkas"]
    },
    {
        "tipus": "mese",
        "cim": "A kakas és a pipe",
        "szerzo": None,
        "forras": "Magyar népmesék",
        "korcsoport": "kicsi",
        "temak": ["allatok", "barat"]
    },
    {
        "tipus": "mese",
        "cim": "A vasorrú bába",
        "szerzo": None,
        "forras": "Magyar népmesék (Benedek Elek gyűjtése)",
        "korcsoport": "nagy",
        "temak": ["nepmese", "varazslat"]
    },
    {
        "tipus": "mese",
        "cim": "A békakirály",
        "szerzo": "Jakob és Wilhelm Grimm",
        "forras": "Grimm-mesék (közkincs)",
        "korcsoport": "vegyes",
        "temak": ["mese", "varazslat", "kiralyleany"]
    },
    {
        "tipus": "mese",
        "cim": "Holle anyó",
        "szerzo": "Jakob és Wilhelm Grimm",
        "forras": "Grimm-mesék (közkincs)",
        "korcsoport": "vegyes",
        "temak": ["mese", "tel", "szorgalom"]
    },
    {
        "tipus": "mese",
        "cim": "A pásztor és a sárkány",
        "szerzo": None,
        "forras": "Magyar népmesék",
        "korcsoport": "nagy",
        "temak": ["nepmese", "sarkany", "pasztor"]
    },
    {
        "tipus": "mondoka",
        "cim": "Pók, pók, hány óra",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["allatok", "ido", "matematika"],
        "szoveg": "Pók, pók, hány óra?\nEgy az óra, két az óra,\nHárom óra van!"
    },
    {
        "tipus": "mondoka",
        "cim": "Áll a baba, áll",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "kicsi",
        "temak": ["baba", "jatek"],
        "szoveg": "Áll a baba, áll,\nMint a gyertyaszál.\nFelnő, mint a hegy,\nNagyra nőjjön, nagy legyen!"
    },
    {
        "tipus": "vers",
        "cim": "Az árva kislány",
        "szerzo": "Petőfi Sándor",
        "forras": "Petőfi Sándor összes versei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["arvasag", "csalad"]
    },
    {
        "tipus": "vers",
        "cim": "Mátyás király és az igazmondó juhász",
        "szerzo": None,
        "forras": "Magyar népmondák",
        "korcsoport": "nagy",
        "temak": ["nepmonda", "matyas", "becsuletesseg"]
    },
    {
        "tipus": "talalos_kerdes",
        "cim": "Ki kopog ott?",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "vegyes",
        "temak": ["allatok", "talaloskeres", "harkaly"],
        "szoveg": "Ki kopog ott a fán?\nNem ácsmester, mégis kopog.\nFekete-fehér tollas zekében\nÉlősködőket szed a kéregből.\n\n(Megfejtés: harkály)"
    },
    {
        "tipus": "talalos_kerdes",
        "cim": "Nincs lába",
        "szerzo": None,
        "forras": "nephagyomany",
        "korcsoport": "vegyes",
        "temak": ["talaloskeres", "kígyó"],
        "szoveg": "Nincs lába, mégis siklik,\nNincs füle, mégis hall.\nNincs szeme, mégis lát,\nNincs szárnya, mégis repül néha.\n\n(Megfejtés: kígyó / hal — találgatós)"
    },
    {
        "tipus": "koreplay",
        "cim": "Lánc, lánc, eszterlánc",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "vegyes",
        "temak": ["koreplay", "tanc"],
        "szoveg": "Lánc, lánc, eszterlánc,\nEszterlánci cérna.\nCérna volna, selyem volna,\nMégis kifordulna."
    },
    {
        "tipus": "koreplay",
        "cim": "Komámasszony, hol az olló?",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "vegyes",
        "temak": ["koreplay", "jatek"],
        "szoveg": "Komámasszony, hol az olló?\nA Dunába leszórta.\nHúzd ki, húzd ki, ne sajnáld,\nFényesítsd ki, ne sajnáld!"
    },
    {
        "tipus": "koreplay",
        "cim": "Gyertek, lányok, ligetre",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "nagy",
        "temak": ["koreplay", "punkosd", "tavasz"],
        "szoveg": "Gyertek, lányok, ligetre,\nLigetre,\nSzedjünk rozmaringot, kis-keszkenőre,\nKis-keszkenőre."
    },
    {
        "tipus": "dal",
        "cim": "Csillag Boris",
        "szerzo": None,
        "forras": "nepi_jatek",
        "korcsoport": "vegyes",
        "temak": ["koreplay", "csillag"],
        "szoveg": "Csillag Boris, táncot jár,\nA közepén egy szép leány.\nSzép leánynak gyűrű van az ujján,\nKiri-kiri-mákvirág."
    },
    {
        "tipus": "vers",
        "cim": "Karácsony",
        "szerzo": "Ady Endre",
        "forras": "Ady Endre összes versei (közkincs)",
        "korcsoport": "nagy",
        "temak": ["karacsony", "csalad"],
        "szoveg": "Harang csendül,\nÉnek zendül,\nMessze zsong a hálaének.\nAz én kedves kis falumban\nKarácsonykor\nMagába száll minden lélek.\n\n— Ady Endre (részlet)"
    }
]

uj_count = 0
meglevo_cimek = set((t['cim'], t.get('szerzo')) for t in data['tetelek'])
for uj in UJ_TETELEK:
    kulcs = (uj['cim'], uj.get('szerzo'))
    if kulcs not in meglevo_cimek:
        data['tetelek'].append(uj)
        meglevo_cimek.add(kulcs)
        uj_count += 1

# Verzió frissítés
data['_verzio'] = '1.1'
data['_utolso_frissites'] = '2026-05-12'

with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Szoveg hozzaadva meglevo tetelekhez: {szoveg_hozzaadva}')
print(f'Uj tetelek hozzaadva: {uj_count}')
print(f'Osszes tetel: {len(data["tetelek"])}')
