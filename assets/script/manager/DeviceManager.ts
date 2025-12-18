import { _decorator, debug, error, game, native, sys, warn } from 'cc';
import { JSB } from 'cc/env';

export default class DeviceManager {
    private static _instance: DeviceManager = null;

    private _className: string = "";
    public static getInstance() {
        if (!this._instance) {
            this._instance = new DeviceManager();
            this._instance._init();
        }
        return this._instance;
    }
    private _init() {
        if (JSB) {
            if (sys.os == sys.OS.IOS) {
                this._className = "DeviceModule";
            }
            else if (sys.os == sys.OS.ANDROID) {
                this._className = "com.game.device.DeviceModule";
            }
        }
        else {
            //todo
        }
    }
    public initPermission() {
        warn("initPermission");

        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                native.reflection.callStaticMethod(this._className, "initPermission", "()V");
            } else if (sys.os === sys.OS.IOS) {

            }
        } else {
            //todo
        }
    }
    public openUrl(url) {
        if (!url) {
            return;
        }
        sys.openURL(url);
    }
    public openWechat() {
        sys.openURL('weixin://');
    }
    public openQQ(qqStr) {
        sys.openURL('mqqwpa://im/chat');
    }
    public openDingding() {
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                sys.openURL('dingtalk://qr.dingtalk.com/ding/home.html');
            } else if (sys.os === sys.OS.IOS) {
                sys.openURL('dingtalk://');
            }
        } else {
            //todo
        }
    }
    /** 打开系统设置 */
    public openSysSetting() {
        warn("openSysSetting");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "openSysSetting", "()V");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "openSysSetting", null);
            }
        } else {
            //todo
        }
    }
    /** 获取设备名字 */
    public getDeviceName(): string {
        warn("getDeviceName");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getDeviceName", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getDeviceName", null);
            }
        } else {
            //todo
        }
        return 'other';
    }
    /** 获取手机操作系统版本信息 */
    public getSystemVersion(): string {
        warn("getSystemVersion");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getSystemVersion", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getSystemVersion", null);
            }
        } else {
            //todo
        }
        return 'win32';
    }
    /** 获取getImeiOrIdfa 设备识别码 */
    public getImeiOrIdfa() {
        warn("getImeiOrIdfa");
        let token = ""
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                token = native.reflection.callStaticMethod(this._className, "getUserToken", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                token = native.reflection.callStaticMethod("DeviceModule", "getUserToken", null);
            }
        } else {
            //todo
        }
    }
    public getMacAddress() {
        warn("getMacAddress");
        let mac = ""
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                mac = native.reflection.callStaticMethod(this._className, "getMacAddress", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                mac = native.reflection.callStaticMethod("DeviceModule", "getMacAddress", null);
            }
        } else {
            //todo
        }

        if (!mac) {
            mac = "mac:unknow";
        }

        return mac;
    }
    /** 获取应用的vercode */
    public getAppVerCode(): string {
        warn("getAppVerCode");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getAppVerCode", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getAppVerCode", null);
            }
        } else {
            //todo
        }
        return '1';
    }
    /** 获取app版本号 */
    public getAppVersion(): string {
        warn("getAppVersion");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getAppVersion", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getAppVersion", null);
            }
        } else {
            //todo
        }
        return '0.0.1';
    }
    /** 获取电池电量 返回值是0-1之间的浮点数，1表示满电 */
    public getBatteryLevel(): number {
        warn("getBatteryLevel");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getBatteryLevel", "()F");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getBatteryLevel", null);
            }
        } else {
            //todo
        }
        return 1;
    }
    //获取网络状态 返回结果为字符串 "wifi" "wwan" "none"
    //wifi是无线网络，wwan是移动网络流量 none是无网络
    public getNetworkStatus(): string {
        warn("getNetworkStatus");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "getNetworkStatus", "()Ljava/lang/String;");
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "getNetworkStatus", null);
            }
        } else {
            //todo
        }
        return 'none';
    }
    mobileShake(timeMs) {
        warn("mobileShake");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                native.reflection.callStaticMethod(this._className, "mobileShake", "(I)V", timeMs);
            } else if (sys.os === sys.OS.IOS) {
                native.reflection.callStaticMethod("DeviceModule", "mobileShake:", timeMs);
            }
        } else {
            //todo
        }
    }
    //复制文字到粘贴板
    copyText(copyText: string = '') {
        warn("copyText", copyText);
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                native.reflection.callStaticMethod(this._className, "copyText", "(Ljava/lang/String;)V", copyText);
            } else if (sys.os === sys.OS.IOS) {
                native.reflection.callStaticMethod("DeviceModule", "copyText:", copyText);
            } else if (sys.os === sys.OS.WINDOWS) {
                native.copyTextToClipboard(copyText);
            }
        } else {
            let textToClipboard = copyText; //文本到剪贴板

            let success = false;
            if (window['clipboardData']) { // 浏览器
                window['clipboardData'].setData("Text", textToClipboard);
                success = true;
            }
            else {
                let input = copyText + '';
                const el = document.createElement('textarea');
                el.value = input;
                el.setAttribute('readonly', '');
                el.style['contain'] = 'strict';
                el.style['position'] = 'absolute';
                el.style['left'] = '-9999px';
                el.style['fontSize'] = '12pt'; // Prevent zooming on iOS

                const selection = getSelection();
                let originalRange = null;
                if (selection.rangeCount > 0) {
                    originalRange = selection.getRangeAt(0);
                }
                document.body.appendChild(el);
                el.select();
                el.selectionStart = 0;
                el.selectionEnd = input.length;

                try {
                    success = document.execCommand('copy', false);
                } catch (err) {
                    error("ClipboardJS err " + err);
                }

                document.body.removeChild(el);

                if (originalRange) {
                    selection.removeAllRanges();
                    selection.addRange(originalRange);
                }
            }
        }
    }
    //
    /**
     * 获取粘贴板文字
     * @param callback 
     * @returns 
     */
    pasteText(): string {
        warn("pasteText");
        if (JSB) {
            if (sys.os === sys.OS.ANDROID) {
                return native.reflection.callStaticMethod(this._className, "pasteText", "()Ljava/lang/String;") || "";
            } else if (sys.os === sys.OS.IOS) {
                return native.reflection.callStaticMethod("DeviceModule", "pasteText", null) || "";
            } else if (sys.os === sys.OS.WINDOWS) {
                return native.getTextFromClipboard();
            }
        } else {
            //todo
        }
        return "";
    }
}

