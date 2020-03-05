const BaseComponent = require("../component");
class JsonComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  /**
   * 导出JSON
   * @returns {string} 返回字符串
   */
  doExport() {
    let dataSource = this.config.data
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    return JSON.stringify(data, this.config.replacer, this.config.indent)
  }

}

module.exports = JsonComponent
