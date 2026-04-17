import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "https://34.87.165.191/",
        changeOrigin: true,
        secure: false,
        // Disable proxy buffering so SSE events flush immediately
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Tell Vite's http-proxy (and any upstream nginx) not to buffer
            proxyRes.headers['x-accel-buffering'] = 'no';
            proxyRes.headers['cache-control'] = 'no-cache';
          });
        },
      },
    },
  },

})
