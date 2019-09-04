import { PersistentStorage } from "./types/imagestorage";
import { SedData } from "../shared/sed_data";
import { M44 } from "../shared/m44";
import { GameBoard } from "./board";
import { ImageStore } from "./utils/images-repo";
import { Measure } from "./types/measure";
import { Renderer } from "./types/renderer";
import { Scenario } from "./scenario";
import { BackgroundPattern } from "./background-pattern";
import { backgroundIcons } from "./types/icons";
import { BoardSizes, BoardSize } from "../shared/board_size";
import { createImagesDict } from "./utils/create-images-dict";

export interface CoreConf {
    renderLayers: string[]
    board: {
        hex_size: [number, number];
        unitTL: [number, number];
        tag_offset: [number, number];
        badge_size: [number, number];
        background_color: [number, number, number],
        border_color: [number, number, number],
        border_width: number,
        margin: [number, number, number, number],
        dash_color: [number, number, number],
        dash_length: [number, number],
        dash_width: number,
        board_sizes: {
            standartd: [number, number],
            overlord: [number, number],
            brkthru: [number, number]
        },
        layers: [
            "background",
            "outlines",
            "terrain",
            "lines",
            "rect_terrain",
            "obstacle",
            "unit",
            "badge",
            "tags",
            "label"
        ]
    }
}

export class Core<IMG> {

    _imageRepo: PersistentStorage<IMG>;
    _sedData: SedData;
    _boardSizes: BoardSizes;
    _measure: Measure;
    _conf: CoreConf;

    // @ts-ignore
    _iconRepo: ImageStore<IMG>;

    constructor(
        sedData: SedData,
        boardSizes: BoardSizes,
        measure: Measure,
        imageRepo: PersistentStorage<IMG>,
        conf: CoreConf
    ) {
        this._sedData = sedData;
        this._boardSizes = boardSizes;
        this._measure = measure;
        this._imageRepo = imageRepo;
        this._conf = conf;
    }

    createScenario(m44: M44) {
        const board = new GameBoard(this._boardSizes, {
            face: m44.board.face,
            size: m44.board.type
        })
        return new Scenario(board, m44, this._iconRepo);
    }

    initIcons() {
        console.log("[APP] creating dictionary of all icons with their names");
        const sedData = this._sedData;
        if (sedData === null) {
            console.error("[APP] Please intialize sedData before initIcons()");
            throw new Error("seddata_not_initialized");
        }
        const iconDict: Map<string, string> = createImagesDict(sedData);
        for (const [background, backgroundIcon] of Object.entries(backgroundIcons)) {
            iconDict.set(background, backgroundIcon);
        }

        this._iconRepo = new ImageStore(this._imageRepo, iconDict);
    }

}
