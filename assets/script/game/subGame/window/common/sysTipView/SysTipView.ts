

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, instantiate, Node, Sprite, tween, Tween, UI, UIOpacity, UITransform, v3 } from 'cc';
import GameBaseWindow from '../../../../base/GameBaseWindow';
import { WinId } from '../../../../../config/WindowConfig';
import { LayerZindex } from '../../../../../config/Config';
import GameUtils from '../../../../../utils/GameUtils';
import ConfigManager from '../../../../../manager/ConfigManager';
import SysTipViewItem from './SysTipViewItem';

const { ccclass, property } = _decorator;

interface TipForm {
    time: number
    tipItem: SysTipViewItem,
    fadeout: boolean
}

@ccclass('SysTipView')
export default class SysTipView extends GameBaseWindow {

    @property(Node)
    tipViewItem: Node = null;

    @property(Node)
    tipItemParent: Node = null;

    // LIFE-CYCLE CALLBACKS:
    private _tip: TipForm[] = [];

    private _moveSpeed: number = 120;
    private _staticTime: number = 0.35;//tip滞留时间
    private _endY: number = 150;//tip结束位置Y
    private _count: number = 4;//tip最多持有数量
    private _positionY: number[] = [];
    private _isInitData: boolean = false

    onLoad() {
        super.onLoad()
        this._windowId = WinId.SysTipView;
        this.setZIndex(LayerZindex.TipMessage);

        this.tipViewItem.active = false;
    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);

        if (!this._isInitData) {
            this._isInitData = true
            // this._endY = (this._count - 1) * this.tipViewItem.height
            for (let i = 0; i < this._count; i++) {
                let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
                // table.insert(positionY, display.center.y + (i-1)*tipNode:getContentSize().height * CC_DESIGN_RESOLUTION.scale)
                let ut = this.tipViewItem.getComponent(UITransform);
                this._positionY[i] = i * ut.height * drc.uiScale
            }
        }
        this.setBlockInputEventEnable(false);
        this.showBackMask(false);

        GameUtils.getInstance().setVisible(this.tipViewItem, false);
        GameUtils.getInstance().setVisible(this.node, true);

        this.createTipView(winData.text, winData.sdt);
    }

    _unrealOnDisable() {
        super._unrealOnDisable()
        this.tipItemParent.removeAllChildren()
        this._tip = []
    }

    createTipView(tipContent: string, sdt: number) {
        if (sdt <= 0) {
            sdt = this._staticTime;
        }
        let itemNode = this.tipViewItem;
        let item = instantiate(itemNode);
        this.tipItemParent.addChild(item)
        GameUtils.getInstance().setVisible(item, true)
        let sItem = item.getComponent(SysTipViewItem)
        sItem.resetData(tipContent, sdt)
        // if (this._tip.length > 4) {
        //     this._tip[0].tipItem.hideItem();
        //     this._tip.shift();
        //     this.checkCloseWindow();
        // }
        this._tip.push({
            time: 0,
            tipItem: sItem,
            fadeout: false
        } as TipForm);
        // this._tip[this._tip.length] = {
        //     time: 0,
        //     tipItem: sItem,
        //     fadeout: false
        // }
        sItem.scheduleOnce(() => {
            this._tip.shift();
            sItem.hideItem();
            this.checkCloseWindow();
        }, 2);
        //this.updateItemPos();

    }

    update(dt) {
        if (this._tip.length <= 0) {
            return;
        }
        let numY = 0
        let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
        let numYIndex = 0
        for (let i = this._tip.length - 2; i >= 0; i--) {
            if (numYIndex < this._count) {
                let ut1 = this._tip[i].tipItem.node.getComponent(UITransform);
                let ut2 = this._tip[i + 1].tipItem.node.getComponent(UITransform);
                numY += (numYIndex == 0) ? 0 : (ut1.height / 2 + ut2.height / 2) * drc.uiScale
                this._positionY[numYIndex] = numY;
                numYIndex++;
            }
        }
        for (let index = 0; index < this._count; index++) {
            if (!this._tip[index]) {
                let ut = this.tipViewItem.getComponent(UITransform);
                numY += ut.height * drc.uiScale;
                this._positionY[index] = numY;
            }
        }
        this._endY = this._positionY[this._positionY.length - 1]
        for (let index = 0; index < this._tip.length; index++) {
            let index_2 = this._tip.length - index - 1
            if (index_2 >= this._count - 1) {
                index_2 = this._count - 1
            }

            let tipData = this._tip[index];
            tipData.time = tipData.time + dt;

            if (index_2 != -1) {
                if (index_2 < this._count && tipData.tipItem.node.position.y <= this._positionY[index_2]) {
                    // tipData.tipItem.node.position.y = this._positionY[index_2]
                    tipData.tipItem.node.setPosition(tipData.tipItem.node.position.x, this._positionY[index_2]);
                }
            }

            if (tipData.time >= tipData.tipItem.getShowTime()) {
                //this._tip[i].tipItem.node.position.y += this._moveSpeed * dt;
                let y = tipData.tipItem.node.position.y
                let t = Math.abs(1 - tipData.time);
                if (t == 0) {
                    t = 0.01;
                }
                let v = Math.abs((this._positionY[2] - y) / t);
                // tipData.tipItem.node.position.y += v * dt
                let pos = tipData.tipItem.node.position;
                tipData.tipItem.node.setPosition(pos.x, pos.y + v * dt);
                if (tipData.tipItem.node.position.y > this._endY) {
                    // tipData.tipItem.node.position.y = this._endY;
                    tipData.tipItem.node.setPosition(pos.x, this._endY);
                }
                if (!tipData.fadeout) {
                    tipData.fadeout = true;
                    let time = 0.7 - ((index_2 + 1) * 0.1)
                    let uoc = tipData.tipItem.node.getComponent(UIOpacity);
                    Tween.stopAllByTarget(uoc);
                    uoc.opacity = 255;
                    tween(uoc)
                        .to(time, { opacity: 0 })
                        .start();
                }
            }
            // if (tipData.time>=2) {
            //     tipData.tipItem.hideItem();
            //     this._tip.shift();
            //     this.checkCloseWindow();
            // }
        }
    }

    updateItemPos() {
        for (let i = this._tip.length - 1; i > 0; i--) {
            let nextItem: Node = this._tip[i - 1].tipItem.node;
            let thisItem: Node = this._tip[i].tipItem.node;
            let ut = thisItem.getComponent(UITransform);
            let nextPos = nextItem.position;
            if (nextPos.y - thisItem.position.y < ut.height) {
                // nextItem.y = thisItem.position.y + ut.height;
                nextItem.setPosition(nextPos.x, thisItem.position.y + ut.height);
                if (nextPos.y > this._endY) {
                    // nextItem.y = this._endY;
                    nextItem.setPosition(nextPos.x, this._endY);
                }
            }
        }
    }

    closeWinodw(isNow: boolean = false) {
        // GameUtils.getInstance().setVisible(this.node, false);
        if (isNow) {
            this.node.destroy();
        } else {
            this.unrealCloseWindow();
        }
    }

    checkCloseWindow() {
        if (this._tip.length == 0) {
            this.closeWinodw();
            // this.unrealCloseWindow();
        }
    }
}
