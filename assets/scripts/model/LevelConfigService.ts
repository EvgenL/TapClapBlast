import { LevelData, LevelsConfigPayload } from "./LevelData";

const FALLBACK_LEVEL_COUNT = 10;
const FALLBACK_BASE_SCORE = 500;
const FALLBACK_BASE_MOVES = 37;

export default class LevelConfigService {
    private readonly _levels: LevelData[];
    private _currentIndex: number = 0;

    private constructor(levels: LevelData[]) {
        this._levels = levels;
    }

    static loadFromResources(
        resourcePath: string,
        done: (service: LevelConfigService) => void
    ): void {
        cc.resources.load(resourcePath, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
            if (err || !asset || !asset.json) {
                cc.error("[LevelConfigService] load failed, using fallback", err);
                done(new LevelConfigService(LevelConfigService.createFallbackLevels()));
                return;
            }
            const parsed = LevelConfigService.tryParseAndValidate(asset.json);
            if (!parsed) {
                cc.error("[LevelConfigService] invalid config, using fallback");
                done(new LevelConfigService(LevelConfigService.createFallbackLevels()));
                return;
            }
            done(new LevelConfigService(parsed));
        });
    }

    getCurrentLevel(): LevelData {
        return this._levels[this._currentIndex];
    }

    isLastLevel(): boolean {
        return this._currentIndex >= this._levels.length - 1;
    }

    advanceLevel(): void {
        if (this.isLastLevel()) {
            return;
        }
        this._currentIndex++;
    }

    resetProgress(): void {
        this._currentIndex = 0;
    }

    private static tryParseAndValidate(raw: unknown): LevelData[] | null {
        if (!raw || typeof raw !== "object") {
            return null;
        }
        const payload = raw as LevelsConfigPayload;
        if (!Array.isArray(payload.levels) || payload.levels.length === 0) {
            return null;
        }
        const levels: LevelData[] = [];
        for (let i = 0; i < payload.levels.length; i++) {
            const entry = payload.levels[i];
            if (!LevelConfigService.isValidLevelEntry(entry, i + 1)) {
                return null;
            }
            levels.push({
                id: entry.id,
                targetScore: entry.targetScore,
                maxMoves: entry.maxMoves
            });
        }
        return levels;
    }

    private static isValidLevelEntry(entry: unknown, expectedId: number): entry is LevelData {
        if (!entry || typeof entry !== "object") {
            return false;
        }
        const level = entry as LevelData;
        if (typeof level.id !== "number" || level.id !== expectedId) {
            return false;
        }
        if (typeof level.targetScore !== "number" || level.targetScore <= 0) {
            return false;
        }
        if (typeof level.maxMoves !== "number" || level.maxMoves <= 0) {
            return false;
        }
        return true;
    }

    private static createFallbackLevels(): LevelData[] {
        const baseScore = FALLBACK_BASE_SCORE;
        const baseMoves = FALLBACK_BASE_MOVES;
        const result: LevelData[] = [];
        for (let i = 0; i < FALLBACK_LEVEL_COUNT; i++) {
            result.push({
                id: i + 1,
                targetScore: baseScore + i * 150,
                maxMoves: Math.max(12, baseMoves - i * 2)
            });
        }
        return result;
    }
}
