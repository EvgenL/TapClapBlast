import GameConfig from "../config/GameConfig";

export default class TileAnimator {
    static animateDestroy(node: cc.Node, callback: () => void): void {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(GameConfig.DESTROY_DURATION, { scaleX: 0, scaleY: 0, opacity: 0 })
            .call(callback)
            .start();
    }

    static animateFall(node: cc.Node, targetX: number, targetY: number, distance: number, callback: () => void): void {
        cc.Tween.stopAllByTarget(node);
        const duration = GameConfig.FALL_DURATION * Math.sqrt(distance);
        cc.tween(node)
            .to(duration, { x: targetX, y: targetY }, { easing: "bounceOut" })
            .call(callback)
            .start();
    }

    static animateSpawn(node: cc.Node, targetX: number, targetY: number, callback: () => void): void {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(GameConfig.SPAWN_DURATION, { x: targetX, y: targetY, opacity: 255 }, { easing: "backOut" })
            .call(callback)
            .start();
    }

    static animateMoveTo(node: cc.Node, targetX: number, targetY: number, callback: () => void): void {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(GameConfig.SWAP_DURATION, { x: targetX, y: targetY }, { easing: "sineInOut" })
            .call(callback)
            .start();
    }
}
