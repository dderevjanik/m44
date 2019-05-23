import nconf from "nconf";
import { config, Config } from "./config";
import log4js from "log4js";
import { App } from "./app";
import { ImageRepo } from "./repo/image-repo";

log4js.configure(config.log4js);
const log = log4js.getLogger("APP");

const sedDataPath = "../data/sed_data.json";
const testMapPath = "../data/Red Barricades Factory.m44";

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

log.info(conf);

(async function () {
    const imgRepo = new ImageRepo(conf.imageRepo);


    const app = new App(imgRepo, conf);
    app.loadSedData(sedDataPath);
    app.loadScenario(testMapPath);
    await app.drawScenario();
})();
