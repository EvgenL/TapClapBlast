import Grid from "../model/Grid";
import Tile from "../model/Tile";
import BombBoardEffect from "../model/boosters/BombBoardEffect";
import ChainDestructionService from "../model/boosters/ChainDestructionService";
import ScoreCalculator from "../model/ScoreCalculator";
import BoardView from "../view/BoardView";
import BoosterPanelView from "../view/BoosterPanelView";

export enum InputMode {
    Normal,
    Bomb,
    TeleportFirst,
    TeleportSecond,
}

export type BoosterTileClickResult =
    | { type: "not_handled" }
    | { type: "handled_no_action" }
    | { type: "bomb_applied"; destroyed: Tile[]; score: number }
    | { type: "teleport_swap"; tile1: Tile; tile2: Tile };

export const BOOSTER_SLOT_BOMB = "bomb";
export const BOOSTER_SLOT_TELEPORT = "teleport";

export default class BoosterBarPresenter {
    private _inputMode: InputMode = InputMode.Normal;
    private _teleportFirst: Tile = null;
    private _bombsLeft: number = 0;
    private _teleportsLeft: number = 0;
    private _canUseBoosters: () => boolean = () => true;

    constructor(
        private readonly _panel: BoosterPanelView,
        private readonly _boardView: BoardView,
        private readonly _chainDestruction: ChainDestructionService,
        private readonly _inventoryBombEffect: BombBoardEffect
    ) {
        this._panel.init({
            onBombClick: () => { this.toggleBomb(); },
            onTeleportClick: () => { this.toggleTeleport(); },
        });
    }

    setCanUseBoosters(can: () => boolean): void {
        this._canUseBoosters = can;
    }

    get inputMode(): InputMode {
        return this._inputMode;
    }

    reset(bombs: number, teleports: number): void {
        this._bombsLeft = bombs;
        this._teleportsLeft = teleports;
        this._inputMode = InputMode.Normal;
        this._teleportFirst = null;
        this._panel.updateCount(BOOSTER_SLOT_BOMB, this._bombsLeft);
        this._panel.updateCount(BOOSTER_SLOT_TELEPORT, this._teleportsLeft);
        this._panel.clearHighlights();
    }

    toggleBomb(): void {
        if (!this._canUseBoosters()) {
            return;
        }
        if (this._bombsLeft <= 0) {
            return;
        }
        if (this._inputMode === InputMode.Bomb) {
            this._inputMode = InputMode.Normal;
            this._panel.setHighlight(BOOSTER_SLOT_BOMB, false);
        } else {
            this.cancelMode();
            this._inputMode = InputMode.Bomb;
            this._panel.setHighlight(BOOSTER_SLOT_BOMB, true);
        }
    }

    toggleTeleport(): void {
        if (!this._canUseBoosters()) {
            return;
        }
        if (this._teleportsLeft <= 0) {
            return;
        }
        if (this._inputMode === InputMode.TeleportFirst || this._inputMode === InputMode.TeleportSecond) {
            this.cancelMode();
        } else {
            this.cancelMode();
            this._inputMode = InputMode.TeleportFirst;
            this._panel.setHighlight(BOOSTER_SLOT_TELEPORT, true);
        }
    }

    tryApplyInventoryBomb(grid: Grid, row: number, col: number): { destroyed: Tile[], score: number } | null {
        if (this._bombsLeft <= 0) {
            return null;
        }
        this._bombsLeft--;
        this._inputMode = InputMode.Normal;
        this._panel.updateCount(BOOSTER_SLOT_BOMB, this._bombsLeft);
        this._panel.setHighlight(BOOSTER_SLOT_BOMB, false);

        const seeds = this._inventoryBombEffect.getAffectedTilesAt(grid, row, col);
        const allDestroyed = this._chainDestruction.collectChainDestructions(grid, seeds);
        const score = ScoreCalculator.calculate(allDestroyed.length);
        return { destroyed: allDestroyed, score };
    }

    handleTileClick(grid: Grid, row: number, col: number): BoosterTileClickResult {
        if (this._inputMode === InputMode.Normal) {
            return { type: "not_handled" };
        }
        if (this._inputMode === InputMode.Bomb) {
            const bombResult = this.tryApplyInventoryBomb(grid, row, col);
            if (!bombResult) {
                return { type: "handled_no_action" };
            }
            return {
                type: "bomb_applied",
                destroyed: bombResult.destroyed,
                score: bombResult.score,
            };
        }
        if (this._inputMode === InputMode.TeleportFirst) {
            this.handleTeleportFirstClick(grid, row, col);
            return { type: "handled_no_action" };
        }
        if (this._inputMode === InputMode.TeleportSecond) {
            const swapResult = this.handleTeleportSecondClick(grid, row, col);
            if (!swapResult) {
                return { type: "handled_no_action" };
            }
            return {
                type: "teleport_swap",
                tile1: swapResult.tile1,
                tile2: swapResult.tile2,
            };
        }
        return { type: "handled_no_action" };
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
        this._panel.updateCount(BOOSTER_SLOT_TELEPORT, this._teleportsLeft);
        this._panel.setHighlight(BOOSTER_SLOT_TELEPORT, false);
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
        this._panel.clearHighlights();
    }

}
