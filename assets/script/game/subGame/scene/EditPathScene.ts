import { _decorator, color, Component, EditBox, EventTouch, Graphics, instantiate, JsonAsset, Label, log, Node, path, sp, Sprite, v2, v3, Vec2, Vec3 } from 'cc';
import { AnimalPath, AnimalPathInfo } from '../subUtils/SubGameModel';
import Bezier from '../window/common/Bezier';
import GameUtils from '../../../utils/GameUtils';
import WindowManager from '../../../manager/WindowManager';
import HttpManager from '../net/HttpManager';
import { HttpStatus } from '../../../config/HttpConfig';
const { ccclass, property } = _decorator;

@ccclass('EditPathScene')
export class EditPathScene extends Component {
    @property(JsonAsset)
    pathConfigJson: JsonAsset = null;

    @property(sp.Skeleton)
    animal: sp.Skeleton = null;

    @property(Graphics)
    graphics: Graphics = null;
    @property(Graphics)
    graphicsPoint: Graphics = null;

    @property(Sprite)
    pointSprite: Sprite = null;

    @property(Label)
    selectBezier: Label = null;
    @property(EditBox)
    bezierPath: EditBox = null;
    @property(EditBox)
    bezierTime: EditBox = null;
    @property(Node)
    bezierStartNode: Node = null;
    @property(EditBox)
    bezierStartX: EditBox = null;
    @property(EditBox)
    bezierStartY: EditBox = null;
    @property(EditBox)
    bezierMidX: EditBox = null;
    @property(EditBox)
    bezierMidY: EditBox = null;
    @property(EditBox)
    bezierEndX: EditBox = null;
    @property(EditBox)
    bezierEndY: EditBox = null;



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

    private _selectPathIndex: number = 0;
    private _selectBezierIndex: number = 0;
    private _bezierPoints: Node[] = [];
    //---------------

    async start() {
        this._getNetGamePathInfo();

        // this.setItemInfo();
    }

    private async _getNetGamePathInfo() {
        return new Promise<string>((resolve, reject) => {
            let url = window.location.href;
            let idx = url.lastIndexOf("/");
            url = url.substring(0, idx + 1) + "path.json" + "?t=" + new Date().getTime();
            HttpManager.getInstance().httpGet(url, (status, response) => {
                if (status == HttpStatus.OK_200 || status == HttpStatus.PartialContent_206) {
                    this.pathConfigJson.json = response;

                    this.setItemInfo();

                    resolve("ok");
                }
            }, "json");
        });

    }

    public setItemInfo() {
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
        this._pathConfig = this.pathConfigJson.json[this._selectPathIndex];
        if (!this._pathConfig) {
            this.stopRun();
            this.selectBezier.string = `未找到路径配置(${this._selectPathIndex})`;
            return;
        }

        this._isRuning = false;
        this._selectBezierIndex = 0;

        this._drawPath();

        this.node.setPosition(this._startPos.x, this._startPos.y);

        this._isEating = false;

        this._updateTopInfo();
    }

    private _createPath() {
        if (!this._pathConfig) {
            return;
        }
        let path: AnimalPathInfo = this._pathConfig.path[0];
        this._startPos = v2(path.pos[0][0], path.pos[0][1]);
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
                let bezier = Bezier.createBezier(points, pc.time, true);
                let length = bezier.getBezierLength();
                pc.length = length;
                this._paths.push(bezier);
            }
        }

        this._curPathIndex = 0;
        this._curPathStartTime = 0;
        this._x = 0;
        this._y = 0;

        this.pathConfigJson.json[this._selectPathIndex] = this._pathConfig;
    }

    private _drawPath() {
        if (!this._pathConfig) {
            return;
        }

        this._createPath();

        log("pathConfig", JSON.stringify(this._pathConfig));

        this.graphics.clear();
        this.graphicsPoint.clear();
        // this.graphics.strokeColor = color(255, 0, 0, 255);
        this.graphics.lineWidth = 8;
        this.graphicsPoint.lineWidth = 8;

        for (let i = 0; i < this._bezierPoints.length; i++) {
            this._bezierPoints[i].removeFromParent();
        }
        this._bezierPoints.length = 0;

        let totalTime = 0;
        for (let i = 0; i < this._paths.length; i++) {
            totalTime += this._paths[i].getTimeLen();
        }

        let dt = 0.1;
        let prePos: Vec2 = null;
        for (let t = 0; t <= totalTime; t += dt) {
            let pathIndex = 0;
            if (this._bezierPoints.length <= 0) {
                let tps = this._paths[0].getPoint(0, true);
                let p02 = this._transform(tps[0]);
                let point = instantiate(this.pointSprite.node);
                point.active = true;
                point.parent = this.pointSprite.node.parent;
                point.setPosition(p02.x, p02.y);
                point.name = `${pathIndex}`
                this._bezierPoints.push(point);
            }
            let timeLen = this._paths[0].getTimeLen();
            while (t > timeLen) {
                pathIndex++;
                if (pathIndex >= this._paths.length) {
                    break;
                }
                //在路径端点画个点
                let tps = this._paths[pathIndex - 1].getPoint(this._paths[pathIndex - 1].getTimeLen(), true);
                let p02 = this._transform(tps[0]);
                // this.graphicsCircle.circle(p02.x, p02.y, 6);
                // this.graphicsCircle.fill();
                let point = instantiate(this.pointSprite.node);
                point.active = true;
                point.parent = this.pointSprite.node.parent;
                point.setPosition(p02.x, p02.y);
                point.name = `${pathIndex}`
                this._bezierPoints.push(point);

                timeLen += this._paths[pathIndex].getTimeLen();
            }
            if (pathIndex >= this._paths.length) {
                break;
            }

            let path = this._paths[pathIndex];
            let tInPath = t;
            if (pathIndex > 0) {
                let preTimeLen = 0;
                for (let j = 0; j < pathIndex; j++) {
                    preTimeLen += this._paths[j].getTimeLen();
                }
                tInPath = t - preTimeLen;
            }

            let tps = path.getPoint(tInPath, true);
            let p02 = this._transform(tps[0]);

            if (prePos) {
                this.graphics.moveTo(prePos.x, prePos.y);
                this.graphics.lineTo(p02.x, p02.y);
            }
            prePos = p02;
        }

        this.graphics.stroke();

        //绘制点的连线
        let tps = this._paths[0].getPoint(0, true);
        let p02 = this._transform(tps[0]);
        this.graphicsPoint.moveTo(p02.x, p02.y);
        for (let i = 0; i < this._paths.length; i++) {
            let bezierPoints = this._paths[i].getPoints();
            for (let j = 0; j < bezierPoints.length; j++) {
                let p = this._transform(bezierPoints[j]);
                this.graphicsPoint.lineTo(p.x, p.y);
            }
        }
        this.graphicsPoint.stroke();
        //在各个点上画点
        this.graphicsPoint.moveTo(p02.x, p02.y);
        for (let i = 0; i < this._paths.length; i++) {
            let bezierPoints = this._paths[i].getPoints();
            for (let j = 0; j < bezierPoints.length; j++) {
                let p = this._transform(bezierPoints[j]);
                this.graphicsPoint.circle(p.x, p.y, 8);
            }
        }
        this.graphicsPoint.fill();

    }

    private _playRun(isEat: boolean = true) {
        if (!this._pathConfig) {
            return;
        }
        this.animal.node.active = true;
        this._aliveTime = 0;
        this._curPathIndex = 0;
        this._curPathStartTime = 0;
        this._isRuning = true;
    }

    public stopRun() {
        this._isRuning = false;
        this.animal.node.active = false;
    }

    public runToFood(foodId: number) {
        if (!this._pathConfig) {
            return;
        }
        this.animal.node.active = true;
        this._playRun(true);
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

    private _download(name, text) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        a.download = name; document.body.appendChild(a); a.click(); a.remove();
    }

    private _updateTopInfo() {
        let pathIndex = this._selectBezierIndex;
        let posPath: AnimalPathInfo = this._pathConfig.path[pathIndex];
        this.selectBezier.string = `当前选择了第 ${this._selectPathIndex}中的第${pathIndex} 条 曲线`;
        this.bezierStartNode.active = (pathIndex == 0);

        this.bezierTime.string = "";
        this.bezierStartX.string = "";
        this.bezierStartY.string = "";
        this.bezierMidX.string = "";
        this.bezierMidY.string = "";
        this.bezierEndX.string = "";
        this.bezierEndY.string = "";

        if (pathIndex == 0) {
            this.bezierTime.placeholder = posPath.time.toString();
            this.bezierStartX.placeholder = posPath.pos[0].toString();
            this.bezierStartY.placeholder = posPath.pos[1].toString();
            this.bezierMidX.placeholder = posPath.pos[2].toString();
            this.bezierMidY.placeholder = posPath.pos[3].toString();
            this.bezierEndX.placeholder = posPath.pos[4].toString();
            this.bezierEndY.placeholder = posPath.pos[5].toString();
        } else {
            this.bezierTime.placeholder = posPath.time.toString();
            this.bezierMidX.placeholder = posPath.pos[0].toString();
            this.bezierMidY.placeholder = posPath.pos[1].toString();
            this.bezierEndX.placeholder = posPath.pos[2].toString();
            this.bezierEndY.placeholder = posPath.pos[3].toString();
        }
    }

    onEditBoxPathEnd() {
        log("onEditBoxPathEnd")
        let t = Number(this.bezierPath.placeholder);
        if (this.bezierPath.string != "") {
            t = Number(this.bezierPath.string);
        }
        this._selectPathIndex = t;

        this.setItemInfo();
    }

    onEditBoxTimeEnd() {
        log("onEditBoxTimeEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let t = Number(this.bezierTime.placeholder).toFixed(2);
        if (this.bezierTime.string != "") {
            t = Number(this.bezierTime.string).toFixed(2);
        }
        posPath.time = Number(t);

        this._drawPath();
    }

    onEditBoxStartXEnd() {
        log("onEditBoxStartXEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierStartX.placeholder).toFixed(2);
        if (this.bezierStartX.string != "") {
            v = Number(this.bezierStartX.string).toFixed(2);
        }
        posPath.pos[0] = Number(v);

        this._drawPath();
    }

    onEditBoxStartYEnd() {
        log("onEditBoxStartYEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierStartY.placeholder).toFixed(2);
        if (this.bezierStartY.string != "") {
            v = Number(this.bezierStartY.string).toFixed(2);
        }
        posPath.pos[1] = Number(v);

        this._drawPath();
    }

    onEditBoxMidXEnd() {
        log("onEditBoxMidXEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierMidX.placeholder).toFixed(2);
        if (this.bezierMidX.string != "") {
            v = Number(this.bezierMidX.string).toFixed(2);
        }
        if (this._selectBezierIndex == 0) {
            posPath.pos[2] = Number(v);
        } else {
            posPath.pos[0] = Number(v);
        }

        this._drawPath();
    }

    onEditBoxMidYEnd() {
        log("onEditBoxMidYEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierMidY.placeholder).toFixed(2);
        if (this.bezierMidY.string != "") {
            v = Number(this.bezierMidY.string).toFixed(2);
        }
        if (this._selectBezierIndex == 0) {
            posPath.pos[3] = Number(v);
        } else {
            posPath.pos[1] = Number(v);
        }

        this._drawPath();
    }

    onEditBoxEndXEnd() {
        log("onEditBoxEndXEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierEndX.placeholder).toFixed(2);
        if (this.bezierEndX.string != "") {
            v = Number(this.bezierEndX.string).toFixed(2);
        }
        if (this._selectBezierIndex == 0) {
            posPath.pos[4] = Number(v);
        } else {
            posPath.pos[2] = Number(v);
        }

        this._drawPath();
    }

    onEditBoxEndYEnd() {
        log("onEditBoxEndYEnd")
        if (!this._pathConfig) {
            return;
        }
        let posPath: AnimalPathInfo = this._pathConfig.path[this._selectBezierIndex];
        let v = Number(this.bezierEndY.placeholder).toFixed(2);
        if (this.bezierEndY.string != "") {
            v = Number(this.bezierEndY.string).toFixed(2);
        }
        if (this._selectBezierIndex == 0) {
            posPath.pos[5] = Number(v);
        } else {
            posPath.pos[3] = Number(v);
        }

        this._drawPath();
    }

    onClickBezier(event: EventTouch) {
        log("onClickBezier", event.target.name);
        if (!this._pathConfig) {
            return;
        }
        this._selectBezierIndex = Number(event.target.name);
        this._updateTopInfo();
    }

    onClickSave() {
        for (const key in this.pathConfigJson.json) {
            let jd: AnimalPath = this.pathConfigJson.json[key];
            let totalTime = 0;
            let totalLength = 0;
            for (let i = 0; i < jd.path.length; i++) {
                totalTime += jd.path[i].time;
                totalLength += jd.path[i].length;
            }
            jd.totalTime = totalTime;
            jd.totalLength = totalLength;
        }

        this._download("path.json", JSON.stringify(this.pathConfigJson.json));
    }

    onClickRun() {
        this.runToFood(0);
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
                WindowManager.getInstance().showSystemTip("动物静止");
            }
            this._isEating = true;

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
        // let drc = this.animal.node.parent.getComponent(UITransform).contentSize;
        let newPos = v3(this._x, this._y);
        // cc.log("FishObject:newPos",newPos.x, newPos.y)
        this.animal.node.setPosition(newPos);

        let rot = GameUtils.getInstance().getDegreeFromRadian(this._angle);
        // cc.log("newRad",newRad, "rot",rot);

        rot = Math.floor(rot + 360) % 360; //使角度在 [0,360]
        if (rot % 90 == 0) {
            //四个角度时，角度保持原来的
        } else {
            if (this._isModelRotation) {
                GameUtils.getInstance().setAngle(this.animal.node, -rot);//creator 新加的angle 与 rotation相反数
            } else {
                // cc.log("new rot",rot);
                if (rot >= 90 && rot < 270) {
                    this.animal.node.setScale(1, 1, 1);
                } else {
                    this.animal.node.setScale(-1, 1, 1);
                }
            }
        }
    }
}

