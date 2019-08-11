import { M44, M44Hex } from "../types/m44";
import { Board } from "./board";

interface ScenarioHex {
    row: number;
    col: number;
    data: {
        terrain?: {
            name: string;
            orientation?: number;
        };
        rect_terrain?: {
            name: string;
            orientation?: number;
        };
        unit?: {
            name: string;
            badge?: string;
            nbr_units?: number;
        };
        obstacle?: {
            name: string;
            orientation?: number;
        };
        tags?: Array<{ name: string; }>;
    }
}

export class Scenario {

    _m44: M44;
    _m44Board: Map<number, Map<number, M44Hex>>;

    _board: Board;

    constructor(board: Board, m44: M44) {
        this._m44 = m44;
        this._board = board;
        this._m44Board = new Map();

        for (const hex of m44.board.hexagons) {
            if (this._m44Board.has(hex.row)) {
                const colHexes = this._m44Board.get(hex.row);
                colHexes!.set(hex.col, hex);
            } else {
                const colHexes = new Map<number, M44Hex>();
                colHexes.set(hex.col, hex);
                this._m44Board.set(hex.row, colHexes);
            }
        }
    }

    getHex(row: number, col: number): ScenarioHex {
        if (this._m44Board.has(row)) {
            const colHexes = this._m44Board.get(row);
            if (colHexes && colHexes.has(col)) {
                const hex = colHexes!.get(col);
                if (hex) {
                    return {
                        col,
                        row,
                        data: hex ? {
                            obstacle: hex!.obstacle,
                            rect_terrain: hex!.rect_terrain,
                            tags: hex!.tags,
                            terrain: hex!.terrain,
                            unit: hex!.unit ? {
                                name: hex!.unit.name,
                                nbr_units: hex!.unit.nbr_units
                                    ? parseInt(hex!.unit.nbr_units, 10)
                                    : undefined,
                                badge: hex!.unit.badge

                            } : undefined
                        } : {}
                    };
                }
            }
        }
        return {
            row,
            col,
            data: {}
        };
    }

    *allHexes(): IterableIterator<ScenarioHex> {
        for (const boardHex of this._board.all()) {
            const { row, col } = boardHex;
            const iRow = row;
            const iCol = col;
            yield this.getHex(iRow, iCol);
        }
    }

    info() {
        const terrains = new Set<string>();
        const rectTerrains = new Set<string>();
        const units = new Set<string>();
        const badges = new Set<string>();
        const tags = new Set<string>();
        const obstacles = new Set<string>();

        for (const hex of this.allHexes()) {
            if (hex.data.obstacle) {
                obstacles.add(hex.data.obstacle.name);
            }
            if (hex.data.rect_terrain) {
                rectTerrains.add(hex.data.rect_terrain.name);
            }
            if (hex.data.tags) {
                for (const tag of hex.data.tags) {
                    tags.add(tag.name);
                }
            }
            if (hex.data.unit) {
                units.add(hex.data.unit.name);
                if (hex.data.unit.badge) {
                    badges.add(hex.data.unit.badge);
                }
            }
            if (hex.data.terrain) {
                terrains.add(hex.data.terrain.name);
            }
        }

        return {
            board: {
                face: this._m44.board.face,
                type: this._m44.board.type
            },
            stats: {
                terrains: Array.from(terrains.values()),
                rectTerrains: Array.from(rectTerrains.values()),
                units: Array.from(units.values()),
                badges: Array.from(badges.values()),
                tags: Array.from(tags.values()),
                obstacles: Array.from(obstacles.values())
            }
        };
    }

}
