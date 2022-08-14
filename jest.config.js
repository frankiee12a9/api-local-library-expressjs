module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/tools/'],
  moduleNameMapper: {
    '~(.*)': '<rootDir>/src$1',
  },
  setupTestFrameworkScriptFile: '<rootDir>/tools/setup-test.js',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
};
