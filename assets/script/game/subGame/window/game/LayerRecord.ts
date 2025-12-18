import { _decorator, Component, instantiate, Label, log, Node } from 'cc';
import GameBaseWindow from '../../../base/GameBaseWindow';
import { WinId } from '../../../../config/WindowConfig';
import { LayerZindex } from '../../../../config/Config';
import SubGameCtrl from '../../subCtrls/SubGameCtrl';
import { GameEvent } from '../../../../config/GameEventConfig';
import SubGameUtil from '../../subUtils/SubGameUtil';
import { ServerRecordItemIF } from '../../net/netMessage/MessageModes';
import { LoadMoreState, VirtualScrollView } from '../../component/vscrollview/VScrollView';
import { RecordItem } from './gameItem/RecordItem';
const { ccclass, property } = _decorator;

@ccclass('LayerRecord')
export class LayerRecord extends GameBaseWindow {

    @property(VirtualScrollView)
    scrollview: VirtualScrollView = null;
    @property(Label)
    tipLoadMore: Label = null;

    // LIFE-CYCLE CALLBACKS:

    private _isCanOutClose = false;
    private _isLoading = false;
    private _page = 0;
    private _datas: ServerRecordItemIF[] = [];

    //---------------

    onLoad() {
        super.onLoad()

        this._windowId = WinId.LayerRecord;
        this.setZIndex(LayerZindex.Window);

        this.scrollview.renderItemFn = (itemNode: Node, index: number) => {
            itemNode.active = true;
            let itemComp = itemNode.getComponent(RecordItem);
            itemComp.setItemInfo(this._datas[index]);
        };

        this.scrollview.onLoadMoreStateChangeFn = (state: LoadMoreState, offset: number) => {
            switch (state) {
                case LoadMoreState.IDLE:
                    this.tipLoadMore.node.active = false;
                    log('空闲状态');

                    break;
                case LoadMoreState.PULLING:
                    log('正在上拉...', offset);
                    // 显示"上拉加载更多"文字
                    this.tipLoadMore.string = '上拉加载更多';
                    this.tipLoadMore.node.active = true;
                    break;
                case LoadMoreState.READY:
                    log('松开即可加载', offset);
                    // 显示"松开加载"文字
                    this.tipLoadMore.string = '松开加载';
                    break;
                case LoadMoreState.LOADING:
                    log('正在加载...');
                    // 显示加载动画和"正在加载"文字
                    // 开始请求数据
                    this.tipLoadMore.string = '正在加载...';
                    this._loadRecord();
                    break;
                case LoadMoreState.COMPLETE:
                    log('加载完成');
                    this.tipLoadMore.string = '加载完成';
                    break;
                case LoadMoreState.NO_MORE:
                    log('没有更多数据了');
                    this.tipLoadMore.string = '没有更多数据了';
                    // 显示"没有更多了"
                    break;
            }
        };
        this.tipLoadMore.node.active = false;
        this.scrollview.refreshList(this._datas);
    }

    start() {
        super.start();
    }

    resetWindow(winData: any) {
        super.resetWindow(winData);
        this.showBackMask(true);

        this._isCanOutClose = false;
        this.scheduleOnce(() => {
            this._isCanOutClose = true;
        }, 0.5);

        this._initInof();
    }

    private _initInof() {
        this._page = 0;
        this._datas.length = 0;
        this.tipLoadMore.node.active = false;
        this.scrollview.refreshList(this._datas);

        this._loadRecord();
    }

    private _loadRecord() {
        SubGameCtrl.getInstance().gameRecord(this._page++);
    }

    private _addRecord(recordList: ServerRecordItemIF[]) {
        const hasMore = recordList.length > 0;
        let index = this._datas.length - 1;
        this._datas = this._datas.concat(recordList);
        this.scrollview.refreshList(this._datas);
        this.scrollview.finishLoadMore(hasMore); // 完成加载
        // this.scrollview.scrollToBottom(true);
        this.scrollview.scrollToIndex(index, false, 0);
    }

    onClickOutClose() {
        if (!this._isCanOutClose) {
            return;
        }
        this.onClickClose();
    }

    // update(deltaTime: number) {

    // }

    onDispathcGameEvent(eventId: GameEvent, eventData: any): void {
        switch (eventId) {
            case GameEvent.EVENT_GAME_UPDATE_RECORD:
                {
                    this._addRecord(eventData);
                }
                break;

            default:
                super.onDispathcGameEvent(eventId, eventData);
                break
        }
    }
}

