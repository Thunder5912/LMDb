import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Generic image proxy: serves any remote image same-origin so the browser and
// html2canvas can use it without CORS taint (used for posters in share images).
function imgProxy() {
  return {
    target: 'https://m.media-amazon.com',
    changeOrigin: true,
    secure: true,
    router: (req: any) => {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const target = parsed.searchParams.get('u');
        if (target) return new URL(target).origin;
      } catch {
        /* ignore */
      }
      return 'https://m.media-amazon.com';
    },
    rewrite: (path: string) => {
      try {
        const parsed = new URL(path, 'http://localhost');
        const target = parsed.searchParams.get('u');
        if (target) {
          const u = new URL(target);
          return u.pathname + u.search;
        }
      } catch {
        /* ignore */
      }
      return path;
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/omdb': {
        target: 'https://www.omdbapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/omdb/, ''),
      },
      '/img': imgProxy(),
      '/api/omdb': {
        target: 'https://www.omdbapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/omdb/, ''),
      },
      '/api/img': imgProxy(),
      '/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tmdb/, ''),
      },
      '/api/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/omdb': {
        target: 'https://www.omdbapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/omdb/, ''),
      },
      '/img': imgProxy(),
      '/api/omdb': {
        target: 'https://www.omdbapi.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/omdb/, ''),
      },
      '/api/img': imgProxy(),
      '/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/tmdb/, ''),
      },
      '/api/tmdb': {
        target: 'https://api.themoviedb.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/tmdb/, ''),
      },
    },
  },
});
