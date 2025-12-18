import { debug, log } from "cc";
import { GameEvent } from "../../../config/GameEventConfig";
import { HttpConfig, HttpRequestModel } from "../../../config/HttpConfig";
import GameEventManager from "../../../manager/GameEventManager";
import SubGameUtil from "../subUtils/SubGameUtil";
import UserManager from "../subUtils/UserManager";
import WindowManager from "../../../manager/WindowManager";
import { WinId } from "../../../config/WindowConfig";
import NetManager from "../net/NetManager";
import { Config } from "../../../config/Config";
import { LoginReq, LoginModel, LogoutResp, ProtocolEnum, GameInfoIF, NotifyMsgIF, GameState, RuleItemIF } from "../net/netMessage/MessageModes";
import SpriteManager from "../../../manager/SpriteManager";
import HttpManager from "../net/HttpManager";

export default class SubGameCtrl {
    private static _instance: SubGameCtrl = null;

    private _ctrls: any = {};

    private _sendHeartBeatTime: number = 0;
    private _netTimeUrl: string = '';
    private _serverIntervalTime: number = 0;
    private _netIntervalTime: number = 0;

    private _gameModel: GameInfoIF = null;
    private _ruleModel: RuleItemIF[] = [];

    private _isLogin = false; //是否已登录
    private _recordNum = 0; // 历史记录游戏局数
    private _isUpdateGameNum: boolean = false;

    private _isInitOver: boolean = false;

    //--------------

    public static getInstance() {
        if (!this._instance) {
            this._instance = new SubGameCtrl();
            this._instance._init();
        }
        return this._instance;
    }

    private _init() {
        if (!this._gameModel) {
            this._gameModel = {
                // betsStatus: false,
                winnerList: [],
            } as GameInfoIF;
        }
    }

    public getSendHeartBeatTime() {
        return this._sendHeartBeatTime;
    }

    public resetSendHeartBeatTime() {
        debug('GameCtrl:resetSendHeartBeatTime 重置房间心跳');
        this._sendHeartBeatTime = new Date().getTime();
    }

    /**
     * 同步网络时间,单位为秒
     * @param serverTime
     */
    public setServerTime(serverTime: number) {
        let ltime = (new Date().getTime() / 1000);
        // let ltime = Math.floor(new Date().getTime() / 1000);
        let stime = serverTime || ltime;
        this._serverIntervalTime = ltime - stime;
    }

    /**
     * 获取网络时间,单位为秒带小数
     * @returns {number}
     */
    public getServerTime(): number {
        // let ltime = Math.floor(new Date().getTime() / 1000);
        let ltime = (new Date().getTime() / 1000);
        return ltime - this._serverIntervalTime;
    }

    /**
     * setServerTimeUrl
     */
    public setNetTimeUrl(url: string) {
        this._netTimeUrl = url;
    }

    /**
     * 同步服务器时间,单位为秒
     * @param serverTime
     */
    public setNetTime(serverTime: number) {
        let ltime = (new Date().getTime() / 1000);
        // let ltime = Math.floor(new Date().getTime() / 1000);
        let stime = serverTime || ltime;
        this._netIntervalTime = ltime - stime;
    }

    /**
     * 获取服务器时间,单位为秒带小数
     * @returns {number}
     */
    public getNetTime(): number {
        // let ltime = Math.floor(new Date().getTime() / 1000);
        let ltime = (new Date().getTime() / 1000);
        return ltime - this._netIntervalTime;
    }

    /**
     * registerCtrl
     */
    public registerCtrl(key, ctrl) {
        debug("registerCtrl", key)
        this._ctrls[key] = ctrl;
        debug("registerCtrl this._ctrls", this._ctrls)
    }

    /**
     * removeCtrl
     */
    public removeCtrl(key) {
        debug("removeCtrl", key)
        if (this._ctrls[key]) {
            this._ctrls[key].destroyInstance();
            delete this._ctrls[key];
        }
    }

    /**
     * clearCtrl
     */
    public clearCtrl(notKey: string = "") { //notKey 不移除ctrl的key
        for (const key in this._ctrls) {
            if (key == notKey) {
                continue;
            }
            this._ctrls[key].destroyInstance();
            debug("clearCtrl removeCtrl", key)
            delete this._ctrls[key];
        }
        debug("clearCtrl this._ctrls", this._ctrls)
    }

    public getGameModel() {
        return this._gameModel;
    }

    public getRuleModel() {
        return this._ruleModel;
    }

    public setIsInitOver(isInitOver: boolean) {
        this._isInitOver = isInitOver;
    }

    public getIsInitOver() {
        return this._isInitOver;
    }

    public getFoodInfo(id: number) {
        if (this._gameModel && this._gameModel.towerList) {
            for (let i = 0; i < this._gameModel.towerList.length; i++) {
                const element = this._gameModel.towerList[i];
                if (this._gameModel.towerList[i].animalId == id) {
                    return this._gameModel.towerList[i];
                }
            }
        }
        return null;
    }

    /**
     * updateServerTime
     */
    public async updateServerTime() {
        let td = await HttpManager.getInstance().httpHead(this._netTimeUrl + '?t=' + (new Date().getTime()), 'date');
        // log("updateServerTime", td, new Date(td).getTime())
        if (td) {
            this.setNetTime(new Date(td).getTime() / 1000);
        } else {
            this.setNetTime(new Date().getTime() / 1000);
        }
    }

    public async connectWS() {
        //链接socket  配置地址 端口
        // 获取当前页面的域名
        let hostname: string = window.location.hostname;
        // 定义并赋值 WsUrl
        let WsUrl: string = hostname;
        if (Config.WsUrl) {
            WsUrl = Config.WsUrl;
        }

        let defenseSign = SubGameUtil.getInstance().getDefenseSign(Config.WsRouter);
        NetManager.getInstance().setConnectIP(WsUrl);
        NetManager.getInstance().setConnectPort(Config.WsPort);
        NetManager.getInstance().setConnectRouter(Config.WsRouter);
        NetManager.getInstance().setIsWSS(Config.IsWSS);
        NetManager.getInstance().connect(defenseSign);
    }

    /**
     * reLogin
     */
    public reLogin() {
        // this.clearCtrl();
        let defenseSign = SubGameUtil.getInstance().getDefenseSign(Config.WsRouter);
        NetManager.getInstance().connect(defenseSign);

    }

    //网络相关
    public loginReq() {
        //ws 发送login信息
        let userInfo = UserManager.getInstance().getUserInfo();
        NetManager.getInstance().sendMessage(ProtocolEnum.LOGIN, { token: userInfo.token } as LoginReq);
    }

    public loginResp(md: LoginModel) {
        let userInfo = UserManager.getInstance().getUserInfo();
        userInfo.userId = md.userId;
        userInfo.userName = md.nickname;
        userInfo.userAvatar = md.avatar;
        GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_LOGIN);
    }

    public logoutResp(md: LogoutResp) {
        NetManager.getInstance().closeConnect();
        let mt = ["提示", "您已退出,\n是否重新登录?", "已在其他地方登录,\n是否重新登录?", "意外退出,\n是否重新登录?"][md.type] || "提示";
        WindowManager.getInstance().showSystemMsg(mt, () => {
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.NET_CLIENT_NO_CONNECT);
        }, () => {
            SubGameUtil.getInstance().hiddenFun();
        });
    }

    public notifyMsg(md: NotifyMsgIF) {
        if (md.type == "stat") {
            if (this._gameModel.screening != md.screening) {
                UserManager.getInstance().getUserInfo().userBetPrice = {};
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_BET_INFO);
            }
            this._gameModel.screening = md.screening;
            this._gameModel.screeningTime = new Date().getTime();
            this._gameModel.status = md.state;
            this._gameModel.statusStarted = md.statusStarted;
            this._gameModel.statusDuration = md.statusDuration;

            if (this._gameModel.status == GameState.SETTLE) {
                this._gameModel.bossProgression = md.bossProgression;
                this._gameModel.hasBoss = md.hasBoss;
                this._gameModel.appearanceAnimalId = md.appearanceAnimalId;
                this._gameModel.winnerList = md.winnerList || [];
                this._gameModel.winInfo = null;

                let userId = UserManager.getInstance().getUserInfo().userId;
                for (let i = 0; i < this._gameModel.winnerList.length; i++) {
                    if (this._gameModel.winnerList[i].userId == userId) {
                        this._gameModel.winInfo = this._gameModel.winnerList[i];
                        break;
                    }
                }
                this._gameModel.winInfo = this._gameModel.winnerList[0];
            }
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_STATE_INFO);
        }
        else if (md.type == "stake") {
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_BET_INFO);
        }

    }

    //------------------------

    //网络相关
    public async login() {
        let localToken = SubGameUtil.getInstance().getUrlToken();
        const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.login, { 'token': localToken });
        const { userId = 0, token = '' } = res?.data || {}
        let userInfo = UserManager.getInstance().getUserInfo();
        userInfo.userId = userId;
        userInfo.token = token;
    }

    public async getWallet() {
        const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.userLeaves);

        UserManager.getInstance().setWallet(res.data);

        // UserManager.getInstance().setWallet({});
    }

    public async buyLeaves(count: number) {
        try {
            const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.buyLeaves, { cnt: count });
            UserManager.getInstance().setWallet(res.data);

            // UserManager.getInstance().setWallet({});

        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
    }

    // 获取游戏信息
    public async getGameInfo() {
        const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.gameInfo);
        const data = res?.data || {};
        // let data = {
        //     "screening": "20251104234545",
        //     "status": 1,
        //     "statusStarted": 10,
        //     "statusDuration": 30,
        //     "hasBoss": 0,
        //     "appearanceAnimalId": 0,
        //     "bossProgression": 22.01,
        //     "towerList": [
        //         {
        //             "animalId": 1,
        //             "animalName": "机智松鼠",
        //             "foodName": "坚果"
        //         },
        //         {
        //             "animalId": 2,
        //             "animalName": "小赤狐",
        //             "foodName": "葡萄"
        //         },
        //         {
        //             "animalId": 3,
        //             "animalName": "霹雳虎",
        //             "foodName": "肉块"
        //         },
        //         {
        //             "animalId": 4,
        //             "animalName": "闪电兔",
        //             "foodName": "胡萝卜"
        //         },
        //         {
        //             "animalId": 5,
        //             "animalName": "大灰狼",
        //             "foodName": "羊腿"
        //         },
        //         {
        //             "animalId": 6,
        //             "animalName": "大熊猫",
        //             "foodName": "竹子"
        //         },
        //         {
        //             "animalId": 7,
        //             "animalName": "拳王袋鼠",
        //             "foodName": "蘑菇"
        //         },
        //         {
        //             "animalId": 8,
        //             "animalName": "憨憨熊",
        //             "foodName": "蜂蜜"
        //         }
        //     ]
        // }
        // log("getGameInfo", data)
        this._gameModel = data as GameInfoIF;
        this._gameModel.screeningTime = new Date().getTime();

        GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_INFO);
    }

    public async userStake(animalId: number, count: number) {
        let userInfo = UserManager.getInstance().getUserInfo();
        // if (!userInfo.remind) {
        //     // 首次下单提醒用户
        //     WindowManager.getInstance().showWindow(WinId.LayerTip, "handletips");
        //     return
        // }

        if (this._gameModel.status != GameState.INGAME) {
            //停止下单
            WindowManager.getInstance().showSystemTip("当前不能下单");
            return;
        }

        let isEnougth = true; // 是否充足
        /**
         * 
         * 当前下单卡券大于已有卡券
         * 当前累计下单卡券大于已有卡券
         * 兑换卡券
         */
        if (userInfo.userStakeLoading) {
            return;
        }

        if (count > userInfo.leaves) {
            // let gm = SubGameCtrl.getInstance().getGameModel();

            WindowManager.getInstance().showWindow(WinId.LayerShopTip, animalId);
            // WindowManager.getInstance().showSystemTip("灵石不足!");

            isEnougth = false
        }

        if (!isEnougth) { //不充足直接return
            return;
        }

        try {
            if (userInfo.userStakeLoading) {
                return;
            }
            userInfo.userStakeLoading = true;

            const resp = await SubGameUtil.getInstance().httpRequest(HttpConfig.feeding, {
                animalId: animalId,
                cnt: count,
            });

            const { data = {} } = resp || {}
            const { leaves = 0 } = data
            // log("userStake data",data)
            // console.debug('props.integral', props.integral);
            // if (error_code == 4030) {
            //     // 首次下单提醒用户
            //     WindowManager.getInstance().showWindow(WinId.LayerTip, "handletips");
            //     return
            // }

            let num = userInfo.userBetPrice[animalId] || 0;
            userInfo.userBetPrice[animalId] = num + count;

            UserManager.getInstance().setWallet(data);
            // this._gameModel.betsStatus = true;

            // GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_SELF_BET);
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_BET_INFO);
        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
        userInfo.userStakeLoading = false;
    }

    public async buyLeavesAndStake(animalId: number, count: number) {
        try {
            this.buyLeaves(count);
            this.userStake(animalId, count);

        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
    }

    public async gameRule() {
        try {
            const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.gameRule);
            // let res = {
            //     data: [
            //         {
                        
            //             "probability": "111%",
            //             "animalId": "1",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "111%",
            //             "animalId": "2",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "112%",
            //             "animalId": "2",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "113%",
            //             "animalId": "3",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "114%",
            //             "animalId": "4",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "115%",
            //             "animalId": "5",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "116%",
            //             "animalId": "6",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "probability": "117%",
            //             "animalId": "7",
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         }
            //     ]
            // }
            this._ruleModel = res.data;
            // this._ruleModel = JSON.parse(res.data);
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_RULE);
        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
    }

    public async gameRecord(page: number, limit: number = 100) {
        try {
            const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.gameRecord, { page: page, limit: limit });

            // let res = {
            //     data: [
            //         {
            //             "screening": "20251104235645",
            //             "animalId": 1,
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         },
            //         {
            //             "screening": "20251104235645",
            //             "animalId": 1,
            //             "animalName": "机智松鼠",
            //             "foodName": "坚果"
            //         }
            //     ]
            // }
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_UPDATE_RECORD, res.data);
        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
    }

    public async contRecord(page: number, limit: number = 100) {
        try {
            const res = await SubGameUtil.getInstance().httpRequest(HttpConfig.contRecord, { page: page, limit: limit });
            // let res = {
            //     data: [
            //         {
            //             "screening": "20251104235645",
            //             "costCnt": 1,
            //             "recordDetail": [
            //                 {
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 },
            //                 {
            //                     "screening": "20251104235645",
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 }
            //             ]
            //         },
            //         {
            //             "screening": "20251104235645",
            //             "costCnt": 1,
            //             "recordDetail": [
            //                 {
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 },
            //                 {
            //                     "screening": "20251104235645",
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 }
            //             ]
            //         },
            //         {
            //             "screening": "20251104235645",
            //             "costCnt": 1,
            //             "recordDetail": [
            //                 {
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 },
            //                 {
            //                     "screening": "20251104235645",
            //                     "animalId": 1,
            //                     "animalName": "机智松鼠",
            //                     "foodName": "坚果",
            //                     "cnt": 2
            //                 }
            //             ]
            //         }
            //     ]
            // }

            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_SELF_RECORD, res.data);

        } catch (error) {
            // WindowManager.getInstance().showSystemTip(error);
        }
    }

}
