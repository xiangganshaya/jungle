import { debug, log, warn } from "cc";
import SubGameCtrl from "../subCtrls/SubGameCtrl";
import GameEventManager from "../../../manager/GameEventManager";
import { GameEvent } from "../../../config/GameEventConfig";
import NetEventManager from "./NetEventManager";
import WindowManager from "../../../manager/WindowManager";
import GameTools from "../../../utils/GameTools";
import { Config } from "../../../config/Config";


class NetMsgInfo {
    id: string = "";    //消息的类行 login / ping / no
    msg: string | Uint8Array = null;
    requestId: number = 0;
    encodeType: number = 0;
    errorCode: number = 0;
}


//websocket的管理类
export default class NetManager {
    private static _instance: NetManager = null;
    private _websocket: WebSocket = null;

    private _sendHeartBeatTime: number = 0;

    private _connectIP: string = "";
    private _connectPort: string = "";
    private _connectCacertUrl: string = "";
    private _router: string = "";
    private _isWSS: boolean = false;

    private _showLoadingIds: number[] = [];

    private _isNetClose = false;

    private _preLoginMsgs: NetMsgInfo[] = [];
    private _waitMsgData: any = {}

    private _requestId: number = 1;


    //---------------------

    /**
     * getInstance
     */
    public static getInstance() {
        if (!this._instance) {
            this._instance = new NetManager();
        }
        return this._instance;
    }

    public static printMsgDataInfo(msg: any, desc: string = "", isReturn: boolean = false) {
        if (!GAME_DEV) {
            return;
        }
        if (!msg) {
            return;
        }
        let re: any = {}
        let typeList = ['string', 'number', 'boolean']

        if (!isReturn && (msg instanceof Array)) {
            let list1 = []
            for (let i = 0; i < msg.length; i++) {
                let value = this.printMsgDataInfo(msg[i], '', true);
                list1.push(value)
            }
            re = list1
        } else {
            for (const key in msg) {
                if (key.toString().indexOf('get') == 0) {
                    let key1 = key.toString().toLowerCase()
                    // key1 = key1.slice(3)
                    key1 = key1.substring(3).replace("listlist", "list")
                    let obj = msg[key]()
                    let valueType = typeof obj
                    if (obj instanceof Array) {
                        let list1 = []
                        if (obj.length > 0) {
                            let valueType2 = typeof obj[0]
                            let index = typeList.indexOf(valueType2)
                            if (index >= 0) {
                                list1 = obj
                            } else {
                                for (let i = 0; i < obj.length; i++) {
                                    let value = this.printMsgDataInfo(obj[i], '', true);
                                    list1.push(value)
                                }
                            }
                        }
                        re[key1] = list1
                    } else {
                        let index = typeList.indexOf(valueType)
                        if (index >= 0) {
                            re[key1] = obj
                        } else {
                            let value = this.printMsgDataInfo(obj, '', true);
                            re[key1] = value
                        }
                    }
                }
            }
        }
        if (!isReturn) {
            log("%c " + desc + "  " + 'time=' + SubGameCtrl.getInstance().getServerTime() + JSON.stringify(re, null, 2), "color:#ff00f0")
        } else {
            return re
        }
    }

    /**
     * setConnect
     */
    public setConnectIP(ip: string) {
        this._connectIP = ip;
    }
    /**
     * setConnectPort
     */
    public setConnectPort(port: string) {
        this._connectPort = port;
    }
    /**
     * setConnectCacertUrl
     */
    public setConnectCacertUrl(url) {
        this._connectCacertUrl = url;
    }

    /**
     * setConnectRouter
     */
    public setConnectRouter(router) {
        this._router = router;
    }

    public setIsWSS(iswws) {
        this._isWSS = !!iswws;
    }

    /**
     * content
     */
    // 连接服务器(初始化 / 重连的时候调用)
    public connect(defenseSign: string) {
        // 关闭连接
        this.closeConnect();

        // 清空显示加载id列表
        this._showLoadingIds.length = 0;
        // 清空预登录消息列表
        this._preLoginMsgs.length = 0;
        // 清空等待消息数据
        this._waitMsgData = {};
        // 重置请求id
        this._requestId = 1;

        // 构建连接地址
        let url = this._connectIP;
        if (this._connectPort) {
            url += ":" + this._connectPort;
        }
        if (this._router) {
            url = url + "/" + this._router;
        }
       
        if (Config.IsDefenseSign == 1) {
            if (defenseSign) {
                url += '?' + defenseSign;
            }
        }
        if (this._connectCacertUrl) {  //判断是否为空 这是CA证书的路径或URL，用于验证服务器的SSL/TLS证书。
            // log("wss connect", url);
            // 创建wss连接
            this._websocket = new (<any>WebSocket)("wss://" + url, [], this._connectCacertUrl);
        }
        else {
            // log("ws connect", url);
            if (this._isWSS) {
                // 创建wss连接
                this._websocket = new WebSocket("wss://" + url);
            }
            else {
                // 创建ws连接
                this._websocket = new WebSocket("ws://" + url);
            }
        }

        // 设置websocket的二进制类型
        this._websocket.binaryType = "arraybuffer";

        // 监听websocket的打开事件
        this._websocket.onopen = (evt) => {
            debug("onMessage: onOpen");
            // 设置网络关闭标志为false
            this._isNetClose = false;
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.NET_CLIENT_CONNECT);//ws 链接成功  发送事件通知进行ws的login操作
            // this.startSendHeartMsg();
        }
        this._websocket.onmessage = (evt) => {
            let msgList = this._decode(evt.data);
           
            for (let i = 0; i < msgList.length; i++) {
                const msg: NetMsgInfo = msgList[i];
                debug("onMessage", msg)
                // if( msg.id.toString() != "ping" ){
                //     log("onMessage:",msg);
                // }
                let msgEx = null;
                msgEx = this.popWaitMsg(msg.requestId.toString());

                this._closeNetLoading(msg.id);
                // log("lklkkl ",msg.errorCode);
                if (msg.errorCode == 0) {  //error为 0 时 表示消息体没问题 分发事件(现在ws通信是没有返回errorCode  默认0则无需处理)
                    NetEventManager.getInstance().dispatchNetEvent(msg.id, msg.msg, msgEx);
                } else {
                    
                    // let errorText = ErrorCode.datas[msg.errorCode]
                    // let errorText = (<TranslationConfig>TranslationConfigConfig.datas[msg.errorCode]).text;
                    // log("error messageid ",msg.id," errorcode ",msg.errorCode ,"   ",errorText)
                    // NetEventManager.getInstance().dispatchNetErrorEvent(msg.id, msg.errorCode,msgEx);
                    // log("dispatchNetErrorEvent",msg.id, msg.errorCode)
                    // WindowManager.getInstance().showNetErrorTip(msg.errorCode);

                }
            }
        }
        this._websocket.onerror = (evt) => {
            debug("onMessage: onError", evt);
            WindowManager.getInstance().showSystemTip("网络连接失败")
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.NET_CLIENT_NO_CONNECT);
        }
        this._websocket.onclose = (evt) => {
            debug("onMessage: onClose", evt);
            if (!this._isNetClose) {
                WindowManager.getInstance().showSystemTip("网络断开连接")
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.NET_CLIENT_NO_CONNECT);
            }
        }
    }
    /**
     * closeConnect
     */
    public closeConnect() {
        this._isNetClose = true;
        if (this._websocket) {
            this._websocket.close();
            delete this._websocket;
            this._websocket = null;
        }
        GameEventManager.getInstance().dispatchGameEvent(GameEvent.STOP_CLIENT_HEART);
    }

    public pushPreLoginMsg(msgId, msg) {
        let m = new NetMsgInfo();
        m.id = msgId;
        m.msg = msg;
        this._preLoginMsgs.push(m);
    }
    // 发送预登录消息
    public dispatchPreLoginMsgs() {
        // 遍历预登录消息数组
        for (let i = 0; i < this._preLoginMsgs.length; i++) {
            // 获取当前消息
            const msg = this._preLoginMsgs[i];
            // 发送网络事件
            NetEventManager.getInstance().dispatchNetEvent(msg.id, msg.msg);
        }
        // 清空预登录消息数组
        this._preLoginMsgs.length = 0;
    }

    private _pushNetLoading(requestId) {
        // log("_pushNetLoading", requestId);
        this._showLoadingIds.push(requestId);
        WindowManager.getInstance().showSysLoading();
    }

    private _closeNetLoading(requestId) {
        // log("_closeNetLoading",requestId)
        for (let i = 0; i < this._showLoadingIds.length; i++) {
            if (this._showLoadingIds[i] == requestId) {
                this._showLoadingIds.splice(i, 1);
                WindowManager.getInstance().closeSysLoading();
                break;
            }
        }
    }

    // sendHeartMsg() {
    //     this.sendMessage(pb.msg_cmd.MsgCmd.AUTH_HEARTBEAT,null, false);
    // }


    /**
     * @param id 
     * @param msgData 
     * @param isShow 显示loading 默认显示
     * @param isStoreData 是否需要保存发送的消息 //有时服务器不返回发送的消息，需要客户端本地保存一份
     */
    public sendMessage(id: string, msgData: any = null, isShow: boolean = true, isStoreData: boolean = false) {
        if (!this._websocket) {//ws 连接状态
            return;
        }
        if (this._websocket.readyState === WebSocket.OPEN) {

      
            // log("%c sendMessage " + id, "color:#00f0f0");
            if (isShow) {
                this._pushNetLoading(id);
            }
            if (isStoreData) {
                this.pushWaitMsg(this._requestId.toString(), msgData);
            }
            let eMsg = this._encode(id, msgData);
            this._websocket.send(eMsg);
            this._requestId++;
            if (this._requestId >= 32767) {
                this._requestId = 1;
            }
        }
        else {
            //todo
        }
    }

    /**
     * 
     * @param id 
     * @param msgData 
     */
    public pushWaitMsg(id: string, msgData: any = null) {
        if (!msgData) {
            return;
        }
        this._waitMsgData[id] = msgData;
    }

    public popWaitMsg(id: string) {
        let msg = this._waitMsgData[id];
        if (msg) {
            delete this._waitMsgData[id];
        }

        return msg;
    }

    /**
     * encode
     */
    private _encode(id: string, msg: any) {
        let msgb: Uint8Array = new Uint8Array(0);
        if (msg) {
            msgb = GameTools.getInstance().string2bytes(JSON.stringify(msg));
        }
        let allMsg = new Uint8Array(37 + msgb.length);
        let dvb = new DataView(allMsg.buffer);
        /* 0-31 协议编码 */
        allMsg.set(GameTools.getInstance().string2bytes(id), 0)
        /* 32-35 请求ID */
        dvb.setUint32(32, this._requestId, false);
        /* 36 数据类型 1-json 2-protobuf*/
        dvb.setUint8(36, 1);
        /* 37-end 数据 */
        if (msgb.length > 0) {
            allMsg.set(msgb, 37);
        } else {

        }

        return allMsg;
    }

    /**
     * decode
     */
    private _decode(data: any) {
        let bytes = new Uint8Array(data);

        let msgList = [];

        let dvb = new DataView(bytes.buffer);
        /* 0-31 协议编码 */
        let iduai = 0;
        for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] == 0) {
                break;
            }
            iduai += 1;
        }
        // let id = new TextDecoder().decode(bytes.subarray(0, iduai));
        let id = GameTools.getInstance().bytes2string(bytes.subarray(0, iduai))
        /* 32-35 请求ID */
        let requestId = dvb.getUint32(32, false);
        /* 36 数据类型 */
        let encodeType = dvb.getUint8(36);

        // log("_decode", id, requestId, encodeType)

        let msg = new NetMsgInfo();
        msg.id = id;
        msg.requestId = requestId;
        msg.encodeType = encodeType;
        if (bytes.length > 37) {
            if (msg.encodeType == 1) {
                msg.msg = GameTools.getInstance().bytes2string(bytes.subarray(37));
            }
            else if (msg.encodeType == 2) {
                msg.msg = bytes.subarray(37);
            }
            else {
                msg.msg = GameTools.getInstance().bytes2string(bytes.subarray(37));
            }
        } else {
            msg.msg = null;
        }

        // log("msg", msg)

        msgList.push(msg);
        return msgList;
    }
}
