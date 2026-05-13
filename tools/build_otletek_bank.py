"""Otletek-bank epitese a meglevo 81 sablonbol.

Logika:
1. Beolvassa az weekly-templates.json-t (81 sablon)
2. Tema-csoportonkent (31 tema) aggregalja a teruletek-bulletket
3. Tema-prefix alias-szal egyesiti a legacy es V1/V2 sablonokat
4. Ha 10-nel kevesebb a bullet, kiegesziti GENERIC bullets-szel teruletenkent
5. Menti az otletek-bank-vegyes.json-t a seed/ es a dist-installer/seed/ mappakba

A KICSI / KOZEPSO / NAGY korcsoportok mind a vegyes bankot kapjak fallback-kent,
es a UI-ban jelzes mutatja hogy a tartalom mindenki szamara hasznos.
"""
import json
import os
import shutil
from collections import defaultdict

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')
SEED_DIR = os.path.join(BASE, 'seed')
DEPLOY_SEED_DIR = os.path.join(BASE, 'app', 'dist-installer', 'win-unpacked', 'resources', 'seed')

EXPECTED_TEMAS = [
    'tanevkezdes', 'osz_termenyek', 'allatok_vilagnapja', 'tok_fesztival', 'osz_szinek',
    'marton_nap', 'erzsebet_katalin', 'advent', 'mikulas', 'luca_nap', 'karacsony',
    'teli_madaretetes', 'teli_sportok', 'magyar_kultura', 'egeszseges_eletmod', 'farsang', 'matyas_nap',
    'marcius_15', 'tavasz', 'viz_vilagnapja', 'erdok_napja', 'husveti_het', 'kolteszet_napja', 'fold_napja', 'olvasni_jo',
    'anyak_napja_csalad', 'madarak_fak_napja', 'mehek_napja', 'kozlekedes', 'foglalkozasok', 'punkosd', 'gyermeknap', 'evzaro'
]
TERULETEK = ['kulso_vilag', 'matematika', 'verseles_meseles', 'rajzolas_festes', 'enek_zene', 'hallas_ritmus', 'mozgas']

# Tema-prefix alias: legacy nev -> V1/V2 prefix
PREFIX_ALIAS = {
    'husvet': 'husveti_het',
    'osz_kezdete': 'osz_termenyek',
}

# Header sorok kiszurese (ezek nem javaslatok)
import re
FEJCIM_PATTERNS = [
    re.compile(r'^Mes[éeè]k\s*:\s*$', re.IGNORECASE),
    re.compile(r'^Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*$', re.IGNORECASE),
    re.compile(r'^Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*$', re.IGNORECASE),
    re.compile(r'^Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*$', re.IGNORECASE),
]

def is_header(line):
    line = line.strip()
    return any(p.match(line) for p in FEJCIM_PATTERNS)

# Generic kiegeszitesek temaonkent es teruletenkent (ha sablon-bullet < 10)
# Ezek MIND ovodaserekkel - egyszeruek, atalakithatok
GENERIC_KIEGESZITES = {
    'kulso_vilag': [
        "Közvetlen tapasztalás-séta a témához kapcsolódó tárgyak megfigyelésére",
        "Beszélgetőkör a saját otthoni élményekről a témához kapcsolva",
        "Kép-mutogatás könyvekből, családi fényképekből a témáról",
        "Kérdezz-felelek játék gyermeknyelven a témáról",
        "Témához illő szakember meghívása vagy mese-figura látogatása",
        "Csoport-szabályok a témához kapcsolódóan: mit szabad, mit nem",
        "Téma-asztal felállítása a csoportszobában — gyűjtögetés egy hétig",
        "Otthoni feladat: hozzál képet/tárgyat a témához, és mesélj róla",
        "Kis film-részlet vagy zenei betét meghallgatása a témáról",
        "Élményrajz: kedvenc témához kötődő dolog közös megbeszélése",
    ],
    'matematika': [
        "Halmazok alkotása a témához kapcsolódó tárgyakból",
        "Számlálás 5-10-es számkörben tematikus tárgyak alapján",
        "Sorba rendezés méret szerint (kicsi-közepes-nagy)",
        "Több-kevesebb-ugyanannyi gyakorlása képek alapján",
        "Geometriai formák felismerése a témához kapcsolódó tárgyakon",
        "Sorozatok folytatása mintákkal (kép-kép-kép minta)",
        "Páros gyakorlás: ki mellett mi a megfelelő pár",
        "Mérés kis tárgyakkal: ki magasabb, ki rövidebb",
        "Tájékozódás: jobbra, balra, fent, lent — szóbeli irányítás",
        "Mennyiségfogalom: egy, kettő, három tárgy elhelyezése a téma alapján",
    ],
    'verseles_meseles': [
        "Magyar népmese a témához illesztve, közös meséléssel",
        "Mondóka-gyűjtemény: 2-3 témaspecifikus mondóka tanulása",
        "Vers-memoriter ovódásokhoz illő szerzőtől (Weöres, Donászy, Fésűs Éva)",
        "Bábmese a témáról egyszerű bábokkal",
        "Mese-mondó kör: gyermekek folytatják egymás meséit",
        "Képregény-szerű mese-feldolgozás táblán, gyermek-rajzokkal",
        "Csukás István: Pom Pom — egy mesékre illő rövid részlet",
        "Marék Veronika: Boribon/Annipanni mese a témához kapcsolva",
        "Találós kérdések a témáról — gyermekverseskötetekből",
        "Drámajátékos meseismétlés szerepekkel",
    ],
    'rajzolas_festes': [
        "Témához kapcsolódó szabad rajz színes ceruzával",
        "Ujjlenyomatos kép-készítés a témáról",
        "Festés temperával vagy vízfestékkel a témáról",
        "Gyurmázás: figurák vagy tárgyak mintázása",
        "Ragasztott kollázs színes papírból, kartonpapírból",
        "Színezők témához illesztve",
        "Köröm-méretű részletek rajzolása zsírkrétával",
        "Vágás-hajtogatás ollóval (csak középső+ csoportban!) — egyszerű formák",
        "Plakát készítése közösen, mindenki egy elemet hozzátesz",
        "Természetes anyagok (falevél, makk) felhasználása alkotáshoz",
    ],
    'enek_zene': [
        "Magyar népdal vagy gyermekdal a témához (közös éneklés)",
        "Zenehallgatás: Gryllus Vilmos vagy Halász Judit dalai a témáról",
        "Énekes körjáték a témához kapcsolva",
        "Hangszer-ismeretek: csörgő, dob, triangulum hallgatása",
        "Saint-Saëns: Az állatok karneválja — egy részlet (ha állatos a téma)",
        "Népi gyermekdal-ciklus: 3-4 dal egymás után",
        "Egyszerű ritmushangszerek használata énekhez",
        "Csoportos kórus a témához illeszkedő dallal",
        "Saját dal-szöveg írása: ismert dallamra új szavak",
        "Vivaldi: 4 évszak — évszak-specifikus részlet meghallgatása",
    ],
    'hallas_ritmus': [
        "Ritmus visszatapsolás: téma-szavak ritmusának visszaadása",
        "Halk-hangos megkülönböztetése zenére",
        "Gyors-lassú fogalompár gyakorlása a témához kapcsolva",
        "Hangok felismerése: kép-fülbe-tárgy összepárosítás",
        "Saját ritmus alkotása ritmushangszerekkel",
        "Visszhang-játék: pedagógus tapsol, gyerekek visszavágják",
        "Ritmusra mozgás: a téma szerint tapsoljatok!",
        "Hangmagasság-megkülönböztetés: mély-magas dallam azonosítása",
        "Csendben hallgatás: az adott terem hangjai",
        "Szótagolás-tapsolás a téma-tárgyak nevével",
    ],
    'mozgas': [
        "Tornatermi tevékenységek: akadálypálya a téma szerint",
        "Labdás játékok: gurítás, dobás célba",
        "Körjáték a témához illeszkedő dallal",
        "Nagymozgás-utánzás: állatok, járművek mozgása",
        "Fogócska egyszerű szabályokkal a témához kapcsolva",
        "Egyensúlygyakorlatok: padon, kötélen átkelés",
        "Mászó-, csúszó-játékok eszközökön",
        "Csoportban/udvaron végzett mindennapos mozgás: szabad futás",
        "Gyermekjóga a téma motívumaival (állat-pózok stb.)",
        "Bújócska téma-kötődéssel (mit keresünk?)",
    ],
}

with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Csoportositsuk a sablonokat tema-prefix szerint
csoportok = defaultdict(list)
for s in data['sablonok']:
    azon = s['azonosito']
    prefix = azon.replace('_v1', '').replace('_v2', '')
    # Alias: husvet -> husveti_het stb.
    prefix = PREFIX_ALIAS.get(prefix, prefix)
    csoportok[prefix].append(s)

# Epitsuk a bankot
bank = {
    'korcsoport': 'vegyes',
    'korcsoport_cimke': 'Vegyes csoport (3-7 éves)',
    '_megjegyzes': (
        'Otletek-bank a meglevo 81 sablon bulletjeibol epitve. '
        'Tema-prefixenkent (V1+V2+legacy) aggregalva, headerek kiszurve, '
        '10 bullet-re kiegeszitve generic ovodas-tevekenysegekkel.'
    ),
    'temak': {},
}

for tema in EXPECTED_TEMAS:
    if tema not in csoportok:
        print(f'  HIANYZO tema: {tema}')
        continue
    tema_data = {}
    for terulet in TERULETEK:
        # Aggregaljuk a bullet-eket a tema osszes sablonjabol
        bulletek = []
        lattam = set()
        for s in csoportok[tema]:
            tartalom = s['teruletek'].get(terulet, '')
            sorok = [line.strip() for line in tartalom.split('\n') if line.strip()]
            for sor in sorok:
                if is_header(sor):
                    continue
                kulcs = sor.lower()
                if kulcs in lattam:
                    continue
                lattam.add(kulcs)
                bulletek.append(sor)

        # 10-re kiegeszit GENERIC-szel ha kell
        if len(bulletek) < 10:
            for generic in GENERIC_KIEGESZITES.get(terulet, []):
                if len(bulletek) >= 10:
                    break
                # Ne duplazzon kulcsszavakat
                kulcs = generic.lower()
                if kulcs not in lattam:
                    bulletek.append(generic)
                    lattam.add(kulcs)

        # Pontosan 10-re vag
        bulletek = bulletek[:10]
        tema_data[terulet] = bulletek

    bank['temak'][tema] = tema_data

# Mentes
seed_dest = os.path.join(SEED_DIR, 'otletek-bank-vegyes.json')
deploy_dest = os.path.join(DEPLOY_SEED_DIR, 'otletek-bank-vegyes.json')

with open(seed_dest, 'w', encoding='utf-8') as f:
    json.dump(bank, f, ensure_ascii=False, indent=2)
shutil.copy(seed_dest, deploy_dest)

print(f'Mentve: {seed_dest}')
print(f'Mentve: {deploy_dest}')

# Statisztika
osszes_bullet = sum(
    sum(len(tema_data[t]) for t in TERULETEK if t in tema_data)
    for tema_data in bank['temak'].values()
)
print(f'\nOSSZES: {len(bank["temak"])} tema, {osszes_bullet} bullet')

# Per-tema/terulet ellenorzes
print('\nPer-tema bullet-szam (kulso_vilag, matematika, verseles, rajzolas, enek, ritmus, mozgas):')
for tema in EXPECTED_TEMAS:
    if tema in bank['temak']:
        cnt = [len(bank['temak'][tema].get(t, [])) for t in TERULETEK]
        print(f'  {tema:25s} {cnt}')

# A KICSI/KOZEPSO/NAGY bankok ALIAS-kent ugyanezt — mostantol
# a UI csak a kor-cimket valtoztatja, a tartalom ugyanaz
for kc in ['kicsi', 'kozepso', 'nagy']:
    alias_bank = {
        'korcsoport': kc,
        'korcsoport_cimke': {
            'kicsi': 'Kiscsoport (3-4 éves)',
            'kozepso': 'Középső csoport (4-5 éves)',
            'nagy': 'Nagycsoport (5-7 éves)',
        }[kc],
        '_megjegyzes': f'Kor-specifikus bullet generálás folyamatban — egyelőre a vegyes bank ({kc}-szabhatóan).',
        'temak': bank['temak'],
    }
    alias_seed = os.path.join(SEED_DIR, f'otletek-bank-{kc}.json')
    alias_deploy = os.path.join(DEPLOY_SEED_DIR, f'otletek-bank-{kc}.json')
    with open(alias_seed, 'w', encoding='utf-8') as f:
        json.dump(alias_bank, f, ensure_ascii=False, indent=2)
    shutil.copy(alias_seed, alias_deploy)
    print(f'Alias bank: otletek-bank-{kc}.json')
