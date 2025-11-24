/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...defineConfigWithVueTs(
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended
  ),

  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-plusplus': 'warn',
      'no-restricted-syntax': 'warn',
      'no-underscore-dangle': 'warn',
      'no-await-in-loop': 'off',
      'no-restricted-properties': 'warn',
      'linebreak-style': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/order-in-components': 'off',
      'vue/no-unused-vars': 'warn',
    },
  },
];
