# OvodaNapló — DOCX-formátum-ellenőrzés (KRÉTA-kompatibilis)

Ellenőrzi, hogy a generált .docx fájl pontosan megfelel-e a felhasználó által rendelkezésre bocsátott `Hetiterv üres.docx` mintának (KRÉTA-feltöltéshez).

## Háttér

A felhasználó óvodapedagógus felesége az oviKRÉTA csoportnaplójához tölti fel a DOCX-eket. A formátumnak meg kell egyezniük az intézményi sablonokkal:
- Times New Roman 12pt
- Bullet pontok minden tartalom-sornál
- „Mesék:" / „Mondókák és versek:" alfejezetek
- „Tornatermi tevékenységek:" / „Csoportban/udvaron…" alfejezetek
- Iskola előkészítő tevékenység MINDEN főterület után
- Cél, Feladat, Differenciálás, Módszerek, Képességfejlesztés, Eszközök lezáró rész
- NINCS fejléc (óvoda, csoport, pedagógus, dátum)

## Használat

```
/ovodanaplo-docx-check [--file=path.docx] [--generate-and-check]
```

- **--file**: konkrét .docx fájl
- **--generate-and-check**: új heti tervet generál és exportál, majd ellenőrzi

## Mit ellenőriz

### Lépés 1 — Betűtípus + méret

```python
import zipfile, re
with zipfile.ZipFile(path) as z:
    xml = z.open('word/document.xml').read().decode('utf-8')
```

Elvárt:
- `font='Times New Roman'` minden text-run-ban (közel 100%)
- `size='24'` (= 12pt) minden text-run-ban

### Lépés 2 — Szerkezeti elemek

| Szakasz | Elvárt félkövér cím | Bullet lista a tartalomban? |
|---|---|---|
| 1. Külső világ | "Külső világ tevékeny megismerésére nevelés:" | IGEN |
| 2. Matematikai tartalom | "Matematikai tartalom:" | IGEN |
| 3. Iskola előkészítő | "Iskola előkészítő tevékenység:" | IGEN |
| 4. Verselés, mesélés | "Verselés, mesélés:" | NEM (alfejezetek) |
| 4a. Mesék | "Mesék:" (félkövér) | IGEN |
| 4b. Mondókák és versek | "Mondókák és versek:" (félkövér) | IGEN |
| 5. Iskola előkészítő | "Iskola előkészítő tevékenység:" | IGEN |
| 6. Rajzolás, festés | "Rajzolás, festés, mintázás, építés, képalakítás, kézimunka:" | IGEN |
| 7. Iskola előkészítő | "Iskola előkészítő tevékenység:" | IGEN |
| 8. Ének, zene | "Ének, zene, népi játék, tánc:" | IGEN |
| 9. Hallás és ritmusérzék | "Hallás és ritmusérzék fejlesztés:" | IGEN |
| 10. Iskola előkészítő | "Iskola előkészítő tevékenység:" | IGEN |
| 11. Mindennapos mozgás | "Mindennapos mozgás:" | NEM (alfejezetek) |
| 11a. Tornatermi tev. | "Tornatermi tevékenységek:" | IGEN |
| 11b. Csoportban/udvaron | "Csoportban/udvaron végzett mindennapos mozgás:" | IGEN |
| 12. Iskola előkészítő | "Iskola előkészítő tevékenység:" | IGEN |
| 13. Cél | "Cél: <szöveg>" (egysoros) | NEM |
| 14. Feladat | "Feladat: <szöveg>" | NEM |
| 15. Differenciálás | "Differenciálás: <szöveg>" | NEM |
| 16. Módszerek | "Módszerek: <szöveg>" | NEM |
| 17. Képességfejlesztés | "Képességfejlesztés: <szöveg>" | NEM |
| 18. Eszközök | "Eszközök: <szöveg>" | NEM |

### Lépés 3 — Bullet detektálás

A `<w:numPr>` tag jelzi a bullet listát. Minden tartalom-szekcióban legalább 1 bullet kell legyen (kivéve az alfejezeteket, amelyek csak headerek).

### Lépés 4 — Fejléc HIÁNYA

Ne legyen:
- "Pedagógus:" / "Óvoda:" / "Csoport:" / "Dátum:" — fejléc-jelzők
- A szövegnek a 6 ONAP területtel KELL kezdődnie

### Lépés 5 — Lista-számolás per terület

Minden főterületre:
- min. 3 bullet (de az új V1/V2-ben 5-10 között legyen)

## Kimenet

```
## DOCX-check — heti-terv-2026-12-08-mikulas.docx (45 KB)

| # | Szakasz | Állapot | Bullet | Részletek |
|---|---|---|---|---|
| 1 | Betűtípus | ✅ | — | 100% Times New Roman, 12pt |
| 2 | Külső világ | ✅ | 5 bullet | OK |
| 3 | Matematika | ✅ | 4 bullet | OK |
| 4 | IE-1 (Külső+Mat) | ✅ | 8 bullet | OK |
| 5 | Verselés | ✅ | 2 alfejezet | Mesék (3) + Mondókák (5) |
| 6 | IE-2 (Verselés) | ✅ | 5 bullet | OK |
| 7 | Rajzolás | ✅ | 5 bullet | OK |
| 8 | IE-3 (Rajzolás) | ✅ | 6 bullet | OK |
| 9 | Ének | ✅ | 5 bullet | OK |
| 10 | Hallás-ritmus | ✅ | 3 bullet | OK |
| 11 | IE-4 (Ének) | ✅ | 5 bullet | OK |
| 12 | Mozgás | ✅ | 2 alfejezet | Tornatermi (5) + Csoportban (3) |
| 13 | IE-5 (Mozgás) | ✅ | 6 bullet | OK |
| 14 | Cél | ✅ | — | egysoros |
| 15 | Feladat | ✅ | — | egysoros |
| 16 | Differenciálás | ✅ | — | alapszöveg |
| 17 | Módszerek | ✅ | — | alapszöveg |
| 18 | Képességfejlesztés | ✅ | — | OK |
| 19 | Eszközök | ✅ | — | OK |
| 20 | Fejléc hiánya | ✅ | — | nincs Pedagógus:/Óvoda: stb. |

**Összesített: ✅ PASS** — minden 20 szekció OK, KRÉTA-kompatibilis.

### Statisztika
- Összes bullet: 73
- Összes szakasz: 12 főterület + 5 IE-szakasz + 6 lezáró = 23
- DOCX méret: 45 KB
- Szöveg-hossz: ~7800 karakter
```

## Hibakezelés

- Ha nem .docx → STOP
- Ha tar/zip extract FAIL → "DOCX sérült"
- Ha betűtípus !=Times New Roman → WARN (KRÉTA tolerálhatja, de elvárt)
- Ha bullet hiányzik egy szekcióban → FAIL (KRÉTA-felhasználói panasz lehet)
