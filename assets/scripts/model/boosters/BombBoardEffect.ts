import Grid from "../Grid";
import Tile from "../Tile";
import IBoardBoosterEffect from "./IBoardBoosterEffect";

export default class BombBoardEffect implements IBoardBoosterEffect {
    constructor(private readonly _radius: number) {
    }

    getAffectedTiles(grid: Grid, tile: Tile): Tile[] {
        return this.collectDiamond(grid, tile.row, tile.col, this._radius);
    }

    getAffectedTilesAt(grid: Grid, row: number, col: number): Tile[] {
        return this.collectDiamond(grid, row, col, this._radius);
    }

    private collectDiamond(grid: Grid, row: number, col: number, radius: number): Tile[] {
        const tiles: Tile[] = [];
        for (let r = row - radius; r <= row + radius; r++) {
            for (let c = col - radius; c <= col + radius; c++) {
                if (Math.abs(r - row) + Math.abs(c - col) <= radius) {
                    const t = grid.getTile(r, c);
                    if (t) {
                        tiles.push(t);
                    }
                }
            }
        }
        return tiles;
    }
}
