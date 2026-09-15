# -*- coding: utf-8 -*-
"""
A gondozott irodalmi korpusz beépítése a seed-fájlokba.

Mit ír át:
  seed/otletek-bank-{kicsi,kozepso,nagy,vegyes}.json
      → a `verseles_meseles` és `enek_zene` listák korosztályonként újragenerálva
  seed/weekly-templates.json
      → ugyanezen két terület szövege a sablonokban
  seed/literature.json
      → a korpusz művei bekerülnek a kereshető irodalomtárba

Amihez NEM nyúl: a többi öt tevékenységi terület (külső világ, matematika,
rajzolás, hallás-ritmus, mozgás) — azokat nem érinti az irodalmi audit.

Futtatás:  python tools/irodalom_beepites.py [--dry-run]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from korpusz import KORPUSZ, MUFAJ_TERULET, MUFAJ_SORREND  # noqa: E402

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed"

KOR_JEGY = {"kicsi": "1", "kozepso": "2", "nagy": "3"}

# Így nevezzük meg a műfajt a sor végén, zárójelben.
CIMKE = {
    "mondoka": "mondóka",
    "vers": "vers",
    "mese": "mese",
    "nepmese": "népmese",
    "talalos": "találós kérdés",
    "anyanyelvi": "anyanyelvi játék",
    "dal": "dal",
    "korjatek": "énekes körjáték",
    "altato": "altató",
    "zenehallgatas": "zenehallgatás",
}

# Cellánként legfeljebb ennyi javaslat — ennél több már nem segít, csak zavar.
MAX_OTLET = 10
# A sablonok (korosztály-független) szövegébe ennyi kerül.
MAX_SABLON = 9


def sor(mu: tuple) -> str:
    """Egy mű egysoros alakja: „Szerző: Cím (műfaj) — megjegyzés”."""
    mufaj, szerzo, cim, _korok, megj = mu
    alap = f"{szerzo}: {cim}" if szerzo else cim
    szoveg = f"{alap} ({CIMKE[mufaj]})"
    if megj:
        szoveg += f" — {megj}"
    return szoveg


# A műfaj-címkék levételéhez. A NÉPMESE marad: a pedagógus kérése az volt, hogy a
# meséknél derüljön ki, ha népmese — a műmesénél és minden más műfajnál viszont
# fölösleges a zárójeles ismétlés, mert vagy a szekció fejléce mondja meg
# („Mondókák, versek:", „Mesék:"), vagy a cím önmagában elég.
CIMKE_MINTA = re.compile(
    r"\s\((?:" + "|".join(re.escape(v) for k, v in CIMKE.items() if k != "nepmese") + r")\)"
)


def cimke_nelkul(szoveg: str) -> str:
    """A sor megjelenítési alakja: műfaj-címke nélkül, a népmesét kivéve."""
    return CIMKE_MINTA.sub("", szoveg)


def normCim(szerzo: str | None, cim: str) -> tuple[str, str]:
    """
    Összevonó kulcs egy műhöz.

    Ugyanaz a dal két forrásban másképp írva szerepel („Lipem, lopom a szőlőt”
    és „Lipem-lopom a szőlőt”, „Ég a gyertya ég” és „Ég a gyertya, ég”). A
    központozás és a kis-nagybetű nélküli alak ezeket egy műnek látja.
    """
    tiszta = re.sub(r"[^\wáéíóöőúüű ]+", " ", cim.lower())
    return ((szerzo or "").lower().strip(), re.sub(r"\s+", " ", tiszta).strip())


def rangsor(tema: str, terulet: str, korjegy: str | None) -> list[tuple]:
    """
    Az adott téma + terület műveinek rangsora, a korosztályhoz szűrve.

    `korjegy=None` a vegyes csoport: mindent figyelembe vesz, de előre veszi a
    több korosztályt kiszolgáló műveket — vegyes csoportban ezek a legjobbak.
    """
    egyesitett: dict[tuple[str | None, str], tuple] = {}
    for mu in KORPUSZ.get(tema, []):
        if MUFAJ_TERULET[mu[0]] != terulet:
            continue
        kulcs = normCim(mu[1], mu[2])
        elozo = egyesitett.get(kulcs)
        if elozo is None:
            egyesitett[kulcs] = mu
        else:
            # ugyanaz a mű több helyen: korosztályok uniója, a bővebb megjegyzés
            # marad, és a megjegyzéssel ellátott (gondozott) címváltozat nyer
            korok = "".join(sorted(set(elozo[3]) | set(mu[3])))
            gyoztes = elozo if elozo[4] else mu
            megj = elozo[4] or mu[4]
            egyesitett[kulcs] = (gyoztes[0], gyoztes[1], gyoztes[2], korok, megj)

    tetelek = list(egyesitett.values())
    if korjegy is not None:
        tetelek = [m for m in tetelek if korjegy in m[3]]

    def rendez(m: tuple) -> tuple:
        # 1. műfaj szerinti sorrend (rövid, mozgásos anyag elöl)
        # 2. célzottság: vegyesnél a széles korosztályú, egyébként a szűkebben
        #    célzott mű az értékesebb — így tér el ténylegesen a négy lista
        celzottsag = -len(m[3]) if korjegy is None else len(m[3])
        return (MUFAJ_SORREND[m[0]], celzottsag, m[2])

    tetelek.sort(key=rendez)
    return tetelek


# Ennél kevesebb javaslattal egy cella már nem használható.
MINIMUM = 3


def valogat(tema: str, terulet: str, korjegy: str | None, keret: int) -> list[str]:
    """
    Kész, egysoros javaslatlista az adott téma + terület + korosztály hármasra.

    Ha a korosztályhoz kevés mű van megjelölve (a forrás nem minden hétnél ad
    mindhárom korcsoportnak anyagot), a téma korosztály-független listájából
    egészítjük ki — a mű így is a témába vág, csak nem volt korcsoporthoz kötve.
    """
    valasztott = rangsor(tema, terulet, korjegy)
    if len(valasztott) < MINIMUM:
        mar = {(m[1], m[2]) for m in valasztott}
        valasztott = valasztott + [
            m for m in rangsor(tema, terulet, None) if (m[1], m[2]) not in mar
        ]
    return [sor(m) for m in kvotaz(valasztott, terulet, keret)]


# Egy heti tervben mindkét „fajta” anyagnak szerepelnie kell: rövid mondóka/vers
# ÉS mese; dal ÉS zenehallgatás. Ha csak a műfaj-sorrend döntene, a sok mondóka
# kiszorítaná a meséket a keretből — ezért csoportonként garantált helyet adunk.
KVOTA: dict[str, list[tuple[set[str], int]]] = {
    # (műfajok, legalább ennyi hely jár nekik)
    # A mondóka és a vers külön kvótát kap: együtt kezelve a sok rövid mondóka
    # kiszorította volna a verseket, és a hét vers nélkül maradt volna.
    "verseles_meseles": [
        ({"mondoka"}, 2),
        ({"vers", "talalos"}, 2),
        ({"mese", "nepmese"}, 2),
        ({"anyanyelvi"}, 1),
    ],
    "enek_zene": [
        ({"dal", "korjatek", "altato"}, 4),
        ({"zenehallgatas"}, 1),
    ],
}


def kvotaz(tetelek: list[tuple], terulet: str, keret: int) -> list[tuple]:
    """A keretet a műfaj-csoportok között osztja el, majd a maradékot sorban tölti."""
    valasztott: list[tuple] = []
    for mufajok, minimum in KVOTA[terulet]:
        jeloltek = [m for m in tetelek if m[0] in mufajok]
        valasztott += jeloltek[:minimum]
    # a maradék helyeket az általános sorrend szerint töltjük fel
    for m in tetelek:
        if len(valasztott) >= keret:
            break
        if m not in valasztott:
            valasztott.append(m)
    # az eredményt visszarendezzük a műfaj-sorrendbe, hogy olvasható maradjon
    valasztott.sort(key=lambda m: (MUFAJ_SORREND[m[0]], m[2]))
    return valasztott[:keret]


def otletbank_ir(dry: bool) -> None:
    for kor, jegy in list(KOR_JEGY.items()) + [("vegyes", None)]:  # type: ignore[list-item]
        ut = SEED / f"otletek-bank-{kor}.json"
        adat = json.loads(ut.read_text(encoding="utf-8"))
        valtozott = 0
        for tema in adat["temak"]:
            if tema not in KORPUSZ:
                continue
            for terulet in ("verseles_meseles", "enek_zene"):
                uj = valogat(tema, terulet, jegy, MAX_OTLET)
                if uj and adat["temak"][tema].get(terulet) != uj:
                    adat["temak"][tema][terulet] = uj
                    valtozott += 1
        adat["_irodalom_forras"] = "tools/korpusz — gondozott irodalmi korpusz"
        if not dry:
            ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  otletek-bank-{kor:8} {valtozott:3} lista frissítve")


def sablonok_ir(dry: bool) -> None:
    ut = SEED / "weekly-templates.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))
    valtozott = 0
    hianyzo: set[str] = set()
    for s in adat["sablonok"]:
        tema = re.sub(r"_v[12]$", "", s["azonosito"])
        if tema not in KORPUSZ:
            hianyzo.add(tema)
            continue
        # A sablon korosztály-független, ezért a vegyes válogatást használjuk.
        # A v2 változat a lista második feléből válogat, hogy a két változat
        # tényleg más anyagot kínáljon.
        v2 = s["azonosito"].endswith("_v2")

        def valtozat(terulet: str) -> list[str]:
            rang = rangsor(tema, terulet, None)
            if v2:
                # A v2 a rangsor második feléből indul, hogy a két változat
                # tényleg más anyagot kínáljon — a kvóta utána is érvényes,
                # így mindkettőbe jut mondóka/vers ÉS mese.
                fel = max(1, len(rang) // 2)
                rang = rang[fel:] + rang[:fel]
            return [sor(m) for m in kvotaz(rang, terulet, MAX_SABLON)]

        vers = valtozat("verseles_meseles")
        enek = valtozat("enek_zene")

        # A verselés-mesélés szekció fejlécekkel tagolt, ahogy a KRÉTA-tervben
        # megszokott: előbb a mondókák/versek, utána a mesék.
        rovid = [x for x in vers if "(mondóka)" in x or "(vers)" in x or "(találós kérdés)" in x]
        anyanyelvi = [x for x in vers if "(anyanyelvi játék)" in x]
        mesek = [x for x in vers if x not in rovid and x not in anyanyelvi]
        # A SABLON SZÖVEGÉBE címke nélkül kerülnek a sorok: ebből lesz a heti terv
        # és a Word-export tartalma, ott a zárójeles „(vers)", „(dal)" csak zaj.
        # A szekció fejléce úgyis megmondja, miről van szó; a népmese jelölése
        # viszont marad, mert az tartalmi információ, nem formai ismétlés.
        blokk: list[str] = []
        if rovid:
            blokk += ["Mondókák, versek:"] + [cimke_nelkul(x) for x in rovid]
        if mesek:
            blokk += ["Mesék:"] + [cimke_nelkul(x) for x in mesek]
        if anyanyelvi:
            blokk += ["Anyanyelvi játék:"] + [cimke_nelkul(x) for x in anyanyelvi]

        if blokk and s["teruletek"].get("verseles_meseles") != "\n".join(blokk):
            s["teruletek"]["verseles_meseles"] = "\n".join(blokk)
            valtozott += 1
        enek_szoveg = "\n".join(cimke_nelkul(x) for x in enek)
        if enek and s["teruletek"].get("enek_zene") != enek_szoveg:
            s["teruletek"]["enek_zene"] = enek_szoveg
            valtozott += 1

    if hianyzo:
        print(f"  FIGYELEM — korpusz nélküli sablon-témák: {sorted(hianyzo)}")
    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  weekly-templates      {valtozott:3} szekció frissítve")


# A korpusz műfajai és az irodalomtár `tipus` enumja közti leképezés.
LIT_TIPUS = {
    "mondoka": "mondoka",
    "vers": "vers",
    "mese": "mese",
    "nepmese": "nepmese",
    "talalos": "talalos_kerdes",
    "dal": "dal",
    "korjatek": "koreplay",
    "altato": "altato",
    "zenehallgatas": "zenehallgatas",
}


def irodalom_ir(dry: bool) -> None:
    """A korpusz műveit hozzáadja a kereshető irodalomtárhoz (meglévőt nem ír felül)."""
    ut = SEED / "literature.json"
    adat = json.loads(ut.read_text(encoding="utf-8"))
    def azonos(szerzo: str | None, cim: str) -> tuple[str, str]:
        """Összehasonlító kulcs — a két oldalt EGYFORMÁN kell normalizálni,
        különben a „Március 15.” és a „Március 15”, illetve a „Lipem, lopom” és
        a „Lipem-lopom” két külön műnek látszik."""
        return normCim(szerzo, cim)

    meglevo = {azonos(x.get("szerzo"), x["cim"]) for x in adat["tetelek"]}

    # A korpusz műveit összevonjuk: korosztályok és témák uniója.
    muvek: dict[tuple[str, str], dict] = {}
    for tema, tetelek in KORPUSZ.items():
        for mufaj, szerzo, cim, korok, _megj in tetelek:
            # Az anyanyelvi játék nem irodalmi mű — a heti tervben a helye, az
            # Irodalom menüben nincs.
            if mufaj not in LIT_TIPUS:
                continue
            kulcs = normCim(szerzo, cim)
            rec = muvek.setdefault(
                kulcs, {"tipus": LIT_TIPUS[mufaj], "cim": cim, "szerzo": szerzo,
                        "korok": set(), "temak": set()}
            )
            rec["korok"].update(korok)
            rec["temak"].add(tema)

    KOR_NEV = {"1": "kicsi", "2": "kozepso", "3": "nagy"}
    uj = 0
    for kulcs, rec in sorted(muvek.items(), key=lambda kv: (kv[0][1])):
        norm = azonos(kulcs[0], kulcs[1])
        if norm in meglevo:
            continue
        meglevo.add(norm)
        korok = rec["korok"]
        korcsoport = KOR_NEV[sorted(korok)[0]] if len(korok) == 1 else "vegyes"
        tetel = {
            "tipus": rec["tipus"],
            "cim": rec["cim"],
            "korcsoport": korcsoport,
            "temak": sorted(rec["temak"]),
        }
        if rec["szerzo"]:
            tetel["szerzo"] = rec["szerzo"]
        adat["tetelek"].append(tetel)
        uj += 1

    adat["_utolso_frissites"] = "irodalmi audit — gondozott korpusz beépítve"
    if not dry:
        ut.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  literature.json       {uj:3} új mű (összesen {len(adat['tetelek'])})")


def main() -> int:
    dry = "--dry-run" in sys.argv
    print("Irodalmi korpusz beépítése" + (" (dry-run)" if dry else ""))
    otletbank_ir(dry)
    sablonok_ir(dry)
    irodalom_ir(dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
