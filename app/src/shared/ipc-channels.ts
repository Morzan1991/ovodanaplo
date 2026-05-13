/**
 * IPC csatorna-nevek központi helye.
 * Egy helyen szerkeszthetők, mindkét oldal (main, renderer) importálja.
 */

export const IpcChannels = {
  // Beállítások
  beallitasokGet: 'beallitasok:get',
  beallitasokSave: 'beallitasok:save',

  // Nevelési év
  nevelesiEvLista: 'nevelesiEv:lista',
  nevelesiEvAktiv: 'nevelesiEv:aktiv',
  nevelesiEvLetrehoz: 'nevelesiEv:letrehoz',
  nevelesiEvStatistika: 'nevelesiEv:statistika', // kapcsolódó tartalom darabszáma
  nevelesiEvTorol: 'nevelesiEv:torol', // CASCADE törlés tranzakcióban

  // Heti tervek
  hetiTervLista: 'hetiTerv:lista',
  hetiTervBetolt: 'hetiTerv:betolt',
  hetiTervMent: 'hetiTerv:ment',
  hetiTervTorol: 'hetiTerv:torol',
  hetiTervTeljesBetolt: 'hetiTerv:teljesBetolt', // heti terv + területek
  hetiTervTeljesMent: 'hetiTerv:teljesMent', // heti terv + területek tranzakcióban
  hetiTervMasolas: 'hetiTerv:masolas', // egy meglévő heti tervből másolat új dátumokkal (TODO-9)
  hetiTervekGeneralasEvre: 'hetiTerv:generalasEvre', // egész évet sablonokból
  sablonokLista: 'sablon:lista', // sablon-meta lista (cím, azonosító, hónap)
  sablonBetolt: 'sablon:betolt', // egy sablon teljes tartalma
  sablonAjanloDatumra: 'sablon:ajanloDatumra', // adott dátumra legjobb sablon
  sablonokHonapra: 'sablon:honapra', // egy hónap ÖSSZES sablonja teljes tartalommal (ötletbörzehez)
  otletekBank: 'otletek:bank', // korcsoport-specifikus ötlet-bank (téma × terület × 10 bullet)

  // Projektek
  projektLista: 'projekt:lista',
  projektBetolt: 'projekt:betolt',
  projektMent: 'projekt:ment',

  // Foglalkozás-tervezetek
  foglalkozasLista: 'foglalkozas:lista',
  foglalkozasBetolt: 'foglalkozas:betolt',
  foglalkozasMent: 'foglalkozas:ment',

  // Reflexiók
  reflexioLista: 'reflexio:lista',
  reflexioMent: 'reflexio:ment',

  // Események
  esemenyLista: 'esemeny:lista',
  esemenyMent: 'esemeny:ment',

  // Irodalom (csak olvasás, részben — saját hozzáadás külön IPC)
  irodalomKereses: 'irodalom:kereses',
  irodalomHozzaad: 'irodalom:hozzaad',

  // Ünnepek
  unnepekListaEvre: 'unnepek:listaEvre',

  // Képességek
  kepessegekLista: 'kepessegek:lista',
  // Heti terv ↔ képesség M-N kapcsolatok (TODO-11)
  hetiTervKepessegekLista: 'hetiTerv:kepessegekLista',
  hetiTervKepessegekMent: 'hetiTerv:kepessegekMent',
  // FTS5 keresés (TODO-12)
  keresesHetiTervekben: 'kereses:hetiTervekben',
  // Téma-duplikáció ellenőrzés (TODO-20)
  hetiTervekTemaDuplikacio: 'hetiTerv:temaDuplikacio',
  // "Tavaly ilyenkor" emlékeztető (TODO-15)
  hetiTervekTavalyiEvbol: 'hetiTerv:tavalyiEvbol',

  // Export
  exportHetiTervDocx: 'export:hetiTerv:docx',
  exportFoglalkozasDocx: 'export:foglalkozas:docx',
  exportProjektDocx: 'export:projekt:docx', // TODO-10 Stage B
  exportPdf: 'export:pdf',

  // Backup
  backupKeszit: 'backup:keszit',
  backupVisszaallit: 'backup:visszaallit',
  backupLista: 'backup:lista',

  // App
  appVerzio: 'app:verzio',
  appAdattarMegnyit: 'app:adattarMegnyit',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
