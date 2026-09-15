/**
 * A felhasználó saját beállításai: a csoport korosztálya és a kedvencek.
 *
 * Ez az EGYETLEN adat, amit a program a telefonon tárol — és a telefonon is
 * marad. Nincs fiók, nincs szerver, nincs analitika; a bolti adatbiztonsági
 * nyilatkozat emiatt lehet „nem gyűjt adatot”.
 *
 * Tárolás: Capacitor Preferences (natív), böngészőben localStorage — így a
 * fejlesztés a gépen és a futás a telefonon ugyanazt a kódot használja.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { Korcsoport } from './tartalom';

const KULCS_KORCSOPORT = 'korcsoport';
const KULCS_KEDVENCEK = 'kedvencek';

async function ment(kulcs: string, ertek: string): Promise<void> {
  try {
    await Preferences.set({ key: kulcs, value: ertek });
  } catch {
    // Böngészőben a natív réteg hiányzik — ilyenkor a localStorage a tartalék.
    try {
      window.localStorage.setItem(kulcs, ertek);
    } catch {
      /* privát ablak vagy letiltott tárolás: ilyenkor csak a munkamenetre marad */
    }
  }
}

async function olvas(kulcs: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key: kulcs });
    if (value !== null && value !== undefined) return value;
  } catch {
    /* natív réteg nélkül a localStorage jön */
  }
  try {
    return window.localStorage.getItem(kulcs);
  } catch {
    return null;
  }
}

interface AllapotErtek {
  korcsoport: Korcsoport;
  korcsoportValt: (uj: Korcsoport) => void;
  /** Kedvenc javaslatok — a teljes sor a kulcs, mert az egyedi és beszédes. */
  kedvencek: string[];
  kedvencE: (sor: string) => boolean;
  kedvencValt: (sor: string) => void;
  betoltve: boolean;
}

const Allapot = createContext<AllapotErtek | null>(null);

export function AllapotSzolgaltato({ children }: { children: ReactNode }) {
  const [korcsoport, setKorcsoport] = useState<Korcsoport>('vegyes');
  const [kedvencek, setKedvencek] = useState<string[]>([]);
  const [betoltve, setBetoltve] = useState(false);

  useEffect(() => {
    let ervenyes = true;
    void (async () => {
      const [kor, kedv] = await Promise.all([olvas(KULCS_KORCSOPORT), olvas(KULCS_KEDVENCEK)]);
      if (!ervenyes) return;
      if (kor === 'kicsi' || kor === 'kozepso' || kor === 'nagy' || kor === 'vegyes') {
        setKorcsoport(kor);
      }
      if (kedv) {
        try {
          const lista = JSON.parse(kedv);
          if (Array.isArray(lista)) setKedvencek(lista.filter((x) => typeof x === 'string'));
        } catch {
          /* sérült tartalom: inkább üres lista, mint összeomlás */
        }
      }
      setBetoltve(true);
    })();
    return () => {
      ervenyes = false;
    };
  }, []);

  const ertek = useMemo<AllapotErtek>(
    () => ({
      korcsoport,
      korcsoportValt: (uj) => {
        setKorcsoport(uj);
        void ment(KULCS_KORCSOPORT, uj);
      },
      kedvencek,
      kedvencE: (sor) => kedvencek.includes(sor),
      kedvencValt: (sor) => {
        setKedvencek((elozo) => {
          const uj = elozo.includes(sor) ? elozo.filter((x) => x !== sor) : [...elozo, sor];
          void ment(KULCS_KEDVENCEK, JSON.stringify(uj));
          return uj;
        });
      },
      betoltve,
    }),
    [korcsoport, kedvencek, betoltve],
  );

  return <Allapot.Provider value={ertek}>{children}</Allapot.Provider>;
}

export function useAllapot(): AllapotErtek {
  const ertek = useContext(Allapot);
  if (!ertek) throw new Error('useAllapot csak az AllapotSzolgaltato alatt használható');
  return ertek;
}
