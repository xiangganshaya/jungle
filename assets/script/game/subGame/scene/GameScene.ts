// // Learn TypeScript:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// // Learn Attribute:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// // Learn life-cycle callbacks:
// //  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Label, debug, macro, Node, screen, sys, tween, Tween, view, warn, ResolutionPolicy, log, game, Game, Camera, Color, RenderTexture, UITransform, ImageAsset, Vec3, Texture2D, SpriteFrame, Sprite, Size, assetManager, BufferAsset } from 'cc';
import GameBaseScene from '../../base/GameBaseScene';
import { GameEvent } from '../../../config/GameEventConfig';
import ConfigManager from '../../../manager/ConfigManager';
import WindowManager from '../../../manager/WindowManager';
import { WinId } from '../../../config/WindowConfig';
import { GameType, GameTypeWinId, SuperiorEnum } from '../../../config/GameType';
import UserManager from '../subUtils/UserManager';
import SubGameCtrl from '../subCtrls/SubGameCtrl';
import SubGameUtil from '../subUtils/SubGameUtil';
import DeviceManager from '../../../manager/DeviceManager';
import GameTools from '../../../utils/GameTools';
import { JSB } from 'cc/env';
import { PreloadAsyncConfig, PreloadConfig, PreloadConfigType } from '../../../config/Config';
import ClientManager from '../../../manager/ClientManager';
import ObjectManager from '../../../manager/ObjectManager';
import SpriteManager from '../../../manager/SpriteManager';
import AudioManager from '../../../manager/AudioManager';
import SpineManager from '../../../manager/SpineManager';
import ParticleManager from '../../../manager/ParticleManager';
import GameEventManager from '../../../manager/GameEventManager';
import NodePoolManager from '../../../manager/NodePoolManager';
import NetManager from '../net/NetManager';
import NetEventManager from '../net/NetEventManager';
import { NetEventName } from '../net/netEvent/NetEventConfig';
import NetGameEvent from '../net/netEvent/NetGameEvent';
import { ProtocolEnum } from '../net/netMessage/MessageModes';

enum SceneState {
    Null = "Null",
    PreLoad = "PreLoad",
    StartLoad = "StartLoad",
    Loading = "Loading",
    LoadEnd = "LoadEnd",
    LoadEndToMain = "LoadEndToMain", //进入主界面时，等待获取玩家信息状态
    LoadError = "LoadError",
    CleanRes = "CleanRes",
    CleanResEnd = "CleanResEnd",
    LoadSameTypeEnd = "LoadSameTypeEnd",
    GarbageCollect = "GarbageCollect",
    LoadAsync = "LoadAsync",
    LoadingAsync = "LoadingAsync",
    LoadEndAsync = "LoadEndAsync",
    Running = "Running",
}

let StepPreloadMax = 1;

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export default class GameScene extends GameBaseScene {
    @property(Node)
    root: Node = null; //根节点
    @property(Node)
    bg: Node = null; //背景节点
    @property(Node)
    loadNode: Node = null; //loading节点
    @property(Label)
    loadLabel: Label = null; //loading文本 - ‘加载中‘
    // @property(Camera)
    // imageCamera: Camera = null;
    // @property(Sprite)
    // gameLoadBG: Sprite = null;
    @property(Node)
    hideNode: Node = null; //隐藏节点

    @property(ImageAsset)
    raw: ImageAsset = null;

    // LIFE-CYCLE CALLBACKS:
    private _sceneState: SceneState = SceneState.Null;  //场景状态  枚举类型

    // 定义一个私有变量，用于存储预加载的资源列表
    private _preloadResList: any[] = [];
    // 定义一个私有变量_preLoadResMap，它是一个对象，键为字符串类型，值为布尔类型
    private _preLoadResMap: { [key: string]: boolean } = {};
    // 预加载计数
    private _preloadCount: number = 0;
    // 预加载步骤计数
    private _preloadStepCount: number = 0;
    // 预加载最大计数
    private _preloadMaxCount: number = 0;
    // 定义一个私有变量，用于存储下一个游戏类型
    private _nextGameType: GameType = GameType.Null;

    // 定义一个私有变量，用于存储异步加载的资源列表
    private _asyncResList: any[] = [];
    // private _loadAnsycMap: { [key: string]: boolean } = {};
    // 异步加载计数
    private _preloadStepAnsycCount: number = 0;
    // 异步加载最大计数
    private _loadAnsycCount: number = 0;

    private _loadAnsycMaxCount: number = 0;

    private _nextLoadCount: number = 1;
    private _nextLoadMaxCount: number = 1;
    private _nextLoading: boolean = false;
    private _nextLoadError: boolean = false;

    private _isUserLoad: boolean = false;
    private _isRelogin: boolean = false;
    private _loginRespMap: { [key: string]: number } = {};

    private _isInitK: boolean = false;

    //-----------

    onLoad() {
        super.onLoad();

        // if (!JSB) {
        //     let e = document.getElementById("gamelogo");
        //     if (e) { e.hidden = true; }
        // }

        game.frameRate = 30;//游戏设置的帧率

        game.on(Game.EVENT_SHOW, this._relogin, this); //监听重后台回来

        view.resizeWithBrowserSize(false); //设置是否自适应 游戏窗口大小，仅仅在web模式上面生效

        SubGameCtrl.getInstance().setNetTimeUrl(window.location.href.split('?')[0]);
        SubGameCtrl.getInstance().updateServerTime();

        // 监听原生更新金额方法
        const htmlUpdateAmountFun = () => {
            SubGameCtrl.getInstance().getWallet();
        };
        //挂载原生方法
        // 将htmlUpdateAmountFun函数赋值给window对象的htmlUpdateAmountFun属性
        (<any>window).htmlUpdateAmountFun = htmlUpdateAmountFun;

        //初始化分辨率设置
        ConfigManager.getInstance().initDesignResolution();

        // ConfigManager.getInstance().initLogInfo();//方法内的代码注解了 暂时无用

        macro.ENABLE_WEBGL_ANTIALIAS = true;//开启抗锯齿

        //log输出，正式发布版本，要注释掉
        // debug._resetDebugSetting(debug.DebugMode.INFO);

        //初始化设备管理器
        DeviceManager.getInstance();
        //初始化工具类（时间转换、去重、数据转换类型等工具）
        GameTools.getInstance().initES6Promise();

        //获取视图窗口的可见大小
        const visibleSize = view.getVisibleSize();
        //获取视图的分辨率
        const designSize = view.getDesignResolutionSize();
        if (visibleSize.height / visibleSize.width >= designSize.height / designSize.width) { // 长屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_WIDTH);
        } else { // 宽屏
            view.setDesignResolutionSize(designSize.width, designSize.height, ResolutionPolicy.FIXED_HEIGHT);
        }

        // GameUtils.getInstance().setNodeCenter(this.bgSprite.node);
        // GameUtils.getInstance().setBgNodeScale(this.bgNode);

        //打印一些系统信息
        debug(
            "-->sys.isBrowser " + sys.isBrowser  //是否是浏览器环境
            + "\n-->sys.browserType  " + sys.browserType  //浏览器类型(chrome/Firefox/IE/Opera/Safari/Unknown)
            + "\n -->sys.browserVersion " + sys.browserVersion //浏览器版本号
            + "\n -->sys.isMobile " + sys.isMobile  //当前是否是移动设备
            + "\n -->JSB " + JSB //通常表示是否在 Cocos2d-JS 或类似框架中运行，是一个布尔值
            + "\n -->sys.os " + sys.os //当前操作系统类型(Windows/Linux/Mac/Android/iOS/Unknown)
            + "\n -->sys.platform " + sys.platform //表示当前平台，例如 "web"、"win32"、"android"、"ios" 等。 
            + "\n -->sys.language " + sys.language  //当前操作系统的语言(en/zh/...)
            + "\n -->sys.languageCode " + sys.languageCode  //表示当前系统的语言代码，例如 "en-US"、"zh-CN" 等。
            + "\n -->sys.osMainVersion " + sys.osMainVersion //当前操作系统的主版本号
            + "\n -->sys.osVersion " + sys.osVersion  //当前操作系统的完整版本号
            + "\n -->winSize.width " + screen.windowSize.width //当前窗口的宽度(以逻辑像素为单位)
            + "\n -->winSize.height " + screen.windowSize.height //当前窗口的高度(以逻辑像素为单位)
            + "\n -->view.getVisibleSize().width " + view.getVisibleSize().width //当前视图的可见宽度(以逻辑像素为单位)
            + "\n -->view.getVisibleSize().height " + view.getVisibleSize().height //当前视图的可见高度(以逻辑像素为单位)
            + "\n -->sys.windowPixelResolution.width " + view.getVisibleSizeInPixel().width //当前窗口的像素分辨率宽度
            + "\n -->sys.windowPixelResolution.height " + view.getVisibleSizeInPixel().height //当前窗口的像素分辨率高度
        );


        // 获取设计分辨率信息
        let dc = ConfigManager.getInstance().getDesignResoulutionInfo();
        // 设置背景节点缩放比例
        this.bg.setScale(dc.uiMaxScale, dc.uiMaxScale, 1);
        // 设置隐藏节点缩放比例
        this.hideNode.setScale(1, dc.uiMaxScale, 1);

        this.loadNode.active = false;
        // this.gameLoadBG.node.active = false;

        // 获取NetEventManager实例  注册网络事件，事件名为NetEventName.NetGameEvent，事件对象为NetGameEvent
        NetEventManager.getInstance().registerNetEvent(NetEventName.NetGameEvent, new NetGameEvent());

        let timeStamp = new Date().getTime() + ''
        assetManager.loadRemote(this.raw.nativeUrl + '?' + timeStamp, { ext: '.bin' }, (err, buf: BufferAsset) => {
            if (!err) {
                let b = buf['_buffer'];
                let b64 = GameTools.getInstance().base64EncryptBinary(b);
                SubGameUtil.getInstance().setRawBalue(b64);
            }

            this._isInitK = true;
        });

        this._loadGame();

        //到此初始化部分的逻辑结束
    }

    start() {
        super.start();

        // WindowManager.getInstance().showSysLoading(true);

        // this._showLogo(); //显示启动页（包含logo、加载中的Label）
        this._showGame(); //显示游戏内容

        // this._initNetInfo();//进行

        this.schedule(this._timeInitNetInfo, 0.05);
    }

    onDestroy(): void {
        game.off(Game.EVENT_SHOW, this._relogin, this); //移除监听重后台回来

        NetEventManager.getInstance().unregisterNetEvent(NetEventName.NetGameEvent);

        this._stopMainHeartMsg();

        (<any>window).htmlUpdateAmountFun = null;
    }

    private _timeInitNetInfo(dt) {
        if (this._isInitK) {
            this.unschedule(this._timeInitNetInfo);
            this._initNetInfo();//进行
        }
    }

    // private _capture() {

    //     let rt = new RenderTexture();
    //     rt.reset({
    //         width: view.getVisibleSize().width,
    //         height: view.getVisibleSize().height,
    //     });

    //     this.imageCamera.targetTexture = rt;

    //     let width = this.node.getComponent(UITransform).width;
    //     let height = this.node.getComponent(UITransform).height;
    //     let worldPos = this.node.getWorldPosition();
    //     let buff = this._copyRenderTex(rt, worldPos, width, height);

    //     this._showImage(this.gameLoadBG, buff, width, height);

    // }

    // private _copyRenderTex(rt: RenderTexture, worldPos: Vec3, width: number, height: number) {
    //     let buffer = rt.readPixels(Math.round(worldPos.x), Math.round(worldPos.y), width, height);
    //     return buffer;
    // }

    // private _showImage(image: Sprite, buffer: Uint8Array, width: number, height: number) {
    //     let img = new ImageAsset();
    //     img.reset({
    //         _data: buffer,
    //         width: width,
    //         height: height,
    //         format: Texture2D.PixelFormat.RGBA8888,
    //         _compressed: false
    //     });
    //     let texture = new Texture2D();
    //     texture.image = img;
    //     let sf = new SpriteFrame();
    //     sf.texture = texture;
    //     sf.packable = false;
    //     image.spriteFrame = sf;
    //     image.spriteFrame.flipUVY = true;
    //     if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
    //         image.spriteFrame.flipUVY = false;
    //     }
    //     image.node.getComponent(UITransform)?.setContentSize(new Size(width, height));
    // }

    private _resetLoginRespMap() {
        this._loginRespMap = {};
        this._loginRespMap["getWallet"] = 0;
        this._loginRespMap["getGameInfo"] = 0;
        this._loginRespMap["gameRule"] = 0;
        this._loginRespMap["wsLogin"] = 0;

        this._loginRespMap["index"] = 0;
        this._loginRespMap["count"] = 4;
    }

    // private _showReloginLoading() {
    //     WindowManager.getInstance().showSysLoading(true);
    // }

    private async _relogin() {
        if (this._isRelogin) {
            return;
        }

        this._isUserLoad = true;
        this._isRelogin = true;

        // this.scheduleOnce(this._showReloginLoading, 0.5);
        WindowManager.getInstance().showSysLoading(true);

        // this._capture();
        // this.gameLoadBG.node.active = true;

        NetManager.getInstance().closeConnect();
        // this._initNetInfo();

        this._resetLoginRespMap();

        SubGameCtrl.getInstance().setIsInitOver(false);

        this._getLoginNetInfo();
    }

    private _getLoginNetInfo() {
        this.getWallet();
        this.getGameInfo();
        this.gameRule();
        this._initRunGameInfo(); //链接socket
    }

    private async getWallet() {
        try {
            await SubGameCtrl.getInstance().getWallet();

            this._updateLoginRespMap("getWallet", 1);

        } catch (error) {
            WindowManager.getInstance().showSystemTip('请求错误 21');
            this._updateLoginRespMap("getWallet", -1);
        }
    }

    private async getGameInfo() {
        try {
            await SubGameCtrl.getInstance().getGameInfo();

            this._updateLoginRespMap("getGameInfo", 1);

        } catch (error) {
            WindowManager.getInstance().showSystemTip('请求错误 22');
            this._updateLoginRespMap("getGameInfo", -1);
        }
    }

    private async gameRule() {
        try {
            await SubGameCtrl.getInstance().gameRule();

            this._updateLoginRespMap("gameRule", 1);

        } catch (error) {
            WindowManager.getInstance().showSystemTip('请求错误 23');
            this._updateLoginRespMap("gameRule", -1);
        }
    }

    private async wsLogin() {
        this._updateLoginRespMap("wsLogin", 1);
    }

    private _updateLoginRespMap(key: string, v: number) {
        this._loginRespMap[key] = v;
        this._loginRespMap["index"]++;
        if (this._loginRespMap["index"] >= this._loginRespMap["count"]) {
            let isOK = true;
            for (const key in this._loginRespMap) {
                const v = this._loginRespMap[key];
                if (v < 0) {
                    isOK = false;
                }
            }

            if (isOK) {
                this._initInfo();
            }
            else {
                this.unschedule(this._updateLoadInof);

                this.loadLabel.string = "请求参数错误2";
                // this.scheduleOnce(() => {
                //     SubGameUtil.getInstance().hiddenFun();
                // }, 2);
                this.scheduleOnce(() => {
                    WindowManager.getInstance().closeFinalSysLoading();
                    WindowManager.getInstance().showSystemMsg("网络加载出现错误,\n请重试一次~", () => {
                        this._relogin();
                    }, () => {
                        this.onClickHideGame();
                    });
                }, 1);
            }

            this._resetLoginRespMap();
        }
    }

    private async _initNetInfo() {
        try {
            this._isUserLoad = true;
            this._isRelogin = false;

            this._resetLoginRespMap(); //登录前重置一些

            await SubGameCtrl.getInstance().login();  //用户登录接口 - 获取用户信息

            this._getLoginNetInfo(); //后续获取钱包、游戏配置信息、开奖记录、socket登录

        } catch (error) {
            this.unschedule(this._updateLoadInof);

            this.loadLabel.string = "请求参数错误1";
            this.scheduleOnce(() => {
                //抛出异常后 2s 
                SubGameUtil.getInstance().hiddenFun();
            }, 2);
        }
        //  SubGameCtrl.getInstance().connectWS();
        // ClientManager.getInstance().preLoadGameRes(GameType.Main);
    }

    private async _initLoginInfo() {
        this.unschedule(this._timeTryRelogin);
        SubGameCtrl.getInstance().loginReq();
    }

    private async _initRunGameInfo() {
        this.unschedule(this._timeTryRelogin);
        SubGameCtrl.getInstance().connectWS();

    }

    private async _initInfo() {
        // log("_initInfo",new Date().getTime())
        try {
            // if (this._isUserLoad) {
            //     return;
            // }
            // this._isUserLoad = true;
            // // ClientManager.getInstance().preLoadGameRes(GameType.Main);
            // this._showGame();



            SubGameCtrl.getInstance().setIsInitOver(true);
            WindowManager.getInstance().closeFinalSysLoading();

            if (this._isRelogin) {
                this._isRelogin = false;
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_CLIENT_RECONNECT_NET);
            }

        } catch (error) {
            this.unschedule(this._updateLoadInof);

            this.loadLabel.string = "请求参数错误3";
            this.scheduleOnce(() => {
                SubGameUtil.getInstance().hiddenFun();
            }, 2);
        }
    }

    private _showLogo() {
        this.loadNode.active = true;
        this.loadLabel.string = "";
        this._updateLoadInof();
        this.schedule(this._updateLoadInof, 1);
    }

    private _updateLoadInof() {
        let str = this.loadLabel.string;
        if (!str || str.includes("...")) {
            str = "正在加载中";
        }
        else {
            str += ".";
        }
        this.loadLabel.string = str;
    }

    private _showGame() {
        // ClientManager.getInstance().preLoadGameRes(GameType.Main);

        //用户完成登录后，取消加载中提示轮询操作，同时将load节点隐藏
        this.scheduleOnce(() => {
            this.unschedule(this._updateLoadInof);
            this.loadNode.active = false;
            // this.gameLoadBG.node.active = false;
        }, 5);


        // this.unschedule(this._showReloginLoading);
        WindowManager.getInstance().closeFinalSysLoading();

        // if (this._isRelogin) {
        //     GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_CLIENT_RECONNECT_NET);
        //     return;
        // }
        // this._isRelogin = false;

        //加载下一个场景，方法内部并触发游戏开始事件
        ClientManager.getInstance().preLoadGameRes(GameType.Main);
    }

    private _loadGame() {
        this._loadSysRes();
    }

    private _onLoadSysRes(loadKey: string) {
        //todo nothing
    }

    // 加载系统资源
    private _loadSysRes() {
        // 获取系统资源列表
        let srl = PreloadConfig.info.SysRes;
        // 遍历系统资源列表
        /*根据资源类型加载资源：根据每个资源信息的 type 属性，调用不同的管理器实例
        （如 WindowManager、ObjectManager、SpriteManager 等）的 preload 方法
        来加载资源。这些方法通常接受资源路径、上级资源（superior）和回调函数（this._onLoadSysRes.bind(this)）作为参数。
        处理不同类型的资源：根据资源类型（Window、Prefab、SpriteAtlas、SpriteFrame、AudioClip、SkeletonData、Particle），
        调用相应的预加载方法。
        */
        for (let i = 0; i < srl.length; i++) {
            // 获取当前资源信息
            let resInfo: any = srl[i];
            let superior = resInfo.superior;
            if (resInfo.type == PreloadConfigType.Window) {
                debug("preloadWindow", resInfo.winId)
                WindowManager.getInstance().preloadWindow(resInfo.winId, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Prefab) {
                ObjectManager.getInstance().preloadObjectNode(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteAtlas) {
                SpriteManager.getInstance().preloadSpriteAtlas(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteFrame) {
                SpriteManager.getInstance().preloadSpriteFrame(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.AudioClip) {
                AudioManager.getInstance().preloadAudio(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SkeletonData) {
                SpineManager.getInstance().preloadSkeletonData(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Particle) {
                ParticleManager.getInstance().preloadParticleAsset(resInfo.path, superior, this._onLoadSysRes.bind(this));
            }
            else {
                warn("_loadSysRes type error", resInfo.type);
            }
        }
    }

    private _onPreLoadRes(loadKey: string) {
        // this._loadDebugInfo[loadKey]["endTime"]= new Date().getTime() / 1000
        if (loadKey) {
            let vv = loadKey.split("*@*");
            if (vv.length <= 0 || vv[vv.length - 1] != this._nextGameType) {
                return;
            }
            if (this._preLoadResMap[loadKey]) {
                return;
            }
            this._preLoadResMap[loadKey] = true;
        }

        if (this._sceneState == SceneState.LoadError) {
            return;
        }


        this._preloadCount++;
        debug("_onPreLoadRes", this._preloadCount, this._preloadMaxCount)
        if (this._preloadCount >= this._preloadMaxCount) {
            this._sceneState = SceneState.LoadEnd;
            this._nextLoading = false;
        } else {
            if (this._nextLoading) {
                this._nextLoadCount++;
                if (this._nextLoadCount >= this._nextLoadMaxCount) {
                    this._nextLoading = false;
                    // this.scheduleOnce(()=>{
                    //     this._nextLoading = false;
                    // })
                    // debug("this._loadDebugInfo",JSON.stringify(this._loadDebugInfo))
                }
            }
        }
        if (this._preloadMaxCount > 0) {
            let percent = this._preloadCount / this._preloadMaxCount;
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT, percent);

            //这里不需要通知这个消息
            // if (percent >= 1) {
            //     GameEventManager.getInstance().dispathcGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT_END);
            // }
        } else {
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT, 1);

            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT_END);
        }
    }

    preLoadRes() {
        // 从PreloadConfig.info中获取当前游戏类型的预加载资源列表，如果没有找到，则赋值为空数组
        this._preloadResList = PreloadConfig.info[this._nextGameType] || [];
        this._preloadStepCount = 0;
        this._preloadCount = 0;
        this._preLoadResMap = {};
        this._nextLoading = false;
        this._nextLoadError = false;
        // this._sceneState = SceneState.PreLoad;

        // if (ChannelConfig.IS_ISCHARGE) {
        //     if (PreloadExConfig.info[this._nextGameType] && PreloadExConfig.info[this._nextGameType].length > 0) {
        //         this._preloadResList = this._preloadResList.concat(PreloadExConfig.info[this._nextGameType]);
        //     }
        // }

        this._preloadResList = this._sortLoadResList(this._preloadResList);

        this.scheduleOnce(() => {
            this._sceneState = SceneState.PreLoad;
        }, 0.03)
    }

    private _preLoadRes() {
        if (this._nextLoading) {
            return;
        }

        let list = this._preloadResList;
        if (list.length <= 0) {
            list = PreloadConfig.info[this._nextGameType];
        }
        this._preloadMaxCount = list ? list.length : 0;

        if (this._preloadMaxCount <= 0) {
            this._onPreLoadRes(null);
            return;
        }

        if (this._nextLoadError) {
            this._preloadCount = this._preloadMaxCount;
            this._onPreLoadRes(null);
            return;
        }

        let stepMax = this._preloadStepCount + StepPreloadMax;
        if (stepMax >= this._preloadMaxCount) {
            this._sceneState = SceneState.StartLoad;
        }

        this._nextLoadMaxCount = StepPreloadMax;
        this._nextLoadCount = 0;
        this._nextLoading = true;

        for (let i = this._preloadStepCount; i < stepMax && i < this._preloadMaxCount; i++) {
            if (!PreloadConfig.info[this._nextGameType]) {
                this._sceneState = SceneState.Null
                continue
            }
            let resInfo = PreloadConfig.info[this._nextGameType][i];
            let superior = resInfo.superior || this._nextGameType;

            this._preLoadResMap[resInfo.path ? resInfo.path : resInfo.winId] = true;

            let k = resInfo.path ? resInfo.path : resInfo.winId
            k = k + "*@*" + superior
            // this._loadDebugInfo[k] = {
            //     startTime: new Date().getTime() / 1000,
            // }

            if (resInfo.type == PreloadConfigType.Window) {
                this._nextLoadMaxCount = 1;
                stepMax = this._preloadStepCount + this._nextLoadMaxCount;
                WindowManager.getInstance().preloadWindow(resInfo.winId, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Prefab) {
                ObjectManager.getInstance().preloadObjectNode(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteAtlas) {
                SpriteManager.getInstance().preloadSpriteAtlas(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteFrame) {
                SpriteManager.getInstance().preloadSpriteFrame(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.AudioClip) {
                AudioManager.getInstance().preloadAudio(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SkeletonData) {
                SpineManager.getInstance().preloadSkeletonData(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Particle) {
                ParticleManager.getInstance().preloadParticleAsset(resInfo.path, superior, this._onPreLoadRes.bind(this));
            }
            else {
                warn("preLoadRes type error", resInfo.type);
            }
        }

        this._preloadStepCount = stepMax;
    }

    private _onLoadResAsync(loadKey: string) {
        // if (loadKey) {
        //     let vv = loadKey.split("*@*");
        //     if (vv[vv.length-1] != this._nextGameType) {
        //         return;
        //     }
        //     if (this._loadAnsycMap[loadKey]) {
        //         return;
        //     }
        //     this._loadAnsycMap[loadKey] = true;
        // }

        // if (this._sceneState == SceneState.LoadEndAsync) {
        //     return;
        // }

        this._loadAnsycCount++;
        debug("_onLoadResAsync", this._loadAnsycCount, this._loadAnsycMaxCount)
        if (this._loadAnsycCount >= this._loadAnsycMaxCount) {
            this._sceneState = SceneState.LoadEndAsync;
        } else {
            if (this._nextLoading) {
                this._nextLoadCount++;
                if (this._nextLoadCount >= this._nextLoadMaxCount) {
                    this._nextLoading = false;
                    // this.scheduleOnce(()=>{
                    //     this._nextLoading = false;
                    // })
                }
            }
        }
        if (this._loadAnsycMaxCount > 0) {
            let percent = this._loadAnsycCount / this._loadAnsycMaxCount;
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT, percent);

            if (percent >= 1) {
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT_END);
            }
        } else {
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT, 1);

            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT_END);
        }
    }

    private _sortLoadResList(loadResList: any[]) {
        //去除重复
        let arms = {};
        let narl = [];
        for (let i = 0; i < loadResList.length; i++) {
            let ar = loadResList[i];
            if (ar.type == PreloadConfigType.Window) {
                if (!arms[ar.winId]) {
                    narl.push(ar);
                } else {
                    arms[ar.winId] = true;
                }
            } else {
                if (!arms[ar.path]) {
                    narl.push(ar);
                } else {
                    arms[ar.path] = true;
                }
            }
        }
        // //排序
        // narl.sort((a, b) => {
        //     let s1 = PreloadConfigTypeSort.info[a.type];
        //     let s2 = PreloadConfigTypeSort.info[b.type];
        //     // return s1 - s2;
        //     return s2 - s1;
        // });

        return narl;
    }

    loadResAsync(asyncResList: any[]) {
        this._asyncResList = asyncResList || [];
        this._preloadStepAnsycCount = 0;
        this._loadAnsycCount = 0;
        // this._loadAnsycMap = {};
        this._nextLoading = false;
        this._nextLoadError = false;
        // this._sceneState = SceneState.LoadAsync;


        this._asyncResList = this._sortLoadResList(this._asyncResList);

        this.scheduleOnce(() => {
            this._sceneState = SceneState.LoadAsync;
        }, 0.3)
    }

    private _loadResAsync() {
        if (this._nextLoading) {
            return;
        }
        let list = this._asyncResList || PreloadAsyncConfig.info[ClientManager.getInstance().getCurGameType()];
        this._loadAnsycMaxCount = list ? list.length : 0;

        if (this._loadAnsycMaxCount <= 0) {
            this._onLoadResAsync(null);
            return;
        }

        if (this._nextLoadError) {
            this._preloadCount = this._loadAnsycMaxCount;
            this._onLoadResAsync(null);
            return;
        }

        let stepMax = this._preloadStepAnsycCount + StepPreloadMax;
        if (stepMax >= this._loadAnsycMaxCount) {
            this._sceneState = SceneState.LoadingAsync;
        }

        this._nextLoadMaxCount = StepPreloadMax;
        this._nextLoadCount = 0;
        this._nextLoading = true;

        for (let i = this._preloadStepAnsycCount; i < stepMax && i < this._loadAnsycMaxCount; i++) {
            let resInfo = list[i];
            let superior = resInfo.superior || this._nextGameType;
            if (resInfo.type == PreloadConfigType.Window) {
                this._nextLoadMaxCount = 1;
                stepMax = this._preloadStepAnsycCount + this._nextLoadMaxCount;
                WindowManager.getInstance().preloadWindow(resInfo.winId, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Prefab) {
                ObjectManager.getInstance().preloadObjectNode(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteAtlas) {
                SpriteManager.getInstance().preloadSpriteAtlas(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SpriteFrame) {
                SpriteManager.getInstance().preloadSpriteFrame(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.AudioClip) {
                AudioManager.getInstance().preloadAudio(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.SkeletonData) {
                SpineManager.getInstance().preloadSkeletonData(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else if (resInfo.type == PreloadConfigType.Particle) {
                ParticleManager.getInstance().preloadParticleAsset(resInfo.path, superior, this._onLoadResAsync.bind(this));
            }
            else {
                warn("preLoadRes type error", resInfo.type);
            }
        }

        this._preloadStepAnsycCount = stepMax;
    }

    private _timeSendMainHeartMsg(dt) {
        // log("_sendMainHeartMsg", dt);
        let now = new Date().getTime();
        if (now - SubGameCtrl.getInstance().getSendHeartBeatTime() > 120000) {
            // log("_timeSendMainHeartMsg  心跳超时")
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_HEARTBEAT_TIMEOUT);
            this._stopMainHeartMsg()
            WindowManager.getInstance().showSystemTip("与服务器连接失败!");
            return;
        }
        NetManager.getInstance().sendMessage(ProtocolEnum.PING, null, false);
    }

    private _startMainHeartMsg() {
        // log("_startMainHeartMsg");
        SubGameCtrl.getInstance().resetSendHeartBeatTime();

        this._timeSendMainHeartMsg(0);
        this.schedule(this._timeSendMainHeartMsg, 30);
    }

    private _stopMainHeartMsg() {
        // log('MainScene:_stopMainHeartMsg');
        this.unschedule(this._timeSendMainHeartMsg);
    }

    private _timeTryRelogin() {
        this._relogin();
    }

    private _showNetNoConnectMsg() {
        //服务器已断开连接
        // WindowManager.getInstance().showSystemMsg("服务器已断开连接", () => {
        //     SubGameCtrl.getInstance().reLogin();
        // });
        if (!this._isUserLoad) {
            return;
        }
        this._isUserLoad = false;

        this._timeTryRelogin();
        this.schedule(this._timeTryRelogin, 15);
    }

    private _startDelayGarbageCollect() {

        if (JSB) {
            sys.garbageCollect();

            Tween.stopAllByTarget(this.node);
            tween(this.node)
                .delay(0.5)
                .call(() => {
                    sys.garbageCollect();
                })
                .delay(1)
                .call(() => {
                    sys.garbageCollect();
                })
                .delay(1.5)
                .call(() => {
                    sys.garbageCollect();
                })
                .start();
        }
    }

    onClickHideGame() {
        SubGameUtil.getInstance().hiddenFun();
    }

    update(dt) { //处理当前场景的状态
        if (this._sceneState == SceneState.Null) {
            return;
        }
        else if (this._sceneState == SceneState.PreLoad) {
            let curType = ClientManager.getInstance().getCurGameType();
            if (this._nextGameType == curType) {
                debug("this._nextGameType == curType,this._sceneState = SceneState.LoadSameTypeEnd;")
                this._sceneState = SceneState.LoadSameTypeEnd;
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_ASYNC_LOAD_COUNT, 1);
            } else {
                this._preLoadRes();
            }
        }
        else if (this._sceneState == SceneState.StartLoad) {
            this._sceneState = SceneState.Loading;
        }
        else if (this._sceneState == SceneState.Loading) {
            this._preLoadRes();
        }
        else if (this._sceneState == SceneState.LoadEnd) {


            this._sceneState = SceneState.CleanRes;

            WindowManager.getInstance().closeAllWindow();
            NodePoolManager.getInstance().clearAllNodePool();

            ClientManager.getInstance().replaceGameType(this._nextGameType);

            WindowManager.getInstance().closeFinalSysLoading();

            GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_LOGIN_OVER_HIDE_LOAD_VIEW);
            WindowManager.getInstance().showWindow(GameTypeWinId.info[this._nextGameType], ClientManager.getInstance().getNextTypeGameData());
        }
        // else if (this._sceneState == SceneState.LoadError) {
        //     GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_HIDE_LOAD_VIEW);
        //     // ClientManager.getInstance().preLoadGameRes(GameType.Login, GameCtrl.getInstance().getGameLoadingErrorType());
        //     // WindowManager.getInstance().showSystemTip(GameCtrl.getInstance().getGameLoadingErrorInfo());
        // }
        // else if (this._sceneState == SceneState.LoadEndToMain) {
        //     this._sceneState = SceneState.CleanRes;
        //     GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_LOGIN_OVER_HIDE_LOAD_VIEW);
        //     WindowManager.getInstance().showWindow(GameTypeWinId.info[this._nextGameType], ClientManager.getInstance().getNextTypeGameData());
        // }
        else if (this._sceneState == SceneState.CleanRes) {
            // ClientManager.getInstance().cleanByGameType(ClientManager.getInstance().getPreGameType());
            this._sceneState = SceneState.CleanResEnd;
            // sys.garbageCollect();
        }
        else if (this._sceneState == SceneState.CleanResEnd) {
            ClientManager.getInstance().cleanByGameType(ClientManager.getInstance().getPreGameType());
            // this._sceneState = SceneState.Null;
            // this._nextGameType = GameType.Null;
            this._sceneState = SceneState.GarbageCollect;
            // sys.garbageCollect();
        }
        else if (this._sceneState == SceneState.LoadSameTypeEnd) {
            WindowManager.getInstance().closeAllWindow();
            WindowManager.getInstance().closeFinalSysLoading();
            WindowManager.getInstance().showWindow(GameTypeWinId.info[this._nextGameType], ClientManager.getInstance().getNextTypeGameData());
            // this._sceneState = SceneState.Null;
            // this._nextGameType = GameType.Null;
            this._sceneState = SceneState.GarbageCollect;
            // sys.garbageCollect();
        }
        else if (this._sceneState == SceneState.GarbageCollect) {
            this._sceneState = SceneState.Null;
            this._nextGameType = GameType.Null;
            // sys.garbageCollect();
            this._startDelayGarbageCollect();

            if (this._nextLoadError) {
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.SCENE_HIDE_LOAD_VIEW);

                // let preGame = ClientManager.getInstance().getPreGameType();
                // if ((preGame == GameType.Splash || preGame == GameType.Login || preGame == GameType.Update) && ClientManager.getInstance().getCurGameType() == GameType.Main) {
                //     ClientManager.getInstance().preLoadGameRes(GameType.Login, GameCtrl.getInstance().getGameLoadingErrorType());
                // } else {
                //     ClientManager.getInstance().preLoadGameRes(GameType.Main);
                // }
                // WindowManager.getInstance().showSystemTip(GameCtrl.getInstance().getGameLoadingErrorInfo());

                // ClientManager.getInstance().preLoadGameRes(GameType.Main);

                this._nextLoadError = false;
            }
        }
        else if (this._sceneState == SceneState.LoadAsync) {
            this._loadResAsync();
        }
        else if (this._sceneState == SceneState.LoadingAsync) {
            this._loadResAsync();
        }
        else if (this._sceneState == SceneState.LoadEndAsync) {
            this._sceneState = SceneState.Null;
            ClientManager.getInstance().cleanByGameType(ClientManager.getInstance().getPreGameType());
            this._startDelayGarbageCollect();
        }
    }

    // public lateUpdate() {
    //     if (sys.isBrowser) {
    //         let context = sys['__audioSupport'].context;
    //         context.autoplay = 'enabled'
    //         if (context.state === 'suspended') {
    //             context.resume();
    //             // debug(context.state);
    //         }
    //     }
    // }

    onDispathcGameEvent(eventId: GameEvent, eventData: any): void {
        switch (eventId) {
            case GameEvent.NET_CLIENT_CONNECT:
            case GameEvent.NET_CLIENT_RE_CONNECT: //ws 主动链接 或者 重连的事件
                {
                    this._initLoginInfo();
                }
                break;
            case GameEvent.STOP_CLIENT_HEART:
            case GameEvent.EVENT_HEARTBEAT_TIMEOUT:
            case GameEvent.EVENT_CLIENT_BREAK_NET: //主动断网的事件
                {
                    this._stopMainHeartMsg();
                }
                break;
            case GameEvent.NET_CLIENT_NO_CONNECT: //网络断开或者异常的事件
                {
                    this._stopMainHeartMsg();
                    this._showNetNoConnectMsg();
                }
                break;
            case GameEvent.EVENT_GAME_LOGIN: //处理ws 链接成功的事件
                {
                    this.wsLogin();
                    this._startMainHeartMsg();
                }
                break;
            case GameEvent.EVENT_GAME_RELOGIN: //处理重新登录的事件
                {
                    this._relogin();
                }
            case GameEvent.SCENE_PRELOAD: //加载下一场景的事件处理
                {
                    this._nextGameType = eventData;
                    this.preLoadRes();
                }
                break;
            case GameEvent.SCENE_ASYNC_LOAD: //加载当前场景的的事件
                {
                    this.loadResAsync(eventData);
                }
                break;
            case GameEvent.SENCE_LOADING_ERROR: //场景加载资源错误
                {
                    // this._nextLoadError = true;
                    // this._sceneState = SceneState.LoadError;
                }
                break;
            case GameEvent.SCENE_LOAD_VIEW_TIMEOUT:  //场景加载超时
                {
                    this._sceneState = SceneState.Null;
                }
                break;

            default:
                super.onDispathcGameEvent(eventId, eventData);
                break
        }
    }
}

