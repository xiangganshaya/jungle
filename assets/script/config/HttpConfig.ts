import { _decorator } from 'cc';
export enum HttpStatus {
    OK_200 = 200,
    BadRequest_400 = 400,
    PartialContent_206 = 206,
}

export class HttpRequestModel {
    url: string
    method: string
}

export class HttpConfig {
    // 登录
    static login = {
        url: 'common/login',
        method: 'get',
    } as HttpRequestModel;
    // 游戏信息
    static gameInfo = {
        url: 'api/forest/gameInfo',
        method: 'get',
    } as HttpRequestModel;
    // 游戏规则
    static gameRule = {
        url: 'api/forest/getGameRule',
        method: 'get',
    } as HttpRequestModel;
    // 投喂
    static feeding = {
        url: 'api/forest/feeding',
        method: 'post',
    } as HttpRequestModel;
    // 记录
    static gameRecord = {
        url: 'api/forest/gameRecord',
        method: 'get',
    } as HttpRequestModel;
    // 消费记录
    static contRecord = {
        url: 'api/forest/contRecord',
        method: 'get',
    } as HttpRequestModel;
    // 购买叶子
    static buyLeaves = {
        url: 'api/forest/buyLeaves',
        method: 'post',
    } as HttpRequestModel;
    // 用户叶子
    static userLeaves = {
        url: 'api/forest/userLeaves',
        method: 'post',
    } as HttpRequestModel;
}

