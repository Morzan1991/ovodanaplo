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

  // Heti tervek
  hetiTervLista: 'hetiTerv:lista',
  hetiTervBetolt: 'hetiTerv:betolt',
  hetiTervMent: 'hetiTerv:ment',
  hetiTervTorol: 'hetiTerv:torol',
  hetiTervTeljesBetolt: 'hetiTerv:teljesBetolt', // heti terv + területek
  hetiTervTeljesMent: 'hetiTerv:teljesMent', // heti terv + területek tranzakcióban
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

  // Export
  exportHetiTervDocx: 'export:hetiTerv:docx',
  exportFoglalkozasDocx: 'export:foglalkozas:docx',
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
