
import { ImageAsset, SpriteAtlas, SpriteFrame, Texture2D, assetManager, debug, error, log, path, resources, warn } from "cc";
import ClientManager from "./ClientManager";


export default class SpriteManager {
    private _spriteFrames: any = {};
    private _urlSpriteFrames: any = {};
    private _bundleSpriteFrames: any = {};
    private _spriteAtlas: any = {};
    private _bundleSpriteAtlas: any = {};
    private _superior: any = {};

    private _bundleName: string = "";

    private static _instance: SpriteManager = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new SpriteManager();
        }
        return this._instance;
    }

    public setBundleName(bundleName: string) {
        if (this._bundleName) {
            this.clearBundleAllSpriteFrames(ClientManager.getInstance().getCurGameType())
            this._bundleName = "";
        }
        this._bundleName = bundleName;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || Number.isNaN(arg);
    }

    private _getSpriteFrame(name: string, superior: string): SpriteFrame {
        if (this._spriteFrames[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._spriteFrames[name];
        }
        else {
            for (let key in this._spriteAtlas) {
                let sf = this._spriteAtlas[key].getSpriteFrame(name);
                if (sf) {
                    return sf;
                }
            }
        }
        return null;
    }

    private _getBundleSpriteFrame(name: string, superior: string): SpriteFrame {
        if (this._bundleSpriteFrames[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._bundleSpriteFrames[name];
        }
        else {
            for (let key in this._bundleSpriteAtlas) {
                let sf = this._bundleSpriteAtlas[key].getSpriteFrame(name);
                if (sf) {
                    return sf;
                }
            }
        }
        return null;
    }

    private _getSpriteAtlas(name: string, superior: string): SpriteAtlas {
        if (this._spriteAtlas[name]) {
            this._addSuperiorData(name, superior);
            return this._spriteAtlas[name];
        }
        return null;
    }

    private _addSuperiorData(path: string, superior: string) {
        if (this._isNull(this._superior[superior])) {
            this._superior[superior] = {};
        }
        if (this._isNull(this._superior[superior][path])) {
            this._superior[superior][path] = true;
        }
    }

    private _checkSuperior(superior: string) {
        let clearList: string[] = [];
        if (this._isNull(this._superior[superior])) {
            return clearList;
        }
        for (let skey in this._superior[superior]) {
            let isHave = false;
            for (let key in this._superior) {
                if (key == superior) {
                    continue;
                }
                for (let kk in this._superior[key]) {
                    if (kk == skey) {
                        isHave = true;
                        break;
                    }
                }
                if (isHave) {
                    break;
                }
            }
            if (!isHave) {
                clearList.push(skey);
            }
        }
        return clearList;
    }

    private _checkPathSuperior(path: string, superior: string) {
        let clearList: string[] = [];
        if (this._isNull(this._superior[superior])) {
            return clearList;
        }
        let isHave = false;
        for (let key in this._superior) {
            if (key == superior) {
                continue;
            }
            for (let kk in this._superior[key]) {
                if (kk == path) {
                    isHave = true;
                    break;
                }
            }
        }
        if (!isHave) {
            clearList.push(path);
        }
        return clearList;
    }

    public preloadSpriteAtlas(path: string, superior: string, cb: Function) {
        if (this._spriteAtlas[path]) {
            this._addSuperiorData(path, superior);
            cb(path);
            return;
        }

        resources.load(path, SpriteAtlas, (err, atlas) => {
            if (err) {
                warn("loadSpriteAtlas err", err);
                cb(path);
                return;
            }
            this._spriteAtlas[path] = atlas;
            this._addSuperiorData(path, superior);
            atlas.addRef()
            cb(path);
        })
    }

    public async loadSpriteAtlas(path: string, superior: string = ""): Promise<SpriteAtlas> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<SpriteAtlas>((resolve, reject) => {
            if (this._spriteAtlas[path]) {
                this._addSuperiorData(path, superior);
                resolve(this._spriteAtlas[path]);
                return;
            }
            resources.load(path, SpriteAtlas, (err, atlas) => {
                if (err) {
                    warn("loadSpriteAtlas err", err);
                    resolve(null);
                    return;
                }
                this._spriteAtlas[path] = atlas;
                this._addSuperiorData(path, superior);
                atlas.addRef()
                resolve(atlas as SpriteAtlas);
            });
        });
    }

    public preloadSpriteFrame(path: string, superior: string, cb: Function) {
        if (this._spriteFrames[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            return;
        }
        resources.load(path + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
            if (err) {
                warn("preloadSpriteFrame err", err);
                cb(path + "*@*" + superior);
                return;
            }
            this._spriteFrames[path] = spriteFrame;
            this._addSuperiorData(path, superior);
            spriteFrame.addRef()
            cb(path + "*@*" + superior);
        })
    }

    //获取网络图片
    public async loadUrlSpriteFrame(url: string, superior: string = ""): Promise<SpriteFrame> {
        // log("loadUrlSpriteFrame", url)
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<SpriteFrame>((resolve, reject) => {
            if (this._urlSpriteFrames[url]) {
                debug("loadUrlSpriteFrame have ", url);
                this._addSuperiorData(url, superior);
                resolve(this._urlSpriteFrames[url]);
                return;
            }

            let ext = path.extname(url).toLowerCase();
            if (ext != '.png' && ext != '.jpg' && ext != '.jpeg') {
                ext = '.png'
            }
            assetManager.loadRemote(url, { ext: ext }, (err, imageAsset: ImageAsset) => {
                if (err) {
                    warn("loadUrlSpriteFrame err", err);
                    resolve(null);
                    return;
                }

                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                try {
                    texture.image = imageAsset;
                } catch (error) {
                    warn("loadUrlSpriteFrame error", "pic is not right", url);
                    resolve(null);
                    return;
                }
                spriteFrame.texture = texture;

                this._urlSpriteFrames[url] = spriteFrame;
                // warn("loadSpriteFrame nononohave ",path);
                this._addSuperiorData(url, superior);
                spriteFrame.addRef()
                resolve(spriteFrame);
            });
        });
    }

    public async getUrlSpriteFrame(url: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let sf: SpriteFrame = this._getSpriteFrame(url, superior);
        if (sf) {
            return sf;
        }
        return await this.loadUrlSpriteFrame(url, superior);
    }

    public async getUrlSpriteFrameCB(url: string, superior: string = "", cb) {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let sf: SpriteFrame = this._getSpriteFrame(url, superior);
        if (sf) {
            cb(sf);
            return sf;
        }
        sf = await this.loadUrlSpriteFrame(url, superior);
        cb(sf);
    }

    //获取Bundle图片
    public preloadBundleSpriteAtlas(path: string, superior: string, cb: Function) {
        if (this._bundleSpriteAtlas[path]) {
            this._addSuperiorData(path, superior);
            cb(path);
            return;
        }

        resources.load(path, SpriteAtlas, (err, atlas) => {
            if (err) {
                warn("loadSpriteAtlas err", err);
                cb(path);
                return;
            }
            this._bundleSpriteAtlas[path] = atlas;
            this._addSuperiorData(path, superior);
            // atlas.addRef()
            cb(path);
        })
    }

    public async loadBundleSpriteAtlas(path: string, superior: string = ""): Promise<SpriteAtlas> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<SpriteAtlas>((resolve, reject) => {
            if (this._bundleSpriteAtlas[path]) {
                this._addSuperiorData(path, superior);
                resolve(this._bundleSpriteAtlas[path]);
                return;
            }
            resources.load(path, SpriteAtlas, (err, atlas) => {
                if (err) {
                    warn("loadSpriteAtlas err", err);
                    resolve(null);
                    return;
                }
                this._bundleSpriteAtlas[path] = atlas;
                this._addSuperiorData(path, superior);
                // atlas.addRef()
                resolve(atlas as SpriteAtlas);
            });
        });
    }

    public preloadBundleSpriteFrame(path: string, superior: string, cb: Function) {
        if (!this._bundleName) {
            error("preloadBundleSpriteFrame bundleName is null");
            cb(path + "*@*" + superior);
            return;
        }
        path = this._bundleName + '/res/' + path;
        if (this._bundleSpriteFrames[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            return;
        }
        let bundle = assetManager.getBundle(this._bundleName);
        bundle.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                warn("preloadBundleSpriteFrame err", err);
                cb(path + "*@*" + superior);
                return;
            }
            this._bundleSpriteFrames[path] = spriteFrame;
            this._addSuperiorData(path, superior);
            // spriteFrame.addRef()
            cb(path + "*@*" + superior);
        })
    }

    public async loadBundleSpriteFrame(path: string, superior: string = ""): Promise<SpriteFrame> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<SpriteFrame>((resolve, reject) => {
            if (!this._bundleName) {
                error("preloadBundleSpriteFrame bundleName is null");
                resolve(null);
                return;
            }
            if (this._bundleSpriteFrames[path]) {
                warn("loadBundleSpriteFrame have ", path);
                this._addSuperiorData(path, superior);
                resolve(this._bundleSpriteFrames[path]);
                return;
            }
            let bundle = assetManager.getBundle(this._bundleName);
            bundle.load(path, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    warn("loadBundleSpriteFrame err", path, err);
                    resolve(null);
                    return;
                }
                this._bundleSpriteFrames[path] = spriteFrame;
                // warn("loadBundleSpriteFrame nononohave ",path);
                this._addSuperiorData(path, superior);
                // spriteFrame.addRef()
                resolve(spriteFrame as SpriteFrame);
            });
        });
    }

    public async getBundleSpriteFrame(url: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let path = this._bundleName + '/res/' + url;
        let sf: SpriteFrame = this._getBundleSpriteFrame(path, superior);
        if (sf) {
            return sf;
        }
        return await this.loadBundleSpriteFrame(path, superior);
    }

    public async getBundleSpriteFrameCB(url: string, superior: string = "", cb) {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let path = this._bundleName + '/res/' + url;
        let sf: SpriteFrame = this._getSpriteFrame(path, superior);
        if (sf) {
            cb(sf);
            return sf;
        }
        sf = await this.loadBundleSpriteFrame(path, superior);
        cb(sf);
    }

    public async loadSpriteFrame(path: string, superior: string = ""): Promise<SpriteFrame> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<SpriteFrame>((resolve, reject) => {
            if (this._spriteFrames[path]) {
                // warn("loadSpriteFrame have ",path);
                this._addSuperiorData(path, superior);
                resolve(this._spriteFrames[path]);
                return;
            }
            resources.load(path + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    warn("loadSpriteFrame err", path, err);
                    resolve(null);
                    return;
                }
                this._spriteFrames[path] = spriteFrame;
                // warn("loadSpriteFrame nononohave ",name);
                this._addSuperiorData(path, superior);
                spriteFrame.addRef()
                resolve(spriteFrame as SpriteFrame);
            });
        });
    }

    public async getSpriteFrame(name: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        // return this._getSpriteFarme(name);
        let sf: SpriteFrame = this._getSpriteFrame(name, superior);
        if (sf) {
            return sf;
        }
        return await this.loadSpriteFrame(name, superior);
    }

    public async getSpriteAtlas(name: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        // return this._getSpriteFarme(name);
        let sa: SpriteAtlas = this._getSpriteAtlas(name, superior);
        if (sa) {
            return sa;
        }
        return await this.loadSpriteAtlas(name, superior);
    }

    public clearObject(path: string, superior: string) {
        let clearList = this._checkPathSuperior(path, superior);
        if (this._superior[superior] && this._superior[superior][path]) {
            delete this._superior[superior][path];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._spriteFrames[clearList[i]]) {
                this._spriteFrames[clearList[i]].decRef()
                delete this._spriteFrames[clearList[i]];
            }
            else if (this._spriteAtlas[clearList[i]]) {
                this._spriteAtlas[clearList[i]].decRef()
                delete this._spriteAtlas[clearList[i]];
            }
            else if (this._bundleSpriteFrames[clearList[i]]) {
                // this._bundleSpriteFrames[clearList[i]].decRef()
                delete this._bundleSpriteFrames[clearList[i]];
            }
            else if (this._bundleSpriteAtlas[clearList[i]]) {
                // this._bundleSpriteAtlas[clearList[i]].decRef()
                delete this._bundleSpriteAtlas[clearList[i]];
            }
            else {
                if (this._urlSpriteFrames[clearList[i]]) {
                    this._urlSpriteFrames[clearList[i]].decRef()
                    delete this._urlSpriteFrames[clearList[i]];
                }
            }
        }
        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public clearBundleAllSpriteFrames(superior: string) {
        let clearList = this._checkSuperior(superior);
        for (let i = 0; i < clearList.length; ++i) {
            if (this._bundleSpriteFrames[clearList[i]]) {
                // this._bundleSpriteFrames[clearList[i]].decRef()
                delete this._bundleSpriteFrames[clearList[i]];
            }
            else if (this._bundleSpriteAtlas[clearList[i]]) {
                // this._bundleSpriteAtlas[clearList[i]].decRef()
                delete this._bundleSpriteAtlas[clearList[i]];
            }
        }
    }

    public clearSuperiorObject(superior: string) {
        let clearList = this._checkSuperior(superior);
        if (this._superior[superior]) {
            delete this._superior[superior];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._spriteFrames[clearList[i]]) {
                this._spriteFrames[clearList[i]].decRef()
                delete this._spriteFrames[clearList[i]];
            }
            else if (this._spriteAtlas[clearList[i]]) {
                this._spriteAtlas[clearList[i]].decRef()
                delete this._spriteAtlas[clearList[i]];
            }
            else if (this._bundleSpriteFrames[clearList[i]]) {
                // this._bundleSpriteFrames[clearList[i]].decRef()
                delete this._bundleSpriteFrames[clearList[i]];
            }
            else if (this._bundleSpriteAtlas[clearList[i]]) {
                // this._bundleSpriteAtlas[clearList[i]].decRef()
                delete this._bundleSpriteAtlas[clearList[i]];
            }
            else {
                if (this._urlSpriteFrames[clearList[i]]) {
                    this._urlSpriteFrames[clearList[i]].decRef()
                    delete this._urlSpriteFrames[clearList[i]];
                }
            }
        }
        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public clearAllSuperiorObject() {
        for (const key in this._superior) {
            this.clearSuperiorObject(key);

            delete this._superior[key];
        }

        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }
}
