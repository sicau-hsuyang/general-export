const SqlComponent = require("./implements/sql-component");
const TextComponent = require("./implements/text-component");
const JsonComponent = require("./implements/json-component");
const XmlComponent = require("./implements/xml-component");
const XlsxComponent = require("./implements/xlsx-component");
const CsvComponent = require("./implements/csv-component");
const utils = require("./utils");
const path = require("path")
const fs = require("fs")
class BSRunner {

  /**
   * @type { BaseComponent }
   */
  worker

  /**
   * @type { ExportConfig }
   */
  config = this.getDefault()

  constructor(filename, dataSource, options) {
    // 设置配置项目中的数据
    Object.assign(this.config, this.getDefault(), options, {
      filename,
      data: dataSource
    });
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
      columns: undefined,
      // 文件编码
      // 默认utf-8
      encode: 'utf-8'
    }
  }

  gen() {
    let dataSource = this.config.data;
    // 把新的配置覆盖到顶层变量上去，可以随意使用这些配置
    return new Promise((resolve, reject) => {
      const exportData =
        typeof dataSource === 'function' ? dataSource() : dataSource;
      if (utils.isPromise(exportData)) {
        exportData.then(data => {
          this.generateFile(data).then(resolve).catch(reject);
        });
      } else {
        this.generateFile(exportData).then(resolve).catch(reject)
      }
    });
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
      case 'xls':
      case 'xlsx':
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
   * 将Blob导出至文件
   * @param {Blob} blob
   */
  saveBlob2File(blob) {
    let filename = this.config.filename
    var urlObject = URL || webkitURL
    if (!urlObject || typeof Blob === 'undefined') {
      throw ('当前JS环境无法导出!')
    }
    // 对于IE10以上
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename)
    } else {
      var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
      save_link.href = urlObject.createObjectURL(blob)
      save_link.download = filename
      // var ev = document.createEvent('MouseEvents')
      // ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      // save_link.dispatchEvent(ev)
      save_link.click()
    }
  }


  saveFile(txt, savePath) {
    let filePath = savePath
    if (filePath && !fs.existsSync(filePath)) {
      throw `[${filePath} is not exist, please check up]`
    } else {
      filePath = process.cwd();
      if (!fs.existsSync(path.resolve(filePath, "exports"))) {
        fs.mkdirSync("exports")
      }
      filePath = path.resolve(filePath, "exports")
    }
    fs.writeFileSync(filePath + "/" + this.config.filename, txt)
  }

  /**
   * 将txt导出至文件
   * @param {String} inputTxt
   */
  saveTxt2File(inputTxt) {
    return utils.isNodeEnv() ? this.saveFile(inputTxt) : this.saveBlob2File(new Blob([inputTxt]))
  }

  /**
   * 生成导出文件
   */
  async generateFile(dataSource) {
    this.config.data = dataSource;
    let ext = this.getExtByFilename(this.config.filename);
    this.workerStrategyFactory(ext);
    let content = await this.worker.doExport();
    typeof Buffer !== undefined && Buffer.isBuffer(content)
      ? this.saveFile(content)
      : utils.isBlob(content)
      ? this.saveBlob2File(content)
      : this.saveTxt2File(content);
    return true;
  }

}

module.exports = BSRunner
