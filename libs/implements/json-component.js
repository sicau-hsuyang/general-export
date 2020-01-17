const BaseComponent = require("../component");
class JsonComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  /**
   * 导出JSON
   * @param {Array<Object>} dataSource 数据源
   * @returns {string} 返回字符串
   */
  doExport() {
    let dataSource = this.config.data
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    return JSON.stringify(data, null, 2)
  }

}

module.exports = JsonComponent
