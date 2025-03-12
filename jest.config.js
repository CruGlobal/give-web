module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.{ts,tsx}',
    '!**/*.fixture.js'
  ],
  restoreMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest/setupAngularMocks.js',
    'angular',
    'angular-mocks',
    'jest-date-mock',
    '<rootDir>/jest/setup.js'
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  modulePaths: [
    '<rootDir>/src'
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|tsx)?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js'
  }
}
