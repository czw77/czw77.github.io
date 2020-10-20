<template>
    <div id="edComp">
        <div>
            <el-button type="primary" @click="showIdCardTest1">读身份证号</el-button>
        </div>
        <div>
            <el-button type="primary" @click="showIdCardTest2">读身份证姓名</el-button>
        </div>
        <div>
            <el-button type="primary" @click="showPhotoTest1">扫描</el-button>
        </div>
        <div>
            <el-button type="primary" @click="showPhotoTest2">拍照</el-button>
        </div>
        <idCardTest1 ref="idCardTest1"></idCardTest1>
        <idCardTest2 ref="idCardTest2"></idCardTest2>
        <photoTest1 ref="photoTest1"></photoTest1>
        <photoTest2 ref="photoTest2"></photoTest2>
    </div>
</template>

<script>

    import idCardTest1 from './idCardTest1.vue';
    import idCardTest2 from './idCardTest2.vue';
    import photoTest1 from './photoTest1.vue';
    import photoTest2 from './photoTest2.vue';

    export default {
        name: "edComp",
        data(){
            return {

            }
        },
        components:{idCardTest1, idCardTest2, photoTest1, photoTest2},
        mounted() {

        },
        methods : {

            showIdCardTest1:function () {
                this.$refs.idCardTest1.idCardTest1Visible = true;
            },
            showIdCardTest2:function () {
                this.$refs.idCardTest2.idCardTest2Visible = true;
            },
            showPhotoTest1:function () {
                this.$refs.photoTest1.photoTest1Visible = true;
            },
            showPhotoTest2:function () {
                this.$refs.photoTest2.photoTest2Visible = true;
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
    .edTextarea{
        width: 80.25%;
        height: 117px;
        border: black 1px solid;
        margin: 0px 0px 2px 0px;
    }
    .edIdCardNo{
        width: 15%;
        margin: 2px 0px 2px 0px;
    }
</style>