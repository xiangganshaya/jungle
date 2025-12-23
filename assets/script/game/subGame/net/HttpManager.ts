import { debug, sys } from "cc";
import { DEV, JSB } from "cc/env";

export default class HttpManager {
    private static _instance: HttpManager = null;

    /**
    * getInstance
    */
    public static getInstance() {
        if (!this._instance) {
            this._instance = new HttpManager();
        }
        return this._instance;
    }

    private httpEvents(xhr, responseHandler) {
        // Simple events
        ['abort', 'error', 'timeout'].forEach(function (eventname) {
            xhr["on" + eventname] = function () {
                responseHandler(xhr.status, eventname);
            }
        })

        // Special event
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // debug("onreadystatechange",xhr.responseType,xhr.response)
                if (xhr.responseType == "text") {
                    responseHandler(xhr.status, xhr.responseText);
                    // debug('HttpManager ',xhr.responseText);
                } else {
                    responseHandler(xhr.status, xhr.response);
                    // debug('HttpManager ',xhr.response);
                }
            }
        }
    }

    /**
     * httpGet
     */
    public httpGet(url: string, handler, responseType = "text", headers = null, timeout = 10000) {
        // if (!JSB && IS_PROXY_PASS) {
        //     let indexs = url.indexOf("/api/")
        //     if (indexs != -1) {
        //         url = url.substring(indexs)
        //     }
        // }

        let xhr = new XMLHttpRequest();
        this.httpEvents(xhr, handler);
        xhr.open("GET", url, true)
        // debug('HttpManager httpGet' + "url= ", url, new Date().getTime());
        if (JSB) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }

        if (headers) {
            for (const key in headers) {
                xhr.setRequestHeader(key + "", headers[key] + "");
            }
        }

        // responseType = sys.isNative ? responseType : "";//
        if (responseType == "text") {
            xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        } else if (responseType == "json") {
            xhr.setRequestHeader("content-type", "application/json");
        } else if (responseType == "arraybuffer") {
            xhr.setRequestHeader("content-type", "application/octet-stream");
        }else {
            xhr.setRequestHeader("content-type", "application/json, text/plain, */*");
        }

        xhr.timeout = timeout
        xhr.responseType = (responseType as XMLHttpRequestResponseType);

        xhr.send()
    }

    /**
     * httpPost
     */
    public httpPost(url, body, handler, responseType = "text", headers = null, timeout = 10000) {
        // if (!JSB && IS_PROXY_PASS) {
        //     let indexs = url.indexOf("/api/")
        //     if (indexs != -1) {
        //         url = url.substring(indexs)
        //     }
        // }

        let xhr = new XMLHttpRequest();
        this.httpEvents(xhr, handler);
        xhr.open("POST", url);

        // debug('HttpManager ' + "url= ", url, "\nbody =", body, new Date().getTime());
        if (headers) {
            for (const key in headers) {
                xhr.setRequestHeader(key + "", headers[key] + "");
            }
        }

        // if (JSB) {
        //     xhr.setRequestHeader("content-length", body?body.length:0)
        // }

        // responseType = sys.isNative ? responseType : "";//
        if (responseType == "text") {
            xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
        } else if (responseType == "json") {
            xhr.setRequestHeader("content-type", "application/json");
        } else if (responseType == "arraybuffer") {
            xhr.setRequestHeader("content-type", "application/octet-stream");
        }

        xhr.timeout = timeout
        xhr.responseType = (responseType as XMLHttpRequestResponseType);

        xhr.send(body)
    }

    /**
     * httpHead
     */
    public async httpHead(url: string, header: string = '', timeout: number = 5000): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("HEAD", url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    return resolve(xhr.getResponseHeader(header) || '');
                }
            }
            xhr.timeout = timeout
            xhr.send();
        });
    }
}
