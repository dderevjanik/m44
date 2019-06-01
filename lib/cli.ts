import path from "path";
import nconf from "nconf";
import log4js from "log4js";
import fs from "fs";
import { config, Config } from "./config";
import { App } from "./app";
import { ImageRepo } from "./repo/image-repo";

log4js.configure(config.log4js);
const log = log4js.getLogger("CLI");

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

if (conf.h || conf.help) {
    process.stdout.write("Usage: m44 [OPTION]... FILE...\n");
    process.stdout.write("Render .m44 FILE to .png\n");
    process.stdout.write("By default, rendered file will be written alongside with input FILE, unless -o (output) is specified\n");
    process.stdout.write("Also, make sure that sed_data.json is in folder alongside with .m44 file, otherwise define path for it using -d arg");
    process.stdout.write("\n");
    process.stdout.write("Mandatory arguments to long options are mandatory for short options too\n");
    process.stdout.write("\t-d\t\t\t path to sed_data.json\n");
    process.stdout.write("\t-o\t\t\t set output path for rendered .png file\n");
    process.stdout.write("\t-l, --layers\t\t render only specific layers\n");
    process.stdout.write("\t\t\t\tterrain, rect_terrain, obstacle, tags, unit, label, badge, lines\n");
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
    // obtain data from xargs
    const inputPath = conf._[0];
    const outputPath = conf.o || getFileName(inputPath);
    const sedDataPath = conf.d || path.join(path.dirname(inputPath), "/", "sed_data.json");
    const renderLayers = conf.l
        ? conf.l.split(",").map(layer => layer.trim())
        : ["terrain", "rect_terrain", "obstacle", "tags", "unit", "label", "badge", "lines"];

    // validation
    if (!inputPath) {
        log.error("Input file not defined");
        process.exit(1);
    }

    if (!fs.existsSync(inputPath)) {
        log.error(`Input file "${inputPath}" doesn't exists`);
        log.warn("please make sure that input path is correct");
        process.exit(1);
    }

    if (!fs.existsSync(sedDataPath)) {
        log.error("Cannot find sedData.json");
        log.warn("please change your cwd to match sedData.json or define path to it using '-d' option");
        process.exit(1);
    }

    if (conf.l) {
        renderLayers.forEach((layer) => {
            if (!conf.board.layers.includes(layer as any)) {
                log.error(`Unknown layer "${layer}" for "-l" option`);
                log.warn(`layer should be one of: ${conf.board.layers.join(", ")}`);
                process.exit(1);
            }
        })
    }

    // initialize logic
    const imgRepo = new ImageRepo(conf.imageRepo);
    const app = new App(imgRepo, {
        renderLayers: renderLayers,
        board: conf.board
    });
    app.loadSedData(sedDataPath);
    app.loadScenario(inputPath);

    // draw scenario
    await app.drawScenario(outputPath!);
})();
