module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFilesAfterEnv: ['./jest.setup.mjs']
};