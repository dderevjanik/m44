import Jimp from "jimp";
import { Renderer } from "../../core/types/renderer";

export interface Config {
    width: number;
    height: number;
    hexSize: [number, number];
}

export class JimpRender implements Renderer<Buffer, Buffer> {

    private _ctx: Jimp;
    private _font: any | null;

    constructor() {
        this._font = null;
        this._ctx = new Jimp(1, 1);
    }

    async clear() {
        throw new Error("clear() not implemented!")
    }

    async renderDashedLine() {
        throw new Error("renderRect() not implemented!");
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

}
