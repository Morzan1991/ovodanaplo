"""Harom javitas egyben:
1. A 21 legacy sablonhoz hozzaad iskolaElokeszitoTeruletek-et minden fo teruletre
   (kulso_vilag, verseles_meseles, rajzolas_festes, enek_zene, mozgas)
   - igy a dokumentum nezetben mindenhol megjelenik az iskola elokeszito tartalom
2. A 'mozgas' teruleten levo "Korjatek:" prefixu sorokat athelyezi az 'enek_zene'-re
   - korjatek = nepi enek-tanc tevekenyseg, nem nagymotorikus mozgas
3. Frissiti a JSON verziot 2.4-re
"""
import json
import os
import re
import shutil

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')
DEPLOY_TEMPLATES = os.path.join(BASE, 'app', 'dist-installer', 'win-unpacked', 'resources', 'seed', 'weekly-templates.json')

# Terulet-specifikus altalanos iskolaElokeszito kepessegek
# (ha a legacy sablon iskolaElokeszito-jaban nincs kor-szerinti elem)
GENERIC_IE = {
    'kulso_vilag': 'Megfigyelőképesség\nSzókincs\nOk-okozati összefüggés\nFeladatértés\nSzociális készségek',
    'verseles_meseles': 'Szövegértés\nBeszédészlelés és kifejezőkészség\nHallási figyelem\nAuditív emlékezet\nBeszédkedv ösztönzése',
    'rajzolas_festes': 'Finommotorika\nSzem-kéz koordináció\nEszközhasználat\nÖnállóság\nKreatív gondolkodás\nSzépérzék',
    'enek_zene': 'Auditív figyelem\nRitmusérzék\nDallamhallás\nKözös éneklés öröme\nEmlékezet',
    'mozgas': 'Nagymozgások\nTérbeli tájékozódás\nSzabálytudat\nEgyüttműködés\nMozgáskoordináció\nÁllóképesség',
}

with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

ie_modositott = 0
korjatek_athelyezve = 0

for s in data['sablonok']:
    # 1. iskolaElokeszitoTeruletek hianyzik? -> hozzaad
    if not s.get('iskolaElokeszitoTeruletek'):
        # Legacy `iskolaElokeszito` szovege a base
        legacy_ie = s.get('iskolaElokeszito', '').strip()
        ie_per_area = {}
        for terulet, generic in GENERIC_IE.items():
            if terulet == 'kulso_vilag' and legacy_ie:
                # A legacy szovegnek elsosorban a kulso_vilag-hoz megy
                # + altalanos kepessegek
                kombinalt = legacy_ie
                # Ha kevesebb mint 5 sor, kiegeszitjuk generic-szel
                meglevo_sorok = [s.strip() for s in legacy_ie.split('\n') if s.strip()]
                if len(meglevo_sorok) < 5:
                    for line in generic.split('\n'):
                        if line.strip() and line.strip().lower() not in legacy_ie.lower():
                            meglevo_sorok.append(line.strip())
                            if len(meglevo_sorok) >= 6:
                                break
                ie_per_area[terulet] = '\n'.join(meglevo_sorok)
            else:
                ie_per_area[terulet] = generic
        s['iskolaElokeszitoTeruletek'] = ie_per_area
        ie_modositott += 1

    # 2. Korjatek athelyezes: mozgas -> enek_zene
    if 'teruletek' in s and 'mozgas' in s['teruletek']:
        mozgas_tartalom = s['teruletek']['mozgas']
        enek_tartalom = s['teruletek'].get('enek_zene', '')
        # Megkeressük a "Körjáték" prefixű sorokat (case insensitive)
        mozgas_sorok = mozgas_tartalom.split('\n')
        korjatekok = []
        maradni_mozgas = []
        for sor in mozgas_sorok:
            stripped = sor.strip()
            if re.match(r'^K[öo]rj[áa]t[ée]k.*?:', stripped, re.IGNORECASE):
                korjatekok.append(stripped)
                korjatek_athelyezve += 1
            else:
                maradni_mozgas.append(sor)
        if korjatekok:
            s['teruletek']['mozgas'] = '\n'.join(maradni_mozgas)
            # Hozzáfűzzük az enek_zene-hez (új sor + bullets)
            if enek_tartalom and not enek_tartalom.endswith('\n'):
                enek_tartalom += '\n'
            enek_tartalom += '\n'.join(korjatekok)
            s['teruletek']['enek_zene'] = enek_tartalom

# Frissites
data['_verzio'] = '2.4'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.4 — javitva: 21 legacy sablonhoz hozzaadva '
    'iskolaElokeszitoTeruletek (minden fo teruletre), korjatek-sorok athelyezve '
    'a mozgas teruletrol az enek_zene-re (mert nepi enek-tanc tevekenyseg).'
)

# Mentés
with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
shutil.copy(TEMPLATES, DEPLOY_TEMPLATES)

print(f'iskolaElokeszitoTeruletek hozzaadva: {ie_modositott} legacy sablon')
print(f'Korjatek athelyezve mozgas -> enek_zene: {korjatek_athelyezve} sor')
print(f'Mentve: {TEMPLATES}')
print(f'Mentve: {DEPLOY_TEMPLATES}')

# Pelda
for s in data['sablonok']:
    if s['azonosito'] == 'osz_kezdete':
        print()
        print('=== osz_kezdete iskolaElokeszitoTeruletek ===')
        for k, v in s['iskolaElokeszitoTeruletek'].items():
            print(f'\n[{k}]:')
            for line in v.split('\n'):
                print(f'  - {line}')
        print()
        print('=== osz_kezdete mozgas (Korjatek nelkul) ===')
        for line in s['teruletek']['mozgas'].split('\n'):
            print(f'  - {line}')
        print()
        print('=== osz_kezdete enek_zene (Korjatek-kal kiegeszitve) ===')
        for line in s['teruletek']['enek_zene'].split('\n'):
            print(f'  - {line}')
        break
