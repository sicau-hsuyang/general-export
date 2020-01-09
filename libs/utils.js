const toString = Object.prototype.toString

class Utils {

  /**
   * 是否是Blob类型
   * @param {Object} obj
   * @returns {Boolean}
   */
  isBlob(obj) {
    return obj && obj.constructor && obj.constructor.name === 'Blob'
  }


  /**
   * 是否是Promise
   * @param {Object} obj
   * @returns {Boolean}
   */
  isPromise(obj) {
    return obj && typeof obj.then === 'function'
  }

  isUndefined(obj) {
    return typeof obj === 'undefined'
  }

  isObject(obj) {
    return toString.call(obj) === '[object Object]'
  }

  isNull(obj) {
    return toString.call(obj) === '[object Null]'
  }

  isString(obj) {
    return toString.call(obj) === '[object String]'
  }

  isNullOrUndefined(obj) {
    return this.isNull(obj) || this.isUndefined(obj)
  }

}

export default new Utils()
