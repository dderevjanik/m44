import canvas, { Image } from "canvas";
import { Renderer } from "../core/types/renderer";

export class NodeCanvasRender implements Renderer {

    private _canvas: canvas.Canvas;
    private _ctx: canvas.CanvasRenderingContext2D;
    private _font: string | null ;

    constructor() {
        this._font = null;
        this._canvas = canvas.createCanvas(1, 1);
        this._ctx = this._canvas.getContext("2d");
    }

    async renderRect(x: number, y: number, w: number, h: number, style: string) {
        this._ctx.fillStyle = style;
        this._ctx.fillRect(x, y, w, h);
    }

    async renderDashedLine(x1: number, y1: number, x2: number, y2: number, opts: { width: number, step: number, length: number, style: string }) {
        this._ctx.strokeStyle = opts.style;
        this._ctx.lineWidth = opts.width;

        this._ctx.beginPath();
        this._ctx.setLineDash([ opts.length, opts.step ]);
        this._ctx.moveTo(x1, y1);
        this._ctx.lineTo(x2, y2);
        this._ctx.stroke();
    }

    async getResult(): Promise<Buffer> {
        return this._canvas.toBuffer("image/png");
    }

    async loadFont(fontPath: string): Promise<void> {
        this._font = fontPath;
    }

    async renderImage(img: Buffer, x: number, y: number): Promise<void> {
        const nImg = new Image();
        return new Promise((resolve, reject) => {
            nImg.onerror = () => {
                reject("error_during_loading_image");
            };
            nImg.onload = () => {
                this._ctx.drawImage(nImg, x, y);
                resolve();
            };
            nImg.src = img;
        });
    }

    async renderText(text: string, x: number, y: number, w: number, h: number): Promise<void> {
        if (!this._font) {
            throw new Error("font_not_set");
        }
        this._ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this._ctx.font = this._font;
        this._ctx.textAlign = "center";
        this._ctx.fillText(text, x, y, w);
    }

    async resize(width: number, height: number): Promise<void> {
        this._canvas.width = width;
        this._canvas.height = height;
    }

}
