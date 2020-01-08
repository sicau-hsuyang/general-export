# General-Export
这是一个浏览器端的通用导出库，支持导出XML、JSON、SQL、Text、Excel、CSV等格式，项目内部依赖了[exceljs](https://github.com/exceljs/exceljs),您只需要提供文件名和数据源，便可以实现一键导出。

# Get Start

## 安装插件
```bash
npm install bs-general-export
```
## 使用插件
```javascript
import bsGeneralExport from 'bs-general-export'
// if you use promise
bsGeneralExport('数据源.xlsx', function() {
  // you must return some data
  return []
}).then((status) => {

}).catch(() => {

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
## 参数介绍

## Contact Me
Email: 404189928@qq.com John-Yang

this is a general export library for JavaScript
