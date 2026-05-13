# OvodaNapló — Biztonságos deploy workflow

Komplett deploy-folyamat: build → ASAR extract → out/ csere → ASAR repack → verifikáció. Az alkalmazás futás közben is működik (file lock kezelve).

## Használat

```
/ovodanaplo-deploy [--skip-build] [--skip-verify] [--no-backup]
```

- **--skip-build**: kihagyja a `npm run build`-et (ha frissen built)
- **--skip-verify**: kihagyja a post-deploy ellenőrzést
- **--no-backup**: NEM csinál `app.asar.bak-*` backupot (nem ajánlott)

## Mit csinál

### Lépés 0 — Pre-flight

1. Ellenőrzi hogy az `OvodaNapló.exe` fut-e (`tasklist | grep OvodaNaplo`)
   - Ha fut: WARN — kérdezzük meg a felhasználót, leállítsa-e
   - File lock-ok elkerülése miatt
2. Backup ellenőrzés: van-e már 3+ backup? Ha igen, a legrégit kihagyhatjuk

### Lépés 1 — Build (kihagyható --skip-build-del)

```bash
cd "C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/app"
npm run build 2>&1 | tail -15
```

Elvárt kimenet:
- `out/main/index.js` ~50 KB
- `out/preload/index.mjs` ~5 KB
- `out/renderer/index.html` ~1 KB
- `out/renderer/assets/index-*.js` ~500 KB

Ha bármi hiányzik → FAIL, build hiba.

### Lépés 2 — Backup (kihagyható --no-backup-pal)

```bash
DEPLOY=C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/app/dist-installer/win-unpacked/resources
DATE=$(date +%Y%m%d-%H%M%S)
cp "$DEPLOY/app.asar" "$DEPLOY/app.asar.bak-$DATE"
```

Megjegyzés: ha 5-nél több backup, a legrégebbit törölje (rotation).

### Lépés 3 — ASAR extract + frissítés

```bash
cd "$DEPLOY"
rm -rf app_extracted
npx asar extract app.asar app_extracted
rm -rf app_extracted/out/renderer/assets/index-*.js
rm -rf app_extracted/out/renderer/assets/index-*.css
cp -r "C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/app/out/"* app_extracted/out/
```

A renderer asset-eket KITAKARÍTJUK az új hash-ek miatt (Vite minden buildkor új filename-et ad).

### Lépés 4 — ASAR repack

```bash
npx asar pack app_extracted app.asar
rm -rf app_extracted
```

### Lépés 5 — Seed JSON sync (ha változott)

```bash
SEED_SRC=C:/Users/Lenovo/Desktop/CODE/_ovodanaplo/seed
SEED_DST=$DEPLOY/seed
diff -r "$SEED_SRC" "$SEED_DST" --brief 2>&1
# ha vannak diff-ek, copy-zuk
cp -r "$SEED_SRC/"*.json "$SEED_DST/"
```

### Lépés 6 — Verifikáció (kihagyható --skip-verify-vel)

```bash
ls -la "$DEPLOY/app.asar"
npx asar extract "$DEPLOY/app.asar" /tmp/asar-check 2>&1 | tail -3

# Ellenőrzés: friss renderer bundle
grep -E 'src="[^"]+\.js"' /tmp/asar-check/out/renderer/index.html

# Friss komponensek
grep -c "OtletekModal\|nyitOtletekPanel\|loadOtletekBank" /tmp/asar-check/out/main/index.js /tmp/asar-check/out/renderer/assets/*.js

rm -rf /tmp/asar-check
```

Elvárt:
- app.asar mérete 45-55 MB között
- friss `index-*.js` filename minden buildnél más
- min. 10 előfordulás a friss komponens-keresésnél

### Lépés 7 — Smoke teszt (opcionális)

Ha az `OvodaNapló.exe` nem fut, indítsuk el rövid időre és nézzük meg a console-t:
```bash
"$DEPLOY/../OvodaNapló.exe" &
sleep 5
# Lássuk hogy életben van
tasklist | grep OvodaNaplo
# Ha igen, leállítjuk
taskkill /F /IM OvodaNapló.exe
```

## Kimenet

```
## OvodaNapló deploy — 2026-05-12 22:47

| Lépés | Állapot | Részletek |
|---|---|---|
| Pre-flight | ✅ | exe nem fut, 3 backup van |
| Build | ✅ | renderer 519 KB, main 55 KB |
| Backup | ✅ | app.asar.bak-20260512-224712 |
| ASAR extract | ✅ | 47.98 MB → 51 MB unpacked |
| Renderer cleanup | ✅ | 3 régi index-*.js törölve |
| Build copy | ✅ | out/ teljes átmásolva |
| ASAR repack | ✅ | 47.98 MB |
| Seed sync | ⚪ SKIP | nincs változás |
| Verifikáció | ✅ | index-CS_wECAl.js, 10 új komponens |
| Smoke teszt | ⚪ SKIP | manuális |

🎉 Deploy sikeres! Indítsa újra: `OvodaNapló.exe`
```

## Hibakezelés

- ASAR pack FAIL → restore from backup, STOP
- npm build FAIL → kódhiba listázás, STOP
- file lock (EBUSY) → "Az app fut, állítsd le manuálisan", STOP
- Seed JSON parse FAIL → "Sablon JSON sérült, fix kell", STOP
