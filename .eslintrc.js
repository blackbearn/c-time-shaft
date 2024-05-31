module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-trailing-spaces': 'off',
    'array-callback-return': 'off',
    'no-multiple-empty-lines': 'off',
    'eol-last': 'off',
    'semi': 'off',
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
    'prefer-const': 'off',
    'object-curly-spacing': 'off',
    'quotes': 'off',
    'space-infix-ops': 'off',
    'no-unused-vars': 'off',
    'block-spacing': 'off',
  }
}
