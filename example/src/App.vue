<template>
    <div id="app">
        <img
            alt="Vue logo"
            src="./assets/logo.png"
        >
        <button @click="handleExport">导出数据</button>
    </div>
</template>

<script>
import exportHelper from "../../index.js";
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
        handleExport() {
            exportHelper("数据源.json", this.fetchData, {});
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
