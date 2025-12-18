
export default class NetMsgIdManager {
    private static _sendNoLoading = [

    ]

    private static _reciveNoLoading = [
        
    ]

    static checkSendNoLoading(msgId:number) {
        for (let index = 0; index < this._sendNoLoading.length; index++) {
            if (msgId == this._sendNoLoading[index]) {
                return true;
            }
        }
        return false;
    }

    static checkReciveNoLoading(msgId:number) {
        for (let index = 0; index < this._reciveNoLoading.length; index++) {
            if (msgId == this._reciveNoLoading[index]) {
                return true;
            }
        }
        return false;
    }
}

