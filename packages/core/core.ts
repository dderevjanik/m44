import { M44 } from "../shared/m44";
import { Scenario } from "./scenario";
import { BoardSizes } from "../shared/board_size";
import { PatternBoard } from "./boards/pattern-board";
import { ImageBoard } from "./boards/image-board";
import { defaultSceanrio } from "./default-scenario";

export class Core {

    _boardSizes: BoardSizes;

    constructor(
        boardSizes: BoardSizes,
    ) {
        this._boardSizes = boardSizes;
    }

    createBoard(
        type: "PATTERN" | "IMAGE",
        size: "STANDARD" | "OVERLORD" | "BRKTHRU" | "SMALL",
        face: "WINTER" | "BEACH" | "COUNTRY" | "DESERT"
    ) {
        switch(type) {
            case "IMAGE": {
                const board = new ImageBoard(size, face, this._boardSizes);
                return board;
            }
            case "PATTERN": {
                const board = new PatternBoard(this._boardSizes, {
                    face,
                    size
                });
                return board;
            }
        }
    }

    createScenario(m44: M44 = defaultSceanrio) {
        const scenario = new Scenario(m44, this._boardSizes);
        return scenario;
    }

}
