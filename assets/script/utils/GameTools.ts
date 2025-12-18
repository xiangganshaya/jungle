
import { _decorator, debug, js, sys, } from 'cc';
import { JSB } from 'cc/env';

import MD5 from './MD5'
import Base64 from './base64'
import LZString from './lzstring'
import UUID from './UUID'
import XXTea from './XXTea'
import Fingerprint from './fingerprint'
import ES6Promise from './es6-promise';
import { TextDecoder, TextEncoder } from './TextUtils';

const lzKeyStrBase64 = "AaBbCcDdEeFfGgHhIiJjKkLlNnMmOoPpQqRrSsTtUuVvWwXxYyZz0123654789+/=";
const password = "~!@myGame888@!~";

export default class GameTools {
    //-----------------------

    //-----------------------
    //-----------------------
    private static _instance: GameTools = null;
    public static getInstance(): GameTools {
        if (!this._instance) {
            this._instance = new GameTools();
        }
        return this._instance;
    }

    public initES6Promise() {
        if (JSB) {
            ES6Promise.polyfill();
            Promise = <any>ES6Promise;
        }
    }

    public isNull(obj: any): boolean {
        return obj == null || obj == undefined;
    }

    /**
     * getClientTime 毫秒
     */
    public getClientTime() {
        return new Date().getTime();
    }

    public getTimeZone(date: any, zone: number = 0): number {
        let myDate = new Date(date);
        let localTime = myDate.getTime();
        let localOffset = 0;
        let offset = zone;
        let utc = localTime + localOffset;
        let newDate = utc + (3600000 * offset);
        return newDate;
    }

    public timeStampToFormatDate(timeStamp: number, zone: number = 0): any {
        let newData = this.getTimeZone(timeStamp * 1000, zone);
        let date = new Date(newData);
        let formatData = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        }
        return formatData;
    }

    /**
     * 
     * @param second 秒转换成day、hour、minutes、seconds
     * @returns 
     */
    public formatSecond(second: number): any {
        const days = Math.floor(second / 86400);
        const hours = Math.floor((second % 86400) / 3600);
        const minutes = Math.floor(((second % 86400) % 3600) / 60);
        const seconds = Math.floor(((second % 86400) % 3600) % 60);
        const forMatDate = {
            day: days,
            hour: hours,
            minute: minutes,
            second: seconds
        };
        return forMatDate;
    }

    /** 
     * num 带小数点的数 保留的小数位数
     * numberToFixed(13.37,1)
     * 返回13.3
    */
    public numberToFixed(num: number, limit: number) {
        return num.toFixed(limit)
    }

    /** 
     * formatNumber(3, 2, '0')
     * 3是1位，不够2位用 '0'填充最终结果 03 
    */
    //格式化数字，类似于 %02d 
    public formatNumber(num: number, count: number = 0, ch: string = '') {
        // num = parseInt(num)
        let numArr = num.toString().split('');
        let dif = count - numArr.length;
        if (dif > 0) {
            for (let i = 0; i < dif; i++) {
                numArr.unshift(ch);
            }
        }
        return numArr.join('');
    }

    public getJsonKeyCount(jsonObj: any): number {
        if (typeof jsonObj == 'object') {
            let n = 0;
            for (let x in jsonObj) {
                n++;
            }
            return n;
        }
        return 0;
    }

    /**
     * randList 打乱数组顺序
     */
    public randList(list: []): [] {
        let count = Math.floor(list.length / 2);
        for (let i = 0; i < count; i++) {
            let rd = this.random0x(list.length);
            let temp = list[i];
            list[i] = list[rd];
            list[rd] = temp;
        }
        return list;
    }

    /**
 * JS获取0至x随机整数,不包括x
 */
    public random0x(x: number): number {
        return Math.floor(Math.random() * x);
    }

    /**
     * JS获取n至m随机整数,包括n,m
     */
    public randomRange(n: number, m: number): number {
        let c = m - n + 1;
        return Math.floor(Math.random() * c + n);
    }

    /**
     * 正负1
     */
    public randomMinusOrAdd() {
        return Math.random() >= 0.5 ? 1 : -1;
    }

    public isDoubleEqual(d1: number, d2: number): boolean {
        return Math.abs(d1 - d2) <= 0.000001;
    }

    public replaceString(text: string, args: any[] = []) {
        if (!text) {
            return "";
        }
        let result = text;
        if (!this.isNull(args) && args.length > 0) {
            // for (let i = 0; i < args.length; i++) {
            //     // let re = new RegExp('\\{' + (i) + '\\}', 'gm');
            //     // result = result.replace(re, args[i]);
            // }

            //使用引擎的format
            result = js.formatStr(result, ...args);
        }
        return result;
    }

    public trimAll(text: string) {
        if (!text) {
            return "";
        }
        let result = text;
        // result = result.replace(/\ +/g,"");
        result = result.replace(/[\t\r\n ]/g, "");
        return result;
    }

    public baseName(path: string): string {
        let index = path.lastIndexOf("/");
        if (index != -1) {
            return path.substring(index + 1);
        }
        return path;
    }

    public baseSuffix(path: string): string {
        let index = path.lastIndexOf(".");
        if (index != -1) {
            return path.substring(index);
        }
        return "";
    }

    /**
     * 使字符串模糊(jiami)
     * @param str
     * @param isReverse
     * @param sep
     * @param len
     * @returns {*}
     */
    public obscureStr(str: string, isReverse: boolean = false, sep: string = " ") {
        if (this.isNull(str)) {
            return null;
        }
        if (this.isNull(isReverse)) {
            isReverse = false;
        }
        if (this.isNull(sep)) {
            sep = ' ';
        }
        // //debug("obscureStr",str);
        let reStr = str.split("");
        if (isReverse) {
            reStr.reverse();
        }
        // //debug("obscureStr",str,reStr.join(sep));
        return reStr.join(sep);// + sep;//最后面不要 sep 就去掉( + sep)
    }

    /**
     * 去除数组重复元素
     * @param arr
     */
    public removeDuplicate(arr: any[]): any[] {
        let h = {};    //定义一个表
        let temparr: any[] = [];  //定义一个临时数组

        for (let i = 0; i < arr.length; i++) {    //循环遍历当前数组
            //对元素进行判断，看是否已经存在表中，如果存在则跳过，否则存入临时数组
            if (!h[arr[i]]) {
                //存入hash表
                h[arr[i]] = true;
                //把当前数组元素存入到临时数组中
                temparr.push(arr[i]);
            }
        }
        return temparr;
    }

    public getRandString(len: number): string {
        len = len || 6;
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let n = len, s = "";
        for (let i = 0; i < n; i++) {
            let rand = Math.floor(Math.random() * str.length);
            s += str.charAt(rand);
        }
        return s;
    }

    public checkIsAllChinese(str: string) {
        if (/^[\u4e00-\u9fa5]+$/.test(str)) {
            return true;
        }
        return false;
    }

    public base64Encrypt(str: string): string {
        return Base64.encode(str);
    }

    public base64Decode(b64: string): string {
        return Base64.decode(b64);
    }

    public base64EncryptBinary(binary: Uint8Array): string {
        return Base64.btoa(binary);
    }

    public base64DecodeBinary(b64: string): Uint8Array {
        let bytes = Base64.atob(b64);

        let content = new Uint8Array(bytes.length);

        for (var i = 0; i < bytes.length; i++) {
            content[i] = bytes.charCodeAt(i);
        }

        return content;
    }

    public setLocalStorageItem(key: string, itemStr: string = "", isEncode: boolean = true) {
        if (this.isNull(key)) {
            return;
        }
        if (isEncode) {
            // //debug("setLocalStorageItem str",itemStr);
            // let bs = this.base64Encrypt(itemStr);
            // //debug("setLocalStorageItem bs",bs);
            let e: any = XXTea.encrypt(itemStr, password.substring(3, 8));
            // //debug("setLocalStorageItem",e);
            let b = this.base64Encrypt(e);
            // //debug("setLocalStorageItem string",b);
            sys.localStorage.setItem(key, b);
        } else {
            sys.localStorage.setItem(key, itemStr);
        }
    }

    public getLocalStorageItem(key: string, isEncode: boolean = true): any {
        if (this.isNull(key)) {
            return "";
        }
        let b: any = sys.localStorage.getItem(key);
        if (!b) {
            return "";
        }

        if (isEncode) {
            let db = this.base64Decode(b);
            // //debug("getLocalStorageItem db",db);
            let de: any = XXTea.decrypt(db, password.substring(3, 8));
            // //debug("getLocalStorageItem decode",de);
            // let bs = this.base64Decode(de);
            // //debug("getLocalStorageItem base64Decode",bs);
            return de;
        }

        return b;
    }
    /*
     *非法字符集
     */
    private _getRegexString() {
        let regex = /[\&\#\`\~\+\-\*\=\(\)\^\%\$\@\;\:\'\"\\\/\.\>\<\?\!\[\]\{\}\|\ \   \,]+/g;
        return regex;
    }
    /*
     *判断非法字符
     */
    public checkIllegalChar(str: string): boolean {
        if (!str) {
            return true;
        }
        //判断非法字符
        let strRegex = this._getRegexString();
        let re = new RegExp(strRegex);
        if (re.test(str)) {
            //有非法字符
            return false;
        }
        //无非法字符
        return true;
    }

    public checkPassword(pwd: string) {
        let re = /^[0-9a-zA-Z]*$/g;  //判断字符串是否为数字和字母组合     //判断正整数 /^[1-9]+[0-9]*]*$/
        if (!re.test(pwd)) {
            return false;
        }
        return true;
    }

    /**
     * 获取字母+数字组合的字符串
     * transformAlphaAndNumStr
     */
    public transformAlphaAndNumStr(inputStr: string) {
        let reg = new RegExp("^[A-Za-z0-9]+$");
        let str = "";
        for (let i = 0; i < inputStr.length; i++) {
            if (reg.test(inputStr.charAt(i))) {
                str += inputStr.charAt(i);
            }
        }
        return str;
    }

    /**
     *获取字符串，通过字符长度的限制, 用于editbox, 汉字占2字节，英文、符号占1字节
     *@param string, 字符串
     *@param maxCharLength, 长度限制
     *@return subStringText 截取的字符串
     */
    public getSubStringByCharLength(text: string, maxCharLength: number): string {
        let length = 0;
        let subStringLength = 0;
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                length++;
            }
            else {
                length += 2;
            }
            if (length <= maxCharLength) {
                subStringLength = i;
            }
        }

        let subStringText = text.substring(0, subStringLength + 1);
        return subStringText;
    }

    /**
     *获取字符串长度,  汉字占2字节，英文、符号占1字节
     *@param string  字符串
     *@return textLength 字符串长度
     */
    public getStringCharLength(text: string): number {
        let textLength = 0;
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                textLength++;
            }
            else {
                textLength += 2;
            }
        }
        return textLength;
    };

    public getCompressString(str: string): string {
        if (!str) {
            return "";
        }
        return LZString.compressToBase64(str, lzKeyStrBase64);
    }

    public getDecompressString(compressString: string): string {
        if (!compressString) {
            return "";
        }
        return LZString.decompressFromBase64(compressString, lzKeyStrBase64);
    }

    public getStringMD5(str: string, isUpper: boolean = false): string {
        let md5Str: string = MD5.MD5(str);
        if (isUpper) {
            md5Str = md5Str.toUpperCase();
        }
        else {
            md5Str = md5Str.toLowerCase();
        }
        return md5Str;
    }

    /** 
     * 去左右空格; 
     * */
    public trimLR(str: string): string {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    public _quicksort(arr: any[], left: number, right: number, sortFunc: any): any[] {
        let pivot: any = arr[Math.floor((left + right) / 2)];
        let i = left;
        let j = right;
        while (i <= j) {
            while (sortFunc(pivot, arr[i])) {
                i++;
            }
            while (sortFunc(arr[j], pivot)) {
                j--;
            }
            if (i <= j) {
                let temp: any = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                i++;
                j--;
            }
        }

        if (left < j) {
            this._quicksort(arr, left, j, sortFunc);
        }
        if (i < right) {
            this._quicksort(arr, i, right, sortFunc);
        }
        return arr;
    }

    public sort(arr: any[], sortFunc: any): any[] {
        if (!arr) {
            return [];
        }
        if (arr.length == 1) {
            return arr;
        }
        sortFunc = sortFunc ? sortFunc : (a: any, b: any) => {
            return a - b;
        }

        function compare(a: any, b: any) {
            return sortFunc(a, b) > 0 ? 1 : -1;
        }

        // return this._quicksort(arr,0,arr.length-1,sortFunc);
        return arr.sort(compare);
    }

    public checkCanRecordAudio() {
        if (!window || !navigator) {
            return false;
        }
        if (typeof navigator.mediaDevices == 'undefined' || !navigator.mediaDevices.getUserMedia) {
            return false
        }
    }

    public checkIsEmail(mail: string) {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (filter.test(mail)) {
            return true;
        }
        return false;
    }

    public openURL(url: string) {
        let a = document.createElement('a');
        a.href = url;
        // a.target = '_blank';
        // a.rel = 'noopener';
        a.click();
    }
    private _selectNativeFiles(multiple: boolean, accept: string, cb: Function) {
        if (typeof FileReader == "undefined") {
            alert("浏览器不支持上传，\n请换用其他浏览器重试~");
            return;
        }
        let e = document.getElementById("inputfile");
        if (e) {
            e.remove();
        }
        let fe = document.createElement('input');
        fe.id = "inputfile"
        fe.type = 'file';
        fe.multiple = multiple;
        if (!!accept) {
            fe.accept = accept;
        }
        fe.onchange = (ed) => {
            let files = ed.target['files'];
            cb(files);
        }
        document.body.appendChild(fe);
        fe.click();
    }

    public openNativeFile(cb: Function) {
        this._selectNativeFiles(false, null, cb);
    }

    public openNativeFiles(cb: Function) {
        this._selectNativeFiles(true, null, cb);
    }

    public openNativePic(cb: Function) {
        this._selectNativeFiles(false, 'image/*', cb);
    }

    public openNativePics(cb: Function) {
        this._selectNativeFiles(true, 'image/*', cb);
    }

    public getNativeFileData(file: any, cb: Function) {
        let fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = (e) => {
            // debug("db64",e,e.target);
            cb({ file: file, b64: e.target['result'] });
        }
    }

    public getNativeFileDatas(fileList: any[], cb: Function) {
        if (!fileList || fileList.length == 0) {
            cb([]);
            return;
        }
        let fdList = [];
        let returnDatas = () => {
            let list = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                for (let j = 0; j < fdList.length; j++) {
                    const fd = fdList[j];
                    if (file == fd.file) {
                        list.push(fdList[i]);
                        break;
                    }
                }
            }
            cb(list);
        }
        let maxCount = fileList.length;

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            this.getNativeFileData(file, (data) => {
                fdList.push(data);
                if (fdList.length >= maxCount) {
                    returnDatas();
                }
            })
        }
    }

    /**
     * getFingerprint
     */
    public getFingerprint() {
        return Fingerprint.fingerprint();
    }

    public createUUID(): string {
        return UUID.createUUID();
    }

    public createShortUUID(): string {
        let uuid = UUID.createUUID() + "a";
        // debug("createShortUUID", uuid)
        let tempStr = "";
        for (let i = 0; i < uuid.length; i += 3) {
            let num = parseInt(uuid.substring(i, i + 3), 16) % 256;
            tempStr += String.fromCharCode(num);
        }
        let b64Str = this.base64Encrypt(tempStr);
        return b64Str.substring(0, b64Str.length - 2);
    }

    public createGameUid() {
        if (sys.isBrowser) {
            return this.getStringMD5(new UUID().toString() + this.getFingerprint());
        }
        return this.getStringMD5(new UUID().toString());
    }

    /**
     * 异步函数中等待一段时间
     * @param time 单位s
     */
    public waitTime(time: number) {
        return new Promise(res => setTimeout(res, time * 1e3))
    }

    /**
     * 纯数据json对象的深度克隆
     * @param obj 
     * @returns 
     */
    public cloneJsonObject(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 求矩阵(方阵)的子矩阵(剔除i行和j列)
     * @param mat 
     * @param i 
     * @param j 
     * @returns 
     */
    private _getMatSon(mat: number[][], i: number, j: number) {
        let _mat: number[][] = this.cloneJsonObject(mat);
        _mat.splice(i, 1);
        // debug(_mat,"getMatSon")
        //这里要删除，所以倒着循环
        for (let index = _mat.length - 1; index >= 0; index--) {
            // for (let index = 0; index < _mat.length; index++) {
            _mat[index].splice(j, 1);
        }
        // debug(_mat,"getMatSon2")
        return _mat;
    }

    /**
   * 验证身份证号码
   * @param inputStr 
   */
    public checkIsID(inputStr: string) {
        var reg = /^[0-9]+.?[0-9]*$/;
        let str = inputStr.toLocaleUpperCase()
        let length = str.length
        if (length == 18) {
            let input_2 = str.substring(0, 17)
            let input_3 = str.substring(17)
            if (reg.test(input_2) && input_3 == "X") {
                return true
            }
            if (reg.test(inputStr)) {
                return true
            }
            return false
        } else if (length == 15) {
            return reg.test(inputStr)
        } else {
            return false
        }
    }

    public string2bytes(str: string): Uint8Array {
        return TextEncoder.encode(str, undefined);
    }

    public bytes2string(arr: Uint8Array): string {
        return TextDecoder.decode(arr, undefined);
    }

    /**
     * object tostring 如果是cocos objct 只输出 name
     * @param obj 任意对象
     * @param max 遍历最大层级
     * @param level 当前初始层级
     * @returns 
     */
    dump(obj: any, max: number = 2, level: number = 0) {
        if (level > max) {
            return
        }
        level = level + 1
        var arr_str = [];
        var str_pad = '    '.repeat(level);

        var _type = typeof obj;
        if (_type != "object") {
            if (_type == "number" || _type == "boolean" || _type == "string") {
                arr_str.push(str_pad + obj + '[' + _type + ']')
            } else {
                arr_str.push(str_pad + "obj" + '[' + _type + ']')
            }
        } else if (obj instanceof Date) {
            arr_str.push(str_pad + obj + '[Date]')
        } else if (obj instanceof RegExp) {
        } else if (obj instanceof Function) {
        } else if (obj == null) {
            arr_str.push(str_pad + 'null')
        } else if (obj._name || obj.node) {
            arr_str.push(str_pad + (obj._name || obj.node._name) + '[cocosObj]')
        } else {
            if (obj instanceof Array) {
                arr_str.push(str_pad + "Array:length " + obj.length)
                for (let i = 0; i < obj.length; i++) {
                    let str = this.dump(obj[i], max, level)
                    if (str) {
                        arr_str.push(str_pad + ":" + i + ":" + str)
                    }
                }
            } else {
                let length = 0
                for (const key in obj) {
                    length += 1
                }
                arr_str.push(str_pad + "Object:length " + length)
                for (const key in obj) {
                    let str = this.dump(obj[key], max, level)
                    if (str) {
                        arr_str.push(str_pad + "" + key + ":" + str)
                    }
                }
            }
        }

        return arr_str.join(' \n ');
    }
}


