import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";

const { ccclass } = cc._decorator;

@ccclass
export default class BoosterPanelView extends cc.Component {
    private _bombLabel: cc.Label = null;
    private _teleportLabel: cc.Label = null;
    private _bombNode: cc.Node = null;
    private _teleportNode: cc.Node = null;

    init(): void {
        this.node.setContentSize(700, 80);
        this.node.setPosition(0, -560);

        this._bombNode = this.createButton("Bomb", -130, 0, new cc.Color(160, 50, 50));
        this._bombLabel = this._bombNode.getComponentInChildren(cc.Label);
        this._bombNode.on(cc.Node.EventType.TOUCH_END, () => {
            EventBus.emit(GameEvents.BOOSTER_BOMB_ACTIVATE);
        });

        this._teleportNode = this.createButton("Teleport", 130, 0, new cc.Color(50, 50, 160));
        this._teleportLabel = this._teleportNode.getComponentInChildren(cc.Label);
        this._teleportNode.on(cc.Node.EventType.TOUCH_END, () => {
            EventBus.emit(GameEvents.BOOSTER_TELEPORT_ACTIVATE);
        });
    }

    updateBombCount(count: number): void {
        if (this._bombLabel) {
            this._bombLabel.string = `Bomb (${count})`;
        }
    }

    updateTeleportCount(count: number): void {
        if (this._teleportLabel) {
            this._teleportLabel.string = `Teleport (${count})`;
        }
    }

    highlightBomb(active: boolean): void {
        if (this._bombNode) {
            this._bombNode.opacity = active ? 255 : 180;
        }
    }

    highlightTeleport(active: boolean): void {
        if (this._teleportNode) {
            this._teleportNode.opacity = active ? 255 : 180;
        }
    }

    private createButton(text: string, x: number, y: number, color: cc.Color): cc.Node {
        const node = new cc.Node(text);
        node.setContentSize(220, 56);
        node.setPosition(x, y);
        node.opacity = 180;

        const bg = node.addComponent(cc.Graphics);
        bg.fillColor = color;
        bg.roundRect(-110, -28, 220, 56, 12);
        bg.fill();

        const labelNode = new cc.Node("Label");
        const label = labelNode.addComponent(cc.Label);
        label.string = `${text} (0)`;
        label.fontSize = 22;
        label.lineHeight = 28;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelNode.color = cc.Color.WHITE;
        node.addChild(labelNode);

        this.node.addChild(node);
        return node;
    }
}
