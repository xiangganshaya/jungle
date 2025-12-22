import { _decorator, Component, Label, Node, sp, Sprite, tween, Tween } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import UserManager from '../../subUtils/UserManager';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import SpineManager from 'db://assets/script/manager/SpineManager';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('LayerTip')
export class LayerTip extends GameBaseWindow {

    @property(sp.Skeleton)
    appear: sp.Skeleton = null;


    // LIFE-CYCLE CALLBACKS:



    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerTip;
        this.setZIndex(LayerZindex.Tip);

    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(false);
        this.setBlockInputEventEnable(false);

        this._initInof();
    }

    private _initInof() {
        this.appear.node.active = true;
        let aniName = "run";
        if (this._winData == 1) {
            aniName = "run2";
        }
        SpineManager.getInstance().playSpineAni(this.appear, () => {
            this.onClickClose();
        }, aniName, false, true);
    }

    // update(deltaTime: number) {

    // }
}

