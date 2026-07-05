import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'assets/images/*',
          dest: 'assets/images'
        }
      ]
    })
  ],
  css: {
    transformer: 'lightningcss',
  },
  build: {
    cssMinify: 'lightningcss',
    target: 'es2020',
  },
});
