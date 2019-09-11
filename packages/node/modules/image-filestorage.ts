import fs, { createWriteStream, WriteStream } from "fs";
import * as log4js from "log4js";
import path from "path";
import http from "http";
import { PersistentStorage } from "../../core/types/imagestorage";

const log = log4js.getLogger("IMG-REPO");

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

interface ImageRepoConf {
    dataUrl: string;
    imageDir: string;
}

export class ImageFileStorage implements PersistentStorage<Buffer> {

    private _conf: ImageRepoConf;
    private _memCache: { [imageName: string]: Buffer };

    constructor(conf: ImageRepoConf) {
        this._conf = conf;
        this._memCache = {};

        if (!fs.existsSync(conf.imageDir)) {
            log.debug(`imageDir doesn't exists, creating "${conf.imageDir}"`);
            fs.mkdirSync(conf.imageDir);
        }
    }

    async get(imagePath: string): Promise<Buffer> {
        const { imageDir } = this._conf;

        const finalImagePath = path.join(imageDir, imagePath);
        if (imagePath in this._memCache) {
            return this._memCache[imagePath];
        } else if (fs.existsSync(finalImagePath)) {
            const image = fs.readFileSync(finalImagePath);
            this._memCache[imagePath] = image;
            return image;
        } else {
            await this._fetch(imagePath);
            const image = fs.readFileSync(finalImagePath);
            this._memCache[imagePath] = image;
            return image;
        }
    }

    async _fetch(imagePath: string): Promise<void> {
        const { dataUrl, imageDir } = this._conf;
        const finalDir = path.join(imageDir, path.dirname(imagePath));
        fs.mkdirSync(finalDir, { recursive: true });
        const ws = createWriteStream(path.join(imageDir, imagePath));

        const url = dataUrl + imagePath;
        try {
            await fetchFile(url, ws);
        } catch(err) {
            log.error(`Cannot fetch "${imagePath}", ${err}`);
            throw new Error("cannot_fetch");
        }
        log.info(`fetched ${url}`);
    }

}
