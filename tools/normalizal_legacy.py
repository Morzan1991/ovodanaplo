"""Normalizalja a regi 21 sablon `teruletek` mezeit `\n`-elvalasztott bullet-listara.

Lepesek:
1. Pontnal (.!?) + space + nagy kezdobetu utan ujsor.
2. verseles_meseles: "Mese: X. Mondokak: Y. Vers: Z" ->
   "Mesek:\nX\nMondokak es versek:\nY\nZ" formaba.
3. mozgas: "Tornateremben: X. Csoportban: Y" ->
   "Tornatermi tevekenysegek:\nX\nCsoportban/udvaron vegzett mindennapos mozgas:\nY"
4. enek_zene: "X. Y. Zh.: Z" -> "X\nY\nZh.: Z"

Csak a 21 legacy sablonra (verzio=null) — az uj V1/V2 sablonok mar megfeleloek.
"""
import json
import os
import re

BASE = r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo'
TEMPLATES = os.path.join(BASE, 'seed', 'weekly-templates.json')

# Magyar nagy kezdobetuk
HU_UPPER = r'A-ZÁÉÍÓÖŐÚÜŰ'

def split_mondatok(szoveg: str) -> list[str]:
    """Pontnal/felkialtonal/kerdojelnel + space + nagy betu utan bont.
    A "Pl.:", "stb.", "kb." rovidiseseket ostartja."""
    if not szoveg or not szoveg.strip():
        return []

    # Védjük a rövidítéseket (ideiglenes csere)
    PLACEHOLDER = ''  # nem-szöveges karakter
    text = szoveg
    rovid = ['Pl.', 'pl.', 'Stb.', 'stb.', 'Kb.', 'kb.', 'Ún.', 'ún.', 'Ld.', 'ld.', 'Vö.', 'vö.', 'Sz.', 'sz.']
    for r in rovid:
        text = text.replace(r, r.replace('.', PLACEHOLDER))

    # Most már bonthatunk
    parts = re.split(rf'(?<=[.!?])\s+(?=[{HU_UPPER}])', text)

    # Visszaalakítás
    parts = [p.replace(PLACEHOLDER, '.').strip() for p in parts]
    parts = [p for p in parts if p]
    return parts

def normalizal_verseles(szoveg: str) -> str:
    """A 'Mese: X. Mondokak: Y. Vers: Z' formatumot bontja fel feliclekkel."""
    if not szoveg.strip():
        return szoveg

    # "Mese:" / "Mesék:" -> Mesek alfejezet kezdo
    # "Mondóka:" / "Mondókák:" -> Mondokak alfejezet
    # "Vers:" -> Mondokak es versek alfejezethez tartozzon

    # Felmondatosan bontunk
    mondatok = split_mondatok(szoveg)

    mesek_resz = []
    mondokak_resz = []
    vers_resz = []
    mode = None  # 'mese', 'mondoka', 'vers'

    for m in mondatok:
        m_lower = m.lower()
        # Mese fejléc - kezdődik "Mese:" vagy "Mesék:"
        mese_match = re.match(r'^Mes[éeè]?k?\s*:\s*(.+)$', m, re.IGNORECASE)
        mondoka_match = re.match(r'^Mond[óoóö]?k[aáá]?k?\s*:\s*(.+)$', m, re.IGNORECASE)
        vers_match = re.match(r'^Vers(?:ek)?\s*:\s*(.+)$', m, re.IGNORECASE)

        if mese_match:
            mode = 'mese'
            mesek_resz.append(mese_match.group(1).strip())
        elif mondoka_match:
            mode = 'mondoka'
            mondokak_resz.append(mondoka_match.group(1).strip())
        elif vers_match:
            mode = 'vers'
            vers_resz.append(vers_match.group(1).strip())
        else:
            # Folytatás az aktuális módban
            if mode == 'mese':
                mesek_resz.append(m)
            elif mode == 'mondoka':
                mondokak_resz.append(m)
            elif mode == 'vers':
                vers_resz.append(m)
            else:
                # Nincs még mód — egyszerű felsorolásként
                mesek_resz.append(m)

    parts = []
    if mesek_resz:
        # Felbontjuk a ";" elválasztott felsorolásokat is
        mesek_finom = []
        for m in mesek_resz:
            for sub in re.split(r';\s*', m):
                if sub.strip():
                    mesek_finom.append(sub.strip())
        parts.append('Mesék:')
        parts.extend(mesek_finom)

    if mondokak_resz or vers_resz:
        mondokak_versek = []
        for m in mondokak_resz:
            for sub in re.split(r';\s*', m):
                if sub.strip():
                    mondokak_versek.append(sub.strip())
        for v in vers_resz:
            for sub in re.split(r';\s*', v):
                if sub.strip():
                    mondokak_versek.append(sub.strip())
        if mondokak_versek:
            parts.append('Mondókák és versek:')
            parts.extend(mondokak_versek)

    return '\n'.join(parts) if parts else szoveg

def normalizal_mozgas(szoveg: str) -> str:
    """Mozgas mezo bontasa Tornaterem/Csoportban resztekre."""
    if not szoveg.strip():
        return szoveg

    # Keresnenk "Tornateremben:" vagy "Tornatermi tevékenységek:" subheaders
    torna_re = r'(?:Tornater(?:em(?:ben)?|mi)\s+tev[ée]kenys[ée]gek)?\s*:\s*(.*?)(?=Csoportban|$)'
    csoport_re = r'Csoportban[/\\]?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*(.*?)$'

    has_torna = re.search(r'\bTornaterem(?:ben)?\b|\bTornatermi\b', szoveg, re.IGNORECASE)
    has_csoport = re.search(r'\bCsoportban\b', szoveg, re.IGNORECASE)

    if not has_torna and not has_csoport:
        # Egyszerű bontas mondatonkent
        mondatok = split_mondatok(szoveg)
        return '\n'.join(mondatok)

    # Felosztas
    parts = []
    # Próbáljuk megtalálni "Tornateremben:" vagy hasonló prefix után a tartalmat
    # és "Csoportban:" után a következőt

    torna_match = re.search(r'Tornater(?:em(?:ben)?|mi\s+tev[ée]kenys[ée]gek)\s*:\s*', szoveg, re.IGNORECASE)
    csoport_match = re.search(r'Csoportban[/\\]?(?:udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s|.*?\s+v[ée]gzett.*?mozg[áa]s|.*?mozg[áa]s)?\s*:\s*', szoveg, re.IGNORECASE)

    elotte = ''
    torna_resz = ''
    csoport_resz = ''

    if torna_match and csoport_match:
        elotte = szoveg[:torna_match.start()].strip()
        torna_resz = szoveg[torna_match.end():csoport_match.start()].strip()
        csoport_resz = szoveg[csoport_match.end():].strip()
    elif torna_match:
        elotte = szoveg[:torna_match.start()].strip()
        torna_resz = szoveg[torna_match.end():].strip()
    elif csoport_match:
        elotte = szoveg[:csoport_match.start()].strip()
        csoport_resz = szoveg[csoport_match.end():].strip()

    if elotte:
        parts.extend(split_mondatok(elotte))
    if torna_resz:
        parts.append('Tornatermi tevékenységek:')
        parts.extend(split_mondatok(torna_resz))
    if csoport_resz:
        parts.append('Csoportban/udvaron végzett mindennapos mozgás:')
        parts.extend(split_mondatok(csoport_resz))

    return '\n'.join(parts)

def normalizal_egyszeru(szoveg: str) -> str:
    """Egyszerű bontás pontoknál."""
    if not szoveg or not szoveg.strip():
        return szoveg
    mondatok = split_mondatok(szoveg)
    return '\n'.join(mondatok) if mondatok else szoveg

# ============================================================

with open(TEMPLATES, 'r', encoding='utf-8') as f:
    data = json.load(f)

normalizalt = 0
for s in data['sablonok']:
    if s.get('verzio'):
        continue  # csak legacy (verzio=null)

    teruletek = s.get('teruletek', {})
    if not teruletek:
        continue

    for tipus, tartalom in list(teruletek.items()):
        if not tartalom or not tartalom.strip():
            continue
        # Ha mar `\n`-t tartalmaz, hagyjuk
        if '\n' in tartalom:
            continue

        if tipus == 'verseles_meseles':
            teruletek[tipus] = normalizal_verseles(tartalom)
        elif tipus == 'mozgas':
            teruletek[tipus] = normalizal_mozgas(tartalom)
        else:
            teruletek[tipus] = normalizal_egyszeru(tartalom)

    normalizalt += 1

data['_verzio'] = '2.2'
data['_utolso_frissites'] = '2026-05-12'
data['_megjegyzes'] = (
    'Heti terv sablonok 2.2 — a regi 21 sablon teruletek-tartalma is '
    'felbontva \\n-elvalasztott bullet-listava, igy a DOCX export es a '
    'DokumentumNezet ugyanugy bullet-pontokkal jelenitti meg, mint a '
    'felhasznalo Hetiterv ures.docx mintajan. Az uj 60 V1/V2 sablon '
    'valtozatlan.'
)

with open(TEMPLATES, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Normalizalt legacy sablonok: {normalizalt}')
print(f'Mentve: {TEMPLATES}')

# Pelda
for s in data['sablonok']:
    if s['azonosito'] == 'osz_kezdete':
        print()
        print('=== osz_kezdete normalizalt ===')
        for k, v in s['teruletek'].items():
            print(f'\n[{k}]:')
            for line in v.split('\n'):
                print(f'   - {line}')
        break
