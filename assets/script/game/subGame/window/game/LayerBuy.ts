import { _decorator, Component, instantiate, Label, debug, Node, ScrollView, Toggle, UITransform, EditBox, log, Sprite } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import { GameEvent } from '../../../../config/GameEventConfig';
import GameUtils from 'db://assets/script/utils/GameUtils';
import UserManager from '../../subUtils/UserManager';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import WindowManager from 'db://assets/script/manager/WindowManager';
import SubGameUtil from '../../subUtils/SubGameUtil';
import { AnimateInfoIF } from '../../net/netMessage/MessageModes';
const { ccclass, property } = _decorator;

@ccclass('LayerBuy')
export class LayerBuy extends GameBaseWindow {

    @property(EditBox)
    itemCountEditBox: EditBox = null;

    @property(Sprite)
    foodIcon: Sprite = null;
    @property(Label)
    foodName: Label = null;

    @property(Label)
    buyLabel: Label = null; //购买数量

    // LIFE-CYCLE CALLBACKS:

    private _exchangeCount = 1;

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerBuy;
        this.setZIndex(LayerZindex.Window);

        this.node.on(Node.EventType.TOUCH_END, this.onClickOutside, this);

    }

    start() {
        super.start();
    }

    onClickOutside() {
        this.onClickClose();
    }
    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(true);
        this._initInof();
    }

    private _initInof() {
        let foodInfo: AnimateInfoIF = this._winData;

        GameUtils.getInstance().setSpriteFrameByName(this.foodIcon, "image/images/d-" + foodInfo.id);
        GameUtils.getInstance().setString(this.foodName, `${foodInfo.foodName}`);

        this._exchangeCount = 1;
        this._updateCostInfo();
    }

    private _updateCostInfo() {

        // let info: ExchangeGoodsForm = this._winData;

        // let gm = SubGameCtrl.getInstance().getGameModel();
        // let totalPrice = this._exchangeCount * gm.stakeGiftCoin;

        // log("this._exchangeCount", totalPrice);
        // GameUtils.getInstance().setString(this.costPrice, totalPrice); //购买所需要的价格
        GameUtils.getInstance().setString(this.itemCountEditBox, this._exchangeCount); //购买数量

        let userInfo = UserManager.getInstance().getUserInfo();
        GameUtils.getInstance().setString(this.buyLabel, `${this._exchangeCount}灵石`); //用户余额

    }

    private _getRangeCount(count: number) {
        // let gm = SubGameCtrl.getInstance().getGameModel();
        count = Math.floor(count);
        if (count < 1) {
            count = 1;
        }
        if (count > 999) {
            count = 999;
        }

        return count;
    }

    onEditorBegin(editbox: EditBox) {
        WindowManager.getInstance().setFocusEditBox(editbox);
    }

    onTextChanged(text: string, editbox: EditBox) {
        let countStr = text.replace(/\D/g, ''); // 使用正则表达式过滤掉非数字字符
        let gm = SubGameCtrl.getInstance().getGameModel();
        let count = Number(countStr) || 1;
        this._exchangeCount = count;
        editbox.string = count.toString();
        // this._updateCostInfo();
        if (!/^\d+$/.test(text) && text != "") {
            WindowManager.getInstance().blurEditBox();
        }
    }

    onEditBoxEnd(editbox: EditBox) {
        WindowManager.getInstance().blurEditBox();
    }

    onClickMinus() {
        this._exchangeCount--;
        this._exchangeCount = this._getRangeCount(this._exchangeCount);
        this._updateCostInfo();
    }

    onClickAdd() {
        this._exchangeCount++;
        this._exchangeCount = this._getRangeCount(this._exchangeCount);
        this._updateCostInfo();
    }

    onClickBuy() {
        let foodInfo: AnimateInfoIF = this._winData;

        SubGameCtrl.getInstance().userStake(foodInfo.id, this._exchangeCount);

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

