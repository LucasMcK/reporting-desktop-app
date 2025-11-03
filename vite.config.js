import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        dashboard: path.resolve(__dirname, 'dashboard.html'),
        login: path.resolve(__dirname, 'login.html'),
        signup: path.resolve(__dirname, 'signup.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
