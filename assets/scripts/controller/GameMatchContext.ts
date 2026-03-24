import Grid from "../model/Grid";
import LevelConfigService from "../model/LevelConfigService";
import ChainDestructionService from "../model/boosters/ChainDestructionService";
import BoardView from "../view/BoardView";
import HudView from "../view/HudView";
import PopupView from "../view/PopupView";
import BoosterBarPresenter from "./BoosterBarPresenter";

export default class GameMatchContext {
    grid: Grid = null;
    boardView: BoardView = null;
    hudView: HudView = null;
    popupView: PopupView = null;
    levelService: LevelConfigService = null;
    chainDestruction: ChainDestructionService = null;
    boosterBar: BoosterBarPresenter = null;
    score: number = 0;
    movesLeft: number = 0;
    shufflesLeft: number = 0;
    isProcessing: boolean = false;
}
