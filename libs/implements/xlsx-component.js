import Excel from 'exceljs'
import BaseComponent from './component'
export default class XlsxComponent extends BaseComponent {

  constructor(dataSource) {
    super(dataSource)
  }


  /**
   * 根据数字映射字母
   * @param {number} num
   * @returns {string}
   */
  getChar(num) {
    if (num <= 0 || num > 26) {
      throw `num must in range [0-25]`
    }
    const mapping = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    return mapping[num - 1]
  }


  /**
   * 将数字转化成Excel中的 A AA ABC这样的单元格地址
   * @param {number} n
   * @returns {string}
   */
  getColCellNum(n) {
    let s = ''
    while (n > 0) {
      let m = n % 26
      if (m === 0) {
        m = 26
      }
      s = this.getChar(m) + s
      n = (n - m) / 26
    }
    return s
  }

  async doWExport() {
    let dataSource = options.data;
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
      const buffer = fmt === 'xlsx' ? await excel.xlsx.writeBuffer() : await excel.csv.writeBuffer()
      let blob = new Blob([buffer])
      let excelStr = await utils.blob2String(blob)
      // this.exportRaw(filename, blob);
    } catch (exp) {
      console.error('[ the error has occurred when exporting or the browser can not support export]')
    }
  }

}
