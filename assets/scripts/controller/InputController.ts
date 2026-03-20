import Grid from "../model/Grid";
import Tile from "../model/Tile";
import SuperTileProcessor from "../model/SuperTileProcessor";
import ScoreCalculator from "../model/ScoreCalculator";
import GameConfig from "../config/GameConfig";
import BoardView from "../view/BoardView";
import BoosterPanelView from "../view/BoosterPanelView";

export enum InputMode {
    Normal,
    Bomb,
    TeleportFirst,
    TeleportSecond,
}

export default class InputController {
    private _inputMode: InputMode = InputMode.Normal;
    private _teleportFirst: Tile = null;
    private _bombsLeft: number;
    private _teleportsLeft: number;
    private _boardView: BoardView;
    private _boosterPanel: BoosterPanelView;

    get inputMode(): InputMode { return this._inputMode; }
    get bombsLeft(): number { return this._bombsLeft; }
    get teleportsLeft(): number { return this._teleportsLeft; }

    constructor(boardView: BoardView, boosterPanel: BoosterPanelView, bombs: number, teleports: number) {
        this._boardView = boardView;
        this._boosterPanel = boosterPanel;
        this._bombsLeft = bombs;
        this._teleportsLeft = teleports;
    }

    reset(bombs: number, teleports: number): void {
        this._bombsLeft = bombs;
        this._teleportsLeft = teleports;
        this._inputMode = InputMode.Normal;
        this._teleportFirst = null;
    }

    toggleBomb(): void {
        if (this._bombsLeft <= 0) {
            return;
        }
        if (this._inputMode === InputMode.Bomb) {
            this._inputMode = InputMode.Normal;
            this._boosterPanel.highlightBomb(false);
        } else {
            this.cancelMode();
            this._inputMode = InputMode.Bomb;
            this._boosterPanel.highlightBomb(true);
        }
    }

    toggleTeleport(): void {
        if (this._teleportsLeft <= 0) {
            return;
        }
        if (this._inputMode === InputMode.TeleportFirst || this._inputMode === InputMode.TeleportSecond) {
            this.cancelMode();
        } else {
            this.cancelMode();
            this._inputMode = InputMode.TeleportFirst;
            this._boosterPanel.highlightTeleport(true);
        }
    }

    handleBombClick(grid: Grid, row: number, col: number): { destroyed: Tile[], score: number } | null {
        if (this._bombsLeft <= 0) {
            return null;
        }
        this._bombsLeft--;
        this._inputMode = InputMode.Normal;
        this._boosterPanel.updateBombCount(this._bombsLeft);
        this._boosterPanel.highlightBomb(false);

        const tilesToDestroy: Tile[] = [];
        for (let r = row - GameConfig.BOMB_RADIUS; r <= row + GameConfig.BOMB_RADIUS; r++) {
            for (let c = col - GameConfig.BOMB_RADIUS; c <= col + GameConfig.BOMB_RADIUS; c++) {
                if (Math.abs(r - row) + Math.abs(c - col) <= GameConfig.BOMB_RADIUS) {
                    const t = grid.getTile(r, c);
                    if (t) {
                        tilesToDestroy.push(t);
                    }
                }
            }
        }

        const allDestroyed = SuperTileProcessor.collectChainDestructions(grid, tilesToDestroy);
        for (const t of allDestroyed) {
            grid.removeTile(t.row, t.col);
        }
        return { destroyed: allDestroyed, score: ScoreCalculator.calculate(allDestroyed.length) };
    }

    handleTeleportFirstClick(grid: Grid, row: number, col: number): boolean {
        const tile = grid.getTile(row, col);
        if (!tile) {
            return false;
        }
        this._teleportFirst = tile;
        this._boardView.highlightTile(tile.id, true);
        this._inputMode = InputMode.TeleportSecond;
        return true;
    }

    handleTeleportSecondClick(grid: Grid, row: number, col: number): { tile1: Tile, tile2: Tile } | null {
        const tile = grid.getTile(row, col);
        if (!tile || !this._teleportFirst || tile.id === this._teleportFirst.id) {
            return null;
        }
        this._teleportsLeft--;
        this._inputMode = InputMode.Normal;
        this._boosterPanel.updateTeleportCount(this._teleportsLeft);
        this._boosterPanel.highlightTeleport(false);
        this._boardView.highlightTile(this._teleportFirst.id, false);

        const first = this._teleportFirst;
        this._teleportFirst = null;
        grid.swapTiles(first.row, first.col, tile.row, tile.col);
        return { tile1: first, tile2: tile };
    }

    cancelMode(): void {
        if (this._inputMode === InputMode.TeleportSecond && this._teleportFirst) {
            this._boardView.highlightTile(this._teleportFirst.id, false);
        }
        this._inputMode = InputMode.Normal;
        this._teleportFirst = null;
        this._boosterPanel.highlightBomb(false);
        this._boosterPanel.highlightTeleport(false);
    }
}
