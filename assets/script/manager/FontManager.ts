
import { Font, assetManager, debug, error, resources, warn } from "cc";
import ClientManager from "./ClientManager";


export default class FontManager {
    private _fontDatas: any = {};
    private _bundleFontDatas: any = {};
    private _superior: any = {};

    private _bundleName: string = "";
    private _defaultFunt: Font = null;

    private static _instance: FontManager = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new FontManager();
        }
        return this._instance;
    }

    public setBundleName(bundleName: string) {
        if (this._bundleName) {
            this.clearBundleAllFonts(ClientManager.getInstance().getCurGameType())
            this._bundleName = "";
        }
        this._bundleName = bundleName;
    }

    public initDefaultFont(defaultFont: Font) {
        this._defaultFunt = defaultFont;
    }

    public getDefaultFont() {
        return this._defaultFunt;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || Number.isNaN(arg);
    }

    private _getFont(name: string, superior: string): Font {
        if (this._fontDatas[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._fontDatas[name];
        }

        return null;
    }

    private _getBundleFont(name: string, superior: string): Font {
        if (this._bundleFontDatas[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._bundleFontDatas[name];
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

    public preloadFontAsset(path: string, superior: string, cb: Function) {
        if (this._fontDatas[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            return;
        }
        resources.load(path, Font, (err, fontAsset) => {
            if (err) {
                warn("preloadFontAsset err", err);
                cb(path + "*@*" + superior);
                return;
            }
            this._fontDatas[path] = fontAsset;
            this._addSuperiorData(path, superior);
            fontAsset.addRef()
            cb(path + "*@*" + superior);
        })
    }

    public async loadFontAsset(path: string, superior: string = ""): Promise<Font> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<Font>((resolve, reject) => {
            if (this._fontDatas[path]) {
                warn("loadFontAsset have ", path);
                this._addSuperiorData(path, superior);
                resolve(this._fontDatas[path]);
                return;
            }
            resources.load(path, Font, (err, fontAsset) => {
                if (err) {
                    warn("loadFontAsset err", err);
                    resolve(null);
                    return;
                }
                this._fontDatas[path] = fontAsset;
                // warn("loadFontAsset nononohave ",path);
                this._addSuperiorData(path, superior);
                fontAsset.addRef()
                resolve(fontAsset as Font);
            });
        });
    }

    public async getFontAsset(name: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        // return this._getSpriteFarme(name);
        let sf: Font = this._getFont(name, superior);
        if (sf) {
            return sf;
        }
        return await this.loadFontAsset(name, superior);
    }

    public preloadBundleFont(path: string, superior: string, cb: Function) {
        if (!this._bundleName) {
            error("preloadBundleFont bundleName is null");
            cb(path + "*@*" + superior);
            return;
        }
        if (this._bundleFontDatas[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            return;
        }
        let bundle = assetManager.getBundle(this._bundleName);
        bundle.load(path, Font, (err, font) => {
            if (err) {
                warn("preloadBundleFont err", err);
                cb(path + "*@*" + superior);
                return;
            }
            this._bundleFontDatas[path] = font;
            this._addSuperiorData(path, superior);
            font.addRef()
            cb(path + "*@*" + superior);
        })
    }

    public async loadBundleFont(path: string, superior: string = ""): Promise<Font> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<Font>((resolve, reject) => {
            if (!this._bundleName) {
                error("preloadBundleFont bundleName is null");
                resolve(null);
                return;
            }
            if (this._bundleFontDatas[path]) {
                warn("loadBundleFont have ", path);
                this._addSuperiorData(path, superior);
                resolve(this._bundleFontDatas[path]);
                return;
            }
            let bundle = assetManager.getBundle(this._bundleName);
            bundle.load(path, Font, (err, font) => {
                if (err) {
                    warn("loadBundleFont err", path, err);
                    resolve(null);
                    return;
                }
                this._bundleFontDatas[path] = font;
                // warn("loadBundleFont nononohave ",path);
                this._addSuperiorData(path, superior);
                font.addRef()
                resolve(font as Font);
            });
        });
    }

    public async getBundleFont(url: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let sf: Font = this._getBundleFont(url, superior);
        if (sf) {
            return sf;
        }
        return await this.loadBundleFont(url, superior);
    }

    public clearBundleAllFonts(superior: string) {
        let clearList = this._checkSuperior(superior);
        for (let i = 0; i < clearList.length; ++i) {
            if (this._bundleFontDatas[clearList[i]]) {
                delete this._bundleFontDatas[clearList[i]];
            }
        }
    }

    public clearObject(path: string, superior: string) {
        let clearList = this._checkPathSuperior(path, superior);
        if (this._superior[superior] && this._superior[superior][path]) {
            delete this._superior[superior][path];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._fontDatas[clearList[i]]) {
                this._fontDatas[clearList[i]].decRef()
                delete this._fontDatas[clearList[i]];
            }
        }
        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public clearSuperiorObject(superior: string) {
        let clearList = this._checkSuperior(superior);
        if (this._superior[superior]) {
            delete this._superior[superior];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._fontDatas[clearList[i]]) {
                this._fontDatas[clearList[i]].decRef()
                delete this._fontDatas[clearList[i]];
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
