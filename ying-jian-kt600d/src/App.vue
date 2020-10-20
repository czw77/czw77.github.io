<template>
  <div id="app">
    <!--<img alt="Vue logo" src="./assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <edComp></edComp>
    <eloamPhotoComp ref="eloamPhotoRef" @eloamhandle="eloamhandle" @eloamPhotoComplete="eloamPhotoComplete"></eloamPhotoComp>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import edComp from './components/edComp.vue'

import {edApihandle, eloamPhotoComplete, initEdApi, sendThis} from "../static/edAccess";

//高拍仪拍照组件
import eloamPhotoComp from './components/eloamPhotoComp';

export default {
  name: 'App',
  components: {
    edComp,
    eloamPhotoComp,
  },
  mounted() {
    sendThis(this);
    initEdApi(this,function (data) {
      console.info(data);
    });
  },
  methods:{
    //执行高拍仪读卡、指纹等功能
    eloamhandle : function (param) {
      edApihandle(this, param);
    },
    //高拍仪拍照完成后执行的操作
    eloamPhotoComplete : function (data) {
      eloamPhotoComplete(data);
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  /*margin-top: 60px;*/
}
</style>
