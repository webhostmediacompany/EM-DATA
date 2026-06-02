import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Safely load package.json for ESM environment
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Check if building in standalone mode (Vercel, Netlify, gh-pages via --mode standalone, or environment overrides)
  const isStandalone =
    mode === 'standalone' ||
    process.env.VITE_STANDALONE === 'true' ||
    process.env.VERCEL === 'true' ||
    process.env.NETLIFY === 'true' ||
    process.env.GITHUB_ACTIONS === 'true';

  // Base path resolution:
  // - Django mode: uses "/static/frontend/"
  // - Standalone mode (gh-pages, Vercel, etc.) & Development mode: dynamically extracts path from package.json homepage
  let base = '/static/frontend/';
  if (isStandalone || mode === 'development') {
    if (mode === 'development') {
      base = '/';
    } else if (pkg.homepage) {
      try {
        const url = new URL(pkg.homepage);
        // Extracts path prefix (e.g. "/E.M-Analysis-data/") and ensures trailing slash
        base = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
      } catch (e) {
        base = '/';
      }
    } else {
      base = '/';
    }
  }

  return {
    base: base,
    plugins: [react()],

    // Development proxy server acting as a bridge to Django backend on port 8081
    server: {
      proxy: {
        // Proxy HTTP API requests to Django
        '/api': {
          target: 'http://127.0.0.1:8081',
          changeOrigin: true,
          secure: false,
        },
        // Proxy WebSocket streams to Django Channels
        '/ws': {
          target: 'ws://127.0.0.1:8081',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      // Build standalone/development into dist, otherwise build into Django static directory
      outDir: (isStandalone || mode === 'development') ? 'dist' : '../static/frontend',
      emptyOutDir: true,
      // Standalone needs hashed assets and standard rollup config for caching;
      // Django-integrated build requires static file naming for template mapping.
      rollupOptions: isStandalone ? {} : {
        output: {
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  }
})
