const toString = Object.prototype.toString

class Utils {

  /**
   * 根据数字映射字母
   * @param {number} num
   * @returns {string}
   */
  getChar(num) {
    if (num <= 0 || num > 26) {
      throw `num must in range [0-25]`
    }
    const mapping = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    return mapping[num - 1]
  }


  /**
   * 将数字转化成Excel中的 A AA ABC这样的单元格地址
   * @param {number} n
   * @returns {string}
   */
  getColCellNum(n) {
    let s = ''
    while (n > 0) {
      let m = n % 26
      if (m === 0) {
        m = 26
      }
      s = this.getChar(m) + s
      n = (n - m) / 26
    }
    return s
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



  /**
   * 将Blob转成String
   * @param {Blob} blob
   * @returns {Promise<String>}
   */
  blob2String(blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsText(blob);
      reader.onload = function (e) {
        resolve(reader.result);
      }
      reader.onerror = function (err) {
        reject(err)
      }
    })
  }


  /**
   * 计算缩进
   * @param {Number} prefixIndex
   */
  calcPrefix(prefixIndex) {
    var result = ''
    var span = '\t'// 缩进长度
    var output = []
    for (var i = 0; i < prefixIndex; ++i) {
      output.push(span)
    }
    result = output.join('')
    return result
  }

  /**
   * 格式化XML字符串
   * @param {String} xmlStr
   */
  formatXml(xmlStr) {
    var text = xmlStr
    // 使用replace去空格
    text = '\n' + text.replace(/(<\w+)(\s.*?>)/g, function ($0, name, props) {
      return name + ' ' + props.replace(/\s+(\w+=)/g, ' $1')
    }).replace(/>\s*?</g, '>\n<')
    // 处理注释
    text = text.replace(/\n/g, '\r').replace(/<!--(.+?)-->/g, function ($0, text) {
      var ret = '<!--' + escape(text) + '-->'
      return ret
    }).replace(/\r/g, '\n')
    // 调整格式  以压栈方式递归调整缩进
    var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg
    var nodeStack = []
    var output = text.replace(rgx, ($0, all, name, isBegin, isCloseFull1, isCloseFull2, isFull1, isFull2) => {
      var isClosed = (isCloseFull1 === '/') || (isCloseFull2 === '/') || (isFull1 === '/') || (isFull2 === '/')
      var prefix = ''
      if (isBegin === '!') { //! 开头
        prefix = calcPrefix(nodeStack.length)
      } else {
        if (isBegin !== '/') { // /开头
          prefix = calcPrefix(nodeStack.length)
          if (!isClosed) { // 非关闭标签
            nodeStack.push(name)
          }
        } else {
          nodeStack.pop()// 弹栈
          prefix = this.calcPrefix(nodeStack.length)
        }
      }
      var ret = '\n' + prefix + all
      return ret
    })
    var outputText = output.substring(1)
    // 还原注释内容
    outputText = outputText.replace(/\n/g, '\r').replace(/(\s*)<!--(.+?)-->/g, function ($0, prefix, text) {
      if (prefix.charAt(0) === '\r') {
        prefix = prefix.substring(1)
      }
      text = unescape(text).replace(/\r/g, '\n')
      var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix) + '-->'
      return ret
    })
    outputText = outputText.replace(/\s+$/g, '').replace(/\r/g, '\r\n')
    return outputText
  }

  /**
   * 创建文档导出对象
   */
  createXMLSchema() {
    var xmlSchema = null
    if (isUndefined(window.ActiveXObject)) {
      xmlSchema = new ActiveXObject('Microsoft.XMLDOM')
    } else if (document.implementation &&
      document.implementation.createDocument) {
      xmlSchema = document.implementation.createDocument('', '', null)
    } else {
      throw '[we cannot export xml-document because your browser not support [XMLDOM] method]'
    }
    return xmlSchema
  }

}

/**
 * 导出数据方法
 * @param {String} filename
 * @param {String | Blob} inputData
 */
export function exportRaw(filename, inputData) {
  var urlObject = window.URL || window.webkitURL
  if (!urlObject || typeof Blob === 'undefined') {
    throw ('当前JS环境无法导出!')
  }

  var export_blob = isBlob(inputData) ? inputData : new Blob([inputData])
  // 对于IE10以上
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(export_blob, filename)
  } else {
    var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
    save_link.href = urlObject.createObjectURL(export_blob)
    save_link.download = filename
    var ev = document.createEvent('MouseEvents')
    ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    save_link.dispatchEvent(ev)
  }
}

export default new Utils()
