import { _decorator, Component, Label, Node, Sprite } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import { ServerRecordItemIF } from '../../../net/netMessage/MessageModes';
import GameUtils from 'db://assets/script/utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('RecordItem')
export class RecordItem extends Component {
    @property(Sprite)
    bossIcon: Sprite = null;
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

    private _getTimeString(screening: string): string {
        return screening.substring(0, 4) + "-" + screening.substring(4, 6) + "-" + screening.substring(6, 8) + "\n" +
            screening.substring(8, 10) + ":" + screening.substring(10, 12) + ":" + screening.substring(12, 14);
    }

    public async setItemInfo(info: ServerRecordItemIF) {
        GameUtils.getInstance().setVisible(this.bossIcon, info.hasBoss != 0);
        GameUtils.getInstance().setSpriteFrameByName(this.animalIcon, "image/images/r-" + info.animalId);
        GameUtils.getInstance().setSpriteFrameByName(this.foodIcon, "image/images/d-" + info.animalId);

        GameUtils.getInstance().setString(this.animalName, info.animalName);
        GameUtils.getInstance().setString(this.foodName, info.foodName);
        GameUtils.getInstance().setString(this.timeTip, this._getTimeString(info.screening.toString()));
    }

    // update(deltaTime: number) {

    // }
}

