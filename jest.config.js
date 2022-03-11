module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.ts',
    'src/**/*.tsx',
    '!**/*.fixture.js'
  ],
  restoreMocks: true,
  setupFilesAfterEnv: [
    'angular',
    'angular-mocks',
    'jest-date-mock',
    '<rootDir>/jest/setup.js'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
  },
  modulePaths: [
    '<rootDir>/src'
  ],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js'
  }
}
