import GameConfig from "../config/GameConfig";
import TileView from "./TileView";
import Tile from "../model/Tile";
import Grid from "../model/Grid";
import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";
import TileAnimator from "./TileAnimator";
import { TileMove } from "../model/GravityProcessor";

const { ccclass } = cc._decorator;

@ccclass
export default class BoardView extends cc.Component {
    private _tileViews: Map<number, TileView> = new Map();
    private _colorSprites: cc.SpriteFrame[] = [];
    private _superSprites: cc.SpriteFrame[] = [];
    private _tileSize: number = GameConfig.TILE_SIZE;
    private _rows: number = GameConfig.ROWS;
    private _cols: number = GameConfig.COLS;

    init(colorSprites: cc.SpriteFrame[], superSprites: cc.SpriteFrame[]): void {
        this._colorSprites = colorSprites;
        this._superSprites = superSprites;
        const bw = this._cols * this._tileSize;
        const bh = this._rows * this._tileSize;
        this.node.setContentSize(bw, bh);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.drawBackground(bw, bh);
    }

    createBoard(grid: Grid): void {
        this.clearBoard();
        for (const tile of grid.getAllTiles()) {
            this.createTileNode(tile);
        }
    }

    createTileNode(tile: Tile): TileView {
        const node = new cc.Node(`Tile_${tile.id}`);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(this._tileSize - 4, this._tileSize - 4);

        const tileView = node.addComponent(TileView);
        const spriteFrame = this.getSpriteFrame(tile);
        tileView.init(tile.id, tile.row, tile.col, spriteFrame);

        const pos = this.gridToLocal(tile.row, tile.col);
        node.setPosition(pos);
        this.node.addChild(node);
        this._tileViews.set(tile.id, tileView);
        return tileView;
    }

    destroyTiles(tiles: Tile[], callback: () => void): void {
        if (tiles.length === 0) {
            callback();
            return;
        }
        let completed = 0;
        for (const tile of tiles) {
            const view = this._tileViews.get(tile.id);
            if (!view) {
                completed++;
                if (completed >= tiles.length) { callback(); }
                continue;
            }
            TileAnimator.animateDestroy(view.node, () => {
                view.node.removeFromParent();
                view.node.destroy();
                this._tileViews.delete(tile.id);
                completed++;
                if (completed >= tiles.length) { callback(); }
            });
        }
    }

    animateFalls(moves: TileMove[], callback: () => void): void {
        if (moves.length === 0) {
            callback();
            return;
        }
        let completed = 0;
        for (const move of moves) {
            const view = this._tileViews.get(move.tile.id);
            if (!view) {
                completed++;
                if (completed >= moves.length) { callback(); }
                continue;
            }
            view.updateGridPosition(move.toRow, move.toCol);
            const target = this.gridToLocal(move.toRow, move.toCol);
            const dist = Math.abs(move.toRow - move.fromRow);
            TileAnimator.animateFall(view.node, target.x, target.y, dist, () => {
                completed++;
                if (completed >= moves.length) { callback(); }
            });
        }
    }

    spawnTiles(tiles: Tile[], callback: () => void): void {
        if (tiles.length === 0) {
            callback();
            return;
        }
        let completed = 0;
        for (const tile of tiles) {
            const tileView = this.createTileNode(tile);
            const target = this.gridToLocal(tile.row, tile.col);
            const startY = (this._rows / 2 + 0.5) * this._tileSize;
            tileView.node.setPosition(target.x, startY);
            tileView.node.opacity = 200;
            TileAnimator.animateSpawn(tileView.node, target.x, target.y, () => {
                completed++;
                if (completed >= tiles.length) { callback(); }
            });
        }
    }

    animateSwap(tile1: Tile, tile2: Tile, callback: () => void): void {
        const view1 = this._tileViews.get(tile1.id);
        const view2 = this._tileViews.get(tile2.id);
        if (!view1 || !view2) {
            callback();
            return;
        }
        view1.updateGridPosition(tile1.row, tile1.col);
        view2.updateGridPosition(tile2.row, tile2.col);
        const pos1 = this.gridToLocal(tile1.row, tile1.col);
        const pos2 = this.gridToLocal(tile2.row, tile2.col);
        let done = 0;
        const onDone = () => { done++; if (done >= 2) { callback(); } };
        TileAnimator.animateMoveTo(view1.node, pos1.x, pos1.y, onDone);
        TileAnimator.animateMoveTo(view2.node, pos2.x, pos2.y, onDone);
    }

    animateShuffle(grid: Grid, callback: () => void): void {
        const tiles = grid.getAllTiles();
        if (tiles.length === 0) {
            callback();
            return;
        }
        let completed = 0;
        for (const tile of tiles) {
            const view = this._tileViews.get(tile.id);
            if (!view) {
                completed++;
                if (completed >= tiles.length) { callback(); }
                continue;
            }
            const spriteFrame = this.getSpriteFrame(tile);
            cc.tween(view.node)
                .to(0.15, { opacity: 0, scaleX: 0.5, scaleY: 0.5 })
                .call(() => { view.updateSprite(spriteFrame); })
                .to(0.15, { opacity: 255, scaleX: 1, scaleY: 1 })
                .call(() => {
                    completed++;
                    if (completed >= tiles.length) { callback(); }
                })
                .start();
        }
    }

    highlightTile(tileId: number, enabled: boolean): void {
        const view = this._tileViews.get(tileId);
        if (view) {
            view.setHighlight(enabled);
        }
    }

    gridToLocal(row: number, col: number): cc.Vec2 {
        const x = (col - this._cols / 2 + 0.5) * this._tileSize;
        const y = (this._rows / 2 - 0.5 - row) * this._tileSize;
        return cc.v2(x, y);
    }

    private getSpriteFrame(tile: Tile): cc.SpriteFrame {
        if (tile.isSuperTile) {
            return this._superSprites[tile.superType - 1] || null;
        }
        return this._colorSprites[tile.color] || null;
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        const touchPos = event.getLocation();
        const nodePos = this.node.convertToNodeSpaceAR(touchPos);
        const col = Math.floor((nodePos.x + this.node.width / 2) / this._tileSize);
        const row = Math.floor((this.node.height / 2 - nodePos.y) / this._tileSize);
        if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
            EventBus.emit(GameEvents.TILE_CLICK, row, col);
        }
    }

    private clearBoard(): void {
        this._tileViews.forEach((view) => {
            view.node.removeFromParent();
            view.node.destroy();
        });
        this._tileViews.clear();
    }

    private drawBackground(bw: number, bh: number): void {
        const bg = new cc.Node("BoardBg");
        const g = bg.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(20, 20, 45, 220);
        g.roundRect(-bw / 2 - 6, -bh / 2 - 6, bw + 12, bh + 12, 10);
        g.fill();
        g.strokeColor = new cc.Color(80, 80, 130);
        g.lineWidth = 2;
        g.roundRect(-bw / 2 - 6, -bh / 2 - 6, bw + 12, bh + 12, 10);
        g.stroke();
        this.node.addChild(bg);
        bg.setSiblingIndex(0);
    }
}
