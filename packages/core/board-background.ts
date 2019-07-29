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

interface Config {
    boardType: "STANDARD" | "OVERLORD" | "BRKTHRU";
    boardFace: "WINTER" | "BEACH" | "COUNTRY" | "DESERT";
    boardSize: [number, number];
}

export class BoardBackground {

    _background: Array<[string, string]>;

    constructor(conf: Config) {
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
