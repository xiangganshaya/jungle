import { _decorator, Component, instantiate, Label, debug, Node, ScrollView, Toggle, UITransform } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import { GameEvent } from '../../../../config/GameEventConfig';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('LayerShopTip')
export class LayerShopTip extends GameBaseWindow {
    @property(Label)
    diamond: Label = null;
    @property(Label)
    leaves: Label = null;

    // LIFE-CYCLE CALLBACKS:

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerShopTip;
        this.setZIndex(LayerZindex.Window);


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
        GameUtils.getInstance().setString(this.leaves, this._winData.count);
        GameUtils.getInstance().setString(this.diamond, this._winData.count * 100);
    }

    onClickOK() {
        SubGameCtrl.getInstance().buyLeavesAndStake(this._winData.id, this._winData.count, this._winData.total);

        this.onClickClose();
    }

    // update(deltaTime: number) {

    // }

    onDispathcGameEvent(eventId: GameEvent, eventData: any): void {
        switch (eventId) {
            // case GameEvent.EVENT_GAME_UPDATE_SHOP:
            //     {

            //         // console.log('EVENT_GAME_UPDATE_SHOP', eventData);
            //         this._updateShopInfo(eventData);
            //     }
            //     break;
            case GameEvent.EVENT_GAME_UPDATE_WALLET:
                {
                    // this._updateCoin();
                }
                break;
            default:
                super.onDispathcGameEvent(eventId, eventData);
                break
        }
    }
}

