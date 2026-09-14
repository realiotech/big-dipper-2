module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>',
  ],
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  testPathIgnorePatterns: ['<rootDir>[/\\\\](node_modules|.next|cypress)[/\\\\]'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],
  transform: {
    '.+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    // Static equivalent of tsconfig's paths ("@/*" -> "src/*"). The previous
    // pathsToModuleNameMapper(require('./tsconfig.json')) setup broke on two
    // counts: ts-jest v29 moved the helper off 'ts-jest/utils', and the
    // tsconfig's trailing commas (JSONC) crash require().
    '^@/(.*)$': '<rootDir>/src/$1',
    // Legacy upstream aliases still referenced by jest.setup.js mocks.
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@configs$': '<rootDir>/src/configs',
    '^@recoil/(.*)$': '<rootDir>/src/recoil/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
};
