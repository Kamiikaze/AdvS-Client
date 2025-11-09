// Plugins
import Components from 'unplugin-vue-components/vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import ViteFonts from 'unplugin-fonts/vite';
import VueRouter from 'unplugin-vue-router/vite';
import { vite as vidstack } from 'vidstack/plugins';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../electron/res/ui',
    emptyOutDir: true,
  },
  base: './',
  plugins: [
    VueRouter(),
    Vue({
      template: {
        transformAssetUrls,
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('media-') },
      },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
        ],
      },
    }),
    vidstack(),
  ],
  define: {
    'process.env': {},
    PKG: pkg,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pkg': fileURLToPath(new URL('./package.json', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 9000,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
    },
  },
});
