import { _decorator, Component, Label, Node, sp, Sprite, tween, Tween } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import UserManager from '../../subUtils/UserManager';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import SpineManager from 'db://assets/script/manager/SpineManager';
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
        this.showBackMask(true);

        this._initInof();
    }

    private _initInof() {
        this.appear.node.active = true;
        SpineManager.getInstance().playSpineAni(this.appear, () => {
            this.onClickClose();
        }, "run", false, true);
    }

    // update(deltaTime: number) {

    // }
}

