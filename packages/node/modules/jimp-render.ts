import Jimp from "jimp";
import { Renderer } from "../../core/types/renderer";

export interface Config {
    width: number;
    height: number;
    hexSize: [number, number];
}

export class JimpRender implements Renderer {

    private _ctx: Jimp;
    private _font: any | null;

    constructor() {
        this._font = null;
        this._ctx = new Jimp(1, 1);
    }

    async renderDashedLine() {
        throw new Error("renderRect not implemented!");
    }

    async loadFont(fontPath: string): Promise<void> {
        this._font = await Jimp.loadFont(fontPath);
    }

    async renderText(text: string, x: number, y: number, w: number, h: number): Promise<void> {
        const { _font, _ctx } = this;

        if (_font === null) {
            throw new Error("font_not_loaded");
        }

        await _ctx.print(_font, x, y - 30, {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
        }, w, h);
    }

    async getResult(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this._ctx.getBuffer(Jimp.MIME_PNG, (err, res) => {
                if (err) {
                    return reject(err);
                }
                resolve(res);
            });
        });
    }

    async renderImage(img: Buffer, x: number, y: number): Promise<void> {
        // Note: Jimp doesn't support float number, so with Math.floor we can make integers
        const jimp = await Jimp.read(img);
        await this._ctx.composite(jimp, Math.floor(x), Math.floor(y));
    }

    async resize(width: number, height: number): Promise<void> {
        await this._ctx.resize(width, height);
    }

    // getResult() {
    //     return this._ctx;
    // }

    // async loadFont(fontPath: string) {
    //     this._font = await Jimp.loadFont(fontPath);
    // }

    // async fillBck(imgPath: string) {
    //     const { _board, _ctx } =  this;
    //     const blank = await Jimp.read(imgPath);
    //     for (const hex of _board.all()) {
    //         await _ctx.composite(blank, parseInt(hex.posX), parseInt(hex.posY));
    //     }
    // }

    // async terrain(terrain: BoardTerrain, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     if (terrain.orientation) {
    //         const jimp = await _iconRepo.getRotated(terrain.name, terrain.orientation);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY));
    //     } else {
    //         const jimp = await _iconRepo.get(terrain.name);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY));
    //     }
    // }

    // async rectTerrain(rectTerrian: BoardRectTerrain, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     if (rectTerrian.orientation) {
    //         const jimp = await _iconRepo.getRotated(rectTerrian.name, rectTerrian.orientation);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //             mode: Jimp.BLEND_SOURCE_OVER,
    //             opacityDest: 1,
    //             opacitySource: 0.7
    //         });
    //     } else {
    //         const jimp = await _iconRepo.get(rectTerrian.name);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //             mode: Jimp.BLEND_SOURCE_OVER,
    //             opacityDest: 1,
    //             opacitySource: 0.7
    //         });
    //     }
    // }

    // async obstacle(obstacle: BoardObstacle, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     if (obstacle.orientation) {
    //         const jimp = await _iconRepo.getRotated(obstacle.name, obstacle.orientation);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //             mode: Jimp.BLEND_SOURCE_OVER,
    //             opacityDest: 1,
    //             opacitySource: 0.7
    //         });
    //     } else {
    //         const jimp = await _iconRepo.get(obstacle.name);
    //         await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //             mode: Jimp.BLEND_SOURCE_OVER,
    //             opacityDest: 1,
    //             opacitySource: 0.7
    //         });
    //     }
    // }

    // async tags(tag: BoardTag, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     const jimp = await _iconRepo.get(tag.name);
    //     await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //         mode: Jimp.BLEND_SOURCE_OVER,
    //         opacityDest: 1,
    //         opacitySource: 0.8
    //     });
    // }

    // async unit(unit: BoardUnit, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     const jimp = await _iconRepo.get(unit.name);
    //     await _ctx.composite(jimp, parseInt(boardHex.posX), parseInt(boardHex.posY), {
    //         mode: Jimp.BLEND_SOURCE_OVER,
    //         opacityDest: 1,
    //         opacitySource: 0.6
    //     });
    // }

    // async badge(badge: string, row: number, col: number) {
    //     const { _iconRepo, _board, _ctx } = this;

    //     const boardHex = _board.get(row, col);
    //     const jimp = (await _iconRepo.get(badge))
    //         .resize(64, 64);
    //     await _ctx.composite(
    //         jimp,
    //         parseInt(boardHex.posX),
    //         parseInt(boardHex.posY) + 48
    //     );
    // }

    // async label(label: BoardLabel) {
    //     const { _font, _board, _ctx, _conf } = this;

    //     if (_font === null) {
    //         throw new Error("font_not_loaded");
    //     }

    //     const boardHex = _board.get(label.row, label.col);
    //     const nx = parseInt(boardHex.posX);
    //     const ny = parseInt(boardHex.posY);

    //     await _ctx.print(_font, nx, ny - 30, {
    //         text: label.text.join(" "),
    //         alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    //         alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
    //     }, _conf.hexSize[0], _conf.hexSize[1]);
    // }

}
