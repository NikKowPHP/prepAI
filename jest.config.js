module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^./route$': '<rootDir>/__mocks__/route.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      stringifyContentPathRegex: '\\.svg$',
    }
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  modulePathIgnorePatterns: [],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};