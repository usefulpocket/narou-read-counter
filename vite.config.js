import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import copy from 'rollup-plugin-copy';

export default defineConfig({
  root: './options-src',
  base: '/options',
  build: {
    outDir: '../options',
    emptyOutDir: true,
    sourcemap: true,
    watch: {
      include: 'options-src/**'
    },
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  plugins: [
    svelte(),
    copy({
      targets: [
        { src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'lib' },
        { src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'lib' },
        { src: 'node_modules/milligram/dist/milligram.min.css', dest: 'lib' },
        { src: 'node_modules/milligram/dist/milligram.min.css.map', dest: 'lib' },
        { src: 'node_modules/idb/build/umd.js', dest: 'lib' }
      ]
    })
  ],
})
