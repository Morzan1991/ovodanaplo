"""Atmasolja az otletek-bank-{korcsoport}.json fajlokat a seed-mappaba,
es egyseges struktura ellenorzes.

Lepesek:
1. Beolvas mind a 4 agent-kimenetet (kicsi, kozepso, nagy, vegyes)
2. Ellenorzi a strukturat: 31 tema × 7 terulet × 10 bullet
3. Atmasolja a seed/ es a dist-installer/seed/ mappakba
4. Statisztikat ad ki
"""
import json
import os
import shutil

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
SRC_DIR = os.path.join(BASE, 'tools', 'sablon-outputs')
SEED_DIR = os.path.join(BASE, 'seed')
DEPLOY_SEED_DIR = os.path.join(BASE, 'app', 'dist-installer', 'win-unpacked', 'resources', 'seed')

EXPECTED_TEMAS = [
    'tanevkezdes', 'osz_termenyek', 'allatok_vilagnapja', 'tok_fesztival', 'osz_szinek',
    'marton_nap', 'erzsebet_katalin', 'advent', 'mikulas', 'luca_nap', 'karacsony',
    'teli_madaretetes', 'teli_sportok', 'magyar_kultura', 'egeszseges_eletmod', 'farsang', 'matyas_nap',
    'marcius_15', 'tavasz', 'viz_vilagnapja', 'husveti_het', 'kolteszet_napja', 'fold_napja', 'olvasni_jo',
    'anyak_napja_csalad', 'madarak_fak_napja', 'kozlekedes', 'foglalkozasok', 'punkosd', 'gyermeknap', 'evzaro'
]
EXPECTED_TERULETEK = [
    'kulso_vilag', 'matematika', 'verseles_meseles', 'rajzolas_festes',
    'enek_zene', 'hallas_ritmus', 'mozgas'
]
KORCSOPORTOK = ['kicsi', 'kozepso', 'nagy', 'vegyes']

osszesen_bullet = 0
osszesen_hiany = 0

for kc in KORCSOPORTOK:
    src = os.path.join(SRC_DIR, f'otletek-bank-{kc}.json')
    if not os.path.exists(src):
        print(f'[{kc}] HIBA: nem letezik: {src}')
        continue
    with open(src, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f'\n=== {kc} ({data.get("korcsoport_cimke", kc)}) ===')
    temak = data.get('temak', {})
    print(f'  Temak szama: {len(temak)}')

    # Statisztika
    bullet_count = 0
    hianyzo_kombinacio = 0
    for tema in EXPECTED_TEMAS:
        if tema not in temak:
            print(f'  HIANYZO TEMA: {tema}')
            hianyzo_kombinacio += 7
            continue
        for terulet in EXPECTED_TERULETEK:
            if terulet not in temak[tema]:
                print(f'  HIANYZO: {tema}.{terulet}')
                hianyzo_kombinacio += 1
                continue
            sorok = temak[tema][terulet]
            if not isinstance(sorok, list):
                print(f'  HIBA tipus: {tema}.{terulet} nem lista')
                continue
            if len(sorok) < 10:
                print(f'  KEVES BULLET: {tema}.{terulet} - csak {len(sorok)}')
            bullet_count += len(sorok)

    print(f'  Osszes bullet: {bullet_count}')
    print(f'  Hianyzo kombinacio: {hianyzo_kombinacio}')
    osszesen_bullet += bullet_count
    osszesen_hiany += hianyzo_kombinacio

    # Mentes seed-be
    dest_seed = os.path.join(SEED_DIR, f'otletek-bank-{kc}.json')
    shutil.copy(src, dest_seed)
    print(f'  Mentve: {dest_seed}')

    # Mentes deploy-installer-be
    dest_deploy = os.path.join(DEPLOY_SEED_DIR, f'otletek-bank-{kc}.json')
    shutil.copy(src, dest_deploy)
    print(f'  Mentve: {dest_deploy}')

print(f'\nOSSZESITES:')
print(f'  Osszes bullet (mind a 4 korcsoportban): {osszesen_bullet}')
print(f'  Varhato bullet: 31 * 7 * 10 * 4 = {31*7*10*4}')
print(f'  Hianyzo kombinaciok: {osszesen_hiany}')
