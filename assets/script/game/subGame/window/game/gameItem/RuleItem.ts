import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { RuleItemIF } from '../../../net/netMessage/MessageModes';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('RuleItem')
export class RuleItem extends Component {
    @property(Sprite)
    animalIcon: Sprite = null;
    @property(Sprite)
    foodIcon: Sprite = null;
    @property(Label)
    animalName: Label = null;
    @property(Label)
    foodName: Label = null;
    @property(Label)
    probability: Label = null;

    // LIFE-CYCLE CALLBACKS:


    //---------------

    start() {

    }

    public async setItemInfo(info: RuleItemIF) {
        GameUtils.getInstance().setSpriteFrameByName(this.animalIcon, "image/images/r-" + info.animalId);
        GameUtils.getInstance().setSpriteFrameByName(this.foodIcon, "image/images/d-" + info.animalId);

        GameUtils.getInstance().setString(this.animalName, info.animalName);
        GameUtils.getInstance().setString(this.foodName, info.foodName);
        GameUtils.getInstance().setString(this.probability, `${info.probability}%`);
    }

    // update(deltaTime: number) {

    // }
}

