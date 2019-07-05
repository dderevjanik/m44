import { SedData } from "../types/sed_data";
import { App, AppConf } from "../core/app";
import { BrowserMeasure } from "./modules/browser-measure";
import { CanvasRender } from "./modules/canvas-render";
import { ImageLocalStorage } from "./modules/image-localstorage";
import { M44 } from "../types/m44";

// HACKY
const PROXY = 'https://cors-anywhere.herokuapp.com/';

interface Config {
    renderLayers: string[];
    board: AppConf["board"];
    dataUrl: string;
    imageKey: string;
}

export class M44Browser {

    _app: App<HTMLImageElement, string> | null = null;
    _conf: Config;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedData: SedData) {
        const imgls = new ImageLocalStorage({
            dataUrl: this._conf.dataUrl,
            imageKey: this._conf.imageKey
        });
        await imgls.sideLoad("countryside.png", PROXY + "https://raw.githubusercontent.com/patricksurry/aide-memoire/master/images/bg_188_217/countryside.png");
        await imgls.sideLoad("outline.png", PROXY + "https://raw.githubusercontent.com/patricksurry/aide-memoire/master/images/bg_188_217/outline.png");
        this._app = new App<HTMLImageElement, string>(
            sedData,
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
