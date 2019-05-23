import log4js from "log4js";

const log = log4js.getLogger("ICON-DICT");

export class IconDict {

    private _iconDict: { [name: string]: string } = {};

    constructor() {
        this._iconDict = {};
    }

    get(name: string) {
        if (name in this._iconDict) {
            return this._iconDict[name];
        } else {
            throw new Error(`Icon for name "${name}" doesn't exists`);
        }
    }

    set(name: string, icon: string): boolean {
        if (name in this._iconDict) {
            log.debug(`"${name}" already exists`);
            return false;
        }
        this._iconDict[name] = icon;
        return true;
    }

    exist(name: string) {
        if (name in this._iconDict) {
            return true;
        }
        return false;
    }

}
