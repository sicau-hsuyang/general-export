import SqlComponent from "./implements/sql-component"
import TextComponent from "./implements/text-component"
import JsonComponent from "./implements/json-component"
import XmlComponent from "./implements/xml-component"
import XlsxComponent from "./implements/xlsx-component"
import CsvComponent from "./implements/csv-component"
import utils from "./utils"

export default class BSRunner {

  /**
   * @type { BaseComponent }
   */
  worker = null

  config = {}

  constructor(filename, dataSource, options) {
    let ext = this.getExtByFilename(filename);
    this.workerStrategyFactory(ext);
    this.gen(filename, dataSource, options)
  }


  /**
   * 获取程序包的默认配置信息
   * @returns {Object}
   */
  getDefault() {
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

  gen(filename, dataSource, options) {
    // 把新的配置覆盖到顶层变量上去，可以随意使用这些配置
    Object.assign(this.config, this.getDefault(), options, { filename })
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
   * 根据文件名获取文件后缀
   * @returns {String}
   */
  getExtByFilename(filename) {
    let lastPointIdx = filename.lastIndexOf('.')
    if (lastPointIdx < 0) {
      throw `[filename is wrong]`
    }
    return filename.substring(lastPointIdx + 1)
  }

  /**
   * 获取导出策略实例类
   * @param {String} ext 导出文件类型
   */
  workerStrategyFactory(ext) {
    switch (ext) {
      case 'sql':
        this.worker = new SqlComponent(this.config)
        break
      case 'txt':
        this.worker = new TextComponent(this.config)
        break
      case 'json':
        this.worker = new JsonComponent(this.config)
        break
      case 'xml':
        this.worker = new XmlComponent(this.config)
        break
      case 'excel':
        this.worker = new XlsxComponent(this.config);
        break
      case 'csv':
        this.worker = new CsvComponent(this.config)
        break
      default:
        console.error("[we cannot export the specific extension '" + ext + "' file you want to export]")
        break
    }
  }


  /**
   * 导出数据方法
   * @param {String} inputTxt
   */
  saveTxt2File(inputTxt) {
    let filename = this.config.filename
    var urlObject = window.URL || window.webkitURL
    if (!urlObject || typeof Blob === 'undefined') {
      throw ('当前JS环境无法导出!')
    }

    var export_blob = new Blob([inputTxt])
    // 对于IE10以上
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(export_blob, filename)
    } else {
      var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link.href = urlObject.createObjectURL(export_blob)
      save_link.download = filename
      var ev = document.createEvent('MouseEvents')
      ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      save_link.dispatchEvent(ev)
    }
  }

  /**
   * 生成导出文件
   * @param {Array<Object>} dataSource 导出数据源
   */
  async generateFile(dataSource) {
    Object.assign(this.config, { data: dataSource })
    let textContent = await this.worker.doExport();
    this.saveTxt2File(textContent)
  }

}
