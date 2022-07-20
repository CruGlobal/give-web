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
    '<rootDir>/jest/setup.js'
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^@okta/okta-auth-js$': '<rootDir>/__mocks__/oktaMock.js'
  },
  modulePaths: [
    '<rootDir>/src'
  ],
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js'
  }
}
