@echo off
chcp 65001 >nul
title OvodaNapló — indítás
cd /d "%~dp0app"

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║              OvodaNapló indítása              ║
echo  ╚═══════════════════════════════════════════════╝
echo.
echo  Az ablak megjelenéséig kérlek várj 10-30 másodpercet...
echo  Ezt a fekete ablakot ne zárd be, amíg az app fut.
echo.

if not exist "node_modules" (
    echo  Első futtatás: csomagok telepítése...
    call npm install --ignore-scripts
    call npx electron-builder install-app-deps
    cd node_modules\electron && call node install.js
    cd ..\..
)

call npm run dev

echo.
echo  Az app bezárult. Bezárhatod ezt az ablakot.
pause
