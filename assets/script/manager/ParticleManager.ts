
import { Node, ParticleAsset, ParticleSystem, ParticleSystem2D, debug, resources, warn } from "cc";
import ClientManager from "./ClientManager";


export default class ParticleManager {
    private _particleDatas: any = {};
    private _superior: any = {};

    private static _instance: ParticleManager = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new ParticleManager();
        }
        return this._instance;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || Number.isNaN(arg);
    }

    private _getParticle(name: string, superior: string): ParticleAsset {
        if (this._particleDatas[name]) {
            // warn("_getSpriteFarme",name);
            this._addSuperiorData(name, superior);
            return this._particleDatas[name];
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

    public preloadParticleAsset(path: string, superior: string, cb: Function) {
        if (this._particleDatas[path]) {
            this._addSuperiorData(path, superior);
            cb(path + "*@*" + superior);
            return;
        }
        resources.load(path, ParticleAsset, (err, particleAsset) => {
            if (err) {
                warn("preloadParticleAsset err", err);
                cb(path + "*@*" + superior);
                return;
            }
            this._particleDatas[path] = particleAsset;
            this._addSuperiorData(path, superior);
            particleAsset.addRef()
            cb(path + "*@*" + superior);
        })
    }

    public async loadParticleAsset(path: string, superior: string = ""): Promise<ParticleAsset> {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        return new Promise<ParticleAsset>((resolve, reject) => {
            if (this._particleDatas[path]) {
                warn("loadParticleAsset have ", path);
                this._addSuperiorData(path, superior);
                resolve(this._particleDatas[path]);
                return;
            }
            resources.load(path, ParticleAsset, (err, particleAsset) => {
                if (err) {
                    warn("loadParticleAsset err", err);
                    resolve(null);
                    return;
                }
                this._particleDatas[path] = particleAsset;
                // warn("loadParticleAsset nononohave ",path);
                this._addSuperiorData(path, superior);
                particleAsset.addRef()
                resolve(particleAsset as ParticleAsset);
            });
        });
    }

    public async getParticleAsset(name: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        // return this._getSpriteFarme(name);
        let sf: ParticleAsset = this._getParticle(name, superior);
        if (sf) {
            return sf;
        }
        return await this.loadParticleAsset(name, superior);
    }

    public async getParticleObject(path: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let particle = new Node().addComponent(ParticleSystem2D);
        particle.positionType = ParticleSystem2D.PositionType.RELATIVE;
        particle.file = await this.getParticleAsset(path);
        return particle;
    }

    public clearObject(path: string, superior: string) {
        let clearList = this._checkPathSuperior(path, superior);
        if (this._superior[superior] && this._superior[superior][path]) {
            delete this._superior[superior][path];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._particleDatas[clearList[i]]) {
                this._particleDatas[clearList[i]].decRef()
                delete this._particleDatas[clearList[i]];
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
            if (this._particleDatas[clearList[i]]) {
                this._particleDatas[clearList[i]].decRef()
                delete this._particleDatas[clearList[i]];
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
