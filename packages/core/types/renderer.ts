export interface Renderer<IMG, RES> {
    getResult(): Promise<RES>;
    clear(): Promise<void>;
    resize(width: number, height: number): Promise<void>;
    loadFont(fontPath: string): Promise<void>;
    renderDashedLine(x1: number, y1: number, x2: number, y2: number, opts: { length: number, width: number, step: number, style: string }): Promise<void>;
    renderText(text: string, x: number, y: number, w: number, h: number): Promise<void>;
    renderImage(img: IMG, x: number, y: number): Promise<void>;
}
