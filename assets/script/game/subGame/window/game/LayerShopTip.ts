import { _decorator, Component, instantiate, Label, debug, Node, ScrollView, Toggle, UITransform, RichText } from 'cc';
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
    @property(RichText)
    tipLabel: RichText = null;

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
        let gmd = SubGameCtrl.getInstance().getGameModel();
        let need = this._winData.count * gmd.stakeGiftPrice;
        GameUtils.getInstance().setString(this.tipLabel, `本次还需要<color=#ac4517>${need}</color>钻石兑换使用灵石参与玩法。\n使用失败会兑换到灵石余额中！`);
        GameUtils.getInstance().setString(this.leaves, this._winData.count);
        GameUtils.getInstance().setString(this.diamond, this._winData.count * gmd.stakeGiftPrice);
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

