const {jest} = require('kcd-scripts/config')

module.exports = Object.assign(jest, {
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 71,
      lines: 78,
      functions: 78,
    },
  },
})
