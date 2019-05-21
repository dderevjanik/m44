import { SedData, BoardSize } from "./sed_data";

type BoardSettings = SedData["editor"]["board_settings"];

export interface BoardConf {
    boardSize: BoardSize;
    boardFace: BoardSettings["board_face"];
}

export class Board {

    _conf: BoardConf;
    _board: {
        [row: number]: {
            [col: number]: BoardSize["hexagons"]["item"][0];
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

    get(row: number, col: number) {
        if (row in this._board && col in this._board[row]) {
            return this._board[row][col];
        } else {
            throw new Error(`hexagon [${row}, ${col}] doesn't exists on board`);
        }
    }

}
