import axios from 'axios';
//引入捷宇高拍仪/开易高拍仪/身份证阅读器工具类
import DCTool from './DCTool.js';
const myDcTool = new DCTool();

//是否连接一体机
let isAio = false;

//是否连接高拍仪
let isHb = false;

//是否连接捷宇高拍仪
let isDoccameraOcx = false;

//是否连接身份证阅读器
let isIdCardReader = false;

//是否连接开易拍
let isKt600 = false;

//外设集合
let edMap = {};

//一体机常量
const nkoString = "nko";

//高拍仪常量
const eloamString = "eloam";

//捷宇高拍仪常量
const doccameraOcxString = "doccameraOcx";

//身份证阅读器常量
const idCardReaderString = "idCardReader";

//开易拍常量
const kt600String = "kt600";

//功能编码
let edCode;

//高拍仪拍照组件
let eloamPhotoComp;

//当前vue组件id
let curTargetVueId = null;

//当前拍照vue组件id
let curPhotoTargetVueId = null;

//一体机类
class nko {
    //当前一体机连接
    curNkoApi;

    //当前一体机扫描连接
    curNkoScanApi;

    //一体机websocket对象
    nkoApi() {
        //websocket访问的IP
        let url = "ws://localhost:9600";
        this.wsUri = url;
        this.websocket = null;
        try {
            //初始化websocket
            if (this.websocket && this.websocket.readyState == 1)
                this.websocket.close();
            this.websocket = new WebSocket(this.wsUri);
            this.websocket.onopen = function () {
                console.log("成功连接WebSocket服务！(" + url + ")");
            };
            this.websocket.onclose = function () {
                console.log("WebSocket服务已断开！");
            };
            this.websocket.onerror = function (evt) {
                console.log('ERROR: ' + evt.data);
            };
        } catch (exception) {
            console.log('ERROR: ' + exception);
        }

        //调用一体机函数
        this.nkoApihandle = function (param) {
            try {
                if (param == null || param == "" || param.code == null || param.code == "") {
                    console.log("code不能为空");
                }
                edCode = param.code;
                let objStr = JSON.stringify(param);
                this.websocket.send(objStr);
            } catch (e) {
                console.error("调用一体机函数异常：" + e);
            }
        }
    }

    //一体机拍照组件对象
    nkoScanApi() {
        //websocket连接
        try {
            let loop;
            this.Url = "ws://localhost:1234/";
            this.webSocket;
            this.ScanComplete;
            this.IsConected = false;
            this.connect = function () {
                this.IsConected = false;
                let me = this;
                let url = this.Url;
                let complete = this.ScanComplete;
                let wb = this.webSocket;
                if ("WebSocket" in window) {
                    loop = setInterval(function () {
                        if (!me.IsConected) {
                            try {
                                wb = new WebSocket(url);
                            } catch (e) {
                                console.error("WebSocket连接异常！");
                            }
                            wb.onmessage = complete;
                            wb.onopen = function () {
                                me.IsConected = true;
                                console.log("成功连接WebSocket服务！(" + url + ")");
                                clearInterval(loop);
                            }
                        }
                    }, 1000);
                } else {
                    console.log("你的浏览器不支持WebSocket,你将无法收到扫描控件的回调消息！");
                }
            }
        } catch (exception) {
            console.log('websocket连接异常: ' + exception);
        }

        //获取权限配置
        this.ConfigureUserPermissions = function () {
            let json = [{
                    "name": "扫描源",
                    "value": "1"
                },
                {
                    "name": "参数",
                    "value": "2"
                },
                {
                    "name": "扫描",
                    "value": "4"
                },
                {
                    "name": "重扫",
                    "value": "16"
                },
                {
                    "name": "插扫",
                    "value": "32"
                },
                {
                    "name": "导入",
                    "value": "64"
                },
                {
                    "name": "替导",
                    "value": "128"
                },
                {
                    "name": "删除",
                    "value": "256"
                },
                {
                    "name": "左转",
                    "value": "512"
                },
                {
                    "name": "右转",
                    "value": "1024"
                },
                {
                    "name": "适应宽",
                    "value": "2048"
                },
                {
                    "name": "适应高",
                    "value": "4096"
                },
                {
                    "name": "放大",
                    "value": "8192"
                },
                {
                    "name": "缩小",
                    "value": "16384"
                },
                {
                    "name": "发布",
                    "value": "32768"
                },
                {
                    "name": "配置",
                    "value": "65536"
                },
                {
                    "name": "保存",
                    "value": "131072"
                }
            ];
            let settingInt = 0;
            for (let i = 0; i < json.length; i++) {
                settingInt += (json[i].value * 1);
            }
            return settingInt;
        }

        //获取随机数
        this.newGuid = function () {
            let guid = "";
            for (let i = 1; i <= 32; i++) {
                let n = Math.floor(Math.random() * 16.0).toString(16);
                guid += n;
            }
            return guid;
        }

        //转换为标准json格式
        this.convertToStandTreeJson = function (bussinessObj) {
            let convert = function (item) {
                return "{nodeName:" + "\"" + item.name + "\",nodeIdentity:\"" + item.type + "\"},";
            }
            let result = "[";
            bussinessObj.elements.forEach(function (item) {
                result += convert(item);
            });
            result += "]";
            return "{ nodeName:\"elements\",nodeIdentity:\"" + this.newGuid() + "\",childTreeNodes:" + result + "}";
        }

        //一体机扫描
        this.nkoScan = function (nkoScanApi) {
            //配置扫描控件权限
            let settingInt = this.ConfigureUserPermissions();
            if (settingInt == 0) {
                console.log("请配置权限");
                return;
            }
            //将业务对象转换为标准控件树
            try {
                //文件夹入参
                let bussinessObj = {
                    "elements": [{
                            "name": "证件扫描",
                            "type": "0",
                            "format": "",
                            "number": "",
                            "size": "",
                            "order": "",
                            "isneed": ""
                        },
                        {
                            "name": "人像采集",
                            "type": "1",
                            "format": "",
                            "number": "",
                            "size": "",
                            "order": "",
                            "isneed": ""
                        }
                    ]
                };
                let treeJson = this.convertToStandTreeJson(bussinessObj);
                let inputJson = "{ tree:" + treeJson + "," + "rightkey:\"" + settingInt + "\"" + "," + "scanModel:\"" + "Twain" + "\"}";
                let treeJsonUrlEnCode = encodeURIComponent(inputJson);
                let a = document.createElement('a');
                a.href = "StandardControl:" + treeJsonUrlEnCode;
                //开启扫描控件
                a.click();
                //用WEBSOCKET连接到扫描控件
                nkoScanApi.connect();
            } catch (e) {
                console.log("打开扫描控件异常：" + e);
            }
        }
    }

    //一体机操作
    nkoApihandle(this_, param) {
        let targetVueId = this_.$options._componentTag;
        let nkoApiObject = edMap[targetVueId][nkoString];
        if (nkoApiObject == null) {
            console.info("一体机未初始化");
        } else {
            nkoApiObject.curNkoApi.nkoApihandle(param);
        }
    }

    //一体机扫描
    nkoScanApihandle(this_) {
        let targetVueId = this_.$options._componentTag;
        let nkoApiObject = edMap[targetVueId][nkoString];
        if (nkoApiObject == null) {
            console.info("一体机未初始化");
        } else {
            nkoApiObject.curNkoScanApi.nkoScan(nkoApiObject.curNkoScanApi);
        }
    }
}

//初始化调用一体机函数的回调函数
function initNkoApi(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let nkoApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][nkoString] == null)) {
        nkoApiObject = new nko();
        nkoApiObject.curNkoApi = new nkoApiObject.nkoApi();
    } else {
        nkoApiObject = edMap[targetVueId][nkoString];
    }
    //调用一体机函数的回调函数
    nkoApiObject.curNkoApi.websocket.onmessage = function (data) {
        console.log('进入一体机初始化响应函数')
        let nkoObj = JSON.parse(data.data);
        if (edCode == "1001") {
            //判断是否连接一体机
            if (nkoObj.retcode != "-10003" && nkoObj.retcode != "-10001") {
                isAio = true;
                console.log("一体机已连接");
            } else {
                isAio = false;
                console.log("一体机已断开");
            }
        }
        callback(data);
    }
    //延时一秒打开一体机
    window.setTimeout(function () {
        //打开设备
        let nkoApiParam = {};
        nkoApiParam.code = "1001";
        //调用一体机函数
        nkoApiObject.curNkoApi.nkoApihandle(nkoApiParam);
    }, 1000);
    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curNko = {
            [nkoString]: nkoApiObject
        };
        edMap[targetVueId] = curNko;
    } else {
        if (edMap[targetVueId][nkoString] == null) {
            edMap[targetVueId][nkoString] = nkoApiObject;
        }
    }
}

//初始化调用一体机扫描控件的回调函数
function initNkoScanApi(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let nkoScanApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][nkoString] == null)) {
        nkoScanApiObject = new nko();
    } else {
        nkoScanApiObject = edMap[targetVueId][nkoString];
    }
    if (typeof nkoScanApiObject.curNkoScanApi == 'undefined') {
        nkoScanApiObject.curNkoScanApi = new nkoScanApiObject.nkoScanApi();
    }
    //配置发布图片后的回调函数
    nkoScanApiObject.curNkoScanApi.ScanComplete = callback;
    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curNko = {
            [nkoString]: nkoScanApiObject
        };
        edMap[targetVueId] = curNko;
    } else {
        if (edMap[targetVueId][nkoString] == null) {
            edMap[targetVueId][nkoString] = nkoScanApiObject;
        }
    }
}

//高拍仪封装函数消息类型
let QWebChannelMessageTypes = {
    signal: 1,
    propertyUpdate: 2,
    init: 3,
    idle: 4,
    debug: 5,
    invokeMethod: 6,
    connectToSignal: 7,
    disconnectFromSignal: 8,
    setProperty: 9,
    response: 10,
};

//高拍仪封装函数连接对象
let QWebChannel = function (transport, initCallback) {
    if (typeof transport !== "object" || typeof transport.send !== "function") {
        console.error("The QWebChannel expects a transport object with a send function and onmessage callback property." +
            " Given is: transport: " + typeof (transport) + ", transport.send: " + typeof (transport.send));
        return;
    }

    let channel = this;
    this.transport = transport;

    this.send = function (data) {
        if (typeof (data) !== "string") {
            data = JSON.stringify(data);
        }
        channel.transport.send(data);
    }

    this.transport.onmessage = function (message) {
        let data = message.data;
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        switch (data.type) {
            case QWebChannelMessageTypes.signal:
                channel.handleSignal(data);
                break;
            case QWebChannelMessageTypes.response:
                channel.handleResponse(data);
                break;
            case QWebChannelMessageTypes.propertyUpdate:
                channel.handlePropertyUpdate(data);
                break;
            default:
                console.error("invalid message received:", message.data);
                break;
        }
    }

    this.execCallbacks = {};
    this.execId = 0;
    this.exec = function (data, callback) {
        if (!callback) {
            // if no callback is given, send directly
            channel.send(data);
            return;
        }
        if (channel.execId === Number.MAX_VALUE) {
            // wrap
            channel.execId = Number.MIN_VALUE;
        }
        if (Object.prototype.hasOwnProperty.call(data, "id")) {
            console.error("Cannot exec message with property id: " + JSON.stringify(data));
            return;
        }
        data.id = channel.execId++;
        channel.execCallbacks[data.id] = callback;
        channel.send(data);
    };

    this.objects = {};

    this.handleSignal = function (message) {
        let object = channel.objects[message.object];
        if (object) {
            object.signalEmitted(message.signal, message.args);
        } else {
            console.warn("Unhandled signal: " + message.object + "::" + message.signal);
        }
    }

    this.handleResponse = function (message) {
        if (!Object.prototype.hasOwnProperty.call(message, "id")) {
            console.error("Invalid response message received: ", JSON.stringify(message));
            return;
        }
        channel.execCallbacks[message.id](message.data);
        delete channel.execCallbacks[message.id];
    }

    this.handlePropertyUpdate = function (message) {
        for (let i in message.data) {
            let data = message.data[i];
            let object = channel.objects[data.object];
            if (object) {
                object.propertyUpdate(data.signals, data.properties);
            } else {
                console.warn("Unhandled property update: " + data.object + "::" + data.signal);
            }
        }
        channel.exec({
            type: QWebChannelMessageTypes.idle
        });
    }

    this.debug = function (message) {
        channel.send({
            type: QWebChannelMessageTypes.debug,
            data: message
        });
    };

    channel.exec({
        type: QWebChannelMessageTypes.init
    }, function (data) {
        for (let objectName in data) {
            new QObject(objectName, data[objectName], channel);
        }
        // now unwrap properties, which might reference other registered objects
        for (let execObjectName in channel.objects) {
            channel.objects[execObjectName].unwrapProperties();
        }
        if (initCallback) {
            initCallback(channel);
        }
        channel.exec({
            type: QWebChannelMessageTypes.idle
        });
    });
};

//高拍仪封装函数操作处理对象
function QObject(name, data, webChannel) {
    this.__id__ = name;
    webChannel.objects[name] = this;

    // List of callbacks that get invoked upon signal emission
    this.__objectSignals__ = {};

    // Cache of all properties, updated when a notify signal is emitted
    this.__propertyCache__ = {};

    let object = this;

    // ----------------------------------------------------------------------

    this.unwrapQObject = function (response) {
        if (response instanceof Array) {
            // support list of objects
            let ret = new Array(response.length);
            for (let i = 0; i < response.length; ++i) {
                ret[i] = object.unwrapQObject(response[i]);
            }
            return ret;
        }
        if (!response ||
            !response["__QObject*__"] ||
            response["id"] === undefined) {
            return response;
        }

        let objectId = response.id;
        if (webChannel.objects[objectId])
            return webChannel.objects[objectId];

        if (!response.data) {
            console.error("Cannot unwrap unknown QObject " + objectId + " without data.");
            return;
        }

        let qObject = new QObject(objectId, response.data, webChannel);
        qObject.destroyed.connect(function () {
            if (webChannel.objects[objectId] === qObject) {
                delete webChannel.objects[objectId];
                // reset the now deleted QObject to an empty {} object
                // just assigning {} though would not have the desired effect, but the
                // below also ensures all external references will see the empty map
                // NOTE: this detour is necessary to workaround QTBUG-40021
                let propertyNames = [];
                for (let propertyName in qObject) {
                    propertyNames.push(propertyName);
                }
                for (let idx in propertyNames) {
                    delete qObject[propertyNames[idx]];
                }
            }
        });
        // here we are already initialized, and thus must directly unwrap the properties
        qObject.unwrapProperties();
        return qObject;
    }

    this.unwrapProperties = function () {
        for (let propertyIdx in object.__propertyCache__) {
            object.__propertyCache__[propertyIdx] = object.unwrapQObject(object.__propertyCache__[propertyIdx]);
        }
    }

    function addSignal(signalData, isPropertyNotifySignal) {
        let signalName = signalData[0];
        let signalIndex = signalData[1];
        object[signalName] = {
            connect: function (callback) {
                if (typeof (callback) !== "function") {
                    console.error("Bad callback given to connect to signal " + signalName);
                    return;
                }

                object.__objectSignals__[signalIndex] = object.__objectSignals__[signalIndex] || [];
                object.__objectSignals__[signalIndex].push(callback);

                if (!isPropertyNotifySignal && signalName !== "destroyed") {
                    // only required for "pure" signals, handled separately for properties in propertyUpdate
                    // also note that we always get notified about the destroyed signal
                    webChannel.exec({
                        type: QWebChannelMessageTypes.connectToSignal,
                        object: object.__id__,
                        signal: signalIndex
                    });
                }
            },
            disconnect: function (callback) {
                if (typeof (callback) !== "function") {
                    console.error("Bad callback given to disconnect from signal " + signalName);
                    return;
                }
                object.__objectSignals__[signalIndex] = object.__objectSignals__[signalIndex] || [];
                let idx = object.__objectSignals__[signalIndex].indexOf(callback);
                if (idx === -1) {
                    console.error("Cannot find connection of signal " + signalName + " to " + callback.name);
                    return;
                }
                object.__objectSignals__[signalIndex].splice(idx, 1);
                if (!isPropertyNotifySignal && object.__objectSignals__[signalIndex].length === 0) {
                    // only required for "pure" signals, handled separately for properties in propertyUpdate
                    webChannel.exec({
                        type: QWebChannelMessageTypes.disconnectFromSignal,
                        object: object.__id__,
                        signal: signalIndex
                    });
                }
            }
        };
    }

    /**
     * Invokes all callbacks for the given signalname. Also works for property notify callbacks.
     */
    function invokeSignalCallbacks(signalName, signalArgs) {
        let connections = object.__objectSignals__[signalName];
        if (connections) {
            connections.forEach(function (callback) {
                callback.apply(callback, signalArgs);
            });
        }
    }

    this.propertyUpdate = function (signals, propertyMap) {
        // update property cache
        for (let propertyIndex in propertyMap) {
            let propertyValue = propertyMap[propertyIndex];
            object.__propertyCache__[propertyIndex] = propertyValue;
        }

        for (let signalName in signals) {
            // Invoke all callbacks, as signalEmitted() does not. This ensures the
            // property cache is updated before the callbacks are invoked.
            invokeSignalCallbacks(signalName, signals[signalName]);
        }
    }

    this.signalEmitted = function (signalName, signalArgs) {
        invokeSignalCallbacks(signalName, signalArgs);
    }

    function addMethod(methodData) {
        let methodName = methodData[0];
        let methodIdx = methodData[1];
        object[methodName] = function () {
            let args = [];
            let callback;
            for (let i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] === "function")
                    callback = arguments[i];
                else
                    args.push(arguments[i]);
            }

            webChannel.exec({
                "type": QWebChannelMessageTypes.invokeMethod,
                "object": object.__id__,
                "method": methodIdx,
                "args": args
            }, function (response) {
                if (response !== undefined) {
                    let result = object.unwrapQObject(response);
                    if (callback) {
                        (callback)(result);
                    }
                }
            });
        };
    }

    function bindGetterSetter(propertyInfo) {
        let propertyIndex = propertyInfo[0];
        let propertyName = propertyInfo[1];
        let notifySignalData = propertyInfo[2];
        // initialize property cache with current value
        // NOTE: if this is an object, it is not directly unwrapped as it might
        // reference other QObject that we do not know yet
        object.__propertyCache__[propertyIndex] = propertyInfo[3];

        if (notifySignalData) {
            if (notifySignalData[0] === 1) {
                // signal name is optimized away, reconstruct the actual name
                notifySignalData[0] = propertyName + "Changed";
            }
            addSignal(notifySignalData, true);
        }

        Object.defineProperty(object, propertyName, {
            get: function () {
                let propertyValue = object.__propertyCache__[propertyIndex];
                if (propertyValue === undefined) {
                    // This shouldn't happen
                    console.warn("Undefined value in property cache for property \"" + propertyName + "\" in object " + object.__id__);
                }

                return propertyValue;
            },
            set: function (value) {
                if (value === undefined) {
                    console.warn("Property setter for " + propertyName + " called with undefined value!");
                    return;
                }
                object.__propertyCache__[propertyIndex] = value;
                webChannel.exec({
                    "type": QWebChannelMessageTypes.setProperty,
                    "object": object.__id__,
                    "property": propertyIndex,
                    "value": value
                });
            }
        });

    }

    // ----------------------------------------------------------------------

    data.methods.forEach(addMethod);

    data.properties.forEach(bindGetterSetter);

    data.signals.forEach(function (signal) {
        addSignal(signal, false);
    });

    for (let enumName in data.enums) {
        object[name] = data.enums[enumName];
    }
}

class eloam {
    //当前高拍仪连接
    curEloamApi;

    //websocket对话
    eloamDialog;

    //返回数据
    eloamReturnData = {
        "retcode": "0",
        "retinfo": ""
    };

    //编码与命令映射
    eloamhandleMap = {
        "1002": "closeSignal",
        "1003": "singleReadIDCard",
        "3001": "InitBiokey",
        "3004": "GetBiokeyFeature",
        "3006": "BiokeyVerify",
        "5006": "verifyFaceDetect",
        "1101": "setScanSize_ori",
        "1102": "setScanSize_A5",
        "1103": "setScanSize_A4",
        "1104": "setScanSize_card",
        "1105": "closePriVideo",
        "1106": "closeSubVideo",
        "1107": "savePhotoPriDev",
        "1108": "savePhotoSubDev",
        "1109": "rotateLeft",
        "1110": "rotateRight",
        "1111": "showProperty",
        "1112": "setdeskew",
        "1113": "startIDCard",
        "1114": "stopIDCard",
        "1115": "startLive",
        "1116": "stopLive",
        "1117": "stopPriRecord",
        "1118": "stopSubRecord",
        "1119": "imageBlend",
        "1120": "GetSoftDogKey",
        "1121": "discernOcr",
        "1122": "StopBiokeyFeature",
        "1123": "GetBiokeyTemplate",
        "1124": "StopBiokeyTemplate",
        "1125": "DeinitBiokey",
        "1126": "singleReadBarcode",
        "1127": "SetMoveDetec",
        "1128": "setgray",
        "1129": "setthreshold",
        "1130": "delbkcolor",
        "1131": "setreverse",
        "1201": "setScanSizePri",
        "1202": "setScanSizeSub",
        "1203": "imageBase64Matching",
        "1204": "imageMatching",
        "1205": "getIdcardImage",
        "1206": "DoubleRecording",
        "1207": "priRecord",
        "1208": "subRecord",
        "1209": "getFileBase64",
        "1210": "composePDF",
        "1211": "deleteFile",
        "1212": "DiscernOCRTempl",
        "1213": "enablePriDate",
        "1214": "enablePriWord",
        "1215": "setImageProperty"
    };

    //使用functionType初始编码
    functionTypeSourceCode = 1200;

    //拍照用户信息
    eloamUser = {};

    //高拍仪读卡回调函数
    eloamApiCallback = function () {};

    //连接websocket
    eloamApi() {
        let eloamUrl = "ws://localhost:12345";
        this.eloamSocket = null;
        try {
            this.eloamSocket = new WebSocket(eloamUrl);
            console.log("成功连接WebSocket服务！(" + eloamUrl + ")");
            this.eloamSocket.onclose = function () {
                console.error("web channel closed");
            };
            this.eloamSocket.onerror = function (error) {
                console.error("web channel error: " + error);
            };
        } catch (exception) {
            console.log('ERROR: ' + exception);
        }
    }

    eloamhandle(this_, param) {
        try {
            let targetVueId = this_.$options._componentTag;
            let eloamApiObject;
            if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][eloamString] == null)) {
                console.info("高拍仪未初始化");
                return false;
            } else {
                eloamApiObject = edMap[targetVueId][eloamString];
            }
            edCode = param.code;
            if (edCode == "1107") {
                eloamApiObject.eloamDialog.photoBtnClicked("primaryDev_");
            }
            if (edCode == "1108") {
                eloamApiObject.eloamDialog.photoBtnClicked("subDev_");
            }
            let order = eloamApiObject.eloamhandleMap[edCode];
            if (parseInt(edCode) > eloamApiObject.functionTypeSourceCode) {
                if (edCode == "1201") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.picWidth, param.picHeight, param.type);
                } else if (edCode == "1203") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.onebase64, param.twobase64, "");
                } else if (edCode == "1204") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.oneSrc, param.twoSrc, "");
                } else if (edCode == "1209") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.fileSrc, "", "");
                } else if (edCode == "1210") {
                    let imgPathArray = param.imgPathArray;
                    if (imgPathArray.length > 0) {
                        for (let i = 0; i < imgPathArray.length; i++) {
                            let path = imgPathArray[i];
                            if (path.indexOf("file:///") >= 0) {
                                path = path.substr(8);
                            }
                            eloamApiObject.eloamDialog.get_functionTypes("sendPDFImgPath", path, "", "");
                        }
                        eloamApiObject.eloamDialog.get_functionTypes(order, param.filePath, param.fileName, param.quality);
                    }
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.fileSrc, "", "");
                } else if (edCode == "1211") {
                    let imgPathArray_1211 = param.imgPathArray;
                    for (let j = 0; j < imgPathArray_1211.length; j++) {
                        let path_1211 = imgPathArray_1211[j];
                        if (path_1211.indexOf("file:///") >= 0) {
                            path_1211 = path_1211.substr(8);
                        }
                        eloamApiObject.eloamDialog.get_functionTypes(order, path_1211, "", "");
                    }
                } else if (edCode == "1212") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.templateSrc, "", "");
                } else if (edCode == "1213") {
                    eloamApiObject.eloamDialog.get_functionTypes("setFontProperty", "20", "", "");
                    eloamApiObject.eloamDialog.get_functionTypes("enablePriDate", param.datePosition, param.dateColor, "");
                    eloamApiObject.eloamDialog.get_functionTypes("enableSubDate", param.datePosition, param.dateColor, "");
                } else if (edCode == "1214") {
                    eloamApiObject.eloamDialog.get_functionTypes("setFontProperty", "20", "", "");
                    eloamApiObject.eloamDialog.get_functionTypes("enablePriWord", param.wordPosition, param.wordColor, param.wordContent);
                    eloamApiObject.eloamDialog.get_functionTypes("enableSubWord", param.wordPosition, param.wordColor, param.wordContent);
                } else if (edCode == "1215") {
                    eloamApiObject.eloamDialog.get_functionTypes(order, param.picDpi, param.picQuality, "");
                } else {
                    eloamApiObject.eloamDialog.get_functionTypes(order);
                }
            } else {
                eloamApiObject.eloamDialog.get_actionType(order);
            }
        } catch (e) {
            console.error("调用高拍仪函数异常：" + e);
        }
    }

    //高拍仪拍照
    eloamPhotohandle(this_) {
        let targetVueId = this_.$options._componentTag;
        if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][eloamString] == null)) {
            console.info("高拍仪未初始化");
            return false;
        }
        eloamPhotoComp.$refs.eloamPhotoRef.eloamVisible = true;
    }
}

//高拍仪拍照完成
function eloamPhotoComplete(data) {
    let targetVueId = curPhotoTargetVueId;
    let eloamApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][eloamString] == null)) {
        console.info("高拍仪未初始化");
        return false;
    }
    eloamApiObject = edMap[targetVueId][eloamString];
    eloamApiObject.eloamPhotoCallback(data);
}

//初始化高拍仪函数调用
function initEloamApi(this_, commonCallback) {
    let targetVueId = this_.$options._componentTag;
    let eloamApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][eloamString] == null)) {
        eloamApiObject = new eloam();
        eloamApiObject.curEloamApi = new eloamApiObject.eloamApi();
    } else {
        eloamApiObject = edMap[targetVueId][eloamString];
    }
    eloamApiObject.eloamApiCallback = commonCallback;
    eloamApiObject.curEloamApi.eloamSocket.onopen = function () {
        new QWebChannel(eloamApiObject.curEloamApi.eloamSocket, function (channel) {
            //获取注册的对象
            window.dialog = channel.objects.dialog;
            eloamApiObject.eloamDialog = channel.objects.dialog;
            //网页关闭函数
            window.onbeforeunload = function () {
                //发送关闭信号
                eloamApiObject.eloamDialog.get_actionType("closeSignal");
                //关闭socket
                eloamApiObject.curEloamApi.eloamSocket.close();
            };
            window.onunload = function () {
                //发送关闭信号
                eloamApiObject.eloamDialog.get_actionType("closeSignal");
                //关闭socket
                eloamApiObject.curEloamApi.eloamSocket.close();
            };

            //服务器返回消息
            eloamApiObject.eloamDialog.sendPrintInfo.connect(function (message) {
                if (curTargetVueId != null && curTargetVueId != targetVueId) {
                    return false;
                }
                if (!message) {
                    eloamApiObject.eloamReturnData.retcode = "500";
                    commonCallback(eloamApiObject.eloamReturnData);
                    console.log("no response data");
                    return;
                }
                if (message == "No equipment found!") {
                    isHb = false;
                    console.log("高拍仪已断开");
                } else {
                    isHb = true;
                    console.log("高拍仪已连接");
                }
                //读取身份证
                if (edCode == "1003") {
                    if (message.indexOf("IDcardInfo:") != -1) {
                        let userString = message.replace("IDcardInfo:", "");
                        let userStringArray = userString.split(" ");
                        eloamApiObject.eloamUser.name = userStringArray[0];
                        eloamApiObject.eloamUser.sex = userStringArray[1];
                        eloamApiObject.eloamUser.nation = userStringArray[2];
                        eloamApiObject.eloamUser.birth = userStringArray[3] + userStringArray[4] + userStringArray[5];
                        eloamApiObject.eloamUser.address = userStringArray[6];
                        eloamApiObject.eloamUser.id = userStringArray[7];
                        eloamApiObject.eloamUser.organ = userStringArray[8];
                        eloamApiObject.eloamUser.begin_date = userStringArray[9] + userStringArray[10] + userStringArray[11];
                        eloamApiObject.eloamUser.end_date = userStringArray[12] + userStringArray[13] + userStringArray[14];
                        let param = {
                            "code": "1205"
                        };
                        eloamApiObject.eloamhandle(this_, param);
                    }
                }
                //ocr识别
                else if (edCode == "1121") {
                    eloamApiObject.eloamReturnData.data = message.replace("ocrReadContent:", "");
                    let data = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(data);
                }
                //获取二代证图像
                else if (edCode == "1205") {
                    eloamApiObject.eloamUser.photo_base64 = message.replace("idFaceInfo:", "");
                    eloamApiObject.eloamReturnData.user = eloamApiObject.eloamUser;
                    let eloamData_1205 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    edCode = "1003";
                    commonCallback(eloamData_1205);
                }
                //获取文件base64
                else if (edCode == "1209") {
                    eloamApiObject.eloamReturnData.data = message.replace("fileBase64:", "");
                    let eloamData_1209 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData_1209);
                }
                //获取指纹特征
                else if (edCode == "3004") {
                    eloamApiObject.eloamReturnData.data = message.replace("BiokeyFeatureBase64:", "");
                    let eloamData_3004 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData_3004);
                }
                //获取指纹模板
                else if (edCode == "1123") {
                    eloamApiObject.eloamReturnData.data = message.replace("BiokeyTemplateBase64:", "");
                    let eloamData_1123 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData_1123);
                }
                //图片合成pdf
                else if (edCode == "1210") {
                    eloamApiObject.eloamReturnData.data = message.replace("composePDF_success:", "");
                    let eloamData_1210 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData_1210);
                }
                //条码阅读
                else if (edCode == "1126") {
                    eloamApiObject.eloamReturnData.data = message.replace("BarcodeInfo:", "");
                    let eloamData_1126 = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData_1126);
                } else {
                    let eloamData = {
                        "data": JSON.stringify(eloamApiObject.eloamReturnData)
                    };
                    commonCallback(eloamData);
                }
            });
        });
    }
    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curEloam = {
            [eloamString]: eloamApiObject
        };
        edMap[targetVueId] = curEloam;
    } else {
        if (edMap[targetVueId][eloamString] == null) {
            edMap[targetVueId][eloamString] = eloamApiObject;
        }
    }
}

//初始化高拍仪拍照完成回调函数
function initEloamPhotoApi(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let eloamApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][eloamString] == null)) {
        console.info("高拍仪未初始化");
        return false;
    }
    eloamApiObject = edMap[targetVueId][eloamString];
    eloamApiObject.eloamPhotoCallback = callback;
    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curEloam = {
            [eloamString]: eloamApiObject
        };
        edMap[targetVueId] = curEloam;
    } else {
        if (edMap[targetVueId][eloamString] == null) {
            edMap[targetVueId][eloamString] = eloamApiObject;
        }
    }
}

//捷宇高拍仪类
class doccameraOcx {

    curDoccameraOcx;

    //返回数据
    doccameraOcxReturnData = {
        "retcode": "0",
        "retinfo": ""
    };

    //编码与命令映射
    doccameraOcxHandleMap = {
        "1132": "bStartPlay",
        "1105": "bStopPlay",
        "1209": "sGetBase64",
        "1003": "ReadCard(1001,\"D:\\wid\")",
        "1133": "bStartPlay2(0)",
        "1109": "bStartPlayRotate"

    }

    //拍照回调函数
    doccameraOcxPhotoCallBack;

    /**
     * 连接并配置WebSocket服务
     */
    initDoccameraOcxWebSocket() {
        try {
            this.wsUrl = "localhost:1818";
            // 连接ws服务
            this.ws = new WebSocket(`ws://${this.wsUrl}`);
            this.ws.onopen = () => {
                /*this.isStart = true;
                if(typeof this.targetHandle.init === 'function'){
                    this.targetHandle.init(this);
                }*/
                console.log('WebSocket connect success');
            }
            this.ws.onerror = (e) => {
                //this.isStart = false;
                console.log('WebSocket connect failed');
                console.error(e);
            }
            /*this.ws.onmessage = (event) => {
                //this.targetHandle.onMessage(this,event);
                console.log(event);

            }*/
            this.ws.onclose = () => {
                this.isStart = false;
                console.log('WebSocket closed');
            }
            // return true;
        } catch (e) {
            this.isStart = false;
            console.log('WebSocket connect error : ' + e);
            // return false;
        }

    }

    doccameraOcxHandle(this_, param) {
        let targetVueId = this_.$options._componentTag;
        let doccameraOcxApiObject;
        if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][doccameraOcxString] == null)) {
            console.info("捷宇高拍仪未初始化");
            return false;
        } else {
            doccameraOcxApiObject = edMap[targetVueId][doccameraOcxString];
        }
        if (param == null) {
            doccameraOcxApiObject.doccameraOcxPhotoCallBack();
        } else {
            // debugger
            edCode = param.code;
            let order = doccameraOcxApiObject.doccameraOcxHandleMap[edCode];
            // doccameraOcxApiObject.curDoccameraOcx.ws.send(order);
        }
    }

}

function initDoccameraOcx(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let doccameraOcxApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][doccameraOcxString] == null)) {
        doccameraOcxApiObject = new doccameraOcx();
        // doccameraOcxApiObject.curDoccameraOcx = new doccameraOcxApiObject.initDoccameraOcxWebSocket();
        // console.log(doccameraOcxApiObject.curDoccameraOcx,'gaopaiyi');
    } else {
        doccameraOcxApiObject = edMap[targetVueId][doccameraOcxString];
    }
    //调用捷宇高拍仪函数的回调函数

    //判断是否为空对象
    if (Object.keys(doccameraOcxApiObject).length > 0) {

        //判断初始化哪个组件参数
        let whichComponentTag = (this_, compTagName) => {
            if (this_.$options._componentTag == compTagName) {
                let baseOpt = {
                    optName: compTagName,
                    sType_doccameraOcxFlag: true,
                    DoccameraOcx_wsUrl: 'localhost:1818',
                    imgUpdateFunc: (imgData) => {
                        this_.edPriPhoto = imgData;
                    },
                    readCardFunc1: (data) => {
                        this_.idCardName = data.Name;
                        console.log(data);
                    },
                    readCardFunc2: (data) => {
                        this_.idCardNo = data.IDCardNo;
                        console.log(data);
                    },
                    getImgFunc: (imgData) => {
                        // console.log(imgData);
                        if (imgData.code === 0) {
                            this_.edSubPhoto = `data:image/jpeg;base64,${imgData.imgList[0]}`;
                        }
                    },

                }

                //执行下面初始化函数 判断捷宇初始化是否成功-isDoccameraOcxFlag
                // debugger
                myDcTool.start(baseOpt);
            }

        }
        whichComponentTag(this_, 'photoTest1');
        whichComponentTag(this_, 'photoTest2');
        whichComponentTag(this_, 'idCardTest1');
        whichComponentTag(this_, 'idCardTest2');

    }

    /* doccameraOcxApiObject.curDoccameraOcx.ws.onmessage = function (data) {
        debugger
        console.log(data, 111111, edCode, '====')
        //读取身份证
        if (edCode == "1003") {
            console.info(data);
            let idCardData = JSON.parse(data);
            let doccameraOcxUser = {};
            doccameraOcxUser.name = idCardData.Name;
            doccameraOcxUser.sex = idCardData.Sex;
            doccameraOcxUser.nation = idCardData.Folk;
            doccameraOcxUser.birth = idCardData.BirthDate;
            doccameraOcxUser.address = idCardData.Address;
            doccameraOcxUser.id = idCardData.IdNo;
            doccameraOcxUser.organ = idCardData.Agency;
            //doccameraOcxUser.begin_date = userStringArray[9] + userStringArray[10] + userStringArray[11];
            //doccameraOcxUser.end_date = userStringArray[12] + userStringArray[13] + userStringArray[14];
            doccameraOcxApiObject.doccameraOcxReturnData.user = doccameraOcxUser;
            let doccameraOcxUserData = {
                "data": JSON.stringify(doccameraOcxApiObject.doccameraOcxReturnData)
            };
            callback(doccameraOcxUserData);
        } else if (edCode == "1132") {
            debugger
            console.log(doccameraOcxApiObject['curDoccameraOcx']['ws'], 9991)
            console.log(887, doccameraOcxApiObject)
            //data为mydemo中message   doccameraOcxApiObject ['curDoccameraOcx']['ws]为ws实例

            debugger
            console.log('打开摄像头', doccameraOcxApiObject)
        } else {
            callback(data);
        }
        doccameraOcxApiObject.doccameraOcxPhotoCallBack = callback(data);
    }; */

    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curDoccameraOcx = {
            [doccameraOcxString]: doccameraOcxApiObject
        };
        edMap[targetVueId] = curDoccameraOcx;
    } else {
        if (edMap[targetVueId][doccameraOcxString] == null) {
            edMap[targetVueId][doccameraOcxString] = doccameraOcxApiObject;
        }
    }
}

class idCardReader {
    curIdCardReader;

    //返回数据
    idCardReaderReturnData = {
        "retcode": "0",
        "retinfo": ""
    };

    //编码与命令映射
    idCardReaderHandleMap = {
        "1001": "InitCamLib",
        "1003": "ReadIDCard",
    }

    /**
     * 连接并配置WebSocket服务
     */
    initIdCardReaderWebSocket() {
        try {
            this.wsUrl = "localhost:7896";
            // 连接ws服务
            this.ws = new WebSocket(`ws://${this.wsUrl}`);
            this.ws.onopen = () => {
                console.log('WebSocket connect success');
            }
            this.ws.onerror = (e) => {
                //this.isStart = false;
                console.log('WebSocket connect failed');
                console.error(e);
            }
            this.ws.onclose = () => {
                this.isStart = false;
                console.log('WebSocket closed');
            }
            return true;
        } catch (e) {
            this.isStart = false;
            console.log('WebSocket connect error : ' + e);
            return false;
        }
    }

    idCardReaderHandle(this_, param) {
        let targetVueId = this_.$options._componentTag;
        let idCardReaderApiObject;
        if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][idCardReaderString] == null)) {
            console.info("身份证阅读器未初始化");
            return false;
        } else {
            idCardReaderApiObject = edMap[targetVueId][idCardReaderString];
        }
        edCode = param.code;
        let order = idCardReaderApiObject.idCardReaderHandleMap[edCode];
        let command = JSON.stringify({
            FuncName: order
        });
        idCardReaderApiObject.curIdCardReader.ws.send(command);
    }

}

function initIdCardReader(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let idCardReaderApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][idCardReaderString] == null)) {
        idCardReaderApiObject = new idCardReader();
        idCardReaderApiObject.curIdCardReader = new idCardReaderApiObject.initIdCardReaderWebSocket();
    } else {
        idCardReaderApiObject = edMap[targetVueId][idCardReaderString];
    }

    //调用身份证阅读器函数的回调函数
    /* idCardReaderApiObject.curIdCardReader.ws.onmessage = function (data) {
        //读取身份证
        if (edCode == "1003") {
            console.info(data);
            let idCardData = JSON.parse(data);
            let idCardReaderUser = {};
            idCardReaderUser.name = idCardData.Name;
            idCardReaderUser.sex = idCardData.Sex;
            idCardReaderUser.nation = idCardData.Folk;
            idCardReaderUser.birth = idCardData.BirthDate;
            idCardReaderUser.address = idCardData.Address;
            idCardReaderUser.id = idCardData.IdNo;
            idCardReaderUser.organ = idCardData.Agency;
            //doccameraOcxUser.begin_date = userStringArray[9] + userStringArray[10] + userStringArray[11];
            //doccameraOcxUser.end_date = userStringArray[12] + userStringArray[13] + userStringArray[14];
            idCardReaderApiObject.idCardReaderReturnData.user = idCardReaderUser;
            let idCardReaderUserData = {
                "data": JSON.stringify(idCardReaderApiObject.idCardReaderReturnData)
            };
            callback(idCardReaderUserData);
        } else {
            callback(data);
        }
    }; */
    if (Object.keys(idCardReaderApiObject).length > 0) {
        let whichComponentTag = (this_, compTagName) => {
            if (this_.$options._componentTag == compTagName) {
                let baseOpt = {
                    optName: compTagName,
                    sType_idCardReader: true,
                    idCardReader_wsUrl: 'localhost:7896',
                    imgUpdateFunc: (imgData) => {
                        this_.edPriPhoto = imgData;
                    },
                    readCardFunc1: (data) => {
                        this_.idCardName = data.Name;
                        console.log(data);
                    },
                    readCardFunc2: (data) => {
                        this_.idCardNo = data.IDCardNo;
                        console.log(data);
                    },
                    getImgFunc: (imgData) => {
                        // console.log(imgData);
                        if (imgData.code === 0) {
                            this_.edSubPhoto = `data:image/jpeg;base64,${imgData.imgList[0]}`;
                        }
                    },

                }

                //执行下面初始化函数 判断身份证阅读器初始化是否成功-
                // debugger
                myDcTool.start(baseOpt);
            }
        }

        //不同组件进行参数初始化
        whichComponentTag(this_, 'photoTest1');
        whichComponentTag(this_, 'photoTest2');
        whichComponentTag(this_, 'idCardTest1');
        whichComponentTag(this_, 'idCardTest2');

    }
    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curIdCardReader = {
            [idCardReaderString]: idCardReaderApiObject
        };
        edMap[targetVueId] = curIdCardReader;
    } else {
        if (edMap[targetVueId][idCardReaderString] == null) {
            edMap[targetVueId][idCardReaderString] = idCardReaderApiObject;
        }
    }
}

class kt600 {

    kt600PhotoCallback;

    //编码与命令映射
    kt600HandleMap = {
        "1001": "/OpenApp",
        "1002": "/CloseApp",
        "1134": "/GetImages",
        "1135": "/ClearImages",
    }

    // kt600Url = 'http://127.0.0.1:28080/NIExpress'; //根据官方地址做了下面修改
    kt600Url = 'http://127.0.0.1:28080/WebScan';

    kt600Handle(this_, param) {
        let targetVueId = this_.$options._componentTag;
        let kt600ApiObject;
        if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][kt600String] == null)) {
            console.info("开易拍未初始化");
            return false;
        } else {
            kt600ApiObject = edMap[targetVueId][kt600String];
        }
        let code = param.code;
        axios.post(`${this.kt600Url}${this.kt600HandleMap[code]}`, {}).then((res) => {
            kt600ApiObject.kt600PhotoCallback(res);
        });
    }
}

function initKt600(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    let kt600ApiObject;
    if (edMap[targetVueId] == null || (edMap[targetVueId] != null && edMap[targetVueId][kt600String] == null)) {
        kt600ApiObject = new kt600();
    } else {
        kt600ApiObject = edMap[targetVueId][kt600String];
    }
    kt600ApiObject.kt600PhotoCallback = callback;

    //调用易开拍初始化方法
    if (Object.keys(kt600ApiObject).length > 0) {
        let whichComponentTag = (this_, compTagName) => {
            if (this_.$options._componentTag == compTagName) {
                let baseOpt = {
                    optName: compTagName,
                    sType_kt600: true,
                    imgUpdateFunc: (imgData) => {
                        this_.edPriPhoto = imgData;
                    },
                    getImgFunc: (imgData) => {
                        // console.log(imgData);
                        if (imgData.code === 0) {
                            this_.edSubPhoto = `data:image/jpeg;base64,${imgData.imgList[(imgData.imgList.length)-2]}`;
                        }
                    },
                    getImgFunc1: (imgData) => {
                        // console.log(imgData);
                        if (imgData.code === 0) {
                            this_.edPriPhoto = `data:image/jpeg;base64,${imgData.imgList[(imgData.imgList.length)-1]}`;
                        }
                    },
                    readCardFunc1: (data) => {
                        this_.idCardName = data.Name;
                        console.log(data);
                    },
                    readCardFunc2: (data) => {
                        this_.idCardNo = data.IDCardNo;
                        console.log(data);
                    },
                }

                //执行下面初始化函数 判断易开拍初始化是否成功-isKt600Flag
                myDcTool.start(baseOpt);
            }


        }
        whichComponentTag(this_, 'photoTest1');
        whichComponentTag(this_, 'photoTest2');
        whichComponentTag(this_, 'idCardTest1');
        whichComponentTag(this_, 'idCardTest2');
    }


    //加入到外设集合
    if (edMap[targetVueId] == null) {
        let curKt600 = {
            [kt600String]: kt600ApiObject
        };
        edMap[targetVueId] = curKt600;
    } else {
        if (edMap[targetVueId][kt600String] == null) {
            edMap[targetVueId][kt600String] = kt600ApiObject;
        }
    }
}

//初始化读卡、指纹等功能的回调函数
function initEdApi(this_, callback) {
    initNkoApi(this_, callback);
    initEloamApi(this_, callback);
    initDoccameraOcx(this_, callback);
    initIdCardReader(this_, callback);
}

//调用读卡、指纹等功能的函数
function edApihandle(this_, param) {
    // debugger
    let targetVueId = this_.$options._componentTag;
    console.log(targetVueId, 115)
    if (edMap[targetVueId] == null) {
        console.info("外设未初始化");
        return false;
    } else {
        curTargetVueId = targetVueId;
        if (isAio) {
            if (edMap[targetVueId][nkoString] == null) {
                console.info("一体机未初始化");
                return false;
            } else {
                edMap[targetVueId][nkoString].nkoApihandle(this_, param);
            }
        } else if (isHb) {
            if (edMap[targetVueId][eloamString] == null) {
                console.info("高拍仪未初始化");
                return false;
            } else {
                edMap[targetVueId][eloamString].eloamhandle(this_, param);
            }
        } else if (myDcTool.isDoccameraOcxFlag) {

            if (edMap[targetVueId][doccameraOcxString] == null) {
                console.info("捷宇高拍仪未初始化");
                return false;
            } else {
                // debugger

                myDcTool.send('read', targetVueId)
                // edMap[targetVueId][doccameraOcxString].doccameraOcxHandle(this_, param);
            }
        } else if (myDcTool.isIdCardReaderFlag) {
            if (edMap[targetVueId][idCardReaderString] == null) {
                console.info("身份证阅读器未初始化");
                return false;
            } else {
                // edMap[targetVueId][idCardReaderString].idCardReaderHandle(this_, param);
                myDcTool.send('read', targetVueId)
            }
        } else {
            console.info("没有连接外设");
        }
    }

}

//初始化拍照相关功能的回调函数
function initEdPhotoApi(this_, callback) {
    let targetVueId = this_.$options._componentTag;
    initNkoScanApi(this_, callback);
    initEloamPhotoApi(this_, callback);
    // initDoccameraOcx(this_, callback);
    initKt600(this_, callback);
    //延时两秒初始化高拍仪拍照组件
    window.setTimeout(function () {
        if (typeof edMap[targetVueId][eloamString].eloamDialog != 'undefined') {
            eloamPhotoComp.$refs.eloamPhotoRef.eloamDialog = edMap[targetVueId][eloamString].eloamDialog;
            eloamPhotoComp.$refs.eloamPhotoRef.initEloamPhoto();
        }
    }, 2000);
}

//调用拍照相关功能的函数
function edPhotohandle(this_) {
    let targetVueId = this_.$options._componentTag;
    if (edMap[targetVueId] == null) {
        console.info("外设未初始化");
        return false;
    } else {
        curPhotoTargetVueId = targetVueId;
        if (isAio) {
            if (edMap[targetVueId][nkoString] == null) {
                console.info("一体机未初始化");
                return false;
            } else {
                edMap[targetVueId][nkoString].nkoScanApihandle(this_);
            }
        } else if (isHb) {
            if (edMap[targetVueId][eloamString] == null) {
                console.info("高拍仪未初始化");
                return false;
            } else {
                edMap[targetVueId][eloamString].eloamPhotohandle(this_);
            }
        } else if (myDcTool.isDoccameraOcxFlag) {
            // debugger
            if (edMap[targetVueId][doccameraOcxString] == null) {
                console.info("捷宇高拍仪未初始化");
                return false;
            } else {
                // debugger
                myDcTool.send('open', targetVueId);
                //捷宇延迟1秒拍照
                if(window.jieYu_photoHandle_timeOut){
                    clearTimeout(window.jieYu_photoHandle_timeOut);
                    window.jieYu_photoHandle_timeOut = null;
                }
                window.jieYu_photoHandle_timeOut = setTimeout(function () {
                    myDcTool.send('save', targetVueId)
                }, 400)
            }
        } else if (myDcTool.isKt600Flag) {
            if (edMap[targetVueId][kt600String] == null) {
                console.info("易拍仪未初始化");
                return false;
            } else {
                if(window.myTimer){
                    clearInterval(window.myTimer);
                    window.myTimer = null;
                }
                myDcTool.send('open',targetVueId);
                window.myTimer = setInterval(function () {
                    myDcTool.send('save',targetVueId);
                }, 300)
            }
        } else {
            console.log(myDcTool.isKt600Flag, 'kt6000')
            console.info("没有连接外设");
        }
    }
}

//发送高拍仪拍照组件所在的组件
function sendThis(this_) {
    eloamPhotoComp = this_;
}

export {
    initEdApi,
    edCode,
    edApihandle,
    initEdPhotoApi,
    edPhotohandle,
    sendThis,
    eloamPhotoComplete
}