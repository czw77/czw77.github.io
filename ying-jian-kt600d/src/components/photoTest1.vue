<template>
    <el-dialog title="扫描/人像" :visible.sync="photoTest1Visible" width="80%">
        <div>
            <el-button type="primary" @click="getIdCardInfo">读身份证</el-button>
        </div>
        <div>
            <span>身份证号：</span>
            <el-input v-model="idCardNo" :disabled="true" class="edIdCardNo"></el-input>
        </div>
        <div>
            <el-button type="primary" @click="edPhotohandleEnable">扫描/人像</el-button>
        </div>
        <div>
            <img class="edImg" :src="edPriPhoto">
            <img class="edImg" :src="edSubPhoto">
        </div>
        <div>
            <el-input type="textarea" v-model="edOcrResult" id="edOcrTextarea" class="edTextarea" rows="5" :disabled="true"></el-input>
        </div>
    </el-dialog>
</template>

<script>
    //执行读卡、指纹等功能
    import {edApihandle} from '../../static/edAccess.js'
    //初始化拍照相关功能的回调函数
    import {initEdPhotoApi} from '../../static/edAccess.js'
    //启用拍照组件
    import {edPhotohandle} from '../../static/edAccess.js'
    import {edCode, initEdApi} from "../../static/edAccess";
    export default {
        name: "photoTest1",
        data(){
            return {
                idCardNo: "",
                edPriPhoto:"",
                edSubPhoto:"",
                edOcrResult:"",
                photoTest1Visible: false,
                //捷宇高拍仪本身没有弹框,给其造一个弹框
                jieyuVisibel:false
            }
        },
        mounted() {
            let this_ = this;
            initEdApi(this,function (data) {
                let obj = JSON.parse(data.data);
                //读取身份证
                if(edCode == "1003") {
                    if (obj.user) {
                        this_.idCardNo = obj.user.id;
                    }
                }
                //ocr识别
                if(edCode == "1121"){
                    this_.$refs.eloamPhotoRef.ocrResult = obj.data;
                }
            });
            //初始化拍照相关功能的回调函数
            initEdPhotoApi(this, function(data){
                //获取已发布图片的信息
                let obj = JSON.parse(data.data);
                if(obj.businessJson == null || obj.businessJson == "" || obj.businessJson.length < 1){
                    return;
                }
                let type = JSON.parse(obj.businessJson).type;
                if(obj.Content){
                    let imgPath = obj.Content.replace("data:image/jpg;base64,", "");
                    imgPath = "data:image/jpeg;base64," + imgPath;
                    if(type == "0"){
                        this_.edPriPhoto = imgPath;
                    }
                    if(type == "1"){
                        this_.edSubPhoto = imgPath;
                    }
                }
                if(obj.ocrResult){
                    this_.edOcrResult = JSON.stringify(obj.ocrResult);
                }
            });
        },
        methods : {
            //获取身份证信息
            getIdCardInfo : function() {
                let param = {"code":"1003"};
                edApihandle(this, param);
            },
            //启用拍照组件
            edPhotohandleEnable : function () {
                edPhotohandle(this);
            },
        },
        beforeDestroy(){
            //清除开易高拍仪中的计时器
            if(window.myTimer){
                clearInterval(window.myTimer);
                window.myTimer = null;
            }
        }
    }
</script>

<style scoped>
    .edImg{
        width: 40%;
        height: 480px;
        border: black 1px solid;
        margin: 2px 2px 2px 0px;
    }
</style>