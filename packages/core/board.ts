import { BoardSizes, BoardSize } from "../shared/board_size";

const BEACH: Array<[string, string]> = [
    // country
    ["h_country-1-1", "h_country-1-2"], // 0
    ["h_country-1-1", "h_country-1-2"], // 1
    ["h_country-1-1", "h_country-1-2"], // 2
    // country-beach
    ["h_beach1-2-1", "h_beach1-2-2"],   // 3
    // beach 1
    ["h_beach1-3-1", "h_beach1-3-2"],   // 4
    // beach 2
    ["h_beach1-4-1", "h_beach1-4-2"],   // 5
    // beach - sea
    ["h_beach1-5-1", "h_beach1-5-2"],   // 6
    // sea
    ["h_sea1-6-1", "h_sea1-6-2"],       // 7
    // deepsea
    ["h_sea1-7-1", "h_sea1-7-2"]        // 8
];

const BEACH_BRKTHRU: Array<[string, string]> = [
    // country
    ["h_country-1-1", "h_country-1-2"], // 0
    ["h_country-1-1", "h_country-1-2"], // 1
    ["h_country-1-1", "h_country-1-2"], // 2
    ["h_country-1-1", "h_country-1-2"], // 3
    ["h_country-1-1", "h_country-1-2"], // 4
    ["h_country-1-1", "h_country-1-2"], // 5
    ["h_country-1-1", "h_country-1-2"], // 6
    ["h_country-1-1", "h_country-1-2"], // 7
    ["h_country-1-1", "h_country-1-2"], // 8
    ["h_country-1-1", "h_country-1-2"], // 9
    // country - beach
    ["h_beach1-2-1", "h_beach1-2-2"],   // 10
    ["h_beach1-3-1", "h_beach1-3-2"],   // 11
    ["h_beach1-4-1", "h_beach1-4-2"],   // 12
    ["h_beach1-5-1", "h_beach1-5-2"],   // 13
    ["h_sea1-6-1", "h_sea1-6-2"],       // 14
    ["h_sea1-7-1", "h_sea1-7-2"],       // 15
    ["h_sea1-7-1", "h_sea1-7-2"],       // 16
];

const COUNTRY: Array<[string, string]> = [
    ["h_country-10-1", "h_country-10-2"],
    ["h_country-11-1", "h_country-11-2"],
    ["h_country-12-1", "h_country-12-2"],
];

const DESERT: Array<[string, string]> = [
    ["h_desert-1-1", "h_desert-1-2"],
    ["h_desert-2-1", "h_desert-2-2"],
    ["h_desert-3-1", "h_desert-3-2"]
];

const WINTER: Array<[string, string]> = [
    ["h_winter-1-1", "h_winter-1-2"],
    ["h_winter-2-1", "h_winter-2-2"],
    ["h_winter-3-1", "h_winter-3-2"],
];

export interface BoardConf {
    size: "STANDARD" | "OVERLORD" | "BRKTHRU" | "SMALL";
    face: "WINTER" | "BEACH" | "COUNTRY" | "DESERT";
}

export interface BoardHex {
    background: string;
    col: number;
    row: number;
    posX: number;
    posY: number;
}

/**
 * Used to determine x, y position in board of hexagons
 */
export class GameBoard {

    _conf: BoardConf;
    _boardSize: BoardSize;
    _pattern: Array<[string, string]>;

    constructor(boardSizes: BoardSizes, conf: BoardConf) {
        this._conf = conf;
        this._boardSize = boardSizes[conf.size];
        this._pattern = conf.size === "BRKTHRU" && conf.face === "BEACH"
            ? BEACH_BRKTHRU
            : conf.face === "COUNTRY"
                ? COUNTRY
                : conf.face === "DESERT"
                    ? DESERT
                    : conf.face === "WINTER"
                        ? WINTER
                        : BEACH;
    }

    getBackground(row: number, col: number): string {
        const r = row % this._pattern.length;
        const c = Math.floor(col / this._pattern[0].length) % this._pattern[0].length;
        return this._pattern[r][c];
    }

    getBoardHexagons() {
        return this._boardSize.hexagons;
    }

    /**
     * Iterate over all hexagons in board
     * @desc Used to fill board background with background tilesets
     */
    *all(): IterableIterator<BoardHex> {
        for (const hexagon of this._boardSize.hexagons) {
            yield {
                ...hexagon,
                background: this.getBackground(hexagon.row, hexagon.col),
            };
        }

    }

}
