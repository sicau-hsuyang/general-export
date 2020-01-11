import BaseComponent from "../component";

export default class SqlComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  /**
   * 导出sql
   */
  doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    const valueFmt = (record) => {
      const values = Object.values(record)
      return '(' + values.map(value => this.stringify(value)).join(',') + ')'
    }
    let outColumns = this.getAvailableProps()
    if (outColumns.length === 0) {
      outColumns = Object.keys(data[0])
    }
    const props = outColumns.map(column => {
      return '`' + column.prop + '`'
    }).join(',')
    const values = data.map(record => valueFmt(record)).join(',')
    return `INSERT INTO \`Table\` (${props}) VALUES ${values}`
  }

  /**
   * sql 序列化时候 序列化成后端常见的时间戳
   */
  stringifyDate(date) {
    return date.getTime() / 1000
  }

}
