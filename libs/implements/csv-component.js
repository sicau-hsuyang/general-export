import BaseComponent from "./component";

export default class CsvComponent extends BaseComponent {

  constructor() {
    super()
  }

  doExport() {
    this.makeSureArray(data)
    /**
      // 当以utf-8保存csv的时候，必须加上这个前缀，否则中文将会是乱码
                     content = "\uFEFF" + buffer.toString("utf-8");
     */
  }

}
