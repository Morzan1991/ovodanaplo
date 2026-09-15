/**
 * A kulcsbekérő ablak preloadja — lásd `main/kulcsbekeres.ts`.
 *
 * Szándékosan külön a fő `window.api`-tól: ez az ablak még az adatbázis
 * megnyitása előtt él, és egyetlen dolgot tehet — kulcsot küldhet próbára.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { KULCSBEKERES_CSATORNA, type KulcsProbaValasz } from '../shared/kulcsbekeres.js';

contextBridge.exposeInMainWorld('kulcsBekeres', {
  probal: (bevitel: string): Promise<KulcsProbaValasz> =>
    ipcRenderer.invoke(KULCSBEKERES_CSATORNA, bevitel),
});
