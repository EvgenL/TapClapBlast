import Grid from "../Grid";
import Tile from "../Tile";
import { SuperTileType } from "../TileType";
import IBoardBoosterEffect from "./IBoardBoosterEffect";

export default class RocketBoardEffect implements IBoardBoosterEffect {
    getAffectedTiles(grid: Grid, tile: Tile): Tile[] {
        if (tile.superType === SuperTileType.RocketH) {
            return this.getRowTiles(grid, tile.row);
        }
        if (tile.superType === SuperTileType.RocketV) {
            return this.getColTiles(grid, tile.col);
        }
        return [];
    }

    private getRowTiles(grid: Grid, row: number): Tile[] {
        const tiles: Tile[] = [];
        for (let c = 0; c < grid.cols; c++) {
            const t = grid.getTile(row, c);
            if (t) {
                tiles.push(t);
            }
        }
        return tiles;
    }

    private getColTiles(grid: Grid, col: number): Tile[] {
        const tiles: Tile[] = [];
        for (let r = 0; r < grid.rows; r++) {
            const t = grid.getTile(r, col);
            if (t) {
                tiles.push(t);
            }
        }
        return tiles;
    }
}
