
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component } from 'cc';
import GameBaseNode from './GameBaseNode';
import GameEventManager from '../../manager/GameEventManager';
import { GameEvent } from '../../config/GameEventConfig';

const {ccclass, property} = _decorator;

@ccclass('GameBaseEventNode')
export default class GameBaseEventNode extends GameBaseNode {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (super.onLoad){
            super.onLoad();
        }
    }

    onDestroy () {
        GameEventManager.getInstance().removeNodeEvent(this);
        if (super.onDestroy){
            super.onDestroy();
        }
    }

    start () {
        // this.registerGameEvent(); //子类去调用
        if (super.start){
            super.start();
        }
    }

    onEnable () {
        if (super.onEnable){
            super.onEnable();
        }
    }

    onDisable () {
        if (super.onDisable){
            super.onDisable();
        }
    }

    reuse () {
        if (super.reuse){
            super.reuse();
        }
        GameEventManager.getInstance().pushNodeEvent(this);
    }

    unuse () {
        GameEventManager.getInstance().removeNodeEvent(this);
        if (super.unuse){
            super.unuse();
        }
    }

    registerGameEvent () {
        if (super.registerGameEvent){
            super.registerGameEvent();
        }
        GameEventManager.getInstance().pushNodeEvent(this);
        
    }

    onDispathcGameEvent (eventId:GameEvent, eventData:any) {
        if (super.onDispathcGameEvent){
            super.onDispathcGameEvent(eventId, eventData);
        }
    }
}
