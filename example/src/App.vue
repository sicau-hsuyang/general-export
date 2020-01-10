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
import exportHelper from "../../index.js";
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
            exportHelper("数据源.csv", this.fetchData, {
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
            exportHelper("数据源.xlsx", this.fetchData, {
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
