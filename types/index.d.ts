
interface Column {

  label: string;

  prop: string;

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
  columns: undefined | Array<Column> | Columns,
  // 文件编码
  // 默认utf-8
  encode: string

}

/**
 * 复杂字段对象
 */
interface ObjCol {

  value: any;

  colSpan: number

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

/**
 * @interface BSRunner
 */
interface BSRunner {

  gen: (filename: string, dataSource: Array<any>, options: ExportConfig) => void

  /**
   * 获取
   */
  getDefault: () => ExportConfig

  workerStrategyFactory: (ext: string) => BaseComponent

  saveBlob2File: (blob: Blob) => void

  saveString2File: (str: string) => void

  generateFile: (dataSource: Array<any>) => Promise<void>

}
