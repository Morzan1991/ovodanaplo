# -*- coding: utf-8 -*-
"""
A NEM irodalmi területek ötleteinek tisztítása.

A mesék/versek/dalok anyagát a `tools/korpusz` generálja (lásd
`irodalom_beepites.py`). A másik öt terület — külső világ, matematika, rajzolás,
hallás-ritmus, mozgás — viszont máig a régi, összegyűjtött szövegekből él, és
ugyanazok a bajok vannak benne, amiket az óvónő az irodalomnál is kiszúrt:

  * majdnem-azonos sorok egymás mellett
    („Számlálás 10-es számkörben." és „Számlálás 10-es számkörben: hány alma…"),
  * kisbetűvel kezdődő, pont nélkül vagy ponttal záruló sorok vegyesen,
  * tartalmatlan tölteléksorok, amiket csak a 10-es keret feltöltése szült,
  * a témához nem illő, dal-címmel megnevezett fogójátékok.

Ez a szkript ezeket rendezi. ÚJ tartalmat nem talál ki — csak töröl és formáz.

Futtatás:  python tools/otletek_tisztitas.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed"

# Ezt az öt területet gondozzuk itt; a másik kettő a korpuszból jön.
TERULETEK = ("kulso_vilag", "matematika", "rajzolas_festes", "hallas_ritmus", "mozgas")

# Tartalmatlan töltelék: nem mond semmit arról, mit csináljon a csoport.
TOLTELEK = [
    re.compile(r"^ritmus visszatapsolás: téma-szavak", re.I),
    re.compile(r"^hangok felismerése: kép-fülbe-tárgy", re.I),
    re.compile(r"^gyors-lassú fogalompár gyakorlása a témához kapcsolva", re.I),
    re.compile(r"^a témához kapcsolódó", re.I),
    re.compile(r"^téma szerinti (beszélgetés|feladat)$", re.I),
    re.compile(r"^egyéb, a témához illő", re.I),
]

# Dal-/mondókacímmel megnevezett mozgásos játékok, amelyek csak akkor valók egy
# hétbe, ha a dal maga is odaillik. (téma -> tiltott sorok)
TEMAN_KIVUL = {
    "Gólya viszi a fiát": {"allatok_vilagnapja", "haziallatok_kicsinyei", "tavasz",
                           "madarak_fak_napja", "kert_kis_lakoi", "gyermeknap"},
    "Fogócska: Gólya viszi a fiát": {"allatok_vilagnapja", "haziallatok_kicsinyei",
                                     "tavasz", "madarak_fak_napja", "gyermeknap"},
}


# A forrás betűritkítása miatt néhol szóköz szakítja ketté a szót
# („nagy ságuk”, „fejlődé sének”). Ezek a töredékek önmagukban nem magyar
# szavak, ezért biztonságosan visszafűzhetők az előző szóhoz.
SZOHASADAS = re.compile(
    r"(\w)\s(nak|nek|ban|ben|val|vel|ból|ből|tól|től|hoz|hez|höz|ról|ről|nál|nél|"
    r"ként|kor|ság|ség|sága|sége|ságuk|ségük|ságát|ségét|ságú|ségű|sének|sának|"
    r"tása|tése|zása|zése)\b"
)


def formaz(sor: str) -> str:
    """Nagy kezdőbetű, egységes szóközök, záró pont nélkül."""
    s = SZOHASADAS.sub(r"\1\2", sor)
    s = re.sub(r"\s+", " ", s).strip()
    s = s.rstrip(" .")
    # Az idézőjelek egységesítése a magyar formára.
    s = s.replace('"', "„", 1) if s.count('"') >= 2 else s
    if s and s[0].islower():
        s = s[0].upper() + s[1:]
    return s


def kulcs(sor: str) -> str:
    """Összehasonlító alak: ékezet marad, de a központozás és a kisbetű nem számít."""
    s = sor.lower()
    s = re.sub(r"[^\wáéíóöőúüű ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def tisztit(lista: list[str], tema: str) -> tuple[list[str], dict[str, int]]:
    stat = {"toltelek": 0, "temankivul": 0, "duplikatum": 0, "formazva": 0}
    jeloltek: list[str] = []

    for nyers in lista:
        s = formaz(nyers)
        if s != nyers:
            stat["formazva"] += 1
        if any(p.match(s) for p in TOLTELEK):
            stat["toltelek"] += 1
            continue
        tiltott = TEMAN_KIVUL.get(s)
        if tiltott is not None and tema not in tiltott:
            stat["temankivul"] += 1
            continue
        jeloltek.append(s)

    # Duplikátumok: azonos kulcs, illetve ha az egyik a másik eleje („Számlálás
    # 10-es számkörben" ⊂ „Számlálás 10-es számkörben: hány alma van a kosárban"),
    # akkor a BŐVEBB marad — az mond többet a pedagógusnak.
    jeloltek.sort(key=lambda s: (-len(s), s))
    megtartott: list[str] = []
    kulcsok: list[str] = []
    for s in jeloltek:
        k = kulcs(s)
        if any(k == mk or mk.startswith(k + " ") or k.startswith(mk + " ") for mk in kulcsok):
            stat["duplikatum"] += 1
            continue
        kulcsok.append(k)
        megtartott.append(s)

    # Az eredeti sorrend visszaállítása (a bővebb sorok a helyükön maradjanak).
    eredeti = {formaz(x): i for i, x in enumerate(lista)}
    megtartott.sort(key=lambda s: eredeti.get(s, 999))
    return megtartott, stat


def main() -> int:
    dry = "--dry-run" in sys.argv
    osszes = {"toltelek": 0, "temankivul": 0, "duplikatum": 0, "formazva": 0}
    for kor in ("kicsi", "kozepso", "nagy", "vegyes"):
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        for tema, teruletek in adat["temak"].items():
            for terulet in TERULETEK:
                lista = teruletek.get(terulet)
                if not lista:
                    continue
                uj, stat = tisztit(lista, tema)
                teruletek[terulet] = uj
                for k, v in stat.items():
                    osszes[k] += v
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  otletek-bank-{kor} kész")

    print(
        f"\nTöltelék törölve: {osszes['toltelek']} · "
        f"Témán kívüli: {osszes['temankivul']} · "
        f"Duplikátum: {osszes['duplikatum']} · "
        f"Formázva: {osszes['formazva']}"
        + ("   (dry-run, nem mentve)" if dry else "")
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
