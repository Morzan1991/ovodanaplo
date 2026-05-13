"""Harom javitas:
1. A legacy 21 sablon iskolaElokeszito mezojet vesszovel-elvalasztottrol
   \\n-elvalasztott bullet-listara alakitja (igy a Bullets renderer
   minden kepesseget kulon bullet-be tesz).
2. Kiveszi a NEM ovodas korosztalynak valo irodalmi muveket
   (Pet?fi: Nemzeti dal, Ady Endre: Kar�csony stb.)
   es helyettesiti ovodas-szintu versekkel.
"""
import json
import os
import re

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')

# ============================================================
# 1) IE bullet-elvalasztas — a vesszovel/pontvesszovel-elvalasztott
#    capability-list felbontasa kulon bullet-tagokra
# ============================================================
def normalizal_ie(szoveg: str) -> str:
    """Vesszovel vagy pontvesszovel elvalasztott lista -> \\n-elvalasztott."""
    if not szoveg or not szoveg.strip():
        return szoveg
    if '\n' in szoveg:
        return szoveg  # mar feldolgozott
    # vesszo VAGY pontvesszo VAGY 'ÉS' szon elvalaszt
    parts = re.split(r'[,;]\s*|\s+és\s+', szoveg)
    parts = [p.strip() for p in parts if p.strip()]
    # Kapitalizalas — minden bullet eleje nagy betuvel
    parts = [p[0].upper() + p[1:] if p else p for p in parts]
    return '\n'.join(parts)

# ============================================================
# 2) Felnotti irodalom cseraje ovodas-szintu muvekre
# ============================================================
# Mintak: KULCS -> CSERELO_SZOVEG (vagy '' = torles)
CSEREK = {
    # Pet?fi Nemzeti dal -- kiveves (politikai vers, 12 ev folott valo)
    'Pet?fi S?ndor: Nemzeti dal (r?szlet, csak 1-2 sor)': 'Pet?fi S?ndor: Any?m ty?kja',
    'Pet?fi S?ndor: Nemzeti dal (els? versszak r?szlet)': 'Pet?fi S?ndor: Any?m ty?kja',
    'Pet?fi S?ndor: Nemzeti dal (Talpra magyar - els? versszak)': 'Pet?fi S?ndor: Any?m ty?kja',
    'Pet?fi S?ndor: Nemzeti dal (Talpra magyar — els? versszak)': 'Pet?fi S?ndor: Any?m ty?kja',
    'Pet?fi S?ndor: Nemzeti dal (csak az els? versszak, ?rint?legesen).': 'Pet?fi S?ndor: Any?m ty?kja.',
    # Ady Endre Kar?csony -- ovodaba a Mennybol az angyal es a Pasztorok dalol jol illik
    'Ady Endre: Kar?csony (Harang csend?l)': 'Hull a h?, mindenfel? (n?pi)',
}

# ASCII karakterekkel kell dolgoznom (a Python source nem birja az UTF-8-at jol Windows-on)
# Visszaadom az utf8-as karakterekkel — a JSON UTF-8-as, igy ez ott rendben lesz
# Petőfi-Petőfi:
def cserejavit(szoveg: str) -> str:
    """A felnottnek valo szovegeket kicserljuk ovodaserekre.
    Pattern: keresunk magyaros karaktereket utf8-as forrasszovegben."""
    if not szoveg:
        return szoveg
    eredeti = szoveg

    # 1. Pet?fi S?ndor: Nemzeti dal kulonbozo formakban
    # A Petőfi nev karakteresen utf8: 0x50 0x65 0x74 0xc5 0x91 0x66 0x69
    # A "Nemzeti dal" karaktere ASCII
    szoveg = re.sub(
        r'Pet[őo]fi\s+S[áa]ndor:\s*Nemzeti\s+dal[^\n]*',
        'Petőfi Sándor: Anyám tyúkja',
        szoveg,
    )

    # 2. Ady Endre Kar?csony — kicserelve nepi enekekkel
    szoveg = re.sub(
        r'Ady\s+Endre:\s*Kar[áa]csony[^\n]*',
        'Hull a hó, mindenfelé (népi dal)',
        szoveg,
    )

    return szoveg

# ============================================================

with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

ie_normalizalt = 0
irodalom_csereltek = 0
sablon_irodalmosan_modositott = []

for s in data['sablonok']:
    # 1. iskolaElokeszito normalizalas
    if 'iskolaElokeszito' in s and s['iskolaElokeszito']:
        regi = s['iskolaElokeszito']
        uj = normalizal_ie(regi)
        if uj != regi:
            s['iskolaElokeszito'] = uj
            ie_normalizalt += 1

    # 2. iskolaElokeszitoTeruletek per-area normalizalas (csak ha vesszo-elvalasztott lenne)
    if 'iskolaElokeszitoTeruletek' in s and s['iskolaElokeszitoTeruletek']:
        ietBak = s['iskolaElokeszitoTeruletek']
        for tipus in list(ietBak.keys()):
            ertek = ietBak[tipus]
            if ertek and '\n' not in ertek and (',' in ertek or ';' in ertek):
                ietBak[tipus] = normalizal_ie(ertek)

    # 3. Felnotti irodalom kicserelese ovodasra
    if 'teruletek' in s:
        for tipus in list(s['teruletek'].keys()):
            regi = s['teruletek'][tipus]
            uj = cserejavit(regi)
            if uj != regi:
                s['teruletek'][tipus] = uj
                if s['azonosito'] not in sablon_irodalmosan_modositott:
                    sablon_irodalmosan_modositott.append(s['azonosito'])
                irodalom_csereltek += 1

data['_verzio'] = '2.3'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.3 — javitva: iskolaElokeszito bullet-listava bontva, '
    'felnotti irodalmi muvek (Pet?fi: Nemzeti dal, Ady: Kar?csony) '
    'kicserelve ovodaserekkel.'
)

with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'iskolaElokeszito normalizalt sablonok: {ie_normalizalt}')
print(f'Irodalmi csereletek (mezok szama): {irodalom_csereltek}')
print(f'Erintett sablonok ({len(sablon_irodalmosan_modositott)}):')
for a in sablon_irodalmosan_modositott:
    print(f'  - {a}')

# Pelda
print()
for s in data['sablonok']:
    if s['azonosito'] == 'tanevkezdes':
        print(f'tanevkezdes iskolaElokeszito:')
        for line in s['iskolaElokeszito'].split('\n'):
            print(f'  - {line}')
        break

print()
for s in data['sablonok']:
    if s['azonosito'] == 'marcius_15_v1':
        print(f'marcius_15_v1 verseles_meseles (Nemzeti dal nelkul):')
        for line in s['teruletek']['verseles_meseles'].split('\n'):
            print(f'  - {line}')
        break
