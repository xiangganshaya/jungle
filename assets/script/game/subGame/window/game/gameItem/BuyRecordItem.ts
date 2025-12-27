import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { BuyRecordIF } from '../../../net/netMessage/MessageModes';
import { BuyRecordFoodItem } from './BuyRecordFoodItem';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('BuyRecordItem')
export class BuyRecordItem extends Component {
    @property(Sprite)
    bossIcon: Sprite = null;
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
    private _getTimeString(screening: string): string {
        return screening.substring(0, 4) + "-" + screening.substring(4, 6) + "-" + screening.substring(6, 8) + " " +
            screening.substring(8, 10) + ":" + screening.substring(10, 12) + ":" + screening.substring(12, 14);
    }

    public async setItemInfo(info: BuyRecordIF) {
        GameUtils.getInstance().setVisible(this.bossIcon, false);
        GameUtils.getInstance().setSpriteFrameByName(this.animalIcon, "image/images/r-" + info.winAnimalId);
        if (info.rewardDetail && info.rewardDetail.animalId == info.winAnimalId) {
            GameUtils.getInstance().setSpriteFrameByName(this.statusTipBg, "image/images/tip_fail_bg");
            GameUtils.getInstance().setString(this.statusTip, "交易成功");
        } else {
            GameUtils.getInstance().setSpriteFrameByName(this.statusTipBg, "image/images/tip_suc_bg");
            GameUtils.getInstance().setString(this.statusTip, "交易失败");
        }
        // let leafCount = 0
        for (let i = 0; i < this.foods.length; i++) {
            if (i < info.recordDetail.length) {
                // leafCount += info.recordDetail[i].cnt;
                this.foods[i].node.active = true;
                this.foods[i].setItemInfo(info.recordDetail[i].cnt);
            } else {
                this.foods[i].node.active = false;
            }
        }

        GameUtils.getInstance().setString(this.totalCount, `x${info.costCnt}`); //总购买数量
        GameUtils.getInstance().setString(this.timeTip, this._getTimeString(info.screening.toString()));
    }

    // update(deltaTime: number) {

    // }
}

