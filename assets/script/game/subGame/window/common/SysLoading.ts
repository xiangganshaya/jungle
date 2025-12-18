

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Sprite, tween, Tween, UI, UIOpacity } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import GameUtils from '../../../../utils/GameUtils';

const { ccclass, property } = _decorator;

@ccclass('SysLoading')
export default class SysLoading extends GameBaseWindow {

    @property(Sprite)
    aniSpr: Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    private _isShow = false;
    private _loadingTime: number = 0;

    onLoad() {
        super.onLoad()
        this._windowId = WinId.SysLoading;
        this.setZIndex(LayerZindex.MaxTop);
    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);

        this.showBackMask(false);

        this._loadingTime = 10;

        if (this._isShow) {
            return;
        }
        // this._isShow = true;

        Tween.stopAllByTarget(this.aniSpr.node);
        tween(this.aniSpr.node)
            .repeatForever(tween().by(1, { angle: -360 }))
            .start();

        if (this._winData) {
            // this.node.opacity = 255;
            GameUtils.getInstance().setCCCNodeOpacity(this.node, 255);

            // this.node.stopAllActions();
            Tween.stopAllByTarget(this.node);
            this._isShow = true;
        }
        else {
            // this.node.opacity = 0;
            GameUtils.getInstance().setCCCNodeOpacity(this.node, 0);
            this.scheduleOnce(() => {
                GameUtils.getInstance().setCCCNodeOpacity(this.node, 255);
            }, 0.5);
            // this.node.stopAllActions();
            // this.node.runAction(sequence(delayTime(1),fadeIn(0.1)));
            // let uc = this.node.getComponent(UIOpacity);
            // if (uc) {
            //     Tween.stopAllByTarget(uc);
            //     tween(this.node.getComponent(UIOpacity))
            //         .delay(1)
            //         .to(0.1, { opacity: 255 })
            //         .call(() => {
            //             this._isShow = true;
            //         })
            //         .start();
            // }
        }

    }

    // unrealCloseWindow() {
    //     super.unrealCloseWindow();

    //     this._isShow = false;
    //     // this.node.stopAllActions();
    //     GameUtils.getInstance().stopCCCNodeAllActions(this.node);
    // }

    protected _unrealOnDisable() {
        super._unrealOnDisable();

        this._isShow = false;
    }

    onClickClose() {
        if (this._isShow) {
            return;
        }
        this.unrealCloseWindow();
    }

    update(dt) {
        if (!this._isShow) {
            return;
        }
        this._loadingTime -= dt;
        if (this._loadingTime <= 0) {
            this.unrealCloseWindow();
        }
    }
}
