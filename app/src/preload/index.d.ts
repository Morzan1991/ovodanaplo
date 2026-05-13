import type { OvodaNaploApi } from './index';

declare global {
  interface Window {
    api: OvodaNaploApi;
  }
}

export {};
