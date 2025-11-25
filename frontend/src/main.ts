/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins';

// Components
import App from './App.vue';

// Composables
import type { GLXElectronAPI } from '@grandlinex/e-kernel-ui';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

declare global {
  interface Window {
    glxApi: GLXElectronAPI;
  }
}

const app = createApp(App).use(createPinia());

registerPlugins(app);

app.mount('#app');
