/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { publicAssets } from './build/public-assets-plugin.ts';
import { siteMeta } from './build/site-meta-plugin.ts';
import { siteUrl } from './build/site-url-plugin.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), publicAssets(), siteUrl(), siteMeta()],
  // Same port as the SITE_URL fallback, so local share-tag URLs point at the running server.
  server: { port: 5180 },
  preview: { port: 5180 },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
});
