/**
 * Az Ötletek panelről kiválasztott irodalmi javaslatok beszúrása a megfelelő
 * szekcióba (Verselés, mesélés terület).
 *
 * Előzmény: a kiválasztott sorok egyszerűen a szöveg végére kerültek. Így egy
 * bepipált MESE a „Mondókák, versek:" felsorolás után jelent meg — pedig a
 * műfaja ott volt a sor végén zárójelben.
 *
 * Alapelv: a pedagógus szövegét nem szervezzük át. Csak akkor nyúlunk a
 * szerkezethez, ha már vannak benne szekció-fejlécek; egyébként a végére fűzünk,
 * de az új sorokat legalább műfaj szerint csoportosítva.
 */

// A címke-levétel a `shared` mappában él, mert a Word-exportnak (főprocesz) is kell.
import { cimkeNelkul } from '@shared/mufaj-cimke';

export { cimkeNelkul };

export const FEJLEC_ROVID = 'Mondókák, versek:';
export const FEJLEC_MESE = 'Mesék:';

/** Rövid, mondható műfajok — ezek a „Mondókák, versek:" szekcióba valók. */
const ROVID_MUFAJOK = new Set(['mondóka', 'vers', 'találós kérdés']);
/** Hosszabb, hallgatható műfajok — ezek a „Mesék:" szekcióba valók. */
const MESE_MUFAJOK = new Set(['mese', 'népmese']);

/**
 * Egy javaslatsor műfaja. A cím maga is tartalmazhat zárójelet
 * („A négy évszak — Ősz (részlet) (zenehallgatás)"), ezért hátulról keressük az
 * első ismert műfajnevet.
 */
export function sorMufaja(sor: string): string | null {
  const csoportok = [...sor.matchAll(/\(([^()]+)\)/g)].map((m) => m[1].trim());
  for (let i = csoportok.length - 1; i >= 0; i--) {
    const jelolt = csoportok[i];
    if (ROVID_MUFAJOK.has(jelolt) || MESE_MUFAJOK.has(jelolt)) return jelolt;
  }
  return null;
}

/** Fejléc-e a sor? (Kettősponttal záruló, önálló cím.) */
function fejlecE(sor: string): boolean {
  return sor.trim().endsWith(':');
}

/** Melyik szekcióba való a sor: 'mese', 'rovid', vagy 'ismeretlen'. */
function celSzekcio(sor: string): 'mese' | 'rovid' | 'ismeretlen' {
  const m = sorMufaja(sor);
  if (m === null) return 'ismeretlen';
  return MESE_MUFAJOK.has(m) ? 'mese' : 'rovid';
}

/** Egy fejléchez tartozó szakasz utolsó sorának indexe (a fejléc utáni sorok vége). */
function szakaszVege(sorok: string[], fejlecIndex: number): number {
  let i = fejlecIndex + 1;
  while (i < sorok.length && !fejlecE(sorok[i])) i++;
  return i; // ide kell beszúrni (a következő fejléc elé, vagy a lista végére)
}

/**
 * Beszúrja az új javaslatokat a meglévő sorok közé.
 *
 * @param meglevo  a terület jelenlegi sorai (üres sorok nélkül)
 * @param ujak     a hozzáadandó javaslatok, a panel sorrendjében
 * @returns        az új sorlista
 */
export function irodalmatBeszur(meglevo: string[], ujak: string[]): string[] {
  if (ujak.length === 0) return [...meglevo];

  const sorok = [...meglevo];
  const vanFejlec = sorok.some(fejlecE);

  // Fejlécek nélküli, szabadon írt szöveghez nem nyúlunk hozzá: a végére fűzünk,
  // de az új sorokat műfaj szerint rendezzük (előbb a rövidek, aztán a mesék).
  if (!vanFejlec) {
    const rovid = ujak.filter((s) => celSzekcio(s) === 'rovid');
    const mesek = ujak.filter((s) => celSzekcio(s) === 'mese');
    const egyeb = ujak.filter((s) => celSzekcio(s) === 'ismeretlen');
    return [...sorok, ...rovid, ...mesek, ...egyeb].map((s) =>
      meglevo.includes(s) ? s : cimkeNelkul(s),
    );
  }

  for (const nyers of ujak) {
    const cel = celSzekcio(nyers);
    // A besoroláshoz kell a címke, a tervbe már címke nélkül kerül be.
    const uj = cimkeNelkul(nyers);
    if (cel === 'ismeretlen') {
      sorok.push(uj);
      continue;
    }

    const keresett = cel === 'mese' ? FEJLEC_MESE : FEJLEC_ROVID;
    const fejlecIndex = sorok.findIndex((s) => s.trim() === keresett);

    if (fejlecIndex >= 0) {
      sorok.splice(szakaszVege(sorok, fejlecIndex), 0, uj);
      continue;
    }

    // Nincs még ilyen szekció — létrehozzuk a helyes helyen.
    if (cel === 'mese') {
      // A mesék a felsorolás végére kerülnek.
      sorok.push(FEJLEC_MESE, uj);
    } else {
      // A mondókák/versek a mesék elé; ha nincs mese-szekció, a lista elejére.
      const meseIndex = sorok.findIndex((s) => s.trim() === FEJLEC_MESE);
      const hova = meseIndex >= 0 ? meseIndex : sorok.length;
      sorok.splice(hova, 0, FEJLEC_ROVID, uj);
    }
  }

  return sorok;
}
