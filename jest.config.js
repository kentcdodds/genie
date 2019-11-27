const jest = require('kcd-scripts/jest')

module.exports = {
  ...jest,
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 71,
      lines: 78,
      functions: 78,
    },
  },
  testEnvironment: 'jsdom',
}
