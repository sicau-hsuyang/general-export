
import Excel from 'exceljs'
import BaseComponent from "./component";

export default class CsvComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  async doExport() {
    let csvStr = null
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    const excel = new Excel.Workbook()
    excel.created = new Date()
    excel.creator = "Create by general-export lib"
    const sheet = excel.addWorksheet('Table')
    const outColumns = this.getAvailableProps()
    const header = outColumns.length === 0 ? Object.keys(data[0]).map(key => {
      return { prop: key, label: key }
    }) : outColumns
    sheet.columns = header.map(col => {
      return {
        key: col.prop,
        header: col.label
      }
    })
    sheet.addRows(data)
    try {
      const buffer = await excel.csv.writeBuffer()
      // 当以utf-8保存csv的时候，必须加上这个前缀，否则中文将会是乱码
      let encode = this.config.encode.toLowerCase()
      let prefix = encode === 'utf-8' ? "\uFEFF" : '';
      csvStr = prefix + buffer.toString(encode)
    } catch (exp) {
      console.error('[ the error has occurred when exporting or the browser can not support export]')
    }
    return csvStr
  }

}
