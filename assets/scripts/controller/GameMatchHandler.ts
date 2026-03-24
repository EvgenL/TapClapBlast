import Tile from "../model/Tile";
import { TileColor, SuperTileType } from "../model/TileType";
import MatchFinder from "../model/MatchFinder";
import GravityProcessor from "../model/GravityProcessor";
import ScoreCalculator from "../model/ScoreCalculator";
import ShuffleProcessor from "../model/ShuffleProcessor";
import SuperTileSpawnRules from "../model/boosters/SuperTileSpawnRules";
import GameConfig from "../config/GameConfig";
import GameEvents from "../utils/GameEvents";
import GameMatchContext from "./GameMatchContext";
import { BoosterTileClickResult } from "./BoosterBarPresenter";

export default class GameMatchHandler {
    constructor(private readonly _c: GameMatchContext) {}

    onTileClick(row: number, col: number): void {
        if (this._c.isProcessing) {
            return;
        }
        const boosterResult = this._c.boosterBar.handleTileClick(this._c.grid, row, col);
        if (boosterResult.type === "not_handled") {
            this.handleNormalClick(row, col);
            return;
        }
        this.handleBoosterTileClickResult(boosterResult);
    }

    updateHud(): void {
        const level = this._c.levelService.getCurrentLevel();
        const targetScore = level.targetScore;
        this._c.hudView.updateScore(this._c.score, targetScore);
        this._c.hudView.updateMoves(this._c.movesLeft);
        this._c.hudView.updateShuffles(this._c.shufflesLeft);
        this._c.hudView.updateLevel(level.id);
    }

    private handleNormalClick(row: number, col: number): void {
        const tile = this._c.grid.getTile(row, col);
        if (!tile) {
            return;
        }
        if (tile.isSuperTile) {
            this.activateSuperTile(tile);
            return;
        }
        const group = MatchFinder.findGroup(this._c.grid, row, col);
        if (group.length < GameConfig.MIN_GROUP_SIZE) {
            return;
        }

        this._c.isProcessing = true;
        this._c.movesLeft--;

        const superType = SuperTileSpawnRules.getSuperType(group.length);
        for (const t of group) {
            this._c.grid.removeTile(t.row, t.col);
        }
        this._c.score += ScoreCalculator.calculate(group.length);

        let newSuper: Tile | null = null;
        if (superType !== SuperTileType.None) {
            newSuper = new Tile(TileColor.Blue, row, col, superType);
            this._c.grid.setTile(row, col, newSuper);
        }

        this._c.boardView.destroyTiles(group, () => {
            if (newSuper) {
                this._c.boardView.createTileNode(newSuper);
            }
            this.processGravityAndFill();
        });
    }

    private activateSuperTile(tile: Tile): void {
        this._c.isProcessing = true;
        this._c.movesLeft--;
        const allDestroyed = this._c.chainDestruction.collectChainDestructions(this._c.grid, [tile]);
        for (const t of allDestroyed) {
            this._c.grid.removeTile(t.row, t.col);
        }
        this._c.score += ScoreCalculator.calculate(allDestroyed.length);
        this._c.boardView.destroyTiles(allDestroyed, () => { this.processGravityAndFill(); });
    }

    private handleBoosterTileClickResult(result: BoosterTileClickResult): void {
        if (result.type === "handled_no_action") {
            return;
        }
        if (result.type === "teleport_swap") {
            this._c.isProcessing = true;
            this._c.boardView.animateSwap(result.tile1, result.tile2, () => {
                this._c.isProcessing = false;
            });
            return;
        }
        if (result.type === "bomb_applied") {
            this._c.isProcessing = true;
            this._c.score += result.score;
            for (const t of result.destroyed) {
                this._c.grid.removeTile(t.row, t.col);
            }
            this._c.boardView.destroyTiles(result.destroyed, () => { this.processGravityAndFill(); });
            return;
        }
    }

    private processGravityAndFill(): void {
        const moves = GravityProcessor.applyGravity(this._c.grid);
        this._c.boardView.animateFalls(moves, () => {
            const newTiles = this._c.grid.fill();
            this._c.boardView.spawnTiles(newTiles, () => { this.checkGameState(); });
        });
    }

    private checkGameState(): void {
        this.updateHud();
        const targetScore = this._c.levelService.getCurrentLevel().targetScore;
        if (this._c.score >= targetScore) {
            if (this._c.levelService.isLastLevel()) {
                this._c.popupView.show({
                    title: "Victory!",
                    message: `Score: ${this._c.score}\nAll levels complete!`,
                    buttonText: "Play again",
                    eventName: GameEvents.RESTART_CAMPAIGN
                });
            } else {
                this._c.popupView.show({
                    title: "Уровень пройден",
                    message: `Счёт: ${this._c.score}`,
                    buttonText: "OK Next Level",
                    eventName: GameEvents.NEXT_LEVEL
                });
            }
            return;
        }
        if (this._c.movesLeft <= 0) {
            this._c.popupView.show({
                title: "Game Over",
                message: `Score: ${this._c.score}/${targetScore}`,
                buttonText: "Retry",
                eventName: GameEvents.RESTART_GAME
            });
            return;
        }
        if (!MatchFinder.hasAnyGroup(this._c.grid, GameConfig.MIN_GROUP_SIZE)) {
            this.handleNoMoves();
            return;
        }
        this._c.isProcessing = false;
    }

    private handleNoMoves(): void {
        if (this._c.shufflesLeft <= 0) {
            this._c.popupView.show({
                title: "Game Over",
                message: "No moves available",
                buttonText: "Retry",
                eventName: GameEvents.RESTART_GAME
            });
            return;
        }
        this._c.shufflesLeft--;
        if (!ShuffleProcessor.shuffle(this._c.grid)) {
            this._c.popupView.show({
                title: "Game Over",
                message: "No moves available",
                buttonText: "Retry",
                eventName: GameEvents.RESTART_GAME
            });
            return;
        }
        this.updateHud();
        this._c.boardView.animateShuffle(this._c.grid, () => { this._c.isProcessing = false; });
    }
}
