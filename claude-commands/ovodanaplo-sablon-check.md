# OvodaNapló — Sablon-validátor

Komplett ellenőrzés a `seed/weekly-templates.json` minőségére. 6 szekció: struktúra, irodalmi tartalom, bullet-szám, iskolaElokeszitoTeruletek, körjáték/header-szabályok, JSON-validitás.

## Használat

```
/ovodanaplo-sablon-check [--fix] [--tema=mikulas]
```

- **--fix**: ha lehetséges, automatikusan javít (pl. iskolaElokeszitoTeruletek hozzáadás, körjáték áthelyezés)
- **--tema=NEV**: csak az adott témára (mikulas, husveti_het, stb.) — gyors ellenőrzés

## Mit ellenőriz

### Lépés 1 — JSON struktúra (CRITICAL)

```python
import json
data = json.load(open(r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\seed\weekly-templates.json', encoding='utf-8'))
```

Kötelező mezők minden sablonra:
- `azonosito` (string, kötelező, unique)
- `cim` (string, kötelező)
- `kategoria` (string, kötelező — pl. ovodai, vilagunnep, nephagyomany)
- `javasoltHonap` (int, 1-12)
- `tema`, `cel`, `feladat` (string)
- `teruletek` (object, 7 kulcs)
- `kepessegfejlesztes`, `eszkozok` (string)

Új V1/V2 sablonokon:
- `verzio` (1 vagy 2)
- `iskolaElokeszitoTeruletek` (object, 5 kulcs: kulso_vilag, verseles_meseles, rajzolas_festes, enek_zene, mozgas)

### Lépés 2 — Felnőtt irodalom DETEKTÁLÁS (HIGH)

NE engedjük a következőket:
```
TILTOTT_SZERZOK_MUVEK = [
    'Nemzeti dal', 'A Tisza', 'walesi bárdok', 'Toldi',
    'Ady Endre: Karácsony', 'Ady Endre: Karácsony (Harang csendül)',
    'Vörösmarty', 'Madách', 'Janus Pannonius', 'Berzsenyi', 'Bessenyei',
    'Kosztolányi: Esti', 'Babits Mihály: Esti',
    'Kazinczy', 'Tompa Mihály', 'Szózat', 'Himnusz teljes szöveg',
]
```

Megengedett szerzők (whitelist):
```
ENGEDETT_SZERZOK = [
    'Petőfi Sándor: Anyám tyúkja', 'Petőfi Sándor: Itt van az ősz, itt van újra',
    'Móra Ferenc', 'József Attila: Altató', 'Arany János népdalok',
    'Weöres Sándor', 'Csukás István', 'Lázár Ervin',
    'Marék Veronika', 'Donászy Magda', 'Fésűs Éva',
    'Gazdag Erzsi', 'Mentovics Éva', 'Nemes Nagy Ágnes',
    'Bartos Erika', 'Berg Judit', 'Zelk Zoltán',
    # népi: mondókák, dalok, mesék
]
```

Minden sablon `verseles_meseles` és `enek_zene` területén végigfutni, és minden 
ismeretlen szerzőre FIGYELMEZTETÉS.

### Lépés 3 — Bullet-szám ellenőrzés (MEDIUM)

Minden téma × terület párra elvárt min. 4 bullet (a sablon-szintű minimum).
Új V1/V2 sablonokon min. 5-6 bullet.

```python
ELVART_MIN_BULLETS = {
    'kulso_vilag': 4, 'matematika': 4,
    'verseles_meseles': 6,  # Mesék + Mondókák
    'rajzolas_festes': 4, 'enek_zene': 4, 'hallas_ritmus': 2,
    'mozgas': 4,  # Tornatermi + Csoportban/udvaron
}
```

### Lépés 4 — iskolaElokeszitoTeruletek (HIGH)

Minden sablonon legyen 5 főterületre:
- `kulso_vilag`, `verseles_meseles`, `rajzolas_festes`, `enek_zene`, `mozgas`

Egy területnek MIN 4 sora.

### Lépés 5 — Strukturális szabályok

- **Verselés-mesélés**: tartalom kezdődjön "Mesék:" vagy "Mondókák és versek:" header-rel
- **Mozgás**: tartalom kezdődjön "Tornatermi tevékenységek:" vagy "Csoportban/udvaron végzett mindennapos mozgás:" header-rel
- **Körjáték prefixes sor** csak az `enek_zene` területen! Ha mozgásban van → FAIL.

### Lépés 6 — Téma-prefix dedup

Téma-csoportokat (`prefix = azonosito.replace(/_v[12]$/, '')`) dedupeld:
- Minden prefixnek legyen 1-3 sablonja (legacy + V1 + V2 max)
- Egyetlen téma-csoport SE legyen csak 1 sablon (jelezzük WARN-nal, ha bővítendő)

## Kimenet

```
## Sablon-check — 2026-05-12

| Téma | Sablonok | Bullet/terület | IE-területek | Irodalom | Strukturális |
|---|---|---|---|---|---|
| tanevkezdes | 3 (1+V1+V2) | [10,10,10,10,10,10,10] ✓ | 5/5 ✓ | OK | OK |
| osz_termenyek | 3 | [10,10,10,...] | 5/5 ✓ | OK | OK |
| mikulas | 3 | [...] | 5/5 ✓ | ⚠ Krampusz (kétséges) | OK |
| husvet | 1 ⚠ | [4,3,5,3,3,2,2] ⚠ kevés | 5/5 ✓ | OK | OK |
| ... | | | | | |

### Statisztika
- 33 téma, 85 sablon
- 0 CRITICAL hiba
- 2 HIGH FAIL: Ady Endre: Karácsony (karacsony_v2)... → már javítva
- 3 MEDIUM WARN: kevés bullet 3 témánál

### Javasolt fix-ek (ha --fix)
1. Bővítsd a `husvet` legacy sablon bulletjeit 10-re
2. Cseréld le az Ady Endre: Karácsony hivatkozást
```

## Hibakezelés

- Ha a JSON parse FAIL → STOP, kiírja a hibasort
- Ha `_verzio` < '2.5' → WARN "régi sablon-formátum"
