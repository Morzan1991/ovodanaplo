# -*- coding: utf-8 -*-
"""
Az irodalomtárban tárolt SZÖVEGEK hitelesítése.

MI VOLT A BAJ. A `seed/literature.json` 114 műnél teljes szöveget is tárolt. Az
átvizsgálás kiderítette, hogy ezek egy részét nem forrásból vették át, hanem
kitalálták: a mű első sora (a cím) általában stimmel, a folytatás viszont
költött. Példák:

  - „Beültettem kis kertemet" — a 2. sortól kitalált; a valódi folytatás
    „Rózsa, szegfű, liliom és rezedával".
  - „Aki nem lép egyszerre" — a 3–4. sor kitalált; a valódi „Mert a rétes igen
    jó, / Katonának az való".
  - „Hej, Vargáné káposztát főz" — nálunk „kontya alatt egy egér nőtt”; a valódi
    „Kontya alá ütött a gőz".
  - Móra „Zengő ABC" — a tárolt szöveg teljesen költött; a valódi „Aranyalma
    ághegyen. / Bari bég a zöld gyepen."
  - Arany „Mátyás anyja" — az utolsó sor „Ázott sűrü sorja” volt a valódi „Azt
    is telesirta" helyett.

Egy óvodai naplóban ez nem megengedhető: a pedagógus a programból tanítja a
verset a gyerekeknek.

MIT CSINÁL EZ A SZKRIPT.
  1. A forrásból IGAZOLT szövegeket beírja (`IGAZOLT`). Minden tételnél ott a
     forrás, ahol ellenőriztük.
  2. Az összefoglalókat kiveszi (`OSSZEFOGLALO`): ezek nem a mű szövegei,
     hanem tartalmi kivonatok, és szövegként megjelenítve félrevezetők.
  3. Törli a nem létező műveket és a duplikátumok névtelen ikertételét
     (`TETEL_TORLES`) — a felhasználó döntése szerint a szerzős alak marad.

Ami nincs ebben a listában, azt még nem ellenőriztük forrásból.

Futtatás: python tools/irodalom_hitelesites.py [--dry-run]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

SEED = Path(__file__).resolve().parent.parent / "seed" / "literature.json"

# cím -> (ellenőrzött szöveg, forrás). A cím egyedi ezeknél a tételeknél.
IGAZOLT: dict[str, tuple[str, str]] = {
    "A cinege cipője": (
        "Vége van a nyárnak,\n"
        "hűvös szelek járnak,\n"
        "nagy bánata van a\n"
        "cinegemadárnak.\n\n"
        "Szeretne elmenni,\n"
        "ő is útra kelni.\n"
        "De cipőt az árva\n"
        "sehol se tud venni.\n\n"
        "— Móra Ferenc (részlet)",
        "magyar-versek.hu + varazsbetu.hu",
    ),
    "Zengő ABC": (
        "Aranyalma ághegyen.\n"
        "Bari bég a zöld gyepen.\n"
        "Cirmos cica egerész.\n"
        "Csengős csikó heverész.\n"
        "Dongó darázs döngicsél.\n"
        "Esik eső, fúj a szél.\n"
        "Füsti fecske ficsereg.\n"
        "Gerle, galamb kesereg.\n\n"
        "— Móra Ferenc (részlet)",
        "magyarmindenkinek.hu + moly.hu",
    ),
    "Mátyás anyja": (
        "Szilágyi\n"
        "Örzsébet\n"
        "Levelét megirta;\n"
        "Szerelmes\n"
        "Könnyével\n"
        "Azt is telesirta.\n\n"
        "— Arany János (részlet)",
        "arcanum Verstár + magyar-irodalom.elte.hu",
    ),
    "Rege a csodaszarvasról": (
        "Száll a madár, ágrul ágra,\n"
        "Száll az ének, szájrul szájra;\n"
        "Fű kizöldül ó sirhanton,\n"
        "Bajnok ébred hősi lanton.\n\n"
        "— Arany János (részlet)",
        "mek.oszk.hu (Arany összes) + szozat.org",
    ),
    "Nyuszi ül a fűben": (
        "Nyuszi ül a fűben,\n"
        "szépen szundikálva.\n"
        "Nyuszi talán beteg vagy,\n"
        "hogy már nem is ugorhatsz?\n"
        "Nyuszi hopp, nyuszi hopp,\n"
        "máris egyet elkapott!",
        "csemadok.sk + gyerekdalokesmondokak.hu",
    ),
    "Aki nem lép egyszerre": (
        "Aki nem lép egyszerre,\n"
        "nem kap rétest estére,\n"
        "mert a rétes igen jó,\n"
        "katonának az való.",
        "csemadok.sk + mondokatar",
    ),
    "Hej, Vargáné káposztát főz": (
        "Hej, Vargáné káposztát főz,\n"
        "kontya alá ütött a gőz,\n"
        "hányja-veti fakalánját,\n"
        "kinek adja Zsuzsa lányát?",
        "mek.oszk.hu népdalok + Wikipédia (Bartók, 1909)",
    ),
    "Hopp, Juliska, hopp, Mariska": (
        "Hopp, Juliska, hopp, Mariska,\n"
        "sej, gyere vélem egy pár táncra!",
        "csemadok.sk + znosti.hu kotta",
    ),
    "Beültettem kis kertemet": (
        "Beültettem kiskertemet a tavasszal,\n"
        "rózsa, szegfű, liliom és rezedával.\n"
        "Ki is nyíltak egyenkint,\n"
        "el szeretném adni mind,\n"
        "de most mindjár!",
        "mek.oszk.hu népdalok + csemadok.sk",
    ),
    "A pünkösdi rózsa": (
        "A pünkösdi rózsa kihajlott az útra,\n"
        "nékem es kihajlott szekeremnek rúdja.",
        "folkradio.hu + csemadok.sk",
    ),
    "Lipem-lopom a szőlőt": (
        "Lipem, lopom a szőlőt,\n"
        "elaludt az öreg csősz.\n"
        "Furkósbot a kezében,\n"
        "vaskalap a fejében.",
        "csemadok.sk + gyerekdalokesmondokak.hu",
    ),
    "Megy a gőzös": (
        "Megy a gőzös, megy a gőzös Kanizsára,\n"
        "kanizsai, kanizsai állomásra.\n"
        "Elöl áll a masiniszta,\n"
        "ki a gőzöst, ki a gőzöst igazítja.",
        "gyerekdal.hu + songbook.hu",
    ),
    "Anyám tyúkja": (
        "Ej mi a kő! tyúkanyó, kend\n"
        "A szobában lakik itt bent?\n"
        "Lám, csak jó az isten, jót ád,\n"
        "Hogy fölvitte a kend dolgát!\n\n"
        "Itt szaladgál föl és alá,\n"
        "Még a ládára is fölszáll,\n"
        "Eszébe jut, kotkodácsol,\n"
        "S nem verik ki a szobából.\n\n"
        "— Petőfi Sándor (részlet)",
        "arcanum Verstár + eternus.hu — a „kotkodákol” javítva",
    ),
    "Itt van az ősz, itt van újra": (
        "Itt van az ősz, itt van újra,\n"
        "S szép, mint mindig, énnekem.\n"
        "Tudja isten, hogy mi okból\n"
        "Szeretem? de szeretem.\n\n"
        "Kiülök a dombtetőre,\n"
        "Innen nézek szerteszét,\n"
        "S hallgatom a fák lehulló\n"
        "Levelének lágy neszét.\n\n"
        "— Petőfi Sándor (részlet)",
        "arcanum Verstár + magyar-irodalom.elte.hu — a „domb tetőre” javítva",
    ),
    "Altató": (
        "Lehunyja kék szemét az ég,\n"
        "lehunyja sok szemét a ház,\n"
        "dunna alatt alszik a rét —\n"
        "aludj el szépen, kis Balázs.\n\n"
        "Lábára lehajtja fejét,\n"
        "alszik a bogár, a darázs,\n"
        "vele alszik a zümmögés —\n"
        "aludj el szépen, kis Balázs.\n\n"
        "— József Attila (részlet)",
        "a „velealszik” egybeírás javítása",
    ),
}

# Forrásból ellenőrizve, és a tárolt szöveg HELYES — nem kell hozzányúlni.
VALTOZATLAN_IGAZOLT = [
    "Betlehemi királyok",  # arcanum Verstár + magyar-irodalom.elte.hu
    "Családi kör",  # arcanum Verstár + magyar-irodalom.elte.hu
    "Mama",  # arcanum Verstár + magyar-versek.hu
]

# Ezeknél a tárolt „szöveg" valójában tartalmi összefoglaló, nem a mű szövege.
OSSZEFOGLALO = ["A kis kakas gyémánt félkrajcárja"]

# Ahová az ELLENŐRIZETLEN szövegek kerülnek. Nem dobjuk el őket: egyenként
# ellenőrizhetők és visszatehetők, de amíg nincsenek igazolva, a program nem
# mutathatja őket. A mintavétel szerint nagyjából minden második költött volt.
ELLENORZENDO_UT = Path(__file__).resolve().parent / "irodalom_ellenorzendo.json"

# Teljes tételek törlése: (tipus, cím, szerző vagy None) -> indoklás.
TETEL_TORLES: dict[tuple[str, str, str | None], str] = {
    ("vers", "Tavasz", "Petőfi Sándor"): "Petőfinek nincs ilyen verse; a tárolt szöveg is költött",
    ("vers", "Mit ír a fecske?", "Móra Ferenc"): "Mórának nincs ilyen verse (van „Fecskehívogató”)",
    ("nepmese", "A brémai muzsikusok", None): "duplikátum — a Grimm-változat marad",
    ("nepmese", "A csillagszemű juhász", None): "duplikátum — a Benedek Elek-változat marad",
    ("nepmese", "A három kívánság", None): "duplikátum — a Benedek Elek-változat marad",
    ("nepmese", "A három pillangó", None): "duplikátum — a Jékely Zoltán-változat marad",
    ("nepmese", "A nyulacska harangocskája", None): "duplikátum — a Benedek Elek-változat marad",
    ("mese", "A suszter manói", "Grimm testvérek"): "duplikátum — a „Jakob és Wilhelm Grimm” alak marad",
    ("nepmese", "Holle anyó", None): "duplikátum — a Grimm-változat marad",
    ("dal", "Itt a farsang, áll a bál", None): "duplikátum — Gazdag Erzsi verse marad",
    ("nepmese", "Jancsi és Juliska", None): "duplikátum — a Grimm-változat marad",
    ("nepmese", "Szóló szőlő, mosolygó alma, csengő barack", None): "duplikátum — a Benedek Elek-változat marad",
    ("dal", "Télapó itt van", None): "duplikátum — Donászy Magda dala marad",
}


def szerzo(t: dict) -> str | None:
    sz = (t.get("szerzo") or "").strip()
    return sz or None


def main() -> int:
    dry = "--dry-run" in sys.argv
    adat = json.loads(SEED.read_text(encoding="utf-8"))
    tetelek = adat["tetelek"]

    print("=== 1. Forrásból igazolt szövegek ===")
    javitva = 0
    for t in tetelek:
        par = IGAZOLT.get(t.get("cim", ""))
        if not par:
            continue
        uj, forras = par
        if t.get("szoveg") == uj:
            continue
        t["szoveg"] = uj
        javitva += 1
        print(f"  {t['cim']}  ({forras})")
    print(f"  javítva: {javitva}\n")

    print("=== 2. Összefoglaló kivétele (nem a mű szövege) ===")
    kivett = 0
    for t in tetelek:
        if t.get("cim") in OSSZEFOGLALO and t.get("szoveg"):
            t.pop("szoveg", None)
            kivett += 1
            print(f"  {t['cim']}")
    print(f"  kivéve: {kivett}\n")

    print("=== 3. Tételek törlése ===")
    megmarad = []
    torolt = 0
    for t in tetelek:
        kulcs = (t.get("tipus"), t.get("cim"), szerzo(t))
        miert = TETEL_TORLES.get(kulcs)
        if miert:
            torolt += 1
            print(f"  {t.get('tipus'):8} {t.get('cim')[:46]:48} — {miert}")
            continue
        megmarad.append(t)
    print(f"  törölve: {torolt}\n")

    print("=== 4. Ellenőrizetlen szövegek félretétele ===")
    igazolt_cimek = set(IGAZOLT) | set(VALTOZATLAN_IGAZOLT)
    felretett: list[dict] = []
    for t in megmarad:
        if not (t.get("szoveg") or "").strip():
            continue
        if t.get("cim") in igazolt_cimek:
            continue
        felretett.append(
            {
                "tipus": t.get("tipus"),
                "cim": t.get("cim"),
                "szerzo": t.get("szerzo"),
                "szoveg": t["szoveg"],
            }
        )
        t.pop("szoveg", None)
    if felretett:
        print(f"  {len(felretett)} szöveg került az ellenőrzendők közé")
        print(f"  -> {ELLENORZENDO_UT.name}")
        if not dry:
            ELLENORZENDO_UT.write_text(
                json.dumps(
                    {
                        "_megjegyzes": (
                            "Ellenőrizetlen irodalmi szövegek. Amíg egy tétel nincs "
                            "forrásból igazolva, NEM kerülhet vissza a seedbe. "
                            "Igazolás után vedd fel az IGAZOLT vagy a "
                            "VALTOZATLAN_IGAZOLT listába a tools/irodalom_hitelesites.py-ban."
                        ),
                        "tetelek": felretett,
                    },
                    ensure_ascii=False,
                    indent=2,
                )
                + "\n",
                encoding="utf-8",
            )
    else:
        print("  nincs ellenőrizetlen szöveg")
    print()

    if javitva == 0 and kivett == 0 and torolt == 0 and not felretett:
        print("  Nincs tennivaló — az irodalomtár már a hitelesített állapotban van.")
        return 0

    adat["tetelek"] = megmarad
    print(f"  irodalomtár: {len(tetelek)} -> {len(megmarad)} tétel")
    if dry:
        print("  (dry-run — semmi nem íródott ki)")
        return 0
    SEED.write_text(json.dumps(adat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
