
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node } from 'cc';
import GameBaseEventNode from './GameBaseEventNode';
import ConfigManager from '../../manager/ConfigManager';
const {ccclass, property} = _decorator;

@ccclass('GameBaseScene')
export default class GameBaseScene extends GameBaseEventNode {

    // @property(Node)
    // root:Node = null;
    // @property(Sprite)
    // bg:Sprite = null;

    // LIFE-CYCLE CALLBACKS:
    
    //--------------------------

    //--------------------------

    start () {
        super.start();
        this.registerGameEvent();
        this.node.on(Node.EventType.SIZE_CHANGED, this._resetSceneSize, this);
    }

    onDestroy() {

        this.node.off(Node.EventType.SIZE_CHANGED, this._resetSceneSize, this);

        super.onDestroy()
    }

    private _resetSceneSize() {
        this.scheduleOnce(()=>{
            // ConfigManager.getInstance().initDesignResolution();
        },0.03)
    }
    
}
