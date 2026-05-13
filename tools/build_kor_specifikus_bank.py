"""
Kor-specifikus ötlet-bank generálás regex+keyword annotációkkal.

Fázis B (TODO-3): a `seed/otletek-bank-vegyes.json` 2310 bulletjét megcímkézi
korjelzők alapján, majd kiír 3 kor-specifikus fájlt:
  - otletek-bank-kicsi.json    (3-4 éves)
  - otletek-bank-kozepso.json  (4-5 éves)
  - otletek-bank-nagy.json     (5-7 éves)

A `vegyes` érintetlen marad — az alapérték minden bulletre.

Algoritmus:
  1. KOR_MARKEREK regex-szótár jelzőkkel minden korcsoportra.
  2. Minden bulletre megnézzük, mely korhoz illeszkedik.
  3. Ha NINCS jelző → bullet "általános", mindhárom korba kerül.
  4. Ha VAN jelző → csak az adott korba/korokba.
  5. Ha egy téma×terület cellában <8 bullet maradna kor-szűrés után,
     felöntjük a vegyes-fájl általános bullet-jeivel ~10-ig.

Futtatás:
  python tools/build_kor_specifikus_bank.py [--dry-run]
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from typing import Set

# Windows cp1250 stdout-on a ✓ karakter UnicodeEncodeError-t dob — UTF-8-ra váltunk.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

# Korcsoport-jelzők. Mindegyik mintáját case-insensitive módon, regex-ként alkalmazzuk.
# CSAK az IGAZÁN diszkriminatív jelzőket tartjuk — az általános óvodás tevékenységek
# (gyurmázás, körjáték, mesehallgatás, halmazok, párosítás stb.) MINDEN korban előfordulnak,
# ezért nincsenek a listában. Egy bullet csak akkor kerül kor-szűrésre, ha kifejezetten
# egyetlen korhoz illik (pl. "memoriter" → nagy, "ujj-festés" → kicsi, "10-es számkör" → nagy).
KOR_MARKEREK: dict[str, list[str]] = {
    "kicsi": [
        # 3-4 évesek SPECIFIKUS tevékenységei (más korban kevésbé jellemző)
        r"\bujj-?fest\w*\b",
        r"\b3-?4 éves\b|\bkis(?:csoportos)\w*\b",
        r"\bringat\w*\b",  # NEM hintázás — az minden korban van
        r"\bcsengety\w*\b|\bcsörg\w*\b",
        r"\bbeszoktatás\b|\bvigasztal\w*\b",
        r"\bbabakocsi\b|\bbabajáték\b",
        r"\bpacsizás\b|\bpapizás\b",
        r"\bbölcső\w*\b|\baltatózás\b",
        r"\bbabusgat\w*\b",
        r"\b(?:nagy)?méretű ?gyurma\b",
        r"\bdúd(?:olás|olj|olja)\b",  # dúdolás kis-specifikus
        r"\baz óvoda helyiségeinek? (?:bejárás|megismerés)\w*\b",
        r"\bcsoportszoba felfedezés\w*\b",
    ],
    "kozepso": [
        # 4-5 évesek SPECIFIKUS jelzői (alig — közepes ritkán kifejezett)
        r"\b4-?5 éves\b|\bközépső csoport\w*\b",
        r"\b(?:5|öt)-?ös ?számkör\b|\b1-?\s?5-?ig\b",
        r"\bszókapcsolat\w*\b",
    ],
    "nagy": [
        # 5-7 évesek SPECIFIKUS tevékenységei (iskola-előkészítés tipikus jelei)
        r"\b5-?[67] éves\b|\b6-?7 éves\b|\bnagy ?csoport\w*\b|\bnagycsoportos\w*\b",
        r"\b10-?(?:es|ig)? ?számkör\b|\b1-?\s?10-?ig\b|\btíz(?:es|ig)?\b",
        r"\bösszeadás\b|\bkivonás\b|\bplusz\b.*\bmínusz\b",
        r"\bbetűfelismer\w*\b|\bbetűalak\w*\b|\bszótag(?:ol|olás)\w*\b",
        r"\bmemoriter\b|\b(?:kívülről|fejből) (?:tud|megtanul|recitál|mond)\w*\b",
        r"\bíráselőkész\w*\b|\bgrafomotor\w*\b|\bvonalvezetés\b",
        r"\biskolaérett\w*\b|\biskolára (?:felkészít|készül)\w*\b",
        r"\biskola-?előkészít\w*\b",
        r"\babsztrak\w*\b",
        r"\b(?:összetett|bonyolult|komplex) (?:feladat|tevékenység|gyakorlat)\w*\b",
        r"\blogikai (?:játék|feladat|sor|rejtvény)\w*\b",
        r"\bszerialitás\b|\bsorba ?rendezés\b",
        r"\bok-?okozati\b|\bkövetkeztet\w*\b",
        r"\bszámfogalom\b",
        r"\bkettesével\b|\bötösével\b|\btízesével\b",
        r"\bnaptári hónap\b|\bévszakok sorrend\w*\b",
        r"\bszöveg ?értés\b|\bszövegértés\b",
        r"\b(?:vita|érvel\w*)\b",
        r"\bsorminta\b",
        r"\btérirány\w*\b",
        r"\btartós figyelm\w*\b|\bhosszabb (?:ideig|időre) koncentrá\w*\b",
    ],
}

# Lefordítjuk compiled regex-ekké egyszer
KOR_REGEX = {
    kor: [re.compile(p, re.IGNORECASE) for p in patterns]
    for kor, patterns in KOR_MARKEREK.items()
}


def klasszifikal(bullet: str) -> Set[str]:
    """Egy bullethez visszaadja, mely korcsoportokba illik.

    Ha NINCS jelző → általános, mindhárom korba ({'kicsi','kozepso','nagy'}).
    Ha VAN jelző → csak az illeszkedő(k)be.
    """
    found: Set[str] = set()
    for kor, regexes in KOR_REGEX.items():
        for r in regexes:
            if r.search(bullet):
                found.add(kor)
                break
    if not found:
        return {"kicsi", "kozepso", "nagy"}
    return found


KORCSOPORT_CIMKEK = {
    "kicsi": "Kiscsoport (3–4 éves)",
    "kozepso": "Középső csoport (4–5 éves)",
    "nagy": "Nagycsoport (5–7 éves)",
    "vegyes": "Vegyes csoport (3–7 éves)",
}

CEL_BULLET_SZAM = 10  # bullet/téma/terület cél
MIN_BULLET_SZAM = 7  # ha ez alá megy a kor-szűrt halmaz, általánossal töltjük fel


def main() -> int:
    dry_run = "--dry-run" in sys.argv

    base_dir = os.path.join(os.path.dirname(__file__), "..", "seed")
    base_dir = os.path.abspath(base_dir)
    vegyes_path = os.path.join(base_dir, "otletek-bank-vegyes.json")

    with open(vegyes_path, encoding="utf-8") as f:
        vegyes = json.load(f)

    temak = vegyes["temak"]
    print(f"[1/3] Beolvastunk: {len(temak)} téma a vegyes-bankból.")

    # 1. Klasszifikáció — minden bullet → set of korcsoportok
    # Cellánként tároljuk: cella_klassz[(tema,terulet)] = list[(bullet, set)]
    cella_klassz: dict[tuple[str, str], list[tuple[str, Set[str]]]] = {}
    total_bullets = 0
    bullet_korszerinti = defaultdict(int)
    for tema, teruletek in temak.items():
        for terulet, bullets in teruletek.items():
            arr = []
            for b in bullets:
                k = klasszifikal(b)
                arr.append((b, k))
                total_bullets += 1
                for kor in k:
                    bullet_korszerinti[kor] += 1
            cella_klassz[(tema, terulet)] = arr

    print(f"[2/3] Klasszifikáció kész — {total_bullets} bullet, eloszlás:")
    for kor in ("kicsi", "kozepso", "nagy"):
        szazalek = (bullet_korszerinti[kor] / total_bullets) * 100
        print(f"   {kor}: {bullet_korszerinti[kor]} ({szazalek:.1f}%)")

    # 2. Kor-specifikus fájl-tartalmak előállítása
    for kor in ("kicsi", "kozepso", "nagy"):
        uj_temak = {}
        feltoltes_szam = 0
        cellak_alapertelm = 0
        for (tema, terulet), arr in cella_klassz.items():
            if tema not in uj_temak:
                uj_temak[tema] = {}
            # kor-szűrt bullets: ahol a kor-set tartalmazza ezt a kort
            kor_bullets = [b for b, k in arr if kor in k]
            # Ha kevés (kor-szűrt < MIN), feltöltjük az általánosakkal
            altalanosak = [
                b for b, k in arr if k == {"kicsi", "kozepso", "nagy"} and b not in kor_bullets
            ]
            if len(kor_bullets) < MIN_BULLET_SZAM:
                # adjunk hozzá általánosokat amíg nem érjük el a célt
                hianyzo = CEL_BULLET_SZAM - len(kor_bullets)
                kor_bullets = kor_bullets + altalanosak[:hianyzo]
                feltoltes_szam += min(hianyzo, len(altalanosak))
            # Még mindig kevés? Marad CEL alatt, ami OK — pl. kor-specifikus témánál
            if len(kor_bullets) == 0:
                # üres cella: nem hagyhatjuk, betesszük az első 10 általánost
                # vagy az első 10 bárminek
                kor_bullets = [b for b, _ in arr][:CEL_BULLET_SZAM]
                cellak_alapertelm += 1
            # max CEL_BULLET_SZAM
            if len(kor_bullets) > CEL_BULLET_SZAM:
                kor_bullets = kor_bullets[:CEL_BULLET_SZAM]
            uj_temak[tema][terulet] = kor_bullets

        # Új JSON szerkezete
        uj = {
            "korcsoport": kor,
            "korcsoport_cimke": KORCSOPORT_CIMKEK[kor],
            "_megjegyzes": (
                f"Kor-specifikus ötlet-bank — regex+keyword klasszifikációval "
                f"a vegyes-bankból szűrve. Ha a kor-szűrt halmaz <{MIN_BULLET_SZAM} bullet, "
                f"általánosokkal feltöltve. Cellánként max {CEL_BULLET_SZAM} bullet."
            ),
            "temak": uj_temak,
        }

        out_path = os.path.join(base_dir, f"otletek-bank-{kor}.json")
        if dry_run:
            print(
                f"   [DRY] {kor}: {len(uj_temak)} téma, "
                f"feltöltés: {feltoltes_szam} bullet, "
                f"üres cella alapért.: {cellak_alapertelm}"
            )
        else:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(uj, f, ensure_ascii=False, indent=2)
            sz = os.path.getsize(out_path)
            print(
                f"   ✓ {os.path.basename(out_path)}: {sz / 1024:.0f} KB, "
                f"{len(uj_temak)} téma, feltöltés: {feltoltes_szam} bullet, "
                f"üres cella alapért.: {cellak_alapertelm}"
            )

    print("[3/3] Kész.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
