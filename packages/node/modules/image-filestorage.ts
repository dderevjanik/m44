import fs, { createWriteStream, WriteStream } from "fs";
import path from "path";
import http from "http";
import { ImageStorage } from "../../core/types/imagestorage";

export function fetchFile(url: string, writeStream: WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            response
                .pipe(writeStream)
                .on("error", err => reject(err))
                .on("close", () => resolve())
        })
    });
}

export class ImageFileStorage implements ImageStorage<Buffer> {

    private _imageDir: string;
    private _memCache: { [imageName: string]: Buffer };
    private _imagesDict: { [imageName: string]: string };

    constructor(imageDir: string, imagesDict: { [imageName: string]: string }) {
        this._imageDir = imageDir;
        this._imagesDict = imagesDict;
        this._memCache = {};

        if (!fs.existsSync(imageDir)) {
            console.log(`imageDir doesn't exists, creating "${imageDir}"`);
            fs.mkdirSync(imageDir);
        }
    }

    async get(imageName: string): Promise<Buffer> {
        const imagePath = this._imagesDict[imageName];
        if (imagePath === undefined) {
            throw new Error(`Cannot find path for image "${imageName}"`);
        }

        const finalImagePath = path.join(this._imageDir, imagePath);
        if (imagePath in this._memCache) {
            return this._memCache[imagePath];
        } else if (fs.existsSync(finalImagePath)) {
            const image = fs.readFileSync(finalImagePath);
            this._memCache[imagePath] = image;
            return image;
        } else {
            throw new Error(`${imagePath} doesn't exists`);
            // await this._fetch(imagePath);
            // const image = fs.readFileSync(finalImagePath);
            // this._memCache[imagePath] = image;
            // return image;
        }
    }

    // async _fetch(imagePath: string): Promise<void> {
    //     const { dataUrl, imageDir } = this._conf;
    //     const finalDir = path.join(imageDir, path.dirname(imagePath));
    //     fs.mkdirSync(finalDir, { recursive: true });
    //     const ws = createWriteStream(path.join(imageDir, imagePath));

    //     const url = dataUrl + imagePath;
    //     try {
    //         await fetchFile(url, ws);
    //     } catch(err) {
    //         log.error(`Cannot fetch "${imagePath}", ${err}`);
    //         throw new Error("cannot_fetch");
    //     }
    //     log.info(`fetched ${url}`);
    // }

}
