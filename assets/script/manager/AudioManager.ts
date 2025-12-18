import { AudioClip, AudioSource, Node, _decorator, assetManager, debug, director, game, loader, resources, url, warn } from 'cc';
import { LocalStorageKey } from "../config/Config";
import { JSB } from 'cc/env';
import ClientManager from './ClientManager';
import GameTools from '../utils/GameTools';

export default class AudioManager {
    private static _instance: AudioManager = null;

    private _audios: any = {};
    private _bundleAudios: any = {};
    private _superior: any = {};
    private _bundleName: string = "";

    private _soundCache = {};
    private _musicVolume: number = 0.5;
    private _effectVolume: number = 0.5;
    private _musicPlayId: number = -1;
    private _musicPlayName: string = "";

    private _isFmod: boolean = false;
    private _fmodCallbacks: { [key: string]: Function } = {}
    private _effectPlayIds = [];

    private _audioMusicSource: AudioSource; //cocos音效组件//背景音乐
    private _audioEffectSource: AudioSource; //cocos音效组件//音效

    public static getInstance() {
        if (!this._instance) {
            this._instance = new AudioManager();
            this._instance._init();
        }
        return this._instance;
    }

    private _isNull(arg) {
        return arg == null || arg == undefined || isNaN(arg);
    }

    private _intiCocosAudio() {
        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioMusicNode: Node = new Node();
        audioMusicNode.name = '__audioMusicMgr__';
        //@en add to the scene.
        //@zh 添加节点到场景
        director.getScene().addChild(audioMusicNode);
        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(audioMusicNode);
        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        this._audioMusicSource = audioMusicNode.addComponent(AudioSource);

        //@en create a node as audioMgr
        //@zh 创建一个节点作为 audioMgr
        let audioEffectNode: Node = new Node();
        audioEffectNode.name = '__audioEffectMgr__';
        //@en add to the scene.
        //@zh 添加节点到场景
        director.getScene().addChild(audioEffectNode);
        //@en make it as a persistent node, so it won't be destroied when scene change.
        //@zh 标记为常驻节点，这样场景切换的时候就不会被销毁了
        director.addPersistRootNode(audioEffectNode);
        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        this._audioEffectSource = audioEffectNode.addComponent(AudioSource);
    }

    private _init() {

        try {
            if (JSB && !!fmod) {
                this._isFmod = true;
            } else {
                this._isFmod = false;
            }
        } catch (error) {
            warn("%c AudioManager init try fmod error", "color:#ff1100");
            this._isFmod = false;
        }

        if (this._isFmod) {
            // fmod.FMODAudioEngine.destroyInstance();
            // warn("addEventListener")
            // fmod.FMODAudioEngine.getInstance().addEventListener(()=>{
            //     warn("addEventListener do")
            // });
            let eventName = "sound_event";
            game.off(eventName);
            game.on(eventName, (ed:any) => {
                if (ed) {
                    warn("sound_event", ed.soundID)
                    this._fmodEventCallback(ed.soundID, ed.eventType);
                }
            })
        } else {
            this._intiCocosAudio();
        }

        if (!GameTools.getInstance().getLocalStorageItem(LocalStorageKey.BgmVolume)) {
            GameTools.getInstance().setLocalStorageItem(LocalStorageKey.BgmVolume, "0.5");
        }
        if (!GameTools.getInstance().getLocalStorageItem(LocalStorageKey.EffectVolume)) {
            GameTools.getInstance().setLocalStorageItem(LocalStorageKey.EffectVolume, "0.5");
        }

        this._musicVolume = parseFloat(GameTools.getInstance().getLocalStorageItem(LocalStorageKey.BgmVolume));
        this._effectVolume = parseFloat(GameTools.getInstance().getLocalStorageItem(LocalStorageKey.EffectVolume));


        if (this._isFmod) {
            fmod.FMODAudioEngine.getInstance().setMusicVolume(this._musicVolume);
            fmod.FMODAudioEngine.getInstance().setEffectVolume(this._effectVolume);
        } else {
            // this._audioMusicSource.setMaxAudioInstance(15);
            this._audioMusicSource.volume = this._musicVolume;
            this._audioEffectSource.volume = this._effectVolume;
        }
    }

    private _fmodEventCallback(audioId: number, endType: number) {
        let cb = this._fmodCallbacks[audioId];
        warn("addEventListener", audioId, endType, !!cb)
        if (cb) {
            cb();
            delete this._fmodCallbacks[audioId];
        }
    }

    public setBundleName(bundleName: string) {
        if (this._bundleName) {
            this.clearBundleAllAudios(ClientManager.getInstance().getCurGameType())
            this._bundleName = "";
        }
        this._bundleName = bundleName;
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

    public clearBundleObject(path: string, superior: string) {
        let clearList = this._checkPathSuperior(path, superior);
        if (this._superior[superior] && this._superior[superior][path]) {
            delete this._superior[superior][path];
        }
        for (let i = 0; i < clearList.length; ++i) {
            if (this._bundleAudios[clearList[i]]) {
                delete this._bundleAudios[clearList[i]];
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
            if (this._audios[clearList[i]]) {
                this._audios[clearList[i]].decRef()
                delete this._audios[clearList[i]];
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

    public clearBundleAllAudios(superior: string) {
        let clearList = this._checkSuperior(superior);
        for (let i = 0; i < clearList.length; ++i) {
            if (this._bundleAudios[clearList[i]]) {
                delete this._bundleAudios[clearList[i]];
            }
            else if (this._bundleAudios[clearList[i]]) {
                delete this._bundleAudios[clearList[i]];
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
    private _getBundleAudio(name: string, superior: string): AudioClip {
        if (this._bundleAudios[name]) {
            this._addSuperiorData(name, superior);
            return this._bundleAudios[name];
        }
        return null;
    }
    public async getBundleAudio(name: string, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }
        let path = this._bundleName + '/sound/' + name;
        let sf: AudioClip = this._getBundleAudio(path, superior);
        if (sf) {
            return sf;
        }
        return await this.loadBundleAudio(path, superior);
    }

    public async loadBundleAudio(path: string, superior: string): Promise<AudioClip> {
        return new Promise<AudioClip>((resolve, reject) => {
            if (this._bundleAudios[path]) {
                this._addSuperiorData(path, superior);
                resolve(this._bundleAudios[path]);
                return;
            }
            let bundle = assetManager.getBundle(this._bundleName)
            bundle.load(path, AudioClip, (err, audio) => {
                if (err) {
                    warn("loadBundleAudio err", err);
                    resolve(null);
                    return;
                }
                this._bundleAudios[path] = audio;
                this._addSuperiorData(path, superior);
                audio.addRef()
                resolve(audio as AudioClip);
            });
        });
    }

    getMusicOpenState() {
        let localMusicOpenState = GameTools.getInstance().getLocalStorageItem(LocalStorageKey.MusicOpenState);
        if (!localMusicOpenState) {
            localMusicOpenState = "true";
        }
        return localMusicOpenState == "true";
    }
    setMusicOpenState(state) {
        GameTools.getInstance().setLocalStorageItem(LocalStorageKey.MusicOpenState, !!state ? "true" : "false");

        if (!state) {
            this.stopBgMusic();
        } else {
            this.playBgMusic(this._musicPlayName);
        }
    }
    getEffectOpenState() {

        let localEffectOpenState = GameTools.getInstance().getLocalStorageItem(LocalStorageKey.EffectOpenState);
        if (!localEffectOpenState) {
            localEffectOpenState = "true";
        }
        return localEffectOpenState == "true";

    }
    setEffectOpenState(state) {
        GameTools.getInstance().setLocalStorageItem(LocalStorageKey.EffectOpenState, !!state ? "true" : "false");
    }

    setMusicVolume(musicVolume: number) {

        GameTools.getInstance().setLocalStorageItem(LocalStorageKey.BgmVolume, musicVolume.toString());
        this._musicVolume = musicVolume;
        if (this._isFmod) {
            fmod.FMODAudioEngine.getInstance().setMusicVolume(this._musicVolume);
        } else {
            this._audioMusicSource.volume = this._musicVolume;
        }
    }

    setEffectVolume(effectVolume: number) {
        GameTools.getInstance().setLocalStorageItem(LocalStorageKey.EffectVolume, effectVolume.toString());
        this._effectVolume = effectVolume;
        if (this._isFmod) {
            fmod.FMODAudioEngine.getInstance().setEffectVolume(this._effectVolume);
        } else {
            this._audioEffectSource.volume = this._effectVolume;
        }
    }

    getMusicVolume() {
        return this._musicVolume;
    }

    getEffectVolume() {
        return this._effectVolume;
    }

    private _removeEffectAudio(id) {
        // if (this._isFmod) {
        //     //
        // } else {

        // }

        let idx = this._effectPlayIds.indexOf(id);
        if (idx > -1) {
            this._effectPlayIds.splice(idx, 1);
        }
        // warn(" playEffect _removeEffectAudio remove id", id,"_maxNum =", this._effectPlayIds.length);
    }

    public playEffectByName(name: string) {
        let mn = "sound/" + name;
        this.playEffect(mn);
    }

    playEffect(audioName: string, cb: Function = null) {
        if (!audioName) {
            return -1;
        }
        if (!this.getEffectOpenState()) {
            return -1;
        }
        if (this._effectVolume <= 0) {
            return -1;
        }

        let audioID = -1;
        if (this._isFmod) {
            let nativeUrl = (<any>url).raw("resources/" + audioName + ".mp3");//since v3.0 url is deprecated
            if (loader.md5Pipe) {
                nativeUrl = loader.md5Pipe.transformURL(nativeUrl);
            }
            audioID = fmod.FMODAudioEngine.getInstance().playEffect(nativeUrl, false);
            this._fmodCallbacks[audioID] = () => {
                // warn("playEffect setFinishCallback", id);
                this._removeEffectAudio(audioID);
                if (cb) {
                    cb();
                }
            }
            this._effectPlayIds.push(audioID);

        } else {
            let audio = this._soundCache[audioName];
            if (audio) {
                this._audioEffectSource.playOneShot(audio, 1);
            } else {
                if (this._soundCache[audioName] === null) {
                    return;
                }
                this._soundCache[audioName] = null;
                resources.load(audioName, (err, clip: AudioClip) => {
                    if (err) {
                        warn(err);
                    }
                    else {
                        this._soundCache[audioName] = clip;
                        this._audioEffectSource.playOneShot(clip, 1);
                    }
                });
            }
        }

        return audioID;
    }

    public async playBundleEffect(name: string, cb: Function = null, superior: string = "") {
        if (!superior) {
            superior = ClientManager.getInstance().getCurGameType();
        }

        warn("playBundleEffect", name)

        let id = -1;
        if (this._isFmod) {
            let mn = name;//FilePathsConfig.Sound + name;
            warn("playBundleEffect1", this._bundleName + "/" + mn)
            let bundle = assetManager.getBundle(this._bundleName)
            bundle.load(this._bundleName + "/" + mn, AudioClip, (err, data: AudioClip) => {
                if (err) {
                    warn("playBundleEffect nativeUrl err", err.toString(), this._bundleName + "/" + mn + ".mp3")
                    return
                }
                // warn("playBundleEffect data.nativeUrl",data.nativeUrl);
                let nativeUrl = data.nativeUrl;
                if (loader.md5Pipe) {
                    nativeUrl = loader.md5Pipe.transformURL(nativeUrl);
                }
                id = fmod.FMODAudioEngine.getInstance().playEffect(nativeUrl, false);
                this._fmodCallbacks[id] = () => {
                    // warn("playEffect setFinishCallback", id);
                    this._removeEffectAudio(id);
                    if (cb) {
                        cb();
                    }
                }
            })
            this._effectPlayIds.push(id);

        } else {
            warn("playBundleEffect2", this._bundleName + "/")
            let audio = await this.getBundleAudio(name, superior);
            if (audio) {
                this._audioEffectSource.playOneShot(audio, 1);
            }
        }

        return id;
    }

    playBgMusic(audioName: string, isLoop: boolean = true, cb: Function = null) {
        this._musicPlayName = audioName;

        if (!this.getMusicOpenState()) {
            return -1;
        }
        if (this._musicVolume <= 0) {
            return -1;
        }

        if (this._musicPlayId != -1) {
            this.stopBgMusic();
            this._musicPlayId = -1;
        }

        if (this._isFmod) {
            let nativeUrl = (<any>url).raw("resources/" + audioName + ".mp3");
            if (loader.md5Pipe) {
                nativeUrl = loader.md5Pipe.transformURL(nativeUrl);
            }
            this._musicPlayId = fmod.FMODAudioEngine.getInstance().playMusic(nativeUrl, isLoop);
            warn("playMusic nativeUrl", nativeUrl, this._musicPlayId)
            if (cb) {
                this._fmodCallbacks[this._musicPlayId] = () => {
                    cb();
                }
            }
        } else {
            let audio = this._soundCache[audioName];
            // if (audio) {
            //     this._musicPlayId = this._audioMusicSource.playMusic(audio, isLoop);
            //     if (cb) {
            //         this._audioMusicSource.setFinishCallback(this._musicPlayId, () => {
            //             cb();
            //         });
            //     }
            // } else {
            //     this._musicPlayId = -1;
            // }
            if (audio) {
                this._audioMusicSource.play();
            }
            else {
                if (this._soundCache[audioName] === null) {
                    return;
                }
                
                this._soundCache[audioName] = null;

                resources.load(audioName, (err, clip: AudioClip) => {
                    if (err) {
                        warn(err);
                    }
                    else {
                        this._soundCache[audioName] = clip;
                        // this._audioMusicSource.stop();
                        // this._audioMusicSource.clip.destroy();

                        this._audioMusicSource.clip = clip;
                        this._audioMusicSource.loop = true;
                        this._audioMusicSource.playOnAwake = true;
                        this._audioMusicSource.play();
                        this._musicPlayId = 0;
                    }
                });
            }
        }

        return this._musicPlayId;
    }

    stopBgMusic() {
        if (this._musicPlayId >= 0) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().stopSound(this._musicPlayId);
            } else {
                this._audioMusicSource.stop();
            }
        }
        this._musicPlayId = -1;
    }

    resumeBgMusic() {
        if (this._musicPlayId >= 0) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().resumeSound(this._musicPlayId);
            } else {
                this._audioMusicSource.play();
            }
        }
    }

    pauseBgMusic() {
        if (this._musicPlayId >= 0) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().pauseSound(this._musicPlayId);
            } else {
                this._audioMusicSource.pause();
            }
        }
    }

    public stopEffect(audioId: number) {
        let idx = this._effectPlayIds.indexOf(audioId);
        if (idx > -1) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().stopSound(audioId);
            } else {
                this._audioEffectSource.stop();
            }
        }
    }

    public pauseEffect(audioId: number) {
        let idx = this._effectPlayIds.indexOf(audioId);
        if (idx > -1) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().pauseSound(audioId);
            } else {
                this._audioEffectSource.pause();
            }
        }
    }

    public resumeEffect(audioId: number) {
        let idx = this._effectPlayIds.indexOf(audioId);
        if (idx > -1) {
            if (this._isFmod) {
                fmod.FMODAudioEngine.getInstance().resumeSound(audioId);
            } else {
                this._audioEffectSource.play();
            }
        }
    }

    public stopAllEffect() {
        if (this._isFmod) {
            for (let i = 0; i < this._effectPlayIds.length; i++) {
                let eid = this._effectPlayIds[i];
                fmod.FMODAudioEngine.getInstance().stopSound(eid);
            }
        } else {
            this._audioEffectSource.stop();
        }
        this._effectPlayIds.length = 0;
    }

    public stopAllSounds() {
        if (this._isFmod) {
            fmod.FMODAudioEngine.getInstance().stopAllSounds();
            this._musicPlayId = -1;
            this._effectPlayIds.length = 0;
            // fmod.FMODAudioEngine.getInstance().releaseAllSounds();
        } else {
            // this.stopMusic();
            // this.stopAllEffect();

            this._audioMusicSource.stop();
            this._audioEffectSource.stop();
        }
    }

    // 暂时不预加载 //方法保留
    public preloadAudio(path: string, superior: string, cb: Function) {
        cb(path + "*@*" + superior);
    }

    loadSound(soundPath: string, callback: Function = null, isAutoPlayEffect = true) {
        if (!soundPath) {
            return;
        }

        if (this._soundCache[soundPath]) {
            if (isAutoPlayEffect) {
                this.playEffect(soundPath);
            }
            callback && callback();
        } else {
            if (this._isFmod) {
                // fmod.FMODAudioEngine.getInstance().preload(soundPath, 0);
                if (isAutoPlayEffect) {
                    this.playEffect(soundPath);
                }
                callback && callback();
            } else {
                resources.load(soundPath, AudioClip, (err, audio) => {
                    if (err) {
                        warn("%c loadSound err" + err, "color:#ff1100");
                        return;
                    }

                    this._soundCache[soundPath] = audio as AudioClip;
                    if (isAutoPlayEffect) {
                        this.playEffect(soundPath);
                    }
                    callback && callback();
                });
            }
        }
    }

}

