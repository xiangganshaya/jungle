import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { BuyRecordIF } from '../../../net/netMessage/MessageModes';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('BuyRecordFoodItem')
export class BuyRecordFoodItem extends Component {
    @property(Label)
    totalCount: Label = null;

    // LIFE-CYCLE CALLBACKS:



    //---------------

    start() {

    }

    public async setItemInfo(count: number) {
        GameUtils.getInstance().setString(this.totalCount, `x${count}`);
    }

    // update(deltaTime: number) {

    // }
}

