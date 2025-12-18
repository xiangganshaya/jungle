import { _decorator, Component, Label, Node, Skeleton, sp, Sprite, tween, Tween, UITransform, Vec3 } from 'cc';
import { AnimateInfoIF, GameState } from '../../../net/netMessage/MessageModes';
import SpineManager from 'db://assets/script/manager/SpineManager';
import WindowManager from 'db://assets/script/manager/WindowManager';
import { WinId } from 'db://assets/script/config/WindowConfig';
import GameUtils from 'db://assets/script/utils/GameUtils';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
const { ccclass, property } = _decorator;



@ccclass('FoodItem')
export class FoodItem extends Component {
    @property(sp.Skeleton)
    foodAni: sp.Skeleton = null;
    @property(Sprite)
    food: Sprite = null;
    @property(Sprite)
    buyCountBg: Sprite = null;
    @property(Label)
    buyCount: Label = null;
    @property(Label)
    foodName: Label = null;


    // LIFE-CYCLE CALLBACKS:
    private _info: AnimateInfoIF = null;

    //---------------

    start() {

    }

    public async setItemInfo(info: AnimateInfoIF) {
        this._info = info;

        GameUtils.getInstance().setString(this.foodName, this._info.foodName);

        SpineManager.getInstance().playSpineAni(this.foodAni, null, "run", true, false);

        this.updateItemBetInfo(0);

        this.playFoodAni();
    }

    public updateItemBetInfo(count: number) {
        if (count <= 0) {
            this.buyCountBg.node.active = false;
            this.buyCount.node.active = false;
            return;
        }

        this.buyCountBg.node.active = true;
        this.buyCount.node.active = true;

        GameUtils.getInstance().setString(this.buyCount, `x${count}`);
    }

    public playFoodAni() {
        this.food.node.active = true;
        // Tween.stopAllByTarget(this.food.node);
        // tween(this.food.node)
        //     .repeatForever(
        //         tween()
        //             .by(0.5,{position: new Vec3(0, 15, 0) })
        //             .by(0.5,{position: new Vec3(0, -15, 0) })
        //     )
        //     .start();
    }

    public stopFoodAni() {
        // Tween.stopAllByTarget(this.food.node);
        this.food.node.active = false;
    }

    public getFoodId() {
        return this._info.animalId;
    }

    public getFoodWPos() {
        return this.food.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
    }

    onClickFood() {
        let gmd = SubGameCtrl.getInstance().getGameModel();
        if (gmd.status != GameState.INGAME) {
            //停止下单
            WindowManager.getInstance().showSystemTip("当前不能下单");
            return;
        }
        WindowManager.getInstance().showWindow(WinId.LayerBuy, this._info);
    }

    // update(deltaTime: number) {

    // }
}

