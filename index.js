const BSRunner = require('./libs')
module.exports = function (filename, dataSource, options = {}) {
  typeof Object.isObject !== 'function' && (Object.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  })

  typeof Array.prototype._orderBy !== 'function' &&
    (Array.prototype._orderBy = function (delegate, direction) {
      if (this.length <= 1) {
        return this;
      }
      var isFunction = typeof delegate == 'function';
      var tmp;
      for (var i = 0; i < this.length - 1; i++) {
        for (var j = i + 1; j < this.length; j++) {
          var first = this[i];
          var next = this[j];
          var result;
          if (direction == 'asc') {
            result = isFunction
              ? delegate(first) > delegate(next)
              : first > next;
          } else {
            result = isFunction
              ? delegate(first) < delegate(next)
              : first < next;
          }
          if (result) {
            tmp = this[i];
            this[i] = this[j];
            this[j] = tmp;
          }
        }
      }
      return this;
    });

  typeof Array.prototype.orderBy !== 'function' &&
    (Array.prototype.orderBy = function (delegate) {
      return this._orderBy(delegate, 'asc');
    });

  typeof Array.prototype.orderByDesc !== 'function' && (Array.prototype.orderByDesc = function (delegate) {
    return this._orderBy(delegate, 'desc');
  })

  var runner = new BSRunner(filename, dataSource, options)
  return runner.gen()
}
