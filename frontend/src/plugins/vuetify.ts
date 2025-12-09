/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

// Languages
import { de, en } from 'vuetify/locale';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          'logo-pink': 'rgb(252, 64, 153)',
          'logo-blue': 'rgb(26, 26, 202)',

          'purple-lighter': 'rgb(100, 59, 201)',
          'purple-light': 'rgb(82, 33, 188)',
          'purple-dark': 'rgb(70, 35, 156)',

          'pink-light': 'rgb(156, 39, 176)',
        },
      },
    },
  },
  locale: {
    locale: 'de',
    fallback: 'en',
    messages: { de, en },
  },
  ssr: true,
});
