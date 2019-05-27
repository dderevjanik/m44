import path from "path";
import nconf from "nconf";
import log4js from "log4js";
import { config, Config } from "./config";
import { App } from "./app";
import { ImageRepo } from "./repo/image-repo";

log4js.configure(config.log4js);
const log = log4js.getLogger("APP");

const sedDataPath = "../data/sed_data.json";

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

if (conf.h || conf.help) {
    process.stdout.write("Usage: m44 [OPTION]... FILE...\n");
    process.stdout.write("Render .m44 FILE to .png\n");
    process.stdout.write("By default, rendered file will be written alongside with input FILE, unless -o (output) is specified\n");
    process.stdout.write("\n");
    process.stdout.write("Mandatory arguments to long options are mandatory for short options too\n");
    process.stdout.write("\t-o\t\t\t set output path for rendered .png file\n");
    process.stdout.write("\t-l, --layers\t\t render only specific layer(s_\n");
    process.stdout.write("\t\t\t\tterrain, rect_terrain, obstacle, tags, unit, label, badge\n");
    process.exit();
}

log.info(conf);

if (conf._.length === 0) {
    log.error("Missing operand");
    throw new Error("missing_operand");
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
