import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const copyStandaloneAssets = (): Plugin => ({
  name: 'copy-standalone-assets',
  closeBundle() {
    const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
    const outputDir = fileURLToPath(new URL('./dist/', import.meta.url));
    mkdirSync(outputDir, { recursive: true });
    const standaloneFiles = readdirSync(publicDir).filter(
      (filename) => filename.endsWith('.html') || filename.endsWith('.js') || filename === '_redirects',
    );
    for (const filename of standaloneFiles) {
      copyFileSync(`${publicDir}${filename}`, `${outputDir}${filename}`);
    }
    for (const filename of standaloneFiles) {
      if (!existsSync(`${outputDir}${filename}`)) {
        throw new Error(`Standalone asset was not copied to the production output: ${filename}`);
      }
    }
  },
});

export default defineConfig({
  base: './',
  plugins: [react(), copyStandaloneAssets()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['lucide-react', '@supabase/supabase-js'],
  },
});
