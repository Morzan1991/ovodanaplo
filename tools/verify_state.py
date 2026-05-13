"""
OvodaNapló — projekt állapot ellenőrzés.

Lefuttatandó minden nagy módosítás után, hogy ellenőrizze:
- Build artefactok jelen vannak-e (out/ + app.asar)
- Bundle tartalmazza-e az eddig elkészített TODO-1..5 funkciókat
- Seed-fájlok mérete + eloszlása (kor-szűrés állapota)
- Git állapot (uncommitted-e, mi változott)
- Mappa-struktúra

Kimenet:
  ✅ — minden rendben
  ⚠️ — figyelmeztetés (működhet, de érdemes nézni)
  ❌ — kritikus hiba (vissza kell térni a backupra!)

Futtatás:
  python tools/verify_state.py [--quick]   # csak fájl-check, nem fut typecheck/build
  python tools/verify_state.py --build     # ÚJRA-build + checkek
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Windows cp1250 stdout fix
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

# Konstans útvonalak
ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
SEED = ROOT / "seed"
OUT = APP / "out"
DIST = APP / "dist-installer" / "win-unpacked" / "resources"


# === Színes ASCII jelölők ===
def OK(s: str) -> str:
    return f"✅ {s}"


def WARN(s: str) -> str:
    return f"⚠️  {s}"


def ERR(s: str) -> str:
    return f"❌ {s}"


def INFO(s: str) -> str:
    return f"ℹ️  {s}"


# Globális számláló
HIBAK: list[str] = []
FIGYELMEZTETESEK: list[str] = []


def hiba(msg: str) -> None:
    HIBAK.append(msg)
    print(ERR(msg))


def figyel(msg: str) -> None:
    FIGYELMEZTETESEK.append(msg)
    print(WARN(msg))


# === 1. Build artefactok ===
def check_build():
    print("\n[1/6] Build artefactok ellenőrzése")
    print("-" * 60)

    main_js = OUT / "main" / "index.js"
    preload = OUT / "preload" / "index.mjs"
    assets = OUT / "renderer" / "assets"

    if not main_js.exists():
        hiba(f"main/index.js HIÁNYZIK: {main_js}")
        return None
    print(OK(f"main/index.js: {main_js.stat().st_size / 1024:.1f} KB"))

    if not preload.exists():
        hiba(f"preload/index.mjs HIÁNYZIK: {preload}")
        return None
    print(OK(f"preload/index.mjs: {preload.stat().st_size / 1024:.1f} KB"))

    if not assets.is_dir():
        hiba(f"renderer/assets/ mappa HIÁNYZIK")
        return None

    js_files = sorted(assets.glob("index-*.js"))
    css_files = sorted(assets.glob("index-*.css"))
    if not js_files:
        hiba("renderer/assets/index-*.js HIÁNYZIK")
        return None
    if not css_files:
        hiba("renderer/assets/index-*.css HIÁNYZIK")
        return None

    js = js_files[-1]
    css = css_files[-1]
    print(OK(f"renderer JS: {js.name} ({js.stat().st_size / 1024:.1f} KB)"))
    print(OK(f"renderer CSS: {css.name} ({css.stat().st_size / 1024:.1f} KB)"))

    js_size = js.stat().st_size
    if js_size < 400 * 1024:
        figyel(f"renderer JS gyanúsan kicsi: {js_size / 1024:.0f} KB (várt: ~520 KB)")
    if js_size > 700 * 1024:
        figyel(f"renderer JS gyanúsan nagy: {js_size / 1024:.0f} KB (várt: ~520 KB)")

    return {"js": js, "css": css, "main_js": main_js}


# === 2. ASAR ===
def check_asar():
    print("\n[2/6] ASAR (deploy bundle) ellenőrzése")
    print("-" * 60)

    asar = DIST / "app.asar"
    exe = DIST.parent / "OvodaNapló.exe"

    if not asar.exists():
        hiba(f"app.asar HIÁNYZIK: {asar}")
        return
    sz = asar.stat().st_size
    mt = datetime.fromtimestamp(asar.stat().st_mtime)
    print(OK(f"app.asar: {sz / (1024 * 1024):.2f} MB, módosítva {mt:%Y-%m-%d %H:%M:%S}"))

    if sz < 40 * 1024 * 1024:
        hiba(f"app.asar túl kicsi: {sz / (1024 * 1024):.1f} MB (várt: 40-50 MB) — INCOMPLETE BUILD!")
    elif sz > 100 * 1024 * 1024:
        hiba(f"app.asar túl nagy: {sz / (1024 * 1024):.1f} MB — model.gguf bekerült?!")

    if exe.exists():
        print(INFO(f"OvodaNapló.exe: {exe.stat().st_size / (1024 * 1024):.1f} MB"))


# === 3. Bundle string check ===
TODO_CHECKS: list[dict] = [
    {
        "nev": "TODO-1: Heti-terv törlés UI",
        "fajl": "renderer_js",
        "minden": ["hetiTervTorol", "torolHetiTerv", "Biztosan törlöd", "btn-danger-outline"],
        "legalabb_egy": [],
    },
    {
        "nev": "TODO-2: Iskola előkészítő mező (foglalkozás)",
        "fajl": "renderer_js",
        "minden": ["iskolaElokeszito", "Iskola előkészítő tevékenység", "ONAP"],
        "legalabb_egy": [],
    },
    {
        "nev": "TODO-2 (main): séma + mini-migráció",
        "fajl": "main_js",
        "minden": ["iskola_elokeszito", "foglalkozas_tervezetek"],
        "legalabb_egy": [],
    },
    {
        "nev": "TODO-4: Sablonválasztó meglévő tervnél",
        "fajl": "renderer_js",
        "minden": ["Felülírja", "aktualisSablonAzonosito", "Sablon alkalmazása"],
        "legalabb_egy": [],
    },
    {
        "nev": "TODO-5: Irodalom autocomplete",
        "fajl": "renderer_js",
        "minden": ["IrodalomAutoComplete", "getCurrentToken", "Nincs találat"],
        "legalabb_egy": [],
    },
    {
        "nev": "Foglalkozás-tervezetek listája (mini)",
        "fajl": "renderer_js",
        "minden": ["foglalkozasLista", "setFoglalkozasok"],
        "legalabb_egy": [],
    },
]


def check_bundle_strings(artifacts):
    print("\n[3/6] Bundle string check (TODO-1..5)")
    print("-" * 60)

    if not artifacts:
        figyel("Bundle nem elérhető — kihagyom")
        return

    try:
        renderer_js = artifacts["js"].read_text(encoding="utf-8")
        main_js = artifacts["main_js"].read_text(encoding="utf-8")
    except Exception as e:
        hiba(f"Bundle olvashatatlan: {e}")
        return

    forrasok = {"renderer_js": renderer_js, "main_js": main_js}

    for c in TODO_CHECKS:
        forras = forrasok.get(c["fajl"], "")
        hianyozanak = [s for s in c["minden"] if s not in forras]
        if hianyozanak:
            hiba(f'{c["nev"]}: HIÁNYZÓ stringek: {hianyozanak}')
        else:
            print(OK(f'{c["nev"]}'))


# === 4. Seed-fájlok (TODO-3) ===
def check_seed():
    print("\n[4/6] Seed fájlok + TODO-3 kor-specifikus eloszlás")
    print("-" * 60)

    fajlok = {
        "vegyes": SEED / "otletek-bank-vegyes.json",
        "kicsi": SEED / "otletek-bank-kicsi.json",
        "kozepso": SEED / "otletek-bank-kozepso.json",
        "nagy": SEED / "otletek-bank-nagy.json",
    }
    adatok = {}
    for kor, p in fajlok.items():
        if not p.exists():
            hiba(f"seed/{p.name} HIÁNYZIK")
            continue
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
            n_tema = len(d.get("temak", {}))
            n_bullet = sum(
                len(v) for tema, t in d.get("temak", {}).items() for v in t.values()
            )
            adatok[kor] = (p.stat().st_size, n_tema, n_bullet)
            print(
                OK(
                    f"otletek-bank-{kor}.json: {p.stat().st_size / 1024:.0f} KB, "
                    f"{n_tema} téma, {n_bullet} bullet"
                )
            )
        except Exception as e:
            hiba(f"otletek-bank-{kor}.json olvashatatlan: {e}")

    # TODO-3 specifikus: a 3 kor-fájl != vegyes (kor-szűrés AKTÍV)
    if all(k in adatok for k in ("vegyes", "kicsi", "kozepso", "nagy")):
        v = adatok["vegyes"][2]
        diffek = {k: v - adatok[k][2] for k in ("kicsi", "kozepso", "nagy")}
        print(
            INFO(
                f"Kor-szűrés: vegyes={v} bullet, "
                f"kicsi=-{diffek['kicsi']}, kozepso=-{diffek['kozepso']}, nagy=-{diffek['nagy']}"
            )
        )
        if all(d == 0 for d in diffek.values()):
            figyel(
                "Kor-fájlok ALIAS-OK (mind ugyanaz, mint vegyes)! "
                "TODO-3 nem fut le? — futtasd: python tools/build_kor_specifikus_bank.py"
            )

    # Heti sablonok
    p = SEED / "weekly-templates.json"
    if p.exists():
        d = json.loads(p.read_text(encoding="utf-8"))
        n = len(d.get("sablonok", []))
        verzio = d.get("_verzio", "?")
        print(OK(f"weekly-templates.json: v{verzio}, {n} sablon"))
    else:
        hiba("seed/weekly-templates.json HIÁNYZIK")

    # Irodalom
    p = SEED / "literature.json"
    if p.exists():
        d = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(d, list):
            n = len(d)
            verzio = "?"
        else:
            n = len(d.get("tetelek") or d.get("muvek") or [])
            verzio = d.get("_verzio", "?")
        print(OK(f"literature.json: v{verzio}, {n} irodalmi tétel"))
    else:
        hiba("seed/literature.json HIÁNYZIK")


# === 5. Git állapot ===
GIT = r"C:\Program Files\Git\cmd\git.exe"


def run_git(args: list[str]) -> str:
    try:
        r = subprocess.run(
            [GIT] + args, cwd=str(ROOT), capture_output=True, text=True, timeout=30
        )
        return r.stdout.strip()
    except Exception as e:
        return f"<git error: {e}>"


def check_git():
    print("\n[5/6] Git állapot")
    print("-" * 60)

    git_dir = ROOT / ".git"
    if not git_dir.exists():
        hiba("Nincs .git mappa — a repo nincs inicializálva!")
        return

    branch = run_git(["branch", "--show-current"])
    print(INFO(f"branch: {branch}"))

    status = run_git(["status", "--short"])
    if not status:
        print(OK("Working tree TISZTA — minden commit-olva"))
    else:
        lines = status.splitlines()
        print(WARN(f"{len(lines)} fájl uncommit-olt:"))
        for l in lines[:15]:
            print(f"    {l}")
        if len(lines) > 15:
            print(f"    ... és további {len(lines) - 15} fájl")

    log = run_git(["log", "--oneline", "-5"])
    print(INFO("Utolsó 5 commit:"))
    for l in log.splitlines():
        print(f"    {l}")

    remote = run_git(["remote", "-v"])
    if "origin" in remote:
        url = remote.splitlines()[0].split()[1] if remote else "?"
        print(INFO(f"remote: {url}"))

    # Mennyi commit van a remote-on (ha lekérhető)
    ahead_behind = run_git(["rev-list", "--left-right", "--count", "HEAD...origin/main"])
    if ahead_behind and "<" not in ahead_behind:
        try:
            ahead, behind = ahead_behind.split()
            if int(ahead) > 0:
                figyel(f"{ahead} commit MÉG NEM PUSHOLVA — futtasd: git push")
            if int(behind) > 0:
                figyel(f"{behind} commit a remote-on új — futtasd: git pull")
            if int(ahead) == 0 and int(behind) == 0:
                print(OK("Helyi és remote szinkronban"))
        except Exception:
            pass


# === 6. Manuális tesztelési checklist ===
def manualis_checklist():
    print("\n[6/6] Manuális tesztelési checklist (felhasználói)")
    print("-" * 60)
    print(
        """    A friss build kipróbálásához az appot újra kell indítani.

    Naptáron:
    [ ] Heti tervek listája megjelenik
    [ ] Hover-on a × törlés-gomb látszik (TODO-1)
    [ ] Törlés → konfirmáció → tétel kivéve a listából

    HetiTerv (új tervezet):
    [ ] Sablon-választó látszik az új tervezetnél (✨)
    [ ] "Üres tervezet ⊗" gomb működik

    HetiTerv (meglévő tervezet):
    [ ] Sablon-választó MOST LÁTSZIK (🔄, TODO-4)
    [ ] Sablon-választás → konfirmáció ha van tartalom
    [ ] Jobb oldali "Foglalkozás-tervezetek" kártya listáz
    [ ] Verselés-mesélés területen autocomplete (TODO-5) — gépelj 2+ karaktert
    [ ] Ének-zene területen autocomplete dalokra szűkít
    [ ] "🗑 Heti terv törlése" gomb jobb alul (TODO-1)
    [ ] Ötletek panel → kor-specifikus bulletek (TODO-3)

    Foglalkozás-tervezet:
    [ ] "Iskola előkészítő tevékenység" kiemelt szekció (TODO-2)
    [ ] Mentés után DOCX exportban megjelenik az új blokk
    """
    )


# === ÖSSZESÍTÉS ===
def main():
    quick = "--quick" in sys.argv
    build = "--build" in sys.argv

    print("=" * 60)
    print(f"OvodaNapló — állapot-verifikáció ({datetime.now():%Y-%m-%d %H:%M:%S})")
    print("=" * 60)

    if build:
        print("\n[0/6] Build futtatás (--build)")
        print("-" * 60)
        r = subprocess.run(
            ["npm", "run", "build"], cwd=str(APP), capture_output=True, text=True, shell=True
        )
        if r.returncode != 0:
            hiba(f"npm run build HIBA: {r.stderr[-300:]}")
        else:
            print(OK("Build PASS"))

    artifacts = check_build()
    check_asar()
    check_bundle_strings(artifacts)
    check_seed()
    check_git()
    manualis_checklist()

    print("\n" + "=" * 60)
    print("Összegzés")
    print("=" * 60)
    if not HIBAK and not FIGYELMEZTETESEK:
        print(OK("Minden ellenőrzés sikeres — biztonságos a commit/push."))
        return 0
    if HIBAK:
        print(ERR(f"{len(HIBAK)} KRITIKUS HIBA — vissza a backupra:"))
        for h in HIBAK:
            print(f"    - {h}")
    if FIGYELMEZTETESEK:
        print(WARN(f"{len(FIGYELMEZTETESEK)} figyelmeztetés:"))
        for f in FIGYELMEZTETESEK:
            print(f"    - {f}")

    return 1 if HIBAK else 0


if __name__ == "__main__":
    sys.exit(main())
