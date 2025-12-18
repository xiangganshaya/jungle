import { Canvas, TextAsset, _decorator, debug, log, native, resources, screen, sys, view, warn } from 'cc';
import { JSB } from 'cc/env';


export class DesignResoulutionInfo {
    uiDesignWidth: number = 750;
    uiDesignHeight: number = 1334;
    uiWidth: number = 750;
    uiHeight: number = 1334;
    uiScale: number = 1;
    uiMaxScale: number = 1;
    uiScaleX: number = 1;
    uiScaleY: number = 1;
}

export default class ConfigManager {
    private static _instance: ConfigManager = null;
    private _designResoulutionInfo: DesignResoulutionInfo = null;

    //--------------
    public static getInstance() {
        if (!this._instance) {
            this._instance = new ConfigManager();
        }
        return this._instance;
    }
    /**
     * initLogInfo
     */
    public initLogInfo() {
        // if (GAME_DEV && GAME_LOG) {
        //     log = debug;
        // } else {
        //     log = () => {
        //         //设置成空，无log
        //     };

        //     debug = () => {
        //         //设置成空，无log
        //     };
        // }
    }
    /**
     * initDesignResolution
     */
    public initDesignResolution() {
        // 初始化设计分辨率信息
        this._designResoulutionInfo = new DesignResoulutionInfo();
        // 获取屏幕窗口大小
        let cs = screen.windowSize;
        // 获取设计分辨率大小
        let dr = view.getDesignResolutionSize();

        // 设置设计分辨率宽高
        this._designResoulutionInfo.uiDesignWidth = dr.width;
        this._designResoulutionInfo.uiDesignHeight = dr.height;
        // 设置实际分辨率宽高
        this._designResoulutionInfo.uiWidth = dr.width;
        this._designResoulutionInfo.uiHeight = dr.height;
        // 设置缩放值
        this._designResoulutionInfo.uiScaleX = 1;
        this._designResoulutionInfo.uiScaleY = 1;

        // 1. 先找到 SHOW_ALL 模式适配之后，本节点的实际宽高以及初始缩放值
        // 计算SHOW_ALL模式下的缩放值
        let srcScaleForShowAll = Math.min(cs.width / dr.width, cs.height / dr.height);
        // 计算实际宽高
        let realWidth = dr.width * srcScaleForShowAll;
        let realHeight = dr.height * srcScaleForShowAll;
        // 2. 基于第一步的数据，再做节点宽高适配
        // 计算宽高缩放值
        let ws = (cs.width / realWidth);
        let hs = (cs.height / realHeight);
        // 设置实际分辨率宽高
        this._designResoulutionInfo.uiWidth = dr.width * ws;
        this._designResoulutionInfo.uiHeight = dr.height * hs;
        // 设置缩放值
        this._designResoulutionInfo.uiScaleX = ws;
        this._designResoulutionInfo.uiScaleY = hs;
        // 设置最小缩放值
        this._designResoulutionInfo.uiScale = Math.min(ws, hs);
        // 设置最大缩放值
        this._designResoulutionInfo.uiMaxScale = Math.max(ws, hs);

        // 如果是开发模式，打印设计分辨率信息
        if (GAME_DEV) {
            log("initDesignResolution", JSON.stringify(this._designResoulutionInfo));
        }
    }
    /**
     * getDesignResoulutionInfo
     */
    public getDesignResoulutionInfo() {
        return this._designResoulutionInfo;
    }
    /**
     * getHotUpdatePath
     */
    public getHotUpdatePath() {
        return native.fileUtils.getWritablePath() + 'hotUpdate/';
    }
    /**
     * getHotUpdateAssetsPath
     */
    public getHotUpdateAssetsPath() {
        return this.getHotUpdatePath() + 'assets/';
    }
    /**
     * getHotUpdateResPath
     */
    public getHotUpdateResPath() {
        return this.getHotUpdatePath() + 'res/';
    }
    /**
     * setGlobalConfig
     */
    public setGlobalConfig(config) {
        
    }
    /**
     * setGlobalChannelConfig
     */
    public setGlobalChannelConfig(channelConfig) {
        
    }
    /**
     * setGlobalUrlConfig
     */
    public setGlobalUrlConfig(config) {
        
    }
    /**
     * getRandVersionUrl
     */
    public getRandVersionUrl() {
        
    }
    /**
     * setGlobalAuthUrl
     */
    public setGlobalAuthUrl(url: string) {
        
    }
    /**
     * randLocalAuthurls
     */
    public randLocalAuthurls() {
        
    }
    /**
     * getRandAuthUrl
     */
    public getRandAuthUrl(): string {
        return "";
    }
    /**
     * updateAuthUrlErrorCount
     */
    public updateAuthUrlErrorCount(url: string) {
        
    }
    /**
     * initGlobalConfig
     */
    public initGlobalConfig() {
        
    }
    /**
     * initGlobalChannelConfig
     */
    public initGlobalChannelConfig() {
        
    }
    /**
     * initGlobalAuthUrls
     */
    public initGlobalAuthUrls() {
       
    }
    /**
     * saveAuthUrls
     */
    public saveAuthUrls(authUrls: string) {
        
    }
    /**
     * saveGlobalInfo
     */
    public saveGlobalInfo(infob64: string) {
        return false;
    }
    /**
     * saveGlobalData
     */
    public saveGlobalData(data) {
        return false;
    }
    /**
     * saveGameDataConfigData
     */
    public saveGameDataConfigData(configName: string, configVersion: string, data: string) {
        return true;
    }
    /**
     * initGameServerConfig
     */
    public initGameServerConfig(config) {
        
    }
    public async loadConfigData(path: string): Promise<TextAsset> {
        return new Promise<TextAsset>((resolve, reject) => {
            resolve(null);
        });
    }

    public async initDefaultFont() {
        
    }

    private _initLanguages() {
        
    }

    private _initLanguageEnum() {
        
    }

    /**
     * initGameDataConfig
     */
    public async initGameDataConfig(jsonData: any = null) {
        
    }

    public resetTranslationConfigData() {
        
    }

    /**
     * 测试配置，策划调试方便，正式打包不走这里
     * _initDevJson
     */
    private _initDevJson(configName) {
        
        return null
    }
    /**
     * 测试配置，策划调试方便，正式打包不走这里
     * initDevJsonGameDataConfig
     */
    public initDevJsonGameDataConfig() {
        if (!JSB && GAME_DEV) {
            return
        }
    }
    /**
     * getPlatformStr
     */
    public getPlatformStr() {
        let platform = "android";
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
}
