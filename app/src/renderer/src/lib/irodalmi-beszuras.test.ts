import { describe, it, expect } from 'vitest';
import { cimkeNelkul, irodalmatBeszur, sorMufaja } from './irodalmi-beszuras';

describe('sorMufaja', () => {
  it('felismeri a műfajt a sor végi zárójelből', () => {
    expect(sorMufaja('Weöres Sándor: Galagonya (vers)')).toBe('vers');
    expect(sorMufaja('A kismalac és a farkasok (népmese) — őszi éléskamra')).toBe('népmese');
    expect(sorMufaja('Egy, megérett a meggy (mondóka)')).toBe('mondóka');
  });

  it('a címben lévő zárójel nem téveszti meg', () => {
    expect(sorMufaja('Devecseri Gábor: Bárány Boldizsár (részlet) (vers)')).toBe('vers');
  });

  it('null, ha nincs műfaj-jelölés', () => {
    expect(sorMufaja('Saját ötlet: almaszedés az udvaron')).toBeNull();
    // az ének-zene műfajai ide nem tartoznak
    expect(sorMufaja('Érik a szőlő (dal)')).toBeNull();
  });
});

describe('cimkeNelkul', () => {
  it('leveszi a műfaj-címkét', () => {
    expect(cimkeNelkul('Weöres Sándor: Galagonya (vers)')).toBe('Weöres Sándor: Galagonya');
    expect(cimkeNelkul('Érik a szőlő (dal) — szüreti játék')).toBe('Érik a szőlő — szüreti játék');
  });

  it('a NÉPMESE jelölése marad — az tartalmi információ', () => {
    expect(cimkeNelkul('A répa (népmese)')).toBe('A répa (népmese)');
    expect(cimkeNelkul('Szutyejev: Az alma (mese)')).toBe('Szutyejev: Az alma');
  });

  it('a címben lévő zárójelhez nem nyúl', () => {
    expect(cimkeNelkul('Antonio Vivaldi: A négy évszak — Ősz (részlet) (zenehallgatás)')).toBe(
      'Antonio Vivaldi: A négy évszak — Ősz (részlet)',
    );
  });
});

describe('irodalmatBeszur', () => {
  const alap = [
    'Mondókák, versek:',
    'Egy, megérett a meggy',
    'Weöres Sándor: Galagonya',
    'Mesék:',
    'Szutyejev: Az alma',
  ];

  it('a mesét a Mesék szekcióba teszi, nem a végére', () => {
    const eredmeny = irodalmatBeszur(alap, ['A kismalac és a farkasok (népmese)']);
    expect(eredmeny).toEqual([
      'Mondókák, versek:',
      'Egy, megérett a meggy',
      'Weöres Sándor: Galagonya',
      'Mesék:',
      'Szutyejev: Az alma',
      'A kismalac és a farkasok (népmese)',
    ]);
  });

  it('a beszúrt sorról leveszi a műfaj-címkét', () => {
    const eredmeny = irodalmatBeszur(alap, ['Gazdag Erzsi: Itt van az ősz (vers)']);
    expect(eredmeny[3]).toBe('Gazdag Erzsi: Itt van az ősz');
    expect(eredmeny[4]).toBe('Mesék:');
  });

  it('létrehozza a Mesék szekciót, ha még nincs', () => {
    const csakVersek = ['Mondókák, versek:', 'Egy, megérett a meggy'];
    expect(irodalmatBeszur(csakVersek, ['Szutyejev: Az alma (mese)'])).toEqual([
      'Mondókák, versek:',
      'Egy, megérett a meggy',
      'Mesék:',
      'Szutyejev: Az alma',
    ]);
  });

  it('a mondókák szekciót a mesék elé hozza létre', () => {
    const csakMesek = ['Mesék:', 'Szutyejev: Az alma'];
    expect(irodalmatBeszur(csakMesek, ['Egy, megérett a meggy (mondóka)'])).toEqual([
      'Mondókák, versek:',
      'Egy, megérett a meggy',
      'Mesék:',
      'Szutyejev: Az alma',
    ]);
  });

  it('fejlécek nélküli saját szöveget nem szervez át, csak a végére fűz', () => {
    const sajat = ['Almaszedés az udvaron', 'Beszélgetés a piacról'];
    expect(
      irodalmatBeszur(sajat, ['Szutyejev: Az alma (mese)', 'Egy, megérett a meggy (mondóka)']),
    ).toEqual([
      'Almaszedés az udvaron',
      'Beszélgetés a piacról',
      // az újakat műfaj szerint csoportosítja: előbb a rövidek, aztán a mesék
      'Egy, megérett a meggy',
      'Szutyejev: Az alma',
    ]);
  });

  it('a saját, kézzel írt sorokat nem írja át', () => {
    // A pedagógus szövegében egy zárójeles szó nem műfaj-címke.
    const sajat = ['Beszélgetés a piacról (nagycsoport)'];
    expect(irodalmatBeszur(sajat, ['A répa (népmese)'])).toEqual([
      'Beszélgetés a piacról (nagycsoport)',
      'A répa (népmese)',
    ]);
  });

  it('a műfaj nélküli sort változatlanul a végére teszi', () => {
    expect(irodalmatBeszur(alap, ['Saját ötlet: almás beszélgetés']).at(-1)).toBe(
      'Saját ötlet: almás beszélgetés',
    );
  });

  it('több sort egyszerre is a helyére tesz', () => {
    const eredmeny = irodalmatBeszur(alap, ['Erre csörög a dió (mondóka)', 'A répa (népmese)']);
    expect(eredmeny.indexOf('Erre csörög a dió')).toBeLessThan(eredmeny.indexOf('Mesék:'));
    expect(eredmeny.at(-1)).toBe('A répa (népmese)');
  });

  it('üres kiválasztásnál nem változtat', () => {
    expect(irodalmatBeszur(alap, [])).toEqual(alap);
  });
});
