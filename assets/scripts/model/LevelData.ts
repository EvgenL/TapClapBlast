export interface LevelData {
    id: number;
    targetScore: number;
    maxMoves: number;
}

export interface LevelsConfigPayload {
    levels: LevelData[];
}
