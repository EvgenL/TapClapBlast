const { ccclass, property } = cc._decorator;

@ccclass
export default class HudView extends cc.Component {
    @property(cc.Label)
    levelValueLabel: cc.Label = null;

    @property(cc.Label)
    scoreValueLabel: cc.Label = null;

    @property(cc.Label)
    movesValueLabel: cc.Label = null;

    @property(cc.Label)
    shufflesValueLabel: cc.Label = null;

    init(): void {}

    updateScore(score: number, target: number): void {
        if (this.scoreValueLabel) {
            this.scoreValueLabel.string = `${score}/${target}`;
        }
    }

    updateMoves(moves: number): void {
        if (this.movesValueLabel) {
            this.movesValueLabel.string = `${moves}`;
        }
    }

    updateShuffles(shuffles: number): void {
        if (this.shufflesValueLabel) {
            this.shufflesValueLabel.string = `${shuffles}`;
        }
    }

    updateLevel(level: number): void {
        if (this.levelValueLabel) {
            this.levelValueLabel.string = `${level}`;
        }
    }
}
