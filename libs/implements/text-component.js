import BaseComponent from "./component";

export default class TextComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  /**
   * 导出txt
   * @param {Array} dataSource
   * @returns {string}
   */
  doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    const valueFmt = (record) => {
      const values = Object.values(record)
      return values.map(value => this.stringify(value)).join('\t')
    }
    let exportHeaders = this.getAvailableProps()
    if (exportHeaders.length <= 0) {
      exportHeaders = Object.keys(data[0])
    }
    return exportHeaders.join('\t') + '\r\n' + data.map(record => {
      return valueFmt(record)
    }).join('\r\n')
  }

}
