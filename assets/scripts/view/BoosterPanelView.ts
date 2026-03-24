export interface BoosterPanelCallbacks {
    onBombClick: () => void;
    onTeleportClick: () => void;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoosterPanelView extends cc.Component {
    @property(cc.Button)
    bombButton: cc.Button = null;

    @property(cc.Button)
    teleportButton: cc.Button = null;

    @property(cc.Label)
    bombCountLabel: cc.Label = null;

    @property(cc.Label)
    teleportCountLabel: cc.Label = null;

    @property(cc.Node)
    bombHighlightNode: cc.Node = null;

    @property(cc.Node)
    teleportHighlightNode: cc.Node = null;

    init(callbacks: BoosterPanelCallbacks): void {
        if (this.bombButton) {
            this.bombButton.node.off(cc.Node.EventType.TOUCH_END);
            this.bombButton.node.on(cc.Node.EventType.TOUCH_END, callbacks.onBombClick);
        }
        if (this.teleportButton) {
            this.teleportButton.node.off(cc.Node.EventType.TOUCH_END);
            this.teleportButton.node.on(cc.Node.EventType.TOUCH_END, callbacks.onTeleportClick);
        }
    }

    updateCount(slotId: string, count: number): void {
        if (slotId === "bomb" && this.bombCountLabel) {
            this.bombCountLabel.string = `${count}`;
            return;
        }
        if (slotId === "teleport" && this.teleportCountLabel) {
            this.teleportCountLabel.string = `${count}`;
        }
    }

    setHighlight(slotId: string, active: boolean): void {
        if (slotId === "bomb" && this.bombHighlightNode) {
            this.bombHighlightNode.active = active;
            return;
        }
        if (slotId === "teleport" && this.teleportHighlightNode) {
            this.teleportHighlightNode.active = active;
        }
    }

    clearHighlights(): void {
        this.setHighlight("bomb", false);
        this.setHighlight("teleport", false);
    }
}
