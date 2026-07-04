import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    transformer: 'lightningcss',
  },
  build: {
    cssMinify: 'lightningcss',
    target: 'es2020',
  },
});
