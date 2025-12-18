
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


let OUT_POS_X = -100000;
let OUT_POS_Y = -100000;

import { _decorator, BlockInputEvents, debug, director, Node, NodeEventType, Sprite, tween, Tween, UIOpacity, v3, Widget } from 'cc';
import GameBaseEventNode from './GameBaseEventNode';
import GameEventManager from '../../manager/GameEventManager';
import GameUtils from '../../utils/GameUtils';
import AudioManager from '../../manager/AudioManager';
import AudioConfig from '../../config/AudioConfig';
import WindowManager from '../../manager/WindowManager';
import { GameEvent } from '../../config/GameEventConfig';
import ConfigManager from '../../manager/ConfigManager';

const { ccclass, property } = _decorator;

@ccclass('GameBaseWindow')
export default class GameBaseWindow extends GameBaseEventNode {

    @property(Sprite)
    backMask: Sprite = null;
    @property(Node)
    rootBG: Node = null;
    @property(Node)
    root: Node = null;
    @property({ tooltip: "是否播放窗口的音效" })
    isWindowAudio: boolean = true;


    // LIFE-CYCLE CALLBACKS:

    
    //--------------------
    
    private _hideRemoveNodes: Node[] = [];
    private _zIndex:number = 0;
    
    protected _windowId: any = null;
    protected _winData: any = null;
    protected _windowSameTag: number = 0;

    private _isOpenWindow: boolean = false;


    //--------------------

    onLoad() {
        super.onLoad();

        // GameUtils.getInstance().setNodeCenter(this.node);

        // if (this.rootBG) {
        //     // GameUtils.getInstance().setNodeCenter(this.rootBG);
        //     GameUtils.getInstance().setBgSpriteScale(this.rootBG);
        // }
        // this._addWindowBackMask();
        // this.setBlockInputEventEnable(true);
    }

    start() {
        super.start();

        // this.node.on(NodeEventType.SIZE_CHANGED, this._resetWindowSize, this);

        // this.resetWindow(this._winData);

        // if (this.isWindowAudio) {
        //     AudioManager.getInstance().playEffectByName(AudioConfig.sound.win_open);
        // }
        // debug("window start",this.name, this.node.x,this.node.y);
    }

    onDisable() {
        GameEventManager.getInstance().removeNodeEvent(this);

        GameUtils.getInstance().stopCCCNodeAllActions(this.node);

        this.node.off(NodeEventType.SIZE_CHANGED, this._resetWindowSize, this);

        this.unscheduleAllCallbacks();

        // super.onDestroy();
    }

    private _resetWindowSize() {
        this.scheduleOnce(() => {
            if (this.rootBG) {
                // GameUtils.getInstance().setNodeCenter(this.rootBG);
                GameUtils.getInstance().setBgNodeScale(this.rootBG);
            }
        }, 0.03)
    }

    preLoadWindow(parentNode: Node) {
        if (!this.node.parent) {
            if (!parentNode) {
                parentNode = director.getScene().getChildByName('Canvas');
            }
            parentNode.addChild(this.node);

            GameUtils.getInstance().stopCCCNodeAllActionsAndAnimations(this.node);
        }

        //防止因窗口大小改变，而调用缓存的窗口的widget
        let widget = this.node.getComponent(Widget);
        if (widget) {
            widget.destroy();
        }

        // this.node.opacity = 0;
        this.node.setPosition(OUT_POS_X, OUT_POS_Y);

        // debug("window",this.name, this.node.x,this.node.y);
        this.scheduleOnce(this._afterUnrealCloseWindow, 0.05);

        this._preInitView();
    }

    //加载后 可适当的初始化一些ui数据等,只预加载的时候调用一次
    protected _preInitView() {
        //子类重写
    }

    realShowWindow() {
        this._windowSameTag = 0;
        this.unschedule(this._afterUnrealCloseWindow);
        this.registerGameEvent();
        // GameUtils.getInstance().resumeCCCNodeAllActionsAndAnimations(this.node);
        GameUtils.getInstance().setNodeCenter(this.node);

        if (this.rootBG) {
            // GameUtils.getInstance().setNodeCenter(this.rootBG);
            GameUtils.getInstance().setBgNodeScale(this.rootBG);
        }
        this._addWindowBackMask();
        this.setBlockInputEventEnable(true);

        this.node.on(NodeEventType.SIZE_CHANGED, this._resetWindowSize, this);

        this.resetWindow(this._winData);

        if (this.isWindowAudio) {
            AudioManager.getInstance().playEffectByName(AudioConfig.sound.win_open);
        }

        this._isOpenWindow = true;
        // debug("window realShowWindow",this.name, this.node.x,this.node.y);
    }

    isOpenWindow() {
        return this._isOpenWindow;
    }

    //添加 在关闭窗口时，要移除的节点,比如一些动态创建的等，不过尽量使用缓存
    protected _pushHideRemoveNode(node: Node) {
        this._hideRemoveNodes.push(node);
    }

    // protected _checkIsOutPos() {
    //     return this.node.getPosition().equals(v2(OUT_POS_X, OUT_POS_Y));
    // }

    unrealCloseWindow() {
        //防止因窗口大小改变，而调用缓存的窗口的widget
        let widget = this.node.getComponent(Widget);
        if (widget) {
            // this.node.removeComponent(Widget);
            widget.enabled = false;
            widget.destroy();
        }

        GameEventManager.getInstance().removeNodeEvent(this);

        this.node.setPosition(OUT_POS_X, OUT_POS_Y);

        this.node.off(NodeEventType.SIZE_CHANGED, this._resetWindowSize, this);

        GameUtils.getInstance().stopCCCNodeAllActions(this.node);

        //关闭窗口时，移除节点，尽量使用缓存
        for (let index = 0; index < this._hideRemoveNodes.length; index++) {
            this._hideRemoveNodes[index].destroy();
        }
        this._hideRemoveNodes.length = 0;

        // debug("window unrealCloseWindow",this.name, this.node.x,this.node.y);

        this._unrealOnDisable();

        this._isOpenWindow = false;

        // tween(this.node)
        //     .delay(0.05)
        //     .call(()=>{
        //         this._afterUnrealCloseWindow();
        //     })
        //     .start();
        this.scheduleOnce(this._afterUnrealCloseWindow, 0.05);
    }

    protected _afterUnrealCloseWindow() {
        debug('%c GameBaseWindow:protected _afterUnrealCloseWindow()' + this._windowId, "color:#0000f0");
        GameUtils.getInstance().setCCCNodeOpacity(this.node, 0);
        // this.node.opacity = 0;
        if (this._windowSameTag != 0) {
            this.closeWinodw(true);
        }
    }

    /**子类的 onDisable 替换成这个 子类重写，可以在这里重置一些数据 */
    protected _unrealOnDisable() {

    }

    private async _addWindowBackMask() {
        // if (!this._backMask) {
        //     this._backMask = new Node().addComponent(Sprite);
        //     if (this._backSpriteName) {
        //         await GameUtils.getInstance().setSpriteFrameByName(this._backMask, this._backSpriteName);
        //         this._backMask.type = Sprite.Type.SLICED;
        //         this._backMask.sizeMode = Sprite.SizeMode.CUSTOM;
        //     } else {
        //         let texture = new RenderTexture();
        //         texture.initWithData(new Uint8Array(4), Texture2D.PixelFormat.RGBA4444, 1, 1);
        //         this._backMask.spriteFrame = new SpriteFrame(texture);

        //         this._backMask.type = Sprite.Type.SIMPLE;
        //         this._backMask.sizeMode = Sprite.SizeMode.CUSTOM;
        //         this._backMask.node.color = Color.BLACK;
        //         this._backMask.node.opacity = 127;
        //     }

        //     this.node.addChild(this._backMask.node, -1);
        //     let widget = this._backMask.addComponent(Widget);
        //     widget.isAlignTop = true;
        //     widget.isAlignBottom = true;
        //     widget.isAlignLeft = true;
        //     widget.isAlignRight = true;
        // }

        if (this.backMask) {
            let widget = this.backMask.getComponent(Widget);
            if (!widget) {
                widget = this.backMask.addComponent(Widget);
            }
            widget.enabled = true;
            widget.isAlignTop = true;
            widget.top = 0;
            widget.isAlignBottom = true;
            widget.bottom = 0;
            widget.isAlignLeft = true;
            widget.left = 0;
            widget.isAlignRight = true;
            widget.right = 0;
        }
    }

    setWinowId(winId) {
        this._windowId = winId;
    }

    getWinowId() {
        return this._windowId;
    }

    setWinowSameTag(tag) {
        this._windowSameTag = tag;
    }

    getWinowSameTag() {
        return this._windowSameTag;
    }

    setZIndex(zIndex:number) {
        this._zIndex = zIndex;
    }

    getZIndex() {
        return this._zIndex;
    }

    showBackMask(isShow: boolean) {
        if (this.backMask) {
            GameUtils.getInstance().setVisible(this.backMask, isShow);
        }
    }

    updateZIndex() {
        this.node.setSiblingIndex(this._zIndex);
    }

    /**
     * 只能调用一次
     * @param winData 
     * @returns 
     */
    showWindow(winData: any) {
        this._winData = winData;

        this.updateZIndex();
        // this.node.opacity = 0;
        GameUtils.getInstance().setCCCNodeOpacity(this.node, 0);
        // this.node.zIndex = LayerZindex.Window;
        // if (this.node.parent) {
        //     return this;
        // }
        // let curScene = director.getScene();
        // // this.node.parent = curScene;
        // curScene.addChild(this.node);

        this.realShowWindow();

        // this.resetWindow(winData);

        return this;
    }

    /**
     * 子类实现
     * @param winData 
     */
    resetWindow(winData: any) {
        this._winData = winData;
        // this.node.opacity = 255;
        GameUtils.getInstance().setCCCNodeOpacity(this.node, 255);
        this._initView();
        this._doShowAction();
        //todo
        //子类实现
    }

    setBlockInputEventEnable(enable: boolean) {
        let blockInputComp: BlockInputEvents = this.getComponent(BlockInputEvents);
        if (enable) {
            if (!blockInputComp) {
                blockInputComp = this.addComponent(BlockInputEvents)
            }
            blockInputComp.enabled = true
        }
        else {
            if (blockInputComp) {
                blockInputComp.enabled = false
            }
        }
    }

    /** 创建节点是动画结束的回调 */
    enterEndCall() {
        //todo
        //子类实现,比如请求网络消息等
    }

    /**
     * 调用父类的 resetWindow 时，在父类中调用，子类重写对应的初始化
     */
    protected _initView() {

    }

    /**
     * 窗口动画
     */
    protected _doShowAction() {
        if (this.root) {
            // this.root.stopAllActions();
            // this.root.opacity = 0;
            GameUtils.getInstance().setCCCNodeOpacity(this.root, 0);
            // this.root.scale = 0;
            GameUtils.getInstance().setScale(this.root, 0);
            // let seq = sequence(scaleTo(0.05,0),spawn(scaleTo(0.1,1.1),fadeIn(0.1)),scaleTo(0.1,1));
            // this.root.runAction(seq);

            Tween.stopAllByTarget(this.root);
            let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
            // tween(this.root).to(0.05,{opacity: 255}).to(0.1,{scale: drc.uiScale * 1.1}).to(0.05,{scale: drc.uiScale}).call(()=>{
            //     this.enterEndCall();
            // }).start();
            // tween(this.root).to(0.05, { opacity: 255 }).to(0.15, { scale: drc.uiScale }).call(() => {
            //     this.enterEndCall();
            //     // if (this.isOpenAudio) {
            //     //     AudioManager.getInstance().playEffectByName(AudioConfig.sound.win_open);
            //     // }
            // }).start();

            tween(this.root)
                .delay(0.05)
                .call(() => {
                    GameUtils.getInstance().setCCCNodeOpacity(this.root, 255);
                })
                .to(0.15, { scale: v3(drc.uiScale, drc.uiScale, 1) })
                .call(() => {
                    this.enterEndCall();
                    // if (this.isOpenAudio) {
                    //     AudioManager.getInstance().playEffectByName(AudioConfig.sound.win_open);
                    // }
                }).start();
        } else {
            this.scheduleOnce(() => {
                this.enterEndCall();
            }, 0.03)
        }
    }

    protected _doCloseAction() {
        if (this.root) {
            // this.root.stopAllActions();
            // let seq = sequence(spawn(scaleTo(0.05,0),fadeOut(0.05)),callFunc(()=>{
            //     this.node.destroy();
            // }));
            // this.root.runAction(seq);

            Tween.stopAllByTarget(this.root);
            tween(this.root).to(0.05, { scale: v3(0) }).call(() => {
                this.node.destroy();
            }).start();
        }
        else {
            this.node.destroy();
        }
    }

    closeWinodw(isNow: boolean = false) {
        if (isNow) {
            this.node.destroy();
        }
        else {
            this._doCloseAction();
        }

        if (this.isWindowAudio) {
            AudioManager.getInstance().playEffectByName(AudioConfig.sound.win_close);
        }
    }

    onClickClose() {
        debug('%c closeWindow %c' + this._windowId, "color:#101010", "color:#f01010");
        WindowManager.getInstance().closeWindow(this._windowId, this._windowSameTag);
    }

    onDispathcGameEvent(eventId: GameEvent, eventData: any) {
        super.onDispathcGameEvent(eventId, eventData);
    }
}
