import Grid from "./Grid";
import Tile from "./Tile";

export interface TileMove {
    tile: Tile;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export default class GravityProcessor {
    static applyGravity(grid: Grid): TileMove[] {
        const moves: TileMove[] = [];

        for (let c = 0; c < grid.cols; c++) {
            let writeRow = grid.rows - 1;
            for (let r = grid.rows - 1; r >= 0; r--) {
                const tile = grid.getTile(r, c);
                if (tile) {
                    if (r !== writeRow) {
                        moves.push({
                            tile,
                            fromRow: r,
                            fromCol: c,
                            toRow: writeRow,
                            toCol: c,
                        });
                        grid.setTile(writeRow, c, tile);
                        grid.setTile(r, c, null);
                    }
                    writeRow--;
                }
            }
        }

        return moves;
    }
}
