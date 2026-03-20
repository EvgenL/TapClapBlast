import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";

const { ccclass } = cc._decorator;

@ccclass
export default class PopupView extends cc.Component {
    private _titleLabel: cc.Label = null;
    private _messageLabel: cc.Label = null;

    init(): void {
        this.node.setContentSize(720, 1280);
        this.node.setPosition(0, 0);
        this.node.active = false;

        const overlay = new cc.Node("Overlay");
        overlay.setContentSize(720, 1280);
        const og = overlay.addComponent(cc.Graphics);
        og.fillColor = new cc.Color(0, 0, 0, 160);
        og.rect(-360, -640, 720, 1280);
        og.fill();
        overlay.on(cc.Node.EventType.TOUCH_START, () => {});
        this.node.addChild(overlay);

        const panel = new cc.Node("Panel");
        const pg = panel.addComponent(cc.Graphics);
        pg.fillColor = new cc.Color(40, 40, 70, 245);
        pg.roundRect(-190, -130, 380, 260, 20);
        pg.fill();
        pg.strokeColor = new cc.Color(120, 120, 180);
        pg.lineWidth = 2;
        pg.roundRect(-190, -130, 380, 260, 20);
        pg.stroke();
        panel.setContentSize(380, 260);
        this.node.addChild(panel);

        this._titleLabel = this.addLabel(panel, 40, 0, 65);
        this._messageLabel = this.addLabel(panel, 28, 0, 10);
        this.addRestartButton(panel);
    }

    show(title: string, message: string): void {
        if (this._titleLabel) { this._titleLabel.string = title; }
        if (this._messageLabel) { this._messageLabel.string = message; }
        this.node.active = true;
        this.node.opacity = 0;
        cc.tween(this.node).to(0.25, { opacity: 255 }).start();
    }

    hide(): void {
        this.node.active = false;
    }

    private addLabel(parent: cc.Node, fontSize: number, x: number, y: number): cc.Label {
        const node = new cc.Node("Lbl");
        const label = node.addComponent(cc.Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.enableBold = true;
        node.color = cc.Color.WHITE;
        node.setPosition(x, y);
        parent.addChild(node);
        return label;
    }

    private addRestartButton(parent: cc.Node): void {
        const btn = new cc.Node("RestartBtn");
        btn.setContentSize(200, 50);
        btn.setPosition(0, -70);
        const bg = btn.addComponent(cc.Graphics);
        bg.fillColor = new cc.Color(60, 160, 60);
        bg.roundRect(-100, -25, 200, 50, 10);
        bg.fill();

        const labelNode = new cc.Node("BtnLabel");
        const label = labelNode.addComponent(cc.Label);
        label.string = "Restart";
        label.fontSize = 24;
        label.lineHeight = 30;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.Color.WHITE;
        btn.addChild(labelNode);

        btn.on(cc.Node.EventType.TOUCH_END, () => {
            EventBus.emit(GameEvents.RESTART_GAME);
        });
        parent.addChild(btn);
    }
}
