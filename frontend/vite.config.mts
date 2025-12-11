// Plugins
import Vue from '@vitejs/plugin-vue';
import ViteFonts from 'unplugin-fonts/vite';
import Components from 'unplugin-vue-components/vite';
import { vite as vidstack } from 'vidstack/plugins';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../electron/res/ui',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Handle node_modules
          if (id.includes('node_modules')) {
            if (id.includes('vuetify')) return 'vendor-vuetify';
            if (id.includes('vidstack')) return 'vendor-vidstack';
            // Keep @vexip-ui and grid-layout-plus together
            if (id.includes('@vexip-ui') || id.includes('grid-layout-plus'))
              return 'vendor-grid';
            if (id.includes('vue')) return 'vendor-vue';
            if (id.includes('pinia')) return 'vendor-vue';
            if (id.includes('vue-router')) return 'vendor-vue';
            return 'vendor-other';
          }

          // Let Vite decide
          return undefined;
        },
      },
    },
  },
  base: './',
  plugins: [
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
        api: 'modern',
      },
    },
  },
});
