import { _decorator, Component, Node, sp, tween, Tween, UITransform, Vec3 } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import SpineManager from 'db://assets/script/manager/SpineManager';
import GameEventManager from 'db://assets/script/manager/GameEventManager';
import { GameEvent } from 'db://assets/script/config/GameEventConfig';
const { ccclass, property } = _decorator;

const spinePaths = {
    "1": "spine/huangyidantong/huangyidantong",
    "2": "spine/lanyidantong/lanyidantong",
    "3": "spine/baiyidantong/baiyidantong",
    "4": "spine/neimendizi/neimendizi",
    "5": "spine/qinchuandizi/qinchuandizi",
    "6": "spine/zongmenzhanglao/zongmenzhanglao",
    "7": "spine/zongmenzhangjiao/zongmenzhangjiao",
    "8": "spine/taishangzhanglao/taishangzhanglao",
}

const speed = 120;

@ccclass('AnimalItem')
export class AnimalItem extends Component {
    @property(sp.Skeleton)
    animalAni: sp.Skeleton = null;
    @property(sp.Skeleton)
    effectAni: sp.Skeleton = null;


    // LIFE-CYCLE CALLBACKS:

    private _paths: Vec3[] = [];
    private _pathIndex = 0;
    private _endPathIndex = 0;

    //---------------

    start() {

    }

    public async setItemInfo(animalId: number, paths: Vec3[]) {
        this.effectAni.node.active = false;

        this._paths = paths;

        let skp = spinePaths[animalId];
        if (!skp) {
            this.node.active = false;
            return;
        }
        this.animalAni.paused = true;
        let skd = await SpineManager.getInstance().getSkeletonData(skp);
        this.animalAni.skeletonData = skd;
        this.node.active = true;
        SpineManager.getInstance().playSpineAni(this.animalAni, null, "run", true, false);
    }

    private _playRun() {
        this.node.active = true;
        this.animalAni.node.active = true;
        this.effectAni.node.active = false;
        Tween.stopAllByTarget(this.node);

        this._pathIndex++;
        if (this._pathIndex > this._endPathIndex) {
            GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_RESULT);
            return;
        }
        let pathPos = this._paths[this._pathIndex];
        if (!pathPos) {
            this.node.active = false;
            return;
        }
        let curPos = this.node.getPosition();
        if (pathPos.x > curPos.x) {
            this.node.setScale(-1, 1)
        } else {
            this.node.setScale(1, 1)
        }
        let distance = curPos.subtract(pathPos).length();

        tween(this.node)
            .to(distance / speed, { position: pathPos })
            .call(() => {
                this._playRun();
            })
            .start();

    }

    public stopRun() {
        Tween.stopAllByTarget(this.node);
        this.node.active = false;
    }

    public runToFood(foodId: number) {
        this.node.setPosition(this._paths[0]);
        this.node.active = true;

        if (foodId <= 0 || foodId >= this._paths.length) {
            this._endPathIndex = this._paths.length - 1;
        } else {
            this._endPathIndex = foodId;
        }
        this._pathIndex = 0;

        this._playRun();
    }

    public playEatFood(foodId: number, foodPos: Vec3) {
        if (foodId <= 0 || foodId >= this._paths.length) {
            this.node.active = false;
            return;
        }
        let pathPos = this._paths[foodId];
        if (!pathPos) {
            this.node.active = false;
            return;
        }
        this.node.setPosition(pathPos);
        this.node.active = true;
        this.animalAni.node.active = true;

        if (foodPos.x > pathPos.x) {
            this.node.setScale(-1, 1)
        } else {
            this.node.setScale(1, 1)
        }

        SpineManager.getInstance().playSpineAni(this.animalAni, () => {
            this.node.active = false;
            // SpineManager.getInstance().playSpineAni(this.animalAni, null, "run", true, false);
        }, "take", false, true);
    }

    public playEatFoodEffect() {
        this.effectAni.node.active = true;
        SpineManager.getInstance().playSpineAni(this.effectAni, null, "run", false, true);
    }

    public getEatEffectWPos() {
        return this.effectAni.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
    }

    // update(deltaTime: number) {

    // }
}

