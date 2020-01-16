interface Json2XMLSerilizer {

  // 设置需要导出到XML的数据
  setData: (data: any) => void

  // 是否是基础类型
  isBasicEle: (obj: any) => Boolean

  // 转义xml中不合法的字符
  encodeStr: (xmlString: String) => String

  // 序列化数据元素项
  serilizeElement: (prop: String, value: any) => String

  // 计算缩进
  calcPrefix: (preIndent: number) => number

  // 格式化xml
  formatXml: (xmlString: String) => String

  //序列化XML字符串
  serilize: () => String

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

interface JsonComponent extends BaseComponent {}

interface TextComponent extends BaseComponent {}

interface SqlComponent extends BaseComponent { }

interface CsvComponent extends BaseComponent { }

interface XmlComponent extends BaseComponent {
  serilizer: Json2XMLSerilizer;
}
