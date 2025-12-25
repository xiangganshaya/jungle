import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { BuyRecordIF } from '../../../net/netMessage/MessageModes';
import { BuyRecordFoodItem } from './BuyRecordFoodItem';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('BuyRecordItem')
export class BuyRecordItem extends Component {
    @property(Sprite)
    animalIcon: Sprite = null;
    @property(Sprite)
    statusTipBg: Sprite = null;
    @property(Label)
    totalCount: Label = null;
    @property(Label)
    statusTip: Label = null;
    @property(Label)
    timeTip: Label = null;
    @property(BuyRecordFoodItem)
    foods: BuyRecordFoodItem[] = [];

    // LIFE-CYCLE CALLBACKS:


    //---------------

    start() {

    }

    public async setItemInfo(info: BuyRecordIF) {
        GameUtils.getInstance().setSpriteFrameByName(this.animalIcon, "image/images/r-" + info.animalId);
        if (info.rewardDetail) {
            GameUtils.getInstance().setSpriteFrameByName(this.statusTipBg, "image/images/tip_fail_bg");
            GameUtils.getInstance().setString(this.statusTip, "交易成功");
        } else {
            GameUtils.getInstance().setSpriteFrameByName(this.statusTipBg, "image/images/tip_suc_bg");
            GameUtils.getInstance().setString(this.statusTip, "交易失败");
        }
        let leafCount = 0
        for (let i = 0; i < this.foods.length; i++) {
            if (i < info.buyRecords.length) {
                leafCount += info.buyRecords[i].cnt;
                this.foods[i].node.active = true;
                this.foods[i].setItemInfo(info.buyRecords[i].cnt);
            } else {
                this.foods[i].node.active = false;
            }
        }

        GameUtils.getInstance().setString(this.totalCount, `x${leafCount}`);

    }

    // update(deltaTime: number) {

    // }
}

