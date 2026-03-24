import Tile from "./Tile";
import { TileColor } from "./TileType";
import GameConfig from "../config/GameConfig";

export default class Grid {
    private _cells: (Tile | null)[][];
    readonly rows: number;
    readonly cols: number;

    constructor(rows: number = GameConfig.BOARD_ROWS, cols: number = GameConfig.BOARD_COLS) {
        this.rows = rows;
        this.cols = cols;
        this._cells = [];
        for (let r = 0; r < rows; r++) {
            this._cells[r] = [];
            for (let c = 0; c < cols; c++) {
                this._cells[r][c] = null;
            }
        }
    }

    getTile(row: number, col: number): Tile | null {
        if (!this.isInBounds(row, col)) {
            return null;
        }
        return this._cells[row][col];
    }

    setTile(row: number, col: number, tile: Tile | null): void {
        if (!this.isInBounds(row, col)) {
            return;
        }
        this._cells[row][col] = tile;
        if (tile) {
            tile.row = row;
            tile.col = col;
        }
    }

    removeTile(row: number, col: number): Tile | null {
        const tile = this.getTile(row, col);
        if (tile) {
            this._cells[row][col] = null;
        }
        return tile;
    }

    isInBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    fill(randomFn: () => number = Math.random): Tile[] {
        const created: Tile[] = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this._cells[r][c]) {
                    const color = Math.floor(randomFn() * GameConfig.TILE_COLORS_COUNT) as TileColor;
                    const tile = new Tile(color, r, c);
                    this._cells[r][c] = tile;
                    created.push(tile);
                }
            }
        }
        return created;
    }

    getAllTiles(): Tile[] {
        const tiles: Tile[] = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const tile = this._cells[r][c];
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }

    swapTiles(row1: number, col1: number, row2: number, col2: number): void {
        const tile1 = this.getTile(row1, col1);
        const tile2 = this.getTile(row2, col2);
        this.setTile(row1, col1, tile2);
        this.setTile(row2, col2, tile1);
    }
}
