import { SpriteFrame } from "cc";
import { js, sp, sys, v2 } from "cc";
import { EDITOR } from "cc/env";

(function () {
    if (EDITOR) {
        //spine在编辑器中运行(需要在编辑器中一直按右键才会播放)
        js.mixin(sp.Skeleton.prototype, {
            updateAnimation(dt) {
                this.markForUpdateRenderData();
                // if (EDITOR_NOT_IN_PREVIEW) return;
                var timeScale = timeScale || 1.0;
                if (this.paused) return;
                dt *= this._timeScale * timeScale;
                if (this.isAnimationCached()) {
                    if (this._isAniComplete) {
                        if (this._animationQueue.length === 0 && !this._headAniInfo) {
                            const frameCache = this._animCache;
                            if (frameCache && frameCache.isInvalid()) {
                                frameCache.updateToFrame(0);
                                const frames = frameCache.frames;
                                this._curFrame = frames[frames.length - 1];
                            }
                            return;
                        }
                        if (!this._headAniInfo) {
                            this._headAniInfo = this._animationQueue.shift();
                        }
                        this._accTime += dt;
                        if (this._accTime > this._headAniInfo?.delay) {
                            const aniInfo = this._headAniInfo;
                            this._headAniInfo = null;
                            this.setAnimation(0, aniInfo?.animationName, aniInfo?.loop);
                        }
                        return;
                    }
                    this._updateCache(dt);
                } else {
                    this._instance.updateAnimation(dt);
                }
            }
        });
    }
})();
