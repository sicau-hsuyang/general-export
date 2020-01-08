import Excel from 'exceljs'
import utils from './utils'

class BSExportComponent {

  config = {}

  constructor(filename, dataSource, options) {
    this.gen(filename, dataSource, options)
  }

  gen(filename, dataSource, options) {
    // 把新的配置覆盖到顶层变量上去，可以随意使用这些配置
    Object.assign(getDefault(), config, options, { filename })
    const exportData = typeof dataSource === 'function' ? dataSource() : dataSource
    if (utils.isPromise(exportData)) {
      exportData.then(data => {
        this.generateFile(data)
      })
    } else {
      this.generateFile(exportData)
    }
  }


  /**
   * 获取导出的标题
   * @returns {Array<string>}
   */
  getExportHeaders() {

  }


  /**
   * 获取可以导出的字段
   * @returns {Array<string>}
   */
  getAvailableProps() {

    // 对于空数组 默认认为可以导出全部
    let props = null;
    if (utils.isString(this.config.exportProps) && this.config.exportProps === 'all') {
      props = []
    }
    //如果是对象
    else if (utils.isObject(this.config.exportProps)) {
      props = Object.keys(this.config.exportProps)
    }
    //如果是Array<string>数组
    else if (Array.isArray(this.config.exportProps)) {
      props = this.config.exportProps;
    }

    return props;
  }

  /**
   * 判断单元格对象是否是复杂类型
   * @param {any} obj 需要判断的单元格对象
   */
  isObjCol(obj) {
    return (
      Object.keys(obj).length === 3 &&
      !utils.isUndefined(obj.colSpan) &&
      !utils.isUndefined(obj.rowSpan) &&
      !utils.isUndefined(obj.value)
    );
  }


  /**
   * 判断数据是否是对象类型
   * @param {Object} record 数据记录
   */
  isObjRow(record) {
    return Object.values(record).every(x => this.isObjCol(x));
  }



  /**
   * 将[prop]: { colSpan: x, rowSpan: x, value: xxx } 这样的对象收缩成 [prop]: xxx
   * @param {Object} obj
   */
  shrinkRow(obj) {
    const shrinkObj = {};
    Object.entries(obj).forEach(([prop, objValue]) => {
      shrinkObj[prop] = objValue.value;
    });
    return shrinkObj;
  }


  /**
   * 标准化数据列表
   * @param {Array<Object>} list 数据源
   */
  reshapeData(list) {
    return list.map(record => {
      if (!utils.isObject(record)) {
        throw `[the row-data must be an object type,please check your datasource]`
      }
      return this.mappingRow(record)
    });
  }



  // 放缩 对象的属性
  mappingRow(record) {
    // 去掉label
    const exportProps = this.getAvailableProps()
    // 如果exportProps是空数组，则认为导出全部数据
    if (exportProps.length === 0) {
      // 如果是带有colSpan 和 rowSpan的数据 需要进行缩小 仅仅只需要取value字段
      return this.isObjRow(record) ? this.shrinkRow(record) : record;
    } else {
      // 否则需要映射数据
      const newObj = {};
      Object.entries(record).forEach(([key, propData]) => {
        // 如果是带有 colSpan 和 rowSpan的数据 则需要 取value字段
        exportProps.includes(key) &&
          (newObj[key] = this.isObjCol(propData) ? propData.value : propData);
      });
      return newObj;
    }
  }

  /**
   * 根据文件名获取文件后缀
   * @returns {String}
   */
  getExtByFilename() {
    let lastPointIdx = this.config.filename.lastIndexOf('.')
    if (lastPointIdx < 0) {
      throw `[filename is wrong]`
    }
    return this.config.filename.substring(lastPointIdx + 1)
  }



  makeSureArray(data) {
    if (!Array.isArray(data)) {
      throw `[the data must be an array]`
    }
  }


  /**
   * 自定义的序列化规则
   * @param {any} value 序列化内容
   */
  stringify(value) {
    if (utils.isUndefined(value)) {
      return 'undefined'
    } else if (utils.isNull(value)) {
      return 'null'
    } else if (utils.isObject(value) || utils.isString(value)) {
      return JSON.stringify(value)
    } else {
      //todo 2020/1/ 正则 和 日期 函数
      return value
    }
  }


  /**
   * 导出JSON
   * @param {Array<Object>} dataSource 数据源
   * @returns {string} 返回字符串
   */
  exportJson(dataSource) {
    this.makeSureArray(dataSource)
    const data = this.reshapeData(dataSource)
    return JSON.stringify(data, null, 2)
  }


  /**
   * 生成导出文件
   * @param {Array<Object>} dataSource 导出数据源
   */
  generateFile(dataSource) {
    // 让全局变量引用数据源，使得在导出的时候可以不用再次传递
    this.config.data = dataSource
    let ext = this.getExtByFilename();
    switch (ext) {
      case 'sql':
        txt = exportSql(dataSource)
        break
      case 'text':
        txt = exportTxt(dataSource)
        // txt && exportRaw(filename, txt)
        break
      case 'json':
        txt = this.exportJson(dataSource)
        // txt && exportRaw(filename, txt)
        break
      case 'xml':
        txt = exportXml(dataSource)
        // txt && exportRaw(filename, txt)
        break
      case 'excel':
        exportExcel()
        break
      case 'csv':
        exportCsv(filename, dataSource)
        break
      default:
        console.error("[we cannot export the specific extension '" + ext + "' file you want to export]")
        break
    }
  }

}



/**
 * 导出sql
 * @param {Array} dataSource
 */
function exportSql(dataSource) {
  makeSureArray(dataSource)
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

/**
 * 导出txt
 * @param {Array} dataSource
 * @returns {string}
 */
function exportTxt(dataSource) {
  makeSureArray(dataSource)
  const data = reshapeData(dataSource)
  const valueFmt = (record) => {
    const values = Object.values(record)
    return values.map(value => stringify(value)).join('\t')
  }
  let exportHeaders = getAvailableProps()
  if (exportHeaders.length <= 0) {
    exportHeaders = Object.keys(data[0])
  }
  return exportHeaders.join('\t') + '\r\n' + data.map(record => {
    return valueFmt(record)
  }).join('\r\n')
}


/**
 * 导出XML
 * @param {Array} dataSource
 */
function exportXml(dataSource) {
  makeSureArray(dataSource)
  const prefix = '<?xml version="1.0" encoding="UTF-8" ?>'
  const data = reshapeData(dataSource)
  // 去掉label
  let exportProps = getAvailableProps()
  if (exportProps.length <= 0) {
    exportProps = Object.keys(data[0])
  }
  var docSchema = utils.createXMLSchema()
  if (!docSchema) {
    return
  }
  var docType = docSchema.createProcessingInstruction('xml', "version='1.0'  encoding='UTF-8'")
  // 添加文件头
  docSchema.appendChild(docType)
  var root = docSchema.createElement('List')
  dataSource.forEach(obj => {
    const level = docSchema.createElement('Item')
    Object.entries(obj).forEach(([key, val]) => {
      // 如果全部导出 或者 包含导出的key
      const targetDefine = exportProps.find(x => x.prop === key)
      if (exportProps.length <= 0 || targetDefine) {
        const node = docSchema.createElement(key)
        node.textContent = val
        node.setAttribute('label', targetDefine.label)
        level.appendChild(node)
      }
    })
    root.appendChild(level)
  })
  const serializer = new XMLSerializer()
  return utils.formatXml(prefix + serializer.serializeToString(root))
}

async function exportExcel() {
  let dataSource = options.data;
  makeSureArray(dataSource)
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

function exportCsv(data) {
  makeSureArray(data)
  /**
    // 当以utf-8保存csv的时候，必须加上这个前缀，否则中文将会是乱码
                   content = "\uFEFF" + buffer.toString("utf-8");
   */
}


/**
 * 获取程序包的默认配置信息
 * @returns {Object}
 */
export function getDefault() {
  return {
    // 导出数据源 运行时设置
    data: [],
    // 导出的文件名 运行时设置
    filename: null,
    // 可选 导出的标题 支持的类型有
    // object->{ [prop]: 'label' } 或者 { [prop]: { label: '标题', ...otherProps } } 这样的对象
    // 对象数组 { prop: 'age', label: '年纪', ...otherProps }
    // 默认 undefined
    exportHeaders: undefined,
    // 可选 可以供导出的字段 支持 string 数组 对象
    // 如果提供了导出标题 则自动忽略此项
    // 默认 'all'
    exportProps: 'all',
    // 文件编码
    // 默认utf-8
    encode: 'utf-8'
  }
}
