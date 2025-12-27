import { SpriteFrame } from "cc"

export enum ProtocolEnum {
    PING = "ping",//自定义心跳
    //登陆
    LOGIN = "login",//登陆
    LOGOUT = "logout",//服务端推送退出
    NOTIFYMSG = "notifyMsg",
}

export interface PingResp {
    /** 服务器当前13位时间戳 */
    serverTime: number
}

export interface LoginReq {
    token: string
}

export interface LoginResp {
    code: number
    message: string
    data: LoginModel
}

export interface LoginModel {
    userId: string
    nickname: string
    avatar: string
}

export interface LogoutResp {
    type: number //1-客户端主动退出， 2-顶号退出 3-意外退出
    serverTime: number //服务器当前13位时间戳
}

export enum GameState {
    NULL = 0, //无状态
    INGAME = 1, // 1-就绪(可喂食)
    SETTLE = 2, // 2-动物出场
    WAITING = 3, // 等待中
}

export interface WinnerItemIF {
    userId: string //用户ID,
    rewardGiftName: string //奖励礼物名称
    rewardGiftIcon: string //奖励礼物ICON
    rewardGiftValue: number //奖励礼物价值
    rewardGiftCnt: number //奖励礼物数量
}

export interface NotifyMsgIF {
    serverTime: number //13位时间戳
    screening: string //游戏当前轮次
    type: string //'stat', //推送类型
    state: GameState //1-就绪(可喂食) 2-动物出场
    statusStarted: number //状态已开始秒数
    statusDuration: number //状态总时长

    //以下参数只有状态为2时才有
    bossProgression: number //BOSS进度
    hasBoss: number //当局是否有BOSS出场 0-没有 1-有
    appearanceAnimalId: number //当局出场动物ID 0-暂未有出场动物
    //中奖用户列表
    winnerList: WinnerItemIF[]
}

export interface AnimateInfoIF {
    id: number
    animalName: string
    foodName: string
}

export interface GameInfoIF {
    leaves: number  // 叶子数
    screening: string //游戏当前轮次
    screeningTime: number //本地时间戳13位
    status: GameState //状态 1-就绪(可喂食) 2-动物出场
    statusStarted: number //状态已开始秒数
    statusDuration: number //状态时长
    bossProgression: number //BOSS进度
    hasBoss: number //当局是否有BOSS出场 0-没有 1-有
    appearanceAnimalId: number //当局出场动物ID 0-暂未有出场动物
    towerList: AnimateInfoIF[] //动物食物列表
    stakeGiftPrice: number //钻石兑换单价

    // betsStatus: boolean // 是否下单过 未下单过不执行清除接口
    winnerList: WinnerItemIF[] //中奖用户列表
    winInfo: WinnerItemIF //中奖信息
    bossWinInfo: WinnerItemIF //BOSS中奖信息
}

export interface ServerRecordItemIF {
    screening: string	//场次
    animalId: string	//出场动物ID
    animalName: string	//动物名称
    foodName: string	//食物名称
}

export interface ServerRecordIF {

}

export interface BuyRecordItemIF {
    // screening: string	//场次
    animalId: string	//出场动物ID
    animalName: string	//动物名称
    foodName: string	//食物名称
    cnt: number    //投喂数量
}

export interface BuyRecordRewardIF {
    animalId: number //为0时未中奖
    animalName: string
    foodName: string
    costCnt: number
    giftId: number
    giftName: number
    giftIcon: string
    giftValue: number
    giftCnt: number
}

export interface BuyRecordIF {
    screening: string	//场次
    costCnt: number	//总购买数量
    winAnimalId: number	//出场动物ID
    recordDetail: BuyRecordItemIF[] //购买记录列表
    rewardDetail: BuyRecordRewardIF //奖励信息
}

export interface RuleItemIF {
    probability: string	//概率(千分制)
    animalId: string	//出场动物ID
    animalName: string	//动物名称
    foodName: string	//食物名称
}