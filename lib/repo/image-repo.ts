import fs, { createWriteStream } from "fs";
import * as log4js from "log4js";
import path from "path";
import { fetchFile } from "../utils/fetch";

const log = log4js.getLogger("IMG-REPO");

interface ImageRepoConf {
    dataUrl: string;
    imageDir: string;
}

export class ImageRepo {

    private _conf: ImageRepoConf;
    private _memCache: { [imageName: string]: Buffer };

    constructor(conf: ImageRepoConf) {
        this._conf = conf;
        this._memCache = {};

        if (!fs.existsSync(conf.imageDir)) {
            fs.mkdirSync(conf.imageDir);
        }
    }

    async get(imageName: string) {
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
        await fetchFile(url, ws);
        log.info(`fetched ${url}`);
    }

}