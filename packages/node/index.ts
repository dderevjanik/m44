import * as fs from "fs";
import { Core } from "../core/core";
import { fileLoader } from "./utils/file-loader";
import { SedData } from "../shared/sed_data";
import { M44 } from "../shared/m44";
import { NodeCanvasRender } from "./modules/node-canvas-render";
import { ImageFileStorage } from "./modules/image-filestorage";
import { BoardSizes } from "../shared/board_size";

interface Config {
    renderLayers: string[];
    dataUrl: string;
    imageDir: string;
}

export class M44Node {

    _conf: Config;
    _app: Core<Buffer> | null = null;

    constructor(conf: Config) {
        this._conf = conf;
    }

    async initialize(sedDataPath: string, boardSizesPath: string): Promise<void> {
        const sedData = fileLoader(sedDataPath, SedData);
        const boardSizes = fileLoader(boardSizesPath, BoardSizes);

        this._app = new Core<Buffer>(
            sedData,
            boardSizes,
            new ImageFileStorage({
                dataUrl: this._conf.dataUrl,
                imageDir: this._conf.imageDir
            })
        );
        this._app.initIcons();
    }

    async drawScenario(filePath: string, outputPath?: string): Promise<void> {
        if (this._app === null) {
            throw new Error("Please, initialize app first");
        }
        const m44: M44 = fileLoader(filePath, M44);
        try  {
            // const x = await this._app.renderBoard()
            const scenario = this._app.createScenario(m44);

            const ctx = new NodeCanvasRender();
            await ctx.loadFont("32px Arial");
            await ctx.resize(...scenario.sizeR());

            await scenario.drawBackgroundLayer(ctx);
            await scenario.drawSceanrioLayer(ctx, {
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
