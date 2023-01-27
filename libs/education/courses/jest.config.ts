/* eslint-env node */
const esModules = ['aws-testing-library', 'filter-obj'].join('|');

export default {
  displayName: 'cc-courses-service',
  preset: '../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  testEnvironmentOptions: {
    '--require': 'dotenv/config',
  },
  transformIgnorePatterns: [`<rootDir>/../../../node_modules/(?!${esModules})`],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/education/courses',
};
