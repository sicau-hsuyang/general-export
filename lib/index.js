import Excel from 'exceljs'
import { isPromise, isNull, isString, isObject, isUndefined, formatXml, createXMLSchema, blob2String } from './utils'

const defaultOptions = {}

function getExtByFilename(filename) {
  let lastPointIdx = filename.lastIndexOf('.')
  if (lastPointIdx < 0) {
    throw `[filename is wrong]`
  }
  return filename.substring(lastPointIdx + 1)
}

function makeSureArray(data) {
  if (!Array.isArray(data)) {
    throw `[the data must be an array]`
  }
}

function stringify(value) {
  if (isUndefined(value)) {
    return 'undefined'
  } else if (isNull(value)) {
    return 'null'
  } else if (isObject(value) || isString(value)) {
    return JSON.stringify(value)
  } else {
    //todo 2020/1/ 正则 和 日期 函数
    return value
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
 */
function exportTxt(dataSource) {
  makeSureArray(dataSource)
  const data = reshapeData(dataSource)
  const valueFmt = (record) => {
    const values = Object.values(record)
    return values.map(value => stringify(value)).join('\t')
  }

  // 去掉label todo
  let exportProps = getVisibleProps().map(x => x.label)
  if (exportProps.length <= 0) {
    exportProps = Object.keys(data[0])
  }

  return exportProps.join('\t') + '\r\n' + data.map(record => {
    return valueFmt(record)
  }).join('\r\n')
}

/**
 * 导出JSON
 * @param {Array} dataSource 数据源
 */
function exportJson(dataSource) {
  makeSureArray(dataSource)
  const data = reshapeData(dataSource)
  return JSON.stringify(data, null, 2)
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
  let exportProps = getVisibleProps()
  if (exportProps.length <= 0) {
    exportProps = Object.keys(data[0])
  }
  var docSchema = createXMLSchema()
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
  return formatXml(prefix + serializer.serializeToString(root))
}

async function exportExcel(dataSource) {
  makeSureArray(dataSource)
  const data = reshapeData(dataSource)
  const excel = new Excel.Workbook()
  excel.created = new Date()
  const sheet = excel.addWorksheet('Table')
  const exportProps = getVisibleProps()
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
    let excelStr = await blob2String(blob)
    // this.exportRaw(filename, blob);
  } catch (exp) {
    console.error('[ the error has occurred when exporting or the browser can not support export]')
  }
}

function exportCsv(data) {
  makeSureArray(data)
}

function generateFile(dataSource, filename) {
  let ext = getExtByFilename(filename);
  switch (ext) {
    case 'sql':
      txt = exportSql(dataSource)
      break
    case 'text':
      txt = exportTxt(dataSource)
      // txt && exportRaw(filename, txt)
      break
    case 'json':
      txt = exportJson(dataSource)
      // txt && exportRaw(filename, txt)
      break
    case 'xml':
      txt = exportXml(dataSource)
      // txt && exportRaw(filename, txt)
      break
    case 'excel':
      exportExcel(filename, dataSource)
      break
    case 'csv':
      exportCsv(filename, dataSource)
      break
    default:
      console.error("[we cannot export the specific extension '" + ext + "' file you want to export]")
      break
  }
}

export function getDefault() {
  return {
    //todo 2020/1/7
    exportProps: 'all',
    encode: 'utf8'
  }
}

export function gen(filename, dataSource, options) {
  // 把新的配置覆盖到顶层变量上去，可以随意使用这些配置
  Object.assign(defaultOptions, options)
  const exportData = typeof dataSource === 'function' ? dataSource() : dataSource
  if (isPromise(exportData)) {
    exportData.then(data => {
      generateFile(data, filename)
    })
  } else {
    generateFile(exportData, filename)
  }
}
