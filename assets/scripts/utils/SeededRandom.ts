export default class SeededRandom {
    private _state: number;

    constructor(seed: number) {
        const normalizedSeed = seed | 0;
        this._state = normalizedSeed !== 0 ? normalizedSeed : 1;
    }

    next(): number {
        let x = this._state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this._state = x | 0;
        return (this._state >>> 0) / 4294967296;
    }
}
