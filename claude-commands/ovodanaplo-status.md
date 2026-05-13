# OvodaNapló — Projekt állapot ellenőrzés

Egysoros áttekintés az OvodaNapló jelenlegi állapotáról.

## Használat

```
/ovodanaplo-status [--detail]
```

- **--detail**: részletes per-téma + per-terület bullet-eloszlás, backup-pontok, friss build-időpont

## Mit ellenőriz

### Lépés 1 — Sablon DB állapot
- `seed/weekly-templates.json` méret + verzió
- Sablonok száma (legacy + V1/V2)
- Téma-csoportok száma (prefix szerint dedupelve)
- Hónaponkénti eloszlás (szept-jún)

```python
import json
data = json.load(open(r'C:\Users\Lenovo\Desktop\CODE\_ovodanaplo\seed\weekly-templates.json', encoding='utf-8'))
print(f'Verzio: {data["_verzio"]}')
print(f'Sablonok: {len(data["sablonok"])}')
print(f'  - legacy: {sum(1 for s in data["sablonok"] if not s.get("verzio"))}')
print(f'  - V1: {sum(1 for s in data["sablonok"] if s.get("verzio") == 1)}')
print(f'  - V2: {sum(1 for s in data["sablonok"] if s.get("verzio") == 2)}')
```

### Lépés 2 — Ötlet-bank állapot
- 4 fájl: `otletek-bank-{vegyes,kicsi,kozepso,nagy}.json`
- Tématoszámú, bullet-számú összegzés
- Validáció: minden téma × terület 10 bullet?

### Lépés 3 — Deploy állapot
- `app.asar` mérete + módosítás dátuma
- `OvodaNapló.exe` léte
- Backup-pontok listája (app.asar.bak-*)

### Lépés 4 — Adatbázis
- Telepített DB méret (`%APPDATA%/ovodanaplo/OvodaNaplo/ovodanaplo.db`)
- Utolsó auto-backup dátuma

### Lépés 5 — Friss kód status
- A `src/` mappa utolsó módosítása
- Friss build (`out/`) léte
- `npm run typecheck` ellenőrzés (gyors)

## Kimenet

```
## OvodaNapló státusz — 2026-05-12 14:30

| Komponens | Állapot | Részletek |
|---|---|---|
| Sablon DB | ✅ v2.5 | 85 sablon (21 legacy + 64 V1/V2), 33 téma |
| Ötlet-bank | ✅ 2310 bullet | 33 téma × 7 terület × 10 (vegyes), 4 korcsoport-fájl |
| Deploy | ✅ 47.98 MB | app.asar friss, 22:47-kor építve |
| OvodaNapló.exe | ✅ él | 188 MB, 2026-05-12 |
| DB | ℹ️ 256 KB | utolsó backup: 2026-05-12 |
| Build | ✅ tiszta | tsc PASS, vite build OK |

Aktuális hónap (5): 16 sablon ajánl, témák: anyak_napja_csalad, gyermeknap, ...
```

## Hibakezelés

- Ha `seed/` mappa nincs → CRITICAL
- Ha `app.asar` mérete < 40MB → WARN (deploy incomplete?)
- Ha typecheck FAIL → kódhibákat soroljuk fel
