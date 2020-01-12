# General-Export
这是一个浏览器端的通用导出库，支持导出XML、JSON、SQL、Text、Excel、CSV等格式，项目内部依赖了[exceljs](https://github.com/exceljs/exceljs),您只需要提供文件名和数据源，便可以实现一键导出。

# Get Start

## 安装插件
```bash
npm install bs-general-export
```
## 1.在webpack中使用插件
```javascript
import GeneralExport from 'general-export'
// 或者 const GeneralExport = require('general-export').default
// if you use promise
GeneralExport('数据源.xlsx', function() {
  // you must return some data
  return []
}).then((status) => {
  console.log(status)
}).catch((err) => {
  console.log(err)
})

// if you use async-function
try {
  let status = await bsGeneralExport('数据源.xlsx', function() {
    // you must return some data
    return []
  })
} catch(exp) {
  console.error(exp)
}
```

## 2.不使用构建工具
```html
<!-- if you want to export csv or xlsx file, please import exceljs before -->
<div class="container">
  <button id="json">export2json</button>
  <button id="xml">export2xml</button>
  <button id="text">export2txt</button>
  <button id="sql">export2sql</button>
  <button id="csv">export2csv</button>
  <button id="xlsx">export2excel</button>
</div>
<script src="https://cdn.bootcss.com/exceljs/3.0.0/exceljs.js"></script>
<script src="dist/main.js"></script>
<script>
  let helper = GeneralExport.default;
  function requestData() {
    return [
      {
        id: 1,
        name: "螺髻山",
        province: "四川省",
        city: "凉山彝族自治州",
        country: "普格县",
        location: "四川省凉山彝族自治州",
        position: {
          lat: null,
          lng: null
        },
        isTicket: true,
        price: 100
      }]
  }
  
    let json = document.getElementById("json");
    // let xml = document.getElementById("xml");
    // let text = document.getElementById("text")
    // let sql = document.getElementById("sql");
    // let csv = document.getElementById("csv")
    // let xlsx = document.getElementById("xlsx")
    json.addEventListener('click', function () {
      helper('数据源.json', requestData)
    })
</script>
```

## 参数介绍

## Contact Me
Email: 404189928@qq.com John-Yang

# 维护中，敬请期待；Under maintenance, stay tuned
