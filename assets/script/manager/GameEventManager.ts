import GameBaseEventNode from "../game/base/GameBaseEventNode";

export default class GameEventManager {
    private static _instance:GameEventManager = null;
    private _eventListeners:GameBaseEventNode[] = []

    //---------------------------------
    public static getInstance() {
        if (!this._instance) {
            this._instance = new GameEventManager();
        }
        return this._instance;
    }

    pushNodeEvent(obj:any) {
        this._eventListeners.push(obj);
    }

    removeNodeEvent(obj:any) {
        for (let index = 0; index < this._eventListeners.length; index++) {
            if (this._eventListeners[index] == obj) {
                this._eventListeners.splice(index,1);
                return;
            }
        }
    }

    dispatchGameEvent(eventId, data:any = null){
        for (let index = 0; index < this._eventListeners.length; index++) {
            const element = this._eventListeners[index];
            if (element && element.isValid) {
                element.onDispathcGameEvent(eventId, data);
            }
        }
    }

}

