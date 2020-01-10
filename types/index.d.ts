
interface Column {

  label: string;

  prop: string;

  formatter: (prop: any, row: any) => string;

}

interface Columns {

  [key: string]: Column

}

interface ExportConfig {

  //泛型
  data: Array<Object>

  filename: string | null;

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
 * @interface BaseComponent
 */
interface BaseComponent {

  config: ExportConfig;

  makeSureArray: (dataSource: Array<any>) => throw;

  reshapeData: (row: any) => any

  doExport: (dataSource: Array<any>) => string

}


/**
 * @interface BSRunner
 */
interface BSRunner {

  gen: (filename: string, dataSource: Array<any>, options: ExportConfig) => void

  getDefault: () => ExportConfig

  workerStrategyFactory: (ext: string) => BaseComponent

  saveBlob2File: (blob: Blob) => void

  saveString2File: (str: string) => void

  generateFile: (dataSource: Array<ant>) => Promise<void>

}
