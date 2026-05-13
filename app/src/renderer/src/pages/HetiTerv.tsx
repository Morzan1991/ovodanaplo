import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { TeruletTipus, FoglalkozasTervezet, IrodalomTipus } from '@shared/schema';
import type { HetiTervTeljes } from '../../../preload/index';
import { vanAdatvedelmiKockazat } from '../lib/utils';
import IrodalomAutoComplete from '../components/IrodalomAutoComplete';

// Mely irodalom-típusok kapcsolódnak az adott területhez (autocomplete-szűréshez).
const IRODALOM_TIPUSOK_TERULETHEZ: Partial<Record<TeruletTipus, IrodalomTipus[]>> = {
  verseles_meseles: ['vers', 'mese', 'mondoka', 'nepmese', 'regeny', 'verseskotet', 'altato', 'nepmonda', 'talalos_kerdes'],
  enek_zene: ['dal', 'zenehallgatas', 'koreplay'],
};

const TERULET_DEFINICIO: Array<{
  tipus: TeruletTipus;
  cim: string;
  placeholder: string;
  szint: 'fo' | 'al';
  szuloTipus?: TeruletTipus;
}> = [
  {
    tipus: 'kulso_vilag',
    cim: 'Külső világ tevékeny megismerésére nevelés',
    placeholder: 'Mit fognak megtapasztalni, megismerni a gyerekek a külső világból?',
    szint: 'fo',
  },
  {
    tipus: 'matematika',
    cim: 'Matematikai tartalom',
    placeholder: 'Számlálás, halmazok, formák, sorrendezés…',
    szint: 'al',
    szuloTipus: 'kulso_vilag',
  },
  {
    tipus: 'verseles_meseles',
    cim: 'Verselés, mesélés',
    placeholder: 'Mesék és mondókák, versek a hétre',
    szint: 'fo',
  },
  {
    tipus: 'rajzolas_festes',
    cim: 'Rajzolás, festés, mintázás, építés, képalakítás, kézimunka',
    placeholder: 'Alkotó tevékenységek',
    szint: 'fo',
  },
  {
    tipus: 'enek_zene',
    cim: 'Ének, zene, népi játék, tánc',
    placeholder: 'Énekek, körjátékok, zenehallgatás',
    szint: 'fo',
  },
  {
    tipus: 'hallas_ritmus',
    cim: 'Hallás és ritmusérzék fejlesztés',
    placeholder: 'Ritmusjáték, visszatapsolás, fogalompárok…',
    szint: 'al',
    szuloTipus: 'enek_zene',
  },
  {
    tipus: 'mozgas',
    cim: 'Mindennapos mozgás',
    placeholder: 'Tornatermi és udvari mozgásos tevékenységek',
    szint: 'fo',
  },
];

interface TeruletAllapot {
  tipus: TeruletTipus;
  tartalom: string;
  iskolaElokeszito: string;
}

interface SablonMeta {
  azonosito: string;
  cim: string;
  kategoria: string;
  javasoltHonap: number | null;
  javasoltSorrend: number | null;
  kapcsoloUnnep: string | null;
  verzio: number | null;
  tema: string;
}

// Az "Ötletek böngészése" panel forrás-objektum típusa.
interface SablonOtletForras {
  azonosito: string;
  cim: string;
  verzio?: number | null;
  teruletek: Record<string, string>;
  iskolaElokeszitoTeruletek?: Record<string, string>;
  iskolaElokeszito?: string;
}

const HONAPOK = [
  '', 'Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec',
];

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

  // Foglalkozás-tervezetek betöltése a heti tervhez (ha már elmentett a terv).
  useEffect(() => {
    if (!terv?.id) {
      setFoglalkozasok([]);
      return;
    }
    void window.api.foglalkozasLista(terv.id).then(setFoglalkozasok);
  }, [terv?.id]);

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
  }, [terv, teruletAllapotok, params.id, navigate]);

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

  // Eszközlista auto-aggregálás a terület-szövegekből (egyszerű kulcsszó alapú gyűjtés)
  const autoEszkozok = useMemo(() => {
    const KULCSSZAVAK = [
      'olló', 'ragasztó', 'papír', 'színes ceruza', 'színes lap', 'festék', 'ecset', 'gyurma',
      'karton', 'kartonlap', 'fonal', 'szalag', 'könyv', 'mesekönyv', 'képek', 'fotó', 'színezők',
      'nyomda', 'lyukasztó', 'lamináló', 'cikk-cakk olló', 'babzsák', 'labda', 'karika', 'zsámoly',
      'alagút', 'kötél', 'hangszóró', 'laptop', 'csörgő', 'dob', 'triangulum', 'hangszer',
    ];
    const osszeSzoveg = teruletAllapotok
      .map((t) => `${t.tartalom} ${t.iskolaElokeszito}`)
      .join(' ')
      .toLowerCase();
    const talalat = KULCSSZAVAK.filter((k) => osszeSzoveg.includes(k.toLowerCase()));
    return talalat;
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

  const getTerulet = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus) ?? { tipus, tartalom: '', iskolaElokeszito: '' };

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

        {/* Sablon-választó:
            - Új tervnél: csak addig, amíg nem alkalmazott sablont (sablonHasznalva flag).
            - Meglévő tervnél: MINDIG látszik, hogy bármikor lehessen másik sablonra váltani
              (konfirmációval, ha van tartalom — lásd `sablonAlkalmazasa`). */}
        {sablonok.length > 0 && (params.id || !sablonHasznalva) && (
          <div className="mb-6 p-4 rounded-lg border border-mauve-200 bg-mauve-100/30">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-sm">
                <div className="font-semibold text-mauve-700">
                  {params.id ? '🔄 Sablon alkalmazása' : '✨ Sablonból indulnál?'}
                </div>
                <div className="text-xs text-ink/70 mt-0.5">
                  {params.id
                    ? 'Felülírhatod a meglévő tartalmat egy sablonnal — konfirmációt kérünk.'
                    : 'Választhatsz egy előre elkészített témából — a saját doksijaid + 15 magyar ünnep alapján.'}
                </div>
              </div>
              <select
                value={aktualisSablonAzonosito ?? ''}
                onChange={(e) => sablonAlkalmazasa(e.target.value)}
                className="ml-auto border border-mauve-300 rounded px-3 py-2 text-sm bg-white min-w-[280px]"
              >
                <option value="" disabled>
                  — Válassz sablont —
                </option>
                {/* Iskolai év sorrendben: szept-jún */}
                {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].flatMap((h) => {
                  const csoport = sablonok
                    .filter((s) => s.javasoltHonap === h)
                    .sort((a, b) => {
                      const sa = a.javasoltSorrend ?? 99;
                      const sb = b.javasoltSorrend ?? 99;
                      if (sa !== sb) return sa - sb;
                      const va = a.verzio ?? 0;
                      const vb = b.verzio ?? 0;
                      return va - vb;
                    });
                  if (csoport.length === 0) return [];
                  return [
                    <optgroup key={h} label={HONAPOK[h]}>
                      {csoport.map((s) => {
                        const verzioJel = s.verzio === 1 ? ' (V1)' : s.verzio === 2 ? ' (V2)' : '';
                        return (
                          <option key={s.azonosito} value={s.azonosito}>
                            {s.cim}{verzioJel}
                          </option>
                        );
                      })}
                    </optgroup>,
                  ];
                })}
              </select>
              {!params.id && (
                <button
                  onClick={() => setSablonHasznalva(true)}
                  className="text-xs text-ink/50 hover:text-ink hover:underline"
                >
                  Üres tervezet ⊗
                </button>
              )}
            </div>
          </div>
        )}

        {sablonHasznalva && !params.id && (
          <div className="mb-4 p-3 rounded-lg border border-sage-200 bg-sage-50 text-sm text-sage-700 flex items-center justify-between">
            <span>
              {autoSablonCim ? (
                <>
                  ✨ <strong>„{autoSablonCim}"</strong> sablon automatikusan betöltve a dátum alapján — szerkeszd, majd Mentés gomb.
                </>
              ) : (
                <>✓ Sablon alkalmazva — szerkeszd kedved szerint, majd nyomd meg a Mentés gombot</>
              )}
            </span>
            <button
              onClick={() => {
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
              className="text-ink/50 hover:text-ink hover:underline whitespace-nowrap ml-3"
            >
              Üres tervezet ⊗
            </button>
          </div>
        )}

        <div className="space-y-4">
          {TERULET_DEFINICIO.filter((d) => d.szint === 'fo').map((d) => (
            <section key={d.tipus} className="terulet-szekcio">
              <div className="flex items-center justify-between mb-2">
                <h2 className="heading-serif text-lg font-medium">{d.cim}</h2>
                <button
                  onClick={() => nyitOtletekPanel(d.tipus)}
                  className="text-xs px-2 py-1 rounded border border-sage-300 text-sage-700 hover:bg-sage-100 transition whitespace-nowrap"
                  title="Tallózz a kapcsolódó sablonok között, és válassz ötleteket"
                >
                  💡 Ötletek (10+)
                </button>
              </div>
              {IRODALOM_TIPUSOK_TERULETHEZ[d.tipus] ? (
                <IrodalomAutoComplete
                  value={getTerulet(d.tipus).tartalom}
                  onChange={(v) => updateTerulet(d.tipus, 'tartalom', v)}
                  rows={4}
                  placeholder={d.placeholder}
                  className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
                  tipusok={IRODALOM_TIPUSOK_TERULETHEZ[d.tipus]!}
                  korcsoport={korcsoport}
                />
              ) : (
                <textarea
                  value={getTerulet(d.tipus).tartalom}
                  onChange={(e) => updateTerulet(d.tipus, 'tartalom', e.target.value)}
                  rows={4}
                  placeholder={d.placeholder}
                  className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
                />
              )}

              {/* Al-szekciók */}
              {TERULET_DEFINICIO.filter((al) => al.szuloTipus === d.tipus).map((al) => (
                <div key={al.tipus} className="mt-3 pl-3 border-l-2 border-sage-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="field-label">{al.cim}</h3>
                    <button
                      onClick={() => nyitOtletekPanel(al.tipus)}
                      className="text-[10px] px-2 py-0.5 rounded border border-sage-200 text-sage-700 hover:bg-sage-50"
                    >
                      💡 Ötletek
                    </button>
                  </div>
                  <textarea
                    value={getTerulet(al.tipus).tartalom}
                    onChange={(e) => updateTerulet(al.tipus, 'tartalom', e.target.value)}
                    rows={2}
                    placeholder={al.placeholder}
                    className="w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition"
                  />
                </div>
              ))}

              <details className="mt-2 group">
                <summary className="text-xs font-semibold text-sage-700 cursor-pointer hover:underline list-none">
                  <span className="inline-block group-open:rotate-90 transition-transform">▸</span>{' '}
                  Iskola előkészítő tevékenység
                </summary>
                <textarea
                  value={getTerulet(d.tipus).iskolaElokeszito}
                  onChange={(e) => updateTerulet(d.tipus, 'iskolaElokeszito', e.target.value)}
                  rows={3}
                  placeholder="A területhez tartozó iskola-előkészítő képességek, soronként egy…"
                  className="mt-1 w-full text-sm leading-relaxed bg-transparent outline-none resize-vertical focus:bg-sage-50/40 rounded p-2 transition border border-sage-100"
                />
              </details>
            </section>
          ))}
        </div>

        {/* Lezáró rész */}
        <section className="mt-8 pt-6 border-t border-sage-100">
          <h2 className="heading-serif text-lg font-medium mb-3">A heti terv összegzése</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="field-label block mb-1">Cél</label>
              <textarea
                value={terv.cel ?? ''}
                onChange={(e) => update('cel', e.target.value)}
                rows={3}
                className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
                placeholder="Mit szeretnél elérni ezen a héten?"
              />
            </div>
            <div>
              <label className="field-label block mb-1">Feladat</label>
              <textarea
                value={terv.feladat ?? ''}
                onChange={(e) => update('feladat', e.target.value)}
                rows={3}
                className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
                placeholder="Mi a konkrét feladat?"
              />
            </div>
            <div>
              <label className="field-label block mb-1">Differenciálás</label>
              <textarea
                value={terv.differencialas ?? ''}
                onChange={(e) => update('differencialas', e.target.value)}
                rows={2}
                className="w-full border border-sage-100 rounded p-2 text-xs italic text-ink/70 focus:border-sage-500 outline-none"
              />
            </div>
            <div>
              <label className="field-label block mb-1">Módszerek</label>
              <textarea
                value={terv.modszerek ?? ''}
                onChange={(e) => update('modszerek', e.target.value)}
                rows={2}
                className="w-full border border-sage-100 rounded p-2 text-xs italic text-ink/70 focus:border-sage-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="field-label block mb-1">Képességfejlesztés</label>
            <textarea
              value={terv.kepessegfejlesztes ?? ''}
              onChange={(e) => update('kepessegfejlesztes', e.target.value)}
              rows={2}
              className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
              placeholder="finommotorika, szókincs, figyelem, emlékezet, …"
            />
          </div>

          <div className="mt-4">
            <label className="field-label block mb-1 flex items-center gap-2">
              Eszközök
              {autoEszkozok.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    update('eszkozok', autoEszkozok.join(', '))
                  }
                  className="text-xs text-sage-700 font-normal normal-case tracking-normal hover:underline"
                >
                  ↺ Auto-kitöltés a szövegekből ({autoEszkozok.length})
                </button>
              )}
            </label>
            <textarea
              value={terv.eszkozok ?? ''}
              onChange={(e) => update('eszkozok', e.target.value)}
              rows={2}
              className="w-full border border-sage-100 rounded p-2 text-sm focus:border-sage-500 outline-none"
              placeholder="papír, színes ceruza, olló, ragasztó, hangszóró…"
            />
          </div>
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
                  <li key={f.id}>
                    <Link
                      to={`/heti-terv/${terv.id}/foglalkozas/${f.id}`}
                      className="block px-2 py-1.5 rounded text-sm hover:bg-sage-50 group"
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

// ============================================================
// Ötletek panel — kapcsolódó sablonok bullet-pontjaiból válogatás
// ============================================================

/**
 * Egy adott területhez kapcsolódó hónapi sablonok bullet-pontjait listázza
 * checkbox-okkal. A kiválasztottak a "Hozzáadás" gombbal kerülnek a tartalom-mezőbe.
 *
 * Forrás: V1+V2+legacy sablonok ugyanahhoz a hónaphoz, az adott terület tartalma.
 * A "Mesék:", "Mondókák és versek:", "Tornatermi tevékenységek:" stb. fejcímeket
 * kiszűri (nem javaslat, hanem header).
 */
function OtletekModal({
  tipus,
  tipusCim,
  forrasok,
  korSpecifikusOtletek,
  aktualisSablonAzonosito,
  csakAktualisTema,
  setCsakAktualisTema,
  korcsoport,
  valasztottak,
  setValasztottak,
  onBezar,
  onHozzaadas,
}: {
  tipus: TeruletTipus;
  tipusCim: string;
  forrasok: SablonOtletForras[];
  korSpecifikusOtletek: string[];
  aktualisSablonAzonosito: string | null;
  csakAktualisTema: boolean;
  setCsakAktualisTema: (b: boolean) => void;
  korcsoport: string;
  valasztottak: Set<string>;
  setValasztottak: (s: Set<string>) => void;
  onBezar: () => void;
  onHozzaadas: () => void;
}) {
  // Header sorok kiszűrése (ezek nem javaslatok)
  const FEJCIMEK = [
    /^Mes[éeè]k\s*:\s*$/i,
    /^Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*$/i,
    /^Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*$/i,
    /^Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*$/i,
  ];

  // Téma-prefix kibontása az azonosítóból: "mikulas_v1" -> "mikulas"
  const temaPrefix = aktualisSablonAzonosito
    ? aktualisSablonAzonosito.replace(/_v[12]$/, '')
    : null;

  /**
   * "Rokon" sablonok keresése: nemcsak EGZAKT prefix-egyezést, hanem
   * fuzzy egyezést is figyelembe veszünk.
   * Pl. "husvet" prefix → "husveti_het" sablonok is rokon-mappolódnak,
   *     "osz_kezdete" → "osz_termenyek", "osz_szinek"
   */
  const rokonE = (sablonAzonosito: string, temaPref: string): boolean => {
    const fPrefix = sablonAzonosito.replace(/_v[12]$/, '');
    if (fPrefix === temaPref) return true;
    // egyik a másik prefixe (pl. "husvet" ⊂ "husveti_het")
    if (fPrefix.startsWith(temaPref) || temaPref.startsWith(fPrefix)) return true;
    // "osz_" prefix-csoport: ugyanazon szezon
    const elsoSzo = (s: string) => s.split('_')[0];
    if (elsoSzo(fPrefix) === elsoSzo(temaPref) && elsoSzo(fPrefix).length >= 3) return true;
    return false;
  };

  // Mely sablonokból gyűjtünk?
  // - Ha van aktuális téma ÉS bekapcsolt a téma-szűrés: rokon sablonok
  // - Egyébként: minden hónapi sablon
  const releavansForrasok = temaPrefix && csakAktualisTema
    ? forrasok.filter((f) => rokonE(f.azonosito, temaPrefix))
    : forrasok;

  // Minden forrásból gyűjtsük össze az ehhez a területhez tartozó bullet-sorokat
  const javaslatok: Array<{ szoveg: string; forrasCim: string; verzio?: number | null }> = [];
  const lattam = new Set<string>();
  for (const forras of releavansForrasok) {
    const tartalom = forras.teruletek?.[tipus] ?? '';
    if (!tartalom.trim()) continue;
    const sorok = tartalom
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const sor of sorok) {
      // Fejcímeket átugorjuk
      if (FEJCIMEK.some((re) => re.test(sor))) continue;
      const kulcs = sor.toLowerCase();
      if (lattam.has(kulcs)) continue;
      lattam.add(kulcs);
      javaslatok.push({ szoveg: sor, forrasCim: forras.cim, verzio: forras.verzio });
    }
  }

  const toggle = (szoveg: string) => {
    const uj = new Set(valasztottak);
    if (uj.has(szoveg)) uj.delete(szoveg);
    else uj.add(szoveg);
    setValasztottak(uj);
  };

  // Aktuális téma neve a fejlécbe (ha van)
  const aktualisTemaCim = temaPrefix
    ? forrasok.find((f) => f.azonosito.startsWith(temaPrefix))?.cim
    : null;

  // Korcsoport-cimke a fejléchez
  const korcsoportCimke = {
    kicsi: 'Kiscsoport (3–4 éves)',
    kozepso: 'Középső csoport (4–5 éves)',
    nagy: 'Nagycsoport (5–7 éves)',
    vegyes: 'Vegyes csoport (3–7 éves)',
  }[korcsoport] ?? 'Vegyes csoport (3–7 éves)';

  // Auto-fallback: ha kevés a téma-specifikus (és van rokon-szűrés bekapcsolva),
  // és van több sablon a hónapban, jelezzük hogy érdemes kibővíteni
  const tobbiSablonElerheto =
    temaPrefix &&
    csakAktualisTema &&
    forrasok.length > releavansForrasok.length;

  return (
    <div
      className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-4"
      onClick={onBezar}
    >
      <div
        className="bg-cream rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-sage-200 bg-sage-50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold flex items-center gap-2">
                <span>Ötletek böngészése — {tipusCim}</span>
                <span className="px-1.5 py-0.5 bg-mauve-200 text-mauve-700 rounded text-[10px] font-medium normal-case tracking-normal">
                  👥 {korcsoportCimke}
                </span>
              </div>
              <h3 className="heading-serif text-lg truncate">
                {temaPrefix && csakAktualisTema && aktualisTemaCim
                  ? `📌 ${aktualisTemaCim}`
                  : '📅 Minden téma a hónapból'}
              </h3>
              <div className="text-xs text-ink/60 mt-0.5">
                {javaslatok.length} javaslat — pipáld be amit szeretnél a tervedbe (utána még szerkesztheted).
              </div>
            </div>
            <button onClick={onBezar} className="text-ink/50 hover:text-ink text-2xl leading-none ml-2">
              ×
            </button>
          </div>
          {/* Téma-szűrés toggle — csak ha van aktuális sablon */}
          {temaPrefix && (
            <div className="mt-2 flex items-center gap-3 text-xs">
              <button
                onClick={() => setCsakAktualisTema(true)}
                className={`px-2 py-1 rounded transition ${
                  csakAktualisTema
                    ? 'bg-sage-500 text-cream font-semibold'
                    : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                }`}
              >
                📌 Csak ehhez a témához
              </button>
              <button
                onClick={() => setCsakAktualisTema(false)}
                className={`px-2 py-1 rounded transition ${
                  !csakAktualisTema
                    ? 'bg-sage-500 text-cream font-semibold'
                    : 'bg-white text-sage-700 hover:bg-sage-100 border border-sage-200'
                }`}
              >
                📅 Minden téma a hónapból
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {/* SZEKCIÓ 1: KIEMELT — kor-specifikus 10 ötlet az ötlet-bankból */}
          {korSpecifikusOtletek.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-mauve-700 font-semibold mb-2 flex items-center gap-2">
                <span>⭐ {korcsoportCimke} — {korSpecifikusOtletek.length} ötlet a témára</span>
              </div>
              <ul className="space-y-1">
                {korSpecifikusOtletek.map((sz, i) => {
                  const aktiv = valasztottak.has(sz);
                  return (
                    <li key={`bank-${i}`}>
                      <label
                        className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                          aktiv ? 'bg-mauve-100 border border-mauve-300' : 'hover:bg-mauve-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={aktiv}
                          onChange={() => toggle(sz)}
                          className="mt-0.5 accent-mauve-500"
                        />
                        <span className="flex-1 text-sm leading-snug">{sz}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* SZEKCIÓ 2: ALTERNATÍV — sablon-bullet-ek a hónap minden sablonjából */}
          {javaslatok.length > 0 && (
            <div>
              {korSpecifikusOtletek.length > 0 && (
                <div className="text-xs uppercase tracking-wider text-sage-700 font-semibold mb-2 pt-2 border-t border-sage-200">
                  📚 További ötletek a sablonokból ({javaslatok.length})
                </div>
              )}
              <ul className="space-y-1">
                {javaslatok.map((j, i) => {
                  const aktiv = valasztottak.has(j.szoveg);
                  const verzioJel = j.verzio === 1 ? 'V1' : j.verzio === 2 ? 'V2' : null;
                  return (
                    <li key={i}>
                      <label
                        className={`flex items-start gap-2 px-2 py-1.5 rounded cursor-pointer transition ${
                          aktiv ? 'bg-sage-100 border border-sage-300' : 'hover:bg-sage-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={aktiv}
                          onChange={() => toggle(j.szoveg)}
                          className="mt-0.5 accent-sage-500"
                        />
                        <span className="flex-1 text-sm leading-snug">{j.szoveg}</span>
                        <span className="text-[10px] text-ink/40 whitespace-nowrap mt-0.5">
                          {verzioJel ?? (j.forrasCim.length > 18 ? j.forrasCim.slice(0, 18) + '…' : j.forrasCim)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Ha mindkét forrás üres */}
          {korSpecifikusOtletek.length === 0 && javaslatok.length === 0 && (
            <div className="text-center text-ink/50 py-8 italic">
              Ehhez nincs javaslat. Próbálj sablont választani, vagy írj saját ötletet a szerkesztőbe.
            </div>
          )}

          {/* Auto-fallback banner — már nem fontos, mert mindkét forrásból gyűjtünk */}
          {tobbiSablonElerheto && javaslatok.length + korSpecifikusOtletek.length < 10 && (
            <div className="p-2 bg-mauve-50 border border-mauve-200 rounded text-xs text-mauve-700">
              ⚡ Még alternatívák elérhetők. {' '}
              <button
                onClick={() => setCsakAktualisTema(false)}
                className="underline font-semibold hover:text-mauve-600"
              >
                📅 Minden téma megnyitása →
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-sage-200 flex items-center justify-between bg-sage-50/50">
          <div className="text-xs text-ink/60">
            {valasztottak.size} kiválasztva
          </div>
          <div className="flex gap-2">
            <button onClick={onBezar} className="btn-secondary text-sm">
              Mégse
            </button>
            <button
              onClick={onHozzaadas}
              disabled={valasztottak.size === 0}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Hozzáadás ({valasztottak.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Dokumentum nézet — Word-szerű, formázott layout
// ============================================================

function DokumentumNezet({
  terv,
  teruletAllapotok,
  onBack,
  onExport,
  exportAllapot,
}: {
  terv: Partial<HetiTervTeljes>;
  teruletAllapotok: TeruletAllapot[];
  beallitas: { pedagogusNeve?: string | null; ovodaNeve?: string | null; csoportNeve?: string | null } | null;
  onBack: () => void;
  onExport: () => void;
  exportAllapot: 'idle' | 'exportal' | 'kesz' | 'hiba';
}) {
  const getTartalom = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.tartalom ?? '';
  const getIskolaElokeszito = (tipus: TeruletTipus) =>
    teruletAllapotok.find((t) => t.tipus === tipus)?.iskolaElokeszito ?? '';

  // Bullet lista: \n-nel szétdarabol → minden sorból egy <li>
  const Bullets = ({ szoveg }: { szoveg: string }) => {
    const sorok = szoveg.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sorok.length === 0) return null;
    return (
      <ul className="list-disc pl-6 mt-1 space-y-0.5">
        {sorok.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    );
  };

  // Verselés blokk — kibontja "Mesék:" és "Mondókák és versek:" alszekciókra
  const VerselesBlokk = ({ szoveg }: { szoveg: string }) => {
    const trimmed = (szoveg ?? '').trim();
    if (!trimmed) return null;
    const mesekMatch = trimmed.match(/Mes[éeè]k\s*:\s*\n?/i);
    const mondokakMatch = trimmed.match(/Mond[óo]k[áa]k\s+[ée]s\s+versek\s*:\s*\n?/i);

    if (!mesekMatch && !mondokakMatch) {
      return <Bullets szoveg={trimmed} />;
    }
    let mesekResz = '', mondokakResz = '', elotteResz = '';
    if (mesekMatch && mondokakMatch) {
      const ms = mesekMatch.index! + mesekMatch[0].length;
      const moStart = mondokakMatch.index!;
      elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
      mesekResz = trimmed.substring(ms, moStart).trim();
      mondokakResz = trimmed.substring(moStart + mondokakMatch[0].length).trim();
    } else if (mesekMatch) {
      elotteResz = trimmed.substring(0, mesekMatch.index!).trim();
      mesekResz = trimmed.substring(mesekMatch.index! + mesekMatch[0].length).trim();
    } else if (mondokakMatch) {
      elotteResz = trimmed.substring(0, mondokakMatch.index!).trim();
      mondokakResz = trimmed.substring(mondokakMatch.index! + mondokakMatch[0].length).trim();
    }
    return (
      <>
        {elotteResz && <Bullets szoveg={elotteResz} />}
        {mesekResz && (
          <>
            <p className="font-bold mt-2">Mesék:</p>
            <Bullets szoveg={mesekResz} />
          </>
        )}
        {mondokakResz && (
          <>
            <p className="font-bold mt-2">Mondókák és versek:</p>
            <Bullets szoveg={mondokakResz} />
          </>
        )}
      </>
    );
  };

  // Mozgás blokk — kibontja "Tornatermi:" és "Csoportban/udvaron:" alszekciókra
  const MozgasBlokk = ({ szoveg }: { szoveg: string }) => {
    const trimmed = (szoveg ?? '').trim();
    if (!trimmed) return null;
    const tornaMatch = trimmed.match(/Tornatermi\s+tev[ée]kenys[ée]gek\s*:\s*\n?/i);
    const udvarMatch = trimmed.match(/Csoportban\/?udvar(?:on)?\s+v[ée]gzett.*?mozg[áa]s\s*:\s*\n?/i);

    if (!tornaMatch && !udvarMatch) {
      return <Bullets szoveg={trimmed} />;
    }
    let tornaResz = '', udvarResz = '', elotteResz = '';
    if (tornaMatch && udvarMatch) {
      const ts = tornaMatch.index! + tornaMatch[0].length;
      const uStart = udvarMatch.index!;
      elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
      tornaResz = trimmed.substring(ts, uStart).trim();
      udvarResz = trimmed.substring(uStart + udvarMatch[0].length).trim();
    } else if (tornaMatch) {
      elotteResz = trimmed.substring(0, tornaMatch.index!).trim();
      tornaResz = trimmed.substring(tornaMatch.index! + tornaMatch[0].length).trim();
    } else if (udvarMatch) {
      elotteResz = trimmed.substring(0, udvarMatch.index!).trim();
      udvarResz = trimmed.substring(udvarMatch.index! + udvarMatch[0].length).trim();
    }
    return (
      <>
        {elotteResz && <Bullets szoveg={elotteResz} />}
        {tornaResz && (
          <>
            <p className="mt-2">Tornatermi tevékenységek:</p>
            <Bullets szoveg={tornaResz} />
          </>
        )}
        {udvarResz && (
          <>
            <p className="mt-2">Csoportban/udvaron végzett mindennapos mozgás:</p>
            <Bullets szoveg={udvarResz} />
          </>
        )}
      </>
    );
  };

  // Iskola előkészítő szekció — félkövér fejléc + bullet lista
  // Ha üres a szöveg, NEM jelenik meg a fejléc (kerüljük a üres bekezdést)
  const IskolaElokeszito = ({ szoveg }: { szoveg: string }) => {
    const sorok = szoveg.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sorok.length === 0) return null;
    return (
      <div className="mt-3">
        <p className="font-bold">Iskola előkészítő tevékenység:</p>
        <Bullets szoveg={szoveg} />
      </div>
    );
  };

  return (
    <div className="min-h-full bg-ink/5">
      {/* Felső műveletsor (csak képernyőre, nyomtatáskor rejtett) */}
      <div className="sticky top-[57px] z-10 border-b border-sage-200 bg-cream/95 backdrop-blur print:hidden">
        <div className="mx-auto max-w-4xl px-6 py-2 flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="btn-secondary text-sm">
            ← Szerkesztő nézet
          </button>
          <button onClick={onExport} className="btn-primary text-sm" disabled={exportAllapot === 'exportal'}>
            {exportAllapot === 'exportal'
              ? 'Exportálás…'
              : exportAllapot === 'kesz'
                ? '✓ DOCX elmentve'
                : '📥 Letöltés .docx-ként (KRÉTA)'}
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-sm">
            🖨 Nyomtatás / PDF
          </button>
          <span className="ml-auto text-xs text-ink/50 italic">
            Olvasható dokumentum-előnézet — szerkesztéshez kapcsolj vissza.
          </span>
        </div>
      </div>

      {/* A papír — fejléc nélkül, ahogy a Hetiterv üres.docx-en */}
      <div className="mx-auto max-w-4xl px-6 py-10 print:py-0">
        <div className="bg-white shadow-paper rounded p-12 print:shadow-none print:p-0">
          <article
            className="text-ink"
            style={{
              fontFamily: 'Times New Roman, Georgia, serif',
              fontSize: '12pt',
              lineHeight: '1.4',
            }}
          >
            {/* 1. Külső világ + 2. Matematika (közös iskolaElokeszito) */}
            <p className="font-bold">Külső világ tevékeny megismerésére nevelés:</p>
            <Bullets szoveg={getTartalom('kulso_vilag')} />

            <p className="font-bold mt-3">Matematikai tartalom:</p>
            <Bullets szoveg={getTartalom('matematika')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('kulso_vilag')} />

            {/* 3. Verselés, mesélés (Mesék: + Mondókák alfejezet) */}
            <p className="font-bold mt-4">Verselés, mesélés:</p>
            <VerselesBlokk szoveg={getTartalom('verseles_meseles')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('verseles_meseles')} />

            {/* 4. Rajzolás, festés */}
            <p className="font-bold mt-4">
              Rajzolás, festés, mintázás, építés, képalakítás, kézimunka:
            </p>
            <Bullets szoveg={getTartalom('rajzolas_festes')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('rajzolas_festes')} />

            {/* 5. Ének + Hallás-ritmus */}
            <p className="font-bold mt-4">Ének, zene, népi játék, tánc:</p>
            <Bullets szoveg={getTartalom('enek_zene')} />

            <p className="mt-2">Hallás és ritmusérzék fejlesztés:</p>
            <Bullets szoveg={getTartalom('hallas_ritmus')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('enek_zene')} />

            {/* 6. Mindennapos mozgás (Tornatermi + Csoportban/udvaron) */}
            <p className="font-bold mt-4">Mindennapos mozgás:</p>
            <MozgasBlokk szoveg={getTartalom('mozgas')} />

            <IskolaElokeszito szoveg={getIskolaElokeszito('mozgas')} />

            {/* Lezáró rész — Cél / Feladat / Differenciálás / Módszerek / Képességfejlesztés / Eszközök */}
            <p className="mt-4">
              <span className="font-bold">Cél: </span>
              <span>{terv.cel}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Feladat: </span>
              <span>{terv.feladat}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Differenciálás: </span>
              <span>{terv.differencialas}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Módszerek: </span>
              <span>{terv.modszerek}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Képességfejlesztés: </span>
              <span>{terv.kepessegfejlesztes}</span>
            </p>

            <p className="mt-2">
              <span className="font-bold">Eszközök: </span>
              <span>{terv.eszkozok}</span>
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
