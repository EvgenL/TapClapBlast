import { TileColor, SuperTileType } from "./TileType";

export default class Tile {
    readonly id: number;
    color: TileColor;
    superType: SuperTileType;
    row: number;
    col: number;

    private static _nextId: number = 0;

    constructor(color: TileColor, row: number, col: number, superType: SuperTileType = SuperTileType.None) {
        this.id = Tile._nextId++;
        this.color = color;
        this.superType = superType;
        this.row = row;
        this.col = col;
    }

    get isSuperTile(): boolean {
        return this.superType !== SuperTileType.None;
    }

    static resetIdCounter(): void {
        Tile._nextId = 0;
    }
}
