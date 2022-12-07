module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['standard', 'prettier', 'eslint-config-prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
}
