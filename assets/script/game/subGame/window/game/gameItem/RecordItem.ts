import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { ServerRecordItemIF } from '../../../net/netMessage/MessageModes';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('RecordItem')
export class RecordItem extends Component {
    @property(Sprite)
    animalIcon: Sprite = null;
    @property(Sprite)
    foodIcon: Sprite = null;
    @property(Label)
    animalName: Label = null;
    @property(Label)
    foodName: Label = null;
    @property(Label)
    timeTip: Label = null;

    // LIFE-CYCLE CALLBACKS:


    //---------------

    start() {

    }

    public async setItemInfo(info: ServerRecordItemIF) {
        GameUtils.getInstance().setSpriteFrameByName(this.animalIcon, "image/images/r-" + info.animalId);
        GameUtils.getInstance().setSpriteFrameByName(this.foodIcon, "image/images/d-" + info.animalId);

        GameUtils.getInstance().setString(this.animalName, info.animalName);
        GameUtils.getInstance().setString(this.foodName, info.foodName);
        GameUtils.getInstance().setString(this.timeTip, info.screening);
    }

    // update(deltaTime: number) {

    // }
}

