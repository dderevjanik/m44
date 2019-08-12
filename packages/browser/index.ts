import { SedData } from "../shared/sed_data";
import { Core, CoreConf } from "../core/core";
import { BrowserMeasure } from "./modules/browser-measure";
import { CanvasRender } from "./modules/canvas-render";
import { ImageLocalStorage } from "./modules/image-localstorage";
import { M44 } from "../shared/m44";
import { BoardSizes } from "../shared/board_size";

// HACKY
// const PROXY = 'https://cors-anywhere.herokuapp.com/';

interface Config {
    renderLayers: string[];
    board: CoreConf["board"];
    dataUrl: string;
    imageKey: string;
}

export class M44Browser {

    _app: Core<HTMLImageElement, string> | null = null;
    _conf: Config;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedData: SedData, boardSizes: BoardSizes, images: { [image: string]: string }) {
        const imgls = new ImageLocalStorage(imagesDict, {
            dataUrl: this._conf.dataUrl,
            imageKey: this._conf.imageKey
        });
        // await imgls.sideLoad("countryside.png", PROXY + "https://raw.githubusercontent.com/patricksurry/aide-memoire/master/images/bg_188_217/countryside.png");
        // await imgls.sideLoad("outline.png", PROXY + "https://raw.githubusercontent.com/patricksurry/aide-memoire/master/images/bg_188_217/outline.png");
        this._app = new Core<HTMLImageElement, string>(
            sedData,
            boardSizes,
            new BrowserMeasure(),
            new CanvasRender(),
            imgls,
            {
                board: this._conf.board,
                renderLayers: [
                    "background",
                    "terrain",
                    "rect_terrain",
                    "obstacle",
                    "unit",
                    "badge",
                    "tags",
                    "label"
                ]
            }
        );
    }

    async drawScenario(scenario: M44): Promise<string> {
        // TODO: Fix !
        const base64 = await this._app!.drawScenario(scenario);
        return base64;
    }

}
