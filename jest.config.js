module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/*.fixture.js'
  ],
  restoreMocks: true,
  setupFilesAfterEnv: [
    'angular',
    'angular-mocks',
    'jest-date-mock',
    '<rootDir>/jest/setup.js',
    'jest-extended'
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  modulePaths: [
    '<rootDir>/src'
  ],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js'
  }
}
