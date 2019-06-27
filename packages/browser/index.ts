import * as reporters from "io-ts-reporters";
import { SedData } from "../types/sed_data";
import { App, AppConf } from "../core/app";
import { BrowserMeasure } from "./modules/browser-measure";
import { CanvasRender } from "./modules/canvas-render";
import { ImageLocalStorage } from "./modules/image-localstorage";

import { config } from "./config";
import { M44 } from "../types/m44";
// import galatos from "../../data/Galatos.json";
// import json from "../../data/sed_data.json";
// localStorage.setItem("m44-sedData", JSON.stringify(json));

interface Config {
    renderLayers: string[];
    board: AppConf["board"];
    dataUrl: string;
    imageKey: string;
}

class M44Browser {

    _app: App<HTMLImageElement, string> | null = null;
    _conf: Config;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedDataKey: string) {
        const sedDataRaw = localStorage.getItem(sedDataKey);
        if (sedDataKey === undefined) {
            console.log(`sedData not stored in localstorage "${sedDataKey}"`);
        }

        const sedData = JSON.parse(sedDataRaw!);
        const result = SedData.decode(sedData);
        const report = reporters.reporter(result);

        if (report.length) {
            console.error(`Cannot decode JSON, ${JSON.stringify(report)}`);
        }

        const imgls = new ImageLocalStorage({
            dataUrl: this._conf.dataUrl,
            imageKey: this._conf.imageKey
        });
        this._app = new App<HTMLImageElement, string>(
            sedData,
            new BrowserMeasure(),
            new CanvasRender(),
            imgls,
            {
                board: this._conf.board,
                renderLayers: this._conf.renderLayers
            }
        );
    }

    async drawScenario(scenario: M44): Promise<string> {
        // TODO: Fix !
        const base64 = await this._app!.drawScenario(scenario);
        return base64;
    }

}

// (async () => {
//     const m44 = new M44Browser({
//         board: config.board,
//         dataUrl: config.imageRepo.dataUrl,
//         imageKey: config.imageRepo.imageDir,
//         renderLayers: ["terrain"]
//     });
//     await m44.initialize("m44-sedData");
//     const str = m44.drawScenario(galatos as any);
//     console.log(str);
// })();

