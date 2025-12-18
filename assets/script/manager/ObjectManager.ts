
import { Component, Node, NodePool, Prefab, __private, debug, instantiate, isValid, log, resources, warn } from "cc";
import ClientManager from "./ClientManager";


export default class ObjectManager {
    private _prefabs: any = {};
    private _objPools: any = {};
    private _superior: any = {};

    private static _instance: ObjectManager = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new ObjectManager();
        }
        return this._instance;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || isNaN(arg);
    }

    private _getObjectFromPool(path: string) {
        if (this._objPools[path]) {
            return this._objPools[path].get();
        }
        return null;
    }

    private _getObjectComponent(node: Node, component: any) {
        let script = null;
        if (node) {
            script = node.getComponent(component);
        }
        return script;
    }

    private _putObjectToPool(path: string, component: { prototype: Component } | string, node: Node) {
        if (!node || !isValid(node, true)) {
            return;
        }
        if (!this._objPools[path]) {
            this._objPools[path] = new NodePool(component as any);
        }
        this._objPools[path].put(node);
    }

    private _removeObjectPool(path: string | string[]) {
        if (Array.isArray(path)) {
            for (let i = 0; i < path.length; ++i) {
                if (!this._objPools[path[i]]) {
                    if (this._objPools[path[i]]) {
                        this._objPools[path[i]].clear();
                    }
                    delete this._objPools[path[i]];
                    delete this._prefabs[path[i]];
                }
            }
        }
        else {
            if (!this._objPools[path]) {
                if (this._objPools[path]) {
                    this._objPools[path].clear();
                }
                delete this._objPools[path];
                delete this._prefabs[path];
            }
        }

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
        let clearList = [];
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

    public preloadObjectNode(path: string, superior: string, cb: Function) {
        debug("%c preloadObjectNode preladed" + path, "color:#01f010", new Date().getTime())
        if (this._prefabs[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            debug("%c preloadObjectNode preladed" + path, "color:#01f010")
            return;
        }

        resources.load(path, Prefab, (err, prefab) => {
            if (err) {
                warn("%c getObjectNode err" + path + err, "color:#ff0000");
                cb(path + "*@*" + superior);
                return;
            }
            debug("%c preloadObjectNode preladed over " + path, "color:#01f010", new Date().getTime())
            this._prefabs[path] = prefab;
            this._addSuperiorData(path, superior);
            prefab.addRef()
            cb(path + "*@*" + superior);
        });
    }

    public async getObjectPrefab(path: string, superior: string = ""): Promise<Prefab> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<Prefab>((resolve, reject) => {
            if (this._prefabs[path]) {
                this._addSuperiorData(path, superior);

                resolve(this._prefabs[path]);
                return;
            }
            resources.load(path, Prefab, (err, prefab) => {
                if (err) {
                    warn("%c getObjectNode err" + path + err, "color:#ff0000");
                    resolve(null);
                    return;
                }
                this._prefabs[path] = prefab;
                this._addSuperiorData(path, superior);
                prefab.addRef()

                resolve(prefab as Prefab);
            });
        });
    }

    public async getObjectNode(path: string, superior: string = ""): Promise<Node> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<Node>((resolve, reject) => {
            if (this._prefabs[path]) {
                this._addSuperiorData(path, superior);
                let node: Node = this._getObjectFromPool(this._prefabs[path]);
                if (!node) {
                    node = instantiate(this._prefabs[path]);
                }
                resolve(node);
                return;
            }
            resources.load(path, Prefab, (err, prefab) => {
                if (err) {
                    warn("%c getObjectNode err" + path + err, "color:#ff0000");
                    resolve(null);
                    return;
                }
                this._prefabs[path] = prefab;
                this._addSuperiorData(path, superior);
                prefab.addRef()

                let node: Node = this._getObjectFromPool(path);
                if (!node) {
                    node = instantiate(prefab as Prefab);
                }
                resolve(node);
            });
        });
    }

    private _getComponent(node: Node, component: { prototype: Component } | string) {
        let script = this._getObjectComponent(node, component);
        return script;
    }
    //使用回调的方式 异步加载
    public getObjectByCallback(path: string, component: { prototype: Component } | string, superior: string = "", cb: Function) {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }

        if (this._prefabs[path]) {
            this._addSuperiorData(path, superior);
            let node: Node = this._getObjectFromPool(this._prefabs[path]);
            if (!node) {
                node = instantiate(this._prefabs[path]);
            }
            let script = this._getComponent(node, component);
            cb(script);
            return;
        }

        resources.load(path, Prefab, (err, prefab) => {
            if (err) {
                warn("%c getObjectNode err" + path + err, "color:#ff0000");
                cb(null);
                return;
            }
            this._prefabs[path] = prefab;
            this._addSuperiorData(path, superior);
            prefab.addRef()

            let node: Node = this._getObjectFromPool(path);
            if (!node) {
                node = instantiate(prefab as Prefab);
            }
            let script = this._getComponent(node, component);
            cb(script);
        });
    }

    public async getObject(path: string, component: { prototype: Component } | string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let node = await this.getObjectNode(path, superior);
        if (!node) {
            return null;
        }
        let script = this._getObjectComponent(node, component);
        return script;
    }

    // public putObjectNodeToPool(node: Node, component: { prototype: Component } | string, path: string) {
    //     this._putObjectToPool(path, component, node);
    // }

    public clearObject(path: string, superior: string) {
        let clearList = this._checkPathSuperior(path, superior);
        if (this._superior[superior] && this._superior[superior][path]) {
            delete this._superior[superior][path];
        }
        for (let i = 0; i < clearList.length; ++i) {
            this._prefabs[clearList[i]].decRef()
        }
        this._removeObjectPool(clearList);
        // MemoryManager.getInstance().removeMeoryAsset(clearList);
    }

    public clearSuperiorObject(superior: string) {
        let clearList = this._checkSuperior(superior);
        if (this._superior[superior]) {
            delete this._superior[superior];
        }
        for (let i = 0; i < clearList.length; ++i) {
            this._prefabs[clearList[i]].decRef()
        }
        this._removeObjectPool(clearList);
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
