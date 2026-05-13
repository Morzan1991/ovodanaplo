/**
 * Unit tesztek a `lib/utils.ts` pure függvényeire (TODO-14 Stage A).
 */
import { describe, expect, it } from 'vitest';
import {
  formatDatumHu,
  formatRovidDatumHu,
  hetKezdoDatuma,
  hetTartomany,
  nevelesiEvCimke,
  vanAdatvedelmiKockazat,
} from './utils';

describe('formatDatumHu', () => {
  it('formázza az ISO-dátumot magyar hosszú formára', () => {
    const eredmeny = formatDatumHu('2026-09-15');
    expect(eredmeny).toMatch(/2026/);
    expect(eredmeny).toMatch(/szeptember|szept/i);
    expect(eredmeny).toMatch(/15/);
  });
});

describe('formatRovidDatumHu', () => {
  it('rövid formára formázza a dátumot', () => {
    const eredmeny = formatRovidDatumHu('2026-04-23');
    // pl. "ápr 23." — a hu-HU short formátum
    expect(eredmeny).toMatch(/23/);
  });
});

describe('hetKezdoDatuma', () => {
  it('a hétfőt adja vissza ha közepén vagyunk', () => {
    // 2026-09-16 (szerda) → 2026-09-14 (hétfő)
    expect(hetKezdoDatuma('2026-09-16')).toBe('2026-09-14');
  });

  it('hétfő esetén ugyanaz marad', () => {
    expect(hetKezdoDatuma('2026-09-14')).toBe('2026-09-14');
  });

  it('vasárnap esetén az előző hétfőre megy', () => {
    // 2026-09-20 (vasárnap) → 2026-09-14 (hétfő)
    expect(hetKezdoDatuma('2026-09-20')).toBe('2026-09-14');
  });
});

describe('hetTartomany', () => {
  it('hétfő-péntek tartományt ad', () => {
    const t = hetTartomany('2026-09-14');
    expect(t.kezdo).toBe('2026-09-14');
    expect(t.zaro).toBe('2026-09-18');
    expect(t.label).toMatch(/14/);
    expect(t.label).toMatch(/18/);
  });
});

describe('nevelesiEvCimke', () => {
  it('a kezdő évhez a következőt is hozzáfűzi', () => {
    expect(nevelesiEvCimke(2026)).toBe('2026/2027');
  });
  it('1999-es esetén 1999/2000', () => {
    expect(nevelesiEvCimke(1999)).toBe('1999/2000');
  });
});

describe('vanAdatvedelmiKockazat', () => {
  it('üres szövegre false', () => {
    expect(vanAdatvedelmiKockazat('')).toBe(false);
  });

  it('SNI rövidítésre true', () => {
    expect(vanAdatvedelmiKockazat('A csoportban van egy SNI-s gyermek.')).toBe(true);
  });

  it('BTMN rövidítésre true', () => {
    expect(vanAdatvedelmiKockazat('A BTMN diagnózist a szakszolgálat állította ki.')).toBe(true);
  });

  it('"egy kisfiú" kifejezésre true', () => {
    expect(vanAdatvedelmiKockazat('Egy kisfiú nem tudta a versikét.')).toBe(true);
  });

  it('"egy kislány" kifejezésre true', () => {
    expect(vanAdatvedelmiKockazat('Egy kislány izgatottan várta a foglalkozást.')).toBe(true);
  });

  it('beszédprobléma említésére true', () => {
    expect(vanAdatvedelmiKockazat('A logopédus szerint beszédproblémája van.')).toBe(true);
  });

  it('"sajátos nevelési igény" kifejezésre true', () => {
    expect(
      vanAdatvedelmiKockazat('A sajátos nevelési igény miatt egyéni gyakorlatot tervezek.'),
    ).toBe(true);
  });

  it('ártalmatlan szövegre false', () => {
    expect(
      vanAdatvedelmiKockazat('A héten Mikulás-jellegű ének-zenei foglalkozásokat tartottunk.'),
    ).toBe(false);
  });

  it('"diagnoszt" prefixre true (diagnosztikai, diagnózis stb.)', () => {
    expect(vanAdatvedelmiKockazat('A diagnosztikai eljárás során fény derült rá.')).toBe(true);
  });
});
