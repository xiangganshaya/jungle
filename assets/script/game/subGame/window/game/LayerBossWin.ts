import { _decorator, Component, Label, debug, Node, Sprite, tween, Tween, sp, UITransform, Vec3, v3, log } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import GameUtils from 'db://assets/script/utils/GameUtils';
import { WinnerItemIF } from '../../net/netMessage/MessageModes';

const { ccclass, property } = _decorator;

@ccclass('LayerBossWin')
export class LayerBossWin extends GameBaseWindow {

    // @property(Node)
    // winNode: Node = null;
    // @property(sp.Skeleton)
    // winEeffect: sp.Skeleton = null;
    // @property(Label)
    // winDesc: Label = null;
    @property(Sprite)
    winIcon: Sprite = null; //获得奖励的图标
    @property(Label)
    winName: Label = null;

    // LIFE-CYCLE CALLBACKS:

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerBossWin;
        this.setZIndex(LayerZindex.Window + 1);

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
        let winInfo: WinnerItemIF = this._winData;
        GameUtils.getInstance().setSpriteFrameByUrl(this.winIcon, winInfo.rewardGiftIcon);  //获得礼物的icon
        GameUtils.getInstance().setString(this.winName, `${winInfo.rewardGiftName}x${winInfo.rewardGiftCnt}`); //获得礼物的名称和数量

        // this.scheduleOnce(this._timeClose, 5);
    }

    private _timeClose() {
        this.onClickClose();
    }

    protected _unrealOnDisable() {
        super._unrealOnDisable();
        this.unschedule(this._timeClose);
        // this.winCattle.skeletonData = null;
    }

    update(deltaTime: number) {

    }
}

