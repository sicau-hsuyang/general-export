// import ExcelJS from 'exceljs'
import BaseComponent from '../component'
export default class XlsxComponent extends BaseComponent {

  constructor(config) {
    super(config)
    if (typeof ExcelJS === 'undefined') {
      throw new Error("this module require module which named exceljs, please run bash `npm install exceljs -S`")
    }
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
    let dataSource = this.config.data;
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource);
    const excel = new ExcelJS.Workbook();
    excel.created = new Date();
    excel.creator = "Create by general-export lib"
    const sheet = excel.addWorksheet("Table");
    const outColumns = this.getAvailableProps();
    // 对象的字段顺序映射
    const columnSequnceMapping = {};
    const header = outColumns.length === 0
      ? Object.keys(data[0]).map(prop => {
        return { prop: prop, label: prop };
      }) : outColumns;
    sheet.columns = header.map((col, colIdex) => {
      columnSequnceMapping[col.prop] = colIdex;
      return {
        key: col.prop,
        header: col.label
      };
    });
    // 因为多了一行 所以处理要从第二个开始
    sheet.addRows(data);
    // 此时必须还是要拿dataSource取判断
    dataSource.forEach((row, rowIdx) => {
      Object.entries(row).forEach(([prop, propValue]) => {
        const colNum = this.getColCellNum(
          columnSequnceMapping[prop] + 1 // 1-> A 因为拿到的是序号所以需要+1
        );
        // 因为第一行用的是表头 所以行号直接是从第二行开始算
        const rowNum = rowIdx + 2;
        const cellAddr = colNum + "" + rowNum;
        if (propValue.colSpan > 1 && propValue.rowSpan > 1) {
          // 合并行列
          // 同时合并行 和 列
          const endRowNum =
            rowNum + propValue.rowSpan - 1;
          const endColNum = this.getColCellNum(columnSequnceMapping[prop] + 1 + propValue.colSpan - 1)
          const endCellAddr = endColNum + "" + endRowNum;
          sheet.mergeCells(cellAddr + ":" + endCellAddr);
          let cell = sheet.getCell(cellAddr);
          cell && (cell.alignment = { vertical: 'middle', horizontal: 'center' })
        } else if (propValue.rowSpan > 1) {
          // 合并行
          // 合并行的时候因为算了自己 所以要减1
          const endRowNum =
            rowNum + propValue.rowSpan - 1;
          const endRowAddr = colNum + "" + endRowNum;
          sheet.mergeCells(cellAddr + ":" + endRowAddr);
          let cell = sheet.getCell(cellAddr);
          cell && (cell.alignment = { vertical: 'middle' })
        } else if (propValue.colSpan > 1) {
          // todo 因为 属性没有在里面  也参与了合并 肯定有问题
          // 合并列
          // 合并列的时候因为算了自己 所以要减1 并且 先用Num进行加减再进行转化
          const endColNum = this.getColCellNum(columnSequnceMapping[prop] + 1 + propValue.colSpan - 1)
          const endColAddr = endColNum + "" + rowNum
          sheet.mergeCells(cellAddr + ":" + endColAddr);
          let cell = sheet.getCell(cellAddr);
          cell && (cell.alignment = { vertical: 'center' })
        }
      });
    });
    let buffer = await excel.xlsx.writeBuffer();
    //console.error('[ the error has occurred when exporting or the browser can not support export]')
    return new Blob([buffer]);
  }

}
