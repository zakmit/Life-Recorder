//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      // Browser globals (AudioContext, navigator.mediaDevices, permissions) are
      // typed as always-present but can be undefined during SSR or in older
      // browsers. The defensive guards around them are intentional, so this
      // type-aware rule produces false positives here.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // Generated files: not authored, not linted.
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/routeTree.gen.ts',
      'worker-configuration.d.ts',
    ],
  },
]
