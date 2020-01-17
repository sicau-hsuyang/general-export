require('./extension/decycle.js');
const utils = require('./utils.js');
class JsonToXmlSerilizer {
  constructor(json) {
    this.setData(json)
  }

  setData(json) {
    this.json = JSON.decycle(json);
  }

  /**
   * 是否是除对象和Array以外的类型
   * @param {*} obj
   * @returns {boolean}
   */
  isBasicEle(obj) {
    return !utils.isObject(obj) && !Array.isArray(obj);
  }

  /**
   * 转义不合法的value
   * @param {String} value
   * @returns
   */
  encodeStr(value) {
    value += '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  serilizeElement(prop, objValue) {
    let innerSchema = '';
    const trimProp = prop.trim();
    // 如果键是* 或者prop中间有空格 或者空串 且不能以数字开头
    if (trimProp === '*' || trimProp === '' || /\s+/g.test(trimProp) || /^\d+/g.test(trimProp)) {
      console.warn(
        'the xml element name can not use * or cantain any space or start with number, this prop [' +
          prop +
          '] will be ignored'
      );
      return innerSchema;
    }
    if (
      objValue instanceof Boolean ||
      objValue instanceof Number ||
      objValue instanceof String ||
      this.isBasicEle(objValue)
    ) {
      objValue = objValue && typeof objValue.valueOf === 'function' ?  objValue.valueOf() : objValue
      // 处理函数 undefined Symbol
      if (['function', 'undefined', 'symbol'].includes(typeof objValue)) {
        innerSchema = '[this schema cannot be stringify]';
      } else if (utils.isDate(objValue)) {
        innerSchema = objValue.getTime();
      } else if (utils.isRegExp(objValue)) {
        // 处理 正则
        innerSchema = objValue.source + '|' + objValue.flags;
      } else if (
        typeof objValue === 'number' &&
        (Number.isNaN(objValue) || !Number.isFinite(objValue))
      ) {
        innerSchema = 'null';
      } else {
        // 转义特殊字符
        innerSchema = this.encodeStr(objValue);
      }
    } else {
      if (Array.isArray(objValue)) {
        objValue.forEach(item => {
          innerSchema += this.serilizeElement(prop, item);
        });
        // 对于数组 需要做成
        // <element /> <element/> <element/> 因此 直接return
        return innerSchema;
      } else {
        Object.entries(objValue).forEach(([chhildProp, value]) => {
          innerSchema += this.serilizeElement(chhildProp, value);
        });
      }
    }
    return `<${trimProp}>${innerSchema}</${trimProp}>`;
  }

  /**
   * 计算缩进
   * @param {Number} prefixIndex
   */
  calcPrefix(prefixIndex) {
    var result = '';
    var span = '\t'; // 缩进长度
    var output = [];
    for (var i = 0; i < prefixIndex; ++i) {
      output.push(span);
    }
    result = output.join('');
    return result;
  }

  /**
   * 格式化XML字符串
   * @param {String} xmlStr
   */
  formatXml(xmlStr) {
    var text = xmlStr;
    // 使用replace去空格
    text ='\n' +text.replace(/(<\w+)(\s.*?>)/g, function($0, name, props) {
          return name + ' ' + props.replace(/\s+(\w+=)/g, ' $1');
        }).replace(/>\s*?</g, '>\n<');
    // 处理注释
    text = text
      .replace(/\n/g, '\r')
      .replace(/<!--(.+?)-->/g, function($0, text) {
        var ret = '<!--' + escape(text) + '-->';
        return ret;
      })
      .replace(/\r/g, '\n');
    // 调整格式  以压栈方式递归调整缩进
    var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/gm;
    var nodeStack = [];
    var output = text.replace(
      rgx,
      (
        $0,
        all,
        name,
        isBegin,
        isCloseFull1,
        isCloseFull2,
        isFull1,
        isFull2
      ) => {
        var isClosed =
          isCloseFull1 === '/' ||
          isCloseFull2 === '/' ||
          isFull1 === '/' ||
          isFull2 === '/';
        var prefix = '';
        if (isBegin === '!') {
          //! 开头
          prefix = this.calcPrefix(nodeStack.length);
        } else {
          if (isBegin !== '/') {
            // /开头
            prefix = this.calcPrefix(nodeStack.length);
            if (!isClosed) {
              // 非关闭标签
              nodeStack.push(name);
            }
          } else {
            nodeStack.pop(); // 弹栈
            prefix = this.calcPrefix(nodeStack.length);
          }
        }
        var ret = '\n' + prefix + all;
        return ret;
      }
    );
    var outputText = output.substring(1);
    // 还原注释内容
    outputText = outputText
      .replace(/\n/g, '\r')
      .replace(/(\s*)<!--(.+?)-->/g, function($0, prefix, text) {
        if (prefix.charAt(0) === '\r') {
          prefix = prefix.substring(1);
        }
        text = unescape(text).replace(/\r/g, '\n');
        var ret =
          '\n' + prefix + '<!--' + text.replace(/^\s*/gm, prefix) + '-->';
        return ret;
      });
    outputText = outputText.replace(/\s+$/g, '').replace(/\r/g, '\r\n');
    return outputText;
  }

  serilize() {

    const startSchema = '<?xml version="1.0" encoding="UTF-8" ?>';
    let bodySchema = '';
    // xml只能有一个根节点 因此需要手动添加 root 节点 使之成为根节点
    bodySchema += '<root>';
    if (this.json instanceof Boolean ||
      this.json instanceof Number ||
      this.json instanceof String ||
      this.isBasicEle(this.json)) {
      bodySchema += this.json.valueOf();
    } else {
      if (Array.isArray(this.json)) {
        this.json.forEach((ele) => {
          bodySchema += this.serilizeElement("Item", ele);
        });
      } else {
        Object.entries(this.json).forEach(([prop, value]) => {
          bodySchema += this.serilizeElement(prop, value);
        });
      }
    }
    bodySchema += '</root>';
    return this.formatXml(startSchema + bodySchema);
  }
}

module.exports = JsonToXmlSerilizer;
