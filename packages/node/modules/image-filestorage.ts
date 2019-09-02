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

    async get(imageName: string): Promise<Buffer> {
        const { imageDir } = this._conf;
        const fileName = imageName.split("/").pop();
        if (!fileName) {
            throw new Error(`Cannot parse filename from "${imageName}"`)
        }
        const filePath = path.join(imageDir, fileName);
        if (imageName in this._memCache) {
            return this._memCache[imageName];
        } else if (fs.existsSync(filePath)) {
            const image = fs.readFileSync(filePath);
            this._memCache[imageName] = image;
            return image;
        } else {
            await this._fetch(imageName);
            const image = fs.readFileSync(filePath);
            this._memCache[imageName] = image;
            return image;
        }
    }

    async _fetch(imageName: string): Promise<void> {
        const { dataUrl, imageDir } = this._conf;

        const fileName = imageName.split("/").pop();
        const ws = createWriteStream(path.join(imageDir, fileName!));

        const url = dataUrl + imageName;
        try {
            await fetchFile(url, ws);
        } catch(err) {
            log.error(`Cannot fetch "${imageName}", ${err}`);
            throw new Error("cannot_fetch");
        }
        log.info(`fetched ${url}`);
    }

}
