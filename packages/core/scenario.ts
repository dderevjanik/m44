import { M44, M44Hex, M44Unit, M44Terrain, M44RectTerrain, M44Obstacle, M44Tag } from "../types/m44";
import { Board } from "../types/board";

interface ScenarioHex {
    backgroundHex: string;
    row: number;
    col: number;
    posX: number;
    posY: number;
    data: {
        obstacle?: M44Obstacle;
        unit?: M44Unit;
        rect_terrain?: M44RectTerrain;
        terrain?: M44Terrain;
        tags?: M44Tag[];
    }
}

interface ScenarioTerrain {
    name: string;
    orientation?: number;
    hex: {
        row: number;
        col: number;
        posX: number;
        posY: number;
    }
}

interface ScenarioUnit {
    name: string;
    badge?: string;
    nbr_units?: number;

    hex: {
        row: number;
        col: number;
        posX: number;
        posY: number;
    }
}

export class Scenario {

    _m44: M44;
    _m44RowCols: Map<number, Map<number, M44Hex>>;

    _board: Board;

    constructor(board: Board, m44: M44) {
        this._m44 = m44;
        this._board = board;
        this._m44RowCols = new Map();

        for (const hex of m44.board.hexagons) {
            if (this._m44RowCols.has(hex.row)) {
                const colHexes = this._m44RowCols.get(hex.row);
                colHexes!.set(hex.col, hex);
            } else {
                const colHexes = new Map<number, M44Hex>();
                colHexes.set(hex.col, hex);
                this._m44RowCols.set(hex.row, colHexes);
            }
        }
    }

    getHex(row: number, col: number): ScenarioHex {
        const boardHex = this._board.get(row, col);
        if (this._m44RowCols.has(row)) {
            const colHexes = this._m44RowCols.get(row);
            if (this._m44RowCols.has(col)) {
                const hex = colHexes!.get(col);
                return {
                    col,
                    row,
                    posX: boardHex.posX,
                    posY: boardHex.posY,
                    backgroundHex: boardHex.background,
                    data: {
                        obstacle: hex!.obstacle,
                        rect_terrain: hex!.rect_terrain,
                        tags: hex!.tags,
                        terrain: hex!.terrain,
                        unit: hex!.unit
                    }
                };
            }
        }
        return {
            row,
            col,
            posX: boardHex.posX,
            posY: boardHex.posY,
            backgroundHex: boardHex.background,
            data: {}
        };
    }

    *allHexes(): IterableIterator<any> {
        for (const boardHex of this._board.all()) {
            const { row, col } = boardHex;
            const iRow = row;
            const iCol = col;
            yield this.getHex(iRow, iCol);
        }
    }

    *getTerrain(): IterableIterator<ScenarioTerrain> {
        for (const scenarioHex of this._m44.board.hexagons) {
            if (scenarioHex.terrain) {
                const boardHex = this._board.get(scenarioHex.row, scenarioHex.col);
                yield {
                    name: scenarioHex.terrain.name,
                    orientation: scenarioHex.terrain.orientation,
                    hex: {
                        row: scenarioHex.row,
                        col: scenarioHex.col,
                        posX: boardHex.posX,
                        posY: boardHex.posY
                    }
                };
            }
        }
    }

    *getUnits(): IterableIterator<ScenarioUnit> {
        for (const scenarioHex of this._m44.board.hexagons) {
            if (scenarioHex.unit) {
                const boardHex = this._board.get(scenarioHex.row, scenarioHex.col);
                yield {
                    name: scenarioHex.unit.name,
                    badge: scenarioHex.unit.badge,
                    nbr_units: scenarioHex.unit!.nbr_units
                        ? parseInt(scenarioHex.unit!.nbr_units)
                        : undefined,
                    hex: {
                        row: scenarioHex.row,
                        col: scenarioHex.col,
                        posX: boardHex.posX,
                        posY: boardHex.posY
                    }
                };
            }
        }
    }

}
