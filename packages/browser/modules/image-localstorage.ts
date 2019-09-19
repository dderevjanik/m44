import { ImageStorage } from "../../core/types/imagestorage";
import { createImage } from "../utils";

// HACKY
// const PROXY = 'https://cors-anywhere.herokuapp.com/';

/**
 * Avoid CORS
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

/**
 * Avoid Canvas
 * @url {https://stackoverflow.com/questions/22172604/convert-image-url-to-base64}
 */
// function toDataUrl(url: string): Promise<string> {
//     const xhr = new XMLHttpRequest();
//     return new Promise((resolve, reject) => {
//         xhr.onload = function() {
//             const reader = new FileReader();
//             reader.onloadend = function() {
//                 if (reader.result === null) {
//                     reject("Cannot convert an image");
//                 } else {
//                     resolve(reader.result.toString());
//                 }
//             }
//             reader.readAsDataURL(xhr.response);
//         };
//         xhr.onerror = reject;
//         xhr.open('GET', PROXY + url);
//         xhr.responseType = 'blob';
//         xhr.send();
//     });
// }

/**
 * Avoid CORS and Canvas
 * @url {https://stackoverflow.com/questions/29644474/how-to-be-able-to-convert-image-to-base64-and-avoid-same-origin-policy}
 */
// function toBase64UsingBytes(url: string): Promise<string> {
//     const xhr = new XMLHttpRequest();
//     return new Promise((resolve, reject) => {
//         xhr.open('GET', url, true);

//         xhr.responseType = 'arraybuffer';

//         xhr.onload = function(e) {
//            if (this.status == 200) {
//                const uInt8Array = new Uint8Array(this.response); // Note:not xhr.responseText

//                for (let i = 0, len = uInt8Array.length; i < len; ++i) {
//                    uInt8Array[i] = this.response[i];
//                }

//                const byte3 = uInt8Array[4]; // byte at offset 4
//                resolve(byte3.toString());
//            }
//         }
//         xhr.onerror = function(err) {
//             reject(err);
//         }

//         xhr.send();
//     });
// }

function createImageFromBase64(base64: string): Promise<HTMLImageElement> {
    const image = new Image();
    return new Promise((resolve, reject) => {
        image.onload = () => {
            resolve(image);
        }
        image.onerror = (err) => {
            reject(err);
        }
        image.src = base64;
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

    constructor(imagesDict: { [image: string]: string }, conf: Config) {
        this._conf = conf;
        this._memory = {};
        this._canvas = document.createElement("canvas");

        // const storage = localStorage.getItem(conf.imageKey);
        // if (storage === undefined || storage === null) {
        //     // initialize storage
        //     console.log(`[IMGREPO] initializing storage "${conf.imageKey}"`);
        //     localStorage.setItem(conf.imageKey, "{}");
        // } else {
        //     console.log(`[IMGREPO] cache loaded from storage "${conf.imageKey}"`);
        //     this._cache = JSON.parse(storage);
        // }
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
            console.log(`[IMGREPO] Loading from cache '${imageName}'`);
            const base64 = this._cache[imageName];
            const img = await createImageFromBase64(base64);

            this._memory[imageName] = img;

            return img;
        } else {
            console.log(`[IMGREPO] Fetching '${imageName}'`)
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
