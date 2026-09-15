/**
 * Electron főprocesz.
 * - Egyetlen BrowserWindow
 * - Bezáráskor lezárja a DB-t
 * - Heti backup futtatás indításkor
 */

import { app, BrowserWindow, shell, dialog } from 'electron';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDb, createBackup, closeDb, getTitkositasAllapot } from './db/index.js';
import { kulcsFormazott, visszaallitasiFajlTartalma } from './db/kulcs.js';
import { registerIpcHandlers } from './ipc.js';

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
  let kimentve: string | null = null;
  try {
    kimentve = join(app.getPath('desktop'), 'OvodaNaplo-visszaallitasi-kulcs.txt');
    writeFileSync(kimentve, visszaallitasiFajlTartalma(allapot.kulcs), 'utf-8');
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
          'a gépen hagyott másolat a géppel együtt veszne el.'
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

  app.whenReady().then(() => {
    console.log('[app] Indulás. Verzió:', app.getVersion());
    initDb();
    registerIpcHandlers();
    createBackup(); // csendes napi snapshot

    createMainWindow();
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
