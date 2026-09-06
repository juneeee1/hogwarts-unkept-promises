import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base:'./',
  plugins:[react()],
  resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
  css:{postcss:{plugins:[tailwindcss()]}},
  build:{outDir:'dist-storvia',target:'es2020',assetsInlineLimit:4096},
});
