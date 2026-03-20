const { ccclass } = cc._decorator;

@ccclass
export default class HudView extends cc.Component {
    private _scoreLabel: cc.Label = null;
    private _movesLabel: cc.Label = null;
    private _shufflesLabel: cc.Label = null;

    init(): void {
        this.node.setContentSize(700, 140);
        this.node.setPosition(0, 540);

        this._scoreLabel = this.createLabel("Score: 0/500", -180, 35, 34);
        this._movesLabel = this.createLabel("Moves: 37", 180, 35, 34);
        this._shufflesLabel = this.createLabel("Shuffles: 3", 0, -15, 26);
    }

    updateScore(score: number, target: number): void {
        if (this._scoreLabel) {
            this._scoreLabel.string = `Score: ${score}/${target}`;
        }
    }

    updateMoves(moves: number): void {
        if (this._movesLabel) {
            this._movesLabel.string = `Moves: ${moves}`;
        }
    }

    updateShuffles(shuffles: number): void {
        if (this._shufflesLabel) {
            this._shufflesLabel.string = `Shuffles: ${shuffles}`;
        }
    }

    private createLabel(text: string, x: number, y: number, fontSize: number): cc.Label {
        const node = new cc.Node(text);
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.enableBold = true;
        node.setPosition(x, y);
        node.color = cc.Color.WHITE;
        this.node.addChild(node);
        return label;
    }
}
