import { _decorator, Component, Label, Node, ScrollView, Sprite, tween, Tween } from 'cc';
import GameUtils from 'db://assets/script/utils/GameUtils';
import { BossWinnerItemIF } from '../../../net/netMessage/MessageModes';
const { ccclass, property } = _decorator;

@ccclass('BossWinItem')
export class BossWinItem extends Component {
    @property(ScrollView)
    scrollView: ScrollView = null;
    @property(Label)
    userName: Label = null;
    @property(Label)
    giftName: Label = null;

    // LIFE-CYCLE CALLBACKS:


    //---------------

    start() {

    }

    public async setItemInfo(info: BossWinnerItemIF) {
        GameUtils.getInstance().setString(this.userName, info.userName);
        if (info.rewardGiftCnt) {
            GameUtils.getInstance().setString(this.giftName, `${info.rewardGiftName} x${info.rewardGiftCnt}`); //获得礼物的名称
        } else {
            GameUtils.getInstance().setString(this.giftName, `${info.rewardGiftName}`); //获得礼物的名称
        }

        this._playScrollAnim();
    }

    private _playScrollAnim() {
        this.node.active = true;
        Tween.stopAllByTarget(this.scrollView.content);
        this.scrollView.scrollToPercentHorizontal(0, 0);
        tween(this.scrollView.content)
            .call(() => {
                this.scrollView.scrollToPercentHorizontal(100, 2);
            })
            .delay(2)
            .call(() => {
                this.scrollView.scrollToPercentHorizontal(0, 2);
            })
            .delay(2)
            .call(() => {
                this.scrollView.scrollToPercentHorizontal(100, 2);
            })
            .delay(2)
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    // update(deltaTime: number) {

    // }
}

