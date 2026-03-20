export default class ScoreCalculator {
    static calculate(count: number): number {
        return count * (count - 1);
    }
}
