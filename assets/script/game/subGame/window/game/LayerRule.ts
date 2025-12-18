import { _decorator, Component, instantiate, Label, Node, ScrollView, UITransform } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import SubGameUtil from '../../subUtils/SubGameUtil';
import { RuleItem } from './gameItem/RuleItem';
const { ccclass, property } = _decorator;

@ccclass('LayerRule')
export class LayerRule extends GameBaseWindow {

    @property(RuleItem)
    ruleItems: RuleItem[] = [];

    // LIFE-CYCLE CALLBACKS:

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.LayerRule;
        this.setZIndex(LayerZindex.Window);

    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(true);

        this._initInof();
    }

    private _initInof() {
        let ruleItems = SubGameCtrl.getInstance().getRuleModel();
        for (let i = 0; i < this.ruleItems.length; i++) {
            let ri = ruleItems[i];
            if (ri) {
                this.ruleItems[i].node.active = true;
                this.ruleItems[i].setItemInfo(ri);
            } else {
                this.ruleItems[i].node.active = false;
            }
        }
    }

    // update(deltaTime: number) {

    // }
}

