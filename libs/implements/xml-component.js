const BaseComponent = require("../component");

class XmlComponent extends BaseComponent {

  constructor(config) {
    super(config)
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
        prefix = this.calcPrefix(nodeStack.length)
      } else {
        if (isBegin !== '/') { // /开头
          prefix = this.calcPrefix(nodeStack.length)
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
    if (typeof ActiveXObject !== 'undefined') {
      xmlSchema = new ActiveXObject('Microsoft.XMLDOM')
    } else if (document.implementation &&
      document.implementation.createDocument) {
      xmlSchema = document.implementation.createDocument('', '', null)
    } else {
      throw '[we cannot export xml-document because your browser not support [XMLDOM] method]'
    }
    return xmlSchema
  }

  exportXmlInBrowser(dataSource) {
    const prefix = `<?xml version="1.0" encoding="${this.config.encode}" ?>`
    const data = this.reshapeData(dataSource)
    let outColumns = this.getAvailableProps()
    if (outColumns.length <= 0) {
      outColumns = Object.keys(data[0]).map(x => {
        return {
          prop: x,
          label: null
        }
      })
    } else {
      outColumns = Object.values(this.config.columns)
    }
    var docSchema = this.createXMLSchema()
    if (!docSchema) {
      return
    }
    var docType = docSchema.createProcessingInstruction('xml', `version='1.0'  encoding='${this.config.encode.toUpperCase()}'`)
    // 添加文件头
    docSchema.appendChild(docType)
    var root = docSchema.createElement('List')
    dataSource.forEach(obj => {
      const level = docSchema.createElement('Item')
      Object.entries(obj).forEach(([key, val]) => {
        // 如果全部导出 或者 包含导出的key
        const targetDefine = outColumns.find(x => x.prop === key)
        if (targetDefine) {
          const node = docSchema.createElement(key)
          node.textContent = val
          //todo
          node.setAttribute('label', targetDefine.label || key)
          level.appendChild(node)
        }
      })
      root.appendChild(level)
    })
    const serializer = new XMLSerializer()
    return this.formatXml(prefix + serializer.serializeToString(root))
  }

  exportXmlInNode(dataSource) {
    // todo
    console.log('export in nodejs')
  }

  /**
   * 导出XML
   */
  doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    return this.utils.isNodeEnv() ? this.exportXmlInNode(dataSource) : this.exportXmlInBrowser(dataSource)
  }

}

module.exports = XmlComponent;
