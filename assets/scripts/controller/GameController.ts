import Grid from "../model/Grid";
import Tile from "../model/Tile";
import { TileColor, SuperTileType } from "../model/TileType";
import MatchFinder from "../model/MatchFinder";
import GravityProcessor from "../model/GravityProcessor";
import ScoreCalculator from "../model/ScoreCalculator";
import ShuffleProcessor from "../model/ShuffleProcessor";
import SuperTileProcessor from "../model/SuperTileProcessor";
import GameConfig from "../config/GameConfig";
import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";
import BoardView from "../view/BoardView";
import HudView from "../view/HudView";
import BoosterPanelView from "../view/BoosterPanelView";
import PopupView from "../view/PopupView";
import UIBuilder from "../view/UIBuilder";
import InputController, { InputMode } from "./InputController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property([cc.SpriteFrame])
    colorSprites: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    superSprites: cc.SpriteFrame[] = [];

    private _grid: Grid = null;
    private _boardView: BoardView = null;
    private _hudView: HudView = null;
    private _boosterPanel: BoosterPanelView = null;
    private _popupView: PopupView = null;
    private _inputCtrl: InputController = null;
    private _score: number = 0;
    private _movesLeft: number = 0;
    private _shufflesLeft: number = 0;
    private _isProcessing: boolean = false;

    start(): void {
        const views = UIBuilder.build(this.node, this.colorSprites, this.superSprites);
        this._boardView = views.boardView;
        this._hudView = views.hudView;
        this._boosterPanel = views.boosterPanel;
        this._popupView = views.popupView;
        this.initGame();
        this.registerEvents();
    }

    onDestroy(): void {
        EventBus.clear();
    }

    private initGame(): void {
        this._score = 0;
        this._movesLeft = GameConfig.MAX_MOVES;
        this._shufflesLeft = GameConfig.MAX_SHUFFLES;
        this._isProcessing = false;

        Tile.resetIdCounter();
        this._grid = new Grid();
        this._grid.fill();

        while (!MatchFinder.hasAnyGroup(this._grid, GameConfig.MIN_GROUP_SIZE)) {
            ShuffleProcessor.shuffle(this._grid);
        }

        this._inputCtrl = new InputController(
            this._boardView, this._boosterPanel,
            GameConfig.BOMB_USES, GameConfig.TELEPORT_USES
        );

        this._boardView.createBoard(this._grid);
        this.updateHud();
    }

    private registerEvents(): void {
        EventBus.on(GameEvents.TILE_CLICK, this.onTileClick.bind(this));
        EventBus.on(GameEvents.BOOSTER_BOMB_ACTIVATE, () => {
            if (!this._isProcessing) { this._inputCtrl.toggleBomb(); }
        });
        EventBus.on(GameEvents.BOOSTER_TELEPORT_ACTIVATE, () => {
            if (!this._isProcessing) { this._inputCtrl.toggleTeleport(); }
        });
        EventBus.on(GameEvents.RESTART_GAME, this.onRestart.bind(this));
    }

    private onTileClick(row: number, col: number): void {
        if (this._isProcessing) {
            return;
        }
        switch (this._inputCtrl.inputMode) {
            case InputMode.Normal:
                this.handleNormalClick(row, col);
                break;
            case InputMode.Bomb:
                this.handleBombClick(row, col);
                break;
            case InputMode.TeleportFirst:
                this.handleTeleportFirst(row, col);
                break;
            case InputMode.TeleportSecond:
                this.handleTeleportSecond(row, col);
                break;
        }
    }

    private handleNormalClick(row: number, col: number): void {
        const tile = this._grid.getTile(row, col);
        if (!tile) {
            return;
        }
        if (tile.isSuperTile) {
            this.activateSuperTile(tile);
            return;
        }
        const group = MatchFinder.findGroup(this._grid, row, col);
        if (group.length < GameConfig.MIN_GROUP_SIZE) {
            return;
        }

        this._isProcessing = true;
        this._movesLeft--;

        const superType = SuperTileProcessor.getSuperType(group.length);
        for (const t of group) {
            this._grid.removeTile(t.row, t.col);
        }
        this._score += ScoreCalculator.calculate(group.length);

        let newSuper: Tile | null = null;
        if (superType !== SuperTileType.None) {
            newSuper = new Tile(TileColor.Blue, row, col, superType);
            this._grid.setTile(row, col, newSuper);
        }

        this._boardView.destroyTiles(group, () => {
            if (newSuper) {
                this._boardView.createTileNode(newSuper);
            }
            this.processGravityAndFill();
        });
    }

    private activateSuperTile(tile: Tile): void {
        this._isProcessing = true;
        this._movesLeft--;

        const allDestroyed = SuperTileProcessor.collectChainDestructions(this._grid, [tile]);
        for (const t of allDestroyed) {
            this._grid.removeTile(t.row, t.col);
        }
        this._score += ScoreCalculator.calculate(allDestroyed.length);

        this._boardView.destroyTiles(allDestroyed, () => {
            this.processGravityAndFill();
        });
    }

    private handleBombClick(row: number, col: number): void {
        const result = this._inputCtrl.handleBombClick(this._grid, row, col);
        if (!result) {
            return;
        }
        this._isProcessing = true;
        this._score += result.score;
        this._boardView.destroyTiles(result.destroyed, () => {
            this.processGravityAndFill();
        });
    }

    private handleTeleportFirst(row: number, col: number): void {
        this._inputCtrl.handleTeleportFirstClick(this._grid, row, col);
    }

    private handleTeleportSecond(row: number, col: number): void {
        const result = this._inputCtrl.handleTeleportSecondClick(this._grid, row, col);
        if (!result) {
            return;
        }
        this._isProcessing = true;
        this._boardView.animateSwap(result.tile1, result.tile2, () => {
            this._isProcessing = false;
        });
    }

    private processGravityAndFill(): void {
        const moves = GravityProcessor.applyGravity(this._grid);
        this._boardView.animateFalls(moves, () => {
            const newTiles = this._grid.fill();
            this._boardView.spawnTiles(newTiles, () => {
                this.checkGameState();
            });
        });
    }

    private checkGameState(): void {
        this.updateHud();

        if (this._score >= GameConfig.TARGET_SCORE) {
            this._popupView.show("Victory!", `Score: ${this._score}`);
            return;
        }
        if (this._movesLeft <= 0) {
            this._popupView.show("Game Over", `Score: ${this._score}/${GameConfig.TARGET_SCORE}`);
            return;
        }
        if (!MatchFinder.hasAnyGroup(this._grid, GameConfig.MIN_GROUP_SIZE)) {
            this.handleNoMoves();
            return;
        }
        this._isProcessing = false;
    }

    private handleNoMoves(): void {
        if (this._shufflesLeft <= 0) {
            this._popupView.show("Game Over", "No moves available");
            return;
        }
        this._shufflesLeft--;
        if (!ShuffleProcessor.shuffle(this._grid)) {
            this._popupView.show("Game Over", "No moves available");
            return;
        }
        this.updateHud();
        this._boardView.animateShuffle(this._grid, () => {
            this._isProcessing = false;
        });
    }

    private updateHud(): void {
        this._hudView.updateScore(this._score, GameConfig.TARGET_SCORE);
        this._hudView.updateMoves(this._movesLeft);
        this._hudView.updateShuffles(this._shufflesLeft);
    }

    private onRestart(): void {
        this._popupView.hide();
        this.initGame();
    }
}
