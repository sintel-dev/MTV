const { off } = require('process');

module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'eslint-config-airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    shallow: true,
    render: true,
    mount: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'no-restricted-globals': 'off',
    'prettier/prettier': ['error'],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/named': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/prop-types': 'off',
    'react/forbid-prop-types': ['warn', { forbid: ['any'] }],
    'react/require-default-props': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-boolean-value': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/jsx-closing-bracket-location': 'warn',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-indent': 'warn',
    'react/state-in-constructor': 'off',
    'react/destructuring-assignment': 'off',
    'react/sort-comp': [
      1,
      {
        order: ['static-methods', 'lifecycle', 'everything-else', 'render'],
      },
    ],
    'object-shorthand': 'warn',
    'prefer-destructuring': [
      'warn',
      {
        object: true,
      },
    ],
    'prefer-const': 'off',
    'import/extensions': 'off',
    'no-unused-expressions': 'off',
    'object-curly-newline': 'off',
    'no-use-before-define': 'off',
    'operator-linebreak': 'off',
    'arrow-parens': 'off',
    'space-before-function-paren': 'off',
    'func-names': 'off',
    'react/prefer-stateless-function': 'off',
    'react/static-property-placement': 'off',
    indent: 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-confusing-arrow': 'off',
    'no-unused-vars': 'warn',
    'no-trailing-spaces': 'warn',
    'no-debugger': 'warn',
    'arrow-body-style': 'warn',
    'max-len': 'off',
    'class-methods-use-this': 'off',
    camelcase: 'off',
    'no-useless-constructor': 'off',
    'import/no-named-as-default': 'off',
  },
};
