import Grid from "../Grid";
import Tile from "../Tile";
import { SuperTileType } from "../TileType";
import GameConfig from "../../config/GameConfig";
import BombBoardEffect from "./BombBoardEffect";
import MegaBombBoardEffect from "./MegaBombBoardEffect";
import RocketBoardEffect from "./RocketBoardEffect";
import IBoardBoosterEffect from "./IBoardBoosterEffect";

export default class SuperTileEffectRegistry {
    private readonly _byType: Map<SuperTileType, IBoardBoosterEffect>;

    constructor(
        superBombEffect: BombBoardEffect,
        megaBombEffect: MegaBombBoardEffect,
        rocketEffect: RocketBoardEffect
    ) {
        this._byType = new Map([
            [SuperTileType.Bomb, superBombEffect],
            [SuperTileType.MegaBomb, megaBombEffect],
            [SuperTileType.RocketH, rocketEffect],
            [SuperTileType.RocketV, rocketEffect],
        ]);
    }

    static createDefault(): SuperTileEffectRegistry {
        return new SuperTileEffectRegistry(
            new BombBoardEffect(GameConfig.SUPER_BOMB_RADIUS),
            new MegaBombBoardEffect(),
            new RocketBoardEffect()
        );
    }

    getAffectedTilesForSuperTile(grid: Grid, tile: Tile): Tile[] {
        const effect = this._byType.get(tile.superType);
        return effect ? effect.getAffectedTiles(grid, tile) : [];
    }
}
