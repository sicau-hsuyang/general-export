// const ExcelJS = require('exceljs')
let ExcelJS = null
import('exceljs').then(ins => {
  ExcelJS = ins.default || ins;
});
const BaseComponent = require('../component')
class XlsxComponent extends BaseComponent {
  constructor(config) {
    super(config);
    if (typeof ExcelJS === 'undefined') {
      throw new Error(
        'this module require module which named exceljs, please run bash `npm install exceljs -S`'
      );
    }
    this.matrixHelper = []
  }

  /**
   * 根据数字映射字母
   * @param {number} num
   * @returns {string}
   */
  getChar(num) {
    if (num <= 0 || num > 26) {
      throw `num must in range [0-25]`;
    }
    const mapping = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ];
    return mapping[num - 1];
  }

  /**
   * 将数字转化成Excel中的 A AA ABC这样的单元格地址
   * @param {number} n
   * @returns {string}
   */
  getColCellNum(n) {
    let s = '';
    while (n > 0) {
      let m = n % 26;
      if (m === 0) {
        m = 26;
      }
      s = this.getChar(m) + s;
      n = (n - m) / 26;
    }
    return s;
  }

  /**
   * excel和 csv序列化 yyyy/MM/dd
   * @param {Date} date
   */
  stringifyDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return year + '/' + month + '/' + day;
  }

  magnifyRecord(record) {
    let obj = {};
    Object.entries(record).forEach(([prop, value]) => {
      obj[prop] = {
        colSpan: 1,
        rowSpan: 1,
        value
      };
    });
    return obj;
  }

  magnifyRows(list) {
    return list.map(x => this.magnifyRecord(x));
  }

  createMatrix(data) {
    let rows = data.length;
    let cols = Object.keys(data[0]).length;
    for (let i = 0; i < rows; i++) {
      let colArr = [];
      for (let j = 0; j < cols; j++) {
        colArr.push(0);
      }
      this.matrixHelper.push(colArr);
    }
  }

  hasMerge({ row, col } = { row: 0, col: 0 }) {
    return this.matrixHelper[row] && this.matrixHelper[row][col] && this.matrixHelper[row][col] === 1;
  }

  /**
   * 判断是否矩阵相等
   * @param {*} { from, to }
   * @param {*} value
   */
  matrixEqual(data,from, to, value) {
    for (let i = from.row; i < to.row - from.row; i++) {
      for (let j = from.col; j < to.col - from.col; j++) {
        if (data[i][j] !== value) {
          return false;
        }
      }
    }
    return true;
  }

  async doExport() {
    let dataSource = this.config.data;
    this.makeSureArray(dataSource);
    let buffer = null;
    try {
      // 此时的data已经是放缩过了的数据
      const data = this.reshapeData(dataSource);
      const excel = new ExcelJS.Workbook();
      excel.created = new Date();
      excel.creator = 'Create by general-export lib';
      const sheet = excel.addWorksheet('Table');
      const outColumns = this.getAvailableProps();
      // 对象的字段顺序映射
      const columnSequnceMapping = {};
      const header =
        outColumns.length === 0
          ? Object.keys(data[0]).map(prop => {
              return { prop: prop, label: prop };
            })
          : outColumns;
      sheet.columns = header
        .orderBy(x => x.order)
        .map((col, colIdex) => {
          //正反向映射
          columnSequnceMapping[col.prop] = colIdex;
          columnSequnceMapping[colIdex] = col.prop;
          return {
            key: col.prop,
            header: col.label
          };
        });
      // 因为多了一行 所以处理要从第二个开始
      sheet.addRows(data);
      // 此时必须还是要拿dataSource取判断
      // 如果是对象行进行cell的合并
      if (this.config.autoMergeAdjacentCol ||this.config.autoMergeAdjacentRow) {
        this.createMatrix(data);
        for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
          const row = Object.entries(data[rowIdx]).orderBy(x => columnSequnceMapping[x[0]]).map(x => x[1]);
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            //如果当前单元格还是没有被合并的单元格
            if (!this.hasMerge({ col: colIdx, row: rowIdx })) {
              let colSpan = 0;
              let rowSpan = 0;
              let dx = 0, dy = 0;
              //是否停止X、Y轴的增量
              let stopDx = false, stopDy = false;
              // 从当前列 最多合并到结束行和结束列
              while (!stopDx && !stopDy) {
                if (row[colIdx + dx] === row[colIdx + dx + 1] &&
                  data[rowIdx + dx + 1][columnSequnceMapping[colIdx + dx]] === row[colIdx + dx]) {
                  //如果这个子矩阵都相同的话，就真正的合并
                  if (this.matrixEqual(data,
                      { row: rowIdx, col: colIdx },
                      { row: rowIdx + dy + 1, col: colIdx + dx + 1 },
                      row[colIdx])) {
                    dx++;
                    dy++;
                  }
                  //否则 就尽可能的合并就算了
                  else {

                  }
                }
                //合并行
                else if (dx <=0 && data[rowIdx + dx + 1][columnSequnceMapping[colIdx+dx]] === row[colIdx+dx]) {
                  dy++;
                  this.matrixHelper[rowIdx + dy][rowIdx + dx] = 1;
                }
                // 合并列
                else if (dy<= 0 && row[colIdx+dx] === row[colIdx + dx + 1]) {
                  dx++;
                  // 被使用了
                  this.matrixHelper[rowIdx + dy][rowIdx + dx] = 1;
                } else {
                  stopDx = true;
                  stopDy = true;
                }

                !stopDx && dx++;
                dx >= row.length - colIdx && (stopDx = true)
                !stopDy && dy++;
                dy >= data.length - rowIdx && (stopDy=true)
              }
              rowSpan = dy;
              colSpan = dx;
              if (rowSpan > 0 || colSpan > 0) {
                console.log(rowSpan, colSpan);
              }
            }
          }
          //如果记录了上一行的关系的话，此刻合并的时候需要参考上一行的信息
          // 对于不跟当前行相同的 就直接合并 否则 就留着 不慌合并
          /*if (Object.isObject(lastColsMap)) {
            Object.entries(lastColsMap).filter(x => x[1].colSpan >0).forEach(([prop, { colSpan, value  }]) => {
              console.log(prop, colSpan, mergeColsMap[prop])
              let cellAddr = null;
              let rowNum = rowIdx;
              //当前行跟上一行合并
              if (colSpan === mergeColsMap[prop].colSpan && value === mergeColsMap[prop].value) {
                // 暂不合并
              }
              // 否则 仅仅上一行合并
              else {
                //如果需要合并N行N列
                if (this.config.autoMergeAdjacentCol && this.config.autoMergeAdjacentRow) {
                  const endColNum = this.getColCellNum(columnSequnceMapping[prop] + 1 + colSpan - 1);
                  const endColAddr = endColNum + '' + rowNum;
                  sheet.mergeCells(cellAddr + ':' + endColAddr);
                  let cell = sheet.getCell(cellAddr);
                  cell && (cell.alignment = { horizontal: 'center' });
                }
                // 合并N行
                else if (this.config.autoMergeAdjacentRow) {

                } else if (this.config.autoMergeAdjacentCol) {

                }
              }
            })
          }*/
          //记住上一行的map
          lastColsMap = mergeColsMap
        }

        /*data.forEach((row, rowIdx) => {
          Object.entries(row).forEach(([colProp, colValue]) => {
            // 1-> A 因为拿到的是序号所以需要+1
            const colNum = this.getColCellNum(columnSequnceMapping[colProp] + 1);
            // 因为第一行用的是表头 所以行号直接是从第二行开始算
            const rowNum = rowIdx + 2;
            const cellAddr = colNum + '' + rowNum;
            if (
              colValue.colSpan > 1 &&
              colValue.rowSpan > 1 &&
              this.config.autoMergeAdjacentCol &&
              this.config.autoMergeAdjacentRow
            ) {
              // 合并行列
              // 同时合并行 和 列
              const endRowNum = rowNum + colValue.rowSpan - 1;
              const endColNum = this.getColCellNum(
                columnSequnceMapping[colProp] + 1 + colValue.colSpan - 1
              );
              const endCellAddr = endColNum + '' + endRowNum;
              sheet.mergeCells(cellAddr + ':' + endCellAddr);
              let cell = sheet.getCell(cellAddr);
              cell &&
                (cell.alignment = { vertical: 'middle', horizontal: 'center' });
            } else if (
              colValue.rowSpan > 1 &&
              this.config.autoMergeAdjacentRow
            ) {
              // 合并行
              // 合并行的时候因为算了自己 所以要减1
              const endRowNum = rowNum + colValue.rowSpan - 1;
              const endRowAddr = colNum + '' + endRowNum;
              sheet.mergeCells(cellAddr + ':' + endRowAddr);
              let cell = sheet.getCell(cellAddr);
              cell && (cell.alignment = { vertical: 'middle' });
            } else if (
              colValue.colSpan > 1 &&
              this.config.autoMergeAdjacentCol
            ) {
              // 如果需要合并列
              // 合并列的时候因为算了自己 所以要减1 并且 先用Num进行加减再进行转化

            }
          });
        });*/
      }
      buffer = await excel.xlsx.writeBuffer();
    } catch (exp) {
      console.error(exp);
      console.error(
        '[ the error has occurred when exporting or the browser can not support export]'
      );
    }
    return typeof Blob === 'undefined' ? buffer : new Blob([buffer]);
  }
}

module.exports = XlsxComponent
