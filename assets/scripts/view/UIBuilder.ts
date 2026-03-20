import BoardView from "./BoardView";
import HudView from "./HudView";
import BoosterPanelView from "./BoosterPanelView";
import PopupView from "./PopupView";

export interface GameViews {
    boardView: BoardView;
    hudView: HudView;
    boosterPanel: BoosterPanelView;
    popupView: PopupView;
}

export default class UIBuilder {
    static build(parent: cc.Node, colorSprites: cc.SpriteFrame[], superSprites: cc.SpriteFrame[]): GameViews {
        this.createBackground(parent);

        const boardNode = new cc.Node("Board");
        parent.addChild(boardNode);
        boardNode.setPosition(0, 40);
        const boardView = boardNode.addComponent(BoardView);
        boardView.init(colorSprites, superSprites);

        const hudNode = new cc.Node("HUD");
        parent.addChild(hudNode);
        const hudView = hudNode.addComponent(HudView);
        hudView.init();

        const boosterNode = new cc.Node("BoosterPanel");
        parent.addChild(boosterNode);
        const boosterPanel = boosterNode.addComponent(BoosterPanelView);
        boosterPanel.init();

        const popupNode = new cc.Node("Popup");
        parent.addChild(popupNode);
        const popupView = popupNode.addComponent(PopupView);
        popupView.init();

        return { boardView, hudView, boosterPanel, popupView };
    }

    private static createBackground(parent: cc.Node): void {
        const bg = new cc.Node("Background");
        const g = bg.addComponent(cc.Graphics);
        g.fillColor = new cc.Color(25, 25, 50);
        g.rect(-360, -640, 720, 1280);
        g.fill();
        bg.setContentSize(720, 1280);
        parent.addChild(bg);
        bg.setSiblingIndex(0);
    }
}
