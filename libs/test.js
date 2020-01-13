const JsonToXmlSerilizer = require("./json2xml-serilizer");
var a = new JsonToXmlSerilizer(
  {
    name: '杨旭',
    age: {
      value: 24
    },
    location: '四川省成都市',
    position: {
      lat: null,
      lng: null
    },
    regExp: /\d+/igm,
    now: new Date(),
    func: function name(params) {

    },
    123: "yangxu",
    books: [
      '<Javascript高级程序\'设计>',
      '<JS语言精粹">',
      '你不知道的JavaScript(上)',
      '你不知道的JavaScript(中)',
      '你不知道的JavaScript(下)'
    ],
    "*": "1"
  }
);

let xml = a.serilize()

console.log(xml)
