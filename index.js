const BSRunner = require('./libs')
module.exports = function (filename, dataSource, options = {}) {
  return new BSRunner(filename, dataSource, options)
}
