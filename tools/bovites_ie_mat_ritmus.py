"""Kibővíti az új 60 sablon iskolaElokeszitoTeruletek mezeit:
- kulso_vilag IE: a meglévő + a matematika IE (a minta szerint közös block)
- enek_zene IE: a meglévő + a hallas_ritmus IE (a minta szerint közös block)

A mintaformátum (Húsvét, Közlekedés, Tavasz, Könyv hét) szerint:
- Külső világ + Matematika BLOCKOK után 1 közös "Iskola előkészítő tevékenység" jön,
  amibe MINDKETTŐ képességei be vannak gyúrva.
- Ének + Hallás-ritmus BLOCKOK után 1 közös IE jön.

Ezért a sablonjaim iskolaElokeszitoTeruletek.kulso_vilag-ját a matematika releváns
képességeivel bővítem, és az enek_zene-t a hallás-ritmus képességeivel.
"""
import json
import os

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')

# Matematika-specifikus IE elemek (sablonokhoz kibővítjük a kulso_vilag IE-t)
MATEMATIKA_IE_DEFAULT = [
    "Számfogalom 10-es körben",
    "Mennyiségi viszonyok (több-kevesebb-ugyanannyi)",
    "Halmazalkotás",
    "Sorba rendezés",
    "Formák felismerése",
]

# Hallás-ritmus specifikus IE elemek (enek_zene IE bővítés)
RITMUS_IE_DEFAULT = [
    "Auditív figyelem",
    "Ritmus és hallásfejlesztés",
    "Auditív megkülönböztetés (gyors-lassú, halk-hangos)",
]

with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

bovited = 0
for s in data['sablonok']:
    if not s.get('verzio'):
        continue  # csak az új V1/V2 sablonokra
    ie = s.get('iskolaElokeszitoTeruletek')
    if not ie:
        continue

    # kulso_vilag IE bővítés matematika képességekkel
    if 'kulso_vilag' in ie:
        meglevo = ie['kulso_vilag']
        meglevo_lower = meglevo.lower()
        kiegeszites = []
        for mat in MATEMATIKA_IE_DEFAULT:
            # Ha még nem szerepel, hozzáadjuk
            if not any(s.lower() in meglevo_lower for s in mat.split()):
                kiegeszites.append(mat)
        if kiegeszites:
            ie['kulso_vilag'] = meglevo.rstrip() + '\n' + '\n'.join(kiegeszites)

    # enek_zene IE bővítés ritmus képességekkel
    if 'enek_zene' in ie:
        meglevo = ie['enek_zene']
        meglevo_lower = meglevo.lower()
        kiegeszites = []
        for r in RITMUS_IE_DEFAULT:
            if not any(s.lower() in meglevo_lower for s in r.split() if len(s) > 3):
                kiegeszites.append(r)
        if kiegeszites:
            ie['enek_zene'] = meglevo.rstrip() + '\n' + '\n'.join(kiegeszites)

    bovited += 1

data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.1 — iskolaElokeszitoTeruletek kibovitve. '
    'A felhasznalo Hetiterv ures.docx mintaja szerint a matematika + kulso_vilag block '
    'kozos iskolaElokeszito-t kap (most osszevont kepessegekkel), valamint az enek + '
    'hallas-ritmus block is kozos IE-t kap. A regi 21 sablon valtozatlan.'
)
data['_verzio'] = '2.1'

with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Bovitett sablonok: {bovited}')
print(f'Osszes sablon: {len(data["sablonok"])}')
print(f'Mentve: {TEMPLATES}')

# Pelda ellenőrzés
for s in data['sablonok']:
    if s['azonosito'] == 'mikulas_v1':
        print(f'\n=== {s["azonosito"]} iskolaElokeszitoTeruletek ===')
        for k, v in s['iskolaElokeszitoTeruletek'].items():
            print(f'\n[{k}]:')
            print(v)
