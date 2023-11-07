module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/*.fixture.js',
    'src/**/*.ts'
  ],
  restoreMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest/setupAngularMocks.js',
    'angular',
    'angular-mocks',
    'jest-date-mock',
    '<rootDir>/jest/setup.js'
  ],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  modulePaths: [
    '<rootDir>/src'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]s?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js'
  }
}
