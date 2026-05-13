"""Kiszedi a felnotti/iskolas verseket es muveket a literature.json-bol.

A felhasznalo (ovodapedagogus felesege) kerese: csak ovodas-szintu irodalom.
Konkretan a kepernyokepen latott: A Tisza, A Toldi esteje (reszlet) - kivenni.
+ minden Kosztolanyi, Babits, Ady, hosszu eposz reszlet, politikai/szerelmes felnotti vers.
"""
import json
import os
import shutil

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
LITERATURE = os.path.join(BASE, 'seed', 'literature.json')
DEPLOY_LIT = os.path.join(BASE, 'app', 'dist-installer', 'win-unpacked', 'resources', 'seed', 'literature.json')

# Kiveeendo muvek - (cim, szerzo) parok
KIVEENDO = [
    # Petofi - felnotti
    ('Nemzeti dal', 'Petőfi Sándor'),
    ('A Tisza', 'Petőfi Sándor'),
    ('Fa leszek, ha...', 'Petőfi Sándor'),
    ('Falu végén kurta kocsma', 'Petőfi Sándor'),
    ('Füstbe ment terv', 'Petőfi Sándor'),
    ('Az árva kislány', 'Petőfi Sándor'),
    ('Szeptember végén', 'Petőfi Sándor'),
    ('John the Hero (János vitéz részlete)', 'Petőfi Sándor'),
    # Arany - iskolai eposz/ballada
    ('Toldi (első ének részlete)', 'Arany János'),
    ('A fülemile', 'Arany János'),
    ('Szondi két apródja', 'Arany János'),
    ('A Toldi estéje (részlet)', 'Arany János'),
    # Vorosmarty - felnotti
    ('Szózat', 'Vörösmarty Mihály'),
    ('A vén cigány', 'Vörösmarty Mihály'),
    # Kosztolanyi - mind felnotti
    ('Hajnali részegség', 'Kosztolányi Dezső'),
    ('Mostan színes tintákról álmodom', 'Kosztolányi Dezső'),
    ('Boldog, szomorú dal', 'Kosztolányi Dezső'),
    ('Ilona', 'Kosztolányi Dezső'),
    # Babits - felnotti
    ('Új leoninusok', 'Babits Mihály'),
    ('Esti kérdés', 'Babits Mihály'),
    # Ady - felnotti (NEM ovodasnak)
    ('Karácsony', 'Ady Endre'),
    ('Karácsonyi ének (Karácsony)', 'Ady Endre'),
    ('Őrizem a szemed', 'Ady Endre'),
    ('Fél-fáldobott kő', 'Ady Endre'),
    # Toth Arpad - felnotti
    ('Esti sugárkoszorú', 'Tóth Árpád'),
    ('Körúti hajnal', 'Tóth Árpád'),
    # Jozsef Attila - csak a felnottiek
    ('Kertész leszek', 'József Attila'),
    # Nepmonda - Toldi iskolai
    ('Toldi Miklós', None),  # nepi
]

# Konvertaljuk lower-case parokra a robusztus egyezeshez
def normalize(s):
    if s is None:
        return ''
    return s.strip().lower()

KIVEENDO_PARS = set((normalize(c), normalize(sz)) for c, sz in KIVEENDO)

with open(LITERATURE, 'r', encoding='utf-8') as f:
    data = json.load(f)

eredeti_db = len(data['tetelek'])
megtartott = []
kivett = []

for t in data['tetelek']:
    par = (normalize(t.get('cim', '')), normalize(t.get('szerzo', '') or ''))
    if par in KIVEENDO_PARS:
        kivett.append(t)
    else:
        megtartott.append(t)

data['tetelek'] = megtartott
data['_verzio'] = '2.6'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Irodalmi adatbazis 2.6 — felnotti/iskolas muvek kiszedve (Kosztolanyi, '
    'Babits, Ady, Vorosmarty, Toth Arpad, hosszu Arany-eposzok, Petofi szerelmes '
    'versek, "Toldi" nepmonda iskolai). CSAK ovodas-szintu mara talalhato itt.'
)

# Mentes
with open(LITERATURE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
shutil.copy(LITERATURE, DEPLOY_LIT)

print(f'Eredeti db: {eredeti_db}')
print(f'Kivett (felnotti/iskolas): {len(kivett)}')
print(f'Megtartott (ovodas): {len(data["tetelek"])}')
print()
print('=== Kivett muvek ===')
for k in kivett:
    print(f'  - {k["cim"]:50s} -- {k.get("szerzo","nepi")}')

print()
print(f'Mentve: {LITERATURE}')
print(f'Deploy: {DEPLOY_LIT}')
