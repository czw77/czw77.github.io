import axios from 'axios';
/**
 * 不同品牌高拍仪接口统一封装插件
 * 
 * 开易拍高拍仪的通信需要用http的方式，所以项目需要引入axios
 * @require axios
 * 
 */
export default class DCTool {
	// 是否启动
	isStart = false;
	//捷宇高拍仪是否初始化成功
	isDoccameraOcxFlag = false;
	//身份证是否初始化成功
	isIdCardReaderFlag = false;
	//开易拍是否初始化成功
	isKt600Flag = false;

	// 当前摄像画面
	imgFlow = null;
	// 默认配置
	baseOption = {
		sType: 0, // 设备类型
		wsUrl: 'localhost:1818',
		imgUpdateFunc: null, // 摄像信息更新方法
		getImgFunc: null, // 获取当前画面base64数据
		readCardFunc1: null, // 读取身份证-取身份证号
		readCardFunc2: null, // 读取身份证-取名字
		commonFunc: null, // 通用数据回调
		sType_doccameraOcxFlag: false, //是否是捷宇
		DoccameraOcx_wsUrl: 'localhost:1818', //捷宇url
		sType_kt600: false, //是否是kt600
		sType_idCardReader: false, //是否是身份证阅读器
		idCardReader_wsUrl: 'localhost:7896', //身份证ws_url

	};
	// 当前配置
	option = {};
	photoTest1_option = {};
	photoTest2_option = {};
	currentOptName = '';
	optArr = [];//各个组件对应配置参数存放集合

	// 当前设备应用的方法集 
	targetHandle = null;
	// WebSocket实例
	ws = null;
	doccameraOcx_ws = null; //捷宇ws
	idCardReader_ws = null; //身份证阅读器ws

	constructor() {

	}

	//捷宇和身份证阅读器ws公共方法
	/* *
	*target:对应ws
	*sType_name:对应初始化设备名称-例:DoccameraOcx,IdCardReader
	*myThat_:this

	*/
	myCommonInit(target, sType_name, myThat_) {
		target.onopen = () => {
			if (sType_name == 'DoccameraOcx') {
				//判断链接的是捷宇
				myThat_.isDoccameraOcxFlag = true;
				myThat_.isIdCardReaderFlag = false;
				console.log('捷宇_WebSocket connect success');

			} else if (sType_name == 'IdCardReader') {
				// debugger
				//判断连接的是身份证阅读器
				myThat_.isIdCardReaderFlag = true;
				myThat_.isDoccameraOcxFlag = false;
				myThat_.IDCardReader_Handle.init(myThat_);
				console.log('身份证阅读器_WebSocket connect success');

			}
			console.log('WebSocket connect success');
		}
		target.onerror = (e) => {
			// myThat_.isStart = false;
			if (sType_name == 'DoccameraOcx') {
				//失败链接的是捷宇
				myThat_.isDoccameraOcxFlag = false;
				console.error(e);
				console.log('捷宇_WebSocket connect failed');
			} else if (sType_name == 'IdCardReader') {
				//失败连接的是身份证阅读器
				myThat_.isIdCardReaderFlag = false;
				console.error(e);
				console.log('身份证阅读器_WebSocket connect failed');
			}
		}
		target.onmessage = (event) => {
			// debugger
			if (sType_name == 'DoccameraOcx') {
				myThat_.DoccameraOcx_Handle.onMessage(myThat_, event);
			} else if (sType_name == 'IdCardReader') {
				myThat_.IDCardReader_Handle.onMessage(myThat_, event);
			}
			// myThat_.targetHandle.onMessage(myThat_, event);
		}
		target.onclose = () => {
			// debugger
			// myThat_.isStart = false;
			if (sType_name == 'DoccameraOcx') {
				//关闭链接的是捷宇
				myThat_.isDoccameraOcxFlag = false;
				console.log('捷宇_WebSocket closed');
			} else if (sType_name == 'IdCardReader') {
				//关闭连接的是身份证阅读器
				myThat_.isIdCardReaderFlag = false;
				console.log('身份证阅读器_WebSocket closed');
			}

		}
		return true;
	}


	/**
	 * 连接并配置WebSocket服务
	 */
	InitWebSocket() {
		try {
			// 连接ws服务
			if (this.option.sType_doccameraOcxFlag) {
				this.doccameraOcx_ws = new WebSocket(`ws://${this.option.DoccameraOcx_wsUrl}`);
				this.myCommonInit(this.doccameraOcx_ws, 'DoccameraOcx', this);
			} else if (this.option.sType_idCardReader) {
				// debugger
				this.idCardReader_ws = new WebSocket(`ws://${this.option.idCardReader_wsUrl}`);
				this.myCommonInit(this.idCardReader_ws, 'IdCardReader', this);
			}
		} catch (e) {
			// this.isStart = false;
			if (this.option.sType_doccameraOcxFlag) {
				//失败链接的是捷宇
				this.isDoccameraOcxFlag = false;
			} else if (this.option.sType_idCardReader) {
				//失败连接的是身份证阅读器
				this.isIdCardReaderFlag = false;
			}
			console.log('guizhou_设备_WebSocket connect error : ' + e);
			return false;
		}
	}
	/**
	 * 连接并配置Http服务
	 */
	InitHttp() {
		if (typeof axios === 'undefined') {
			console.log('当前设备设备需要项目引入axios插件');
		} else {
			console.log('ready');
			//易拍依靠VideoAppRuner插件,当执行open指令,发送请求才能判断是否连接的是易拍
			if (typeof this.KT600_Handle['open'] === 'function') {
				this.KT600_Handle['open'](this);
				this.KT600_Handle['stop'](this);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}



		}
	}
	/**
	 * 加载配置，初始化
	 */
	start(opt = {}) {
		// debugger
		// 合并配置项
		if (opt.optName == 'photoTest1') {
			this.photoTest1_option = Object.assign({}, opt);
			if (opt.sType_doccameraOcxFlag) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_kt600) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_idCardReader) {
				this.optArr.push(Object.assign({}, opt));
			}

		}
		if (opt.optName == 'photoTest2') {
			this.photoTest2_option = Object.assign({}, opt);

			if (opt.sType_doccameraOcxFlag) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_kt600) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_idCardReader) {
				this.optArr.push(Object.assign({}, opt));
			}
		}
		if (opt.optName == 'idCardTest1') {
			this.photoTest2_option = Object.assign({}, opt);

			if (opt.sType_doccameraOcxFlag) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_kt600) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_idCardReader) {
				this.optArr.push(Object.assign({}, opt));
			}
		}
		if (opt.optName == 'idCardTest2') {
			this.photoTest2_option = Object.assign({}, opt);

			if (opt.sType_doccameraOcxFlag) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_kt600) {
				this.optArr.push(Object.assign({}, opt));
			}
			if (opt.sType_idCardReader) {
				this.optArr.push(Object.assign({}, opt));
			}
		}
		this.option = Object.assign({}, this.baseOption, opt);
		// 选取当前应用的方法集
		if (this.option.sType_kt600) {
			this.InitHttp();
		} else if (this.option.sType_doccameraOcxFlag) {
			this.targetHandle = this.DoccameraOcx_Handle;
			this.InitWebSocket();
		} else if (this.option.sType_idCardReader) {
			this.targetHandle = this.IDCardReader_Handle;
			this.InitWebSocket();
		} else {
			console.log("没有该设备")

		}

	}
	/**
	 * 验证是否执行了start()方法加载配置
	 */
	isStarted() {
		//判断三个设备是否都初始化了--由于身份证阅读器不需要任何插件驱动,暂时无法判断
		/* if (this.isDoccameraOcxFlag) {
			// this.targetHandle = this.DoccameraOcx_Handle;
			if (typeof this.DoccameraOcx_Handle[command] === 'function') {
				this.DoccameraOcx_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else if (this.isKt600Flag) {
			// this.targetHandle = this.KT600_Handle;
			if (typeof this.KT600_Handle[command] === 'function') {
				this.KT600_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else if (this.isIdCardReaderFlag) {
			// this.targetHandle = this.IDCardReader_Handle;
			if (typeof this.IDCardReader_Handle[command] === 'function') {
				this.IDCardReader_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else {
			this.targetHandle = null;
		} */
		if (this.isDoccameraOcxFlag || this.isIdCardReaderFlag || this.isKt600Flag) {
			this.isStart = true;
		} else {
			this.isStart = false;
		}
		if (!this.isStart) {
			console.log('需要先调用start()方法传入基础配置进行初始化');
			return false;
		}
		return true;
	}
	/**
	 * 停止服务
	 */
	close() {
		if (!this.isStart)
			return;
		if (typeof this.targetHandle.close === 'function') {
			this.targetHandle.close(this);
		}
		if (this.ws !== null) {
			this.ws.close();
		}
		this.isStart = false;
	}
	/**
	 * 统一指令输入方法
	 * @param {String} command - 命令名称
	 * @param {Object} params - 输入参数  
	 */
	send(command, params) {
		if (!this.isStarted())
			return false;
			
		//当前执行指令的组件
		this.currentOptName = params;
		if (this.isDoccameraOcxFlag) {
			// this.targetHandle = this.DoccameraOcx_Handle;
			if (typeof this.DoccameraOcx_Handle[command] === 'function') {
				this.DoccameraOcx_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else if (this.isKt600Flag) {
			// this.targetHandle = this.KT600_Handle;
			if (typeof this.KT600_Handle[command] === 'function') {
				this.KT600_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else if (this.isIdCardReaderFlag) {
			// this.targetHandle = this.IDCardReader_Handle;
			if (typeof this.IDCardReader_Handle[command] === 'function') {
				this.IDCardReader_Handle[command](this, params);
				return true;
			} else {
				console.log('当前仪器不支持该指令');
				return false;
			}
		} else {
			// this.targetHandle = null;
			console.log('没有可用设备')
		}


	}

	/**
	 * 不同设备指令的方法集
	 * 针对不同设备的不同响应方式, 尽量对相同功能提供一致的api名称与响应方式。
	 * 
	 * 必要方法: onMessage 提供消息数据的响应方法
	 * 
	 * TODO-1: 各个方法集变得庞大时 将其分离出本文件
	 * TODO-2: 各方法集提供api以列出其支持的所有命令
	 */

	/**
	 * @example 
	 * 身份证阅读结果统一结构
	 * const IDCardInfo = {
		 Address:'',		-- 住址
		 Base64Image:'', -- 身份证正反面图片base64
		 Base64Photo:'', -- 身份证头像base64
		 Base64Finger:'', -- 指纹信息base64
		 Birthday:'', -- 出生日期 
		 GrantDept:'',  -- 签发机关
		 IDCardNo:'', -- 身份证号
		 Name:'', -- 姓名
		 Nation:'', -- 民族
		 Sex:'', -- 性别
		 ValidDate:'', -- 有效期限
	 }
	 */

	/**
	 * DoccameraOcx（捷宇） -- 操作方法集
	 */
	DoccameraOcx_Handle = {
		/**
		 * 指令与响应结果映射表
		 * 	['apiName', {
		 *	 callBack : 对应响应时应该触发的统一回调函数名称
		 *	 arrangeData : 数据预处理,确保不同设备返回相同结构的数据
			 use : 应用方法，将数据应用到方法集内部
		 *	} ]
		 */
		eventMap: new Map([
			// 旋转启动主视频源
			['bStartPlayRotate', {}],
			// 显示副视频源
			['bStartPlay2', {}],
			// 显示主视频源
			['bStartPlay', {}],
			// 停止视频源
			['bStopPlay', {}],
			// 读身份证卡内信息
			['ReadCard', {
				callBack: 'readCardFunc',
				arrangeData: (data) => {
					let idCardData = JSON.parse(data)
					return {
						Address: idCardData.Address,
						Base64Image: '',
						Base64Photo: idCardData.PhotoB64,
						Base64Finger: idCardData.FingerB64,
						Birthday: idCardData.BirthDate,
						GrantDept: idCardData.Agency,
						IDCardNo: idCardData.IdNo,
						Name: idCardData.Name,
						Nation: idCardData.Folk,
						Sex: idCardData.Sex,
						ValidDate: idCardData.Valid,
					};
				}
			}],
			// 获取 JPG  图像文件的 BASE64  数据
			['sGetBase64', {
				callBack: 'getImgFunc',
				arrangeData: (data) => ({
					code: 0,
					msg: 'success',
					imgList: [data]
				}),
			}],
			['vSetDelHBFlag', {}]
		]),
		// 当前旋转角
		rotateValue: 0,
		// 当前摄像头
		CameraNum: 0,
		// 响应消息
		onMessage(target, message) {
			// 查找当前消息是否属于指令的返回结果
			let currentOpt = null;
			target.optArr.forEach((item, index) => {
				// debugger
				if (target.isDoccameraOcxFlag) {
					if (item.optName == target.currentOptName && item.sType_doccameraOcxFlag) {
						currentOpt = item;
					}
				}
			})

			for (let eventName of this.eventMap.keys()) {
				if (message.data.startsWith(`Begin${eventName}`)) {
					console.log(`Response By ${eventName}`);

					let eVal = this.eventMap.get(eventName);
					let mainData = message.data.replace(`Begin${eventName}`, '').replace(`End${eventName}`, '');
					// 数据预处理
					if (eVal.arrangeData !== undefined) {
						mainData = eVal.arrangeData(mainData);
					}
					// 触发指令对应回调
					if (eVal.callBack !== undefined && typeof currentOpt[eVal.callBack] === 'function') {
						currentOpt[eVal.callBack](mainData);
					} else if (typeof currentOpt.commonFunc === 'function') {
						currentOpt.commonFunc(eventName, mainData);
					} else if (eVal.callBack == 'readCardFunc') {
						// target.option['readCardFunc1'](mainData);
						currentOpt['readCardFunc1'](mainData);
						// target.option['readCardFunc2'](mainData);
						currentOpt['readCardFunc2'](mainData);
					}

					return;
				}
			}
			// 当前消息为图片的base64数据
			target.imgFlow = `data:image/jpeg;base64,${message.data}`;
			if (typeof currentOpt.imgUpdateFunc === 'function') {
				currentOpt.imgUpdateFunc(target.imgFlow);
			}
		},
		// 打开摄像头
		open(target) {
			target.doccameraOcx_ws.send('bStartPlay');
			this.CameraNum = 0;
			this.rotateValue = 0;
		},
		// 关闭摄像头
		stop(target) {
			target.doccameraOcx_ws.send('bStopPlay');
		},
		// 停止服务
		close(target) {
			target.doccameraOcx_ws.send('bStopPlay');
		},
		// 获取图片
		save(target) {
			target.doccameraOcx_ws.send('sGetBase64');
		},
		// 读卡
		read(target) {
			target.doccameraOcx_ws.send('ReadCard(1001,"D:\\wid")')
		},
		// 打开副摄像头
		face(target) {
			target.doccameraOcx_ws.send('bStartPlay2(0)');
			this.CameraNum = 1;
			this.rotateValue = 0;
		},
		// 旋转
		rotate(target) {
			this.rotateValue = (this.rotateValue + 90) % 360;
			if (this.CameraNum === 0) {
				target.doccameraOcx_ws.send(`bStartPlayRotate(${this.rotateValue})`);
			} else {
				target.doccameraOcx_ws.send(`bStartPlay2(${this.rotateValue})`);
			}
		},
		fixborder(target) {
			target.doccameraOcx_ws.send('vSetDelHBFlag(true)');
		}
	};
	/**
	 * 身份证阅读器 -- 操作方法集
	 */
	IDCardReader_Handle = {
		eventMap: new Map([
			['@I@', {
				callBack: 'readCardFunc',
				arrangeData: (data) => {
					let temp = JSON.parse(data)
					return temp.data;
				}
			}],
		]),

		onMessage(target, message) {
			// debugger
			let currentOpt = null;
			target.optArr.forEach((item, index) => {
				// debugger
				// console.log(item, '-->', index)
				if (target.isIdCardReaderFlag) {
					if (item.optName == target.currentOptName && item.sType_idCardReader) {
						currentOpt = item;
					}
				}
			})

			for (let eventName of this.eventMap.keys()) {
				if (message.data.startsWith(eventName)) {
					// debugger
					console.log(`Response By ${eventName}`);

					let eVal = this.eventMap.get(eventName);
					let mainData = message.data.replace(eventName, '');
					// 数据预处理
					if (eVal.arrangeData !== undefined) {
						mainData = eVal.arrangeData(mainData);
					}
					// console.log(mainData);
					// 触发指令对应回调
					if (eVal.callBack !== undefined && typeof target.option[eVal.callBack] === 'function') {
						// target.option[eVal.callBack](mainData);
						currentOpt[eVal.callBack](mainData);
					} else if (typeof target.option.commonFunc === 'function') {
						// target.option.commonFunc(eventName, mainData);
						currentOpt.commonFunc(eventName, mainData);
					} else if (eVal.callBack == 'readCardFunc') {
						// target.option['readCardFunc1'](mainData);
						currentOpt['readCardFunc1'](mainData);
						// target.option['readCardFunc2'](mainData);
						currentOpt['readCardFunc2'](mainData);
					}

					return;
				}
			}
		},
		// 初始化
		init(target) {
			let command = JSON.stringify({
				FuncName: 'InitCamLib'
			});
			target.idCardReader_ws.send(command);
		},
		// 读卡
		read(target, params) {
			let command = JSON.stringify({
				FuncName: 'ReadIDCard',
			});
			// debugger
			target.idCardReader_ws.send(command);
		},
	}
	/**
	 * KT600 -- 开易拍 ( http进行消息获取 )
	 */
	KT600_Handle = {
		// url: 'http://127.0.0.1:28080/NIExpress',
		url: 'http://127.0.0.1:28080/WebScan',
		myimgList: [], //存储已经拍的照,
		imgFilterArr: [], //存储照片数组对象去重的集合
		api: {
			open: '/OpenApp',
			close: '/CloseApp',
			get: '/GetImages',
			clear: '/ClearImages',
		},
		// 打开app
		open(target) {
			axios.post(`${this.url}${this.api.clear}`, {}).catch(e => {});
			axios.post(`${this.url}${this.api.open}`, {}).then(res => {
				target.isKt600Flag = true;
				console.log('开易拍连接成功')
			}).catch(e => {
				target.isKt600Flag = false;
				console.log('开易拍VideoInputApp 服务连接失败')
				console.log(e);
			});
		},
		// 关闭app
		stop(target) {
			axios.post(`${this.url}${this.api.close}`, {}).catch(e => {
				console.log('开易拍VideoInputApp 服务连接失败')
				console.log(e);
			});
		},
		save(target) {

			let that_ = this;
			axios.post(`${this.url}${this.api.get}`, {}).then((res) => {
				// debugger
				// console.log(res);
				//获取到对应组件传过来的参数
				let currentOpt = null;
				target.optArr.forEach((item, index) => {
					if (target.isKt600Flag) {
						if (item.optName == target.currentOptName && item.sType_kt600) {
							currentOpt = item;
						}
					}
				})

				let resData = {};
				let obj = {};
				if (res.data.Code === 0) {
					// debugger
					let shortImages = res.data.Images;
					if (shortImages !== null) {
						shortImages.forEach(item => {
							that_.imgFilterArr.push(item)
						})
						//防止有重复的照片,做一个过滤
						that_.imgFilterArr = that_.filterArr(that_.imgFilterArr, 'Content');
						//得到照片内容数据存储起来
						let newImgList = that_.imgFilterArr.map(item => item.Content);
						let oldImgList = [...that_.myimgList]
						that_.myimgList = [...oldImgList, ...newImgList];
						//作一个处理 当存储照片大于10,只显示后十张
						if (that_.myimgList.length > 10) {
							that_.myimgList.splice(0, (that_.myimgList.length - 10));
						}

					}
					if (shortImages === null && (that_.myimgList.length > 0)) {
						let imgList = that_.myimgList;
						resData = {
							code: 0,
							msg: 'success',
							imgList: imgList
						};
					} else {
						// let imgList = shortImages;
						if (shortImages !== null) {
							resData = {
								code: 0,
								msg: 'success',
								imgList: shortImages.map(dt => dt.Content)
							};
						}

					}
					// let imgList = res.data.Images === null ? [] : res.data.Images;
					// resData = {code:0,msg:'success',imgList:imgList.map(dt => dt.Content) };
				} else {
					resData = {
						code: -1,
						msg: 'failed',
						imgList: []
					};
				}
				if (typeof currentOpt.getImgFunc === 'function') {
					currentOpt.getImgFunc(resData);
				}
				if (typeof currentOpt.getImgFunc1 === 'function') {
					currentOpt.getImgFunc1(resData);
				}
			}).catch(e => {
				console.log('开易拍VideoInputApp 服务连接失败')
				console.log(e);
			});
		},
		filterArr(arr, mykey) {
			let obj = {};
			arr = arr.reduce((cur, next) => {
				obj[next[mykey]] ? "" : obj[next[mykey]] = true && cur.push(next);
				return cur;
			}, [])
			return arr;
		}
	}
}