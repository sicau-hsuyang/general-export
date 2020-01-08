<template>
    <div class="export-button">
        <el-button
            class="export-btn"
            :class="{ 'no-selector': !showSelector }"
            :loading="loading"
            icon="el-icon-download"
            :type="type"
            plain
            @click="handleExport"
        >导出</el-button>
        <el-select
            v-if="showSelector"
            v-model="selectExt"
            class="export-selector"
            :class="'export-'+type"
        >
            <el-option
                v-for="(option, idx) in options"
                :key="idx"
                :class="'export-'+type+'__option'"
                :label="option.label"
                :value="option.value"
            ></el-option>
        </el-select>
    </div>
</template>

<script>
import { utils, exportRaw } from "@/utils";
import mime from "mime";
const Excel = require("exceljs");
export default {
    name: "ExportButton",
    props: {
        data: {
            type: [Array, Function],
            required: true
        },
        type: {
            type: String,
            required: false,
            default: "success"
        },
        filename: {
            type: String,
            default: "untitled"
        },
        exportProps: {
            type: [Array, Function],
            required: false,
            default: () => {
                return [];
            }
        },
        permittedExt: {
            type: [Array, String],
            required: false,
            default: () => ["JSON", "Text", "SQL", "Excel", "XML", "CSV"]
        },
        showSelector: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data() {
        return {
            loading: false,
            selectExt: "Excel"
        };
    },
    computed: {
        options() {
            return typeof this.permittedExt === "string"
                ? [
                      {
                          value: this.permittedExt,
                          label: this.permittedExt
                      }
                  ]
                : this.permittedExt.map(x => {
                      return {
                          label: x,
                          value: x
                      };
                  });
        }
    },
    methods: {
        exportRaw,
        handleExport() {
            if (this.loading) {
                this.$message.error("操作进行中，请稍后...");
                return;
            }
            this.loading = true;
            const exportData =
                typeof this.data === "function" ? this.data() : this.data;
            // 如果是函数且返回的是Promise
            if (exportData && typeof exportData.then === "function") {
                exportData.then(res => {
                    this.generateFile(res);
                });
            } else {
                // 否则直接得到数据
                this.generateFile(exportData);
            }
        },
        // 生成文件
        generateFile(dataSource) {
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                this.loading = false;
                this.$message.warning("当前暂时没有任何数据可供导出!");
                return;
            }
            const type = this.selectExt.toLowerCase();
            let txt = null;
            switch (type) {
                case "sql":
                    txt = this.sqlPattern(dataSource);
                    txt && this.exportRaw(this.filename + ".sql", txt);
                    break;
                case "text":
                    txt = this.txtPattern(dataSource);
                    txt && this.exportRaw(this.filename + ".txt", txt);
                    break;
                case "json":
                    txt = this.jsonPattern(dataSource);
                    txt && this.exportRaw(this.filename + ".json", txt);
                    break;
                case "xml":
                    txt = this.xmlPattern(dataSource);
                    txt && this.exportRaw(this.filename + ".xml", txt);
                    break;
                case "excel":
                    this.excelExport(this.filename + ".xlsx", dataSource);
                    break;
                case "csv":
                    this.csvExport(this.filename + ".csv", dataSource);
                    break;
                default:
                    break;
            }
            this.loading = false;
        },
        getVisibleProps() {
            let exportProps = this.exportProps;
            typeof exportProps === "function" &&
                (exportProps = this.exportProps());
            return exportProps;
        },
        reshapeData(list) {
            return list.map(record => {
                return utils.isObject(record) ? this.mappingRecord(record) : {};
            });
        },
        isUndefined(val) {
            return typeof val === "undefined";
        },
        /**
         * 非纯数据 这样的数据必须是 { rowSpan: 1, colSpan: 1, value: null },引入rowSpan和colSpan主要是供导出
         */
        isObjValue(obj) {
            return (
                Object.keys(obj).length === 3 &&
                !this.isUndefined(obj.colSpan) &&
                !this.isUndefined(obj.rowSpan) &&
                !this.isUndefined(obj.value)
            );
        },
        // 如果每条记录上都是这样的 { rowSpan: 1, colSpan: 1, value: null }
        isObjRecord(record) {
            return Object.values(record).every(x => this.isObjValue(x));
        },
        shrinkRow(obj) {
            const shrinkObj = {};
            Object.entries(obj).forEach(([prop, objValue]) => {
                shrinkObj[prop] = objValue.value;
            });
            return shrinkObj;
        },
        // 放缩 对象的属性
        mappingRecord(record) {
            // 去掉label
            const exportProps = this.getVisibleProps().map(x => x.prop);
            // 如果exportProps是空数组，则认为导出全部数据
            if (Array.isArray(exportProps) && exportProps.length === 0) {
                // 如果是带有colSpan 和 rowSpan的数据 需要进行缩小 仅仅只需要取value字段
                return this.isObjRecord(record)
                    ? this.shrinkRow(record)
                    : record;
            } else {
                // 否则需要映射数据
                const newObj = {};
                Object.entries(record).forEach(([key, propData]) => {
                    // 如果是带有 colSpan 和 rowSpan的数据 则需要 取value字段
                    exportProps.includes(key) &&
                        (newObj[key] = this.isObjValue(propData)
                            ? propData.value
                            : propData);
                });
                return newObj;
            }
        },
        // 导出sql
        sqlPattern(dataSource) {
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                console.error("parameter is wrong");
                return "";
            }
            const data = this.reshapeData(dataSource);
            const valueFmt = record => {
                const values = Object.values(record);
                return (
                    "(" +
                    values
                        .map(value => {
                            // null number undefined object string boolean
                            if (typeof value === "undefined") {
                                return "undefined";
                            } else if (utils.isNull(value)) {
                                return "null";
                            } else if (
                                utils.isObject(value) ||
                                utils.isString(value)
                            ) {
                                return JSON.stringify(value);
                            } else {
                                return value;
                            }
                        })
                        .join(",") +
                    ")"
                );
            };
            const props = Object.keys(data[0])
                .map(prop => {
                    return "`" + prop + "`";
                })
                .join(",");
            const values = data.map(record => valueFmt(record)).join(",");
            return `INSERT INTO \`Table\` (${props}) VALUES ${values}`;
        },
        // 导出txt
        txtPattern(dataSource) {
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                console.error("parameter is wrong");
                return "";
            }
            const data = this.reshapeData(dataSource);
            const valueFmt = record => {
                const values = Object.values(record);
                return values
                    .map(value => {
                        // null number undefined object string boolean
                        if (typeof value === "undefined") {
                            return "undefined";
                        } else if (utils.isNull(value)) {
                            return "null";
                        } else if (utils.isObject(value)) {
                            return JSON.stringify(value);
                        } else {
                            return value;
                        }
                    })
                    .join("\t");
            };

            // 去掉label
            let exportProps = this.getVisibleProps().map(x => x.label);
            if (exportProps.length <= 0) {
                exportProps = Object.keys(data[0]);
            }

            return (
                exportProps.join("\t") +
                "\r\n" +
                data
                    .map(record => {
                        return valueFmt(record);
                    })
                    .join("\r\n")
            );
        },
        formatXml(xmlStr) {
            var text = xmlStr;
            // 使用replace去空格
            text =
                "\n" +
                text
                    .replace(/(<\w+)(\s.*?>)/g, function($0, name, props) {
                        return name + " " + props.replace(/\s+(\w+=)/g, " $1");
                    })
                    .replace(/>\s*?</g, ">\n<");
            // 处理注释
            text = text
                .replace(/\n/g, "\r")
                .replace(/<!--(.+?)-->/g, function($0, text) {
                    var ret = "<!--" + escape(text) + "-->";
                    return ret;
                })
                .replace(/\r/g, "\n");
            // 调整格式  以压栈方式递归调整缩进
            var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/gm;
            var nodeStack = [];
            var output = text.replace(
                rgx,
                (
                    $0,
                    all,
                    name,
                    isBegin,
                    isCloseFull1,
                    isCloseFull2,
                    isFull1,
                    isFull2
                ) => {
                    var isClosed =
                        isCloseFull1 === "/" ||
                        isCloseFull2 === "/" ||
                        isFull1 === "/" ||
                        isFull2 === "/";
                    var prefix = "";
                    if (isBegin === "!") {
                        //! 开头
                        prefix = this.calcPrefix(nodeStack.length);
                    } else {
                        if (isBegin !== "/") {
                            // /开头
                            prefix = this.calcPrefix(nodeStack.length);
                            if (!isClosed) {
                                // 非关闭标签
                                nodeStack.push(name);
                            }
                        } else {
                            nodeStack.pop(); // 弹栈
                            prefix = this.calcPrefix(nodeStack.length);
                        }
                    }
                    var ret = "\n" + prefix + all;
                    return ret;
                }
            );
            var outputText = output.substring(1);
            // 还原注释内容
            outputText = outputText
                .replace(/\n/g, "\r")
                .replace(/(\s*)<!--(.+?)-->/g, function($0, prefix, text) {
                    if (prefix.charAt(0) === "\r") {
                        prefix = prefix.substring(1);
                    }
                    text = unescape(text).replace(/\r/g, "\n");
                    var ret =
                        "\n" +
                        prefix +
                        "<!--" +
                        text.replace(/^\s*/gm, prefix) +
                        "-->";
                    return ret;
                });
            outputText = outputText.replace(/\s+$/g, "").replace(/\r/g, "\r\n");
            return outputText;
        },
        calcPrefix(prefixIndex) {
            var result = "";
            var span = "\t"; // 缩进长度
            var output = [];
            for (var i = 0; i < prefixIndex; ++i) {
                output.push(span);
            }
            result = output.join("");
            return result;
        },
        createXMLDOM() {
            var xmlDOM = null;
            if (typeof window.ActiveXObject !== "undefined") {
                // eslint-disable-next-line no-undef
                xmlDOM = new ActiveXObject("Microsoft.XMLDOM");
            } else if (
                document.implementation &&
                document.implementation.createDocument
            ) {
                xmlDOM = document.implementation.createDocument("", "", null);
            } else {
                this.$message.warning(
                    "您的浏览器不支持文档对象XMLDOM,无法导出XML格式的数据!"
                );
                return;
            }
            return xmlDOM;
        },
        // 导出xml
        xmlPattern(dataSource) {
            const prefix = '<?xml version="1.0" encoding="UTF-8" ?>';
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                console.error("parameter is wrong");
                return prefix;
            }
            const data = this.reshapeData(dataSource);
            // 去掉label
            let exportProps = this.getVisibleProps();
            if (exportProps.length <= 0) {
                exportProps = Object.keys(data[0]);
            }
            var doc = this.createXMLDOM();
            if (!doc) {
                return;
            }
            var docType = doc.createProcessingInstruction(
                "xml",
                "version='1.0'  encoding='UTF-8'"
            );
            // 添加文件头
            doc.appendChild(docType);
            var root = doc.createElement("list");
            data.forEach(obj => {
                const level = doc.createElement("data");
                Object.entries(obj).forEach(([key, val]) => {
                    // 如果全部导出 或者 包含导出的key
                    const targetDefine = exportProps.find(x => x.prop === key);
                    if (exportProps.length <= 0 || targetDefine) {
                        const node = doc.createElement(key);
                        node.textContent = val;
                        node.setAttribute("label", targetDefine.label);
                        level.appendChild(node);
                    }
                });
                root.appendChild(level);
            });
            const serializer = new XMLSerializer();
            return this.formatXml(prefix + serializer.serializeToString(root));
        },
        // 导出json
        jsonPattern(dataSource) {
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                console.error("parameter is wrong");
                return "";
            }
            const data = this.reshapeData(dataSource);
            return JSON.stringify(data, null, 2);
        },
        // 导出excel
        excelExport(filename, dataSource) {
            this.exportTable(filename, dataSource, "xlsx");
        },
        // 导出csv
        csvExport(filename, dataSource) {
            this.exportTable(filename, dataSource, "csv");
        },
        async exportTable(filename, dataSource, fmt) {
            if (!Array.isArray(dataSource) || dataSource.length <= 0) {
                console.error("parameter is wrong");
                return "";
            } else if (!["xlsx", "csv"].includes(fmt.toLowerCase())) {
                console.error("only support xlsx and csv");
                return;
            }
            const data = this.reshapeData(dataSource);
            const excel = new Excel.Workbook();
            excel.created = new Date();
            const sheet = excel.addWorksheet("Table");
            const exportProps = this.getVisibleProps();
            // 对象的字段顺序映射
            const columnSequnceMapping = {};
            const header =
                exportProps.length === 0
                    ? Object.keys(data[0]).map(prop => {
                          return { prop: prop, label: prop };
                      })
                    : exportProps;
            sheet.columns = header.map((col, colIdex) => {
                columnSequnceMapping[col.prop] = colIdex;
                return {
                    key: col.prop,
                    header: col.label
                };
            });
            // 因为多了一行 所以处理要从第二个开始
            sheet.addRows(data);
            try {
                let buffer = null;
                let content = null;
                if (fmt === "xlsx") {
                    const targetProps = this.getVisibleProps().map(x => x.prop);
                    // 此时必须还是要拿dataSource取判断
                    dataSource
                        .map(x => {
                            if (
                                Array.isArray(targetProps) &&
                                targetProps.length === 0
                            ) {
                                // 如果不需要放缩
                                return x;
                            } else {
                                // 否则需要映射数据
                                const newObj = {};
                                Object.entries(x).forEach(([key, propData]) => {
                                    // 如果是带有 colSpan 和 rowSpan的数据 则需要 取value字段
                                    targetProps.includes(key) &&
                                        (newObj[key] = propData);
                                });
                                return newObj;
                            }
                        })
                        .forEach((row, rowIdx) => {
                            Object.entries(row).forEach(([prop, propValue]) => {
                                const colNum = this.getColCellNum(
                                    columnSequnceMapping[prop] + 1
                                );
                                // 因为第一行用的是表头 所以行号直接是从第二行开始算
                                const rowNum = rowIdx + 2;
                                const cellAddr = colNum + "" + rowNum;
                                if (propValue.rowSpan > 1) {
                                    // 合并行的时候因为算了自己 所以要减1
                                    const endRowNum =
                                        rowNum + propValue.rowSpan - 1;
                                    const endAddr = colNum + "" + endRowNum;
                                    sheet.mergeCells(cellAddr + ":" + endAddr);
                                }
                            });
                        });
                    buffer = await excel.xlsx.writeBuffer();
                    content = new Blob([buffer], { type: mime.getType(fmt) });
                } else {
                    buffer = await excel.csv.writeBuffer();
                    // 当以utf-8保存csv的时候，必须加上这个前缀，否则中文将会是乱码
                    content = "\uFEFF" + buffer.toString("utf-8");
                }
                this.exportRaw(filename, content);
            } catch (exp) {
                console.error(exp);
                this.$message.error(
                    "导出遇到错误或当前浏览器不支持客户端导出!"
                );
            }
        }
    }
};
</script>

<style lang="scss">
.export-button {
    display: inline-block;
}

.export-btn {
    width: 70px;
    float: left;
    box-sizing: border-box;
    border-right: 0px;
    height: 40px;
    padding: 0px;
    line-height: 40px;
    text-align: center;
}

.no-selector {
    border-right-style: solid;
    border-right-width: 1px;
}

.export-selector {
    width: 85px;
    float: left;
    box-sizing: border-box;
    border-left: 0px;
}

.export-success {
    &__option.selected {
        color: #67c23a;
    }
    input {
        border-color: #c2e7b0 !important;
    }
}

.export-primary {
    input {
        border-color: #bcc5e8 !important;
    }
}
</style>
