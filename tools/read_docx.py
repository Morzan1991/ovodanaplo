"""Reads all .docx files from a folder and outputs plain text content."""
import zipfile
import re
import os
import sys

downloads = r'C:\Users\Lenovo\Downloads'
files = [
    'heti tervek értékelése minta.docx',
    'Verselés-mesélés reflexió.docx',
    'Rajzolás, festés, mintázás, kézi munka - reflexió.docx',
    'Tavasz hét.docx',
    'Reflexio_Olvasni_jo.docx',
    'Könyv projektterv.docx',
    'Könyv heti terv.docx',
    'Hetiterv üres.docx',
    'Húsvéti hét.docx',
    'Kozlekedes_het.docx',
    'Fold_napi_jatekok.docx',
    'Anyák napja, család.docx',
    'Fold_napi_reflexio.docx',
    'értékelés felsorolás üres.docx',
    'Foglalkozások hét.docx',
]

sys.stdout.reconfigure(encoding='utf-8')

for f in files:
    path = os.path.join(downloads, f)
    print(f'\n\n========== {f} ==========\n')
    try:
        with zipfile.ZipFile(path) as z:
            with z.open('word/document.xml') as xml:
                content = xml.read().decode('utf-8')
                content = re.sub(r'</w:p>', '\n', content)
                content = re.sub(r'</w:tr>', '\n--ROW--\n', content)
                content = re.sub(r'</w:tc>', ' | ', content)
                text = re.sub(r'<[^>]+>', '', content)
                text = re.sub(r'[ \t]+', ' ', text)
                text = re.sub(r'\n\s*\n+', '\n\n', text)
                print(text.strip())
    except Exception as e:
        print(f'ERROR reading {f}: {e}')
