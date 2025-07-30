module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // Disabled to allow unused imports/vars
    '@typescript-eslint/no-explicit-any': 'off', // Disabled to allow any types
    'react/no-unescaped-entities': 'off',
    'prefer-const': 'off', // Disabled to allow let instead of const
    // Disable other problematic rules
    'no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off'
  }
}