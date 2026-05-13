"""Reads the 4 sample docx files with detailed formatting preservation."""
import zipfile
import re
import os
import sys

downloads = r'C:\Users\Lenovo\Downloads'
files = [
    'Húsvéti hét.docx',
    'Kozlekedes_het.docx',
    'Tavasz hét.docx',
    'Könyv heti terv.docx',
]

sys.stdout.reconfigure(encoding='utf-8')

for f in files:
    path = os.path.join(downloads, f)
    print(f'\n\n{"="*80}\n========== {f} ==========\n{"="*80}\n')
    try:
        with zipfile.ZipFile(path) as z:
            with z.open('word/document.xml') as xml:
                content = xml.read().decode('utf-8')
                # Preserve list/numbering markers
                content = re.sub(r'<w:numPr[^>]*>.*?</w:numPr>', '[LIST]', content, flags=re.DOTALL)
                content = re.sub(r'<w:tab[^/>]*/>', '\t', content)
                content = re.sub(r'<w:br[^/>]*/>', '\n', content)
                content = re.sub(r'</w:p>', '\n', content)
                content = re.sub(r'</w:tr>', '\n--ROW--\n', content)
                content = re.sub(r'</w:tc>', ' | ', content)
                # Bold markers
                content = re.sub(r'<w:b\s*/>', '[B]', content)
                content = re.sub(r'<w:b\s+[^/]*/>', '[B]', content)
                text = re.sub(r'<[^>]+>', '', content)
                text = re.sub(r'[ \t]+', ' ', text)
                text = re.sub(r'\n\s*\n+', '\n\n', text)
                print(text.strip())
    except Exception as e:
        print(f'HIBA: {e}')
