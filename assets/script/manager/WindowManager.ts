import { EditBox, Node, debug, log, warn } from "cc";
import ObjectManager from "./ObjectManager";
import ClientManager from "./ClientManager";
import GameBaseWindow from "../game/base/GameBaseWindow";
import { WinId, WinInfo } from "../config/WindowConfig";
import { GameLoadingType, GameTypeWinId, SuperiorEnum } from "../config/GameType";
import { LayerZindex } from "../config/Config";
import GameEventManager from "./GameEventManager";
import { GameEvent } from "../config/GameEventConfig";


class SeqOpenWinData {
    winId = "";
    winData = null;
}

export default class WindowManager {
    private static _instance: WindowManager = null;

    private _windows: any = {};
    private _superior: any = {};

    private _openWinList: GameBaseWindow[] = [];
    private _notCanCloseAllWinList: GameBaseWindow[] = [];//不能通过closeAll关闭的窗口
    private _messageBoxWinList: { [key: string]: GameBaseWindow } = {}; //message类的窗口
    private _seqOpenWinDataList: SeqOpenWinData[] = [];
    private _seqOpenAwardWinDataList: SeqOpenWinData[] = [];
    private _curSeqOpenWin: SeqOpenWinData = null;
    private _curAwardSeqOpenWin: SeqOpenWinData = null;
    private _loadingWin: GameBaseWindow = null;
    private _hornWin: GameBaseWindow = null;
    private _tipView: GameBaseWindow = null;
    private _msgBoxView: GameBaseWindow = null;
    private _phoneMaskView: GameBaseWindow = null;

    private _loadingCount = 0;
    private _isShowItemTipView: boolean = false;

    private _sameWinTag: number = 100;

    //适配这套代码
    private _windowParent: Node = null;
    private _focusEditBox: EditBox = null;

    // private _loadDebugInfo:any = {}

    //----------------------

    public static getInstance() {
        if (!this._instance) {
            this._instance = new WindowManager();
        }
        return this._instance;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || isNaN(arg);
    }

    private _getLoadWindow(name: string, superior: string): GameBaseWindow {
        if (this._windows[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._windows[name];
        }

        return null;
    }

    private _addSuperiorData(path: string, superior: string) {
        if (this._isNull(this._superior[superior])) {
            this._superior[superior] = {};
        }
        if (this._isNull(this._superior[superior][path])) {
            this._superior[superior][path] = true;
        }
    }

    private _checkSuperior(superior: string) {
        let clearList: string[] = [];
        if (this._isNull(this._superior[superior])) {
            return clearList;
        }
        for (let skey in this._superior[superior]) {
            let isHave = false;
            for (let key in this._superior) {
                if (key == superior) {
                    continue;
                }
                for (let kk in this._superior[key]) {
                    if (kk == skey) {
                        isHave = true;
                        break;
                    }
                }
                if (isHave) {
                    break;
                }
            }
            if (!isHave) {
                clearList.push(skey);
            }
        }
        return clearList;
    }

    private _checkPathSuperior(path: string, superior: string) {
        let clearList: string[] = [];
        if (this._isNull(this._superior[superior])) {
            return clearList;
        }
        let isHave = false;
        for (let key in this._superior) {
            if (key == superior) {
                continue;
            }
            for (let kk in this._superior[key]) {
                if (kk == path) {
                    isHave = true;
                    break;
                }
            }
        }
        if (!isHave) {
            clearList.push(path);
        }
        return clearList;
    }

    public clearSuperiorObject(superior: string) {
        let clearList = this._checkSuperior(superior);
        if (this._superior[superior]) {
            delete this._superior[superior];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._windows[clearList[i]]) {
                // if (isValid(this._windows[clearList[i]])) {
                //     this._windows[clearList[i]].closeWinodw();
                // }
                this._windows[clearList[i]].closeWinodw(true);
                delete this._windows[clearList[i]];
            }
        }
        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public clearAllSuperiorObject() {
        for (const key in this._superior) {
            this.clearSuperiorObject(key);

            delete this._superior[key];
        }

        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public preloadWindow(winId: WinId | string, superior: string, cb: Function) {
        let winInfo = WinInfo.info[winId];
        if (!winInfo) {
            warn("打开窗口参数不对", winId);
            return;
        }
        let path = winInfo.path;
        if (this._windows[path]) {
            this._addSuperiorData(path, superior);
            cb(winId + "*@*" + superior);
            return;
        }

        // this._loadDebugInfo[path+"preloadObjectNode"] = {startTime: new Date().getTime() / 1000,}
        ObjectManager.getInstance().preloadObjectNode(path, superior, () => {
            // this._loadDebugInfo[path+"preloadObjectNode"]["endTime"] = new Date().getTime() / 1000
            if (this._checkIsGameTypeWindow(winId)) {
                cb(winId + "*@*" + superior);
            } else {
                // this._loadDebugInfo[path] = {startTime: new Date().getTime() / 1000,}
                ObjectManager.getInstance().getObjectByCallback(path, winInfo.script, SuperiorEnum.gameSystem, (win) => {
                    // this._loadDebugInfo[path]["endTime"] = new Date().getTime() / 1000
                    if (!win) {
                        warn("preloadWindow error", winId)
                        cb(winId + "*@*" + superior);
                        return;
                    }
                    this._addSuperiorData(path, superior);
                    this._windows[path] = win;
                    // this._loadDebugInfo[path+"_win"] = {startTime: new Date().getTime() / 1000,}
                    win.preLoadWindow();
                    // this._loadDebugInfo[path+"_win"]["endTime"] = new Date().getTime() / 1000
                    cb(winId + "*@*" + superior);
                    // warn("win _loadDebugInfo",JSON.stringify(this._loadDebugInfo))
                });
            }
        });
    }

    private _checkIsGameTypeWindow(winId: WinId | string) {
        let infos = GameTypeWinId.info
        for (const key in infos) {
            if (winId == infos[key]) {
                return true;
            }
        }
        return false;
    }

    async showToast(text: string | number, arg: (string | number)[] = []) {
        // warn("showToast", text);
        return this.showSystemTip(text, 0, arg);
    }

    async showSystemTip(text: string | number, sdt: number = 0, arg: (string | number)[] = []) {
        // warn("showSystemTip ", text)
        if (this._tipView) {
            this._tipView.showWindow({ text, sdt });
            return this._tipView;
        }

        let winInfo = WinInfo.info[WinId.SysTipView];
        let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        if (win) {
            this._tipView = win.showWindow({ text, sdt });
        }

        return this._tipView;
    }

    closeSysTipView() {
        if (this._tipView) {
            this._tipView.closeWinodw(true);
            this._tipView = null
            // this._hornWin.unrealCloseWindow();
        }
    }

    async showEmailTip(index: number, msg: string = null, callback: Function = null) {

    }

    async showNetErrorTip(errorId: number) {
        // if (errorId == 0x9998) {
        //     return null;
        // }
        // // let languageData: TranslationConfig = TranslationConfigsConfig.datas[errorId];
        // // let text = ErrorCode.datas[errorId];
        // let text = SubGameCtrl.getInstance().getTextById(errorId);
        // if (text) {
        //     return await this.showSystemTip(text);
        // }
        return null;
    }

    async showSystemHorn() {
        // if (this._hornWin) {
        //     this._hornWin.showWindow(null);
        //     return this._hornWin;
        // }

        // let winInfo = WinInfo.info[WinId.SystemHorn];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     this._hornWin = win.showWindow(null);
        // }

        // return this._hornWin;

        // // if (this._hornWin) {
        // //     GameUtils.getInstance().setVisible(this._hornWin.node, true);
        // //     this._hornWin.resetWindow(null);
        // //     return this._hornWin;
        // // }
        // // let winInfo = WinInfo.info[WinId.SystemHorn];
        // // let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return this._hornWin = win.showWindow(null);
        // // }
        // // return null;
    }

    closeSysHorn() {
        if (this._hornWin) {
            this._hornWin.closeWinodw(true);
            this._hornWin = null
            // this._hornWin.unrealCloseWindow();
        }
    }

    /**
     * 
     * @param text 
     * @param okcb 
     * @param cancelcb 
     * 如果 cancelcb 是空，则不显示 取消 按钮
     * 注意 回调里的this,如果 回调里 使用了 this， 那 绑定时，最好 使用 .bind(this) 或者 使用 ts 的语法 () => {}
     */
    async showSystemMsg(text: string, okcb: Function, cancelcb: Function = null) {
        if (this._msgBoxView) {
            this._msgBoxView.showWindow({ text, okcb, cancelcb });
            return this._msgBoxView;
        }

        let winInfo = WinInfo.info[WinId.SysMsgBox];
        let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        if (win) {
            this._msgBoxView = win.showWindow({ text, okcb, cancelcb });
            // this._setMessageBoxWindowZIndex(win);
            // this._messageBoxWinList["showSystemMsg"] = win;
            return this._msgBoxView;
        }

        return this._msgBoxView;
    }
    /**
     * 打开触摸提示，默认params 格式是
     * 
     * @param params    true 时params 格式是 {   wp:Vec2,
            title:string,
            content:string
            noTitle:Booolean,是否没有标题
        }
     * @returns 
     */
    async showTouchMsg(params: any) {
        // this.closeTouchMsg();
        // this._isShowItemTipView = true;
        // await this.showWindow(WinId.ItemTipView, params);
        // if (!this._isShowItemTipView) {
        //     this.closeTouchMsg();
        // }
        // // let temParams = params
        // // // if (itemId && itemId!= "") {
        // // //     let itemData:ItemConfig = ItemConfigConfig.datas[itemId]
        // // //     temParams={wp:params.wp,title:itemData.name,content:itemData.desc,noTitle: false}
        // // // }
        // // let winInfo = WinInfo.info[WinId.ItemTipView];
        // // let win:GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path,winInfo.script,SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return win.showWindow(params);
        // // }

        // return null;
    }
    /**
     * 关闭触摸提示
     */
    closeTouchMsg() {
        // // warn("close ItemTipView")
        // this.closeWindow(WinId.ItemTipView, 0);
        // this._isShowItemTipView = false;
    }

    /**
     * 
     * @param text ≈
     * @param okcb 
     * @param cancelcb 
     * 如果 cancelcb 是空，则不显示 取消 按钮
     * 注意 回调里的this,如果 回调里 使用了 this， 那 绑定时，最好 使用 .bind(this) 或者 使用 ts 的语法 () => {}
     */
    async showSystemNetErrorMsg(okcb: Function = null, cancelcb: Function = null, textcb: Function = null) {
        // let winInfo = WinInfo.info[WinId.AlertNetErrorView];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     win.showWindow({ okcb, cancelcb, textcb });
        //     this._setMessageBoxWindowZIndex(win);
        //     this._messageBoxWinList["showSystemNetErrorMsg"] = win;
        //     return win;
        // }

        // // let path = winInfo.path
        // // win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     this._addSuperiorData(path, SuperiorEnum.gameSystem);
        // //     this._windows[path] = win;
        // //     win.preLoadWindow();
        // //     win.showWindow({ okcb, cancelcb, textcb });
        // //     return win;
        // // }

        // return null;

        // // let winInfo = WinInfo.info[WinId.AlertNetErrorView];
        // // let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return win.showWindow({ okcb, cancelcb, textcb });
        // // }
        // // return null;
    }

    /**
     * 
     * @param text 
     * @param checkKey 
     * @param isAlways 
     * @param okcb 
     * @param cancelcb 
     * @param textcb 
     * 如果 cancelcb 是空，则不显示 取消 按钮
     * 注意 回调里的this,如果 回调里 使用了 this， 那 绑定时，最好 使用 .bind(this) 或者 使用 ts 的语法 () => {}
     */
    async showSystemCheckMsg(text: string, checkKey: string, isAlways: boolean, isWait: boolean, okcb: Function, cancelcb: Function = null, textcb: Function = null) {
        // let isNotOpen = false;
        // if (isAlways) {
        //     isNotOpen = ClientManager.getInstance().getCheckKey(checkKey);
        // } else {
        //     isNotOpen = GameTools.getInstance().getLocalStorageItem(checkKey) == true.toString();
        // }

        // if (isNotOpen) {
        //     okcb();
        //     return;
        // }

        // let winInfo = WinInfo.info[WinId.AlertCheckView];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     win.showWindow({ text, checkKey, isAlways, isWait, okcb, cancelcb, textcb });
        //     this._setMessageBoxWindowZIndex(win);
        //     this._messageBoxWinList["showSystemCheckMsg"] = win;
        //     return win;
        // }

        // // let path = winInfo.path
        // // win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     this._addSuperiorData(path, SuperiorEnum.gameSystem);
        // //     this._windows[path] = win;
        // //     win.preLoadWindow();
        // //     win.showWindow({ text, checkKey, isAlways, okcb, cancelcb, textcb });
        // //     return win;
        // // }

        // return null;

        // // let winInfo = WinInfo.info[WinId.AlertCheckView];
        // // let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return win.showWindow({ text, checkKey, isAlways, okcb, cancelcb, textcb });
        // // }
        // // return null;
    }

    /**
     * 
     * @param text 
     * @param url 
     * @param okcb 
     * @param cancelcb 
     * @param textcb 
     * 如果 cancelcb 是空，则不显示 取消 按钮
     * 注意 回调里的this,如果 回调里 使用了 this， 那 绑定时，最好 使用 .bind(this) 或者 使用 ts 的语法 () => {}
     */
    async showSystemUpdateErrorMsg(text: string, url: string, okcb: Function, cancelcb: Function = null, textcb: Function = null) {

        // let winInfo = WinInfo.info[WinId.AlertUpdateView];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     win.showWindow({ text, url, okcb, cancelcb, textcb });
        //     this._setMessageBoxWindowZIndex(win);
        //     this._messageBoxWinList["showSystemUpdateErrorMsg"] = win;
        //     return win;
        // }

        // // let path = winInfo.path
        // // win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     this._addSuperiorData(path, SuperiorEnum.gameSystem);
        // //     this._windows[path] = win;
        // //     win.preLoadWindow();
        // //     win.showWindow({ text, url, okcb, cancelcb, textcb });
        // //     return win;
        // // }

        // return null;

        // // let winInfo = WinInfo.info[WinId.AlertUpdateView];
        // // let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return win.showWindow({ text, url, okcb, cancelcb, textcb });
        // // }
        // // return null;
    }

    private _setMessageBoxWindowZIndex(showWin: GameBaseWindow) {
        let zIndex = LayerZindex.MessageBox;
        for (const key in this._messageBoxWinList) {
            let win = this._messageBoxWinList[key];
            if (win.isOpenWindow() && win.node.getSiblingIndex() > zIndex) {
                zIndex = win.node.getSiblingIndex();
            }
        }
        if (showWin.node.getSiblingIndex() < zIndex) {
            showWin.node.setSiblingIndex(zIndex);
        }
    }

    async showSysLoading(isNow: boolean = false) {
        // log("showSysLoading",this._loadingCount)
        if (this._loadingWin) {
            this._loadingCount++;
            if (this._loadingCount > 0) {
                this._loadingWin.showWindow(isNow);
            }
            // log("showSysLoading",this._loadingCount)
            return;
        }
        // this._loadingCount++;
        let winInfo = WinInfo.info[WinId.SysLoading];
        let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        if (win) {
            this._loadingWin = win.showWindow(isNow);
            //防止加载慢的时候
            if (this._loadingCount <= 0) {
                this._loadingWin.unrealCloseWindow();
            }
        }

        return this._loadingWin;
    }

    /**
     * 计数器为0时关闭Loading
     */
    closeSysLoading() {
        this._loadingCount--;
        if (this._loadingCount <= 0) {
            this._loadingCount = 0;
        }
        if (this._loadingWin) {
            if (this._loadingCount > 0) {
                return;
            }
            this._loadingWin.unrealCloseWindow();
            // this._loadingWin = null;
        }
        // log("closeSysLoading",this._loadingCount)
    }

    /**
     * 这个接口一定可以关闭loading
     */
    closeFinalSysLoading(isNull: boolean = false) {
        this._loadingCount = 0;
        if (this._loadingWin) {
            this._loadingWin.unrealCloseWindow();
            if (isNull) {
                this._loadingWin.closeWinodw(true);
                this._loadingWin = null;
            }
        }
        // warn("closeFinalSysLoading",this._loadingCount)
    }
    /**
     * 
     * @param isShowLoading 
     * @param loadingType GameLoadingType.Rand  默认随机动画，随机的概率，通过ui获取
     * @returns 
     */
    async showGameLoading(isShowLoading: boolean = true, loadingType: GameLoadingType = GameLoadingType.Rand) {
        // let winInfo = WinInfo.info[WinId.LayerGameLoading];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     win.showWindow({ isShowLoading: isShowLoading, loadingType: loadingType });
        //     return win;
        // }

        // // let path = winInfo.path
        // // win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     this._addSuperiorData(path, SuperiorEnum.gameSystem);
        // //     this._windows[path] = win;
        // //     win.preLoadWindow();
        // //     win.showWindow(isShowLoading);
        // //     return win;
        // // }

        // return null;

        // // let winInfo = WinInfo.info[WinId.LayerGameLoading];
        // // let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script, SuperiorEnum.gameSystem);
        // // if (win) {
        // //     return win.showWindow(isShowLoading);
        // // }
        // // return null;
    }

    async showPhoneMaskWindow() {
        // let winInfo = WinInfo.info[WinId.LayerPhoneMask];
        // let win: GameBaseWindow = this._getLoadWindow(winInfo.path, SuperiorEnum.gameSystem);
        // if (win) {
        //     this._phoneMaskView = win;
        //     win.showWindow(null);
        //     return win;
        // }

        // let path = winInfo.path
        // win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
        // if (win) {
        //     this._addSuperiorData(path, SuperiorEnum.gameSystem);
        //     this._windows[path] = win;
        //     this._phoneMaskView = win;
        //     win.preLoadWindow();
        //     win.showWindow(null);

        //     return win;
        // }

        // return null;
    }

    //返回自增sameWinTag
    private _getSameWinTag() {
        this._sameWinTag++;
        return this._sameWinTag;
    }

    // /**
    //  * 
    //  * @param winId 
    //  * @param winData 打开窗口的后的窗口参数
    //  * @param isCanCloseAll 不能通过closeAll关闭的窗口
    //  */
    // async showWindow(winId: WinId | string, winData: any = null, isOpenSame: boolean = false, isCanCloseAll: boolean = true, superior: string = "") {
    //     warn('WindowManager:showWindow open %c' + winId, "color:#f00f00");
    //     if (!isOpenSame) {
    //         this.closeWindow(winId as WinId, 0);
    //     }
    //     let winInfo = WinInfo.info[winId];
    //     if (!winInfo) {
    //         warn("打开窗口参数不对", winId);
    //         return;
    //     }

    //     //主场景 不会有重得，所以这里不加 isOpenSame 的 winSameTag
    //     if (this._checkIsGameTypeWindow(winId)) {
    //         this.showSysLoading();
    //         let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script);
    //         // if (!isOpenSame) {//关闭重复的窗口
    //         //     this.closeWindow(winId);
    //         // }
    //         if (win) {
    //             win.setWinowId(winId);
    //             win.preLoadWindow();
    //             let w = win.showWindow(winData);
    //             if (isCanCloseAll) {
    //                 this._openWinList.push(win);
    //             } else {
    //                 this._notCanCloseAllWinList.push(win);
    //             }
    //             this.closeSysLoading();
    //             return w;
    //         }
    //     } else {
    //         if (!superior) {
    //             superior = ClientManager.getInstance().getCurGameType();
    //         }

    //         this.showSysLoading();

    //         //是否一个界面打开多次
    //         if (isOpenSame) {
    //             //查找一下之前有没有打开过的//没有打开过，说明是第一次打开，走正常流程
    //             let openWin = this.getWindow(winId);
    //             if (openWin) {
    //                 //有打开过的，就说明打开的是第二个或以上的界面
    //                 let path = winInfo.path
    //                 let win: GameBaseWindow = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
    //                 if (win) {
    //                     this._addSuperiorData(path, superior);
    //                     // this._windows[path] = win;//重打开的界面，不用保存到缓存里
    //                     win.preLoadWindow();
    //                     win.showWindow(winData);
    //                     win.setWinowSameTag(this._getSameWinTag());
    //                     if (isCanCloseAll) {
    //                         this._openWinList.push(win);
    //                     } else {
    //                         this._notCanCloseAllWinList.push(win);
    //                     }
    //                     this.setOpenWindowMaxZIndex(win);
    //                     this.closeSysLoading();
    //                     return win;
    //                 }
    //             }
    //         }
    //         let win: GameBaseWindow = this._getLoadWindow(winInfo.path, superior);
    //         if (win) {
    //             win.showWindow(winData);
    //             if (isCanCloseAll) {
    //                 this._openWinList.push(win);
    //             } else {
    //                 this._notCanCloseAllWinList.push(win);
    //             }
    //             this.setOpenWindowMaxZIndex(win);
    //             this.closeSysLoading();
    //             return win;
    //         }

    //         let path = winInfo.path
    //         win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
    //         if (win) {
    //             this._addSuperiorData(path, superior);
    //             this._windows[path] = win;
    //             win.preLoadWindow();
    //             win.showWindow(winData);
    //             if (isCanCloseAll) {
    //                 this._openWinList.push(win);
    //             } else {
    //                 this._notCanCloseAllWinList.push(win);
    //             }
    //             this.setOpenWindowMaxZIndex(win);
    //             this.closeSysLoading();
    //             return win;
    //         }
    //     }

    //     return null;
    // }

    /**
     * 适配这套代码
     * @param winId 
     * @param winData 打开窗口的后的窗口参数
     * @param isCanCloseAll 不能通过closeAll关闭的窗口
     */
    async showWindow(winId: WinId | string, winData: any = null, isOpenSame: boolean = false, isCanCloseAll: boolean = true, superior: string = "") {
        debug('WindowManager:showWindow open %c' + winId, "color:#f00f00");
        if (this._checkFocusEditBox()) {
            this.blurEditBox();
            let timer = 0
            timer = setTimeout(() => {
                timer && clearTimeout(timer)
                timer = 0
                this.showWindow(winId, winData, isOpenSame, isCanCloseAll, superior);
            }, 1000);
            return;
        }
        if (!isOpenSame) {
            this.closeWindow(winId as WinId, 0);
        }
        let winInfo = WinInfo.info[winId];
        if (!winInfo) {
            warn("打开窗口参数不对", winId);
            return;
        }

        //主场景 不会有重得，所以这里不加 isOpenSame 的 winSameTag
        if (this._checkIsGameTypeWindow(winId)) {
            this.showSysLoading();
            let win: GameBaseWindow = await ObjectManager.getInstance().getObject(winInfo.path, winInfo.script);
            // if (!isOpenSame) {//关闭重复的窗口
            //     this.closeWindow(winId);
            // }
            if (win) {
                win.setWinowId(winId);
                win.preLoadWindow(this._windowParent);
                let w = win.showWindow(winData);
                if (isCanCloseAll) {
                    this._openWinList.push(win);
                } else {
                    this._notCanCloseAllWinList.push(win);
                }
                this.closeSysLoading();
                return w;
            }
        } else {
            if (!superior) {
                superior = ClientManager.getInstance().getCurGameType();
            }

            this.showSysLoading();

            //是否一个界面打开多次
            if (isOpenSame) {
                //查找一下之前有没有打开过的//没有打开过，说明是第一次打开，走正常流程
                let openWin = this.getWindow(winId);
                if (openWin) {
                    //有打开过的，就说明打开的是第二个或以上的界面
                    let path = winInfo.path
                    let win: GameBaseWindow = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
                    if (win) {
                        this._addSuperiorData(path, superior);
                        // this._windows[path] = win;//重打开的界面，不用保存到缓存里
                        win.preLoadWindow(this._windowParent);
                        win.showWindow(winData);
                        win.setWinowSameTag(this._getSameWinTag());
                        if (isCanCloseAll) {
                            this._openWinList.push(win);
                        } else {
                            this._notCanCloseAllWinList.push(win);
                        }
                        this.setOpenWindowMaxZIndex(win);
                        this.closeSysLoading();
                        return win;
                    }
                }
            }
            let win: GameBaseWindow = this._getLoadWindow(winInfo.path, superior);
            if (win) {
                win.showWindow(winData);
                if (isCanCloseAll) {
                    this._openWinList.push(win);
                } else {
                    this._notCanCloseAllWinList.push(win);
                }
                this.setOpenWindowMaxZIndex(win);
                this.closeSysLoading();
                return win;
            }

            let path = winInfo.path
            win = await ObjectManager.getInstance().getObject(path, winInfo.script, SuperiorEnum.gameSystem);
            if (win) {
                this._addSuperiorData(path, superior);
                this._windows[path] = win;
                win.preLoadWindow(this._windowParent);
                win.showWindow(winData);
                if (isCanCloseAll) {
                    this._openWinList.push(win);
                } else {
                    this._notCanCloseAllWinList.push(win);
                }
                this.setOpenWindowMaxZIndex(win);
                this.closeSysLoading();
                return win;
            }
        }

        return null;
    }

    /**
     * 适配这套代码
     * setWindowParent
     */
    public setWindowParent(pn: Node) {
        if (this._windowParent) {
            this.closeAllWindow();
        }
        this._windowParent = pn;
    }

    public setFocusEditBox(eb: EditBox) {
        if (this._focusEditBox) {
            this._focusEditBox.blur();
        }
        this._focusEditBox = eb;
    }

    public blurEditBox() {
        if (this._focusEditBox) {
            this._focusEditBox.blur();
        }
        this._focusEditBox = null;
    }

    private _checkFocusEditBox() {
        return !!this._focusEditBox;
    }

    private setOpenWindowMaxZIndex(showWin: GameBaseWindow) {
        let cowl = this._openWinList.concat([]);
        cowl.sort((a, b) => {
            return a.getZIndex() - b.getZIndex();
        });
        for (let i = 0; i < cowl.length; i++) {
            // log("_openWinList zindex",cowl[i].getZIndex())
            cowl[i].updateZIndex();
        }

        cowl = this._notCanCloseAllWinList.concat([]);
        cowl.sort((a, b) => {
            return a.getZIndex() - b.getZIndex();
        });
        for (let i = 0; i < cowl.length; i++) {
            // log("_notCanCloseAllWinList zindex",cowl[i].getZIndex())
            cowl[i].updateZIndex();
        }

        if (this._msgBoxView) {
            this._msgBoxView.updateZIndex();
        }
        if (this._tipView) {
            this._tipView.updateZIndex();
        }
        if (this._loadingWin) {
            this._loadingWin.updateZIndex();
        }
    }

    // async showAwardSeqPopWindow(winId: WinId | string, winData: any = null) {
    //     this._seqOpenAwardWinDataList.push({
    //         winId: winId,
    //         winData: winData,
    //     } as SeqOpenWinData);

    //     this._openAwardSeqPopWindow();
    // }

    // private _openAwardSeqPopWindow() {
    //     if (this._seqOpenAwardWinDataList.length > 0 && !this._curSeqOpenWin) {
    //         let swd = this._seqOpenAwardWinDataList.shift();
    //         if (swd) {
    //             this._curAwardSeqOpenWin = swd;
    //             this.showWindow(swd.winId, swd.winData, true);
    //         }
    //     }
    // }

    async showSeqPopWindow(winId: WinId | string, winData: any = null) {
        this._seqOpenWinDataList.push({
            winId: winId,
            winData: winData,
        } as SeqOpenWinData);

        this._openSeqPopWindow();
    }

    private _openSeqPopWindow() {
        if (this._seqOpenWinDataList.length > 0 && !this._curSeqOpenWin) {
            let swd = this._seqOpenWinDataList.shift();
            if (swd) {
                this._curSeqOpenWin = swd;
                this.showWindow(swd.winId, swd.winData, true);
            }
        }
    }

    getWindow(winId) {
        for (let i = this._openWinList.length - 1; i >= 0; i--) {
            let win = this._openWinList[i];
            if (winId == win.getWinowId()) {
                return win;
            }
        }

        for (let i = this._notCanCloseAllWinList.length - 1; i >= 0; i--) {
            let win = this._notCanCloseAllWinList[i];
            if (winId == win.getWinowId()) {
                return win;
            }
        }
        return null;
    }

    closeWindow(winId: WinId, winSameTag: number) {
        for (let i = this._openWinList.length - 1; i >= 0; i--) {
            let win = this._openWinList[i];
            if (winId == win.getWinowId() && winSameTag == win.getWinowSameTag()) {
                if (this._checkIsGameTypeWindow(winId)) {
                    win.closeWinodw(true);
                } else {
                    win.unrealCloseWindow();
                }
                this._openWinList.splice(i, 1);
                break;
            }
        }

        for (let i = this._notCanCloseAllWinList.length - 1; i >= 0; i--) {
            let win = this._notCanCloseAllWinList[i];
            if (winId == win.getWinowId() && winSameTag == win.getWinowSameTag()) {
                if (this._checkIsGameTypeWindow(winId)) {
                    win.closeWinodw(true);
                } else {
                    win.unrealCloseWindow();
                }
                this._notCanCloseAllWinList.splice(i, 1);
                break;
            }
        }

        if (this._curSeqOpenWin && this._curSeqOpenWin.winId == <any>winId) {
            this._curSeqOpenWin = null;
            this._openSeqPopWindow();
        }

        // if (this._curAwardSeqOpenWin && this._curAwardSeqOpenWin.winId == winId) {
        //     this._curAwardSeqOpenWin = null;
        //     this._openAwardSeqPopWindow();
        // }
    }

    closeAllWindow() {
        for (let i = this._openWinList.length - 1; i >= 0; i--) {
            let win = this._openWinList[i];
            if (this._checkIsGameTypeWindow(win.getWinowId())) {
                win.closeWinodw(true);
            } else {
                win.unrealCloseWindow();
            }
            this._openWinList.splice(i, 1);
        }

        this._seqOpenWinDataList.length = 0;
        this._seqOpenAwardWinDataList.length = 0;
        this._curSeqOpenWin = null;
        this._curAwardSeqOpenWin = null;
    }

}

