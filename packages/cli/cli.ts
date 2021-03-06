import path from "path";
import nconf from "nconf";
import log4js from "log4js";
import fs from "fs";
import { config, Config } from "./config";
import { M44Node } from "../node/index";

log4js.configure(config.log4js);
const log = log4js.getLogger("CLI");

const conf = nconf
    .argv()
    .defaults(config)
    .get() as Config;

if (conf.h || conf.help || conf._.length === 0) {
    process.stdout.write("Usage: m44 [OPTION]... FILE...\n");
    process.stdout.write("Render .m44 FILE to .png\n");
    process.stdout.write("By default, rendered file will be written alongside with input FILE, unless -o (output) is specified\n");
    process.stdout.write("\n");
    process.stdout.write("Mandatory arguments to long options are mandatory for short options too\n");
    process.stdout.write("\t-o\t\t\t set output path for rendered .png file\n");
    process.stdout.write("\t-g\t\t\t use glob patter for input files. You must also include -o output folder");
    process.stdout.write("\t-l\t\t\t render only specific layers\n");
    process.stdout.write("\t\t\t\tbackground,terrain,rect_terrain,obstacle,tags,unit,label,badge,lines\n");
    process.exit();
}

log.info(conf);

function getFileName(filePath: string) {
    return path.basename(filePath).split(".").slice(0, -1).join(".");
}

(async function () {
    // obtain data from xargs
    const inputPath = conf._[0];

    const renderLayers = conf.l
        ? conf.l.split(",").map(layer => layer.trim())
        : ["background", "outlines", "terrain", "rect_terrain", "obstacle", "tags", "unit", "label", "badge", "lines"];

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

    if (conf.l) {
        renderLayers.forEach((layer) => {
            if (!conf.board.layers.includes(layer as any)) {
                log.error(`Unknown layer "${layer}" for "-l" option`);
                log.warn(`layer should be one of: ${conf.board.layers.join(", ")}`);
                process.exit(1);
            }
        })
    }

    let outputPath = conf.o || getFileName(inputPath);
    if (conf._.length > 1 && conf.o) {
        if (!fs.existsSync(outputPath)) {
            log.error(`OutputPath doesn't exists`);
            log.warn("if you are using glob pattern, please set -o for output folder");
            process.exit(1);
        }
    } else if (conf._.length > 1 && conf.o === undefined) {
        log.error("-o not defined");
        log.warn("When using glob pattern for input file, please set -o for output folder");
        process.exit(1);
    }

    const m44Node = new M44Node({
        imageDir: path.join(process.cwd(), conf.imageRepo.imageDir),
        renderLayers: renderLayers
    });
    try {
        await m44Node.initialize();
    } catch(err) {
        throw new Error(`Cannot initialize m44: ${err}`);
    }

    if (conf._.length > 1) {
        for (const matchedPath of conf._) {
            const fileName = matchedPath.split("/").pop();
            if (fileName === undefined) {
                continue;
            }
            try {
                const matchedOutputPath = path.join(outputPath, fileName)
                await m44Node.drawScenario(matchedPath, matchedOutputPath);
                log.info(`scenario output written on disk "${matchedOutputPath}.png"`);
            } catch(err) {
                log.error(`Cannot draw scenario "${fileName}": ${err}`);
            }
        }
    } else {
        await m44Node.drawScenario(inputPath, outputPath);
        log.info(`scenario output written on disk "${outputPath}.png"`);
    }

})();
