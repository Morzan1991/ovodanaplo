"""Összefűzi az 5 agent JSON kimenetét a meglévő weekly-templates.json-be.
Dedupol azonosito kulcs alapján — az ÚJ V1/V2 verziók kapnak prioritást.

A meglévő 21 sablon megőrződik (régi azonosítók: tanevkezdes, osz_kezdete, stb.),
a 60 új sablon hozzáadódik (új azonosítók: tanevkezdes_v1, tanevkezdes_v2, stb.).
Így a sablon-választó UI mindkét formátumot felmutatja.
"""
import json
import os

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')
SABLON_DIR = os.path.join(BASE, 'tools', 'sablon-outputs')

sablon_files = [
    '01_szept_okt.json',
    '02_nov_dec.json',
    '03_jan_feb.json',
    '04_mar_apr.json',
    '05_maj_jun.json',
]

# Meglévő weekly-templates.json
with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

meglevo_azonositok = set()
for s in data['sablonok']:
    azon = s.get('azonosito', '').strip()
    if azon:
        meglevo_azonositok.add(azon)

print(f'Meglevo sablonok: {len(data["sablonok"])}')
print(f'Meglevo azonositok: {sorted(meglevo_azonositok)}')

# Új sablonok beolvasása
agent_count = 0
duplikalt = 0
hozzaadott = 0
hozzaadott_lista = []

for fn in sablon_files:
    path = os.path.join(SABLON_DIR, fn)
    if not os.path.exists(path):
        print(f'HIBA: {fn} nem letezik')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        sablon_data = json.load(f)
    print(f'\n[{fn}] sablonok: {len(sablon_data)}')
    agent_count += len(sablon_data)
    for sablon in sablon_data:
        azon = sablon.get('azonosito', '').strip()
        if not azon:
            print(f'  HIBA: ures azonosito, kihagyva')
            continue
        if azon in meglevo_azonositok:
            duplikalt += 1
            print(f'  Duplikalt: {azon} - kihagyva')
            continue
        # Validate required fields
        if not sablon.get('cim'):
            print(f'  HIBA: ures cim ({azon}), kihagyva')
            continue
        if not sablon.get('teruletek'):
            print(f'  HIBA: nincs teruletek ({azon}), kihagyva')
            continue
        # Default iskolaElokeszito to empty string if missing
        if 'iskolaElokeszito' not in sablon:
            sablon['iskolaElokeszito'] = ''
        # Ensure iskolaElokeszitoTeruletek exists
        if 'iskolaElokeszitoTeruletek' not in sablon:
            sablon['iskolaElokeszitoTeruletek'] = {}
        data['sablonok'].append(sablon)
        meglevo_azonositok.add(azon)
        hozzaadott += 1
        hozzaadott_lista.append(azon)

print(f'\nOSSZEFOGLALO:')
print(f'  Agent osszes sablon: {agent_count}')
print(f'  Duplikalt (meglevo azonosito, kihagyva): {duplikalt}')
print(f'  Hozzaadott: {hozzaadott}')
print(f'  Vegso DB merete: {len(data["sablonok"])}')

# Verzio frissites
data['_verzio'] = '2.0'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.0 — bovitett 5 agent-kutatassal. '
    'Magyar nevelesi evre (szept-jun). Minden tema legalabb 2 valtozatban (V1 + V2). '
    'A felhasznalo Hetiterv ures.docx mintajat koveti: 7 ONAP terulet + '
    '5 iskolaElokeszito (per fo terulet) + cel + feladat + kepessegfejlesztes + eszkozok. '
    'Csak valos magyar gyermekirodalmi szerzok (Petofi, Mora, Jozsef Attila, Weores, '
    'Csukas, Lazar Ervin, Marek Veronika, Donaszy Magda, Fesus Eva, Gazdag Erzsi, '
    'Mentovics Eva, Nemes Nagy Agnes, Bartos Erika, Berg Judit, stb.). '
    'A regi 21 sablon megmarad (visszafele kompatibilis), az uj 60 sablon V1/V2 jelolessel.'
)

# Sablonok rendezese: ovodai nevelesi ev sorrend (szept->jun), majd sorrend, majd azonosito
# Honap remap: 9->1, 10->2, 11->3, 12->4, 1->5, 2->6, 3->7, 4->8, 5->9, 6->10
SCHOOL_YEAR_ORDER = {9:1, 10:2, 11:3, 12:4, 1:5, 2:6, 3:7, 4:8, 5:9, 6:10, 7:11, 8:12}
def sort_key(s):
    honap = s.get('javasoltHonap', 99)
    return (
        SCHOOL_YEAR_ORDER.get(honap, 99),
        s.get('javasoltSorrend', 99),
        s.get('azonosito', 'zzz')
    )
data['sablonok'].sort(key=sort_key)

# Mentes
with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nMentve: {TEMPLATES}')

# Hozzaadott sablonok listazasa
print(f'\nHozzaadott azonositok ({len(hozzaadott_lista)}):')
for azon in sorted(hozzaadott_lista):
    print(f'  + {azon}')

# Kategoriankenti osszesites
kat_count = {}
honap_count = {}
for s in data['sablonok']:
    kat = s.get('kategoria', 'nincs')
    honap = s.get('javasoltHonap', 0)
    kat_count[kat] = kat_count.get(kat, 0) + 1
    honap_count[honap] = honap_count.get(honap, 0) + 1

print(f'\nKategoriankent:')
for kat, count in sorted(kat_count.items()):
    print(f'  {kat}: {count}')

print(f'\nHonaponkent:')
honap_nevek = {9:'szept',10:'okt',11:'nov',12:'dec',1:'jan',2:'feb',3:'mar',4:'apr',5:'maj',6:'jun'}
for honap, count in sorted(honap_count.items()):
    nev = honap_nevek.get(honap, str(honap))
    print(f'  {nev} ({honap}): {count}')
