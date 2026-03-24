import Grid from "../Grid";
import Tile from "../Tile";

export default interface IBoardBoosterEffect {
    getAffectedTiles(grid: Grid, tile: Tile): Tile[];
}
