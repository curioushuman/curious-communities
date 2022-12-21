/* eslint-env node */
const esModules = ['aws-testing-library', 'filter-obj'].join('|');

export default {
  displayName: 'cc-api-admin:infra',
  preset: '../../../jest.preset.js',
  collectCoverage: false,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.infra.json',
    },
  },
  setupFiles: ['<rootDir>/tools/jest/infra.prep.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/../../../tools/jest/aws-testing-library.setup.ts',
  ],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    '--require': 'dotenv/config',
  },
  // transform: {
  //   '^.+\\.[tj]s$': 'ts-jest',
  // },
  transformIgnorePatterns: [`<rootDir>/../../../node_modules/(?!${esModules})`],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(infra-spec).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
};
