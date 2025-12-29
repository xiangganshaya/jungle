import { _decorator, Component, instantiate, Label, Layout, debug, Node, ScrollView, sp, Toggle, tween, Tween, UITransform, v3, Vec3, v2, warn, Vec2, math, log, Sprite, UIOpacity, ProgressBar } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import { GameEvent } from '../../../../config/GameEventConfig';
import UserManager from '../../subUtils/UserManager';
import GameUtils from '../../../../utils/GameUtils';
import WindowManager from '../../../../manager/WindowManager';
import SubGameUtil from '../../subUtils/SubGameUtil';
import ConfigManager from '../../../../manager/ConfigManager';
import { JSB } from 'cc/env';
import GameEventManager from 'db://assets/script/manager/GameEventManager';
import { GameState, WinnerItemIF } from '../../net/netMessage/MessageModes';
import { AnimalItem } from './gameItem/AnimalItem';
import { FoodItem } from './gameItem/FoodItem';
import SpineManager from 'db://assets/script/manager/SpineManager';
import { BossWinItem } from './gameItem/BossWinItem';

const { ccclass, property } = _decorator;

@ccclass('LayerMain')
export class LayerMain extends GameBaseWindow {

    @property(Node)
    hideNode: Node = null;
    @property(Node)
    touchNode: Node = null;
    // @property(Node)
    // uiBottomNode: Node = null;
    @property(Label)
    timeLabel: Label = null;
    @property(ProgressBar)
    timeProgress: ProgressBar = null;

    @property(BossWinItem)
    bossWinItem: BossWinItem = null;
    @property(Label)
    bossLabel: Label = null;
    @property(ProgressBar)
    bossProgress: ProgressBar = null;

    @property(Node)
    boosNode: Node = null;
    @property(sp.Skeleton)
    bossAni: sp.Skeleton = null;
    @property(sp.Skeleton)
    bossTipAni: sp.Skeleton = null;

    @property(Node)
    midNode: Node = null;

    @property(Label)
    leaveCount: Label = null;

    @property(Node)
    paths: Node[] = [];
    @property(AnimalItem)
    animal: AnimalItem = null;
    @property(FoodItem)
    foods: FoodItem[] = [];
    @property(Sprite)
    food: Sprite = null;



    // LIFE-CYCLE CALLBACKS:
    private _isInit: boolean = false;

    private _paths: Vec3[] = [];
    private _gameState: GameState = GameState.NULL;
    private _tickTime: number = 0;
    private _tickTimeMax: number = 10;

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerMain;
        this.setZIndex(LayerZindex.Normal);

    }

    start() {
        super.start();

        if (!JSB) {
            this.scheduleOnce(() => {
                let e = document.getElementById("gamelogo");
                if (e) { e.hidden = true; }
            }, 0.1);
        }

        let dc = ConfigManager.getInstance().getDesignResoulutionInfo();
        this.hideNode.setScale(1, dc.uiScaleY, 1);
        this.midNode.setScale(dc.uiScaleX, dc.uiScaleY, 1);

        this.schedule(this._checkIsInitOver, 0.01);
        // SubGameCtrl.getInstance().setIsInitOver(true); //test
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(false);

        this._isInit = false;

        // this._initInof();
        this._initDefaultInof();
    }

    private _checkIsInitOver() {
        if (SubGameCtrl.getInstance().getIsInitOver()) {
            this.unschedule(this._checkIsInitOver);
            this._initInof();
        }
    }

    private _initDefaultInof() {
        GameUtils.getInstance().setVisible(this.touchNode, true);

        this.timeLabel.string = '';
        this.timeProgress.progress = 0;

        this.leaveCount.string = '';

        this.animal.node.active = false;
        this.food.node.active = false;

        for (let i = 0; i < this.foods.length; i++) {
            this.foods[i].node.active = false;
        }

        for (let i = 0; i < this.paths.length; i++) {
            this._paths.push(this.paths[i].getPosition());
        }
    }

    private _updateCoinInfo() {
        let userInfo = UserManager.getInstance().getUserInfo();
        GameUtils.getInstance().setString(this.leaveCount, userInfo.leaves);
    }

    private _updateBossProgress() {
        let gmd = SubGameCtrl.getInstance().getGameModel();
        let percent = gmd.bossProgression;
        log("_updateBossProgress", percent);
        this.bossLabel.string = `${percent}%`;
        this.bossProgress.progress = percent / 100;
    }

    private _initInof() {
        GameUtils.getInstance().setVisible(this.touchNode, false);

        let gm = SubGameCtrl.getInstance().getGameModel();

        this._updateCoinInfo();

        let dc = ConfigManager.getInstance().getDesignResoulutionInfo();
        for (let i = 0; i < this.foods.length; i++) {
            this.foods[i].node.active = true;
            this.foods[i].setItemInfo(gm.towerList[i]);
            this.foods[i].node.setScale(1 / dc.uiScaleX, 1 / dc.uiScaleY, 1);
        }
        this.animal.node.setScale(1 / dc.uiScaleX, 1 / dc.uiScaleY, 1);

        this._isInit = true;

        this._startTickTimer();

        this._updateGameState();

    }

    private _resetGameState() {
        this._updateGameState();

    }

    private _setAnimalInfo() {
        let gmd = SubGameCtrl.getInstance().getGameModel();

        this.animal.node.active = true;
        this.animal.setItemInfo(gmd.appearanceAnimalId, this._paths);
    }

    private _playRun() {
        let gmd = SubGameCtrl.getInstance().getGameModel();
        // if (gmd.winInfo) {
        //     this.animal.runToFood(gmd.appearanceAnimalId);
        // } else {
        //     this.animal.runToFood(this._paths.length);
        // }
        this.animal.runToFood(gmd.appearanceAnimalId);
    }

    private _getEatFoodItem(id: number) {
        for (let i = 0; i < this.foods.length; i++) {
            if (this.foods[i].getFoodId() == id) {
                return this.foods[i];
            }
        }
        return null;
    }

    private _showBossWin() {
        let gmd = SubGameCtrl.getInstance().getGameModel();
        if (gmd.bossWinInfo) {
            // let userInfo = UserManager.getInstance().getUserInfo();

            // if (Number(gmd.bossWinInfo.userId) == Number(userInfo.userId)) {
            //     WindowManager.getInstance().showWindow(WinId.LayerBossWin, gmd.bossWinInfo);
            // } else {
            //     this.bossWinItem.node.active = true;
            //     this.bossWinItem.setItemInfo(gmd.bossWinInfo);
            // }

            this.bossWinItem.node.active = true;
            this.bossWinItem.setItemInfo(gmd.bossWinInfo);
        }
    }

    private _runBossAni() {
        this.boosNode.active = true;
        this.bossAni.node.active = true;
        SpineManager.getInstance().playSpineAni(this.bossAni, () => {
            this.bossTipAni.node.active = true;
            SpineManager.getInstance().playSpineAni(this.bossTipAni, () => {
                this.boosNode.active = false;
                this.scheduleOnce(() => {
                    this._showBossWin();
                }, 0.5);
            }, "run", false, true);
        }, "run", false, true);

    }

    private _showWin(winInfo: WinnerItemIF) {
        WindowManager.getInstance().showWindow(WinId.LayerWin, winInfo);
    }

    private _playEat() {
        let gmd = SubGameCtrl.getInstance().getGameModel();
        let animalId = gmd.appearanceAnimalId;
        let winInfo = gmd.winInfo;
        let foodItem = this._getEatFoodItem(animalId);
        this.animal.playEatFood(animalId, foodItem.node.getPosition());
        let foodPos = this.food.node.getParent().getComponent(UITransform).convertToNodeSpaceAR(foodItem.getFoodWPos());
        let effectPos = this.animal.node.getParent().getComponent(UITransform).convertToNodeSpaceAR(this.animal.getEatEffectWPos());
        this.food.node.setPosition(foodPos);
        GameUtils.getInstance().setSpriteFrameByName(this.food, "image/images/d-" + animalId);
        this.food.node.active = true;
        this.food.node.setScale(1.3, 1.3);

        Tween.stopAllByTarget(this.food.node);
        tween(this.food.node)
            .to(0.6, { position: effectPos, scale: new Vec3(0.0, 0.0) })
            .call(() => {
                this.animal.playEatFoodEffect();
            })
            .delay(0.2)
            .call(() => {
                this.food.node.active = false;
                if (winInfo) {
                    this._showWin(winInfo);
                } else {
                    WindowManager.getInstance().showSystemTip("很遗憾，与仙者暂无缘分～");
                }
            })
            .start();


    }

    private _updateGameState() {
        if (!this._isInit) {
            return;
        }
        let gmd = SubGameCtrl.getInstance().getGameModel();

        if (this._gameState == gmd.status) {
            return;
        }
        this._gameState = gmd.status;

        this.bossWinItem.node.active = false;
        this.boosNode.active = false;

        this._updateBossProgress();

        this._startTickTimer()

        if (this._gameState == GameState.SETTLE) {
            this._setAnimalInfo();

            let dt = Math.floor((new Date().getTime() - gmd.screeningTime) / 1000);
            dt = gmd.statusStarted + dt;
            // if (gmd.winInfo) {
            //     if (dt >= 5) {
            //         this._playEat();
            //     } else {
            //         this._playRun();
            //     }
            // } else {
            //     this._playRun();
            // }
            if (dt <= 5) {
                this._playRun();
            }

            if (gmd.bossWinInfo) {
                // let userInfo = UserManager.getInstance().getUserInfo();
                // if (Number(gmd.bossWinInfo.userId) == Number(userInfo.userId)) {
                //     this.scheduleOnce(() => {
                //         this._runBossAni();
                //     }, 1);
                // } else {
                //     this.scheduleOnce(() => {
                //         this._showBossWin();
                //     }, 1.5);
                // }

                this.scheduleOnce(() => {
                    this._runBossAni();
                }, 1);
            }
        } else {
            this.animal.stopRun()
        }
    }

    private _updateBetInfo() {
        for (let i = 0; i < this.foods.length; i++) {
            this.foods[i].updateItemBetInfo(0);
        }

        let ubd = UserManager.getInstance().getUserInfo().userBetPrice;
        for (const key in ubd) {
            for (let i = 0; i < this.foods.length; i++) {
                if (Number(key) == this.foods[i].getFoodId()) {
                    this.foods[i].updateItemBetInfo(ubd[key]);
                }
            }
        }
    }

    private _startTickTimer() {//开始倒计时
        // this.timeNode.active = true;
        let gmd = SubGameCtrl.getInstance().getGameModel();
        let dt = Math.floor((new Date().getTime() - gmd.screeningTime) / 1000);
        this._tickTime = gmd.statusDuration - gmd.statusStarted - dt;
        this._tickTimeMax = gmd.statusDuration;
        this.timeProgress.progress = (gmd.statusStarted + dt) / gmd.statusDuration;
        this._updateTickTime(0);
        this.schedule(this._updateTickTime, 1);
    }

    private _stopTickTimer() {//停止倒计时
        this.unschedule(this._updateTickTime);
        // this.timeNode.active = false;
        this._tickTime = 0;
    }

    private _updateTickTime(dt) {//更新倒计时
        if (dt != 0) {
            this._tickTime--;
        }
        if (this._tickTime < 0) {
            this.timeProgress.progress = 0;
            this._stopTickTimer();
            return;
        }
        this.timeProgress.progress = this._tickTime / this._tickTimeMax;
        let tip = '倒计时';
        if (SubGameCtrl.getInstance().getGameModel().status == GameState.SETTLE) {
            tip = '等待下次倒计时';
            if (this._tickTime == 1) {
                WindowManager.getInstance().showWindow(WinId.LayerTip, 1);
            }
        } else {
            if (this._tickTime == 1) {
                WindowManager.getInstance().showWindow(WinId.LayerTip, 0);
            }
        }
        this.timeLabel.string = tip + this._tickTime + "s";
    }



    onClickShowRecord() {
        WindowManager.getInstance().showWindow(WinId.LayerRecord);
    }

    onClickShwBuyRecord() {
        WindowManager.getInstance().showWindow(WinId.LayerBuyRecord);
    }

    onClickShowTip() {
        WindowManager.getInstance().showWindow(WinId.LayerTip);
    }

    onClickShowRule() {
        WindowManager.getInstance().showWindow(WinId.LayerRule);
    }

    onClickShowShop() {
        WindowManager.getInstance().showWindow(WinId.LayerShop);
    }

    onClickHideGame() {
        SubGameUtil.getInstance().hiddenFun();
    }

    update(deltaTime: number) {
        if (!this._isInit) {
            return;
        }

        //更新层级
        if (!this.animal.node.active) {
            return;
        }
        let nodes = [this.animal.node];
        for (let i = 0; i < this.foods.length; i++) {
            nodes.push(this.foods[i].node);
        }
        nodes.sort((a, b) => {
            return b.getPosition().y - a.getPosition().y;
        });
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].setSiblingIndex(i);
        }
    }

    onDispathcGameEvent(eventId: GameEvent, eventData: any): void {
        if (!this._isInit) {
            return;
        }
        switch (eventId) {
            case GameEvent.EVENT_CLIENT_RECONNECT_NET:
                {
                    //重连 重置游戏状态
                    this._resetGameState();
                }
                break;
            case GameEvent.EVENT_GAME_INFO:
                {
                    //游戏信息
                }
                break;
            case GameEvent.EVENT_GAME_UPDATE_WALLET:
                {
                    //更新钱包信息
                    this._updateCoinInfo();
                }
                break;
            case GameEvent.EVENT_GAME_STATE_INFO:
                {
                    //更新游戏状态
                    this._updateGameState();
                }
                break;
            case GameEvent.EVENT_GAME_BET_INFO:
                {
                    //更新下注信息
                    this._updateBetInfo();
                }
                break;
            // case GameEvent.EVENT_GAME_SELF_BET:
            //     {
            //         //自己下注的信息
            //         // this._updateBetInfo();
            //     }
            //     break;
            case GameEvent.EVENT_GAME_UPDATE_RECORD:
                {
                    //更新开奖记录
                    // this._updateRecordInfo();
                }
                break;
            case GameEvent.EVENT_GAME_RESULT:
                {
                    this._playEat();
                }
                break;
            // case GameEvent.EVENT_GAME_UPDATE_ONLINE:
            //     {
            //         // console.log("在线人数更新");

            //     }
            //     break;



            default:
                super.onDispathcGameEvent(eventId, eventData);
                break
        }
    }
}

