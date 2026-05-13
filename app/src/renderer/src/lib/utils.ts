import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ISO date -> "2026. április 13." */
export function formatDatumHu(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** ISO date -> "ápr 13" */
export function formatRovidDatumHu(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
}

/** Adott ISO dátumhoz a hetet adja (hétfő-vasárnap) ISO formátumban. */
export function hetKezdoDatuma(iso: string): string {
  const d = new Date(iso);
  const nap = d.getDay() || 7; // 1..7, vasárnap = 7
  d.setDate(d.getDate() - (nap - 1));
  return d.toISOString().split('T')[0];
}

/** Heti tervhez tartozó dátumtartomány. */
export function hetTartomany(kezdo: string): { kezdo: string; zaro: string; label: string } {
  const k = new Date(kezdo);
  const z = new Date(k);
  z.setDate(z.getDate() + 4); // hétfő..péntek
  return {
    kezdo: k.toISOString().split('T')[0],
    zaro: z.toISOString().split('T')[0],
    label: `${formatRovidDatumHu(k.toISOString())} — ${formatRovidDatumHu(z.toISOString())}`,
  };
}

/** Évszámból nevelési-év címke: 2026 → "2026/2027" */
export function nevelesiEvCimke(kezdoEv: number): string {
  return `${kezdoEv}/${kezdoEv + 1}`;
}

/**
 * Adatvédelmi figyelmeztető — kvázi-azonosító mintázatokat keres.
 * Csak figyelmeztetés, nem tilt.
 */
const ADATVEDELMI_MINTAK = [
  /\bSNI\b/,
  /\bBTMN\b/,
  /sajátos nevelési igény/i,
  /beszédprobléma/i,
  /\begy kisfiú\b/i,
  /\begy kislány\b/i,
  /\baz egyik gyermek\b/i,
  /diagnoszt/i,
  /betegsége/i,
];

export function vanAdatvedelmiKockazat(szoveg: string): boolean {
  return ADATVEDELMI_MINTAK.some((minta) => minta.test(szoveg));
}
