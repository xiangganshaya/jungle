// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, instantiate, RichText, Sprite, tween, Tween, UI, UIOpacity, UITransform } from 'cc';
import GameBaseNode from '../../../../base/GameBaseNode';
import SubGameUtil from '../../../subUtils/SubGameUtil';
import GameUtils from '../../../../../utils/GameUtils';

const { ccclass, property } = _decorator;

@ccclass('SysTipViewItem')
export default class SysTipViewItem extends GameBaseNode {

    @property(Sprite)
    lableBg: Sprite = null;
    @property(RichText)
    label: RichText = null;

    // LIFE-CYCLE CALLBACKS:
    //private tipView: TipView = null;
    private _showTime: number = 0.35;

    start() {
        super.start();
    }

    getShowTime() {
        return this._showTime;
    }

    resetData(tipContent: string, showTime: number) {
        GameUtils.getInstance().setString(this.label, tipContent);
        this._showTime = showTime;

        // this.lableBg.node.opacity = 0;

        // Tween.stopAllByTarget(this.lableBg.node);
        // tween(this.lableBg.node)
        //     .to(0.2, {
        //         opacity: 255,
        //         scale: 1,
        //     }).delay(1)
        //     .start();
    }

    hideItem() {
        this.node.destroy();
    }
}
