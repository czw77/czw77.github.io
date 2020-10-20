<template>
	<div id='mydemo'>
		<img :src="imgSrc" />
		<div>
			<select v-model="sType" >
				<option value="0">捷宇高拍仪</option>
				<option value="1">身份证阅读器</option>
				<option value="2">开易拍高拍仪</option>
			</select>
			<button @click="start">启动设备</button>
		</div>
		<div>
			<button @click="edPhotohandleEnable">打开摄像头</button>
			<button @click="stop">关闭摄像头</button>
			<button @click="readCard">读取身份证</button>
			<button @click="saveImg">拍照</button>
			<button @click="openFace">打开副摄像头</button>
			<button @click="rotate">旋转</button>
			
		</div>
		
		<img :src="ImgPreview" />
		
	</div>
</template>

<script>
	import DCTool from '../../static/DCTool.js';
	//初始化拍照相关功能的回调函数
    import {initEdPhotoApi} from '../../static/edAccess.js'
    //启用拍照组件
    import {edPhotohandle} from '../../static/edAccess.js'
    import {edCode, initEdApi} from "../../static/edAccess";
	export default {
		name:'DCTool',
		data(){
			return {
				imgSrc:null,
				ImgPreview:null,
				sType:'0',
				edPriPhoto:"",
                edSubPhoto:"",
                edOcrResult:"",
                photoTest2Visible: false
			};
		},
		mounted() {
			this.dcTool = new DCTool();

			let this_ = this;
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
		methods:{
			// 服务初始化
			start(){
				//关闭服务
				this.dcTool.close();
				
				const baseOpt = {
					sType:this.sType,
					imgUpdateFunc: (imgData) => {
						this.imgSrc = imgData;
					},
					getImgFunc: (imgData) => {
						// console.log(imgData);
						if(imgData.code === 0){
							this.ImgPreview =`data:image/jpeg;base64,${imgData.imgList[0]}`;
						}
					},
					readCardFunc: (data) => {
						console.log(data);
					}
				}
				switch(this.sType){
					case '0':
						baseOpt.wsUrl = 'localhost:1818';
						break ;
					case '1':
						baseOpt.wsUrl = 'localhost:7896';
						break ;
					default:
						baseOpt.wsUrl = 'localhost:1818';
				}
				this.dcTool.start(baseOpt);
				
			},
			open(){
				this.dcTool.send('open');
				/* let param = {"code": "1132"};
				this.$emit("jieyu",param) */
			},
			stop(){
				this.dcTool.send('stop');
			},
			readCard(){
				this.dcTool.send('read');
			},
			saveImg(){
				// this.dcTool.send('save');

			},
			openFace(){
				this.dcTool.send('face');
			},
			rotate(){
				this.dcTool.send('rotate');
			},
			edPhotohandleEnable : function () {
                edPhotohandle(this);
            },
		},
		beforeUnmount() {
			console.log('close');
			this.dcTool.close();
		}
	}
</script>

<style scoped >
img{
	width: 400px;
	height: 400px;
	
}
</style>
