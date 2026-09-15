import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A Capacitor a `dist` mappából tölti a webnézetet, relatív útvonalakkal.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
  server: { host: true, port: 5180 },
});
