# OvodaNapló — Ötlet-bank generálás (kor-specifikus, AI watchdog-mentes)

Kor-specifikus ötletek generálása **kisebb chunkokkal**, hogy az AI agentek ne akadjanak el a 600s watchdog miatt.

## Háttér

Korábbi próbálkozás során 4 párhuzamos AI agent (kicsi/közepes/nagy/vegyes) mindegyike elakadt, mert 31 téma × 7 terület × 10 bullet = 2170 bullet/agent túl sok egy stream-elt válaszhoz. **Megoldás**: kisebb chunkokra bontás (4-5 téma/agent), és sorozatos futtatás.

## Használat

```
/ovodanaplo-otletek-gen [--korcsoport=kicsi] [--temak=mikulas,karacsony] [--chunks=5]
```

- **--korcsoport**: melyik korcsoportra (kicsi/kozepso/nagy/vegyes/mind). Alapérték: `kicsi`
- **--temak**: konkrét témák komma-szeparálva. Ha üres, mind a 33 téma
- **--chunks**: chunk-méret (témaszám / agent). Alapérték: 5

## Mit csinál

### Lépés 1 — Témalista előállítás

Beolvas a `seed/weekly-templates.json`-ból a téma-prefix listát (33 téma).

```python
EXPECTED_TEMAS = [
    'tanevkezdes', 'osz_termenyek', 'allatok_vilagnapja', 'tok_fesztival', 'osz_szinek',
    'marton_nap', 'erzsebet_katalin', 'advent', 'mikulas', 'luca_nap', 'karacsony',
    'teli_madaretetes', 'teli_sportok', 'magyar_kultura', 'egeszseges_eletmod',
    'farsang', 'matyas_nap',
    'marcius_15', 'tavasz', 'viz_vilagnapja', 'erdok_napja',
    'husveti_het', 'kolteszet_napja', 'fold_napja', 'olvasni_jo',
    'anyak_napja_csalad', 'madarak_fak_napja', 'mehek_napja',
    'kozlekedes', 'foglalkozasok', 'punkosd', 'gyermeknap', 'evzaro'
]
```

### Lépés 2 — Chunk-felosztás

33 téma / 5 chunk = ~7 chunk. Minden chunk-ban 5-6 téma, 1 korcsoport, 7 terület, 10 bullet/(téma×terület) = **350-420 bullet/chunk**. Ez kezelhető egy AI agent-nek.

### Lépés 3 — AI agent indítás (sorban, nem párhuzamosan!)

Egy chunk-onként 1 agent. Az agent feladata:

```
Generálj 5 téma × 7 terület × 10 bullet összesen ~350 bullet a KICSI (3-4 éves) korosztálynak.

# A korosztály jellemzői
- Rövid figyelem (5-10 perc)
- Egyszerű utánzás, ismétlés
- Számolás 1-5-ig
- 2-4 soros mondókák
- Nagymozgások egyszerű szabályokkal
- Ujj-festés, gyűrögetés (nem olló!)
- Több segítség, fokozott felnőtti közelség

# A 5 téma (chunk 1)
1. tanevkezdes — Tanévkezdés, csoportszabályok
2. osz_termenyek — Az ősz kezdete, termények
3. allatok_vilagnapja — Állatok világnapja
4. tok_fesztival — Tök-fesztivál
5. osz_szinek — Ősz színei, falevelek

# A 7 terület
- kulso_vilag, matematika, verseles_meseles, rajzolas_festes,
  enek_zene, hallas_ritmus, mozgas

# Output formátum (JSON):
{
  "temak": {
    "tanevkezdes": {
      "kulso_vilag": ["bullet 1", "bullet 2", ..., "bullet 10"],
      ...
    },
    ...
  }
}

# KRITIKUS SZABÁLYOK
- CSAK valós, óvodás-szintű irodalom (Móra, Weöres, Csukás, Marék, Donászy...)
- NE: Nemzeti dal, Toldi, Ady-Karácsony, Tisza, walesi bárdok
- KICSI-szabású: rövid, egyszerű, ismétlésen alapuló
- Pontosan 10 bullet/téma/terület
- A választ EGY Write tool-hívással írd ki a megadott fájlba

# Output fájl
C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/tools/sablon-outputs/otletek-kicsi-chunk1.json
```

### Lépés 4 — Ellenőrzés

Minden chunk-output után:
- JSON parse OK?
- Pontosan 10 bullet minden téma × terület párra?
- Felnőtt szerző hiányzik?

### Lépés 5 — Összevonás

Amikor MIND a 7 chunk-fájl kész, összefűzzük:
```python
chunks = ['otletek-kicsi-chunk1.json', 'otletek-kicsi-chunk2.json', ..., 'otletek-kicsi-chunk7.json']
banky = {'korcsoport': 'kicsi', 'temak': {}}
for c in chunks:
    chunk_data = json.load(open(f'tools/sablon-outputs/{c}', encoding='utf-8'))
    banky['temak'].update(chunk_data['temak'])
json.dump(banky, open('seed/otletek-bank-kicsi.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
```

### Lépés 6 — Deploy

Másoljuk a seed/-be és dist-installer/seed/-be. Aztán `/ovodanaplo-deploy`.

## Időbecslés

| Korcsoport | Chunk-ok | Agent időtartam | Összesen |
|---|---|---|---|
| KICSI | 7 chunk | 4-7 perc/chunk | ~35-50 perc |
| KOZEPSO | 7 chunk | 4-7 perc/chunk | ~35-50 perc |
| NAGY | 7 chunk | 4-7 perc/chunk | ~35-50 perc |
| VEGYES | 7 chunk | 4-7 perc/chunk | ~35-50 perc |
| **Mind** | 28 chunk | sorban | **~2-3 óra** |

Ha párhuzamosan max 4 agent fut → ~30-50 perc.

## Hibakezelés

- AI agent elakad (600s watchdog) → chunk méret felére (5 → 3 téma)
- JSON parse FAIL → chunk újraindítás
- Felnőtt szerző talál → blacklist-tel auto-csere
