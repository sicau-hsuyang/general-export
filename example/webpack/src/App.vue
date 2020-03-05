<template>
    <div id="app">
        <button @click="handleJson">导出JSON数据</button>
        <button @click="handleText">导出Text数据</button>
        <button @click="handleXml">导出XML数据</button>
        <button @click="handleSql">导出Sql数据</button>
        <button @click="handleCsv">导出csv数据</button>
        <button @click="handleXlsx">导出Xlsx数据</button>
    </div>
</template>

<script>
import exportHelper from "../../../index.js";
// import exportHelper from "../../../dist/main.web";
console.log(exportHelper);
export default {
    name: "app",
    methods: {
        fetchData() {
            return [
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
        },
        fetchData1() {
            let data = [
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
                },
                {
                    id: 2,
                    name: "邛海",
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "西昌市",
                    location: "四川省凉山彝族自治州",
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
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "雷波县",
                    location: "四川省凉山彝族自治州",
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
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "西昌市",
                    location: "四川省凉山彝族自治州",
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
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "西昌市",
                    location: "四川省凉山彝族自治州",
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
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "雷波县",
                    location: "四川省凉山彝族自治州",
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
                    province: "四川省",
                    city: "凉山彝族自治州",
                    country: "会理县",
                    location: "四川省凉山彝族自治州",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: false,
                    price: 0
                },
                {
                    id: 8,
                    name: "春熙路",
                    province: "四川省",
                    city: "成都市",
                    country: "锦江区",
                    location: "四川省成都市",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: false,
                    price: 0
                },
                {
                    id: 10,
                    name: "都江堰",
                    province: "四川省",
                    city: "成都市",
                    country: "都江堰市",
                    location: "四川省成都市",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: true,
                    price: 70
                },
                {
                    id: 9,
                    name: "玉屏山",
                    province: "四川省",
                    city: "眉山市",
                    country: "洪雅县",
                    location: "四川省眉山市",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: true,
                    price: 90
                },
                {
                    id: 11,
                    name: "乐山大佛",
                    province: "四川省",
                    city: "乐山市",
                    country: "市中区",
                    location: "四川省乐山市",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: true,
                    price: 60
                },
                {
                    id: 12,
                    name: "峨眉山",
                    province: "四川省",
                    city: "乐山市",
                    country: "峨眉山市",
                    location: "四川省乐山市",
                    position: {
                        lat: null,
                        lng: null
                    },
                    isTicket: true,
                    price: 180
                }
            ];
            let locationPos = 0;
            let proPos = 0;
            let output = data.map(x => {
                let obj = {};
                Object.entries(x).map(([prop, value]) => {
                    obj[prop] = {
                        value,
                        colSpan: 1,
                        rowSpan: 1
                    };
                });
                return obj;
            });
            output.forEach((item, idx) => {
                // 如果 省份和地级市相同 就合并
                if (
                    item.province.value + item.city.value ===
                    item.location.value
                ) {
                    item.province.colSpan = 2;
                    item.city.colSpan = 0;
                    item.province.value = item.province.value + item.city.value;
                }

                if (idx !== 0) {
                    if (
                        item.location.value === output[idx - 1].location.value
                    ) {
                        item.location.rowSpan = 0;
                        output[locationPos].location.rowSpan++;
                    } else {
                        locationPos = idx;
                    }

                    if (
                        item.province.value === output[idx - 1].province.value
                    ) {
                        item.province.rowSpan = 0;
                        // 需要把横向数据置为0
                        item.province.colSpan > 1 &&
                            (item.province.colSpan = 0);
                        output[proPos].province.rowSpan++;
                    } else {
                        proPos = idx;
                    }
                }
            });
            console.log(output);
            return output;
        },
        handleJson() {
            exportHelper("数据源.json", this.fetchData, {});
        },
        handleText() {
            exportHelper("数据源.txt", this.fetchData, {
                columns: {
                    id: {
                        label: "序号"
                    },
                    name: {
                        label: "景点名称"
                    },
                    location: {
                        label: "地址"
                    },
                    price: {
                        label: "门票价格",
                        formatter(price) {
                            return price == 0 ? "-" : price;
                        }
                    }
                }
            });
        },
        handleXml() {
            exportHelper("数据源.xml", this.fetchData, {
                columns: [
                    { prop: "id", label: "序号" },
                    { prop: "name", label: "景点名称" },
                    {
                        prop: "location",
                        label: "地址"
                    },
                    {
                        prop: "price",
                        label: "门票价格",
                        formatter(price) {
                            return price == 0 ? "-" : price;
                        }
                    }
                ],
                encode: "gbk"
            });
        },
        handleSql() {
            exportHelper("数据源.sql", this.fetchData, {
                columns: [
                    { prop: "id", label: "序号" },

                    { prop: "name", label: "景点名称" },
                    {
                        prop: "location",
                        label: "地址"
                    },
                    {
                        prop: "price",
                        label: "门票价格",
                        formatter(price) {
                            return price == 0 ? "-" : price;
                        }
                    }
                ],
                encode: "gbk"
            });
        },
        handleCsv() {
            exportHelper("数据源.csv", this.fetchData1, {
                // columns: [
                //     { prop: "id", label: "序号" },
                //     { prop: "name", label: "景点名称" },
                //     {
                //         prop: "location",
                //         label: "地址"
                //     },
                //     {
                //         prop: "price",
                //         label: "门票价格",
                //         formatter(price) {
                //             return price == 0 ? "-" : price;
                //         }
                //     }
                // ]
            });
        },
        handleXlsx() {
            exportHelper("数据源.xlsx", this.fetchData1, {
                columns: [
                    { prop: "id", label: "序号" },
                    { prop: "name", label: "景点名称" },
                    { prop: "province", label: "省/市/自治区" },
                    { prop: "city", label: "市/州" },
                    { prop: "country", label: "区县" },
                    {
                        prop: "location",
                        label: "地址"
                    },
                    {
                        prop: "price",
                        label: "门票价格",
                        formatter(price) {
                            return price == 0 ? "-" : price;
                        }
                    }
                ]
            });
        }
    }
};
</script>

<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
