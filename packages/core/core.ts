import { PersistentStorage } from "./types/imagestorage";
import { SedData } from "../shared/sed_data";
import { M44 } from "../shared/m44";
import { GameBoard } from "./board";
import { ImageStore } from "./utils/images-repo";
import { Scenario } from "./scenario";
import { backgroundIcons } from "./types/icons";
import { BoardSizes } from "../shared/board_size";
import { createImagesDict } from "./utils/create-images-dict";
import { defaultSceanrio } from "./default-scenario";


export class Core<IMG> {

    _imageRepo: PersistentStorage<IMG>;
    _sedData: SedData;
    _boardSizes: BoardSizes;

    // @ts-ignore
    _iconRepo: ImageStore<IMG>;

    constructor(
        sedData: SedData,
        boardSizes: BoardSizes,
        imageRepo: PersistentStorage<IMG>,
    ) {
        this._sedData = sedData;
        this._boardSizes = boardSizes;
        this._imageRepo = imageRepo;
    }

    createScenario(m44: M44 = defaultSceanrio) {
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
