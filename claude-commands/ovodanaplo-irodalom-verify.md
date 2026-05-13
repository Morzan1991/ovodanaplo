# OvodaNapló — Irodalom-verifikáció

Ellenőrzi, hogy egy sablonbéli vagy ötlet-banki bullet ÓVODÁS-szintű irodalmi tartalmat tartalmaz-e. Megengedett szerzők (whitelist) + tiltott művek (blacklist).

## Háttér

A felhasználó kérése: **csak valós, létező, óvodás-szintű művek**. Korábban detektálva: Petőfi "Nemzeti dal", Ady "Karácsony", Toldi, Tisza — ezeket kicseréltük. Ez a skill automatikusan keres új előfordulásokat.

## Használat

```
/ovodanaplo-irodalom-verify [--fix] [--source=sablon|otletek-bank|mind]
```

- **--fix**: automatikusan ki cseréli a tiltott művekre Petőfi: Anyám tyúkja típusú alternatívát
- **--source**: melyik forrást vizsgálja (alapérték: mind)

## Mit ellenőriz

### Lépés 1 — TILTOTT művek detektálása

```python
TILTOTT_REGEXEK = [
    r'Pet[őo]fi[^:]*:[^"]*Nemzeti dal',
    r'Pet[őo]fi[^:]*:[^"]*A Tisza',
    r'Pet[őo]fi[^:]*:[^"]*Apostol',
    r'Pet[őo]fi[^:]*:[^"]*Szeptember v[ée]g[ée]n',
    r'Ady\s+Endre',  # Ady művei NEM óvodásnak (Karácsony, Sárba esett, stb.)
    r'Arany J[áa]nos:\s*Toldi',
    r'Arany J[áa]nos:\s*A walesi b[áa]rdok',
    r'Vör[öo]smarty[^:]*:[^"]*Szozat',
    r'Madách',
    r'Janus Pannonius',
    r'Berzsenyi',
    r'Bessenyei',
    r'Kosztolányi:\s*Esti',
    r'Babits:\s*Esti',
    r'Kazinczy',
    r'Tompa Mihály',
    r'Szozat',
    r'Himnusz\s*\(teljes',
]
```

### Lépés 2 — Megengedett (whitelist) szerzők

```python
ENGEDETT_SZERZOK = {
    'klasszikus_ovodasokra': [
        'Pet[őo]fi[^:]*:\s*Any[áa]m ty[úu]kja',
        'Pet[őo]fi[^:]*:\s*Itt van az [őo]sz',
        'M[óo]ra Ferenc',
        'J[óo]zsef Attila:\s*Altat[óo]',
        'J[óo]zsef Attila:\s*Mama',
        'Arany J[áa]nos:\s*N[ée]pdal',  # csak népdalok
    ],
    'gyermekirodalom_szerzok': [
        'We[öo]res S[áa]ndor',
        'Csuk[áa]s Istv[áa]n',
        'L[áa]z[áa]r Ervin',
        'Mar[ée]k Veronika',
        'Don[áa]szy Magda',
        'F[ée]s[űu]s [ÉE]va',
        'Gazdag Erzsi',
        'Mentovics [ÉE]va',
        'Nemes Nagy [ÁA]gnes',
        'Bartos Erika',
        'Berg Judit',
        'Zelk Zolt[áa]n',
        'Hal[áa]sz Judit',  # ének
        'Gryllus Vilmos',  # ének
    ],
    'nepi': [
        'N[ée]pi mond[óo]ka',
        'N[ée]pdal',
        'N[ée]pmese',
        'Magyar n[ée]pmese',
    ],
}
```

### Lépés 3 — Ellenőrzés mind a 4 forráson

A) **seed/weekly-templates.json** — minden sablon `teruletek.verseles_meseles` és `teruletek.enek_zene`
B) **seed/otletek-bank-vegyes.json** — minden téma × terület × bullet
C) **seed/otletek-bank-kicsi.json**
D) **seed/otletek-bank-kozepso.json**
E) **seed/otletek-bank-nagy.json**

Per-bullet:
1. Tartalmaz-e tiltott szerzőt/művet → CRITICAL FAIL
2. Tartalmaz ismeretlen szerzőt? → WARN (manuális ellenőrzés kell)
3. Tartalmaz csak whitelistből → PASS

### Lépés 4 — Auto-csere (`--fix`)

Tiltott → cseréljük ki:

| Eredeti | Csere |
|---|---|
| Petőfi: Nemzeti dal (bármilyen részlet) | Petőfi: Anyám tyúkja |
| Petőfi: A Tisza | Petőfi: Itt van az ősz, itt van újra (rövid részlet) |
| Ady Endre: Karácsony | "Hull a hó, mindenfelé" (népi dal) |
| Arany: Toldi | népmese "A három nyúl" (Zelk Zoltán feldolgozás) |
| Arany: A walesi bárdok | népmese "A só" |
| Szózat / Himnusz teljes | "Himnusz meghallgatása csendben" (csak instrumentális utalás) |

### Lépés 5 — Kimenet

```
## Irodalom-verify — 2026-05-12

| Forrás | Bullet-szám | OK | WARN (ismeretlen) | CRITICAL (tiltott) |
|---|---|---|---|---|
| weekly-templates.json | ~3000 | 2940 | 60 | 0 |
| otletek-bank-vegyes | 2310 | 2300 | 10 | 0 |
| otletek-bank-kicsi | 2310 | 2300 | 10 | 0 |
| otletek-bank-kozepso | 2310 | 2300 | 10 | 0 |
| otletek-bank-nagy | 2310 | 2300 | 10 | 0 |

### CRITICAL FAIL: 0 ✓

### WARN (ismeretlen szerzők/művek, manuális ellenőrzés kell):
1. weekly-templates.json [mikulas_v2 / verseles_meseles] — "Berg Judit: Rumini karácsonya"
   → Berg Judit OK, de "Rumini karácsonya" létezik-e? (Ellenőrzendő)
2. otletek-bank [tanevkezdes / verseles_meseles] — "Saját élmény-elmesélés körben"
   → nem szerző-mű, csak tevékenység, OK
3. ...

### Auto-csere (ha --fix): 0 csere
```

## Hibakezelés

- Ha egy forrás JSON parse FAIL → SKIP
- Ha auto-csere hibás (pl. ismeretlen mű) → manual review szükséges
- A skill READ-ONLY, ha `--fix` nélkül hívják
