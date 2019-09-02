import { PersistentStorage } from "../types/imagestorage";

export class ImageStore<IMG> {

    _imageRepo: PersistentStorage<IMG>;
    _imagesDict: Map<string, string>;
    _memCache: { [name: string]: IMG };

    constructor(imageRepo: PersistentStorage<IMG>, imagesDict: Map<string, string>) {
        this._imageRepo = imageRepo;
        this._imagesDict = imagesDict;
        this._memCache = { };
    }

    async get(name: string): Promise<IMG> {
        if (name in this._memCache) {
            return this._memCache[name];
        } else {
            const url = this._imagesDict.get(name);
            if (url) {
                const img = await this._imageRepo.get(url);

                this._memCache[name] = img;
                return img;
            } else {
                throw new Error(`IconRepo: '${name}' is not stored in cache neither in iconDict`);
            }
        }
    }

    async getRotated(name: string, orientation?: number): Promise<IMG> {
        if (!orientation || orientation === 1) {
            return this.get(name);
        }
        return this.get(`${name}_${orientation}`);
        // const rotatedName = name + "_" + orientation;
        // if (rotatedName in this._memCache) {
        //     return this._memCache[rotatedName];
        // } else {
        //     if (!this._iconDict.has(rotatedName)) {
        //         const url = this._iconDict.get(name);
        //         if (url) {
        //             const rotatedIcon = replaceAt(
        //                 url,
        //                 url.length - 5, // river1.png -> riverX.png
        //                 orientation.toString()
        //             );
        //             this._iconDict.set(rotatedName, rotatedIcon);
        //         } else {
        //             throw new Error(`IconRepo: iconDict doesn't have '${rotatedName}' and  '${name}'`);
        //         }
        //     }
        //     const url = this._iconDict.get(rotatedName);
        //     if (url) {
        //         const img = await this._imageRepo.get(url);

        //         this._memCache[rotatedName] = img;
        //         return img;
        //     } else {
        //         throw new Error(`IconRepo: ${url} is not stored in iconDict`);
        //     }
        // }
    }

}
