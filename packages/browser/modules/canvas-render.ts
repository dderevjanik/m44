import { Renderer } from "../../core/types/renderer";

export class CanvasRender implements Renderer<HTMLImageElement, string> {

    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _font: string | null ;

    constructor() {
        this._font = null;
        this._canvas = document.createElement("canvas");
        this._ctx = this._canvas.getContext("2d")!;

        // TODO: DEBUG
        const appEl = document.getElementById("app") as HTMLDivElement;
        appEl.appendChild(this._canvas);
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

    /**
     * @return {string} Base64
     */
    async getResult(): Promise<string> {
        return this._canvas.toDataURL("image/png");
    }

    async loadFont(fontPath: string): Promise<void> {
        this._font = fontPath;
    }

    async renderImage(img: HTMLImageElement, x: number, y: number): Promise<void> {
        this._ctx.drawImage(img, x, y);
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
