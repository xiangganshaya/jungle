import { _decorator, debug, error, log } from 'cc';
import { HttpConfig, HttpRequestModel, HttpStatus } from '../../../config/HttpConfig';
import HttpManager from '../net/HttpManager';
import { Config } from '../../../config/Config';
import UserManager from './UserManager';
import WindowManager from '../../../manager/WindowManager';
import { WinId } from '../../../config/WindowConfig';
import GameTools from '../../../utils/GameTools';
import SubGameCtrl from '../subCtrls/SubGameCtrl';

const b64Str = '0ABCDEFGHI1JKLMNOPQRST2UVWX3YZ4abc5defgh6ijklmno7pqrs8tuvw9xyz';

export default class SubGameUtil {
    private static _instance: SubGameUtil = null;

    private _rawValue: string = '';
    private _randomStr: string = '';

    //--------------

    public static getInstance() {
        if (!this._instance) {
            this._instance = new SubGameUtil();
        }
        return this._instance;
    }

    public async setRawBalue(raw: string) {
        this._rawValue = raw;

        this._rawValue = this._calKey();
    }

    private _calKey(): string {
        let ms = GameTools.getInstance().getStringMD5(this._rawValue, true);
        ms = GameTools.getInstance().getStringMD5(this._rawValue.substring(4, 8) + ms.substring(10));

        //复杂的字符转换算法
        const charPool: string[] = [];
        for (let i = 0; i < ms.length; i += 2) {
            const hexPair = ms.substring(i, i + 2);
            const value = parseInt(hexPair, 16);

            // 确定性转换算法
            // const transformed = (value * 7919 + (i % 1024)) % 94 + 33;
            // charPool.push(String.fromCharCode(transformed));
            const transformed = (value * 7919 + (i % 1024)) % b64Str.length;
            charPool.push(b64Str[transformed]);
        }

        //选择16个字符
        let result = '';
        for (let i = 0; i < charPool.length; i++) {
            const index = (i * 179) % charPool.length;
            result += charPool[index];

            // 每选3个字符后对池子进行确定性"洗牌"
            if (i % 3 === 2) {
                const first = charPool.shift();
                if (first) charPool.push(first);
            }
        }

        return result;
    }

    private _getRandomStr(): string {
        // if (!this._randomStr) {
        //     let rd = GameTools.getInstance().random0x(b64Str.length);
        //     let timeStamp = parseInt(SubGameCtrl.getInstance().getNetTime() + "") + "";
        //     this._randomStr = GameTools.getInstance().getStringMD5(timeStamp + b64Str[rd]).substring(10, 26);
        // }
        let rd = GameTools.getInstance().random0x(b64Str.length);
        let timeStamp = parseInt(SubGameCtrl.getInstance().getNetTime() + "") + "";
        this._randomStr = GameTools.getInstance().getStringMD5(timeStamp + b64Str[rd]).substring(10, 26);
        return this._randomStr;
    }

    // private _calSig(path: string): string {
    //     if (path.indexOf('/') != 0) {
    //         path = '/' + path;
    //     }
    //     let rd = GameTools.getInstance().random0x(b64Str.length);
    //     let timeStamp = parseInt(SubGameCtrl.getInstance().getNetTime() + "") + "";
    //     let rs = GameTools.getInstance().getStringMD5(timeStamp + b64Str[rd]).substring(10, 26);
    //     let sig = GameTools.getInstance().getStringMD5(path + '@' + timeStamp + '@' + rs + '@' + this._rawValue);
    //     return timeStamp + '-' + rs + '-' + sig;
    // }

    private _calSig(path: string): string {
        if (path.indexOf('/') != 0) {
            path = '/' + path;
        }
        let timeStamp = parseInt(SubGameCtrl.getInstance().getNetTime() + "") + "";
        let rs = this._getRandomStr();
        let uid = "0";
        let sig = GameTools.getInstance().getStringMD5(path.toLocaleLowerCase() + '-' + timeStamp + '-' + rs + '-' + uid + '-' + this._rawValue);
        return timeStamp + '-' + rs + '-' + uid + '-' + sig;
    }

    private _defenseSign(path: string) {
        if (!Config.IsDefenseSign) {
            return '';
        }
        return 'defenseSign=' + this._calSig(path.split('?')[0]);
    }

    public getDefenseSign(path: string) {
        return this._defenseSign(path);
    }

    private _getBaseUrl() {
        if (Config.HttpBaseURL.length == 0) {
            return '/';
        }
        if (Config.HttpBaseURL.lastIndexOf('/') != Config.HttpBaseURL.length - 1) {
            return Config.HttpBaseURL + '/';
        }
        return Config.HttpBaseURL;
    }

    /**
     * httpRequest
     */
    public async httpRequest(url: HttpRequestModel, body = null, headers: { [key: string]: string | number } = null): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!headers) {
                headers = {};
            }
            headers['access-token'] = UserManager.getInstance().getUserInfo().token;
            // headers['accept'] ="application/json, text/plain, */*";

            let handler = (status, response) => {
                if (status == HttpStatus.OK_200 || status == HttpStatus.PartialContent_206) {
                    let resp: any = {}
                    if (typeof (response) == "string") {
                        resp = JSON.parse(response);
                    }
                    else {
                        resp = response;
                    }
                    // log("url",url, "response",response);
                    const { msg, code } = resp;
                    if (code == 0) {
                        return resolve({ ...resp });
                    } else if (code == 4) {
                        // localStorage.removeItem('token');
                        return reject();
                    } else {
                        let tips = ''
                        if (Array.isArray(msg)) {
                            tips = 'code:' + code
                        } else {
                            tips = msg
                        }
                        this.xmtoast(tips)
                        if (code == 10054) { //实名
                            this.showAuthenticationFun(msg);
                        }
                        else if (code == 4001) { //钻石不足
                            this.showNotEnoughFun(msg);

                            try {
                                (kk as any).goCommon({
                                    code: 100004,
                                });
                            } catch (error) {

                            }
                        }
                        else if (code == 200014) { //幸运券不足
                            WindowManager.getInstance().showWindow(WinId.LayerShop);
                            // WindowManager.getInstance().showSystemTip("幸运券不足!");
                        }
                        return reject();
                    }
                } else {
                    // 对响应错误做点什么
                    SubGameCtrl.getInstance().updateServerTime();
                    this.xmtoast('当前网络异常，请稍后再试 ' + status);
                    return reject();
                }
            }
            let defenseSign = this._defenseSign(url.url);
            if (url.method == "get") {
                let up = ""
                if (body) {
                    up += "?";
                    if (defenseSign) {
                        up += (defenseSign + "&");
                    }
                    for (const key in body) {
                        up += key + "=" + body[key] + "&";
                    }
                }
                if (up) {
                    up = up.substring(0, up.length - 1);
                } else {
                    if (defenseSign) {
                        up += ("?" + defenseSign);
                    }
                }
                HttpManager.getInstance().httpGet(this._getBaseUrl() + url.url + up, handler, "text", headers, Config.HttpTimeOut);
            }
            else if (url.method == "post") {
                let arg = '';
                if (defenseSign) {
                    arg = "?" + defenseSign;
                }
                HttpManager.getInstance().httpPost(this._getBaseUrl() + url.url + arg, !body ? null : JSON.stringify(body), handler, "json", headers, Config.HttpTimeOut);
            }
        });
    }

    getUrlToken() {
        return this.getUrlParams("token");
    }

    // 用户名称6字省略
    nameFilter(val: any = '', num: number = 6, sign: number = 3) {
        let arr = val.split('...')
        if (arr[arr.length - 1] == '') return val
        if (val.length > num) {
            let signtext = ''
            for (let i = 1; i <= sign; i++) {
                signtext += '.'
            }
            val = val.slice(0, num) + signtext
        }
        return val
    };
    ToUserAndRoom(item: any = {}) {
        const { user_id = 0, room_id = 0, room_open = 0 } = item
        if (user_id) {
            try {
                return (kk as any).goCommon({ code: "100001", user_id });
            } catch (error) {

            }
        }
        if (room_id && room_open == 1) {
            let data = {
                code: 100002,
                room_id,
            };
            try {
                return (kk as any).goCommon(data);
            } catch (error) {

            }
        }
        return null;
    }
    tpreventoftenFun(fn: Function, delay = 1000) {
        let timer = 0
        return function (...args: any) {
            if (timer) return
            fn.apply(fn, args)
            timer = setTimeout(() => {
                timer && clearTimeout(timer)
                timer = 0
            }, delay)
        }
    }

    // vant提示框
    xmtoast(message: any = '') {
        WindowManager.getInstance().showSystemTip(message,1.1);
    }

    showToast(d: any) {

    }

    showLoadingToast(d: any) {

    }

    // vant加载框
    xmloading(message = '加载中...') {
        const loading = this.showLoadingToast({
            message,
            forbidClick: true,
            loadingType: 'spinner',
            duration: 0,
            className: 'xmloading',
        })
        return loading
    }
    iosOrAndroid() {
        let ios = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        let Android = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1;
        if (ios) {
            return 'ios'
        } else if (Android) {
            return 'Android'
        }
    }
    // 截取url后面字段
    getUrlParams = function (key: any) {
        let url = window.location.href;
        const arr = url.split("?");
        const newArr = arr[1] ? arr[1].split("&") : [];
        for (var i = 0; i < newArr.length; i++) {
            let temp = newArr[i].split("=");
            if (temp[0] === key) {
                let search = temp[1];
                if (search.indexOf("#") > 0) {
                    search = search.substring(0, search.indexOf("#"));
                }
                return search;
            }
        }
    }

    filterGoodsTime(time: number = 0) {
        if (!time) return 0 + '秒'
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let remainingSeconds = time % 60;
        // 根据存在的部分拼接字符串
        let parts = [];
        if (hours > 0) {
            parts.push(`${hours}小时`);
        }
        if (minutes > 0) {
            parts.push(`${minutes}分钟`);
        }
        if (remainingSeconds > 0) {
            parts.push(`${remainingSeconds}秒`);
        }
        return parts.length ? parts.join(' ') : '0秒';
    }

    // /*******web与原生相关*************/
    // 跳转原生充值页面
    jumpRechargeFun(content: string = "", leftText: string = "", rightText: string = "", errorText: string = '') {
        if (errorText == "") {
            errorText = "请前往【我的-我的账户】进行充值。"
        }
        try {
            let arg = "";
            if (content != "") {
                arg = JSON.stringify({
                    content: content,
                    leftText: leftText,
                    rightText: rightText,
                });
            }
            if ((<any>window).android) {
                // (<any>window).android.appJumpRechargeFun(arg);
                (<any>window).android.appJumpRechargeFun();
            } else if ((<any>window).webkit) {
                // (<any>window).webkit.messageHandlers.appJumpRechargeFun.postMessage(arg);
                (<any>window).webkit.messageHandlers.appJumpRechargeFun.postMessage({});
            } else {
                WindowManager.getInstance().showSystemTip(errorText, 3);
            }
        } catch {
            WindowManager.getInstance().showSystemTip(errorText, 3);
        }
    }

    jumpRechargereYBFun(content: string = "", leftText: string = "", rightText: string = "", errorText: string = '') {
        if (errorText == "") {
            errorText = "请前往【我的-我的账户】进行充值。"
        }
        try {
            let arg = "";
            if (content != "") {
                arg = JSON.stringify({
                    content: content,
                    leftText: leftText,
                    rightText: rightText,
                });
            }
            if ((<any>window).android) {
                // (<any>window).android.rechargeYB(arg);
                (<any>window).android.rechargeYB();
            } else if ((<any>window).webkit) {
                // (<any>window).webkit.messageHandlers.rechargeYB.postMessage(arg);
                (<any>window).webkit.messageHandlers.rechargeYB.postMessage({});
            } else {
                WindowManager.getInstance().showSystemTip(errorText, 3);
            }
        } catch {
            WindowManager.getInstance().showSystemTip(errorText, 3);
        }
    }

    // 调用原生实名认证页面
    showAuthenticationFun(res: string) {
        let errorText = "您的账号已限制消费，为保障您的账户资金安全，\n请前往设置完成实名认证。";
        try {
            if ((<any>window).android) {
                (<any>window).android.appShowAuthenticationFun(res);
            } else if ((<any>window).webkit) {
                (<any>window).webkit.messageHandlers.appShowAuthenticationFun.postMessage(res);
            } else {
                WindowManager.getInstance().showSystemTip(errorText, 3);
            }
        } catch {
            WindowManager.getInstance().showSystemTip(errorText, 3);
        }
    }

    // 调用原生钻石等不足界面
    showNotEnoughFun(res: string) {
        this.jumpRechargeFun(res, "取消", "去充值", "您的账户余额不足，请前往充值。");
    }

    // 调用原生隐藏游戏
    hiddenFun() {

        try {
            if ((<any>window).android) {
                (<any>window).android.appHiddenFun();
            } else if ((<any>window).webkit) {
                (<any>window).webkit.messageHandlers.appHiddenFun.postMessage({});
            }
        } catch { }
    }
}
