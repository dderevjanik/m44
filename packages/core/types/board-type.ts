export interface BoardType {
    name: string;
    short: "standard" | "overlord" | "brkthru";
    size: [number, number];
    size2: [number, number];
    cols: number;
    rows: number;
}
const Standard: BoardType = {
    name: "Standard",
    short: "standard",
    size: [2570, 1737],
    size2: [817, 582],
    cols: 25,
    rows: 9
};

const Overlord: BoardType = {
    name: "Overlord",
    short: "overlord",
    size: [5014, 1737],
    size2: [1623, 1582],
    cols: 51,
    rows: 9
};

const Breakthrough: BoardType = {
    name: "Breakthrough",
    short: "brkthru",
    size: [2570, 3039],
    size2: [817, 1013],
    cols: 25,
    rows: 17
};

export const boardTypes = {
    STANDARD: Standard,
    OVERLORD: Overlord,
    BRKTHRU: Breakthrough
};

