import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import HibaHatar from './components/HibaHatar';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HibaHatar>
      <HashRouter>
        <App />
      </HashRouter>
    </HibaHatar>
  </React.StrictMode>,
);
