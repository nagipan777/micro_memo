import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  https: {
    key: '/path/to/localhost.key',
    cert: '/path/to/localhost.crt',
  },
  proxy: {
    '/api': {
      target: 'https://api.notion.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
});
