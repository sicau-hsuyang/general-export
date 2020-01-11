import utils from "../utils"

export default class BaseComponent {

  /**
   * @type {ExportConfig}
   */
  config;

  get utils() {
    return utils
  }

  constructor(runtimeConfig) {
    this.config = runtimeConfig
  }

  /**
   * 获取可以导出的字段
   * @returns {Array<string>}
   */
  getAvailableProps() {
    // 对于空数组 默认认为可以导出全部
    let props = null;
    if (this.utils.isUndefined(this.config.columns)) {
      props = []
    }
    //如果是对象
    else if (utils.isObject(this.config.columns)) {
      props = Object.entries(this.config.columns).map(([prop, value]) => {
        this.config.columns[prop].prop = prop
        return {
          ...value, prop
        }
      })
    }
    //如果是Array<string>数组
    else if (Array.isArray(this.config.columns)) {
      //将其构造成 hash形式
      let mapping = {}
      this.config.columns.forEach(column => {
        mapping[column.prop] = column
      })
      this.config.columns = mapping
      props = Object.values(this.config.columns)
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
  mappingRows(record) {
    const outColumns = this.getAvailableProps()
    // 如果exportProps是空数组，则认为导出全部数据
    if (outColumns.length === 0) {
      // 如果是带有colSpan 和 rowSpan的数据 需要进行缩小 仅仅只需要取value字段
      return this.isObjRow(record) ? this.shrinkRow(record) : record;
    } else {
      // 否则需要映射数据
      const newObj = {};
      Object.entries(record).forEach(([prop, propData]) => {
        let defineNode = this.config.columns[prop]
        if (defineNode) {
          let col = this.isObjCol(propData) ? propData.value : propData
          let row = this.isObjRow(record) ? this.shrinkRow(record) : record
          let formatter = defineNode.formatter
          newObj[prop] = typeof formatter === 'function' ? formatter(col, row) : col;
        }
        // 如果是带有 colSpan 和 rowSpan的数据 则需要 取value字段
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
      return this.mappingRows(record)
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

  stringifyDate(value) {
    return value.getTime();
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
    } else if (utils.isRegExp(value)) {
      return value.toString()
    } else if (utils.isDate(value)) {
      return this.stringifyDate(value)
    } else {
      return value
    }
  }

}
