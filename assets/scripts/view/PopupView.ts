import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";
import PopupShowConfig from "./PopupShowConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupView extends cc.Component {
    @property(cc.Node)
    overlay: cc.Node = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    messageLabel: cc.Label = null;
    @property(cc.Label)
    buttonLabel: cc.Label = null;
    @property(cc.Node)
    primaryButton: cc.Node = null;

    private _pendingEventName: string = GameEvents.RESTART_GAME;

    init(): void {
        this.node.active = false;
        if (this.overlay) {
            this.overlay.on(cc.Node.EventType.TOUCH_START, () => {});
        }
        if (this.primaryButton) {
            this.primaryButton.on(cc.Node.EventType.TOUCH_END, () => {
                EventBus.emit(this._pendingEventName);
            });
        }
    }

    show(config: PopupShowConfig): void {
        if (this.titleLabel) {
            this.titleLabel.string = config.title;
        }
        if (this.messageLabel) {
            this.messageLabel.string = config.message;
        }
        if (this.buttonLabel) {
            this.buttonLabel.string = config.buttonText;
        }
        this._pendingEventName = config.eventName;
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node).to(0.25, { opacity: 255 }).start();
    }

    hide(): void {
        this.node.active = false;
    }
}
