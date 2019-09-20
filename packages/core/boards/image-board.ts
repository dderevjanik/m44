import { Renderable } from "../types/renderable";
import { Renderer } from "../types/renderer";
import { ImageStorage } from "../types/imagestorage";
import { BoardSizes, BoardSize } from "../../shared/board_size";

export class ImageBoard implements Renderable {

    _backgroundImage: string;
    _boardSize: BoardSize;

    constructor(
        size: "STANDARD" | "OVERLORD" | "BRKTHRU" | "SMALL",
        face: "WINTER" | "BEACH" | "COUNTRY" | "DESERT",
        boardSizes: BoardSizes
    ) {
        if (size === "SMALL") {
            throw new Error("SMALL size is not supported right now");
        }
        this._boardSize = boardSizes[size];
        this._backgroundImage = `${size.toLowerCase()}_${face.toLowerCase()}`;
    }

    async render(renderer: Renderer<any, any>, imageStorage: ImageStorage<any>): Promise<void> {
        const w = this._boardSize.rWidth;
        const h = this._boardSize.rHeight
        try {
            await renderer.renderImage("images/board_62_72/standard_country.jpg", 10, 10, w - 10, h - 10);
        } catch(err) {
            console.log(err);
        }
    }


}
