import Grid from "./Grid";
import Tile from "./Tile";
import { SuperTileType } from "./TileType";
import GameConfig from "../config/GameConfig";

export default class SuperTileProcessor {
    static getSuperType(groupSize: number): SuperTileType {
        if (groupSize >= GameConfig.SUPER_MEGA_THRESHOLD) {
            return SuperTileType.MegaBomb;
        }
        if (groupSize >= GameConfig.SUPER_BOMB_THRESHOLD) {
            return SuperTileType.Bomb;
        }
        if (groupSize >= GameConfig.SUPER_ROCKET_THRESHOLD) {
            return Math.random() < 0.5 ? SuperTileType.RocketH : SuperTileType.RocketV;
        }
        return SuperTileType.None;
    }

    static getAffectedTiles(grid: Grid, tile: Tile): Tile[] {
        switch (tile.superType) {
            case SuperTileType.RocketH:
                return this.getRowTiles(grid, tile.row);
            case SuperTileType.RocketV:
                return this.getColTiles(grid, tile.col);
            case SuperTileType.Bomb:
                return this.getRadiusTiles(grid, tile.row, tile.col, GameConfig.SUPER_BOMB_RADIUS);
            case SuperTileType.MegaBomb:
                return grid.getAllTiles();
            default:
                return [];
        }
    }

    static collectChainDestructions(grid: Grid, initialTiles: Tile[]): Tile[] {
        const destroyedIds = new Set<number>();
        const result: Tile[] = [];
        const queue: Tile[] = [...initialTiles];

        while (queue.length > 0) {
            const tile = queue.shift()!;
            if (destroyedIds.has(tile.id)) {
                continue;
            }
            destroyedIds.add(tile.id);
            result.push(tile);

            if (tile.isSuperTile) {
                const affected = this.getAffectedTiles(grid, tile);
                for (const t of affected) {
                    if (!destroyedIds.has(t.id)) {
                        queue.push(t);
                    }
                }
            }
        }
        return result;
    }

    private static getRowTiles(grid: Grid, row: number): Tile[] {
        const tiles: Tile[] = [];
        for (let c = 0; c < grid.cols; c++) {
            const t = grid.getTile(row, c);
            if (t) {
                tiles.push(t);
            }
        }
        return tiles;
    }

    private static getColTiles(grid: Grid, col: number): Tile[] {
        const tiles: Tile[] = [];
        for (let r = 0; r < grid.rows; r++) {
            const t = grid.getTile(r, col);
            if (t) {
                tiles.push(t);
            }
        }
        return tiles;
    }

    private static getRadiusTiles(grid: Grid, row: number, col: number, radius: number): Tile[] {
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
