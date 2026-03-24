import Grid from "../model/Grid";
import Tile from "../model/Tile";
import MatchFinder from "../model/MatchFinder";
import ShuffleProcessor from "../model/ShuffleProcessor";
import BombBoardEffect from "../model/boosters/BombBoardEffect";
import ChainDestructionService from "../model/boosters/ChainDestructionService";
import SuperTileEffectRegistry from "../model/boosters/SuperTileEffectRegistry";
import LevelConfigService from "../model/LevelConfigService";
import GameConfig from "../config/GameConfig";
import EventBus from "../utils/EventBus";
import GameEvents from "../utils/GameEvents";
import BoardView from "../view/BoardView";
import HudView from "../view/HudView";
import BoosterPanelView from "../view/BoosterPanelView";
import PopupView from "../view/PopupView";
import TileSpriteSet from "../view/TileSpriteSet";
import BoosterBarPresenter from "./BoosterBarPresenter";
import GameMatchContext from "./GameMatchContext";
import GameMatchHandler from "./GameMatchHandler";
import SeededRandom from "../utils/SeededRandom";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property(BoardView)
    boardView: BoardView = null;
    @property(HudView)
    hudView: HudView = null;
    @property(BoosterPanelView)
    boosterPanelView: BoosterPanelView = null;

    @property(cc.SpriteFrame)
    blueSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    greenSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    purpleSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    redSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    yellowSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    rocketHSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    rocketVSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    bombSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    megaBombSprite: cc.SpriteFrame = null;

    private readonly _ctx = new GameMatchContext();
    private _match: GameMatchHandler = null;

    start(): void {
        const sprites = new TileSpriteSet(
            this.blueSprite, this.greenSprite, this.purpleSprite,
            this.redSprite, this.yellowSprite,
            this.rocketHSprite, this.rocketVSprite,
            this.bombSprite, this.megaBombSprite
        );
        LevelConfigService.loadFromResources("config/levels", (service) => {
            if (!cc.isValid(this)) {
                return;
            }
            this._ctx.levelService = service;
            this._ctx.boardView = this.boardView;
            this._ctx.hudView = this.hudView;
            this._ctx.boardView.init(sprites);
            this._ctx.hudView.init();
            const chainDestruction = new ChainDestructionService(SuperTileEffectRegistry.createDefault());
            this._ctx.chainDestruction = chainDestruction;
            this._ctx.boosterBar = new BoosterBarPresenter(
                this.boosterPanelView,
                this.boardView,
                chainDestruction,
                new BombBoardEffect(GameConfig.BOMB_RADIUS)
            );
            this._ctx.popupView = this.createRuntimePopup();
            this._ctx.boosterBar.setCanUseBoosters(() => !this._ctx.isProcessing);
            this._match = new GameMatchHandler(this._ctx);
            this.initGame();
            this.registerEvents();
        });
    }

    onDestroy(): void {
        EventBus.clear();
    }

    private initGame(): void {
        const level = this._ctx.levelService.getCurrentLevel();
        const seededRandom = new SeededRandom(level.id);
        this._ctx.score = 0;
        this._ctx.movesLeft = level.maxMoves;
        this._ctx.shufflesLeft = GameConfig.MAX_SHUFFLES;
        this._ctx.isProcessing = true;

        Tile.resetIdCounter();
        this._ctx.grid = new Grid();
        this._ctx.grid.fill(() => seededRandom.next());

        while (!MatchFinder.hasAnyGroup(this._ctx.grid, GameConfig.MIN_GROUP_SIZE)) {
            ShuffleProcessor.shuffle(this._ctx.grid, () => seededRandom.next());
        }

        this._ctx.boosterBar.reset(GameConfig.BOMB_USES, GameConfig.TELEPORT_USES);

        this._ctx.boardView.createBoard(this._ctx.grid, true, () => {
            this._ctx.isProcessing = false;
        });
        this._match.updateHud();
    }

    private registerEvents(): void {
        EventBus.on(GameEvents.TILE_CLICK, this.onTileClick.bind(this));
        EventBus.on(GameEvents.RESTART_GAME, this.onRestart.bind(this));
        EventBus.on(GameEvents.NEXT_LEVEL, this.onNextLevel.bind(this));
        EventBus.on(GameEvents.RESTART_CAMPAIGN, this.onRestartCampaign.bind(this));
    }

    private onTileClick(row: number, col: number): void {
        this._match.onTileClick(row, col);
    }

    private onRestart(): void {
        this._ctx.popupView.hide();
        this.initGame();
    }

    private onNextLevel(): void {
        this._ctx.popupView.hide();
        this._ctx.levelService.advanceLevel();
        this.initGame();
    }

    private onRestartCampaign(): void {
        this._ctx.popupView.hide();
        this._ctx.levelService.resetProgress();
        this.initGame();
    }

    private createRuntimePopup(): PopupView {
        const popupNode = new cc.Node("Popup");
        this.node.addChild(popupNode);
        const popupView = popupNode.addComponent(PopupView);
        popupView.init();
        return popupView;
    }
}
