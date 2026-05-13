import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { TeruletTipus, FoglalkozasTervezet, Kepesseg, HetiTerv as HetiTervRow } from '@shared/schema';
import type { HetiTervTeljes } from '../../../preload/index';
import { vanAdatvedelmiKockazat } from '../lib/utils';
import OtletekModal from './HetiTerv/OtletekModal';
import DokumentumNezet from './HetiTerv/DokumentumNezet';
import { SablonValaszto, SablonBanner } from './HetiTerv/SablonValaszto';
import OsszegzoSzekcio from './HetiTerv/OsszegzoSzekcio';
import TeruletSzekciok from './HetiTerv/TeruletSzekciok';
import MasolasModal from './HetiTerv/MasolasModal';
import KepessegMultiSelect from '../components/KepessegMultiSelect';
import { lookupEszkozok } from '../lib/eszkoz-kulcsszavak';
import {
  TERULET_DEFINICIO,
  type TeruletAllapot,
  type SablonMeta,
  type SablonOtletForras,
} from './HetiTerv/types';

// A 3 interface + TERULET_DEFINICIO + IRODALOM_TIPUSOK_TERULETHEZ átkerült
// a HetiTerv/ mappába (types.ts, TeruletSzekciok.tsx). TODO-6 refaktor.

const URES_TERULETEK: TeruletAllapot[] = TERULET_DEFINICIO.map((d) => ({
  tipus: d.tipus,
  tartalom: '',
  iskolaElokeszito: '',
}));

const ALAP_DIFFERENCIALAS =
  'tartalomban, módszerekben, segítségadás módjában és mennyiségében, az egyénre fordított idő mennyiségében';
const ALAP_MODSZEREK =
  'bemutatás, magyarázat, szemléltetés, cselekedtetés, gyakorlás, ellenőrzés, értékelés';

// Rövid pill-cimkék a tevékenységi formákhoz (foglalkozás-tervezet lista).
const TEVEKENYSEGI_FORMA_ROVID: Record<TeruletTipus, string> = {
  kulso_vilag: 'Külső világ',
  matematika: 'Matek',
  verseles_meseles: 'Mese',
  rajzolas_festes: 'Rajz',
  enek_zene: 'Ének',
  hallas_ritmus: 'Ritmus',
  mozgas: 'Mozgás',
};

export default function HetiTerv() {
  const params = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [terv, setTerv] = useState<Partial<HetiTervTeljes> | null>(null);
  const [teruletAllapotok, setTeruletAllapotok] = useState<TeruletAllapot[]>(URES_TERULETEK);
  const [mentes, setMentes] = useState<'idle' | 'mentes' | 'mentve' | 'hiba'>('idle');
  const [exportAllapot, setExportAllapot] = useState<'idle' | 'exportal' | 'kesz' | 'hiba'>('idle');
  const [sablonok, setSablonok] = useState<SablonMeta[]>([]);
  const [sablonHasznalva, setSablonHasznalva] = useState(false);
  // TODO-9: Másolás-modal (előző hétről másolás)
  const [masolasModalNyitva, setMasolasModalNyitva] = useState(false);
  // TODO-11: Képesség multi-select
  const [osszesKepesseg, setOsszesKepesseg] = useState<Kepesseg[]>([]);
  const [valasztottKepessegIds, setValasztottKepessegIds] = useState<Set<number>>(new Set());
  // TODO-15: "Tavaly ilyenkor" emlékeztető — az aktuális kezdoDatum-hoz kapcsolódó
  // korábbi évek heti tervei (±3 nap tűréshatár, max 5)
  const [tavalyiTervek, setTavalyiTervek] = useState<HetiTervRow[]>([]);
  const [autoSablonCim, setAutoSablonCim] = useState<string | null>(null);
  const [dokumentumNezet, setDokumentumNezet] = useState(false);
  // Ötletek panel: melyik terület számára nyitottuk meg, és az aktuális hónap sablonjai
  const [otletekPanelTipus, setOtletekPanelTipus] = useState<TeruletTipus | null>(null);
  const [honapiSablonok, setHonapiSablonok] = useState<SablonOtletForras[]>([]);
  const [valasztottOtletek, setValasztottOtletek] = useState<Set<string>>(new Set());
  // Korcsoport-specifikus 10 ötlet az adott téma + terület + korosztály metszéspontjából.
  // Az ötletbank `seed/otletek-bank-{korcsoport}.json` fájlokból töltődik.
  const [korSpecifikusOtletek, setKorSpecifikusOtletek] = useState<string[]>([]);
  // Aktuálisan használt sablon azonosítója (pl. "mikulas_v1") — az ötlet-böngészőnél
  // ennek prefixe alapján szűrünk: csak az ugyanezen témára vonatkozó V1+V2+legacy
  // sablonok bullettjei jelennek meg.
  const [aktualisSablonAzonosito, setAktualisSablonAzonosito] = useState<string | null>(null);
  // Téma-szűrés toggle: ha be van pipálva, csak az aktuális téma sablonjaiból gyűjt;
  // ha kikapcsolva, a hónap minden sablonjából (alapérték, így mindig van legalább 30-50 ötlet).
  const [csakAktualisTema, setCsakAktualisTema] = useState<boolean>(false);
  // Aktuális nevelési év korcsoportja (kiscsoport / középső / nagy / vegyes)
  // — ezt jelenítjük meg az ötlet-böngésző fejlécében.
  const [korcsoport, setKorcsoport] = useState<string>('vegyes');
  const [beallitas, setBeallitas] = useState<{
    pedagogusNeve?: string | null;
    ovodaNeve?: string | null;
    csoportNeve?: string | null;
    csoportTipus?: string | null;
  } | null>(null);
  // A heti tervhez tartozó foglalkozás-tervezetek (a jobb oldali kártyán listázva).
  const [foglalkozasok, setFoglalkozasok] = useState<FoglalkozasTervezet[]>([]);

  useEffect(() => {
    void window.api.beallitasokGet().then((b) => setBeallitas(b ?? null));
  }, []);

  // TODO-11: Képességek lekérése (egyszer az app életében cache-elhető)
  useEffect(() => {
    void window.api.kepessegekLista().then(setOsszesKepesseg);
  }, []);

  // TODO-11: Meglévő terv esetén a kapcsolt képességeket betöltjük
  useEffect(() => {
    if (!terv?.id) {
      setValasztottKepessegIds(new Set());
      return;
    }
    void window.api.hetiTervKepessegekLista(terv.id).then((arr) => {
      setValasztottKepessegIds(new Set(arr.map((k) => k.id)));
    });
  }, [terv?.id]);

  // TODO-15: "Tavaly ilyenkor" — a kezdoDatum hónap-napja alapján
  useEffect(() => {
    if (!terv?.kezdoDatum) {
      setTavalyiTervek([]);
      return;
    }
    void window.api
      .hetiTervekTavalyiEvbol(terv.kezdoDatum)
      .then((arr) => setTavalyiTervek(arr.filter((t) => t.id !== terv?.id)));
  }, [terv?.kezdoDatum, terv?.id]);

  // Foglalkozás-tervezetek betöltése a heti tervhez (ha már elmentett a terv).
  useEffect(() => {
    if (!terv?.id) {
      setFoglalkozasok([]);
      return;
    }
    void window.api.foglalkozasLista(terv.id).then(setFoglalkozasok);
  }, [terv?.id]);

  async function torolFoglalkozas(f: FoglalkozasTervezet) {
    const megerosit = window.confirm(
      `Biztosan törlöd a(z) "${f.tema || 'téma nélküli'}" foglalkozás-tervezetet?\n\nA kapcsolódó reflexiók is törlődnek.`,
    );
    if (!megerosit) return;
    try {
      await window.api.foglalkozasTorol(f.id);
      setFoglalkozasok((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) {
      window.alert(`Hiba a törlés során: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    void window.api.sablonokLista().then(setSablonok);
  }, []);

  useEffect(() => {
    async function load() {
      const aktiv = await window.api.nevelesiEvAktiv();
      if (aktiv?.korcsoport) {
        setKorcsoport(aktiv.korcsoport);
      }

      if (params.id) {
        const meglevo = await window.api.hetiTervTeljesBetolt(Number(params.id));
        if (meglevo) {
          setTerv(meglevo);

          // Sablon-azonosító visszakeresés a téma-cím alapján
          let sablonObj: SablonOtletForras | null = null;
          if (meglevo.tema) {
            try {
              const sablonokLista = await window.api.sablonokLista();
              const talalat = sablonokLista.find(
                (s) => s.cim?.trim().toLowerCase() === meglevo.tema!.trim().toLowerCase(),
              );
              if (talalat) {
                setAktualisSablonAzonosito(talalat.azonosito);
                // Betöltjük a teljes sablont fallback-célokra (üres iskolaElokeszito kitöltése)
                const sablonTeljes = await window.api.sablonBetolt(talalat.azonosito);
                if (sablonTeljes) {
                  sablonObj = sablonTeljes as SablonOtletForras;
                }
              }
            } catch {
              // figyelmen kívül hagyhatjuk
            }
          }

          setTeruletAllapotok(
            TERULET_DEFINICIO.map((d) => {
              const m = meglevo.teruletek.find((t) => t.tipus === d.tipus);
              let iskolaElokeszito = m?.iskolaElokeszito ?? '';
              // FALLBACK: ha a mentett iskolaElokeszito üres, megpróbáljuk a sablonból feltölteni
              // (akkor lépünk be ide, ha pl. korábbi sablon-verzióval generált tervet nézünk meg)
              if (!iskolaElokeszito.trim() && sablonObj) {
                const fromSablon = sablonObj.iskolaElokeszitoTeruletek?.[d.tipus];
                if (fromSablon) iskolaElokeszito = fromSablon;
                else if (d.tipus === 'kulso_vilag' && sablonObj.iskolaElokeszito) {
                  iskolaElokeszito = sablonObj.iskolaElokeszito;
                }
              }
              return {
                tipus: d.tipus,
                tartalom: m?.tartalom ?? '',
                iskolaElokeszito,
              };
            }),
          );
          return;
        }
      }

      // Új terv
      const datum = searchParams.get('datum') ?? new Date().toISOString().split('T')[0];
      const zaroNap = new Date(datum);
      zaroNap.setDate(zaroNap.getDate() + 4);

      setTerv({
        nevelesiEvId: aktiv?.id ?? null,
        kezdoDatum: datum,
        zaroDatum: zaroNap.toISOString().split('T')[0],
        tema: '',
        cel: '',
        feladat: '',
        differencialas: ALAP_DIFFERENCIALAS,
        modszerek: ALAP_MODSZEREK,
      });
      setTeruletAllapotok(URES_TERULETEK);
    }
    void load();
  }, [params.id, searchParams]);

  const ment = useCallback(async () => {
    if (!terv) return;
    setMentes('mentes');
    try {
      const teruletekData = teruletAllapotok
        .filter((t) => t.tartalom.trim() || t.iskolaElokeszito.trim())
        .map((t, i) => ({
          tipus: t.tipus,
          tartalom: t.tartalom,
          iskolaElokeszito: t.iskolaElokeszito,
          sorrend: i,
        }));

      const result = await window.api.hetiTervTeljesMent({
        ...(terv as HetiTervTeljes),
        teruletek: teruletekData,
        kezdoDatum: terv.kezdoDatum!,
        zaroDatum: terv.zaroDatum!,
      });
      setTerv(result);

      // TODO-11: Képesség M-N kapcsolatok mentése (replace-all)
      if (result.id) {
        try {
          await window.api.hetiTervKepessegekMent({
            hetiTervId: result.id,
            kepessegIds: Array.from(valasztottKepessegIds),
          });
        } catch (err) {
          console.error('Képesség-kapcsolatok mentése sikertelen:', err);
          // Nem kritikus — a fő mentés sikerült, csak figyelmeztetünk
        }
      }

      setMentes('mentve');
      if (!params.id) {
        navigate(`/heti-terv/${result.id}`, { replace: true });
      }
      setTimeout(() => setMentes('idle'), 1500);
    } catch (err) {
      console.error('Mentési hiba:', err);
      setMentes('hiba');
      setTimeout(() => setMentes('idle'), 3000);
    }
  }, [terv, teruletAllapotok, valasztottKepessegIds, params.id, navigate]);

  const torol = useCallback(async () => {
    if (!terv?.id) return;
    const cim = terv.tema && terv.tema.trim() ? terv.tema : 'Heti terv';
    const megerosit = window.confirm(
      `Biztosan törlöd a(z) "${cim}" heti tervet?\n\n` +
        'A hozzá tartozó területek tartalma is törlődik. ' +
        'A reflexiók megmaradnak, de gazdátlanná válnak.\n\n' +
        'Ez a művelet visszavonhatatlan.',
    );
    if (!megerosit) return;
    try {
      await window.api.hetiTervTorol(terv.id);
      navigate('/');
    } catch (err) {
      console.error('Heti terv törlése sikertelen:', err);
      window.alert('Sikertelen volt a törlés. Próbáld újra később.');
    }
  }, [terv, navigate]);

  const exportalas = useCallback(async () => {
    if (!terv?.id) {
      // Először mentsünk
      await ment();
      return;
    }
    setExportAllapot('exportal');
    try {
      const eredmeny = await window.api.exportHetiTervDocx(terv.id);
      if (eredmeny.siker) {
        setExportAllapot('kesz');
        setTimeout(() => setExportAllapot('idle'), 2500);
      } else if (eredmeny.hiba === 'megszakítva') {
        setExportAllapot('idle');
      } else {
        console.error('Export hiba:', eredmeny.hiba);
        setExportAllapot('hiba');
        setTimeout(() => setExportAllapot('idle'), 3000);
      }
    } catch (err) {
      console.error('Export hiba:', err);
      setExportAllapot('hiba');
      setTimeout(() => setExportAllapot('idle'), 3000);
    }
  }, [terv?.id, ment]);

  /**
   * Megnyit egy ötlet-böngésző panelt egy adott területre.
   * Lekérdezi az aktuális hónaphoz tartozó ÖSSZES sablon (V1+V2+legacy) tartalmait,
   * és ezekből kibont a területhez tartozó bullet-pontokat.
   *
   * Ha az adott hónapra nincs sablon (pl. júl-aug nyári szünet, vagy érvénytelen dátum),
   * MINDEN sablont visszaad — így mindig van ötletbörzéje a felhasználónak.
   */
  const nyitOtletekPanel = useCallback(
    async (tipus: TeruletTipus) => {
      const datumStr = terv?.kezdoDatum ?? new Date().toISOString().split('T')[0];
      const datumObj = new Date(datumStr);
      const honap = !Number.isNaN(datumObj.getTime())
        ? datumObj.getMonth() + 1
        : new Date().getMonth() + 1;

      console.log(`[OtletekPanel] terv.kezdoDatum=${terv?.kezdoDatum}, honap=${honap}`);

      // 1. KOR-SPECIFIKUS ÖTLET-BANK (10 bullet a kiválasztott korcsoportra/témára/területre)
      const temaPrefix = aktualisSablonAzonosito
        ? aktualisSablonAzonosito.replace(/_v[12]$/, '')
        : null;
      let korspecifikus: string[] = [];
      if (temaPrefix) {
        korspecifikus = await window.api.otletekBank(korcsoport, temaPrefix, tipus);
        console.log(`[OtletekPanel] otletekBank(${korcsoport}, ${temaPrefix}, ${tipus}):`, korspecifikus.length);
      }
      setKorSpecifikusOtletek(korspecifikus);

      // 2. SABLON-BULLET-EK fallback ha még kell — a hónap minden sablonjából
      let sablonokForras = await window.api.sablonokHonapra(honap);
      console.log(`[OtletekPanel] sablonokHonapra(${honap}):`, sablonokForras.length);

      if (sablonokForras.length === 0) {
        const aktualisHonap = new Date().getMonth() + 1;
        if (aktualisHonap !== honap) {
          sablonokForras = await window.api.sablonokHonapra(aktualisHonap);
        }
      }

      if (sablonokForras.length === 0) {
        const minden = await Promise.all(
          [9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((h) => window.api.sablonokHonapra(h)),
        );
        sablonokForras = minden.flat();
      }

      if (sablonokForras.length === 0) {
        const meta = await window.api.sablonokLista();
        const teljes = await Promise.all(meta.map((m) => window.api.sablonBetolt(m.azonosito)));
        sablonokForras = teljes.filter((s): s is NonNullable<typeof s> => s !== null);
      }

      setHonapiSablonok(sablonokForras as SablonOtletForras[]);
      setOtletekPanelTipus(tipus);
      setValasztottOtletek(new Set());
    },
    [terv?.kezdoDatum, aktualisSablonAzonosito, korcsoport],
  );

  /**
   * A kiválasztott ötleteket hozzáadja a megfelelő mezőhöz (tartalom vagy iskolaElokeszito).
   */
  const otletekHozzaadasa = useCallback(() => {
    if (!otletekPanelTipus || valasztottOtletek.size === 0) {
      setOtletekPanelTipus(null);
      return;
    }
    const bekerulendok = Array.from(valasztottOtletek);
    setTeruletAllapotok((prev) =>
      prev.map((t) => {
        if (t.tipus !== otletekPanelTipus) return t;
        const meglevoSorok = t.tartalom
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);
        const ujak = bekerulendok.filter((b) => !meglevoSorok.includes(b));
        const osszes = [...meglevoSorok, ...ujak];
        return { ...t, tartalom: osszes.join('\n') };
      }),
    );
    setOtletekPanelTipus(null);
    setValasztottOtletek(new Set());
  }, [otletekPanelTipus, valasztottOtletek]);

  // TODO-13: Eszközlista auto-aggregálás — most 100+ kulcsszó 4 kategóriában
  // (lib/eszkoz-kulcsszavak.ts). A találatok kategória-sorrendben jönnek.
  const autoEszkozok = useMemo(() => {
    const osszeSzoveg = teruletAllapotok
      .map((t) => `${t.tartalom} ${t.iskolaElokeszito}`)
      .join(' ');
    return lookupEszkozok(osszeSzoveg);
  }, [teruletAllapotok]);

  const sablonAlkalmazasa = async (azonosito: string) => {
    if (!azonosito) return;

    // Meglévő tervnél (params.id van) konfirmációt kérünk, ha bármi tartalom
    // már létezik — különben szótlanul felülírnánk a pedagógus munkáját.
    if (params.id) {
      const vanTartalom =
        Boolean(terv?.cel?.trim()) ||
        Boolean(terv?.feladat?.trim()) ||
        Boolean(terv?.kepessegfejlesztes?.trim()) ||
        Boolean(terv?.eszkozok?.trim()) ||
        teruletAllapotok.some(
          (t) => t.tartalom.trim() !== '' || t.iskolaElokeszito.trim() !== '',
        );
      if (vanTartalom) {
        const ok = window.confirm(
          'Felülírja a meglévő heti terv tartalmát a választott sablonnal?\n\n' +
            'Minden terület (Külső világ, Verselés-mesélés, Rajz, Ének, Mozgás stb.) ' +
            'tartalma + a Cél/Feladat/Eszközök/Képességfejlesztés mezők ' +
            'a sablon tartalmával lesznek felülírva.\n\n' +
            'A változás csak akkor mentődik, ha rákattintasz a Mentés gombra.',
        );
        if (!ok) return;
      }
    }

    const sablon = await window.api.sablonBetolt(azonosito);
    if (!sablon) return;

    // TODO-20: Téma-duplikáció figyelmeztetés
    // Ha a sablonnal azonos (vagy hasonló) című heti terv már létezik az aktuális
    // nevelési évben, jelezzük + alternatív V1/V2 sablon-ajánlást teszünk.
    try {
      const duplikacio = await window.api.hetiTervekTemaDuplikacio({
        cim: sablon.cim,
        nevelesiEvId: terv?.nevelesiEvId ?? null,
        kivetelId: terv?.id ?? null,
      });
      if (duplikacio.length > 0) {
        // V1/V2 alternatív sablon-ajánlás:
        // ha az azonosító "_v1"-re végződik, ajánljuk a "_v2"-t, és fordítva
        let alternativ: string | null = null;
        const m = azonosito.match(/^(.+)_v([12])$/);
        if (m) {
          const masikVerzio = m[2] === '1' ? '2' : '1';
          const alternativAzonosito = `${m[1]}_v${masikVerzio}`;
          const lehet = sablonok.find((s) => s.azonosito === alternativAzonosito);
          if (lehet) alternativ = `${lehet.cim} (V${masikVerzio})`;
        }

        const datumok = duplikacio.map((t) => t.kezdoDatum).join(', ');
        let uzenet =
          `⚠️ Hasonló témájú heti terv már létezik a nevelési évben:\n\n` +
          duplikacio.map((t) => `• "${t.tema}" (${t.kezdoDatum} — ${t.zaroDatum})`).join('\n') +
          `\n\n`;
        if (alternativ) {
          uzenet += `💡 Tipp: Próbáld az alternatív sablon-verziót: "${alternativ}".\n\n`;
        }
        uzenet += 'Folytatod a kiválasztott sablon alkalmazását?';
        void datumok;
        if (!window.confirm(uzenet)) return;
      }
    } catch (err) {
      console.warn('Téma-duplikáció ellenőrzés sikertelen:', err);
      // Nem kritikus — folytatjuk
    }

    setTerv((prev) => ({
      ...prev,
      tema: sablon.cim,
      cel: sablon.cel,
      feladat: sablon.feladat,
      kepessegfejlesztes: sablon.kepessegfejlesztes,
      eszkozok: sablon.eszkozok,
    }));

    setTeruletAllapotok((prev) =>
      prev.map((t) => {
        // Új formátum: per-terület iskolaElokeszito
        const perAreaIE = sablon.iskolaElokeszitoTeruletek?.[t.tipus];
        // Legacy fallback: csak kulso_vilag-hoz
        const legacyIE = t.tipus === 'kulso_vilag' ? sablon.iskolaElokeszito : '';
        return {
          tipus: t.tipus,
          tartalom: sablon.teruletek[t.tipus] ?? '',
          iskolaElokeszito: perAreaIE ?? legacyIE,
        };
      }),
    );

    setSablonHasznalva(true);
    setAktualisSablonAzonosito(azonosito);
  };

  if (!terv) return <div className="p-8 text-center text-ink/50">Betöltés...</div>;

  const update = (field: keyof typeof terv, value: string) =>
    setTerv((prev) => ({ ...prev, [field]: value }));

  // Dokumentum nézet — teljes, formázott, Word-szerű layout
  if (dokumentumNezet) {
    return (
      <DokumentumNezet
        terv={terv as HetiTervTeljes}
        teruletAllapotok={teruletAllapotok}
        beallitas={beallitas}
        onBack={() => setDokumentumNezet(false)}
        onExport={exportalas}
        exportAllapot={exportAllapot}
      />
    );
  }

  const updateTerulet = (tipus: TeruletTipus, mezo: 'tartalom' | 'iskolaElokeszito', ertek: string) => {
    setTeruletAllapotok((prev) =>
      prev.map((t) => (t.tipus === tipus ? { ...t, [mezo]: ertek } : t)),
    );
  };

  // getTerulet a TeruletSzekciok komponensbe került (TODO-6 Etap C)

  const adatvedelmiTalalat =
    !!terv && (
      (terv.cel && vanAdatvedelmiKockazat(terv.cel)) ||
      (terv.feladat && vanAdatvedelmiKockazat(terv.feladat)) ||
      teruletAllapotok.some(
        (t) => vanAdatvedelmiKockazat(t.tartalom) || vanAdatvedelmiKockazat(t.iskolaElokeszito),
      )
    );

  return (
    <>
      {/* Ötletek modális panel */}
      {otletekPanelTipus && (
        <OtletekModal
          tipus={otletekPanelTipus}
          tipusCim={
            TERULET_DEFINICIO.find((d) => d.tipus === otletekPanelTipus)?.cim ?? ''
          }
          forrasok={honapiSablonok}
          korSpecifikusOtletek={korSpecifikusOtletek}
          aktualisSablonAzonosito={aktualisSablonAzonosito}
          csakAktualisTema={csakAktualisTema}
          setCsakAktualisTema={setCsakAktualisTema}
          korcsoport={korcsoport}
          valasztottak={valasztottOtletek}
          setValasztottak={setValasztottOtletek}
          onBezar={() => setOtletekPanelTipus(null)}
          onHozzaadas={otletekHozzaadasa}
        />
      )}
      {masolasModalNyitva && (
        <MasolasModal
          ujKezdoDatum={terv.kezdoDatum ?? ''}
          ujZaroDatum={terv.zaroDatum ?? ''}
          ujNevelesiEvId={terv.nevelesiEvId ?? null}
          onBezar={() => setMasolasModalNyitva(false)}
          onMasolva={(ujId) => {
            setMasolasModalNyitva(false);
            navigate(`/heti-terv/${ujId}`);
          }}
        />
      )}
    <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-12 gap-6">
      <main className="col-span-12 lg:col-span-9">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-sage-700 mb-1">
              Heti terv • {terv.kezdoDatum} — {terv.zaroDatum}
            </div>
            <input
              type="text"
              value={terv.tema ?? ''}
              onChange={(e) => update('tema', e.target.value)}
              placeholder="A hét témája (pl. Olvasni jó, Húsvéti hét…)"
              className="heading-serif text-3xl font-medium w-full bg-transparent outline-none border-b border-transparent focus:border-sage-300 transition"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setDokumentumNezet(true)}
              className="btn-secondary text-sm whitespace-nowrap"
              title="Megnézed a tervet teljes, formázott dokumentumként"
            >
              📄 Dokumentum nézet
            </button>
            <Link to="/naptar" className="text-sm text-ink/60 hover:text-ink whitespace-nowrap">
              ← Naptár
            </Link>
          </div>
        </div>

        <SablonValaszto
          sablonok={sablonok}
          sablonHasznalva={sablonHasznalva}
          paramsId={params.id}
          aktualisSablonAzonosito={aktualisSablonAzonosito}
          onSablonValasztas={sablonAlkalmazasa}
          onUres={() => setSablonHasznalva(true)}
        />

        {/* TODO-9: Új tervezet módban "Másolás előző hétről" gomb */}
        {!params.id && !sablonHasznalva && (
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={() => setMasolasModalNyitva(true)}
              className="text-xs text-mauve-600 hover:text-mauve-700 hover:underline"
              type="button"
              title="Egy korábbi hét teljes tartalmát átveszi az új tervezetbe"
            >
              📋 Másolás előző hétről…
            </button>
          </div>
        )}

        {sablonHasznalva && !params.id && (
          <SablonBanner
            autoSablonCim={autoSablonCim}
            onUresTervezet={() => {
              setSablonHasznalva(false);
              setAutoSablonCim(null);
              setAktualisSablonAzonosito(null);
              setTerv((prev) => ({
                ...prev,
                tema: '',
                cel: '',
                feladat: '',
                kepessegfejlesztes: '',
                eszkozok: '',
              }));
              setTeruletAllapotok(URES_TERULETEK);
            }}
          />
        )}

        <TeruletSzekciok
          definicio={TERULET_DEFINICIO}
          teruletAllapotok={teruletAllapotok}
          onUpdate={updateTerulet}
          onNyitOtletekPanel={nyitOtletekPanel}
          korcsoport={korcsoport}
        />

        <OsszegzoSzekcio terv={terv} onUpdate={update} autoEszkozok={autoEszkozok} />

        {/* TODO-11: Képesség multi-select (collapsible) */}
        <section className="mt-6">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-sage-700 hover:text-sage-800">
              <span className="inline-block group-open:rotate-90 transition-transform">▸</span>
              <span>🏷 Fejlesztett képességek</span>
              {valasztottKepessegIds.size > 0 && (
                <span className="text-xs font-normal text-ink/50">
                  ({valasztottKepessegIds.size} kiválasztva)
                </span>
              )}
            </summary>
            <div className="mt-3 p-4 rounded-lg border border-sage-100 bg-sage-50/30">
              <KepessegMultiSelect
                osszesKepesseg={osszesKepesseg}
                valasztottIds={valasztottKepessegIds}
                onValtozas={setValasztottKepessegIds}
              />
            </div>
          </details>
        </section>

        {/* Action bar */}
        <div className="mt-8 pt-4 border-t border-sage-100 flex items-center gap-2 flex-wrap">
          <button onClick={ment} className="btn-primary">
            {mentes === 'mentes'
              ? 'Mentés…'
              : mentes === 'mentve'
                ? '✓ Mentve'
                : mentes === 'hiba'
                  ? 'Mentési hiba'
                  : 'Mentés'}
          </button>
          <button onClick={exportalas} className="btn-secondary" disabled={exportAllapot === 'exportal'}>
            {exportAllapot === 'exportal'
              ? 'Exportálás…'
              : exportAllapot === 'kesz'
                ? '✓ DOCX elmentve'
                : exportAllapot === 'hiba'
                  ? 'Export-hiba'
                  : 'Letöltés .docx-ként (KRÉTA)'}
          </button>
          {terv.id && (
            <Link
              to={`/heti-terv/${terv.id}/reflexio`}
              className="btn-secondary"
            >
              Heti reflexió írása →
            </Link>
          )}
          {terv.id && (
            <button
              onClick={torol}
              className="btn-danger-outline ml-auto"
              type="button"
              title="Heti terv törlése"
            >
              🗑 Heti terv törlése
            </button>
          )}
        </div>
      </main>

      {/* Jobb oldali panel */}
      <aside className="col-span-12 lg:col-span-3 space-y-4">
        <div className="card">
          <div className="field-label mb-2">Tippek</div>
          <ul className="text-xs space-y-2 text-ink/70">
            <li>• Gépelj természetes nyelven a területekbe</li>
            <li>• Az eszközöket gyűjti automatikusan a szövegekből</li>
            <li>• Mentés után a DOCX letöltés a KRÉTA-feltöltésre kész</li>
          </ul>
        </div>

        {terv.id && (
          <div className="card">
            <div className="field-label mb-2">
              Foglalkozás-tervezetek{foglalkozasok.length > 0 ? ` (${foglalkozasok.length})` : ''}
            </div>
            {foglalkozasok.length > 0 && (
              <ul className="mb-3 space-y-1">
                {foglalkozasok.map((f) => (
                  <li key={f.id} className="flex items-start gap-1 group/item">
                    <Link
                      to={`/heti-terv/${terv.id}/foglalkozas/${f.id}`}
                      className="flex-1 min-w-0 block px-2 py-1.5 rounded text-sm hover:bg-sage-50 group"
                    >
                      <div className="font-medium text-ink/90 group-hover:text-sage-700 truncate">
                        {f.tema || '(téma nélkül)'}
                      </div>
                      <div className="text-xs text-ink/50 mt-0.5 flex items-center gap-2">
                        {f.idopont && <span>{f.idopont}</span>}
                        {f.tevekenysegiForma && (
                          <span className="pill text-[10px]">
                            {TEVEKENYSEGI_FORMA_ROVID[f.tevekenysegiForma] ?? f.tevekenysegiForma}
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => void torolFoglalkozas(f)}
                      className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm opacity-0 group-hover/item:opacity-100 transition"
                      title="Foglalkozás törlése"
                    >
                      🗑
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to={`/heti-terv/${terv.id}/foglalkozas/uj`}
              className="text-sm text-sage-700 hover:underline inline-block"
            >
              + Új foglalkozás-tervezet
            </Link>
          </div>
        )}

        {/* TODO-15: "Tavaly ilyenkor" emlékeztető */}
        {tavalyiTervek.length > 0 && (
          <div className="card border-l-4 border-l-mauve-300">
            <div className="field-label mb-2 flex items-center gap-1">
              <span>💭 Tavaly ilyenkor</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-ink/40">
                ({tavalyiTervek.length})
              </span>
            </div>
            <div className="text-xs text-ink/60 mb-2 italic leading-snug">
              Korábbi évek hasonló hetére visszatekintés (±3 nap):
            </div>
            <ul className="space-y-1">
              {tavalyiTervek.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/heti-terv/${t.id}`}
                    className="block px-2 py-1.5 rounded text-sm hover:bg-mauve-50 group"
                  >
                    <div className="font-medium text-ink/90 group-hover:text-mauve-700 truncate">
                      {t.tema || '(téma nélkül)'}
                    </div>
                    <div className="text-[10px] text-ink/50 mt-0.5">
                      {t.kezdoDatum} — {t.zaroDatum}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {adatvedelmiTalalat ? (
          <div className="p-3 rounded-lg border border-mauve-200 bg-mauve-100/40">
            <div className="text-xs font-semibold uppercase tracking-wider text-mauve-600 mb-1">
              ⚠ Adatvédelmi tipp
            </div>
            <div className="text-xs text-ink/80">
              A szövegben olyan kifejezés szerepel, ami közvetlenül azonosíthat egy gyermeket
              (pl. SNI, „egy kisfiú/kislány"). Érdemes általánosabban fogalmazni
              („több gyermeknél", „a csoport egy részénél").
            </div>
          </div>
        ) : null}
      </aside>
    </div>
    </>
  );
}


// Az OtletekModal és DokumentumNezet komponensek kiemelve:
//   pages/HetiTerv/OtletekModal.tsx
//   pages/HetiTerv/DokumentumNezet.tsx
// TODO-6 Etap A refaktor — 2026-05-13.
