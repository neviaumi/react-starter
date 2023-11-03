module.exports = {
  extends: ['@busybox'],
  root: true,
  rules: {
    'dot-notation': 'off',
    'max-params': 'off',
  },
  settings: {
    node: {
      allowModules: ['express'],
    },
  },
};
