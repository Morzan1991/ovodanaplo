/**
 * Electron főprocesz.
 * - Egyetlen főablak (előtte, ha kell, a visszaállítási kulcs bekérő ablaka)
 * - Bezáráskor lezárja a DB-t
 * - Heti backup futtatás indításkor
 */

import { app, BrowserWindow, shell, dialog } from 'electron';
import { join } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  initDb,
  createBackup,
  closeDb,
  getDbPath,
  getTitkositasAllapot,
  nyitasiHelyzet,
} from './db/index.js';
import { kulcsFormazott, ujKulcsLetrehoz, visszaallitasiFajlTartalma } from './db/kulcs.js';
import { nyitasiDontes } from './db/kulcsdontes.js';
import { KULCSFAJL_ALAPNEV, szabadKulcsfajlUt } from './db/kulcsfajl.js';
import { registerIpcHandlers } from './ipc.js';
import { kulcsBekeres, type BekertKulcs } from './kulcsbekeres.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const isDev = !app.isPackaged;

/**
 * Első titkosításkor megmutatjuk a visszaállítási kulcsot, és fájlba is kiírjuk.
 *
 * Ez nem formalitás: a kulcs a Windows-fiókhoz kötődik, így fiókvesztés esetén
 * enélkül a napló véglegesen olvashatatlan lenne. Ezért egyetlen kattintással
 * kimenthető, és a helyét is megmutatjuk.
 */
async function titkositasTajekoztato(): Promise<void> {
  const allapot = getTitkositasAllapot();

  if (allapot.hiba) {
    await dialog.showMessageBox({
      type: 'warning',
      title: 'Titkosítás nem aktív',
      message: 'Az adatbázis titkosítása nem kapcsolható be ezen a gépen.',
      detail:
        `${allapot.hiba}\n\n` +
        'A program működik, az adataid a helyükön vannak — de az adatbázis-fájl ' +
        'titkosítás nélkül tárolódik.',
      buttons: ['Rendben'],
    });
    return;
  }

  if (!allapot.aktiv || !allapot.ujKulcs || !allapot.kulcs) return;

  // Kimentjük az Asztalra, hogy biztosan meglegyen — de figyelmeztetünk, hogy
  // ez a másolat a géppel együtt veszne el.
  //
  // Egy már ott lévő kulcsfájlt SOHA nem írunk felül: egy másik, régebbi napló
  // egyetlen visszaállítási útja lehet (lásd `db/kulcsfajl.ts`).
  let kimentve: string | null = null;
  let voltKorabbi = false;
  try {
    const asztal = app.getPath('desktop');
    voltKorabbi = existsSync(join(asztal, `${KULCSFAJL_ALAPNEV}.txt`));
    kimentve = szabadKulcsfajlUt(asztal, existsSync);
    // 'wx': ha a név közben mégis foglalttá vált, inkább hibázzunk, mint felülírjunk.
    writeFileSync(kimentve, visszaallitasiFajlTartalma(allapot.kulcs), {
      encoding: 'utf-8',
      flag: 'wx',
    });
  } catch (err) {
    console.error('[titkositas] A visszaállítási fájl kiírása nem sikerült:', err);
    kimentve = null;
  }

  await dialog.showMessageBox({
    type: 'info',
    title: 'Az adataid mostantól titkosítva vannak',
    message: 'Mentsd el a visszaállítási kulcsot!',
    detail:
      `${kulcsFormazott(allapot.kulcs)}\n\n` +
      'A program ezután is magától kinyitja a naplót — jelszót nem kell gépelned.\n\n' +
      'DE ha a Windowst újratelepítik, vagy a felhasználói fiókod megsérül, CSAK ' +
      'ezzel a kulccsal nyerhetők vissza a tervezeteid.\n\n' +
      (kimentve
        ? `Kimentettük ide: ${kimentve}\nMásold át pendrive-ra vagy nyomtasd ki — ` +
          'a gépen hagyott másolat a géppel együtt veszne el.' +
          (voltKorabbi
            ? '\n\nAz Asztalon már volt egy korábbi kulcsfájl. Azt nem írtuk felül, ' +
              'mert egy másik, régebbi naplóhoz tartozhat.'
            : '')
        : 'Írd le vagy fényképezd le most.'),
    buttons: ['Rendben, elmentettem'],
  });
}

/** Csak http/https linket adunk át az operációs rendszernek. */
function kulsoLinkBiztonsagos(url: string): boolean {
  try {
    const p = new URL(url).protocol;
    return p === 'http:' || p === 'https:';
  } catch {
    return false;
  }
}

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'ÓvodaNapló',
    backgroundColor: '#FAF7F2',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  });

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[renderer] Betöltési hiba:', code, desc, url);
  });

  win.webContents.on('render-process-gone', (_e, details) => {
    console.error('[renderer] Renderer crash:', details.reason);
  });

  // Külső linkek alapértelmezett böngészőben — CSAK http(s).
  // Séma-ellenőrzés nélkül a shell.openExternal tetszőleges protokollt átadna az
  // operációs rendszernek (file:, ms-msdt:, stb.), ami tervben tárolt szövegből is
  // eljuthatna ide. Ezért fehérlistázunk.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (kulsoLinkBiztonsagos(url)) {
      void shell.openExternal(url);
    } else {
      console.warn('[biztonsag] Blokkolt külső link:', url);
    }
    return { action: 'deny' };
  });

  // Az ablak sosem navigálhat el a saját felületéről (pl. beillesztett link miatt).
  win.webContents.on('will-navigate', (e, url) => {
    const engedett = isDev && process.env['ELECTRON_RENDERER_URL'];
    if (engedett && url.startsWith(process.env['ELECTRON_RENDERER_URL']!)) return;
    if (url.startsWith('file://')) return;
    e.preventDefault();
    console.warn('[biztonsag] Blokkolt navigáció:', url);
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    void win.loadFile(join(__dirname, '..', 'renderer', 'index.html'));
  }

  return win;
}

/**
 * Az adatbázis megnyitása a megfelelő kulccsal (lásd `db/kulcsdontes.ts`).
 *
 * Ha a napló titkosított, de a gépen nincs hozzá használható kulcs, bekéri a
 * visszaállítási kulcsot. Meglévő, titkosított naplóhoz új kulcs itt soha nem
 * készül, és kulcs nélkül sem nyílik meg.
 *
 * @returns a bekért kulcs (ha be kellett kérni), `null`, ha nem kellett — vagy
 *          `false`, ha a felhasználó a kulcs bekérésénél kilépett.
 */
async function adatbazisMegnyitas(): Promise<BekertKulcs | null | false> {
  const dontes = nyitasiDontes(nyitasiHelyzet());
  console.log('[db] Kulcsdöntés:', dontes.tipus); // a kulcsot magát soha nem naplózzuk

  switch (dontes.tipus) {
    case 'tarolt-kulcs':
      initDb({ kulcs: dontes.kulcs, ujKulcs: false });
      return null;

    case 'uj-kulcs': {
      let kulcs: string;
      try {
        kulcs = ujKulcsLetrehoz();
      } catch (err) {
        // Inkább működjön a program titkosítás nélkül, mint hogy a pedagógus ne
        // férjen a munkájához. Ide csak akkor jutunk, ha nincs titkosított napló.
        initDb({ kulcs: null, hiba: `A titkosítási kulcs nem tárolható: ${(err as Error).message}` });
        return null;
      }
      initDb({ kulcs, ujKulcs: true });
      return null;
    }

    case 'titkositas-nelkul':
      initDb({
        kulcs: null,
        hiba:
          'A Windows jelszóvédelme (safeStorage) nem érhető el, ezért a titkosítási ' +
          'kulcs nem tárolható biztonságosan.',
      });
      return null;

    case 'kulcs-bekeres': {
      console.warn(
        `[db] Titkosított napló használható kulcs nélkül (${dontes.ok}) — a visszaállítási kulcsot kérjük be.`,
      );
      const bekert = await kulcsBekeres(getDbPath(), dontes.ok, dontes.mentheto);
      if (!bekert) return false;
      initDb({ kulcs: bekert.kulcs, ujKulcs: false });
      return bekert;
    }
  }
}

/** Jelzés, ha a visszaállítási kulccsal megnyílt napló kulcsát nem sikerült eltárolni. */
async function kulcsTarolasiFigyelmeztetes(ok: string): Promise<void> {
  await dialog.showMessageBox({
    type: 'warning',
    title: 'A kulcs nincs eltárolva',
    message: 'A napló megnyílt, de a kulcsát nem sikerült eltárolni ezen a gépen.',
    detail:
      `${ok}\n\nA program a következő indításkor újra kérni fogja a visszaállítási ` +
      'kulcsot — tartsd kéznél.',
    buttons: ['Rendben'],
  });
}

// Egyetlen példány futhat. Két párhuzamos példány UGYANAZT az SQLite-fájlt írná,
// ami adatvesztéshez/sérüléshez vezethet. Ha már fut egy, azt hozzuk előtérbe.
const egyPeldanyZar = app.requestSingleInstanceLock();
if (!egyPeldanyZar) {
  console.log('[app] Már fut egy példány — kilépés.');
  app.quit();
} else {
  app.on('second-instance', () => {
    const ablakok = BrowserWindow.getAllWindows();
    if (ablakok.length > 0) {
      const w = ablakok[0];
      if (w.isMinimized()) w.restore();
      w.focus();
    }
  });

  // Váratlan hiba esetén is legyen nyoma — enélkül némán elszáll.
  process.on('uncaughtException', (err) => {
    console.error('[app] Kezeletlen kivétel:', err);
  });
  process.on('unhandledRejection', (ok) => {
    console.error('[app] Kezeletlen promise-hiba:', ok);
  });

  app.whenReady().then(async () => {
    console.log('[app] Indulás. Verzió:', app.getVersion());

    let bekert: BekertKulcs | null | false;
    try {
      bekert = await adatbazisMegnyitas();
    } catch (err) {
      // Enélkül a program ablak nélkül futna tovább, és az egypéldányos zár miatt
      // újraindítani sem lehetne.
      console.error('[app] Az adatbázis megnyitása nem sikerült:', err);
      dialog.showErrorBox(
        'Az ÓvodaNapló nem tud elindulni',
        `Az adatbázist nem sikerült megnyitni:\n\n${(err as Error).message}`,
      );
      app.quit();
      return;
    }
    if (bekert === false) {
      app.quit();
      return;
    }

    registerIpcHandlers();
    createBackup(); // csendes napi snapshot

    const foablak = createMainWindow();
    if (bekert) {
      // A bekérő ablak csak akkor tűnik el, amikor a főablak már látszik.
      foablak.once('ready-to-show', bekert.ablakBezar);
      if (bekert.mentesiHiba) void kulcsTarolasiFigyelmeztetes(bekert.mentesiHiba);
    }
    void titkositasTajekoztato();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  closeDb();
});
