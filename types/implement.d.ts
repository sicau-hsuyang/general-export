
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


interface XlsxComponent extends BaseComponent {

  /**
   * 进制转化 将number -> 二十六个字母 映射规则 1 -> A , 27 = 26 + 1 -> AA,  703 = 26**2 + 26 + 1 -> AAA
   */
  getColCellNum: (num: number) => string

  /**
   * 映射二十六个字母
   */
  getChar: (num: number) => string

}

interface JsonComponent extends BaseComponent {

}

interface TextComponent extends BaseComponent {

}

interface SqlComponent extends BaseComponent { }

interface CsvComponent extends BaseComponent { }

interface XmlComponent extends BaseComponent {

  /**
   * 计算缩进
   */
  calcPrefix: (idx: number) => number

  /**
   * 格式化XML
   */
  formatXml: (xml: string) => string

}
