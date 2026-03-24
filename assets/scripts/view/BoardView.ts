import GameConfig from "../config/GameConfig";
import TileView from "./TileView";
import Tile from "../model/Tile";
import Grid from "../model/Grid";
import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";
import TileAnimator from "./TileAnimator";
import TileSpriteSet from "./TileSpriteSet";
import { TileMove } from "../model/GravityProcessor";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardView extends cc.Component {
    @property(cc.Node)
    boardContainer: cc.Node = null;

    private _tileViews: Map<number, TileView> = new Map();
    private _sprites: TileSpriteSet = null;
    private _tileSize: number = 0;
    private _rows: number = GameConfig.BOARD_ROWS;
    private _cols: number = GameConfig.BOARD_COLS;
    private _boardWidth: number = 0;
    private _boardHeight: number = 0;

    init(sprites: TileSpriteSet): void {
        this._sprites = sprites;
        this.rebuildLayout();
        this.getContainerNode().on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy(): void {
        this.getContainerNode().off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    createBoard(grid: Grid, animateFromTop: boolean = false, callback?: () => void): void {
        this.clearBoard();
        const tiles = grid.getAllTiles();
        if (!animateFromTop) {
            for (const tile of tiles) {
                this.createTileNode(tile);
            }
            if (callback) {
                callback();
            }
            return;
        }
        if (tiles.length === 0) {
            if (callback) {
                callback();
            }
            return;
        }
        let completed = 0;
        const boardTopY = this._boardHeight / 2 + this._tileSize * 0.5;
        for (const tile of tiles) {
            const tileView = this.createTileNode(tile);
            const target = this.gridToLocal(tile.row, tile.col);
            const startY = boardTopY + (tile.row + 1) * this._tileSize;
            tileView.node.setPosition(target.x, startY);
            const distance = tile.row + 1;
            TileAnimator.animateFall(tileView.node, target.x, target.y, distance, () => {
                completed++;
                if (completed >= tiles.length && callback) {
                    callback();
                }
            });
        }
    }

    createTileNode(tile: Tile): TileView {
        const node = new cc.Node(`Tile_${tile.id}`);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        const tileInset = Math.min(4, this._tileSize * 0.08);
        node.setContentSize(this._tileSize - tileInset, this._tileSize - tileInset);

        const tileView = node.addComponent(TileView);
        const spriteFrame = this.getSpriteFrame(tile);
        tileView.init(tile.id, tile.row, tile.col, spriteFrame);

        const pos = this.gridToLocal(tile.row, tile.col);
        node.setPosition(pos);
        this.getContainerNode().addChild(node);
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
        const x = -this._boardWidth / 2 + (col + 0.5) * this._tileSize;
        const y = this._boardHeight / 2 - (row + 0.5) * this._tileSize;
        return cc.v2(x, y);
    }

    private getSpriteFrame(tile: Tile): cc.SpriteFrame {
        return this._sprites.getSpriteFrame(tile);
    }

    private onTouchEnd(event: cc.Event.EventTouch): void {
        const touchPos = event.getLocation();
        const nodePos = this.getContainerNode().convertToNodeSpaceAR(touchPos);
        if (
            nodePos.x < -this._boardWidth / 2 ||
            nodePos.x >= this._boardWidth / 2 ||
            nodePos.y > this._boardHeight / 2 ||
            nodePos.y <= -this._boardHeight / 2
        ) {
            return;
        }
        const col = Math.floor((nodePos.x + this._boardWidth / 2) / this._tileSize);
        const row = Math.floor((this._boardHeight / 2 - nodePos.y) / this._tileSize);
        if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
            EventBus.emit(GameEvents.TILE_CLICK, row, col);
        }
    }

    private rebuildLayout(): void {
        this._rows = GameConfig.BOARD_ROWS;
        this._cols = GameConfig.BOARD_COLS;
        const container = this.getContainerNode();
        const containerWidth = container.width;
        const containerHeight = container.height;
        this._tileSize = Math.min(containerWidth / this._cols, containerHeight / this._rows);
        this._boardWidth = this._cols * this._tileSize;
        this._boardHeight = this._rows * this._tileSize;
    }

    private getContainerNode(): cc.Node {
        return this.boardContainer ? this.boardContainer : this.node;
    }

    private clearBoard(): void {
        this._tileViews.forEach((view) => {
            view.node.removeFromParent();
            view.node.destroy();
        });
        this._tileViews.clear();
    }

}
