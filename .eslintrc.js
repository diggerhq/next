var tsConfigs = ['./tsconfig.json'];
var tsConfigEmail = ['./tsconfig-emails.json'];

var srcRuleOverrides = {
  'prettier/prettier': 0,
  '@typescript-eslint/no-unused-vars': 0,
  '@typescript-eslint/no-unused-expressions': 0,
  '@typescript-eslint/no-non-null-assertion': 0,
  '@next/next/no-img-element': 0,
  '@typescript-eslint/no-empty-object-type': 0,
  '@typescript-eslint/no-explicit-any': 0,
  '@typescript-eslint/ban-ts-comment': 0,
};

module.exports = {
  overrides: [
    {
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:@next/next/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: tsConfigs,
      },
      plugins: ['@typescript-eslint', 'prettier'],
      rules: srcRuleOverrides,
      files: ['src/**/*.ts', 'src/**/*.tsx'],
    },
    {
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:@next/next/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: tsConfigEmail,
      },
      plugins: ['@typescript-eslint', 'prettier'],
      rules: srcRuleOverrides,
      files: ['emails/**/*.ts', 'emails/**/*.tsx'],
    },
    {
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: tsConfigs,
      },
      plugins: [
        '@typescript-eslint',
        'plugin:playwright/playwright-test',
        'prettier',
      ],
      rules: srcRuleOverrides,
      files: ['e2e/**/*.ts'],
    },

    {
      extends: ['eslint:recommended', 'prettier'],
      files: '*.mjs',
    },
    // make nextconfig.mjs node environment
    {
      extends: [
        'eslint:recommended',
        'prettier',
        'plugin:@next/next/recommended',
      ],
      files: 'next.config.mjs',
    },
  ],
  extends: ['plugin:@next/next/recommended'],
  root: true,
};
