/**
 * HibaHatar — React error boundary.
 *
 * Enélkül egyetlen komponens-hiba az egész felületet fehér képernyővé teszi, és a
 * pedagógus nem tudja, mi történt és mit tegyen. Itt elkapjuk, elmagyarázzuk
 * magyarul, és felajánljuk az újratöltést — az adat a lemezen sértetlen marad.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hiba: Error | null;
}

export default class HibaHatar extends Component<Props, State> {
  state: State = { hiba: null };

  static getDerivedStateFromError(hiba: Error): State {
    return { hiba };
  }

  componentDidCatch(hiba: Error, info: ErrorInfo): void {
    // A főprocesz konzoljába is kiírjuk, hogy hibakereséskor meglegyen.
    console.error('[HibaHatar] Váratlan hiba a felületen:', hiba, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hiba) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#FAF7F2]">
        <div className="max-w-lg w-full card text-center">
          <div className="text-4xl mb-3" aria-hidden="true">
            🌸
          </div>
          <h1 className="heading-serif text-2xl font-medium mb-2">
            Hopp, valami elakadt
          </h1>
          <p className="text-sm text-ink/70 mb-1">
            A program egy váratlan hibába futott, de <strong>az adataid biztonságban vannak</strong> —
            minden mentett munka a helyén marad.
          </p>
          <p className="text-sm text-ink/70 mb-5">
            Töltsd újra az ablakot, és folytathatod ott, ahol abbahagytad.
          </p>

          <button onClick={() => window.location.reload()} className="btn-primary">
            Újratöltés
          </button>

          <details className="mt-5 text-left">
            <summary className="text-xs text-ink/50 cursor-pointer hover:underline">
              Technikai részletek (ha jelezni szeretnéd a hibát)
            </summary>
            <pre className="mt-2 text-[11px] bg-ink/5 rounded p-3 overflow-x-auto whitespace-pre-wrap">
              {this.state.hiba.name}: {this.state.hiba.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
