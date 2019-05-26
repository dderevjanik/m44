import nconf from "nconf";
import { config, Config } from "./config";
import path from "path";
import log4js from "log4js";
import { App } from "./app";
import { ImageRepo } from "./repo/image-repo";

log4js.configure(config.log4js);
const log = log4js.getLogger("APP");

const sedDataPath = "../data/sed_data.json";

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

log.info(conf);

if (conf._.length === 0) {
    log.error("Please define input argument");
    throw new Error("argument_not_defined");
}

function getFileName(filePath: string) {
    return path.basename(filePath).split(".").slice(0, -1).join(".");
}

(async function () {
    const imgRepo = new ImageRepo(conf.imageRepo);

    const inputPath = conf._[0];
    const outputFile = conf.o || getFileName(inputPath);



    const app = new App(imgRepo, conf);
    app.loadSedData(sedDataPath);
    app.loadScenario(inputPath);
    await app.drawScenario(outputFile!);
})();
