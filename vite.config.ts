import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://store-cherrys.onrender.com',
        changeOrigin: true,
        headers: { Origin: 'https://store-cherrys.onrender.com' },
      },
    },
  },
});
