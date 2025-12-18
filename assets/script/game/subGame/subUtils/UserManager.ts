import { _decorator } from 'cc';
import { HttpConfig, HttpStatus } from "../../../config/HttpConfig"
import SubGameUtil from './SubGameUtil';
import GameEventManager from '../../../manager/GameEventManager';
import { GameEvent } from '../../../config/GameEventConfig';

export class UserModel {
    userFlg: string = ""
    token: string = ""
    userId: string = ""
    userName: string = ""
    userAvatar: string = ""
    diamond: number = 0; // 钻石
    leaves: number = 0; // 叶子
    userBetPrice: { [key: number]: number } = {} // 用户下注金额
    userLastBetPrice: { [key: number]: number } = {} // 用户上一次下注金额
    userStakeLoading: boolean = false; // 用户下注中
}

export default class UserManager {
    private static _instance: UserManager = null;

    private _userInfo: UserModel = null;

    /**
    * getInstance
    */
    public static getInstance() {
        if (!this._instance) {
            this._instance = new UserManager();
        }
        return this._instance;
    }

    setUserInfo(userInfo: UserModel) {
        this._userInfo = userInfo;
    }

    getUserInfo() {
        if (!this._userInfo) {
            this._userInfo = new UserModel();
        }
        return this._userInfo;
    }

    public setWallet(query: any = {}) {
        const { leaves = -1, diamond = -1 } = query;

        // if (diamond_balance > -1) {
        //     this.getUserInfo().diamond = diamond_balance;
        // }
        if (leaves > -1) {
            this.getUserInfo().leaves = leaves;
        }
        if (diamond > -1) {
            this.getUserInfo().diamond = diamond;
        }

        GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_UPDATE_WALLET);

    }
}
