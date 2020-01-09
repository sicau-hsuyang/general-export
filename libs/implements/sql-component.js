import BaseComponent from "./component";

export default class SqlComponent extends BaseComponent {

  constructor() {
    super()
  }

  /**
   * 导出sql
   * @param {Array} dataSource
   */
  doExport(dataSource) {
    this.makeSureArray(dataSource)
    const data = reshapeData(dataSource)
    const valueFmt = (record) => {
      const values = Object.values(record)
      return '(' + values.map(value => stringify(value)).join(',') + ')'
    }
    const props = Object.keys(data[0]).map(prop => {
      return '`' + prop + '`'
    }).join(',')
    const values = data.map(record => valueFmt(record)).join(',')
    return `INSERT INTO \`Table\` (${props}) VALUES ${values}`
  }

}
