

class DelayMsgData {
    msgId: string;
    msg: any;
}

export default class NetBaseEvent {
    private _isDelayMsg: boolean = false;
    private _delayMsgList: DelayMsgData[] = [];

    setIsDelayMsg(isDelay: boolean = false) {
        let _isDelay = this._isDelayMsg;
        this._isDelayMsg = isDelay;
        if (_isDelay) {
            this.releaseDelayMsg();
        }
    }

    getIsDelayMsg() {
        return this._isDelayMsg;
    }

    pushDelayMsg(msgId: string, msg: any) {
        this._delayMsgList.push({
            msgId: msgId,
            msg: msg,
        } as DelayMsgData);
    }

    releaseDelayMsg() {
        for (let i = 0; i < this._delayMsgList.length; i++) {
            const dm = this._delayMsgList[i];
            this.dispatchNetEvent(dm.msgId, dm.msg);
        }

        this.clearDelayMsg();
    }

    clearDelayMsg() {
        this._delayMsgList.length = 0;
    }

    /** 后端返回才有派发信息 */
    dispatchNetEvent(msgId: string, msg: any, msgEx: any = null) {
        switch (msgId) {

            default:
                return false;
        }

        return false;
    }

    /** 有错误码时的派发信息 */
    dispatchNetErrorEvent(msgId: string, errorCode: number, msgEx: any = null) {
        switch (msgId) {

            default:
                return false;
        }

        return false;
    }

}

