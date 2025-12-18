import { Component, instantiate, Node, NodePool, Prefab } from "cc";
import ObjectManager from "./ObjectManager";


class PoolInfo {
    target: Prefab | Node = null;
    component: { prototype: Component } | string = null;
    nodePool: NodePool = null;

    static create(component: { prototype: Component } | string, target:Prefab | Node) {
        let poolInfo = new PoolInfo();
        poolInfo.target = target;
        poolInfo.component = component;
        poolInfo.nodePool = new NodePool(component as any);
        return poolInfo;
    }
}


/**
 * 暂时无用，可用 ObjectManager 
 */
export default class NodePoolManager {
    private static _instance: NodePoolManager = null;

    private _nodeInfoPool:any = {};
    //-----------

    /**
     * 暂时无用，可用 ObjectManager 
     */
    public static getInstance() {
        if (!this._instance) {
            this._instance = new NodePoolManager();
        }
        return this._instance;
    }

    async createNodePoolByPath(key:string, component: { prototype: Component } | string, path:string, superior: string="", count:number=50) {
        let prefab = await ObjectManager.getInstance().getObjectPrefab(path, superior);
        return this.createNodePoolByPrefab(key, component, prefab, count);
    }

    createNodePoolByPrefab(key:string, component: { prototype: Component } | string, prefab:Prefab, count:number=50){
        this._nodeInfoPool[key] = PoolInfo.create(component, prefab);
        for (let i = 0; i < count; i++) {
            this._nodeInfoPool[key].nodePool.put(instantiate(prefab));
        }
    }

    createNodePoolByNode(key:string, component: { prototype: Component } | string, target:Node, count:number=50){
        this._nodeInfoPool[key] = PoolInfo.create(component, target);
        for (let i = 0; i < count; i++) {
            this._nodeInfoPool[key].nodePool.put(instantiate(target));
        }
    }

    getNodePoolNode(key:string) {
        if (this._nodeInfoPool[key]) {
            return null;
        }
        let node:Node = null;
        if (this._nodeInfoPool[key].size()> 0) {
            node = this._nodeInfoPool[key].nodePool.get();
        }
        else {
            node = instantiate(this._nodeInfoPool[key].prefab);
        }
        return node;
    }

    getNodePoolObj(key:string){
        let node = this.getNodePoolNode(key);
        if (!node) {
            let obj = node.getComponent(this._nodeInfoPool[key].component);
            return obj;
        }

        return node;
    }

    recoverNodePoolObj(key:string, obj:Component) {
        if (this._nodeInfoPool[key]) {
            this._nodeInfoPool[key].nodePool.put(obj.node);
        }
        else {
            obj.destroy();
        }
    }

    clearNodePool(key: string) {
        if (this._nodeInfoPool[key]) {
            this._nodeInfoPool[key].nodePool.clear();
            this._nodeInfoPool[key].target = null;
            delete this._nodeInfoPool[key];
        }
    }

    clearAllNodePool() {
        for (const key in this._nodeInfoPool) {
            this._nodeInfoPool[key].nodePool.clear();
            this._nodeInfoPool[key].target = null;
        }
        this._nodeInfoPool = {};
    }
}