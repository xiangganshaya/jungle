
import { log } from "cc";
import NetBaseEvent from "./netEvent/NetBaseEvent";

export default class NetEventManager {

    private static _instance: NetEventManager = null;
    // private _gameType:GameType = GameType.Null;


    private _netEventList = {};

    //--------------------

    public static getInstance() {
        if (!this._instance) {
            this._instance = new NetEventManager();
        }
        return this._instance;
    }

    // 注册网络事件
    registerNetEvent(key: string, nm: NetBaseEvent) {
        // log("registerNetEvent", key);
        // 注销网络事件(注销之前同名的事件)
        this.unregisterNetEvent(key);

        // 将网络事件添加到网络事件列表中
        this._netEventList[key] = nm;
    }

    // 取消注册网络事件
    unregisterNetEvent(key: string) {
        // log("unregisterNetEvent", key);
        // 如果_netEventList中存在key，则删除该key对应的值
        if (this._netEventList[key]) {
            delete this._netEventList[key];
        }
    }

    
    // 清除网络事件
    clearRegisterNetEvent() {
        // log("clearRegisterNetEvent")
        // 遍历网络事件列表
        for (const key in this._netEventList) {
            // 删除网络事件
            delete this._netEventList[key];
        }

        // 清空网络事件列表
        this._netEventList = {};
    }

    // 设置网络事件是否延迟
    setNetEventIsDelay(key: string, isDelay: boolean = false) {
        // 如果网络事件列表中存在该事件
        if (this._netEventList[key]) {
            // 设置该事件是否延迟
            this._netEventList[key].setIsDelayMsg(isDelay);
        }
    }

    dispatchNetEvent(msgId: string, msg: any, msgEx: any = null) { //分发网络事件
        // log("net dis event id", msgId);
        // log(msg)
        // NetManager.printMsgDataInfo(msg,'net dis event id')
        let isUseMsg = false;
        for (const key in this._netEventList) {  //遍历事件列表
            // log("dispatchNetEvent", msgId, key)
            if (this._netEventList[key].dispatchNetEvent(msgId, msg, msgEx)) { //判断事件列表中是否有该事件,有则置为true
                isUseMsg = true;
            }
        }

        if (!isUseMsg) {
            log("NetDispatchEvent 没有消息回调函数!!!", msgId);
        }
    }

    dispatchNetErrorEvent(msgId: string, msg: any, msgEx: any = null) { //分发网络错误事件
        // log("net dis event id", msgId);
        let isUseMsg = false;
        for (const key in this._netEventList) {
            if (this._netEventList[key].dispatchNetErrorEvent(msgId, msg, msgEx)) {
                isUseMsg = true;
            }
        }

        if (!isUseMsg) {
            log("dispatchNetErrorEvent 没有消息回调函数!!!", msgId);
        }
    }

}

