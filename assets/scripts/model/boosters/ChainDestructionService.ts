import Grid from "../Grid";
import Tile from "../Tile";
import SuperTileEffectRegistry from "./SuperTileEffectRegistry";

export default class ChainDestructionService {
    constructor(private readonly _registry: SuperTileEffectRegistry) {
    }

    collectChainDestructions(grid: Grid, initialTiles: Tile[]): Tile[] {
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
                const affected = this._registry.getAffectedTilesForSuperTile(grid, tile);
                for (const t of affected) {
                    if (!destroyedIds.has(t.id)) {
                        queue.push(t);
                    }
                }
            }
        }
        return result;
    }
}
