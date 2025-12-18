import { debug, log } from "cc";
import WindowManager from "../../../../manager/WindowManager";
import SubGameCtrl from "../../subCtrls/SubGameCtrl";
import { LoginModel, LoginResp, LogoutResp, NotifyMsg, PingResp, ProtocolEnum } from "../netMessage/MessageModes";
import NetBaseEvent from "./NetBaseEvent";

export default class NetGameEvent extends NetBaseEvent {

    dispatchNetEvent(msgId: string, msg: any, msgEx: any = null) {
        debug("NetGameEvent", msgId)
        switch (msgId) {
            case ProtocolEnum.PING:
                {
                    let data: PingResp = JSON.parse(msg);
                    SubGameCtrl.getInstance().setServerTime(data.serverTime/1000);
                    SubGameCtrl.getInstance().resetSendHeartBeatTime();
                }
                break;
            case ProtocolEnum.LOGIN:
                {
                    
                    let data: LoginResp = JSON.parse(msg);
                    // log("login resp", data);
                    if (data.code != 0) {
                        WindowManager.getInstance().showSystemTip(data.message);
                    }
                    else {
                        SubGameCtrl.getInstance().loginResp(data.data);
                    }
                }
                break;
            case ProtocolEnum.LOGOUT:
                {
                    
                    let data: LogoutResp = JSON.parse(msg);
                    SubGameCtrl.getInstance().logoutResp(data);
                }
                break;
            case ProtocolEnum.NOTIFYMSG:
                {
                    let data: NotifyMsg = JSON.parse(msg);
                    SubGameCtrl.getInstance().notifyMsg(data);
                }
                break;

            default:
                return super.dispatchNetEvent(msgId, msg);
        }

        return true;
    }

}

