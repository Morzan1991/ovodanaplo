# OvodaNapló — ONAP-megfelelőség ellenőrző

Ellenőrzi, hogy a sablon vagy heti terv tartalma megfelel-e az **Óvodai Nevelés Országos Alapprogramja (ONAP)** szakmai szempontoknak.

## Háttér

ONAP = a magyar óvodapedagógia kötelező keretrendszere. A heti terveknek **7 tevékenységi területre** kell kiterjedniük:
1. Külső világ tevékeny megismerésére nevelés
2. Matematikai tartalom
3. Verselés, mesélés
4. Rajzolás, festés, mintázás, építés, képalakítás, kézimunka
5. Ének, zene, népi játék, tánc
6. Hallás és ritmusérzék fejlesztés
7. Mindennapos mozgás

A `OvodaNapló` alkalmazás ezt a struktúrát kötelezi, de a TARTALOM minőségét nem ellenőrzi. Ez a skill auditál.

## Használat

```
/ovodanaplo-onap-compliance [--tema=mikulas] [--all]
```

- **--tema**: konkrét téma ellenőrzése
- **--all**: mind a 33 témára

## Mit ellenőriz

### Lépés 1 — 7 terület teljességi ellenőrzés

Minden témára MIND a 7 területnek TARTALMAS-nak kell lennie (legalább 4 bullet, vagy 50+ karakter).

| Terület | Min. bullet | Min. karakter |
|---|---|---|
| kulso_vilag | 5 | 100 |
| matematika | 4 | 80 |
| verseles_meseles | 6 (2 alfejezet × 3 mű) | 200 |
| rajzolas_festes | 4 | 100 |
| enek_zene | 4 | 80 |
| hallas_ritmus | 2 | 50 |
| mozgas | 4 (2 alfejezet × 2 akt.) | 100 |

### Lépés 2 — Pedagógiai célok (Cél + Feladat) ellenőrzés

A `cel` és `feladat` mezőkben legyen:
- Konkrét pedagógiai célok (ne csak "a gyermekek érezzék jól magukat")
- Mérhető eredmény (érzékelhető, megismerhető, fejlődő)
- Életkori illesztés (3-4 éves vs. 5-7 éves)
- Differenciálás említése (vegyes csoportnál)

### Lépés 3 — Képességfejlesztés (multi-domain)

A `kepessegfejlesztes` legalább **8 képességet** említsen, többféle dimenzióból:
- Kognitív (figyelem, emlékezet, gondolkodás)
- Verbális (szókincs, kifejezőkészség)
- Szociális (együttműködés, szabálytudat)
- Motoros (nagymozgás, finommotorika)
- Esztétikai (szépérzék, kreativitás)
- Érzelmi (önbizalom, közösségi érzés)

### Lépés 4 — Iskola-előkészítő tevékenység (5-7 évesek)

A `iskolaElokeszitoTeruletek` minden 5 főterületre tartalmaz-e min. 5 sort?

Elvárt képesség-területek:
- Figyelem (kitartó, megosztott, válogató)
- Emlékezet (rövid távú, hosszú távú)
- Megfigyelőképesség
- Finommotorika (ceruzafogás, vágás)
- Nagymozgások (egyensúly, koordináció)
- Hallási figyelem (auditív megkülönböztetés)
- Beszédkészség (kifejező, befogadó)
- Szabálytudat, önfegyelem

### Lépés 5 — Eszközök realizmus

A `eszkozok` mezőben listázott eszközök valódi, óvodában elérhető tárgyak? Pl. NE legyen "lézer-show", "VR-szemüveg" stb.

### Lépés 6 — Időbeli illeszkedés

A `javasoltHonap` egyezik-e az adott témával?
- mikulas → december (12) ✓
- karacsony → december (12) ✓
- husveti_het → április (4) ✓
- tavasz → március (3) ✓
- ősz → szeptember-október (9, 10)
- nyári szünet (júl-aug) → NE legyen sablon

### Lépés 7 — Differenciálás (vegyes csoport esetén)

A `cel` vagy `feladat` mezőben szerepel-e:
- "3-4 évesek" + "5-7 évesek" elkülönítés VAGY
- "kicsik" + "nagyok" megkülönböztetés VAGY
- "minden korosztály" + adaptáció jelzés

A `differencialas` mezőben szerepel-e:
- "tartalomban, módszerekben, segítségadás módjában és mennyiségében..."

### Lépés 8 — Magyar nyelvi minőség

- Helyesírás (alapszintű ellenőrzés)
- Magyar nyelvi szófordulat (ne tükörfordítások)
- ONAP-kompatibilis szakmai szókincs:
  - "tevékeny megismerés" (nem "passzív tanulás")
  - "élményszerű" (nem "tanóra")
  - "differenciálás" (NEM "tévutak")

## Kimenet

```
## ONAP-megfelelőség — 33 téma audit

| Téma | 7 terület | Cél/Fel. | Képesség | IE-területek | Eszközök | Idő | Diff. | Nyelv | Pont |
|---|---|---|---|---|---|---|---|---|---|
| tanevkezdes | 7/7 ✓ | ✅ | 12 ✅ | 5/5 ✓ | ✓ | szept ✓ | ✅ | ✅ | 10/10 |
| osz_termenyek | 7/7 ✓ | ✅ | 10 ✅ | 5/5 ✓ | ✓ | szept ✓ | ✅ | ✅ | 10/10 |
| mikulas | 7/7 ✓ | ✅ | 13 ✅ | 5/5 ✓ | ✓ | dec ✓ | ⚠ | ✅ | 9/10 |
| ... |

### Részletes WARNing-ok
1. **mikulas / differenciálás**: a `cel` mezőben nincs említve a kicsi-nagy elkülönítés.
   → Javaslat: "...a kisebb csoportosok rövidebb mesével, a nagyok teljes szöveggel..."
2. **husveti_het / képesség**: csak 7 képesség említve, min. 8 elvárt.
3. **kolteszet_napja / nyelvi**: "József Attila: Altató" hosszú memoritere a kicsiknek túl bonyolult.

### Összesített pont: 9.6/10 (33 téma átlag)
- 33 téma 100%-osan ONAP-kompatibilis
- 5 téma WARNing-okkal (kis hibák)
- 0 téma CRITICAL hibával
```

## Hibakezelés

- Ha JSON parse FAIL → STOP
- Ha egy téma 7 területéből 0 tartalmas → CRITICAL "üres sablon"
- A skill READ-ONLY, javításhoz használd: `/ovodanaplo-sablon-check --fix`
