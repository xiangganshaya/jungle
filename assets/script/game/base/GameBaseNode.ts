
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
const {ccclass, property} = _decorator;

@ccclass('GameBaseNode')
export default class GameBaseNode extends Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (super.onLoad){
            super.onLoad();
        }
    }

    onDestroy () {

        if (super.onDestroy){
            super.onDestroy();
        }
    }

    start () {
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
        
    }

    unuse () {
        
    }

    registerGameEvent () {
        
    }

    onDispathcGameEvent (eventId, data) {

        // cc.debug("onDispathcGameEvent",eventId);
    }
    
}
