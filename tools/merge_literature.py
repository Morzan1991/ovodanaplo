"""Összefűzi az 5 agent JSON kimenetét a meglévő literature.json-be.
Dedupol cím+szerző kulcs alapján — a meglévő nyer (nem írjuk felül).
"""
import json
import os

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
LITERATURE = os.path.join(BASE, 'seed', 'literature.json')
AGENT_DIR = os.path.join(BASE, 'tools', 'agent-outputs')

agent_files = [
    '01_klasszikus_pd.json',
    '02_nepi.json',
    '03_nepmesek.json',
    '04_kortars.json',
    '05_nemzetkozi.json',
]

# Meglévő literature.json
with open(LITERATURE, 'r', encoding='utf-8') as f:
    data = json.load(f)

meglevo_kulcsok = set()
for t in data['tetelek']:
    cim = t.get('cim', '').strip()
    szerzo = t.get('szerzo')
    kulcs = (cim.lower(), szerzo.lower() if szerzo else None)
    meglevo_kulcsok.add(kulcs)

print(f'Meglevo tetelek: {len(data["tetelek"])}')
print(f'Meglevo egyedi kulcsok: {len(meglevo_kulcsok)}')

# Új tételek
agent_count = 0
duplikalt = 0
hozzaadott = 0
for fn in agent_files:
    path = os.path.join(AGENT_DIR, fn)
    if not os.path.exists(path):
        print(f'HIBA: {fn} nem letezik')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        agent_data = json.load(f)
    print(f'\n[{fn}] tetelek: {len(agent_data)}')
    agent_count += len(agent_data)
    for tetel in agent_data:
        cim = tetel.get('cim', '').strip()
        szerzo = tetel.get('szerzo')
        kulcs = (cim.lower(), szerzo.lower() if szerzo else None)
        if kulcs in meglevo_kulcsok:
            duplikalt += 1
            continue
        # Validacios szuro - cim ures? skip
        if not cim:
            print(f'  HIBA: ures cim, kihagyva')
            continue
        # Tipus ellenorzes
        valid_tipusok = {'vers','mese','mondoka','nepmese','dal','zenehallgatas','talalos_kerdes','koreplay','altato','nepmonda','regeny','verseskotet'}
        if tetel.get('tipus') not in valid_tipusok:
            print(f'  FIGYELMEZTETES: ismeretlen tipus "{tetel.get("tipus")}" - "{cim}"')
            # Mappolas
            if tetel.get('tipus') == 'nepmonda':
                tetel['tipus'] = 'nepmese'  # nincs nepmonda enum, leszorit nepmese-re
            elif tetel.get('tipus') == 'altato':
                tetel['tipus'] = 'dal'  # nincs altato enum, dal-ra leszorit
            elif tetel.get('tipus') == 'regeny':
                tetel['tipus'] = 'mese'  # nincs regeny enum, mese-re leszorit
            elif tetel.get('tipus') == 'verseskotet':
                tetel['tipus'] = 'vers'  # vers-re leszorit
            else:
                print(f'    --> kihagyva (nincs map)')
                continue
        data['tetelek'].append(tetel)
        meglevo_kulcsok.add(kulcs)
        hozzaadott += 1

print(f'\nOSSZEFOGLALO:')
print(f'  Agent osszes tetel: {agent_count}')
print(f'  Duplikalt (meglevo cim+szerzo, kihagyva): {duplikalt}')
print(f'  Hozzaadott: {hozzaadott}')
print(f'  Vegso DB merete: {len(data["tetelek"])}')

# Verzio frissites
data['_verzio'] = '2.0'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Irodalmi adatbazis 2.0 — bovitett 5 agent-kutatassal. '
    'Csak valos, letezo szerzok es muvek. Szovegek kozkincs (PD) muveknel: '
    'Petofi, Mora Ferenc, Jozsef Attila, Arany Janos, Ady, Kosztolanyi, '
    'nepi mondokak, nepdalok, nepmesek. Kortars szerzok (Weores, Csukas, '
    'Lazar Ervin, Marek Veronika, stb.) csak cim+szerzo+forras, copyright. '
    'A felhasznalo 15 doksijabol + ONAP keretrendszer + magyar gyermekirodalom. '
    'AI SOHA nem generalhat uj muvet ide.'
)

# Mentes
with open(LITERATURE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'\nMentve: {LITERATURE}')

# Kategoriankenti osszesites
tipus_count = {}
for t in data['tetelek']:
    tipus_count[t['tipus']] = tipus_count.get(t['tipus'], 0) + 1
print(f'\nTipusonkent:')
for tipus, count in sorted(tipus_count.items()):
    print(f'  {tipus}: {count}')

# Szoveggel/szoveg nelkul
szoveggel = sum(1 for t in data['tetelek'] if t.get('szoveg'))
print(f'\nSzoveggel: {szoveggel} / {len(data["tetelek"])}')
