import { ImageStorage } from "../../core/types/imagestorage";

/**
 * @url {https://stackoverflow.com/questions/19183180/how-to-save-an-image-to-localstorage-and-display-it-on-the-next-page}
 */
function convertToBase64(canvas: HTMLCanvasElement, img: HTMLImageElement) {
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl;
}

function createImage(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    return new Promise((resolve, reject) => {
        image.src = url;
        image.onload = (img) => {
            resolve(image);
        }
        image.onerror = (err) => {
            reject(err);
        }
    });
}

interface Config {
    dataUrl: string;
    imageKey: string;
}

export class ImageLocalStorage implements ImageStorage<HTMLImageElement> {

    private _conf: Config;
    private _memory: { [imageName: string]: HTMLImageElement } = {};
    /** imageName: base64 */
    private _cache: { [imageName: string]: string } = {}
    /** used to convert images to base64 */
    private _canvas: HTMLCanvasElement;

    constructor(conf: Config) {
        this._conf = conf;
        this._memory = {};
        this._canvas = document.createElement("canvas");

        const storage = localStorage.getItem(conf.imageKey);
        if (storage === undefined || storage === null) {
            // initialize storage
            console.log(`[IMGREPO] initializing storage "${conf.imageKey}"`);
            localStorage.setItem(conf.imageKey, "{}");
        } else {
            console.log(`[IMGREPO] cache loaded from storage "${conf.imageKey}"`);
            this._cache = JSON.parse(storage);
        }
    }

    async sideLoad(imageName: string, url: string) {
        const img = await createImage(url);
        const base64 = convertToBase64(this._canvas, img);

        this._memory[imageName] = img;
        this._cache[imageName] = base64;
        this._saveCache();

    }

    async get(imageName: string): Promise<HTMLImageElement> {
        if (imageName in this._memory) {
            return this._memory[imageName];
        } else if (imageName in this._cache) {
            const base64 = this._cache[imageName];
            const img = await createImage(base64);

            this._memory[imageName] = img;

            return img;
        } else {
            const img = await createImage(this._conf.dataUrl + imageName);
            const base64 = await convertToBase64(this._canvas, img);

            this._memory[imageName] = img;
            this._cache[imageName] = base64;
            this._saveCache();

            return img;
        }
    }

    _saveCache() {
        const imageKey = this._conf.imageKey;
        localStorage.setItem(imageKey, JSON.stringify(this._cache));
    }

}
