import Jimp from "jimp";
import { IconRepo } from "./icon-repo";
import { M44, BoardLabel, BoardObstacle, BoardRectTerrain, BoardTerrain, BoardTag, BoardUnit  } from "../models/m44";
import { Board } from "../models/board";

export interface RendererConfig {
    width: number;
    height: number;
    hexSize: [number, number];
}

export type RenderType = "terrain"
    | "rect_terrain"
    | "tag"
    | "unit"

export class Renderer {

    private _iconRepo: InstanceType<typeof IconRepo>;
    private _board: InstanceType<typeof Board>;
    private _ctx: Jimp;
    private _conf: RendererConfig;
    private _font: any | null;

    constructor(
        iconRepo: InstanceType<typeof IconRepo>,
        board: InstanceType<typeof Board>,
        config: RendererConfig
    ) {
        this._iconRepo = iconRepo;
        this._board = board;
        this._conf = config;
        this._font = null;

        this._ctx = new Jimp(config.width, config.height);
    }

    getResult() {
        return this._ctx;
    }

    async loadFont(fontPath: string) {
        this._font = await Jimp.loadFont(fontPath);
    }

    async fillBck(imgPath: string) {
        const { _board, _ctx } =  this;
        const blank = await Jimp.read(imgPath);
        for (const hex of _board.all()) {
            await _ctx.composite(blank, parseInt(hex.posX), parseInt(hex.posY));
        }
    }

    async terrain(terrain: BoardTerrain, row: number, col: number) {
        const { _iconRepo, _board, _ctx } = this;

        const boardHex = _board.get(row, col);
        if (terrain.orientation) {
            const jimp = await _iconRepo.getRotated(terrain.name, terrain.orientation);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY));
        } else {
            const jimp = await _iconRepo.get(terrain.name);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY));
        }
    }

    async rectTerrain(rectTerrian: BoardRectTerrain, row: number, col: number) {
        const { _iconRepo, _board, _ctx } = this;

        const boardHex = _board.get(row, col);
        if (rectTerrian.orientation) {
            const jimp = await _iconRepo.getRotated(rectTerrian.name, rectTerrian.orientation);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.7
            });
        } else {
            const jimp = await _iconRepo.get(rectTerrian.name);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.7
            });
        }
    }

    async obstacle(obstacle: BoardObstacle, row: number, col: number) {
        const { _iconRepo, _board, _ctx } = this;

        const boardHex = _board.get(row, col);
        if (obstacle.orientation) {
            const jimp = await _iconRepo.getRotated(obstacle.name, obstacle.orientation);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.7
            });
        } else {
            const jimp = await _iconRepo.get(obstacle.name);
            await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.7
            });
        }
    }

    async tags(tag: BoardTag, row: number, col: number) {
        const { _iconRepo, _board, _ctx } = this;

        const boardHex = _board.get(row, col);
        const jimp = await _iconRepo.get(tag.name);
        await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 0.8
        });
    }

    async unit(unit: BoardUnit, row: number, col: number) {
        const { _iconRepo, _board, _ctx } = this;

        const boardHex = _board.get(row, col);
        const jimp = await _iconRepo.get(unit.name);
        await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 0.6
        });

        if (unit.badge) {
            const jimp = await _iconRepo.get(unit.badge);
            const jimpR = await jimp.resize(64, 64);


            await _ctx.composite(jimpR, parseInt(boardHex.posX), parseInt(boardHex.posY) + 48, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacityDest: 1,
                opacitySource: 0.6
            });
        }
    }

    async label(label: BoardLabel) {
        const { _font, _board, _ctx, _conf } = this;

        if (_font === null) {
            throw new Error("font_not_loaded");
        }

        const boardHex = _board.get(label.row, label.col);
        const nx = parseInt(boardHex.posX);
        const ny = parseInt(boardHex.posY);

        await _ctx.print(_font, nx, ny - 30, {
            text: label.text.join(" "),
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
        }, _conf.hexSize[0], _conf.hexSize[1]);
    }

}
