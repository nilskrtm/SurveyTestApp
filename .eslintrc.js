module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    'no-console': 0,
    'react/prop-types': 0,
    '@typescript-eslint/no-var-requires': 0,
    'react-native/no-inline-styles': 0
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect'
    }
  }
};
