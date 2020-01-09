import utils from "../utils"

export default class BaseComponent {

  config = null;

  get utils() {
    return utils
  }

  constructor(runtimeConfig) {
    this.config = runtimeConfig
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
      !this.utils.isUndefined(obj.colSpan) &&
      !this.utils.isUndefined(obj.rowSpan) &&
      !this.utils.isUndefined(obj.value)
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

  // 放缩 对象的属性
  mappingRow(record) {
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

  makeSureArray(data) {
    if (!Array.isArray(data)) {
      throw `[the data must be an array]`
    }
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

  /**
   * 基类方法 导出核心方法 必须由子类实现
   * @param {Array<Object>} dataSource
   * @throws 抛出没有实现的方法
   * @returns {String|Blob}
   */
  doExport(dataSource) {
    throw `[the do-work method must be implemented]`
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

}
