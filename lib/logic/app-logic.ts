import { Renderer } from "../types/renderer";

export class AppLogic {

    _fileLoader: {};
    _renderer: Renderer;

    constructor(fileLoader: {}, renderer: Renderer) {
        this._fileLoader = fileLoader;
        this._renderer = renderer;
    }

    fileLoader() {
        return this._fileLoader;
    }

    renderer() {
        return this._renderer;
    }

}
