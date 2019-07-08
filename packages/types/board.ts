import { SedData, BoardSize, Hexagon } from "./sed_data";

type BoardSettings = SedData["editor"]["board_settings"];

export interface BoardConf {
    boardSize: BoardSize;
    boardFace: BoardSettings["board_face"];
}

/**
 * Used to determine x, y position in board of hexagons
 */
export class Board {

    _conf: BoardConf;
    _board: {
        [row: number]: {
            [col: number]: Hexagon;
        };
    };

    constructor(conf: BoardConf) {
        this._conf = conf;
        this._board = {};

        conf.boardSize.hexagons.item.forEach((hexagon) => {
            const { row, col } = hexagon;
            const iRow = parseInt(row);
            const iCol = parseInt(col);

            if (this._board[iRow]) {
                this._board[iRow][iCol] = hexagon;
            } else {
                this._board[iRow] = {
                    [iCol]: hexagon
                };
            }
        });
    }

    rows(): number {
        return parseInt(this._conf.boardSize.nbrRows);
    }

    cols(): number {
        return parseInt(this._conf.boardSize.nbrCols);
    }

    /** Get position of hexagon in board */
    get(row: number, col: number): Hexagon {
        if (row in this._board && col in this._board[row]) {
            return this._board[row][col];
        } else {
            throw new Error(`hexagon [${row}, ${col}] doesn't exists on board`);
        }
    }

    getRow(row: number): Hexagon[] {
        if (row in this._board) {
            const cols = Object.keys(this._board[row]);
            return cols.map((col) => this._board[row][parseInt(col)]);
        } else {
            throw new Error(`row ${row}. doesn't exists on board`);
        }
    }

    /** Check if hexagon exists in board */
    exists(row: number, col: number): boolean {
        if (row in this._board && col in this._board[row]) {
            return true;
        }
        return false;
    }

    /**
     * Iterate over all hexagons in board
     * @desc Used to fill board background with background tilesets
     */
    *all(): IterableIterator<Hexagon> {
        for (const [row, cols] of Object.entries(this._board)) {
            for (const [col, hex] of Object.entries(cols)) {
                yield hex;
            }
        }

    }

}
