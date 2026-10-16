import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// The UI is built to static files and served by the local service (same origin, so the
// Host/Origin/token checks apply unchanged). No CDN: everything ships inside the app.
export default defineConfig({
  root: resolve(__dirname, 'src/ui'),
  base: './',
  plugins: [react()],
  build: { outDir: resolve(__dirname, 'dist/ui'), emptyOutDir: true, sourcemap: true, chunkSizeWarningLimit: 2000 },
});
