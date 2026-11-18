import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5199,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
