var { GeneralExport } = require("../../dist/main.node.js");
var data = [
  {
    id: 1,
    name: "螺髻山",
    location: "四川省凉山彝族自治州普格县",
    position: {
      lat: null,
      lng: null
    },
    isTicket: true,
    price: 100
  },
  {
    id: 2,
    name: "邛海",
    location: "四川省凉山彝族自治州西昌市",
    position: {
      lat: null,
      lng: null
    },
    isTicket: true,
    price: 25
  },
  {
    id: 3,
    name: "大风顶",
    location: "四川省凉山彝族自治州雷波县",
    position: {
      lat: null,
      lng: null
    },
    isTicket: true,
    price: 200
  },
  {
    id: 4,
    name: "泸山",
    location: "四川省凉山彝族自治州西昌市",
    position: {
      lat: null,
      lng: null
    },
    isTicket: true,
    price: 100
  },
  {
    id: 5,
    name: "西昌古城",
    location: "四川省凉山彝族自治州西昌市",
    position: {
      lat: null,
      lng: null
    },
    isTicket: false,
    price: 0
  },
  {
    id: 6,
    name: "马湖",
    location: "四川省凉山彝族自治州雷波县",
    position: {
      lat: null,
      lng: null
    },
    isTicket: false,
    price: 0
  },
  {
    id: 7,
    name: "会理古城",
    location: "四川省凉山彝族自治州会理县",
    position: {
      lat: null,
      lng: null
    },
    isTicket: false,
    price: 0
  }
];
function fetchData() {
  return data;
}
GeneralExport('数据源.csv', fetchData)
GeneralExport('数据源.xml', fetchData)
GeneralExport('数据源.txt', fetchData)
GeneralExport("数据源.xlsx", fetchData)
GeneralExport("数据源.sql", fetchData)
GeneralExport("数据源.json", data)
