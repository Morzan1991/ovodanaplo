---
name: OvodaNapló projekt
description: Lokális desktop app a feleségének (óvodapedagógus) heti tervek, foglalkozás-tervezetek, reflexiók készítéséhez. 2026-05-11 indítva, 2026-05-12 alapja működik.
type: project
originSessionId: 1ea729df-ffec-48c4-97f6-b14a2137a56a
---
# OvodaNapló — pedagógiai műhely óvodapedagógusoknak

## Cél
A felhasználó felesége óvodapedagógus, sok dokumentációs munkát végez otthon: heti tervek, projekt-tervek, foglalkozás-tervezetek, reflexiók. Az **OvodaNapló** lokális desktop app, ami ezt automatizálja és KRÉTA-kompatibilis DOCX exportot ad.

## Pozícionálás (NEM helyettesít, kiegészít)
- **oviKRÉTA** (2024 ősz óta kötelező állami óvodáknak): admin/csoportnapló — kötelező
- **OVPED** (kereskedelmi, 2590-3890 Ft/hó): admin + tervezés
- **OvodaNapló**: a pedagógus *gondolkodási és tervezési műhelye* — DOCX-eket gyárt amiket KRÉTA-ba lehet feltölteni

## Felhasználó (induláskor csak ő)
- **Lisztmaier-Csánitz Adrienn**, óvodapedagógus
- **Ajka Városi Óvoda — Patakparti Óvoda, Mazsola csoport** (vegyes, 3-7 év)
- **ONAP** pedagógiai program
- Egyetlen felhasználó az MVP-ben. Megosztás MAJD csak, ha jól működik (3. fázis, opcionális)

## Állapot 2026-05-12
**MŰKÖDIK élesben a feleségénél** — Asztali parancsikon: `C:\Users\Lenovo\Desktop\OvodaNaplo.lnk`

**Fázis 1 (MVP) KÉSZ**:
- 12 SQLite tábla, 192 előtöltött tétel (84 irodalom + 37 ünnep + 71 képesség)
- Heti terv szerkesztő (6 ONAP-terület + lezáró rész) → területek mentődnek
- Projektek/Reflexiók/Irodalom alaplisták
- Beállítások (pedagógus + óvoda + csoport)
- Auto-backup naponta egyszer

**Fázis 2 KÉSZ (2026-05-12)**:
- DOCX export (KRÉTA-kompatibilis, Times New Roman, intézményi formátum)
- Foglalkozás-tervezet részletes szerkesztő (motiváció / fő rész / befejezés)
- Heti reflexió szerkesztő (területenkénti narratív)
- 21 heti-sablon (6 saját + 15 ünnepi/szezon)
- **Sablonválasztó dropdown** új heti terv készítésénél (per-week, NEM évi)
- Adatvédelmi inline figyelmeztetők (SNI/kvázi-azonosító detektor)

## Mappastruktúra
`C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\`
- `app/` — Electron alkalmazás
- `seed/` — irodalom + ünnepek + képességek + sablonok JSON
- `mockups/heti-terv.html` — statikus UI mockup
- `tools/` — fejlesztői segédek (docx-olvasók)
- `PROJECT.md` — fő dokumentum

**Adattár**: `%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db`
