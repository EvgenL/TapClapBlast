import { TileColor, SuperTileType } from "../model/TileType";
import Tile from "../model/Tile";

export default class TileSpriteSet {
    blue: cc.SpriteFrame;
    green: cc.SpriteFrame;
    purple: cc.SpriteFrame;
    red: cc.SpriteFrame;
    yellow: cc.SpriteFrame;
    rocketH: cc.SpriteFrame;
    rocketV: cc.SpriteFrame;
    bomb: cc.SpriteFrame;
    megaBomb: cc.SpriteFrame;

    constructor(
        blue: cc.SpriteFrame, green: cc.SpriteFrame, purple: cc.SpriteFrame,
        red: cc.SpriteFrame, yellow: cc.SpriteFrame,
        rocketH: cc.SpriteFrame, rocketV: cc.SpriteFrame,
        bomb: cc.SpriteFrame, megaBomb: cc.SpriteFrame
    ) {
        this.blue = blue;
        this.green = green;
        this.purple = purple;
        this.red = red;
        this.yellow = yellow;
        this.rocketH = rocketH;
        this.rocketV = rocketV;
        this.bomb = bomb;
        this.megaBomb = megaBomb;
    }

    getSpriteFrame(tile: Tile): cc.SpriteFrame {
        if (tile.isSuperTile) {
            return this.getSuperSprite(tile.superType);
        }
        return this.getColorSprite(tile.color);
    }

    private getColorSprite(color: TileColor): cc.SpriteFrame {
        switch (color) {
            case TileColor.Blue: return this.blue;
            case TileColor.Green: return this.green;
            case TileColor.Purple: return this.purple;
            case TileColor.Red: return this.red;
            case TileColor.Yellow: return this.yellow;
            default: return null;
        }
    }

    private getSuperSprite(superType: SuperTileType): cc.SpriteFrame {
        switch (superType) {
            case SuperTileType.RocketH: return this.rocketH;
            case SuperTileType.RocketV: return this.rocketV;
            case SuperTileType.Bomb: return this.bomb;
            case SuperTileType.MegaBomb: return this.megaBomb;
            default: return null;
        }
    }
}
