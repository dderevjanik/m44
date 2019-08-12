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
export class Board {

    _conf: BoardConf;
    _board: BoardSize;
    _boardRowCol: Map<number, Map<number, BoardHex>> = new Map();
    _background: BackgroundPattern;

    constructor(boardSizes: BoardSizes, conf: BoardConf) {
        this._conf = conf;
        this._board = boardSizes[conf.size];
        this._background = new BackgroundPattern({
            face: conf.face,
            size: conf.size,
            height: this._board.height,
            width: this._board.width
        });
    }

    /**
     * Iterate over all hexagons in board
     * @desc Used to fill board background with background tilesets
     */
    *all(): IterableIterator<BoardHex> {
        for (const hexagon of this._board.hexagons) {
            yield {
                ...hexagon,
                background: this._background.getBackground(hexagon.row, hexagon.col),
            };
        }

    }

}
