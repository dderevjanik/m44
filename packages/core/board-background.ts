import { M44 } from "../types/m44";

const BEACH: Array<[string, string]> = [
    // country
    ["h_country-1-1.png", "h_country-1-2.png"], // 0
    ["h_country-1-1.png", "h_country-1-2.png"], // 1
    ["h_country-1-1.png", "h_country-1-2.png"], // 2
    // country-beach
    ["h_beach1-2-1.png", "h_beach1-2-2.png"],   // 3
    // beach 1
    ["h_beach1-3-1.png", "h_beach1-3-2.png"],   // 4
    // beach 2
    ["h_beach1-4-1.png", "h_beach1-4-2.png"],   // 5
    // beach - sea
    ["h_beach1-5-1.png", "h_beach1-5-2.png"],   // 6
    // sea
    ["h_sea1-6-1.png", "h_sea1-6-2.png"],       // 7
    // deepsea
    ["h_sea1-7-1.png", "h_sea1-7-2.png"]        // 8
];

const BEACH_BRKTHRU: Array<[string, string]> = [
    // country
    ["h_country-1-1.png", "h_country-1-2.png"], // 0
    ["h_country-1-1.png", "h_country-1-2.png"], // 1
    ["h_country-1-1.png", "h_country-1-2.png"], // 2
    ["h_country-1-1.png", "h_country-1-2.png"], // 3
    ["h_country-1-1.png", "h_country-1-2.png"], // 4
    ["h_country-1-1.png", "h_country-1-2.png"], // 5
    ["h_country-1-1.png", "h_country-1-2.png"], // 6
    ["h_country-1-1.png", "h_country-1-2.png"], // 7
    ["h_country-1-1.png", "h_country-1-2.png"], // 8
    ["h_country-1-1.png", "h_country-1-2.png"], // 9
    // country - beach
    ["h_beach1-2-1.png", "h_beach1-2-2.png"],   // 10
    ["h_beach1-3-1.png", "h_beach1-3-2.png"],   // 11
    ["h_beach1-4-1.png", "h_beach1-4-2.png"],   // 12
    ["h_beach1-5-1.png", "h_beach1-5-2.png"],   // 13
    ["h_sea1-6-1.png", "h_sea1-6-2.png"],       // 14
    ["h_sea1-7-1.png", "h_sea1-7-2.png"],       // 15
    ["h_sea1-7-1.png", "h_sea1-7-2.png"],       // 16
];

const COUNTRY: Array<[string, string]> = [
    ["h_country-10-1.png", "h_country-10-2.png"],
    ["h_country-11-1.png", "h_country-11-2.png"],
    ["h_country-12-1.png", "h_country-12-2.png"],
];

const DESERT: Array<[string, string]> = [
    ["h_desert-1-1.png", "h_desert-1-2.png"],
    ["h_desert-2-1.png", "h_desert-2-2.png"],
    ["h_desert-3-1.png", "h_desert-3-2.png"]
];

const WINTER: Array<[string, string]> = [
    ["h_winter-1-1.png", "h_winter-1-2.png"],
    ["h_winter-2-1.png", "h_winter-2-2.png"],
    ["h_winter-3-1.png", "h_winter-3-2.png"],
];

type BoardType = M44["board"]["type"];
type BoardFace = M44["board"]["face"];

interface Config {
    boardType: BoardType;
    boardFace: BoardFace;
    boardSize: [number, number];
}

export class BoardBackground {

    _conf: Config;
    _background: Array<[string, string]>;

    constructor(conf: Config) {
        this._conf = conf;
        this._background = conf.boardType === "BRKTHRU" && conf.boardFace === "BEACH"
            ? BEACH_BRKTHRU
            : conf.boardFace === "COUNTRY"
                ? COUNTRY
                : conf.boardFace === "DESERT"
                    ? DESERT
                    : conf.boardFace === "WINTER"
                        ? WINTER
                        : BEACH;
    }

    getBackground(row: number, col: number): string {
        const r = row % this._background.length;
        const c = col % this._background[0].length;
        return this._background[r][c];
    }

}
