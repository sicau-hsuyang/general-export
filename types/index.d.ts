
interface Column {

  label: string;

  prop: string;

  formatter: (row: any) => string;

}

interface Columns{

  [key: string]: Column

}

type ExportPropsType = 'all' | Array<Column> | Columns

interface ExportConfig {

  //泛型
  data: Array<Object>

  filename: string | null;

  // 可选 导出的标题 支持的类型有
  // object->{ [prop]: 'label' } 或者 { [prop]: { label: '标题', ...otherProps } } 这样的对象
  // 对象数组 { prop: 'age', label: '年纪', ...otherProps }
  // 默认 undefined
  exportHeaders: undefined | Array<Column> | Columns,
  // 可选 可以供导出的字段 支持 string 数组 对象
  // 如果提供了导出标题 则自动忽略此项
  // 默认 'all'
  exportProps: ExportPropsType,
  // 文件编码
  // 默认utf-8
  encode: string

}


interface BaseComponent {

  config: ExportConfig;

  doExport: (dataSource: Array<any>) => string

}
