@echo off
REM ---------------------------------------------------------------------------
REM Android fordítás és telepítés a csatlakoztatott telefonra.
REM
REM MIÉRT KELL EZ A BURKOLÓ: ezen a gépen a felhasználói Temp mappában
REM (C:\Users\...\AppData\Local\Temp) a Windows AF_UNIX socketjének `connect`
REM hívása hibára fut. A Java NIO selectora AF_UNIX-ra épül, ezért a Gradle
REM háttérfolyamata indulás után azonnal leáll: "Unable to establish loopback
REM connection". Egy másik, ép könyvtárra állított TEMP megoldja.
REM
REM Az Android Studio JDK 25-öt hoz, a Gradle 8.11 / AGP 8.7 viszont JDK 17-21-re
REM készült — ezért a Temurin 21-et használjuk (lásd android\gradle.properties).
REM
REM A parancsokat kifejezetten ".\" előtaggal hívjuk: az npm által indított cmd
REM nem keresi az aktuális könyvtárat puszta parancsnévre.
REM ---------------------------------------------------------------------------

if not exist "C:\build-temp" mkdir "C:\build-temp"
set "TEMP=C:\build-temp"
set "TMP=C:\build-temp"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"

pushd "%~dp0android"
call .\gradlew.bat assembleDebug %*
set BUILD_HIBA=%ERRORLEVEL%
popd
if not "%BUILD_HIBA%"=="0" (
  echo.
  echo A forditas HIBAVAL allt le. ^(hibakod: %BUILD_HIBA%^)
  exit /b %BUILD_HIBA%
)

echo.
echo Telepites a csatlakoztatott telefonra...
"%ANDROID_HOME%\platform-tools\adb.exe" install -r "%~dp0android\app\build\outputs\apk\debug\app-debug.apk"
if not "%ERRORLEVEL%"=="0" (
  echo.
  echo A telepites nem sikerult. Csatlakoztatva van a telefon, es engedelyezve az USB-hibakereses?
  exit /b 1
)
"%ANDROID_HOME%\platform-tools\adb.exe" shell monkey -p hu.lisztmaier.ovodanaplo -c android.intent.category.LAUNCHER 1 >nul 2>&1
echo Kesz - az app elindult a telefonon.
