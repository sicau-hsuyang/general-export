
interface Column {

  label: string;

  prop: string;

  /**
   * 是否需要格式化当前字段值
   */
  formatter: (prop: any, row: any) => string;

}

interface Columns {
  [key: string]: Column
}

interface ExportConfig {

  //泛型 必选项
  data: Array<Object>
  // 必选项
  filename: string;

  // 可选 导出的标题 支持的类型有
  // object->{ [prop]: 'label' } 或者 { [prop]: { label: '标题', ...otherProps } } 这样的对象
  // 对象数组 { prop: 'age', label: '年纪', ...otherProps }
  // 默认 undefined
  columns: undefined | Array<Column> | Columns;

  // 可选 文件编码 该配置仅对部分导出生效
  // 默认utf-8
  encode: string

}

/**
 * 复杂字段对象
 */
interface ObjCol {

  value: any;

  /**
   * 合并N列
   */
  colSpan: number

  /**
   * 合并N行
   */
  rowSpan: number

}

/**
 * 简单行数据对象
 */
interface Row {
  [key: string]: any;
}

/**
 * 复杂行数据对象
 */
interface ObjRow {
  [key: string]: ObjCol
}

/**
 * 序列化字段数据 null -> 'null', undefined -> 'undefined', number -> number, other -> string
 */
type TextColType = 'null' | 'undefined' | number | string;


interface BSRunner {

  gen: (filename: string, dataSource: Array<any>, options: ExportConfig) => void

  /**
   * 获取组件库的默认配置
   */
  getDefault: () => ExportConfig

  /**
   * 生成导出组件实例
   */
  workerStrategyFactory: (ext: string) => BaseComponent

  /**
   * blob 转 file
   */
  saveBlob2File: (blob: Blob) => void

  /**
   * string 转 file
   */
  saveString2File: (str: string) => void

  /**
   * 生成文件
   */
  generateFile: (dataSource: Array<any>) => Promise<void>

}

interface BaseComponent {

  config: ExportConfig;

  /**
   * 确保数组的正确性 若不是数组 抛出错误
   */
  makeSureArray: (dataSource: Array<any>) => void

  /**
   * 标准化行数据
   */
  reshapeData: (list: Array<ObjRow | Row>) => Array<Row>

  /**
   * 序列化日期类型
   */
  stringifyDate: (date: Date) => string

  /**
   * 生成导出数据
   */
  doExport: () => string | Blob

  /**
   * 获取配置可导出字段
   */
  getAvailableProps: () => Array<Column>

  /**
   * 当前字段 是否是复杂类型
   */
  isObjCol: (row: Object) => boolean

  /**
   * 当前行是否是复杂类型
   */
  isObjRow: (row: Object) => boolean

  /**
   * 复杂对象 缩小成简单对象
   */
  shrinkRow: (objRow: ObjCol) => Row

  /**
   * 将简单或者复杂的行对象转化成匹配导出的简单的行对象
   */
  mappingRows: (row: ObjRow | Row) => Row

  /**
   * 将JS对应的数据类型转化成特定导出类型所需要的类型
   */
  stringify: (value: any) => TextColType;

}
