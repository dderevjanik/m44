import { M44 } from "../shared/m44";
import { GameBoard } from "./game-board";
import { Scenario } from "./scenario";
import { BoardSizes } from "../shared/board_size";
import { defaultSceanrio } from "./default-scenario";

export class Core {

    _boardSizes: BoardSizes;

    constructor(
        boardSizes: BoardSizes,
    ) {
        this._boardSizes = boardSizes;
    }

    /**
     * Create a Scenario Board
     * @param size
     * @param face
     */
    createBoard(size: "STANDARD" | "OVERLORD" | "BRKTHRU" | "SMALL", face: "WINTER" | "BEACH" | "COUNTRY" | "DESERT") {
        const board = new GameBoard(this._boardSizes, {
            face,
            size
        });
        return board;
    }

    /**
     * Create new M44 Scenario
     * @param m44 scenario to load (you can use as template)
     */
    createScenario(board: GameBoard, m44: M44 = defaultSceanrio) {
        const scenario = new Scenario(board, m44);
        return scenario;
    }

}
