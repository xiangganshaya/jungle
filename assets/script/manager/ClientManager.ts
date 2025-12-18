import { assetManager, debug, log, native, sys } from "cc";
import { JSB } from "cc/env";
import ConfigManager from "./ConfigManager";
import GameEventManager from "./GameEventManager";
import { GameEvent } from "../config/GameEventConfig";
import WindowManager from "./WindowManager";
import ObjectManager from "./ObjectManager";
import SpriteManager from "./SpriteManager";
import SpineManager from "./SpineManager";
import ParticleManager from "./ParticleManager";
import AudioManager from "./AudioManager";
import FontManager from "./FontManager";
import GameTools from "../utils/GameTools";
import { LocalStorageKey } from "../config/Config";
import ChannelConfig from "../config/ChannelConfig";
import { GameType } from "../config/GameType";


export default class ClientManager {
    private static _instance: ClientManager = null;

    private _curGameType: GameType = GameType.Null;
    private _preGameType: GameType = GameType.Null;

    private _loadNextGameType: GameType = GameType.Null;
    private _nextTypeGameData: any = null;

    private _checkKey: any = {};

    private _defaultLanguage: string = "";

    //-----------

    public static getInstance() {
        if (!this._instance) {
            this._instance = new ClientManager();
        }
        return this._instance;
    }

    public setDefaultLanguage(language: string, isLocal: boolean = false) {
        this._defaultLanguage = language;
        if (isLocal) {
            GameTools.getInstance().setLocalStorageItem(LocalStorageKey.LanguageCode, language);
        }
    }

    public getDefaultLanguage() {
        if (!ChannelConfig.IS_MORE_LANGUAGE) {
            return ChannelConfig.LANGUAGE
        }
        let languageCode = GameTools.getInstance().getLocalStorageItem(LocalStorageKey.LanguageCode);
        if (!languageCode) {
            languageCode = this._defaultLanguage;
        }
        if (!languageCode) {
            languageCode = ChannelConfig.LANGUAGE;
        }

        return languageCode;
    }

    public async modifyDefaultLanguage(language: string, cb: Function, isLocal: boolean = false) {
        if (!ChannelConfig.IS_MORE_LANGUAGE) {
            return
        }
        let oldLanguage = this.getDefaultLanguage();
        let oldBundle = assetManager.getBundle(oldLanguage);
        if (oldBundle) {
            this.cleanAllGameType();
            oldBundle.releaseAll();
            assetManager.removeBundle(oldBundle);
        }

        this.setDefaultLanguage(language, isLocal);

        if (JSB) {
            native.fileUtils.purgeCachedEntries();
        }

        await ConfigManager.getInstance().initGameDataConfig();

        //web版本需要用到
        if (!(<any>globalThis).REMOTE_URL) {
            (<any>globalThis).REMOTE_URL = '';
        }

        assetManager.loadBundle(REMOTE_URL + language, (err, bundle) => {
            if (cb) {
                cb(err, bundle);
            }
        });
    }

    /**
     * getLocalNowTime
     */
    public getLocalNowTime() {
        return new Date().getTime() / 1000;
    }

    /**
     * preLoadGameRes 加载新的游戏
     */
    public preLoadGameRes(type: GameType, data: any = null) {
        // log('ClientManager:preLoadGameRes 希望加载的游戏 gameType =%c' + type, "color:#f0000f");
        if (type == GameType.Null) {
            return;
        }

        this._loadNextGameType = type;
        this._nextTypeGameData = data;

        GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_PRELOAD, type);
    }

    cleanByGameType(type) {
        WindowManager.getInstance().clearSuperiorObject(type);
        ObjectManager.getInstance().clearSuperiorObject(type);
        SpriteManager.getInstance().clearSuperiorObject(type);
        SpineManager.getInstance().clearSuperiorObject(type);
        ParticleManager.getInstance().clearSuperiorObject(type);
        AudioManager.getInstance().clearSuperiorObject(type);
        FontManager.getInstance().clearSuperiorObject(type);
    }

    cleanAllGameType() {
        WindowManager.getInstance().clearAllSuperiorObject();
        ObjectManager.getInstance().clearAllSuperiorObject();
        SpriteManager.getInstance().clearAllSuperiorObject();
        SpineManager.getInstance().clearAllSuperiorObject();
        ParticleManager.getInstance().clearAllSuperiorObject();
        AudioManager.getInstance().clearAllSuperiorObject();
        FontManager.getInstance().clearAllSuperiorObject();
    }

    /**
     * replaceGameType
     */
    public replaceGameType(type: GameType) {
        if (type == GameType.Null) {
            return;
        }
        if (type == this._curGameType) {
            return;
        }

        this._preGameType = this._curGameType;
        this._curGameType = type;
    }

    /**
     * getCurGameType
     */
    public getCurGameType() {
        return this._curGameType;
    }
    /**
     * getPreGameType
     */
    public getPreGameType() {
        return this._preGameType;
    }

    /**
     * getLoadNextGameType
     */
    public getLoadNextGameType() {
        return this._loadNextGameType;
    }

    /**
     * getNextTypeGameData
     */
    public getNextTypeGameData() {
        let data = this._nextTypeGameData;
        this._nextTypeGameData = null;
        return data;
    }

    getGamePlatformCode() {
        let platform = 2;
        if (sys.os == sys.OS.IOS) {
            platform = 1;
        }
        else if (sys.os == sys.OS.ANDROID) {
            platform = 0;
        }
        else if (sys.isBrowser) {
            if (sys.isMobile) {
                platform = 3;
            }
            else {
                platform = 2;
            }
        }

        return platform;
    }

    /**
     * getPlatformStr
     */
    public getPlatformStr() {
        let platform = "android";
        // if (sys.os == sys.OS.ANDROID || sys.os == sys.OS.WINDOWS) {
        //     platform = "android";
        // }
        // else if (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX) {
        //     platform = "ios";
        // }
        // else if (sys.isBrowser) {
        //     platform = "browser";
        // }
        // else {
        //     platform = "unknow";
        // }
        if (JSB) {
            if (sys.os == sys.OS.ANDROID || sys.os == sys.OS.WINDOWS) {
                platform = "android";
            }
            else if (sys.os == sys.OS.IOS || sys.os == sys.OS.OSX) {
                platform = "ios";
            }
        }
        else {
            platform = "browser";
        }
        return platform;
    }


    /**
     * setCheckKey
     */
    public setCheckKey(key: string, value: boolean) {
        this._checkKey[key] = value;
    }

    /**
     * getCheckKey
     */
    public getCheckKey(key: string) {
        return this._checkKey[key] || false;
    }

}

