import Grid from "../Grid";
import Tile from "../Tile";
import IBoardBoosterEffect from "./IBoardBoosterEffect";

export default class MegaBombBoardEffect implements IBoardBoosterEffect {
    getAffectedTiles(grid: Grid, _tile: Tile): Tile[] {
        return grid.getAllTiles();
    }
}
