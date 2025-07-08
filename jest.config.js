module.exports = {
  collectCoverageFrom: ['src/**/*.js', 'src/**/*.{ts,tsx}', '!**/*.fixture.js'],
  restoreMocks: true,
  setupFilesAfterEnv: [
    '<rootDir>/jest/setupAngularMocks.js',
    'angular',
    'angular-mocks',
    'jest-date-mock',
    '<rootDir>/jest/setup.js',
    'jest-canvas-mock',
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^@okta/okta-auth-js$': '<rootDir>/__mocks__/oktaMock.js',
  },
  modulePaths: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|tsx)?$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/jest/htmlTransform.js',
  },
};
