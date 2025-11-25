/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

import eslint from '@eslint/js';
import * as eslintVueConfigTs from '@vue/eslint-config-typescript';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginVue from 'eslint-plugin-vue';
import tsEslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default [
  // Include / Exclude
  {
    name: 'app/vue-files',
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
    },
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,ts,mts,tsx}'],
    languageOptions: {
      parser: tsEslint.parser,
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Base Configs
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,

  // VueTs Configs
  ...eslintVueConfigTs.defineConfigWithVueTs(
    eslintPluginVue.configs['flat/recommended'],
    eslintVueConfigTs.vueTsConfigs.recommended
  ),

  {
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

      'prettier/prettier': 'warn',
    },
  },

  // Prettier
  eslintPluginPrettierRecommended,
];
