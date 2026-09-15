import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AllapotSzolgaltato } from './lib/allapot';
import './index.css';

// HashRouter kell: a Capacitor a fájlrendszerről tölti a webnézetet, ott a
// böngésző History API-ja szerinti útvonalak nem oldódnának fel újratöltéskor.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AllapotSzolgaltato>
      <HashRouter>
        <App />
      </HashRouter>
    </AllapotSzolgaltato>
  </StrictMode>,
);
