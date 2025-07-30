module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off', // Turn off for now
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/no-unescaped-entities': 'error'
  }
}