import GameConfig from "../../config/GameConfig";
import { SuperTileType } from "../TileType";

export default class SuperTileSpawnRules {
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
}
