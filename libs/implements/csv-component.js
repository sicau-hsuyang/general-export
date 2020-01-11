// import ExcelJS from 'exceljs'
import BaseComponent from "../component";

export default class CsvComponent extends BaseComponent {

  constructor(config) {
    super(config)
    if (typeof ExcelJS === 'undefined') {
      throw new Error("this module require module which named exceljs, please run bash `npm install exceljs -S`")
    }
  }

  /**
   * excel和 csv序列化 yyyy/MM/dd
   * @param {Date} date
   */
  stringifyDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1
    let day = date.getDate();
    return year + "/" + month + "/" + day
  }

  async doExport() {
    let csvStr = null
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    const excel = new ExcelJS.Workbook()
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
