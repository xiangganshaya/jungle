import { GameType, SuperiorEnum } from "./GameType"
import { WinId } from "./WindowConfig"

export class Config {
    static HttpBaseURL = "https://game.amordev.top/"  //test
    // static HttpBaseURL = "https://skk-game.hntuoweixing.cn/"
    // static HttpBaseURL = "/"
    static HttpTimeOut = 12000
    static WsUrl = "game.amordev.top"//test
    // static WsUrl = "skk-ws.hntuoweixing.cn"//release
    // static WsUrl = ""//release
    static WsPort = ""
    static IsDefenseSign = 2 //是否鉴权 0:不鉴权 1:全鉴权，2:只鉴权http
    static IsWSS = 1  //是否使用wss 0:不使用 1:使用
    static WsRouter = "game"
}

export enum LayerZindex {
    Normal = 10,
    Window = 100,
    Tip = 500,
    MessageBox = 1000,
    TipMessage = 1500,
    MaxTop = 2000,
}

export enum LocalStorageKey {
    BgmVolume = "BgmVolume",
    EffectVolume = "EffectVolume",
    MusicOpenState = "MusicOpenState",
    EffectOpenState = "EffectOpenState",
    LanguageCode = "LanguageCode",
}

export enum PreloadConfigType {
    Window = "Window",
    Prefab = "Prefab",
    SpriteAtlas = "SpriteAtlas",
    SpriteFrame = "SpriteFrame",
    SkeletonData = "SkeletonData",
    Particle = "Particle",
    AudioClip = "AudioClip",
}

export class PreloadConfigTypeSort {
    public static info = {
        [PreloadConfigType.Window]: 0,
        [PreloadConfigType.Prefab]: 1,
        [PreloadConfigType.SpriteAtlas]: 2,
        [PreloadConfigType.SpriteFrame]: 3,
        [PreloadConfigType.SkeletonData]: 4,
        [PreloadConfigType.Particle]: 5,
        [PreloadConfigType.AudioClip]: 6,
    }
}

//新场景 需要的资源 提前加载
export class PreloadConfig {
    public static info = {
        SysRes: [
            { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.SysLoading },
            { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.SysTipView },
            { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.SysMsgBox },
            // { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.SystemHorn },
            // { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.AlertNetErrorView },
            // { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.AlertUpdateView },
            // { type: PreloadConfigType.Window, superior: SuperiorEnum.gameSystem, winId: WinId.AlertCheckView },

        ],
        Splash: [
            // { type: PreloadConfigType.Window, winId: WinId.LayerSplash },
        ],

        Update: [
            // { type: PreloadConfigType.Window, winId: WinId.LayerUpdate },
        ],

        Login: [
            // { type: PreloadConfigType.Window, winId: WinId.LayerLogin },
        ],

        Relogin: [
            // { type: PreloadConfigType.Window, winId: WinId.LayerLogin },
        ],

        Main: [
            { type: PreloadConfigType.Window, winId: WinId.LayerMain },

            { type: PreloadConfigType.Window, winId: WinId.LayerWin },
            { type: PreloadConfigType.Window, winId: WinId.LayerBuyRecord },
            { type: PreloadConfigType.Window, winId: WinId.LayerRecord },
            { type: PreloadConfigType.Window, winId: WinId.LayerShop },
            { type: PreloadConfigType.Window, winId: WinId.LayerShopTip },
            { type: PreloadConfigType.Window, winId: WinId.LayerRule },
            { type: PreloadConfigType.Window, winId: WinId.LayerTip },

            // // { type: PreloadConfigType.Window, winId: WinId.LayerShopConfirm },
            // // { type: PreloadConfigType.Window, winId: WinId.LayerShopExchange },

            { type: PreloadConfigType.SkeletonData, path: "spine/huangyidantong/huangyidantong" },
            { type: PreloadConfigType.SkeletonData, path: "spine/lanyidantong/lanyidantong" },
            { type: PreloadConfigType.SkeletonData, path: "spine/baiyidantong/baiyidantong" },
            { type: PreloadConfigType.SkeletonData, path: "spine/neimendizi/neimendizi" },
            { type: PreloadConfigType.SkeletonData, path: "spine/qinchuandizi/qinchuandizi" },
            { type: PreloadConfigType.SkeletonData, path: "spine/zongmenzhanglao/zongmenzhanglao" },
            { type: PreloadConfigType.SkeletonData, path: "spine/zongmenzhangjiao/zongmenzhangjiao" },
            { type: PreloadConfigType.SkeletonData, path: "spine/taishangzhanglao/taishangzhanglao" },
        ],
    }

}

//新场景 需要的资源 提前加载 补充配置，充值版本等使用
export class PreloadExConfig {
    public static info = {
        Splash: [

        ],

        Main: [

        ],
    }

}

//新场景 需要的资源 异步加载
export class PreloadAsyncConfig {
    public static info = {
        Splash: [

        ],

        Login: [

        ],

        Relogin: [

        ],

        Main: [

        ],
    }
}
