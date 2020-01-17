const BSRunner = require('./libs')
module.exports = function (filename, dataSource, options = {}) {
  Object.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  }
  return new BSRunner(filename, dataSource, options)
}
