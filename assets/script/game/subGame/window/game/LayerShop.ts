import { _decorator, Component, instantiate, Label, debug, Node, ScrollView, Toggle, UITransform, EditBox, log, RichText } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import { GameEvent } from '../../../../config/GameEventConfig';
import GameUtils from 'db://assets/script/utils/GameUtils';
import UserManager from '../../subUtils/UserManager';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import WindowManager from 'db://assets/script/manager/WindowManager';
import SubGameUtil from '../../subUtils/SubGameUtil';
const { ccclass, property } = _decorator;

@ccclass('LayerShop')
export class LayerShop extends GameBaseWindow {

    @property(EditBox)
    itemCountEditBox: EditBox = null;

    // @property(Label)
    // buyLabel: Label = null; //购买按钮

    @property(Label)
    userBlance: Label = null; //用户余额

    @property(RichText)
    tipLabel: RichText = null;

    // LIFE-CYCLE CALLBACKS:

    private _exchangeCount = 1;

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerShop;
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
        this._exchangeCount = 1;
        let gmd = SubGameCtrl.getInstance().getGameModel();
        GameUtils.getInstance().setString(this.tipLabel, `每${gmd.stakeGiftPrice}钻石可以兑换1灵石！`);
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
        GameUtils.getInstance().setString(this.userBlance, `我的钻石余额: ${userInfo.diamond}`); //用户余额


    }

    private _getRangeCount(count: number) {
        let gm = SubGameCtrl.getInstance().getGameModel();
        count = Math.floor(count);
        if (count < 1) {
            count = 1;
        }
        // if (count > gm.stakeGiftBuyMax) {
        //     count = gm.stakeGiftBuyMax;
        // }

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

    onClickAdd10() {
        this._exchangeCount+=10;
        this._exchangeCount = this._getRangeCount(this._exchangeCount);
        this._updateCostInfo();
    }

    onClickAdd100() {
        this._exchangeCount+=100;
        this._exchangeCount = this._getRangeCount(this._exchangeCount);
        this._updateCostInfo();
    }

    onClickBuy() {
        // let info: ExchangeGoodsForm = this._winData;

        // let gm = SubGameCtrl.getInstance().getGameModel();
        // let userInfo = UserManager.getInstance().getUserInfo();
        // if (this._exchangeCount * 100 > userInfo.diamond_balance) {
        //     SubGameUtil.getInstance().jumpRechargeFun();
        //     // WindowManager.getInstance().showSystemTip("钻石不足!");

        //     try {
        //         (kk as any).goCommon({
        //             code: 100004,
        //         });
        //     } catch (error) {

        //     }
        //     return;
        // }

        SubGameCtrl.getInstance().buyLeaves(this._exchangeCount);

        this.onClickClose();
    }

    onClickToRechargeApp() {
        // log("onClickToRechargeApp");
        SubGameUtil.getInstance().jumpRechargeFun();
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

