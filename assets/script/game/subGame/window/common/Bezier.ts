
//Bezier

import { v2, Vec2 } from "cc";

let STOP_VALUE = 0.00001;
let CACHE_PRECISION = 60;

export default class Bezier {

    private _a: number = 0;
    private _b: number = 0;
    private _c: number = 0;
    private _totalLength: number = 0;//曲线总长度

    private _points: Vec2[] = [];
    private _timeLen: number = 0;
    private _cache: { [key: number]: number } = {};

    private _isStand: boolean = false;
    private _isLine: boolean = false;

    constructor(points: Vec2[], timeLen: number, toCache: boolean) {
        this._points = points;
        this._timeLen = timeLen;
        if (toCache) {
            this._cache = {};
        }

        // if (points[0].x == points[1].x || points[1].x == points[2].x) {
        //     points[2].x += 0.0001;
        // }
        // if (points[0].y == points[1].y || points[1].y == points[2].y) {
        //     points[2].y += 0.0001;
        // }

        if (Math.abs(points[0].x - points[1].x) < 0.1 && Math.abs(points[0].y - points[1].y) < 0.1
            && Math.abs(points[2].x - points[1].x) < 0.1 && Math.abs(points[2].y - points[1].y) < 0.1) {
            this._isStand = true;
        }

        if (this._isStand) {
            this._totalLength = 0;
        } else {
            if ((points[2].y-points[1].y)*(points[2].x-points[0].x) == ((points[2].x-points[1].x))*(points[2].y-points[0].y)) {
                this._isLine = true;
                let dx = points[2].x-points[0].x;
                let dy = points[2].y-points[0].y;
                this._totalLength = Math.sqrt(dx*dx + dy*dy);
            } else {
                let ax = points[0].x - 2 * points[1].x + points[2].x;
                let ay = points[0].y - 2 * points[1].y + points[2].y;
                let bx = 2 * points[1].x - 2 * points[0].x;
                let by = 2 * points[1].y - 2 * points[0].y;
                this._a = 4 * (ax * ax + ay * ay);
                this._b = 4 * (ax * bx + ay * by);
                this._c = bx * bx + by * by;
                //曲线总长度
                this._totalLength = this._length(1);
            }
        }
        // log("points",JSON.stringify(points))
        // log("time",this._timeLen)
        // log("length",this._totalLength)
    }

    public static createBezier(points: Vec2[], timeLen: number, toCache: boolean = true) {
        return new Bezier(points, timeLen, toCache);
    }

    /**
     * getPoints
     */
    public getPoints() {
        return this._points;
    }

    /**
     * getTimeLen
     */
    public getTimeLen() {
        return this._timeLen;
    }

    /**
     * isStand
     */
     public isStand() {
        return this._isStand;
    }

    /**
     * 返回【匀速运动】情况下指定时间点坐标
     * @param t 本段已经走过的时间
     * @param fromCache 是否缓存
     * @return 对应时间点的坐标
     */
    public getPoint(t: number, fromCache: boolean) {
        if (this._isStand) {
            return [v2(this._points[0]), v2(this._points[0])];
        }

        if (this._isLine) {
            let dx = this._points[2].x-this._points[0].x;
            let dy = this._points[2].y-this._points[0].y;
            t = t / this._timeLen;
            if (t > 1) {
                t = 1;
            }
            let dxt = t * dx;
            let dyt = t * dy;

            let pos = v2(this._points[0].x+dxt, this._points[0].y+dyt);
            return [pos, v2(this._points[0])];
        }

        let timeIndex = -1;
        if (this._cache && fromCache) {
            timeIndex = Math.round(t * CACHE_PRECISION);

            let p02X = this._cache[4 * timeIndex - 3];
            let p02Y = this._cache[4 * timeIndex - 2];
            let p01X = this._cache[4 * timeIndex - 1];
            let p01Y = this._cache[4 * timeIndex];
            if (p02X) {
                return [v2(p02X, p02Y), v2(p01X, p01Y)];
            }
        }

        t = t / this._timeLen;

        //如果按照线性增长,此时对应的曲线长度
        let l = t * this._totalLength;

        //根据L函数的反函数，求得l对应的t值
        t = this._invertL(t, l);

        //根据贝塞尔曲线函数，求得取得此时的x,y坐标
        let p01 = v2((1 - t) * this._points[0].x + t * this._points[1].x
            , (1 - t) * this._points[0].y + t * this._points[1].y);
        let p11 = v2((1 - t) * this._points[1].x + t * this._points[2].x
            , (1 - t) * this._points[1].y + t * this._points[2].y);
        let p02 = v2((1 - t) * p01.x + t * p11.x
            , (1 - t) * p01.y + t * p11.y);

        if (this._cache && fromCache) {
            this._cache[4 * timeIndex - 3] = p02.x;
            this._cache[4 * timeIndex - 2] = p02.y;
            this._cache[4 * timeIndex - 1] = p01.x;
            this._cache[4 * timeIndex] = p01.y;
        }

        return [p02, p01];
    }

    /**
     * 长度函数
     * L(t) = Integrate[s[t], t]
     * L(t_) = ((2*Sqrt[A]*(2*A*t*Sqrt[C + t*(B + A*t)] + B*(-Sqrt[C] + Sqrt[C + t*(B + A*t)])) + 
            (B^2 - 4*A*C) (Log[B + 2*Sqrt[A]*Sqrt[C] ] - Log[B + 2*A*t + 2 Sqrt[A]*Sqrt[C + t*(B + A*t)] ]))
                /(8* A^(3/2)));
     * @param t 
     */
    private _length(t: number) {
        let temp1 = Math.sqrt(this._c + t * (this._b + this._a * t));
        let temp2 = (2 * this._a * t * temp1 + this._b * (temp1 - Math.sqrt(this._c)));
        let temp3 = Math.log(this._b + 2 * Math.sqrt(this._a) * Math.sqrt(this._c));
        let temp4 = Math.log(this._b + 2 * this._a * t + 2 * Math.sqrt(this._a) * temp1);
        let temp5 = 2 * Math.sqrt(this._a) * temp2;
        let temp6 = (this._b * this._b - 4 * this._a * this._c) * (temp3 - temp4);

        return (temp5 + temp6) / (8 * Math.pow(this._a, 1.5));
    }

    /**
     * 速度函数
     * s(t_) = Sqrt[A*t*t+B*t+C]
     * @param t 
     */
    private _speed(t: number) {
        return Math.sqrt(this._a * t * t + this._b * t + this._c);
    }

    /**
     * 长度函数反函数，使用牛顿切线法求解
     * X(n+1) = Xn - F(Xn)/F'(Xn)
     * @param t 
     * @param l 
     */
    private _invertL(t: number, l: number) {
        let t1 = t;
        let t2 = 0;
        while (true) {
            t2 = t1 - (this._length(t1) - l) / this._speed(t1);
            if (Math.abs(t1 - t2) < STOP_VALUE) {
                break
            }
            t1 = t2;
        }

        return t2;
    }
}


