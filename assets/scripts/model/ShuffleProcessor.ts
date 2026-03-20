import Grid from "./Grid";
import Tile from "./Tile";
import MatchFinder from "./MatchFinder";
import GameConfig from "../config/GameConfig";

export default class ShuffleProcessor {
    static shuffle(grid: Grid): boolean {
        const tiles = grid.getAllTiles().filter(t => !t.isSuperTile);
        if (tiles.length < 2) {
            return false;
        }

        for (let attempt = 0; attempt < 100; attempt++) {
            this.shuffleColors(tiles);
            if (MatchFinder.hasAnyGroup(grid, GameConfig.MIN_GROUP_SIZE)) {
                return true;
            }
        }
        return false;
    }

    private static shuffleColors(tiles: Tile[]): void {
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tempColor = tiles[i].color;
            tiles[i].color = tiles[j].color;
            tiles[j].color = tempColor;
        }
    }
}
