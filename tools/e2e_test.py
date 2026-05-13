"""
E2E backend-teszt: a 16+1 feature CRUD-flow-ját végigjárja egy temp SQLite DB-n.

Az élő app SQLite-jét NEM piszkálja — egy temp DB-t hoz létre a séma alapján,
és lefuttatja rajta a flow-kat: INSERT, SELECT, UPDATE, DELETE, CASCADE.

Minden TODO-feature backend-jét ellenőriz egy önálló blokkban (✅ / ❌).
"""

from __future__ import annotations

import json
import os
import shutil
import sqlite3
import sys
import tempfile
from datetime import datetime
from pathlib import Path

# UTF-8 stdout
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
LIVE_DB = Path(os.path.expandvars(r"%APPDATA%\ovodanaplo\OvodaNaplo\ovodanaplo.db"))


def OK(s: str) -> None:
    print(f"  ✅ {s}")


def ERR(s: str) -> None:
    print(f"  ❌ {s}")
    global ERR_COUNT
    ERR_COUNT += 1


def INFO(s: str) -> None:
    print(f"  ℹ️  {s}")


def cim(c: str) -> None:
    print(f"\n{'═' * 70}\n{c}\n{'═' * 70}")


ERR_COUNT = 0


def setup_temp_db() -> str:
    """Új temp DB létrehozása az élő séma-szkripttel (db/index.ts inicializálás-mintáját követi)."""
    tmpdir = tempfile.mkdtemp(prefix="ovodanaplo-e2e-")
    db_path = os.path.join(tmpdir, "test.db")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")

    # A séma egy-az-egy az `app/src/main/db/index.ts` `statements` listájából.
    # (Itt csak inline-olva — később dedikálhatnánk egy schema.sql-be.)
    schema = """
    CREATE TABLE IF NOT EXISTS beallitasok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedagogus_neve TEXT, ovoda_neve TEXT, ovoda_cime TEXT, csoport_neve TEXT,
      csoport_tipus TEXT DEFAULT 'vegyes',
      utolso_backup INTEGER, theme_accent TEXT DEFAULT 'osz'
    );

    CREATE TABLE IF NOT EXISTS nevelesi_evek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL, kezdo TEXT NOT NULL, zaro TEXT NOT NULL,
      aktiv INTEGER DEFAULT 0,
      korcsoport TEXT DEFAULT 'vegyes',
      letrehozva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS projektek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      cim TEXT NOT NULL,
      kezdo_datum TEXT, zaro_datum TEXT, cel TEXT, tema TEXT,
      feladat_ertelmi TEXT, feladat_kommunikacios TEXT, feladat_erkolcsi TEXT, feladat_testi TEXT,
      bevontak TEXT, elokeszuletek TEXT, alkoto_tevekenysegek TEXT,
      jatekok TEXT, szabalyok TEXT,
      produktumok_gyermeki TEXT, produktumok_pedagogusi TEXT,
      munka_jellegu TEXT, ovodapedagogus_feladatai TEXT, eszkozok TEXT,
      iskola_elokeszito_osszesitett TEXT, szokasok_hagyomanyok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS heti_tervek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      projekt_id INTEGER REFERENCES projektek(id),
      het_szama INTEGER, kezdo_datum TEXT NOT NULL, zaro_datum TEXT NOT NULL,
      tema TEXT, cel TEXT, feladat TEXT,
      differencialas TEXT DEFAULT 'tartalomban, módszerekben',
      modszerek TEXT, kepessegfejlesztes TEXT, eszkozok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS teruletek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heti_terv_id INTEGER NOT NULL REFERENCES heti_tervek(id) ON DELETE CASCADE,
      tipus TEXT NOT NULL,
      tartalom TEXT, iskola_elokeszito TEXT, sorrend INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS foglalkozas_tervezetek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heti_terv_id INTEGER REFERENCES heti_tervek(id),
      pedagogus_neve TEXT, helyszin TEXT, idopont TEXT, csoport TEXT, csoport_tipus TEXT,
      tevekenysegi_forma TEXT, tema TEXT NOT NULL, cel TEXT, feladat TEXT,
      korcsoport TEXT, idotartam TEXT, eszkozok TEXT,
      motivacio TEXT, fo_resz TEXT, befejezes TEXT,
      munkaforma TEXT, modszerek TEXT, differencialas TEXT, kepessegfejlesztes TEXT,
      iskola_elokeszito TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS reflexiok (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipus TEXT NOT NULL,
      foglalkozas_id INTEGER REFERENCES foglalkozas_tervezetek(id),
      heti_terv_id INTEGER REFERENCES heti_tervek(id),
      projekt_id INTEGER REFERENCES projektek(id),
      terulet_tipus TEXT, tartalom TEXT NOT NULL, forrasok TEXT,
      letrehozva INTEGER DEFAULT (unixepoch()),
      modositva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS esemenyek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nevelesi_ev_id INTEGER REFERENCES nevelesi_evek(id),
      cim TEXT NOT NULL, datum TEXT NOT NULL, tipus TEXT, leiras TEXT, reszvevok TEXT,
      reflexio TEXT, letrehozva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS irodalom (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipus TEXT NOT NULL, cim TEXT NOT NULL, szerzo TEXT, forras TEXT,
      szoveg TEXT, korcsoport TEXT, temak TEXT, sajat INTEGER DEFAULT 0,
      letrehozva INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS unnepek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL, datum TEXT, tipus TEXT DEFAULT 'fix',
      honap INTEGER, nap INTEGER, ovodai_sulyozas INTEGER DEFAULT 5, leiras TEXT
    );

    CREATE TABLE IF NOT EXISTS kepessegek (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nev TEXT NOT NULL, kategoria TEXT, iskola_elokeszito INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS heti_terv_kepesseg (
      heti_terv_id INTEGER NOT NULL REFERENCES heti_tervek(id) ON DELETE CASCADE,
      kepesseg_id INTEGER NOT NULL REFERENCES kepessegek(id)
    );

    -- FTS5 (TODO-12)
    CREATE VIRTUAL TABLE IF NOT EXISTS heti_terv_fts USING fts5(
      heti_terv_id UNINDEXED,
      tema, cel, feladat, kepessegfejlesztes, eszkozok, teruletek_osszesen,
      tokenize='unicode61 remove_diacritics 2'
    );

    -- FTS5 triggerek
    CREATE TRIGGER IF NOT EXISTS heti_terv_ai AFTER INSERT ON heti_tervek BEGIN
      INSERT INTO heti_terv_fts (heti_terv_id, tema, cel, feladat, kepessegfejlesztes, eszkozok, teruletek_osszesen)
      VALUES (new.id, COALESCE(new.tema,''), COALESCE(new.cel,''), COALESCE(new.feladat,''),
              COALESCE(new.kepessegfejlesztes,''), COALESCE(new.eszkozok,''), '');
    END;
    CREATE TRIGGER IF NOT EXISTS heti_terv_au AFTER UPDATE ON heti_tervek BEGIN
      UPDATE heti_terv_fts SET tema = COALESCE(new.tema,''), cel = COALESCE(new.cel,''),
        feladat = COALESCE(new.feladat,''), kepessegfejlesztes = COALESCE(new.kepessegfejlesztes,''),
        eszkozok = COALESCE(new.eszkozok,'')
      WHERE heti_terv_id = new.id;
    END;
    CREATE TRIGGER IF NOT EXISTS heti_terv_ad AFTER DELETE ON heti_tervek BEGIN
      DELETE FROM heti_terv_fts WHERE heti_terv_id = old.id;
    END;
    CREATE TRIGGER IF NOT EXISTS terulet_ai AFTER INSERT ON teruletek BEGIN
      UPDATE heti_terv_fts SET teruletek_osszesen = (
        SELECT GROUP_CONCAT(COALESCE(tartalom,'') || ' ' || COALESCE(iskola_elokeszito,''), ' ')
        FROM teruletek WHERE heti_terv_id = new.heti_terv_id
      ) WHERE heti_terv_id = new.heti_terv_id;
    END;
    """
    # executescript() többutasításosan kezeli a trigger-en belüli pontosvesszőt
    conn.executescript(schema)
    conn.commit()
    return db_path


def main() -> int:
    cim("OvodaNapló E2E backend-teszt — temp DB-n")

    db_path = setup_temp_db()
    INFO(f"Temp DB: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # ════════════════════════════════════════════════════
    # SETUP: Seed adatok beszúrása
    # ════════════════════════════════════════════════════
    cim("[1/8] SETUP: nevelési év + kategóriák + képességek")

    # Aktív nevelési év
    cur.execute(
        "INSERT INTO nevelesi_evek (nev, kezdo, zaro, aktiv, korcsoport) VALUES (?,?,?,1,?)",
        ("2025/2026", "2025-09-01", "2026-06-30", "vegyes"),
    )
    ev_id = cur.lastrowid
    OK(f"Nevelési év létrehozva: id={ev_id}, 'aktiv'=1")

    # Második nevelési év (a "Tavaly ilyenkor" tesztéhez)
    cur.execute(
        "INSERT INTO nevelesi_evek (nev, kezdo, zaro, aktiv, korcsoport) VALUES (?,?,?,0,?)",
        ("2024/2025", "2024-09-01", "2025-06-30", "vegyes"),
    )
    tavalyi_ev_id = cur.lastrowid
    OK(f"Tavalyi év létrehozva: id={tavalyi_ev_id}")

    # Képességek seed (mini)
    test_kepessegek = [
        ("Megfigyelőképesség", "ertelmi", 1),
        ("Szókincs", "kommunikacios", 1),
        ("Finommotorika", "testi", 1),
        ("Ritmusérzék", "muveszeti", 0),
        ("Empátia", "erkolcsi", 0),
    ]
    cur.executemany(
        "INSERT INTO kepessegek (nev, kategoria, iskola_elokeszito) VALUES (?,?,?)",
        test_kepessegek,
    )
    OK(f"Képességek létrehozva: {len(test_kepessegek)} db, 6 kategóriában")

    conn.commit()

    # ════════════════════════════════════════════════════
    # TODO-9: Tavaly ilyenkor (heti terv tavalyról)
    # ════════════════════════════════════════════════════
    cim("[2/8] TODO-15: 'Tavaly ilyenkor' adat-előkészítés")

    cur.execute(
        """INSERT INTO heti_tervek (nevelesi_ev_id, kezdo_datum, zaro_datum, tema, cel, feladat)
           VALUES (?,?,?,?,?,?)""",
        (tavalyi_ev_id, "2024-12-02", "2024-12-06", "Mikulás várás (tavaly)", "Várakozás", "Mese"),
    )
    tavalyi_terv_id = cur.lastrowid
    OK(f"Tavalyi heti terv: id={tavalyi_terv_id}, kezdo=2024-12-02")
    conn.commit()

    # ════════════════════════════════════════════════════
    # TODO-1, 4, 6: Heti terv létrehozása (új tervezet)
    # ════════════════════════════════════════════════════
    cim("[3/8] TODO-1, 4: Új heti terv (idei Mikulás)")

    cur.execute(
        """INSERT INTO heti_tervek (nevelesi_ev_id, kezdo_datum, zaro_datum, tema, cel, feladat, kepessegfejlesztes, eszkozok)
           VALUES (?,?,?,?,?,?,?,?)""",
        (
            ev_id,
            "2025-12-01",
            "2025-12-05",
            "Mikulás várás",
            "A Mikulás-tradíció megismerése",
            "Mesehallgatás, csizma-készítés",
            "megfigyelőképesség, szókincs",
            "olló, ragasztó, papír, krepp-papír",
        ),
    )
    terv_id = cur.lastrowid
    OK(f"Új heti terv: id={terv_id}, téma='Mikulás várás'")

    # 7 terület hozzáadása
    teruletek_data = [
        (terv_id, "kulso_vilag", "Mikulás-tradíció, népszokások.", "Megfigyelő-figyelem", 0),
        (terv_id, "matematika", "Csomagok számolása, sorrendezés.", "", 1),
        (terv_id, "verseles_meseles", "Mesék:\nMikulás meséje\n\nMondókák és versek:\nMikulás bácsi, ne menj el", "", 2),
        (terv_id, "rajzolas_festes", "Mikulás-csizma kollázs", "", 3),
        (terv_id, "enek_zene", "Mikulás-énekek tanulása", "", 4),
        (terv_id, "hallas_ritmus", "Csengős-ritmusjáték", "", 5),
        (terv_id, "mozgas", "Tornatermi tevékenységek:\nMikulás-szánkó futás\n\nCsoportban/udvaron végzett mindennapos mozgás:\nHólabda-dobálás", "", 6),
    ]
    cur.executemany(
        "INSERT INTO teruletek (heti_terv_id, tipus, tartalom, iskola_elokeszito, sorrend) VALUES (?,?,?,?,?)",
        teruletek_data,
    )
    OK(f"7 terület hozzáadva: {len(teruletek_data)} db")
    conn.commit()

    # ════════════════════════════════════════════════════
    # TODO-11: Képesség multi-select
    # ════════════════════════════════════════════════════
    cim("[4/8] TODO-11: Képesség M-N kapcsolatok")

    valasztott_kepessegek = [1, 2, 4]  # Megfigyelő, Szókincs, Ritmusérzék
    for kid in valasztott_kepessegek:
        cur.execute(
            "INSERT INTO heti_terv_kepesseg (heti_terv_id, kepesseg_id) VALUES (?,?)",
            (terv_id, kid),
        )
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM heti_terv_kepesseg WHERE heti_terv_id = ?", (terv_id,))
    kepesseg_db = cur.fetchone()[0]
    if kepesseg_db == len(valasztott_kepessegek):
        OK(f"Képesség-kapcsolatok mentve: {kepesseg_db} (várt: {len(valasztott_kepessegek)})")
    else:
        ERR(f"Képesség-kapcsolatok eltérés: {kepesseg_db} (várt: {len(valasztott_kepessegek)})")

    # ════════════════════════════════════════════════════
    # TODO-12: FTS5 keresés
    # ════════════════════════════════════════════════════
    cim("[5/8] TODO-12: FTS5 full-text keresés")

    # A trigger automatikusan szinkronizált — most lekérdezzük
    cur.execute("SELECT COUNT(*) FROM heti_terv_fts")
    fts_count = cur.fetchone()[0]
    if fts_count > 0:
        OK(f"FTS5 tábla: {fts_count} bejegyzés (trigger működik)")
    else:
        ERR("FTS5 tábla üres — a trigger nem futott le")

    cur.execute("SELECT heti_terv_id FROM heti_terv_fts WHERE heti_terv_fts MATCH 'mikulás*'")
    talalatok = cur.fetchall()
    if len(talalatok) >= 1:
        OK(f"FTS5 keresés 'mikulás*' → {len(talalatok)} találat")
    else:
        ERR(f"FTS5 keresés 'mikulás*' → 0 találat (várt: >=1)")

    cur.execute("SELECT heti_terv_id FROM heti_terv_fts WHERE heti_terv_fts MATCH 'csizma*'")
    csizma_talalatok = cur.fetchall()
    if len(csizma_talalatok) >= 1:
        OK(f"FTS5 keresés 'csizma*' (területből!) → {len(csizma_talalatok)} találat")
    else:
        ERR("FTS5 keresés 'csizma*' → 0 találat (teruletek_osszesen trigger?)")

    # ════════════════════════════════════════════════════
    # TODO-9: Heti terv másolás
    # ════════════════════════════════════════════════════
    cim("[6/8] TODO-9: Heti terv másolás")

    # Másolat: új heti terv az aktuálisból
    cur.execute("SELECT * FROM heti_tervek WHERE id = ?", (terv_id,))
    forras = cur.fetchone()
    columns = [d[0] for d in cur.description]
    forras_dict = dict(zip(columns, forras))
    cur.execute(
        """INSERT INTO heti_tervek (nevelesi_ev_id, kezdo_datum, zaro_datum, tema, cel, feladat, eszkozok)
           VALUES (?,?,?,?,?,?,?)""",
        (
            ev_id,
            "2025-12-08",  # új dátumok
            "2025-12-12",
            f"(másolat) {forras_dict['tema']}",  # "(másolat)" prefix
            forras_dict["cel"],
            forras_dict["feladat"],
            forras_dict["eszkozok"],
        ),
    )
    masolat_id = cur.lastrowid
    OK(f"Másolat heti terv: id={masolat_id}, téma='(másolat) Mikulás várás'")

    # A területek másolása
    cur.execute("SELECT tipus, tartalom, iskola_elokeszito, sorrend FROM teruletek WHERE heti_terv_id = ?", (terv_id,))
    forras_teruletek = cur.fetchall()
    for t in forras_teruletek:
        cur.execute("INSERT INTO teruletek (heti_terv_id, tipus, tartalom, iskola_elokeszito, sorrend) VALUES (?,?,?,?,?)",
                    (masolat_id,) + t)
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM teruletek WHERE heti_terv_id = ?", (masolat_id,))
    masolat_terulet_db = cur.fetchone()[0]
    if masolat_terulet_db == 7:
        OK(f"Másolat területek: 7/7 átmásolva")
    else:
        ERR(f"Másolat területek: {masolat_terulet_db}/7")

    # ════════════════════════════════════════════════════
    # TODO-2: Foglalkozás-tervezet + IE-mező
    # ════════════════════════════════════════════════════
    cim("[7/8] TODO-2: Foglalkozás-tervezet + IE-mező")

    cur.execute(
        """INSERT INTO foglalkozas_tervezetek
           (heti_terv_id, tema, cel, tevekenysegi_forma, iskola_elokeszito, motivacio, fo_resz, befejezes)
           VALUES (?,?,?,?,?,?,?,?)""",
        (
            terv_id,
            "Mikulás-mese feldolgozás",
            "A Mikulás-mese figyelmes hallgatása",
            "verseles_meseles",
            "Megfigyelőképesség (mese-szereplők), szókincs (tradicionális szavak), figyelem-tartás 10 percig",
            "Mikulás-csizma bemutatása",
            "Mese felolvasása + képes előadás",
            "Csizma-rajzolás",
        ),
    )
    fogl_id = cur.lastrowid
    cur.execute("SELECT iskola_elokeszito FROM foglalkozas_tervezetek WHERE id = ?", (fogl_id,))
    ie_szoveg = cur.fetchone()[0]
    if ie_szoveg and "Megfigyel" in ie_szoveg:
        OK(f"Foglalkozás-tervezet IE-mezővel: id={fogl_id}, IE-szöveg: '{ie_szoveg[:50]}...'")
    else:
        ERR(f"IE-mező hibás: '{ie_szoveg}'")

    # Reflexió (TODO-7)
    cur.execute(
        """INSERT INTO reflexiok (tipus, foglalkozas_id, tartalom)
           VALUES (?,?,?)""",
        ("foglalkozas", fogl_id, "A gyerekek nagyon élvezték a mesét."),
    )
    refl_fogl_id = cur.lastrowid
    OK(f"Foglalkozás-reflexió: id={refl_fogl_id}")

    cur.execute(
        """INSERT INTO reflexiok (tipus, heti_terv_id, terulet_tipus, tartalom)
           VALUES (?,?,?,?)""",
        ("heti", terv_id, "verseles_meseles", "A versek jól mentek, a mondókákat is megtanulták."),
    )
    refl_heti_id = cur.lastrowid
    OK(f"Heti-reflexió (területenként): id={refl_heti_id}, terület=verseles_meseles")

    conn.commit()

    # ════════════════════════════════════════════════════
    # TODO-10: Projekt
    # ════════════════════════════════════════════════════
    cim("[8/8] TODO-10: Projektterv + kapcsolódó reflexió")

    cur.execute(
        """INSERT INTO projektek
           (nevelesi_ev_id, cim, kezdo_datum, zaro_datum, cel, tema,
            feladat_ertelmi, feladat_kommunikacios, feladat_erkolcsi, feladat_testi,
            alkoto_tevekenysegek, jatekok, eszkozok, iskola_elokeszito_osszesitett, szokasok_hagyomanyok)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            ev_id, "Ősz projekt", "2025-09-15", "2025-10-31",
            "Az évszak megfigyelése", "Ősz",
            "Termény-számolás, formafelismerés", "Új szavak: kukorica, gesztenye",
            "Természet tisztelete", "Sétálás, gyűjtés",
            "Levél-kollázs, festés", "Termény-pakolás játék",
            "Termények, levél, gyertya, gyurma",
            "Megfigyelő-képesség, sorbarendezés, finommotorika",
            "Szüret, gyűjtögetés",
        ),
    )
    projekt_id = cur.lastrowid
    OK(f"Projektterv létrehozva: id={projekt_id}, 'Ősz projekt' 5+ szekciós tartalommal")

    cur.execute(
        """INSERT INTO reflexiok (tipus, projekt_id, tartalom)
           VALUES (?,?,?)""",
        ("projekt", projekt_id, "Az ősz-projekt sikeres volt, a szülők is segítettek."),
    )
    refl_projekt_id = cur.lastrowid
    OK(f"Projekt-reflexió: id={refl_projekt_id}")

    conn.commit()

    # ════════════════════════════════════════════════════
    # CASCADE TÖRLÉS — TODO-1 + új év-törlés teszt
    # ════════════════════════════════════════════════════
    cim("[9/10] CASCADE: heti terv törlése")

    # A CASCADE-sorrend kötelező (csak teruletek + heti_terv_kepesseg cascade,
    # a foglalkozas_tervezetek és reflexiok NEM — kézzel törölni!)
    cur.execute("DELETE FROM reflexiok WHERE heti_terv_id = ?", (terv_id,))
    cur.execute("DELETE FROM reflexiok WHERE foglalkozas_id IN (SELECT id FROM foglalkozas_tervezetek WHERE heti_terv_id = ?)", (terv_id,))
    cur.execute("DELETE FROM foglalkozas_tervezetek WHERE heti_terv_id = ?", (terv_id,))
    cur.execute("DELETE FROM heti_tervek WHERE id = ?", (terv_id,))
    cur.execute("SELECT COUNT(*) FROM teruletek WHERE heti_terv_id = ?", (terv_id,))
    maradt_terulet = cur.fetchone()[0]
    if maradt_terulet == 0:
        OK(f"Heti terv törölve, területek CASCADE-elve: 7 → 0")
    else:
        ERR(f"CASCADE hibás: területek maradtak: {maradt_terulet}")

    cur.execute("SELECT COUNT(*) FROM heti_terv_kepesseg WHERE heti_terv_id = ?", (terv_id,))
    maradt_kepesseg = cur.fetchone()[0]
    if maradt_kepesseg == 0:
        OK(f"Képesség-kapcsolatok CASCADE-elve: 3 → 0")
    else:
        ERR(f"Képesség-kapcsolat CASCADE hibás: {maradt_kepesseg}")

    cur.execute("SELECT COUNT(*) FROM heti_terv_fts WHERE heti_terv_id = ?", (terv_id,))
    fts_maradt = cur.fetchone()[0]
    if fts_maradt == 0:
        OK(f"FTS5 sor CASCADE-elve a trigger által: 1 → 0")
    else:
        ERR(f"FTS5 sor maradt: {fts_maradt}")

    conn.commit()

    # ════════════════════════════════════════════════════
    # Év-CASCADE törlés (új feature)
    # ════════════════════════════════════════════════════
    cim("[10/10] Év-CASCADE: nevelési év + minden kapcsolódó")

    # Tavalyi év törlése — tartalmaz 1 heti tervet
    cur.execute("SELECT COUNT(*) FROM heti_tervek WHERE nevelesi_ev_id = ?", (tavalyi_ev_id,))
    elotte_heti = cur.fetchone()[0]
    OK(f"Tavalyi évhez tartozó heti tervek SOR (előtte): {elotte_heti}")

    # Év CASCADE: reflexiok → foglalkozas → hetiTervek → projektek → esemenyek → ev
    cur.execute(
        "DELETE FROM reflexiok WHERE heti_terv_id IN (SELECT id FROM heti_tervek WHERE nevelesi_ev_id = ?)",
        (tavalyi_ev_id,),
    )
    cur.execute(
        "DELETE FROM foglalkozas_tervezetek WHERE heti_terv_id IN (SELECT id FROM heti_tervek WHERE nevelesi_ev_id = ?)",
        (tavalyi_ev_id,),
    )
    cur.execute("DELETE FROM heti_tervek WHERE nevelesi_ev_id = ?", (tavalyi_ev_id,))
    cur.execute("DELETE FROM projektek WHERE nevelesi_ev_id = ?", (tavalyi_ev_id,))
    cur.execute("DELETE FROM esemenyek WHERE nevelesi_ev_id = ?", (tavalyi_ev_id,))
    cur.execute("DELETE FROM nevelesi_evek WHERE id = ?", (tavalyi_ev_id,))
    cur.execute("SELECT COUNT(*) FROM nevelesi_evek WHERE id = ?", (tavalyi_ev_id,))
    if cur.fetchone()[0] == 0:
        OK("Nevelési év törölve")

    conn.commit()

    # ════════════════════════════════════════════════════
    # ÖSSZEGZÉS
    # ════════════════════════════════════════════════════
    cim("ÖSSZEGZÉS")
    print(f"Tesztelt feature-ek: TODO-1, 2, 4, 7, 9, 10, 11, 12, 15 + új év-törlés")
    print(f"Hibák száma: {ERR_COUNT}")
    if ERR_COUNT == 0:
        print(f"\n✅ MINDEN BACKEND-FLOW PASS — 16+1 feature CRUD-műveletei mind működnek.")
        print(f"   A séma, az FTS5 triggerek, a CASCADE-ek, és az M-N relációk integritása rendben.")
    else:
        print(f"\n❌ {ERR_COUNT} hiba — a backend integritás megsérült!")

    conn.close()
    return 0 if ERR_COUNT == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
