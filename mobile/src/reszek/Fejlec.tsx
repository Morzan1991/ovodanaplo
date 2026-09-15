/**
 * Egységes képernyő-fejléc, opcionális visszalépéssel.
 *
 * Az alcím lehet kattintható: a korosztály itt látszik, és innen egy koppintással
 * el lehet jutni a beállításokhoz. Így nem kell külön korcsoport-sávot tenni
 * minden képernyő tetejére — az információ egy helyen van, mégis kéznél.
 */

import { Link, useNavigate } from 'react-router-dom';

export default function Fejlec({
  cim,
  alcim,
  alcimUt,
  vissza = false,
}: {
  cim: string;
  alcim?: string;
  /** Ha meg van adva, az alcím ide vezető kapocs lesz. */
  alcimUt?: string;
  vissza?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header className="biztonsagos-felul sticky top-0 z-10 border-b border-rozsa-200 bg-cream/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2">
        {vissza && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Vissza"
            className="erintheto justify-center w-9 -ml-1 text-rozsa-700 text-xl"
          >
            ‹
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-serif text-lg leading-tight text-rozsa-700 truncate">{cim}</h1>
          {alcim &&
            (alcimUt ? (
              <Link
                to={alcimUt}
                className="inline-flex items-center gap-1 text-xs text-rozsa-700/80 underline decoration-rozsa-300 underline-offset-2"
              >
                {alcim}
                <span aria-hidden>›</span>
              </Link>
            ) : (
              <p className="text-xs text-ink/60 truncate">{alcim}</p>
            ))}
        </div>
      </div>
    </header>
  );
}
