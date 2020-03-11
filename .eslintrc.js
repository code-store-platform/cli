module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  'rules': { // 0 = off, 1 = warn, 2 = error
    'eol-last': ['error', 'always'],
    'max-len': ['error', 300],
    'import/no-cycle': ['off'],
    '@typescript-eslint/interface-name-prefix': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/adjacent-overload-signatures': ['error'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/member-delimiter-style': ['error'],
    '@typescript-eslint/no-for-in-array': ['error'],
    '@typescript-eslint/naming-convention': ['error',
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE']
      },
      {
        'selector': 'function',
        'format': ['camelCase']
      },
    ],
    '@typescript-eslint/no-dynamic-delete': ['error'],
    '@typescript-eslint/no-misused-new': ['error'],
    '@typescript-eslint/no-throw-literal': ['error'],
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['error'],
  }
};
