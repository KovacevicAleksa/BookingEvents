module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['./jest.setup.mjs'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules'],
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^ioredis$': 'ioredis-mock'
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};