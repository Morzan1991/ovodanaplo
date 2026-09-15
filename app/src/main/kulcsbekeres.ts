/**
 * A visszaállítási kulcs bekérése induláskor.
 *
 * Akkor kell, ha a napló titkosított, de a gépen nincs hozzá használható kulcs —
 * tipikusan Windows-újratelepítés vagy profilsérülés után visszamásolt naplónál
 * (lásd `db/kulcsdontes.ts`).
 *
 * Külön kis ablak, mert ekkor még nincs megnyitott adatbázis, a főablak viszont
 * minden részében arra épül. Rossz kulcsnál semmi nem íródik: a próba csak
 * olvasásra nyitja az adatbázist, a `kulcs.dat` pedig csak elfogadott kulcsnál
 * készül.
 */

import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KULCSBEKERES_CSATORNA, type KulcsProbaValasz } from '../shared/kulcsbekeres.js';
import { kulcsKiir } from './db/kulcs.js';
import { bekertKulcsProba, type KulcsBekeresOka } from './db/kulcsdontes.js';
import { adatbazisNyithato } from './db/kulcsproba.js';
import { kulcsBekeresOldal } from './kulcsbekeres-oldal.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** Az elfogadott visszaállítási kulcs — ezzel folytatódik az indulás. */
export interface BekertKulcs {
  /** A kulcs nyers alakja; ezzel nyílik az adatbázis. */
  kulcs: string;
  /** Miért nem sikerült eltárolni a kulcsot; `null`, ha eltárolva. */
  mentesiHiba: string | null;
  /** A bekérő ablak bezárása — a főablak megjelenésekor, hogy ne maradjon ablaktalan pillanat. */
  ablakBezar: () => void;
}

const NEM_NYITJA =
  'Ez a kulcs nem nyitja ezt a naplót. Nézd át jelenként — a B és a 8, a D és a 0 ' +
  'könnyen összekeverhető. Ha több kulcsfájlod is van (például dátumos nevű), próbáld ki a többit is.';

/**
 * Megnyitja a kulcsbekérő ablakot, és addig vár, amíg a felhasználó olyan kulcsot
 * ad meg, amely nyitja a naplót — vagy bezárja az ablakot.
 *
 * @returns az elfogadott kulcs, vagy `null`, ha a felhasználó kilépett.
 */
export function kulcsBekeres(
  dbUt: string,
  ok: KulcsBekeresOka,
  mentheto: boolean,
): Promise<BekertKulcs | null> {
  return new Promise((resolve) => {
    const ablak = new BrowserWindow({
      width: 620,
      height: 610,
      useContentSize: true,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      title: 'ÓvodaNapló — a napló kinyitása',
      backgroundColor: '#FEF8FA',
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '..', 'preload', 'kulcsbekeres.mjs'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        spellcheck: false,
      },
    });
    let elfogadva = false;

    ipcMain.handle(KULCSBEKERES_CSATORNA, (esemeny, bevitel: unknown): KulcsProbaValasz => {
      if (esemeny.sender !== ablak.webContents) {
        return { siker: false, hiba: 'Ismeretlen feladó.' };
      }
      if (typeof bevitel !== 'string' || bevitel.length > 1000) {
        return { siker: false, hiba: 'Írd be a visszaállítási kulcsot.' };
      }

      const eredmeny = bekertKulcsProba(bevitel, {
        nyitja: (kulcs) => adatbazisNyithato(dbUt, kulcs),
        kiir: mentheto ? kulcsKiir : null,
      });

      switch (eredmeny.tipus) {
        case 'hibas-bevitel':
          return { siker: false, hiba: eredmeny.uzenet };
        case 'nem-nyitja':
          return { siker: false, hiba: NEM_NYITJA };
        case 'probahiba':
          console.error('[kulcsbekeres] A próba-megnyitás nem sikerült:', eredmeny.uzenet);
          return {
            siker: false,
            hiba:
              `A naplót most nem sikerült megnyitni, így a kulcsot sem tudtuk ellenőrizni (${eredmeny.uzenet}). ` +
              'Próbáld újra, és ha nem megy, indítsd újra a gépet.',
          };
        case 'elfogadva': {
          elfogadva = true;
          ipcMain.removeHandler(KULCSBEKERES_CSATORNA);
          console.log('[kulcsbekeres] A visszaállítási kulcs elfogadva.');
          const { kulcs, mentesiHiba } = eredmeny;
          // Az indulás csak a válasz elküldése után folytatódjon: a napló megnyitása
          // eltart egy darabig, és addig az ablak már a „Megnyitom" állapotot mutassa.
          setImmediate(() =>
            resolve({
              kulcs,
              mentesiHiba,
              ablakBezar: () => {
                if (!ablak.isDestroyed()) ablak.close();
              },
            }),
          );
          return { siker: true };
        }
      }
    });

    ablak.on('closed', () => {
      if (elfogadva) return;
      ipcMain.removeHandler(KULCSBEKERES_CSATORNA);
      resolve(null);
    });

    // Ez az ablak sehova nem navigálhat, és új ablakot sem nyithat.
    ablak.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    ablak.webContents.on('will-navigate', (e) => e.preventDefault());
    ablak.once('ready-to-show', () => ablak.show());

    void ablak.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(kulcsBekeresOldal(ok, mentheto))}`,
    );
  });
}
