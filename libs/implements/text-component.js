import BaseComponent from "./component";

export default class TextComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  /**
   * 导出txt
   * @returns {string}
   */
  doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    let outColumns = this.getAvailableProps()
    if (outColumns.length <= 0) {
      outColumns = Object.keys(data[0])
    } else {
      outColumns = outColumns.map(x => x.label)
    }
    return outColumns.join('\t') + '\r\n' + data.map(record => {
      return Object.values(record).map(value => this.stringify(value)).join('\t')
    }).join('\r\n')
  }

}
