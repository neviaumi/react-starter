const { expect } = require('@jest/globals');

function getTestName() {
  return (
    expect.getState()?.currentTestName?.toLowerCase().split(' ').join('-') ??
    'n/a'
  );
}

function getTestPath() {
  return expect.getState().testPath ?? 'n/a';
}

module.exports = {
  getTestName,
  getTestPath,
};
