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
            return exportProps.filter(
                item => !["rowSpan", "colSpan"].includes(item.prop)
            );
        },
        reshapeData(list) {
            return list.map(record => {
                return utils.isObject(record) ? this.filterProps(record) : {};
            });
        },
        // 过滤出需要导出的属性
        filterProps(record) {
            // 去掉label
            const exportProps = this.getVisibleProps().map(x => x.prop);
            if (Array.isArray(exportProps) && exportProps.length === 0) {
                // eslint-disable-next-line no-unused-vars
                const { rowSpan, colSpan, ...rest } = record;
                return rest;
            } else {
                const newObj = {};
                Object.entries(record).forEach(([key, value]) => {
                    exportProps.includes(key) && (newObj[key] = value);
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
            dataSource.forEach(obj => {
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
            const header =
                exportProps.length === 0
                    ? Object.keys(data[0]).map(key => {
                          return { prop: key, label: key };
                      })
                    : exportProps;
            sheet.columns = header.map(col => {
                return {
                    key: col.prop,
                    header: col.label
                };
            });
            sheet.addRows(data);
            try {
                const buffer =
                    fmt === "xlsx"
                        ? await excel.xlsx.writeBuffer()
                        : await excel.csv.writeBuffer();
                var blob = new Blob([buffer]);
                this.exportRaw(filename, blob);
            } catch (exp) {
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
