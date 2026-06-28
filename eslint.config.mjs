import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import nextRules from '@next/eslint-plugin-next';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/api/defaults';
import { SelectorKind } from 'eslint-plugin-better-tailwindcss/types';
import eslintPluginImportX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNamingConvention from 'eslint-plugin-react-naming-convention';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const scriptExtensions = '{ts,tsx,js,jsx,mjs,cjs}';
const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

const eslintConfig = defineConfig([
  // Override default ignores of eslint-config-next.
  includeIgnoreFile(gitignorePath),
  { ignores: ['.agents/**'] },
  {
    files: [`**/*.${scriptExtensions}`],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactNamingConvention.configs.recommended,
      nextRules.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      ...fixupConfigRules(react.configs.flat.recommended),
      ...fixupConfigRules(react.configs.flat['jsx-runtime']),
      eslintPluginImportX.flatConfigs.recommended,
      eslintPluginImportX.flatConfigs.typescript,
      reactRefresh.configs.next(),
      eslintConfigPrettier,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
      '@stylistic': stylistic,
      react: fixupPluginRules(react),
      'better-tailwindcss': eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/refs': 'off',
      'better-tailwindcss/enforce-consistent-line-wrapping': [
        'error',
        { printWidth: 100, lineBreakStyle: 'unix', indent: 2, strictness: 'loose' },
      ],
      'better-tailwindcss/no-unknown-classes': [
        'error',
        {
          // Marker class applied by `createIcon`; not a Tailwind utility.
          ignore: ['^tabler-icon$'],
        },
      ],

      curly: 'error',
      'jsx-a11y/no-autofocus': [
        'warn',
        {
          ignoreNonDOM: true,
        },
      ],
      'object-shorthand': 'error',
      'react/prop-types': 'off', // causes conflict with shadcn plus typescript already take care of this
      'prefer-template': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-boolean-value': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never', propElementValues: 'always' },
      ],
      'react/self-closing-comp': 'error',

      '@typescript-eslint/no-unnecessary-type-arguments': 'off',

      // Using shorthand leads to unspecified key prop not being detected => Harder to debug
      // We would end up with a situation where places using the shorthand, places using the standard
      'react/jsx-fragments': ['error', 'element'],

      // 'react-naming-convention/filename-extension': ['error', 'as-needed'],
      'no-useless-rename': 'error',
      'unused-imports/no-unused-imports': 'error',

      // We use "unused-imports/no-unused-vars" rule instead
      // So that it will automatically remove unused vars from imports
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],

      // These "any" related rules are really annoying, they usually result in "error" type
      // A simple ESlint restart usually fix that
      // Plus, typescript checking is usually enough to catch these issues, eg. "Cannot find name (TS2304)"
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // We usually use 'any' in generic type inference stuff, otherwise we should avoid using it
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],

      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          // fixStyle: 'separate-type-imports',
        },
      ],
      'import-x/no-cycle': 'error',
      'import-x/no-anonymous-default-export': 'error',
      'import-x/default': 'error',
      'import-x/no-named-as-default-member': 'off',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['sibling', 'parent'],
            'index',
            'object',
            'type',
          ],

          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],

          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        {
          blankLine: 'always',
          prev: 'import',
          next: ['const', 'let', 'var', 'export', 'function'],
        },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var', 'export', 'import'],
          next: ['block-like', 'function'],
        },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
        selectors: [
          ...getDefaultSelectors(),
          {
            kind: SelectorKind.Callee,
            name: '^tw$',
          },
        ],
      },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
          project: './tsconfig.json',
        }),
      ],
      // https://github.com/vercel/next.js/issues/89764#issuecomment-3928272828
      react: {
        version: '19',
      },
      linkComponents: [
        // Components used as alternatives to <a> for linking
        { name: 'Link', linkAttribute: ['to'] },
      ],
    },
  },
]);

export default eslintConfig;
