/**
 * A kulcsbekérő ablak és a főprocesz közti csatorna — lásd `main/kulcsbekeres.ts`.
 *
 * Nem az `ipc-channels.ts` része: ha a két preload közös modult importálna, a
 * build közös darabra (chunk) bontaná a főablak preloadját is.
 */

export const KULCSBEKERES_CSATORNA = 'kulcsbekeres:probal';

export type KulcsProbaValasz = { siker: true } | { siker: false; hiba: string };
