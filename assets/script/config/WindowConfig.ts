
import { PrefabPath } from './PrefabPathConfig';

//WinId 枚举值要与 WinInfo 保持一致

export enum WinId {
    SysLoading = "SysLoading",
    SysTipView = "SysTipView",
    SysMsgBox = "SysMsgBox",
    LayerMain = "LayerMain",
    LayerWin = "LayerWin",
    LayerRecord = "LayerRecord",
    LayerBuyRecord = "LayerBuyRecord",
    LayerTip = "LayerTip",
    LayerRule = "LayerRule",
    LayerShop = "LayerShop",
    LayerShopTip = "LayerShopTip",
    LayerBuy = "LayerBuy",

}

//界面配置
export class WinInfo {
    public static info = {
        SysLoading: { script: "SysLoading", path: PrefabPath.window_common_SysLoading },
        SysTipView: { script: "SysTipView", path: PrefabPath.window_common_SysTipView },
        SysMsgBox: { script: "SysMsgBox", path: PrefabPath.window_common_SysMsgBox },
        LayerMain: { script: "LayerMain", path: PrefabPath.window_web_LayerMain },
        LayerWin: { script: "LayerWin", path: PrefabPath.window_web_LayerWin },
        LayerRecord: { script: "LayerRecord", path: PrefabPath.window_web_LayerRecord },
        LayerBuyRecord: { script: "LayerBuyRecord", path: PrefabPath.window_web_LayerBuyRecord },
        LayerTip: { script: "LayerTip", path: PrefabPath.window_web_LayerTip },
        LayerRule: { script: "LayerRule", path: PrefabPath.window_web_LayerRule },
        LayerShop: { script: "LayerShop", path: PrefabPath.window_web_LayerShop },
        LayerShopTip: { script: "LayerShopTip", path: PrefabPath.window_web_LayerShopTip },
        LayerBuy: { script: "LayerBuy", path: PrefabPath.window_web_LayerBuy },

    }
}
