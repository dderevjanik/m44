import fs from "fs";
import nconf from "nconf";
import * as reporters from "io-ts-reporters";
import { readFileSync } from "fs";
import { SedData } from "../shared/sed_data";
import { createImagesDict } from "../core/utils/create-images-dict";

type Config =  {
    _: string[];
    h?: boolean;
    help?: boolean;
};

const conf = nconf
    .argv()
    .get() as Config;

if (conf.h || conf.help || (conf._.length === 0)) {
    process.stdout.write("Usage: m44-script extract-image-dict SED_DATA [OUTPUT]\n");
    process.stdout.write("Extract dictionary of imagenameToImage\n");
    process.stdout.write("\n");
    process.exit();
}

console.log("Loaded config");
console.log(JSON.stringify(conf, null, 2));
(async function () {
    console.log(`Loading and parsing sedData from: '${conf._[0]}'`);
    const sedDataFile = readFileSync(conf._[0]);
    const sedData = JSON.parse(sedDataFile.toString());
    const result = SedData.decode(sedData);
    const report = reporters.reporter(result);
    if (report.length) {
        throw new Error(`Cannot decode sed_data '${conf._[0]}'`);
    }

    const nameToIcon = createImagesDict(sedData);
    console.log(`Imagedict size: ${nameToIcon.size}`);
    const nameToIconObj: { [image: string]: string } = {};
    nameToIcon.forEach((val, key) => {
        nameToIconObj[key] = val;
    });

    const iconDictJSON = JSON.stringify(nameToIconObj, null, 2);
    const outpuName = conf._[1] || "images.json";

    console.log(`Writing "${outpuName}" to disk`);
    fs.writeFileSync(outpuName, iconDictJSON);
})();
