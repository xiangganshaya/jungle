import { _decorator, Component, instantiate, Label, debug, Node, ScrollView, Toggle, UITransform } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import { GameEvent } from '../../../../config/GameEventConfig';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
const { ccclass, property } = _decorator;

@ccclass('LayerShopTip')
export class LayerShopTip extends GameBaseWindow {


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

    }

    onClickOK() {
        SubGameCtrl.getInstance().buyLeavesAndStake(this._winData, 1);
        
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

