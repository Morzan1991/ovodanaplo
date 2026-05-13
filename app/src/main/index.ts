/**
 * Electron főprocesz.
 * - Egyetlen BrowserWindow
 * - Bezáráskor lezárja a DB-t
 * - Heti backup futtatás indításkor
 */

import { app, BrowserWindow, shell } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, createBackup, closeDb } from './db/index.js';
import { registerIpcHandlers } from './ipc.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const isDev = !app.isPackaged;

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'OvodaNapló',
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

  // Külső linkek alapértelmezett böngészőben
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    void win.loadFile(join(__dirname, '..', 'renderer', 'index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  console.log('[app] Indulás. Verzió:', app.getVersion());
  initDb();
  registerIpcHandlers();
  createBackup(); // csendes heti snapshot

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  closeDb();
});
