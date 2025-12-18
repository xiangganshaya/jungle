
(<any>window).kk = (function (w: any, cry: any) {
    function Tool() {

    }

    //@desc是否是苹果移动端
    //@return Boolean
    Tool.prototype.isIos = (function () {
        return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    })()

    //@desc 是否是安卓移动端
    //@return Boolean
    Tool.prototype.isAndroid = (function () {
        return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1;
    })()

    //@desc 客户端 GET 请求
    //@method GET
    //@param String url 请求的 URL
    //@param Object data 请求的 query 参数, 没有可传空
    //@param callback String 回调函数的名字,此回调函数会在请求成功之后由客户端调起
    Tool.prototype.get = function (url: any, para: any, callback: any) {
        this.callback = callback
        let data: any = {
            requestType: 'GET',
            url: url,
            para,
            response: 'kk.callback'
        };
        if (this.isAndroid) {
            keke.commonRequestAction(JSON.stringify(data));
        } else if (this.isIos) {
            (window as any).webkit.messageHandlers.commonRequestAction.postMessage(data);
        }
    }

    //@desc 客户端 POST 请求
    //@method POST
    //@param String url 请求的 URL
    //@param Object data 请求的 query 参数, 没有可传空
    //@param callback String 回调函数的名字,此回调函数会在请求成功之后由客户端调起
    Tool.prototype.post = function (url: any, para: any, callback: any) {
        this.callback = callback
        let data: any = {
            requestType: 'POST',
            url: url,
            para,
            response: 'kk.callback'
        };
        if (this.isAndroid) {
            keke.commonRequestAction(JSON.stringify(data));
        } else if (this.isIos) {
            (window as any).webkit.messageHandlers.commonRequestAction.postMessage(data);
        }
    }

    //@desc 唤醒客户端分享
    //@param String img 分享的图片
    //@param String title 分享的标题
    //@param String desc 分享的描述
    //@param String url 分享的链接
    Tool.prototype.share = function (img: any, title: any, desc: any, url: any) {
        let data = {
            img: img,
            title: title,
            desc: desc,
            url: url
        };
        if (this.isIos) {
            (window as any).webkit.messageHandlers.shareClicked.postMessage(data);
        } else if (this.isAndroid) {
            keke.shareClicked(data.url, data.img, data.desc, data.title);
        }
    }

    //@唤醒客户端图片分享
    Tool.prototype.shareImage = function (base64Img: any, callback: any) {
        this.callback = callback
        let data = {
            src: base64Img,
            response: 'kk.callback'
        }
        if (this.isIos) {
            (window as any).webkit.messageHandlers.shareImage.postMessage(JSON.stringify(data));
        } else if (this.isAndroid) {
            keke.shareImage(JSON.stringify(data));
        }
    }


    Tool.prototype.shareFriends = function (image: any, name: any, url: any) {
        let data = {
            image: image,
            name: name,
            url: url
        }
        if (this.isIos) {
            (window as any).webkit.messageHandlers.shareFriendsClicked.postMessage(data);
        } else if (this.isAndroid) {
            keke.shareFriendsClicked(data.image, data.name, data.url);
        }
    }

    //@desc 唤醒客户端支付
    Tool.prototype.pay = function () {
        if (this.isIos) {
            (window as any).webkit.messageHandlers.rechargeClicked.postMessage('');
        } else if (this.isAndroid) {
            keke.rechargeClicked();
        }
    }

    // 关闭h5页面
    Tool.prototype.closeH5 = function () {
        if (this.isIos) {
            (window as any).webkit.messageHandlers.closeRoomViewClicked.postMessage('');
        } else if (this.isAndroid) {
            keke.closeRoomViewClicked();
        }
    }

    // 关闭h5页面
    Tool.prototype.closeH5All = function () {
        if (this.isIos) {
            (window as any).webkit.messageHandlers.onFinish.postMessage('');
        } else if (this.isAndroid) {
            keke.onFinish();
        }
    }
    // 调用客户端的跳转直播间方法
    Tool.prototype.goCommon = function (data: any) {
        // 接受参数 示例
        // data = {
        //     code: 100009,
        //     action: `kkaudio://room/info?id=${room_id}&type=1`,
        // };
        if (this.isIos) {
            (window as any).webkit.messageHandlers.onClickOpen.postMessage(data);
        } else if (this.isAndroid) {
            keke.onClickOpen(JSON.stringify(data));
        }
    }
    // 打开新的h5
    Tool.prototype.openRoom = function (roomId: any) {
        let data = {
            room_id: roomId,
        };
        if (this.isIos) {
            (window as any).webkit.messageHandlers.roomClicked.postMessage(data);
        } else if (this.isAndroid) {
            keke.roomClicked(roomId);
        }
    }

    Tool.prototype.getToken = function (fun: any) {
        if (this.isIos) {
            (window as any).webkit.messageHandlers.getCookieToken.postMessage('');
        } else if (this.isAndroid) {
            keke.getCookieToken();
        }

        w.userCookieToken = function (str: any) {
            fun(str)
        }
    }

    Tool.prototype.joinGameCallBack = function (user_id: any) {
        let data = {
            user_id: user_id
        }
        if (this.isIos) {
            (window as any).webkit.messageHandlers.joinGameCallBack.postMessage(data);
        } else if (this.isAndroid) {
            keke.joinGameCallBack(user_id);
        }
    }

    //@desc 解析 URL 参数部分
    //@return array
    Tool.prototype.$_GET = (function () {
        let url = window.document.location.href.toString();
        let u = url.split("?");
        if (typeof (u[1]) == "string") {
            u = u[1].split("&");
            let get: any = {};
            for (let i in u) {
                let j = u[i].split("=");
                get[j[0]] = j[1];
            }
            return get;
        } else {
            return {};
        }
    })()
    
    return Tool();
})(window, () => { })