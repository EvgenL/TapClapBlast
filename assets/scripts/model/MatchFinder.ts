import Grid from "./Grid";
import Tile from "./Tile";

interface GridPos {
    row: number;
    col: number;
}

const DIRS: GridPos[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
];

export default class MatchFinder {
    static findGroup(grid: Grid, row: number, col: number): Tile[] {
        const start = grid.getTile(row, col);
        if (!start || start.isSuperTile) {
            return start ? [start] : [];
        }

        const visited = this.createVisited(grid);
        const group: Tile[] = [];
        const queue: GridPos[] = [{ row, col }];
        visited[row][col] = true;

        while (queue.length > 0) {
            const pos = queue.shift()!;
            const tile = grid.getTile(pos.row, pos.col);
            if (!tile) {
                continue;
            }
            group.push(tile);

            for (const dir of DIRS) {
                const nr = pos.row + dir.row;
                const nc = pos.col + dir.col;
                if (!grid.isInBounds(nr, nc) || visited[nr][nc]) {
                    continue;
                }
                const neighbor = grid.getTile(nr, nc);
                if (neighbor && !neighbor.isSuperTile && neighbor.color === start.color) {
                    visited[nr][nc] = true;
                    queue.push({ row: nr, col: nc });
                }
            }
        }

        return group;
    }

    static hasAnyGroup(grid: Grid, minSize: number): boolean {
        const visited = this.createVisited(grid);
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                const tile = grid.getTile(r, c);
                if (!tile || visited[r][c] || tile.isSuperTile) {
                    continue;
                }
                if (this.bfsCount(grid, r, c, visited) >= minSize) {
                    return true;
                }
            }
        }
        return false;
    }

    private static bfsCount(grid: Grid, row: number, col: number, visited: boolean[][]): number {
        const start = grid.getTile(row, col)!;
        const queue: GridPos[] = [{ row, col }];
        visited[row][col] = true;
        let count = 0;

        while (queue.length > 0) {
            const pos = queue.shift()!;
            count++;
            for (const dir of DIRS) {
                const nr = pos.row + dir.row;
                const nc = pos.col + dir.col;
                if (!grid.isInBounds(nr, nc) || visited[nr][nc]) {
                    continue;
                }
                const neighbor = grid.getTile(nr, nc);
                if (neighbor && !neighbor.isSuperTile && neighbor.color === start.color) {
                    visited[nr][nc] = true;
                    queue.push({ row: nr, col: nc });
                }
            }
        }
        return count;
    }

    private static createVisited(grid: Grid): boolean[][] {
        const visited: boolean[][] = [];
        for (let r = 0; r < grid.rows; r++) {
            visited[r] = new Array(grid.cols).fill(false);
        }
        return visited;
    }
}
