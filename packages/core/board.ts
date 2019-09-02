import { BoardSizes, BoardSize } from "../shared/board_size";
import { BackgroundPattern } from "./background-pattern";

export interface BoardConf {
    size: "STANDARD" | "OVERLORD" | "BRKTHRU";
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
    _rowToCols: Map<number, Map<number, BoardHex>> = new Map();
    _bckgPattern: BackgroundPattern;

    constructor(boardSizes: BoardSizes, conf: BoardConf) {
        this._conf = conf;
        this._boardSize = boardSizes[conf.size];
        this._bckgPattern = new BackgroundPattern({
            face: conf.face,
            size: conf.size,
            height: this._boardSize.height,
            width: this._boardSize.width
        });
    }

    /**
     * Iterate over all hexagons in board
     * @desc Used to fill board background with background tilesets
     */
    *all(): IterableIterator<BoardHex> {
        for (const hexagon of this._boardSize.hexagons) {
            yield {
                ...hexagon,
                background: this._bckgPattern.getBackground(hexagon.row, hexagon.col),
            };
        }

    }

}
