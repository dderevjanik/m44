import * as fs from "fs";
import { App, AppConf } from "../core/app";
import { fileLoader } from "./utils/file-loader";
import { SedData } from "../core/models/sed_data";
import { NodeMeasure } from "./modules/node-measure";
import { NodeCanvasRender } from "../browser/node-canvas-render";
import { ImageFileStorage } from "./modules/image-filestorage";
import { M44 } from "../core/models/m44";

interface Config {
    renderLayers: string[];
    board: AppConf["board"];
    dataUrl: string;
    imageDir: string;
}

export class M44Node {

    _conf: Config;
    _app: App | null = null;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedDataPath: string): Promise<void> {
        const sedData = fileLoader(sedDataPath, SedData);
        this._app = new App(
            sedData,
            new NodeMeasure(),
            new NodeCanvasRender(),
            new ImageFileStorage({
                dataUrl: this._conf.dataUrl,
                imageDir: this._conf.imageDir
            }),
            {
                board: this._conf.board,
                renderLayers: this._conf.renderLayers
            }
        );
    }

    async drawScenario(filePath: string, outputPath?: string): Promise<void> {
        if (this._app === null) {
            throw new Error("Please, initialize app first");
        }
        const scenario = fileLoader(filePath, M44);
        try  {
            const img = await this._app.drawScenario(scenario);
            fs.writeFileSync(`${outputPath}.png`, img);
        } catch(err) {
            throw new Error("Error whiel drawing a scenario: " + err);
        }
    }

}
