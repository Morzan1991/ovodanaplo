/**
 * Induláskori kulcsdöntés és a bekért kulcs kipróbálása — lásd `kulcsdontes.ts`.
 *
 * A két régi hiba, amit őriz (Windows-újratelepítés vagy profilsérülés után
 * visszamásolt, titkosított napló):
 *   1. hiányzó `kulcs.dat` mellett új kulcs készült, és az került a `kulcs.dat`-ba;
 *   2. vissza nem fejthető `kulcs.dat` mellett a napló kulcs nélkül nyílt.
 * Mindkettőnél a helyes válasz: a visszaállítási kulcs bekérése.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  bekertKulcsProba,
  nyitasiDontes,
  type NyitasiHelyzet,
  type TaroltKulcs,
} from './kulcsdontes.js';
import { kulcsFormazott } from './kulcsszoveg.js';

const KULCS = '0123456789abcdef'.repeat(4);
const MASIK_KULCS = 'fedcba9876543210'.repeat(4);

const NINCS: TaroltKulcs = { allapot: 'nincs' };
const OLVASHATATLAN: TaroltKulcs = {
  allapot: 'olvashatatlan',
  ok: 'Error while decrypting the ciphertext provided to safeStorage.decryptString.',
};
const VAN: TaroltKulcs = { allapot: 'van', kulcs: KULCS };

/** Kiindulás: rendes indítás egy használatban lévő gépen. */
function helyzet(elteres: Partial<NyitasiHelyzet>): NyitasiHelyzet {
  return {
    dbLetezik: true,
    dbTitkositatlan: false,
    vedelemElerheto: true,
    taroltKulcs: VAN,
    taroltKulcsNyitja: true,
    ...elteres,
  };
}

describe('induláskori kulcsdöntés', () => {
  it('rendes indításnál a tárolt kulccsal nyit', () => {
    expect(nyitasiDontes(helyzet({}))).toEqual({ tipus: 'tarolt-kulcs', kulcs: KULCS });
  });

  it('új telepítésnél új kulcsot készít', () => {
    const uj = helyzet({ dbLetezik: false, taroltKulcs: NINCS, taroltKulcsNyitja: false });
    expect(nyitasiDontes(uj)).toEqual({ tipus: 'uj-kulcs' });
  });

  describe('meglévő, titkosított napló, használható kulcs nélkül → bekéri a visszaállítási kulcsot', () => {
    it('1. hiba: hiányzik a kulcs.dat — nem készít új kulcsot', () => {
      const h = helyzet({ taroltKulcs: NINCS, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({
        tipus: 'kulcs-bekeres',
        ok: 'nincs-tarolt-kulcs',
        mentheto: true,
      });
    });

    it('2. hiba: a kulcs.dat ebben a Windows-fiókban nem fejthető vissza — nem nyit kulcs nélkül', () => {
      const h = helyzet({ taroltKulcs: OLVASHATATLAN, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({
        tipus: 'kulcs-bekeres',
        ok: 'olvashatatlan-tarolt-kulcs',
        mentheto: true,
      });
    });

    it('a kulcs.dat egy másik naplóé — pl. a régi, hibás indítás írt bele új kulcsot', () => {
      const h = helyzet({ taroltKulcs: { allapot: 'van', kulcs: MASIK_KULCS }, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({
        tipus: 'kulcs-bekeres',
        ok: 'mas-naplo-kulcsa',
        mentheto: true,
      });
    });

    it('Windows-védelem nélkül is bekéri — csak eltárolni nem tudja majd', () => {
      const h = helyzet({ vedelemElerheto: false, taroltKulcs: OLVASHATATLAN, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({
        tipus: 'kulcs-bekeres',
        ok: 'olvashatatlan-tarolt-kulcs',
        mentheto: false,
      });
    });
  });

  it('titkosított naplóhoz soha nem generál új kulcsot, és kulcs nélkül sem nyitja — egyik esetben sem', () => {
    const taroltak: TaroltKulcs[] = [NINCS, OLVASHATATLAN, VAN, { allapot: 'van', kulcs: MASIK_KULCS }];
    for (const taroltKulcs of taroltak) {
      for (const taroltKulcsNyitja of [true, false]) {
        for (const vedelemElerheto of [true, false]) {
          const tenyek = { dbLetezik: true, dbTitkositatlan: false, vedelemElerheto, taroltKulcs, taroltKulcsNyitja };
          const dontes = nyitasiDontes(tenyek);
          expect(['tarolt-kulcs', 'kulcs-bekeres'], JSON.stringify(tenyek)).toContain(dontes.tipus);
        }
      }
    }
  });

  describe('titkosítatlan napló (a titkosítás előtti verzióból)', () => {
    it('tárolt kulcs nélkül új kulccsal titkosítja', () => {
      const h = helyzet({ dbTitkositatlan: true, taroltKulcs: NINCS, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'uj-kulcs' });
    });

    it('meglévő tárolt kulccsal azzal titkosítja', () => {
      const h = helyzet({ dbTitkositatlan: true, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'tarolt-kulcs', kulcs: KULCS });
    });
  });

  describe('nincs adatbázis', () => {
    it('a megmaradt tárolt kulcsot használja újra', () => {
      const h = helyzet({ dbLetezik: false, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'tarolt-kulcs', kulcs: KULCS });
    });

    it('olvashatatlan kulcs.dat mellett új kulcsot készít — nincs titkosított adat, amihez a régi kellene', () => {
      const h = helyzet({ dbLetezik: false, taroltKulcs: OLVASHATATLAN, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'uj-kulcs' });
    });
  });

  describe('Windows-védelem nélkül', () => {
    it('új telepítésnél titkosítás nélkül indul', () => {
      const h = helyzet({ dbLetezik: false, vedelemElerheto: false, taroltKulcs: NINCS, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'titkositas-nelkul' });
    });

    it('titkosítatlan naplóval titkosítás nélkül indul', () => {
      const h = helyzet({ dbTitkositatlan: true, vedelemElerheto: false, taroltKulcs: NINCS, taroltKulcsNyitja: false });
      expect(nyitasiDontes(h)).toEqual({ tipus: 'titkositas-nelkul' });
    });
  });
});

describe('a bekért visszaállítási kulcs kipróbálása', () => {
  /** A próba csak a `nyitoKulcs`-ra sikerül; a kiírás figyelt. */
  function muveletek(nyitoKulcs = KULCS) {
    return {
      nyitja: vi.fn((kulcs: string) => kulcs === nyitoKulcs),
      kiir: vi.fn((_kulcs: string) => undefined),
    };
  }

  it('a papírról begépelt kulcsot elfogadja, és a nyers alakot tárolja el', () => {
    const m = muveletek();
    expect(bekertKulcsProba(kulcsFormazott(KULCS), m)).toEqual({
      tipus: 'elfogadva',
      kulcs: KULCS,
      mentesiHiba: null,
    });
    expect(m.nyitja).toHaveBeenCalledWith(KULCS);
    expect(m.kiir).toHaveBeenCalledTimes(1);
    expect(m.kiir).toHaveBeenCalledWith(KULCS);
  });

  it('kisbetűvel, szóközökkel, gondolatjellel beírva is elfogadja', () => {
    const bevitel = ` ${kulcsFormazott(KULCS).toLowerCase().replace(/-/g, ' – ')}\n`;
    expect(bekertKulcsProba(bevitel, muveletek()).tipus).toBe('elfogadva');
  });

  it('rossz kulcsnál semmit nem ír', () => {
    const m = muveletek();
    expect(bekertKulcsProba(kulcsFormazott(MASIK_KULCS), m)).toEqual({ tipus: 'nem-nyitja' });
    expect(m.nyitja).toHaveBeenCalledWith(MASIK_KULCS);
    expect(m.kiir).not.toHaveBeenCalled();
  });

  it('formailag hibás bevitelnél az adatbázist meg sem próbálja', () => {
    const m = muveletek();
    const eredmeny = bekertKulcsProba(kulcsFormazott(KULCS).slice(0, -1), m);
    expect(eredmeny.tipus).toBe('hibas-bevitel');
    expect(m.nyitja).not.toHaveBeenCalled();
    expect(m.kiir).not.toHaveBeenCalled();
  });

  it('ha a próba nem a kulcs miatt bukik el, nem mondja rossznak a kulcsot, és nem ír', () => {
    const m = {
      nyitja: vi.fn((_kulcs: string): boolean => {
        throw new Error('database is locked');
      }),
      kiir: vi.fn((_kulcs: string) => undefined),
    };
    expect(bekertKulcsProba(kulcsFormazott(KULCS), m)).toEqual({
      tipus: 'probahiba',
      uzenet: 'database is locked',
    });
    expect(m.kiir).not.toHaveBeenCalled();
  });

  it('Windows-védelem nélkül elfogadja, de jelzi, hogy nem tárolta el', () => {
    const eredmeny = bekertKulcsProba(kulcsFormazott(KULCS), { nyitja: () => true, kiir: null });
    expect(eredmeny).toMatchObject({ tipus: 'elfogadva', kulcs: KULCS });
    expect(eredmeny.tipus === 'elfogadva' && eredmeny.mentesiHiba).toBeTruthy();
  });

  it('ha a tárolás elhasal, a kulcs attól még jó — a napló megnyitható, a hiba jelezve', () => {
    const m = {
      nyitja: () => true,
      kiir: () => {
        throw new Error('EPERM: operation not permitted');
      },
    };
    expect(bekertKulcsProba(kulcsFormazott(KULCS), m)).toEqual({
      tipus: 'elfogadva',
      kulcs: KULCS,
      mentesiHiba: 'EPERM: operation not permitted',
    });
  });
});
