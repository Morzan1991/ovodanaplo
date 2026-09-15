# -*- coding: utf-8 -*-
"""
A „Tappancs” játékleírásainak beépítése a megfelelő tevékenységi területre.

A kiadvány a hét játékait a táblázat alatt, szabállyal együtt sorolja fel. A
táblázatban ezek csak névvel szerepelnek („Párfoglaló (fogójáték)”), a szabály
viszont a pedagógusnak a leghasznosabb rész — ezért a névhez csatoljuk.

Hova kerül melyik: a játék fajtáját a neve és a leírása dönti el.
  fogó-, futó-, egyensúlyozó játék, verseny        → mozgás
  fújás, súgás, szólánc, csendjáték                → anyanyelvi játék (a korpuszba)
  hangfelismerés, ritmus                           → hallás, ritmus
  társasjáték, dominó, memória, sorozat, számlálás → matematika
  tapintásos, érzékszervi felismerés                → külső világ

Az anyanyelvi játékokat NEM itt írjuk be: azokat a `tappancs_korpusz.py` teszi a
korpuszba, mert a Verselés, mesélés terület a korpuszból generálódik, és a
kézzel beírt sorokat a következő generálás felülírná.

Bemenet : tools/tappancs-jatekok.json
Futtatás: python tools/tappancs_jatek_beepites.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tappancs_korpusz import TEMA_TERKEP  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

GYOKER = Path(__file__).resolve().parent
SEED = GYOKER.parent / "seed"
BEMENET = GYOKER / "tappancs-jatekok.json"

# A játék NEVÉBEN a zárójeles fajtamegjelölés a legerősebb jel: ha ott az áll,
# hogy fogójáték vagy futójáték, akkor mozgás, bármit is mond a leírás.
NEV_MOZGAS = re.compile(
    r"\([^)]*(fogó|futó|utánzó|guggol|ugró|ugrál|labda|egyensúly|váltó|sor|"
    r"helyfoglaló|helycser|bújócsk|kapus|szoborj)[^)]*játék",
    re.I,
)

# Sorrend számít: az első illeszkedő szabály dönt.
BESOROLAS: list[tuple[str, re.Pattern]] = [
    (
        "verseles_meseles",
        re.compile(
            r"(fúj|súg|szólánc|csendjáték|beszéd|artikulác|mondat|szótag|"
            r"kimondja|szavakat|mesélj|meséld)", re.I
        ),
    ),
    (
        "mozgas",
        re.compile(
            r"(fogó|futó|futnak|futkár|verseny|egyensúly|ugrás|szökdel|mász|"
            r"bújás|bebújás|terpesz|körhinta|akadály|dobás|célba|labdát visz|"
            r"utánzójáték|talicskáz|kúszás|trambulin|hógolyó|szánk|csúszk|gurul|járkál|sétál|menetel|szoborjáték)", re.I
        ),
    ),
    (
        "hallas_ritmus",
        re.compile(r"(hang(ok|ját|jának)?\s*(felismer|utánz)|ritmus|halk|dallam|zörej)", re.I),
    ),
    (
        "matematika",
        re.compile(
            r"(társasjáték|dominó|memóriajáték|mátrix|sorozat|sorrend|dobókock|"
            r"pörgetty|párosít|számlál|halmaz|darabszám|kirak)", re.I
        ),
    ),
    ("kulso_vilag", re.compile(r"(tapintás|felismer|érzékszerv|megfigyel|válogat)", re.I)),
]
# Ha egyik szabály sem illik, ide kerül.
ALAPERTELMEZETT = "kulso_vilag"

KOROK = ["kicsi", "kozepso", "nagy", "vegyes"]


def terulet(nev: str, leiras: str) -> str:
    if NEV_MOZGAS.search(nev):
        return "mozgas"
    egyben = f"{nev} {leiras}"
    for cel, minta in BESOROLAS:
        if minta.search(egyben):
            return cel
    return ALAPERTELMEZETT


def kulcs(sor: str) -> str:
    s = sor.lower()
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"[^\wáéíóöőúüű ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main() -> int:
    dry = "--dry-run" in sys.argv
    hetek = json.loads(BEMENET.read_text(encoding="utf-8"))

    # (tema, terulet) -> [(nev, leiras)]
    celok: dict[tuple[str, str], list[tuple[str, str]]] = {}
    anyanyelvi = 0
    for h in hetek:
        temak = TEMA_TERKEP.get((h["honap"], h["het"]))
        if not temak:
            continue
        for j in h["jatekok"]:
            cel = terulet(j["nev"], j["leiras"])
            if cel == "verseles_meseles":
                anyanyelvi += 1  # ezt a korpusz kezeli
                continue
            for tema in temak:
                celok.setdefault((tema, cel), []).append((j["nev"], j["leiras"]))

    bovitett = 0
    ujDarab = 0
    for kor in KOROK:
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        for (tema, ter), jatekok in celok.items():
            if tema not in adat["temak"]:
                continue
            lista = adat["temak"][tema].setdefault(ter, [])
            for nev, leiras in jatekok:
                teljes = f"{nev} — {leiras}"
                nevKulcs = kulcs(nev)
                # ha a játék neve már szerepel, csak a szabályt fűzzük hozzá
                talalt = False
                for i, meglevo in enumerate(lista):
                    if kulcs(meglevo) == nevKulcs:
                        if "—" not in meglevo:
                            lista[i] = teljes
                            bovitett += 1
                        talalt = True
                        break
                if talalt:
                    continue
                if any(kulcs(x) == kulcs(teljes) for x in lista):
                    continue
                lista.append(teljes)
                ujDarab += 1
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  otletek-bank-{kor} kész")

    print(
        f"\nSzabállyal kiegészített meglévő játék: {bovitett} · "
        f"új játékleírás: {ujDarab} · anyanyelvi (a korpuszba megy): {anyanyelvi}"
        + ("   (dry-run)" if dry else "")
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
