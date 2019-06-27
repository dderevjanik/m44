import { IconDict } from "./icon-dict";
import { ImageStorage } from "../types/imagestorage";

function replaceAt(str: string, index: number, replacement: string) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

export class IconRepo<IMG> {

    _imageRepo: ImageStorage<IMG>;
    _iconDict: IconDict;
    _memCache: { [name: string]: IMG };

    constructor(imageRepo: ImageStorage<IMG>, iconDict: InstanceType<typeof IconDict>) {
        this._imageRepo = imageRepo;
        this._iconDict = iconDict;
        this._memCache = { };
    }

    async get(name: string): Promise<IMG> {
        if (name in this._memCache) {
            return this._memCache[name];
        } else {
            const url = this._iconDict.get(name);
            const img = await this._imageRepo.get(url);

            this._memCache[name] = img;
            return img;
        }
    }

    async getRotated(name: string, orientation?: number): Promise<IMG> {
        if (!orientation) {
            return this.get(name);
        }
        const rotatedName = name + "_" + orientation;
        if (rotatedName in this._memCache) {
            return this._memCache[rotatedName];
        } else {
            if (!this._iconDict.exist(rotatedName)) {
                const url = this._iconDict.get(name);
                const rotatedIcon = replaceAt(
                    url,
                    url.length - 5, // river1.png -> riverX.png
                    orientation.toString()
                );
                this._iconDict.set(rotatedName, rotatedIcon);
            }
            const url = this._iconDict.get(rotatedName);
            const img = await this._imageRepo.get(url);

            this._memCache[rotatedName] = img;
            return img;
        }
    }

}
