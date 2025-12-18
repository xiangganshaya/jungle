/// <reference path="temp/declarations/cc.custom-macro.d.ts"/>
/// <reference path="temp/declarations/cc.d.ts"/>
/// <reference path="temp/declarations/cc.env.d.ts"/>
/// <reference path="temp/declarations/jsb.d.ts"/>

//自定义
declare module "cc" {
	export namespace native {
		export namespace Device {
			export function setKeepScreenOn(isOn: boolean);
		}

		export function getTextFromClipboard(): string;
	}

	export interface Game {
		on(type: string, callback: (arg: any) => void, target?: any, once?: boolean): any;
	}

	export interface Widget {
		// 扩展一下  只更新自己
		updateAlignmentSelf(): void;
	}

	export interface ScrollView {
		scrollToPercentHorizontal(percent: number, timeInSecond: number): void;
	}

	export namespace gfx {
		export const RB_FMT_S8
		export class Texture2D { }
	}

}


/** Game is Debug. */
declare const REMOTE_URL: string;
declare const URL_CONFIG: string;
declare const IS_PROXY_PASS: boolean;
declare const GAME_DEV: boolean;
declare const GAME_LOG: boolean;
declare const GAME_COLLISION: boolean;
declare const GAME_PHONE_MASK: boolean;
declare const GAME_REMOTE_CONFIG: boolean;
declare const H5_GAME_VERSION: boolean;
declare let kk: any;//web与原生交互的全局变量
declare let keke: any;//web与原生交互的全局变量

