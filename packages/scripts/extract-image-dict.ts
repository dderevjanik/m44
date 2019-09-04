import path from "path";
import fs from "fs";
import nconf from "nconf";
import log4js from "log4js";
import * as reporters from "io-ts-reporters";
import { readFileSync } from "fs";
import { SedData } from "../shared/sed_data";
import { createImagesDict } from "../core/utils/create-images-dict";

const config = {
    log4js: {
        appenders: {
            out: { type: "stdout" },
            app: { type: "file", filename: "application.log" }
        },
        categories: {
            default: { appenders: ["out", "app"], level: "debug" }
        }
    } as log4js.Configuration
}

type Config = (typeof config) & {
    _: string[];
    h?: boolean;
    help?: boolean;
};

log4js.configure(config.log4js);
const log = log4js.getLogger("CLI");

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

if (conf.h || conf.help || conf._.length === 0) {
    process.stdout.write("Usage: m44-script extract-image-dict SED_DATA OUTPUT\n");
    process.stdout.write("Extract dictionary of imagenameToImage\n");
    process.stdout.write("\n");
    process.exit();
}

log.info(conf);

(async function () {
    log.debug(`Loading and parsing sedData from: '${conf._[0]}'`);
    const sedDataFile = readFileSync(conf._[0]);
    const sedData = JSON.parse(sedDataFile.toString());
    const result = SedData.decode(sedData);
    const report = reporters.reporter(result);
    if (report.length) {
        throw new Error(`cannot_decode: sedData '${conf._[0]}'`);
    }

    const iconDict = createImagesDict(sedData);
    const iconDictObj: { [image: string]: string } = {};
    iconDict.forEach((val, key) => {
        iconDictObj[key] = val;
    });

    const iconDictJSON = JSON.stringify(iconDictObj, null, 2);
    const outpuName = conf._[1] || "images.json";
    log.debug(`Writing '${outpuName}'`);
    fs.writeFileSync(outpuName, iconDictJSON);
})();
