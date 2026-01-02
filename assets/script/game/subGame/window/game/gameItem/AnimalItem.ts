import { _decorator, Component, JsonAsset, Node, sp, tween, Tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import SubGameCtrl from '../../../subCtrls/SubGameCtrl';
import SpineManager from 'db://assets/script/manager/SpineManager';
import GameEventManager from 'db://assets/script/manager/GameEventManager';
import { GameEvent } from 'db://assets/script/config/GameEventConfig';
import { AnimalPath, AnimalPathInfo } from '../../../subUtils/SubGameModel';
import Bezier from '../../common/Bezier';
import GameUtils from 'db://assets/script/utils/GameUtils';
import ConfigManager from 'db://assets/script/manager/ConfigManager';
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

const speed = 130;

@ccclass('AnimalItem')
export class AnimalItem extends Component {
    @property(sp.Skeleton)
    animalAni: sp.Skeleton = null;
    @property(sp.Skeleton)
    effectAni: sp.Skeleton = null;
    @property(JsonAsset)
    pathConfigJson: JsonAsset = null;


    // LIFE-CYCLE CALLBACKS:

    private _isModelRotation: boolean = false;
    private _pathConfig: AnimalPath = null;
    private _paths: Bezier[] = [];
    private _startPos: Vec2 = Vec2.ZERO;
    private _bornPos: Vec2 = Vec2.ZERO;
    private _curPathIndex: number = 0;
    private _curPathStartTime: number = 0;
    private _x: number = 0;
    private _y: number = 0;
    private _rotation: number = 0;
    private _angle: number = 0;
    private _isRuning: boolean = false;
    private _aliveTime: number = 0;

    private _isEating: boolean = false;
    //---------------

    start() {

    }

    public async setItemInfo(animalId: number) {
        this._isModelRotation = false;
        this._startPos = Vec2.ZERO;
        this._bornPos = Vec2.ZERO;
        this._paths = [];
        this._curPathIndex = 0;
        this._curPathStartTime = 0;
        this._x = 0;
        this._y = 0;
        this._rotation = 0;
        this._aliveTime = 0;
        this._pathConfig = this.pathConfigJson.json[animalId];
        if (!this._pathConfig) {
            this.stopRun();
            return;
        }

        this._isRuning = false;
        this._createPath();
        this.node.setPosition(this._startPos.x, this._startPos.y);

        this._isEating = false;
        this.effectAni.node.active = false;

        let skp = spinePaths[animalId];
        if (!skp) {
            this.node.active = false;
            return;
        }
        this.animalAni.paused = true;
        let skd = await SpineManager.getInstance().getSkeletonData(skp);
        this.animalAni.skeletonData = skd;
        // this.node.active = true;
        SpineManager.getInstance().playSpineAni(this.animalAni, null, "run", true, false);
    }

    private _createPath() {
        let startPath: AnimalPathInfo = this._pathConfig.path[0];
        this._startPos = v2(startPath.pos[0][0], startPath.pos[0][1]);
        this._paths = [];
        if (this._paths.length <= 0) {
            this._paths = [];
            let lastPos = Vec2.ZERO;
            // this._pathConfig.path = [{pos:[1456,405,1075,-145,421,604],time:5.6},{pos:[332,701,511,667],time:0.5},{pos:[1176,555,1076,337],time:3.6},{pos:[949,33,657,58],time:3.6},{pos:[434,87,562,130],time:0.5},{pos:[687,182,465,357],time:2.3},{pos:[355,455,339,309],time:0.5},{pos:[317,101,-171,207],time:3.3}];
            for (let i = 0; i < this._pathConfig.path.length; i++) {
                const pc: AnimalPathInfo = this._pathConfig.path[i];
                let points: Vec2[] = [];
                if (i == 0) {
                    points.push(v2(pc.pos[0], pc.pos[1]));
                    points.push(v2(pc.pos[2], pc.pos[3]));
                    lastPos = v2(pc.pos[4], pc.pos[5]);
                    points.push(lastPos);
                } else {
                    points.push(lastPos);
                    points.push(v2(pc.pos[0], pc.pos[1]));
                    lastPos = v2(pc.pos[2], pc.pos[3]);
                    points.push(lastPos);
                }
                this._paths.push(Bezier.createBezier(points, pc.time, true));
            }
        }

        this._curPathIndex = 0;
        this._curPathStartTime = 0;
        this._x = 0;
        this._y = 0;
    }

    private _playRun(isEat: boolean = true) {
        this.node.active = true;
        // this.animalAni.node.active = true;
        // this.effectAni.node.active = false;
        // Tween.stopAllByTarget(this.node);

        // this._pathIndex++;
        // if (isEat && this._pathIndex > this._endPathIndex) {
        //     this._pathIndex--;
        //     GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_RESULT);
        //     return;
        // }
        // let pathPos = this._paths[this._pathIndex];
        // if (!pathPos) {
        //     this.node.active = false;
        //     return;
        // }
        // let curPos = this.node.getPosition();
        // if (pathPos.x > curPos.x) {
        //     this.node.setScale(-1, 1)
        // } else {
        //     this.node.setScale(1, 1)
        // }
        // let distance = curPos.subtract(pathPos).length();

        // tween(this.node)
        //     .to(distance / speed, { position: pathPos })
        //     .call(() => {
        //         this._playRun(isEat);
        //     })
        //     .start();

        this._isRuning = true;
    }

    public stopRun() {
        // Tween.stopAllByTarget(this.node);
        // this.node.active = false;

        this._isRuning = false;
        this.node.active = false;
    }

    public runToFood(foodId: number) {
        // this.node.setPosition(this._paths[0]);
        this.node.active = true;

        // if (foodId <= 0 || foodId >= this._paths.length) {
        //     this._endPathIndex = this._paths.length - 1;
        // } else {
        //     this._endPathIndex = foodId;
        // }
        // this._pathIndex = 0;

        this._playRun(true);
    }

    public playEatFood(foodId: number, foodPos: Vec3) {
        if (foodId <= 0 || foodId >= this._paths.length) {
            this.node.active = false;
            return;
        }
        // let pathPos = this._paths[foodId];
        // if (!pathPos) {
        //     this.node.active = false;
        //     return;
        // }
        // this.node.setPosition(pathPos);
        let pathPos = this.node.getPosition();
        this.node.active = true;
        this.animalAni.node.active = true;

        if (foodPos.x > pathPos.x) {
            this.node.setScale(-1, 1)
        } else {
            this.node.setScale(1, 1)
        }

        SpineManager.getInstance().playSpineAni(this.animalAni, () => {
            // this.node.active = false;
            SpineManager.getInstance().playSpineAni(this.animalAni, null, "run", true, false);
        }, "take", false, true);
    }

    public playEatFoodEffect() {
        this.effectAni.node.active = true;
        // SpineManager.getInstance().playSpineAni(this.effectAni, null, "run", false, true);
        SpineManager.getInstance().playSpineAni(this.animalAni, null, "run", true, false);
        this._playRun(false);
    }

    public getEatEffectWPos() {
        return this.effectAni.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
    }

    private _transform(p: Vec2) {
        if (this._rotation != 0) {
            let dx = p.x - this._startPos.x;
            let dy = p.y - this._startPos.y;
            let ra = GameUtils.getInstance().getRadianFromDegree(this._rotation);
            p.x = this._startPos.x + dx * Math.cos(ra) + dy * Math.sin(ra);
            p.y = this._startPos.y + dy * Math.cos(ra) - dx * Math.sin(ra);
        }

        p.x += this._bornPos.x;
        p.y += this._bornPos.y;

        return p;
    }

    update(dt: number) {
        if (!this._isRuning) {
            return;
        }
        this._aliveTime += dt;

        let path = this._paths[this._curPathIndex];
        while (path) {
            if (this._aliveTime < (this._curPathStartTime + path.getTimeLen())) {
                break;
            }

            this._curPathStartTime += path.getTimeLen();
            this._curPathIndex++;
            path = this._paths[this._curPathIndex];
        }

        if (!path) {
            this.stopRun();
            return;
        }

        if (path.isStand()) {
            if (!this._isEating) {
                GameEventManager.getInstance().dispatchGameEvent(GameEvent.EVENT_GAME_RESULT);
            }
            this._isEating = true;

            return;

            let tps = path.getPoint(this._curPathStartTime, true);
            let p02 = this._transform(tps[0]);
            // let p01 = this._transform(tps[1]);

            //不动时，角度保持原来的值
            // this._angle = Math.atan2(p02.y - p01.y, p02.x - p01.x);
            this._x = p02.x;
            this._y = p02.y;

        } else {
            let tps = path.getPoint(this._aliveTime - this._curPathStartTime, true);
            let p02 = this._transform(tps[0]);
            let p01 = this._transform(tps[1]);

            this._angle = Math.atan2(p02.y - p01.y, p02.x - p01.x);
            this._x = p02.x;
            this._y = p02.y;
        }

        // cc.log("this._angle",this._angle, this._x, this._y);

        // let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
        // let drc = this.node.parent.getComponent(UITransform).contentSize;
        let newPos = v3(this._x, this._y);
        // cc.log("FishObject:newPos",newPos.x, newPos.y)
        this.node.setPosition(newPos);

        let rot = GameUtils.getInstance().getDegreeFromRadian(this._angle);
        // cc.log("newRad",newRad, "rot",rot);

        rot = Math.floor(rot + 360) % 360; //使角度在 [0,360]
        if (rot % 90 == 0) {
            //四个角度时，角度保持原来的
        } else {
            if (this._isModelRotation) {
                GameUtils.getInstance().setAngle(this.node, -rot);//creator 新加的angle 与 rotation相反数
            } else {
                // cc.log("new rot",rot);
                if (rot >= 90 && rot < 270) {
                    this.node.setScale(1, 1, 1);
                } else {
                    this.node.setScale(-1, 1, 1);
                }
            }
        }
    }
}

