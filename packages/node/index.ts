import * as fs from "fs";
import { Core, CoreConf } from "../core/core";
import { fileLoader } from "./utils/file-loader";
import { SedData } from "../types/sed_data";
import { M44 } from "../types/m44";
import { NodeMeasure } from "./modules/node-measure";
import { NodeCanvasRender } from "./modules/node-canvas-render";
import { ImageFileStorage } from "./modules/image-filestorage";

interface Config {
    renderLayers: string[];
    board: CoreConf["board"];
    dataUrl: string;
    imageDir: string;
}

export class M44Node {

    _conf: Config;
    _app: Core<Buffer, Buffer> | null = null;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedDataPath: string): Promise<void> {
        const sedData = fileLoader(sedDataPath, SedData);
        this._app = new Core<Buffer, Buffer>(
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
        const m44: M44 = fileLoader(filePath, M44);
        try  {
            const img = await this._app.drawScenario(m44);
            fs.writeFileSync(`${outputPath}.png`, img);
        } catch(err) {
            throw new Error("Error while drawing a scenario, err:" + err);
        }
    }

}
