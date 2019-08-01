import { BoardSize } from "../types/sed_data";
import { BackgroundPattern } from "./background-pattern";

export interface BoardConf {
    boardSize: BoardSize;
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
export class Board {

    _boardBackground: BackgroundPattern;
    _conf: BoardConf;
    _board: {
        [row: number]: {
            [col: number]: BoardHex;
        };
    };

    constructor(boardBackground: BackgroundPattern, conf: BoardConf) {
        this._conf = conf;
        this._boardBackground = boardBackground;
        this._board = {};

        conf.boardSize.hexagons.item.forEach((hexagon) => {
            const { row, col } = hexagon;
            const iRow = parseInt(row, 10);
            const iCol = parseInt(col, 10);

            if (this._board[iRow]) {
                this._board[iRow][iCol] = {
                    background: boardBackground.getBackground(iRow, iCol),
                    row: parseInt(hexagon.row, 10),
                    col: parseInt(hexagon.col, 10),
                    posX: parseInt(hexagon.posX, 10),
                    posY: parseInt(hexagon.posY, 10)
                };
            } else {
                this._board[iRow] = {
                    [iCol]: {
                        background: boardBackground.getBackground(iRow, iCol),
                        row: parseInt(hexagon.row, 10),
                        col: parseInt(hexagon.col, 10),
                        posX: parseInt(hexagon.posX, 10),
                        posY: parseInt(hexagon.posY, 10)
                    }
                };
            }
        });
    }

    getSize(): [number, number] {
        return [
            parseInt(this._conf.boardSize.width),
            parseInt(this._conf.boardSize.height)
        ];
    }

    rows(): number {
        return parseInt(this._conf.boardSize.nbrRows);
    }

    cols(): number {
        return parseInt(this._conf.boardSize.nbrCols);
    }

    /** Get position of hexagon in board */
    get(row: number, col: number): BoardHex {
        if (row in this._board && col in this._board[row]) {
            return this._board[row][col];
        } else {
            throw new Error(`hexagon [${row}, ${col}] doesn't exists on board`);
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
    *all(): IterableIterator<BoardHex> {
        for (const [row, cols] of Object.entries(this._board)) {
            for (const [col, hex] of Object.entries(cols)) {
                yield hex;
            }
        }

    }

}
