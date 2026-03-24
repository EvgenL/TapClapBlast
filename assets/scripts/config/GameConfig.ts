export default class GameConfig {
    static readonly BOARD_ROWS: number = 9;
    static readonly BOARD_COLS: number = 9;
    static readonly TILE_COLORS_COUNT: number = 5;
    static readonly MIN_GROUP_SIZE: number = 2;
    static readonly MAX_SHUFFLES: number = 3;
    static readonly BOMB_RADIUS: number = 2;
    static readonly BOMB_USES: number = 3;
    static readonly TELEPORT_USES: number = 5;
    static readonly SUPER_ROCKET_THRESHOLD: number = 5;
    static readonly SUPER_BOMB_THRESHOLD: number = 7;
    static readonly SUPER_MEGA_THRESHOLD: number = 9;
    static readonly SUPER_BOMB_RADIUS: number = 3;
    static readonly FALL_DURATION: number = 0.12;
    static readonly DESTROY_DURATION: number = 0.2;
    static readonly SPAWN_DURATION: number = 0.25;
    static readonly SWAP_DURATION: number = 0.2;

    static get ROWS(): number {
        return GameConfig.BOARD_ROWS;
    }

    static get COLS(): number {
        return GameConfig.BOARD_COLS;
    }
}
