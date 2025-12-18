import { _decorator, Component, Node, Sprite, Label, Color, RichText, EditBox, ProgressBar, Slider, SpriteFrame, Vec2, Size, Button, Layout, SpriteAtlas, Prefab, Tween, sp, Animation, Material, builtinResMgr, UIRenderer, color, v3, js, UITransform, Widget, size, v2, tween, warn, AnimationClip, resources, error, isValid, debug, Vec3, UIOpacity } from 'cc';
import GameTools from "./GameTools";
import ConfigManager from '../manager/ConfigManager';
import SpriteManager from '../manager/SpriteManager';
import ClientManager from '../manager/ClientManager';

export default class GameUtils {
    //-----------------------

    // private _directionRadian: number[] = [Math.PI, -Math.PI * 3 / 4, -Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2, Math.PI * 3 / 4];

    //-----------------------
    //-----------------------
    private static _instance: GameUtils = null;
    public static getInstance(): GameUtils {
        if (!this._instance) {
            this._instance = new GameUtils();
        }
        return this._instance;
    }

    public reset() {

    }

    forCCNode(cccNode: Node, isChild: boolean = true, cb: Function) {

        let children = cccNode.children;
        if (!children || children.length <= 0 || !cb || !isChild)
            return;
        for (let i = 0; i < children.length; i++) {
            cb(children[i])
        }
    }

    public stopCCCNodeAllActions(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        // cccNode.stopAllActions();
        Tween.stopAllByTarget(cccNode);
        let spc = cccNode.getComponent(sp.Skeleton);
        if (spc) {
            spc.paused = true;
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.stopCCCNodeAllActions(children[i], isChild);
            }
        }
    }

    //尽量使用 stopCCCNodeAllActions
    //如果只是 只想暂停spine动画，可以使用这个方法
    public spotAllSpineActions(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        let spc = cccNode.getComponent(sp.Skeleton);
        if (spc) {
            spc.paused = true;
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.spotAllSpineActions(children[i], isChild);
            }
        }
    }

    public resumeAllSpineActions(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        let spc = cccNode.getComponent(sp.Skeleton);
        if (spc) {
            if (!spc.isAnimationCached()) {
                spc.clearTracks();
            }
            spc.setToSetupPose();
            spc.paused = false;
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.resumeAllSpineActions(children[i], isChild);
            }
        }
    }

    public stopCCCNodeAllScheduleCallbacks(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        let comps = cccNode.getComponents(Component);
        for (let i = 0; i < comps.length; i++) {
            let comp = comps[i];
            comp.unscheduleAllCallbacks();
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.stopCCCNodeAllScheduleCallbacks(children[i], isChild);
            }
        }
    }

    public stopCCCNodeAnimation(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        let anim = cccNode.getComponent(Animation);
        if (anim) {
            anim.stop();
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.stopCCCNodeAnimation(children[i], isChild);
            }
        }
    }

    public stopCCCNodeAllActionsAndAnimations(cccNode: Node, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }
        // cccNode.stopAllActions();
        Tween.stopAllByTarget(cccNode);
        let spc = cccNode.getComponent(sp.Skeleton);
        if (spc) {
            spc.paused = true;
        }
        let anim = cccNode.getComponent(Animation);
        if (anim) {
            anim.stop();
        }
        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.stopCCCNodeAllActionsAndAnimations(children[i], isChild);
            }
        }
    }

    public setCCCNodeGray(node: Node | Component, isGray: boolean, isChild: boolean = true) {
        if (!node) {
            return;
        }

        let cccNode: Node = null;
        if (node instanceof Component) {
            cccNode = node.node;
        } else {
            cccNode = node;
        }
        if (!cccNode) {
            return;
        }

        let spr: Sprite = cccNode.getComponent(Sprite);
        if (spr) {
            this.setCCCSpriteGray(spr, isGray, false);
        }
        let label: Label = cccNode.getComponent(Label);
        if (label) {
            this.setCCCLabelGray(label, isGray, false);
        }
        let button: Button = cccNode.getComponent(Button);
        if (button) {
            this.setButtonGray(button, isGray, false);
        }

        if (isChild) {
            let children = cccNode.children;
            if (!children || children.length <= 0)
                return;
            for (let i = 0; i < children.length; i++) {
                this.setCCCNodeGray(children[i], isGray, isChild);
            }
        }
    }

    public setCCCSpriteGray(sprite: Sprite, isGray: boolean, isChild: boolean = true) {
        if (!sprite) {
            return;
        }
        // // sprite.setState(isGray ? 1 : 0);//升级到2.1.2后 废弃了
        // //以下为2.1.2版本
        // let mat: Material = null;
        // if (isGray) {
        //     mat = Material.getBuiltinMaterial('2d-gray-sprite');
        // }
        // else {
        //     mat = Material.getBuiltinMaterial('2d-sprite');
        // }
        // sprite.setMaterial(0, mat);
        // //---

        // 3.8.2
        sprite.grayscale = isGray;

        this.forCCNode(sprite.node, isChild, (cNode) => {
            this.setCCCSpriteGray(cNode.getComponent(Sprite), isGray, isChild);
        })
    }

    public setCCCLabelGray(label: Label, isGray: boolean, isChild: boolean = true) {
        if (!label) {
            return;
        }
        // // sprite.setState(isGray ? 1 : 0);//升级到2.1.2后 废弃了
        // //以下为2.1.2版本
        // let mat: Material = null;
        // if (isGray) {
        //     mat = Material.getBuiltinMaterial('2d-gray-sprite');
        // }
        // else {
        //     mat = Material.getBuiltinMaterial('2d-sprite');
        // }
        // label.setMaterial(0, mat);
        // //---

        // 3.8.2
        if (isGray) {
            label.customMaterial = builtinResMgr.get("ui-sprite-gray-material");
        } else {
            label.customMaterial = null;
        }
        this.forCCNode(label.node, isChild, (cNode) => {
            this.setCCCLabelGray(cNode.getComponent(Label), isGray, isChild);
        })
    }

    public setCCCNodeColor(cccNode: Node, color: Color | string, isChild: boolean = true) {
        if (!cccNode) {
            return;
        }

        this._setColor(cccNode, color);
        this.forCCNode(cccNode, isChild, (cNode) => {
            this.setCCCNodeColor(cNode, color, isChild);
        })
    }

    private _setColor(cccNode: Node, color: Color | string) {
        if (cccNode) {
            let c: Color = null;
            if (typeof color == "string") {
                c = this.getColorRGBA(color);
            } else {
                c = color;
            }

            let render = cccNode.getComponent(UIRenderer);
            if (render) {
                render.color = c;
            }
        }
    }

    public getColorRGBA(colorString: string): Color {
        let colorValueList = [];
        if (!colorString) { //默认为白色
            colorString = "#ffffff";
        }
        if (colorString[0] != '#') {
            colorString = '#' + colorString;
        }
        if (colorString.length < 9) {
            colorString += "ff";
        }
        for (let i = 1; i < 9; i += 2) {
            colorValueList.push(parseInt("0x" + colorString.slice(i, i + 2)));
        }
        let c = color(colorValueList[0], colorValueList[1], colorValueList[2], colorValueList[3]);
        return c;
    }

    public setLabelOutLineColor(label: Label, color: Color | string) {
        // let labelOutLine: LabelOutline = this.getComponent(label.node, LabelOutline);
        // if (labelOutLine) {
        //     if (typeof color == "string") {
        //         labelOutLine.color = this.getColorRGBA(color);
        //     }
        //     else {
        //         labelOutLine.color = color;
        //     }
        // }

        // 3.8.2
        if (label.enableOutline) {
            if (typeof color == "string") {
                label.outlineColor = this.getColorRGBA(color);
            }
            else {
                label.outlineColor = color;
            }
        }
    }

    // /*
    //  *敏感字替换
    //  */
    // public sensitiveWord(text: string): string {
    //     let str = text;
    //     //todo
    //     return str;
    // };

    // public checkSensitiveWord(text: string) {
    //     let swd = SensitiveWord.datas;
    //     for (const key in swd) {
    //         if (swd.hasOwnProperty(key)) {
    //             const wd = swd[key];
    //             if (text.indexOf(wd.SensitiveWord) != -1) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    //判断非法字符
    public isHaveSpecial(text: string): boolean {
        let reg = /^(\w|[\u4E00-\u9FA5])*$/;
        // let reg = /^([a-zA-Z0-9]|[\u4E00-\u9FA5])*$/;
        if (text.match(reg)) {
            return false;
        } else {
            return true;
        }
    }

    public setString(label: Label | RichText | EditBox, text: string | number) {
        // debug(new Error().stack);
        // debug(text);

        if (label) {
            label.string = text + "" || "";

            //多语言设置完语言后清除一下
            if ((<any>label).mlId) {
                (<any>label).mlId = "";
            }
        }
    }

    public getString(label: Label | RichText | EditBox): string {
        if (label) {
            return label.string
        }
        return "";
    }

    // public setStringById(label: Label | RichText | EditBox, textId: string, arg: string[]) {
    //     let text = this.getTextById(textId, arg);
    //     this.setString(label, text);
    // }

    public setEditBoxPlaceholderString(editBox: EditBox, text: string) {
        if (editBox) {
            editBox.placeholder = text;
        }
    }

    // public setEditBoxPlaceholderStringById(editBox: EditBox, textId: string, arg: string[]) {
    //     let text = this.getTextById(textId, arg);
    //     if (editBox) {
    //         editBox.placeholder = text;
    //     }
    // }

    public setFormatNumberString(label: Label, num: number) {
        if (label) {
            let formatNumberString = this.getFormatNumberString(num);
            this.setString(label, formatNumberString);
        }
    }

    public getFormatNumberString(num: number) {
        //todo
        return "0";
    }

    public setProgress(node: ProgressBar | Slider, progress: number) {
        //原来条件是：node && node.progress ，node.progress为0，则为false
        if (node) {
            node.progress = progress;
        }
    }

    public setSpriteFrame(sprite: Sprite, spriteFrame: SpriteFrame) {
        // if (node && node.spriteFrame && spriteFrame) {
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    public getSpriteAtlasByFrameName(spriteAtlas: SpriteAtlas, spriteFrameName: string) {
        return spriteAtlas.getSpriteFrame(spriteFrameName);
    }

    public async setSpriteFrameByName(sprite: Sprite, spriteFrameName: string) {
        if (!sprite) {
            return;
        }
        if (!Boolean(spriteFrameName)) {
            warn("setSpriteFrameByName spriteFrameName is null");
            return;
        }
        let frame = await SpriteManager.getInstance().getSpriteFrame(spriteFrameName, ClientManager.getInstance().getCurGameType());
        if (sprite && isValid(sprite) && isValid(sprite.node)) {
            if (frame) {
                sprite.spriteFrame = frame;
            }
        }

    }

    public async setSpriteFrameByUrl(sprite: Sprite, spriteFrameUrl: string) {
        if (!sprite) {
            return;
        }
        if (!Boolean(spriteFrameUrl)) {
            warn("setSpriteFrameByName spriteFrameName is null");
            return;
        }
        let frame = await SpriteManager.getInstance().getUrlSpriteFrame(spriteFrameUrl, ClientManager.getInstance().getCurGameType());
        if (sprite && isValid(sprite) && isValid(sprite.node)) {
            if (frame) {
                sprite.spriteFrame = frame;
            }
        }

    }

    public async setSpriteFrameByUrlWithDefault(sprite: Sprite, spriteFrameUrl: string, spriteFrameName: string) {
        if (!sprite) {
            return;
        }
        //先加载默认的，获取到网络头像后，再换
        await this.setSpriteFrameByName(sprite, spriteFrameName);

        if (!Boolean(spriteFrameUrl)) {
            warn("setSpriteFrameByName spriteFrameName is null");
            return;
        }
        let frame = await SpriteManager.getInstance().getUrlSpriteFrame(spriteFrameUrl, ClientManager.getInstance().getCurGameType());
        if (sprite && isValid(sprite) && isValid(sprite.node)) {
            if (frame) {
                sprite.spriteFrame = frame;
            }
        }

    }

    public async setBundleSpriteFrameByName(sprite: Sprite, spriteFrameName: string) {
        if (!sprite) {
            return;
        }

        if (!Boolean(spriteFrameName)) {
            warn("setSpriteFrameByName spriteFrameName is null");
            return;
        }

        //多语言设置完语言后清除一下
        if ((<any>sprite).mlId) {
            (<any>sprite).mlId = "";
        }

        let frame = await SpriteManager.getInstance().getBundleSpriteFrame(spriteFrameName, ClientManager.getInstance().getCurGameType());
        if (sprite && isValid(sprite) && isValid(sprite.node)) {
            if (frame) {
                sprite.spriteFrame = frame;

            }
        }

    }

    public async setSpriteFrameBySpriteAtlas(sprite: Sprite, spriteAtlasUrl: string, spriteFrameName: string) {
        let atlas = await SpriteManager.getInstance().getSpriteAtlas(spriteAtlasUrl, ClientManager.getInstance().getCurGameType());
        let frame = this.getSpriteAtlasByFrameName(atlas, spriteFrameName);
        if (sprite && isValid(sprite) && isValid(sprite.node)) {
            if (frame) {
                sprite.spriteFrame = frame;
            }
        }
    }

    public setVisible(node: Node | any, visible: boolean) {
        if (node) {
            if (node.node) {
                node.node.active = visible;
            } else {
                node.active = visible;
            }
        }
    }

    public setCCCNodeOpacity(node: Node, value: number) {
        if (!node) {
            return;
        }

        // node.opacity = value;

        let oc = node.getComponent(UIOpacity);
        if (!oc) {
            oc = node.addComponent(UIOpacity);
        }
        oc.opacity = value;
    }

    public isVisible(node: Node) {
        if (node) {
            return node.active;
        }
        return false;
    }

    public setPosition(node: Node, pos: Vec3) {
        if (node && pos) {
            node.setPosition(pos);
        }
    }

    public setAngle(node: Node, angle: number = 0) {
        if (node) {
            node.angle = angle;
        }
    }

    public getPosition(node: Node) {
        if (node) {
            return node.getPosition();
        }
        return v3(0, 0);
    }

    public getChildByName(node: Node, name: string, component: { prototype: Component } | string = null) {
        let temp = null;
        if (node) {
            temp = node.getChildByName(name);
            if (!temp) {
                let children = node.children;
                for (let i = 0; i < children.length; ++i) {
                    temp = this.getChildByName(children[i], name);
                    if (temp) {
                        if (component) {
                            return temp.getComponent(component);
                        }
                        return temp;
                    }
                }
            }
        }
        return temp;
    }

    public getAllChildrenAndPath(rootNode: Node, table: any, rootPath: string) {
        let path = rootPath || rootNode.name;
        let childrenTable = table || {};
        let children = rootNode.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            let childPath = path + "/" + child.name;
            // //debug("getAllChildrenAndPath",childPath);
            childrenTable[childPath] = child;
            this.getAllChildrenAndPath(child, childrenTable, childPath);
        }
        return childrenTable;
    }

    public getAllChildren(rootNode: Node, table: any) {
        let childrenTable = table || {};
        let children = rootNode.children;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            // //debug("getAllChildren",child.name);
            childrenTable[child.name] = child;
            this.getAllChildren(child, childrenTable);
        }
        return childrenTable;
    }

    public getComponent(node: Node, name: any) {
        let temp = null;
        if (node && name) {
            temp = node.getComponent(name);
        }
        return temp;
    }

    public addComponent(node: Node, name: any) {
        if (node && name) {
            let component = node.getComponent(name);
            if (component) {
                return component;
            }
            return node.addComponent(name);
        }
        return null;
    }

    public removeComponent(node: Node, name: any) {
        if (node && name) {
            node.removeComponent(name);
        }
    }

    public getIsHaveComponent(compoentName: string) {
        return !!js.getClassByName(compoentName);
    }

    public addChild(parent: Node, child: Node, pos: Vec3 = null, zIndex: number = 0) {
        if (parent && child) {
            parent.addChild(child);
            if (pos) {
                this.setPosition(child, pos);
            }
            if (!GameTools.getInstance().isNull(zIndex)) {
                child.setSiblingIndex(zIndex);
            }
        }
    }

    public removeAllChildren(node: Node) {
        if (node) {
            node.destroyAllChildren();
        }
    }

    public removeFromParent(node: Node, clearup: boolean = true) {
        if (node) {
            if (clearup) {
                node.destroy();
            } else {
                node.removeFromParent();
            }
        }
    }

    public getV2Radian(curPos: Vec2, endPos: Vec2) {
        let disX = endPos.x - curPos.x;
        let disY = endPos.y - curPos.y;
        return Math.atan2(disY, disX)
    }

    public getV2Degree(curPos: Vec2, endPos: Vec2) {
        let radian = this.getV2Radian(curPos, endPos);
        let degree = radian * 180 / Math.PI;
        return degree;
    }

    //弧度＝角度×π/180
    public getRadianFromDegree(degree: number) {
        let ra = degree * Math.PI / 180;
        return ra;
    }

    //角度＝弧度×180/π
    public getDegreeFromRadian(radian: number) {
        let degree = radian * 180 / Math.PI;
        return degree;
    }

    public transformRadian(radian: number, scaleX: number = 1, scaleY: number = 1) {
        radian = Math.floor(radian * 100) / 100;
        return Math.atan2(Math.sin(radian) * scaleY, Math.cos(radian) * scaleX);
    }

    public setContentSize(node: Node, s: Size) {
        if (node) {
            let ut = node.getComponent(UITransform);
            if (!ut) {
                ut = node.addComponent(UITransform);
            }
            s = s || size(0, 0);
            ut.setContentSize(s);
            this.flushCCCNodeSize(node);
        }
    }

    public flushCCCNodeWidget(node: Node) {
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.flushCCCNodeWidget(children[i]);
        }

        let widget = this.getComponent(node, Widget);
        if (widget) {
            widget.enabled = false;
            widget.enabled = true;
        }
    }

    public flushCCCNodeLayout(node: Node) {
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.flushCCCNodeLayout(children[i]);
        }

        let layout = this.getComponent(node, Layout);
        if (layout) {
            layout.enabled = false;
            layout.enabled = true;
        }
    }

    public flushCCCNodeSize(node: Node) {
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.flushCCCNodeSize(children[i]);
        }

        let layout = this.getComponent(node, Layout);
        if (layout) {
            layout.enabled = false;
            layout.enabled = true;
        }
        let widget = this.getComponent(node, Widget);
        if (widget) {
            widget.enabled = false;
            widget.enabled = true;
        }
    }

    public getContentSize(node: Node) {
        if (node) {
            let ut = node.getComponent(UITransform);
            if (!ut) {
                return size(0, 0);
            }
            return ut.contentSize;
        }
        return size(0, 0);
    }

    public setAnchorPoint(node: Node, point: Vec2) {
        if (node) {
            let ut = node.getComponent(UITransform);
            if (ut) {
                ut = node.addComponent(UITransform);
            }

            ut.setAnchorPoint(point);
        }
    }

    public getAnchorPoint(node: Node) {
        if (node) {
            let ut = node.getComponent(UITransform);
            if (!ut) {
                return v2(0, 0);
            }
            return ut.anchorPoint;
        }
        return v2(0.5, 0.5);
    }

    public setScale(node: Node, scale: number) {
        if (node) {
            node.setScale(scale, scale, scale);
        }
    }


    public getScale(node: Node) {
        if (node) {
            return node.scale;
        }
        return 1;
    }

    public setFontSize(label: Label, size: number) {
        if (label) {
            label.fontSize = size;
        }
    }

    public getFontSize(label: Label) {
        if (label) {
            return label.fontSize;
        }
        return 0;
    }

    public setButtonEnable(button: Button, isEnable: boolean = true) {
        if (button) {
            button.interactable = isEnable;
        }
    }

    public setButtonGray(button: Button, isGray: boolean = true, isChild: boolean = true) {
        if (button) {
            button.interactable = !isGray;

            if (isChild) {
                let children = button.node.children;
                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    this.setCCCNodeGray(child, isGray, isChild);
                }
            }
        }
    }

    public setNodeCenter(node: Node, isChild: boolean = true) {
        if (!node) {
            return;
        }
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        // debug("setNodeCenter node name",node.name);
        widget.isAlignTop = true;
        // widget.top = 0;
        widget.isAlignBottom = true;
        // widget.bottom = 0;
        widget.isAlignLeft = true;
        // widget.left = 0;
        widget.isAlignRight = true;
        // widget.right = 0;

        // widget.isAlignHorizontalCenter = true;
        // widget.isAlignVerticalCenter = true;
        // widget.horizontalCenter = 0;
        // widget.verticalCenter = 0;

        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // if (node.width > 0 && node.height > 0) {
        //     let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
        //     node.width = node.width * drc.uiScaleX;
        //     node.height = node.height * drc.uiScaleY;
        // }

        widget.updateAlignment();

        if (isChild) {
            this._updateAllChildNodeWidget(node);
        }
    }

    public setNodeWidgetFull(node: Node, isChild: boolean = true) {
        if (!node) {
            return;
        }
        let widget = node.getComponent(Widget);
        if (!widget) {
            widget = node.addComponent(Widget);
        }
        node.setPosition(Vec3.ZERO);
        // debug("setNodeCenter node name",node.name);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;

        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;

        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        widget.updateAlignment();

        if (isChild) {
            this._updateAllChildNodeWidget(node);
        }
    }

    private _updateAllChildNodeWidget(node: Node) {
        if (!node) {
            return;
        }
        let widget = node.getComponent(Widget);
        if (widget) {
            if (widget.enabled) {
                widget.updateAlignment();
            }
        }

        if (node.children.length == 0) {
            return;
        }
        let children = node.children;
        for (let i = 0; i < children.length; i++) {
            let childNode = children[i];
            this._updateAllChildNodeWidget(childNode);
        }
    }

    public setBgNodeScale(node: Node) {
        if (!node) {
            return;
        }

        let drc = ConfigManager.getInstance().getDesignResoulutionInfo();
        node.setScale(drc.uiMaxScale, drc.uiMaxScale, 1);
    }

    public updateLayout(layout: Layout) {
        let LayoutType = {
            None: 0,
            Horizontal: 1,  //横向
            Vertical: 2,    //纵向
            Grid: 3,        //网格
        }
        let ResizeMode = {
            None: 0,
            Container: 1,   //对容器大小进行缩放
        }
        let StartAxis = {
            Horizontal: 0,  //横向
            Vertical: 1,    //纵向
        }

        if (layout.resizeMode != ResizeMode.Container) {
            return;
        }

        let allChildrenList = [];
        for (let i = 0; i < layout.node.children.length; i++) {
            let childrenNode = layout.node.children[i];
            if (layout.node.children[i]) {
                childrenNode = layout.node.children[i];
            }
            if (childrenNode.active) {
                allChildrenList.push(childrenNode);
            }
        }

        let layoutType = layout.type;
        let layoutSize = size(this.getContentSize(layout.node));

        if (layoutType == LayoutType.Horizontal) {
            layoutSize.width = 0;
            let childrenLength = 0;
            for (let i = 0; i < allChildrenList.length; i++) {
                layoutSize.width += this.getContentSize(allChildrenList[i]).width;
                childrenLength++;
            }
            layoutSize.width += layout.paddingLeft;
            layoutSize.width += layout.paddingRight;
            if (childrenLength > 0) {
                layoutSize.width += (childrenLength - 1) * layout.spacingX;
            }
        }
        else if (layoutType == LayoutType.Vertical) {
            layoutSize.height = 0;
            let childrenLength = 0;
            for (let i = 0; i < allChildrenList.length; i++) {
                layoutSize.height += this.getContentSize(allChildrenList[i]).height;
                childrenLength++;
            }
            layoutSize.height += layout.paddingTop;
            layoutSize.height += layout.paddingBottom;
            if (childrenLength > 0) {
                layoutSize.height += (childrenLength - 1) * layout.spacingY;
            }
        }
        else if (layoutType == LayoutType.Grid) {
            if (layout.startAxis == StartAxis.Horizontal) {
                let layoutRowWidth = layout.paddingLeft + layout.paddingRight;
                let maxItemHeight = 0;
                let rowIndex = 0;
                layoutSize.height = 0;
                let oldMaxItemHeight = 0;
                for (let i = 0; i < allChildrenList.length; i++) {
                    let itemWidth = this.getContentSize(allChildrenList[i]).width;
                    layoutRowWidth += itemWidth;
                    let itemHeight = this.getContentSize(allChildrenList[i]).height;
                    if (itemHeight >= maxItemHeight) {
                        maxItemHeight = itemHeight;
                    }
                    if (layoutRowWidth == layoutSize.width) {
                        layoutRowWidth = 0;
                        layoutSize.height += maxItemHeight;
                        maxItemHeight = 0;
                        rowIndex++;
                    }
                    else if (layoutRowWidth >= layoutSize.width) {
                        layoutRowWidth = itemWidth + layout.spacingX;
                        layoutSize.height += oldMaxItemHeight;
                        rowIndex++;

                        if (i == allChildrenList.length - 1) {
                            layoutSize.height += maxItemHeight;
                            rowIndex++;
                        }
                        maxItemHeight = 0;
                    }
                    else {
                        if (i == allChildrenList.length - 1) {
                            layoutSize.height += maxItemHeight;
                            rowIndex++;
                        }
                        oldMaxItemHeight = maxItemHeight;
                        layoutRowWidth += layout.spacingX;
                    }
                }
                if (rowIndex > 0) {
                    layoutSize.height += (rowIndex - 1) * layout.spacingY;
                }
                layoutSize.height += layout.paddingTop;
                layoutSize.height += layout.paddingBottom;
            }
            else if (layout.startAxis == StartAxis.Vertical) {
                let layoutColHeight = layout.paddingTop + layout.paddingBottom;
                let maxItemWidth = 0;
                let oldMaxItemWidth = 0;
                let colIndex = 0;
                layoutSize.width = 0;
                for (let i = 0; i < allChildrenList.length; i++) {
                    let itemWidth = this.getContentSize(allChildrenList[i]).width;
                    let itemHeight = this.getContentSize(allChildrenList[i]).height;

                    layoutColHeight += itemHeight;
                    if (itemHeight >= maxItemWidth) {
                        maxItemWidth = itemWidth;
                    }
                    if (layoutColHeight == layoutSize.height) {
                        layoutColHeight = 0;
                        layoutSize.width += maxItemWidth;
                        maxItemWidth = 0;
                        colIndex++;
                    }
                    else if (layoutColHeight >= layoutSize.height) {
                        layoutColHeight = itemHeight + layout.spacingY;
                        layoutSize.width += oldMaxItemWidth;
                        colIndex++;

                        if (i == allChildrenList.length - 1) {
                            layoutSize.width += maxItemWidth;
                            colIndex++;
                        }
                        maxItemWidth = 0;
                    }
                    else {
                        if (i == allChildrenList.length - 1) {
                            layoutSize.width += maxItemWidth;
                            colIndex++;
                        }
                        oldMaxItemWidth = maxItemWidth;
                        layoutColHeight += layout.spacingY;
                    }
                }
                if (colIndex > 0) {
                    layoutSize.width += (colIndex - 1) * layout.spacingX;
                }
                layoutSize.width += layout.paddingTop;
                layoutSize.width += layout.paddingBottom;
            }
        }
        this.setContentSize(layout.node, layoutSize);
    }

    // public getTextById(textId: string, arg: string[]) {
    //     if (!textId) {
    //         //debug("game error textData 策划没配表，字段这空，让策划确认一下！！！",textId,arg);
    //         return "#######";
    //     }
    //     let text = LanguageConfigConfig.datas[textId];
    //     if (!text) {
    //         //debug("game error textData 没有找到文字，让策划确认一下！！！",textId,arg);
    //         return "#######";
    //     }

    //     if (GameTools.getInstance().isNull(arg)) {
    //         arg = [];
    //     }
    //     //debug("getTextById",text,text,arg);
    //     return GameTools.getInstance().replaceString(text, arg);
    // }

    // //clone对象
    // public cloneObject(source:any):any{
    //     let copyTo = new Object();
    //     for (let  key in source) {
    //         if (source[key] !== undefined) {
    //             copyTo[key] = source[key];
    //         }
    //     }
    //     return copyTo;
    // }

    /**
     * setSeqNodesPosX
     */
    public setSeqNodesPosX(nodes: Node[], sepW: number, posY: number) {
        if (!nodes || nodes.length <= 0) {
            return
        }
        sepW = sepW || 0
        posY = posY || 0

        let count = nodes.length
        let startPosX = -1 * sepW * Math.ceil((count - 1) / 2)
        if (count == 1) {
            startPosX = 0
        }
        else if (count % 2 == 0) {
            startPosX = startPosX + sepW / 2
        }

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.setPosition(startPosX + (i * sepW), posY);
        }
    }

    public getSeqPosX(count: number, sepW: number, posY: number) {
        count = count || 0
        sepW = sepW || 0
        posY = posY || 0

        let startPosX = -1 * sepW * Math.ceil((count - 1) / 2)
        if (count == 1) {
            startPosX = 0
        }
        else if (count % 2 == 0) {
            startPosX = startPosX + sepW / 2
        }

        let poses: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            poses.push(v2(startPosX + (i * sepW), posY));
        }

        return poses;
    }

    /**
     * setSeqNodesPosY
     */
    public setSeqNodesPosY(nodes: Node[], sepH: number, posX: number) {
        if (!nodes || nodes.length <= 0) {
            return
        }
        sepH = sepH || 0
        posX = posX || 0

        let count = nodes.length
        let startPosY = sepH * Math.ceil((count - 1) / 2)
        if (count == 1) {
            startPosY = 0
        }
        else if (count % 2 == 0) {
            startPosY = startPosY - sepH / 2
        }

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            node.setPosition(posX, startPosY - (i * sepH));
        }
    }

    public getSeqPosY(count: number, sepH: number, posX: number) {
        count = count || 0
        sepH = sepH || 0
        posX = posX || 0

        let startPosY = sepH * Math.ceil((count - 1) / 2)
        if (count == 1) {
            startPosY = 0
        }
        else if (count % 2 == 0) {
            startPosY = startPosY - sepH / 2
        }

        let poses: Vec2[] = [];
        for (let i = 0; i < count; i++) {
            poses.push(v2(posX, startPosY - (i * sepH)));
        }

        return poses;
    }

    shakeNode(node: Node, originPos: Vec2, time: number = null, offset: number = null) {
        if (!node || !originPos) {
            return;
        }
        time = time || 0.5;
        let duration = 0.03;
        if (!offset) {
            offset = 6;
        }

        Tween.stopAllByTarget(node);
        node.setPosition(originPos.x, originPos.y);

        //一个震动耗时4个duration左,复位,右,复位
        //同时左右和上下震动
        let times = Math.floor(time / (duration * 4));
        // let moveLeft = tween().to(duration,{position:v2(-offset, 0)});
        // let moveLReset = tween().to(duration,{position:v2(offset, 0)});
        // let moveRight = tween().to(duration,{position:v2(offset, 0)});
        // let moveRReset = tween().to(duration,{position:v2(-offset, 0)});
        // let horSeq = tween().sequence(moveLeft,moveLReset,moveRight,moveRReset);

        let moveUp = tween().by(duration, { position: v2(0, offset) });
        let moveUReset = tween().by(duration, { position: v2(0, -offset) });
        let moveDown = tween().by(duration, { position: v2(0, -offset) });
        let moveDReset = tween().by(duration, { position: v2(0, offset) });
        let verSeq = tween().sequence(moveUp, moveUReset, moveDown, moveDReset);

        // tween(node).repeat(times, tween().parallel(horSeq, verSeq)).call(()=>{
        tween(node).repeat(times, tween().then(verSeq)).call(() => {
            node.setPosition(originPos.x, originPos.y);
        }).start();
    }

}
