const BaseComponent = require("../component");
const XmlSerializer = require("../json2xml-serilizer")

class XmlComponent extends BaseComponent {
  /**
   * 内置的xml序列化器
   * @type { Json2XMLSerilizer }
   */
  serilier = null;

  constructor(config) {
    super(config);

    this.serilier = new XmlSerializer();
  }

  // exportXml(dataSource) {
  // const prefix = `<?xml version="1.0" encoding="${this.config.encode}" ?>`
  // const data = this.reshapeData(dataSource)
  // this.serilier.setData(data)
  // let outColumns = this.getAvailableProps()
  // if (outColumns.length <= 0) {
  //   outColumns = Object.keys(data[0]).map(x => {
  //     return {
  //       prop: x,
  //       label: null
  //     }
  //   })
  // } else {
  //   outColumns = Object.values(this.config.columns)
  // }
  // return this.serilier.serilize();
  // var docSchema = this.createXMLSchema()
  // if (!docSchema) {
  //   return
  // }
  // var docType = docSchema.createProcessingInstruction('xml', `version='1.0'  encoding='${this.config.encode.toUpperCase()}'`)
  // // 添加文件头
  // docSchema.appendChild(docType)
  // var root = docSchema.createElement('List')
  // dataSource.forEach(obj => {
  //   const level = docSchema.createElement('Item')
  //   Object.entries(obj).forEach(([key, val]) => {
  //     // 如果全部导出 或者 包含导出的key
  //     const targetDefine = outColumns.find(x => x.prop === key)
  //     if (targetDefine) {
  //       const node = docSchema.createElement(key)
  //       node.textContent = val
  //       //todo
  //       node.setAttribute('label', targetDefine.label || key)
  //       level.appendChild(node)
  //     }
  //   })
  //   root.appendChild(level)
  // })
  // const serializer = new XMLSerializer()
  // return this.formatXml(prefix + serializer.serializeToString(root))
  // }

  /**
   * 导出XML
   */
  doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource);
    const data = this.reshapeData(dataSource);
    this.serilier.setData(data);
    return this.serilier.serilize();
  }
}

module.exports = XmlComponent;
