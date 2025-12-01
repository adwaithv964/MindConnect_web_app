import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: "MindConnect",
        name: "MindConnect",
        icons: [
          {
            src: "/mind-map.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          },
          {
            src: "/mind-map.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/mind-map.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        start_url: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff"
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 4000000,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new', 'localhost', '127.0.0.1'],
    hmr: {
      clientPort: 4028,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});