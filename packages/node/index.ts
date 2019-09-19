import * as fs from "fs";
import { Core } from "../core/core";
import { fileLoader } from "./utils/file-loader";
import { M44 } from "../shared/m44";
import { NodeCanvasRender } from "./modules/node-canvas-render";

import boardSizes from "../../board_sizes.json";
import imagesDict from "../../images.json";
import imagesExtDict from "../../images_ext.json";
import { ImageFileStorage } from "./modules/image-filestorage";

interface Config {
    renderLayers: string[];
    imageDir: string;
}

export class M44Node {

    _conf: Config;
    _app: Core | null = null;
    _imgFileStorage: ImageFileStorage | null = null;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(): Promise<void> {
        // const sedData = fileLoader(sedDataPath, SedData);
        // const boardSizes = fileLoader(boardSizesPath, BoardSizes);
        this._imgFileStorage =  new ImageFileStorage(this._conf.imageDir, {
            ...imagesDict,
            ...imagesExtDict
        });
        this._app = new Core(
            boardSizes as any
        );
    }

    async drawScenario(filePath: string, outputPath?: string): Promise<void> {
        if (this._app === null) {
            throw new Error("Please, initialize app first");
        }
        if (this._imgFileStorage === null) {
            throw new Error("ImageFilStorage not initialized");
        }
        const m44: M44 = fileLoader(filePath, M44);
        try  {
            const board = this._app.createBoard(m44.board.type, m44.board.face);
            const scenario = this._app.createScenario(board, m44);

            const ctx = new NodeCanvasRender();
            await ctx.loadFont("32px Arial");
            await ctx.resize(...scenario.sizeR());

            await scenario.drawBackgroundLayer(ctx, this._imgFileStorage);
            await scenario.drawSceanrioLayer(ctx, this._imgFileStorage, {
                renderLayers: this._conf.renderLayers
            });
            // await this._app.drawBoard(ctx, { face: m44.board.face, size: m44.board.type });
            // await this._app.drawScenario(ctx, m44);

            const img = await ctx.getResult();
            fs.writeFileSync(`${outputPath}.png`, img);
        } catch(err) {
            throw new Error("Error while drawing a scenario, err:" + err);
        }
    }

}
