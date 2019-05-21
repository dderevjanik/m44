import fs, { createWriteStream } from "fs";
import path from "path";
import { fetchFile } from "../utils/fetch";

interface ImageRepoConf {
    dataUrl: string;
    imageDir: string;
}

export class ImageRepo {

    private _conf: ImageRepoConf;
    private _cache: { [imageName: string]: Buffer };

    constructor(conf: ImageRepoConf) {
        this._conf = conf;
        this._cache = {};
    }

    async get(imageName: string) {
        const { imageDir } = this._conf;
        const fileName = imageName.split("/").pop();
        if (!fileName) {
            throw new Error(`Cannot parse filename from "${imageName}"`)
        }
        const filePath = path.join(imageDir, fileName);

        if (imageName in this._cache) {
            return this._cache[imageName];
        } else if (fs.existsSync(filePath)) {
            const image = fs.readFileSync(filePath);
            this._cache[imageName] = image;
            return image;
        } else {
            await this._fetch(imageName);
            const image = fs.readFileSync(filePath);
            this._cache[imageName] = image;
            return image;
        }
    }

    async _fetch(imageName: string): Promise<void> {
        const { dataUrl } = this._conf;
        const url = dataUrl + imageName;

        const ws = createWriteStream(path.join())
        await fetchFile(url, ws);
    }

}
