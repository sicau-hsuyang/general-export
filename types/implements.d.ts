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
