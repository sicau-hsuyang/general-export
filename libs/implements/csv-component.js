import BaseComponent from "./component";

export default class CsvComponent extends BaseComponent {

  constructor(config) {
    super(config)
  }

  doExport() {
    let csvStr = null
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = reshapeData(dataSource)
    const excel = new Excel.Workbook()
    excel.created = new Date()
    const sheet = excel.addWorksheet('Table')
    const exportProps = get()
    const header = exportProps.length === 0 ? Object.keys(data[0]).map(key => {
      return { prop: key, label: key }
    }) : exportProps
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
      csvStr = "\uFEFF" + buffer.toString("utf-8")
    } catch (exp) {
      console.error('[ the error has occurred when exporting or the browser can not support export]')
    }
    return csvStr
  }

}
