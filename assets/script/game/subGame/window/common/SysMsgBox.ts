import { _decorator, Button, Component, instantiate, Label, log, Node, RichText, ScrollView, Toggle, UITransform } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import GameUtils from '../../../../utils/GameUtils';

const { ccclass, property } = _decorator;

@ccclass('SysMsgBox')
export class SysMsgBox extends GameBaseWindow {


    @property(RichText)
    desc: RichText = null;
    @property(Button)
    okBtn: Button = null;
    @property(Button)
    cancelBtn: Button = null;

    // LIFE-CYCLE CALLBACKS:
    private _okcb: Function = null;
    private _cancelcb: Function = null;

    //---------------

    onLoad() {
        super.onLoad()
        this._windowId = WinId.SysMsgBox;
        this.setZIndex(LayerZindex.Window);


    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(true);

        this.desc.string = winData.text;
        this._okcb = winData.okcb;
        this._cancelcb = winData.cancelcb;
        GameUtils.getInstance().setVisible(this.cancelBtn, winData.cancelcb)
    }

    onClickOK() {
        // log("onClickOK")
        if (this._okcb) {
            this._okcb();
        }

        // this.closeWinodw();
        this.unrealCloseWindow();
    }

    onClickCancel() {
        // log("onClickCancel")
        if (this._cancelcb) {
            this._cancelcb();
        }

        // this.closeWinodw();
        this.unrealCloseWindow();
    }

    onClickClose() {
        if (this._cancelcb) {
            this._cancelcb();
        } else if (this._okcb) {
            this._okcb();
        }
        // this.closeWinodw();
        this.unrealCloseWindow();
    }

    // update(deltaTime: number) {

    // }
}

