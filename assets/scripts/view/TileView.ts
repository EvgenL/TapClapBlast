const { ccclass } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
    private _tileId: number = -1;
    private _row: number = -1;
    private _col: number = -1;

    get tileId(): number { return this._tileId; }
    get row(): number { return this._row; }
    get col(): number { return this._col; }

    init(tileId: number, row: number, col: number, spriteFrame: cc.SpriteFrame): void {
        this._tileId = tileId;
        this._row = row;
        this._col = col;
        const sprite = this.getComponent(cc.Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    updateGridPosition(row: number, col: number): void {
        this._row = row;
        this._col = col;
    }

    updateSprite(spriteFrame: cc.SpriteFrame): void {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    setHighlight(enabled: boolean): void {
        this.node.opacity = enabled ? 180 : 255;
    }
}
