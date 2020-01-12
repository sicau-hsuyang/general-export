const toString = Object.prototype.toString

class Utils {

  /**
   * 判断程序运行在nodejs环境还是浏览器环境
   */
  isNodeEnv() {
    return typeof window === 'undefined'
  }

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
    return toString.call(obj) === '[object Promise]'
  }

  isDate(obj) {
    return toString.call(obj) === '[object Date]'
  }

  isRegExp(obj) {
    return toString.call(obj) === '[object RegExp]'
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
    return this.isNull(obj) || typeof obj === 'undefined'
  }

  stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr)
  }

}

module.exports = new Utils()
