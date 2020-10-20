<template>
    <el-dialog title="高拍仪扫描/人像" :visible.sync="eloamVisible" width="80%">
        <div>
            <div>
                <img :src="eloamPriPreviewPhoto" class="eloamImg">
                <img :src="eloamSubPreviewPhoto" class="eloamImg">
            </div>
            <div>
                <el-checkbox @change="setdeskew">纠偏裁边</el-checkbox>
                <el-checkbox @change="discernOcr">OCR</el-checkbox>
            </div>
            <div>
                <el-button type="primary" @click="rotateLeft">左转</el-button>
                <el-button type="primary" @click="rotateRight">右转</el-button>
                <el-button type="primary" @click="scan">证件扫描</el-button>
                <el-button type="primary" @click="photo">人像采集</el-button>
            </div>
            <div>
                <img :src="eloamPriPhoto" class="eloamImg">
                <img :src="eloamSubPhoto" class="eloamImg">
            </div>
            <div>
                <el-input type="textarea" v-model="ocrResult" class="eloamTextarea" rows="5" :disabled="true"></el-input>
            </div>
            <el-button type="primary" @click="photoConfirm">确定</el-button>
            <el-button type="primary" @click="photoCancel">取消</el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        name: "eloamPhotoComp",
        data(){
            return {
                eloamVisible:false,
                eloamDialog:{},
                eloamPriPreviewPhoto:"",
                eloamSubPreviewPhoto:"",
                eloamPriPhoto:"",
                eloamSubPhoto:"",
                ocrResult:"",
                keyList:[{"name":"blUscc","startKey":"统一社会信用代码","endKey":"营业执"},
                    {"name":"blUscc","startKey":"统一社会信用代码","endKey":"名称"},
                    {"name":"blName","startKey":"名称","endKey":"注册资本"},
                    {"name":"blRegisteredCapital","startKey":"注册资本","endKey":"类型"},
                    {"name":"blType","startKey":"类型","endKey":"成立曰期"},
                    {"name":"blCreateDate","startKey":"成立曰期","endKey":"法定代表人"},
                    {"name":"blLegalRepresentative","startKey":"法定代表人","endKey":"营业期限"},
                    {"name":"blBusinessTerm","startKey":"营业期限","endKey":"经营范围"},
                    {"name":"blBusinessScope","startKey":"经营范围","endKey":"住所"},
                    {"name":"blResidence","startKey":"住所","endKey":"登记机关"},
                    {"name":"blName","startKey":"名称","endKey":"类型"},
                    {"name":"blType","startKey":"类型","endKey":"营业场所"},
                    {"name":"blBusinessPlace","startKey":"营业场所","endKey":"负责人"},
                    {"name":"blResponsiblePerson","startKey":"负责人","endKey":"成立曰期"},
                    {"name":"blCreateDate","startKey":"成立曰期","endKey":"营业期限"},
                    {"name":"blBusinessTerm","startKey":"营业期限","endKey":"经营范围"},
                    {"name":"blBusinessScope","startKey":"经营范围","endKey":"登记机关"},
                    {"name":"lurcNo","startKey":"编号NQD","endKey":""},
                    {"name":"lurcObligee","startKey":"权利人","endKey":"共有情况"},
                    {"name":"lurcCoOwnership","startKey":"共有情况","endKey":"坐落"},
                    {"name":"lurcBeLocated","startKey":"坐落","endKey":"不动产单元号"},
                    {"name":"lurcRealEstateUnitNumber","startKey":"不动产单元号","endKey":"权利类型"},
                    {"name":"lurcRightsTypes","startKey":"权利类型","endKey":"权利性质"},
                    {"name":"lurcRightsNature","startKey":"权利性质","endKey":"用途"},
                    {"name":"lurcPurpose","startKey":"用途","endKey":"面积"},
                    {"name":"lurcArea","startKey":"面积","endKey":"使用期限"},
                    {"name":"lurcServiceLife","startKey":"使用期限","endKey":"登记机关"},
                    {"name":"lurcOtherRights","startKey":"日","endKey":"权利其他情况"},
                    {"name":"clppNo","startKey":"建设用地规划许可证","endKey":"根据"},
                    {"name":"clppLandUser","startKey":"用地单位","endKey":"用地项目名称"},
                    {"name":"clppLandUseProjectName","startKey":"用地项目名称","endKey":"用地位置"},
                    {"name":"clppLandUseLocation","startKey":"用地位置","endKey":"用地性质"},
                    {"name":"clppLandUseNature","startKey":"用地性质","endKey":"用地面积"},
                    {"name":"clppLandUseArea","startKey":"用地面积","endKey":"建设规模"},
                    {"name":"clppConstructionScale","startKey":"建设规模","endKey":"附图及附件名称"},
                    {"name":"cpppNo","startKey":"建设工程规划许可证","endKey":"根据"},
                    {"name":"cpppConstructionCompany","startKey":"建设单位（个人）","endKey":"建设项目名称"},
                    {"name":"cpppConstructionProjectName","startKey":"建设项目名称","endKey":"建设位置"},
                    {"name":"cpppConstructionLocation","startKey":"建设位置","endKey":"建设规模"},
                    {"name":"cpppConstructionScale","startKey":"建设规模","endKey":"附图及附件名称"},
                    {"name":"bcpNo","startKey":"建筑工程施工许可证","endKey":"根据"},
                    {"name":"bcpConstructionCompany","startKey":"建设单位","endKey":"工程名称"},
                    {"name":"bcpProjectName","startKey":"工程名称","endKey":"建设地址"},
                    {"name":"bcpConstructionAddress","startKey":"建设地址","endKey":"建设规模"},
                    {"name":"bcpConstructionScale","startKey":"建设规模","endKey":"合同价格"},
                    {"name":"bcpContractPrice","startKey":"合同价格","endKey":"勘察单位"},
                    {"name":"bcpInvestigationCompany","startKey":"勘察单位","endKey":"设计单位"},
                    {"name":"bcpDesignCompany","startKey":"设计单位","endKey":"施工单位"},
                    {"name":"bcpConstructionCompany","startKey":"施工单位","endKey":"监理单位"},
                    {"name":"bcpConstructionControlCompany","startKey":"监理单位","endKey":"勘察单位负责人"},
                    {"name":"bcpInvestigationCompanyResponsiblePerson","startKey":"勘察单位负责人","endKey":"设计"},
                    {"name":"bcpConstructionCompanyResponsiblePerson","startKey":"施工单位负责人","endKey":"总监"}]
            }
        },
        methods:{
            rotateLeft:function () {
                let param = {"code": "1109"};
                this.$emit("eloamhandle", param);
            },
            rotateRight:function () {
                let param = {"code": "1110"};
                this.$emit("eloamhandle", param);
            },
            scan:function () {
                let param = {"code": "1107"};
                this.$emit("eloamhandle", param);
            },
            photo:function () {
                let param = {"code": "1108"};
                this.$emit("eloamhandle", param);
            },
            setdeskew:function () {
                let param = {"code": "1112"};
                this.$emit("eloamhandle", param);
            },
            discernOcr:function () {
                let param = {"code": "1121"};
                this.$emit("eloamhandle", param);
            },
            photoConfirm:function () {
                if(this.eloamPriPhoto){
                    let scanReturnData = {"retcode":"0","retinfo":""};
                    let scanData = {};
                    let scanImgArray = [];
                    scanImgArray.push(this.eloamPriPhoto);
                    for(let i=0;i<scanImgArray.length;i++){
                        scanData.cardImg = this.eloamPriPhoto;
                        scanData.businessJson = "{\"type\":\"0\",\"name\":\"证件扫描\",\"index\":\"0\"}";
                        scanData.ocrResult = this.parseOcrResult(this.ocrResult);
                        scanData.Content = scanImgArray[i];
                        scanReturnData.data = JSON.stringify(scanData);
                        this.$emit("eloamPhotoComplete", scanReturnData);
                    }
                }
                if(this.eloamSubPhoto){
                    let photoReturnData = {"retcode":"0","retinfo":""};
                    let photoData = {};
                    let photoImgArray = [];
                    photoImgArray.push(this.eloamSubPhoto);
                    for(let j=0;j<photoImgArray.length;j++){
                        photoData.faceImg = this.eloamSubPhoto;
                        photoData.businessJson = "{\"type\":\"1\",\"name\":\"人像采集\",\"index\":\"1\"}";
                        photoData.ocrResult = this.parseOcrResult(this.ocrResult);
                        photoData.Content = photoImgArray[j];
                        photoReturnData.data = JSON.stringify(photoData);
                        this.$emit("eloamPhotoComplete", photoReturnData);
                    }
                }
                this.eloamVisible = false;
            },
            photoCancel:function () {
                this.eloamVisible = false;
            },
            initEloamPhoto : function () {
                let this_ = this;
                let eloamDialog = this_.eloamDialog;
                //接收图片流用来展示，多个，较小的base64，主头数据
                eloamDialog.send_priImgData.connect(function(message) {
                    this_.eloamPriPreviewPhoto = "data:image/jpg;base64," + message;
                });
                //接收图片流用来展示，多个，较小的base64，副头数据
                eloamDialog.send_subImgData.connect(function(message) {
                    this_.eloamSubPreviewPhoto = "data:image/jpg;base64," + message;
                });
                //接收拍照base64，主头数据
                eloamDialog.send_priPhotoData.connect(function(message) {
                    this_.eloamPriPhoto = "data:image/jpg;base64," + message;
                });
                //接收拍照base64，副头数据
                eloamDialog.send_subPhotoData.connect(function(message) {
                    this_.eloamSubPhoto = "data:image/jpg;base64," + message;
                });
                //网页加载完成信号
                eloamDialog.html_loaded("faceDetect_two");
            },
            parseOcrResult: function (data) {
                let keyList = this.keyList;
                let ocrResult = {};
                for(let i=0;i<keyList.length;i++){
                    let startIndex = data.indexOf(keyList[i].startKey);
                    if(startIndex != -1) {
                        startIndex = startIndex + keyList[i].startKey.length;
                    }
                    let endIndex = null;
                    if(keyList[i].endKey != null && keyList[i].endKey != ""){
                        endIndex = data.indexOf(keyList[i].endKey);
                    }
                    if(startIndex != -1 && endIndex != -1){
                        let curOcrResult;
                        if(endIndex == null){
                            curOcrResult = data.substring(startIndex);
                        }else{
                            curOcrResult = data.substring(startIndex, endIndex);
                        }
                        if(curOcrResult != null && curOcrResult != ""){
                            ocrResult[keyList[i].name] = curOcrResult;
                        }
                    }
                }
                return ocrResult;
            }
        }
    }
</script>

<style scoped>
    .eloamImg{
        width: 49%;
        height: 480px;
        border: black 1px solid;
        margin: 2px 2px 2px 0px;
    }
    .eloamTextarea{
        width: 98.3%;
        height: 117px;
        border: black 1px solid;
        margin: 0px 0px 2px 0px;
    }
</style>