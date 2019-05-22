import fs from "fs";
import log4js from "log4js";
import Jimp from "jimp";
import t from "io-ts";
import * as reporters from "io-ts-reporters";
import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { ImageRepo } from "./repo/image-repo";
import { Board } from "./models/board";
import { config } from "./config";

const log = log4js.getLogger("APP");

function replaceAt(str: string, index: number, replacement: string) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

export interface AppConf {

}

export class App {

    _imageRepo: ImageRepo;

    _sedData: SedData | null;
    _scenario: M44 | null;

    constructor(imageRepo: ImageRepo, conf: AppConf) {
        this._sedData = null;
        this._scenario = null;

        this._imageRepo = imageRepo;
    }

    loadSedData(filePath: string) {
        log.debug(`loading sed_data from "${filePath}"`);
        if (!fs.existsSync(filePath)) {
            log.error(`Path is not correct "${filePath}"`);
            throw new Error("incorrect_path");
        }

        let file: Buffer;
        let sedData: SedData;
        try {
            file = fs.readFileSync(filePath);
        } catch(err) {
            log.error(`Cannot read file "${filePath}" \n ${err}`);
            throw new Error("cannot_read_file");
        }

        try {
            sedData = JSON.parse(file.toString());
        } catch(err) {
            log.error(`Cannot parse file "${filePath}"`);
            throw new Error("cannot_parse_file");
        }

        const result = SedData.decode(sedData);
        const report = reporters.reporter(result);
        if (report.length) {
            log.error(`Cannot decode JSON, ${JSON.stringify(report)}`);
            throw new Error("cannot_decode");
        }

        this._sedData = sedData;
        log.info("sedData loaded sucessfully");
    }

    loadScenario(filePath: string) {
        log.debug(`loading scenario file from "${filePath}"`);
        if (!fs.existsSync(filePath)) {
            log.error(`Path is not correct "${filePath}"`);
            throw new Error("incorrect_path");
        }


        let file: Buffer;
        let scenarioData: M44;
        try {
            file = fs.readFileSync(filePath);
        } catch(err) {
            log.error(`Cannot read file "${filePath}" \n ${err}`);
            throw new Error("cannot_read_file");
        }

        try {
            scenarioData = JSON.parse(file.toString());
        } catch(err) {
            log.error(`Cannot parse file "${filePath}"`);
            throw new Error("cannot_parse_file");
        }

        const result = M44.decode(scenarioData);
        const report = reporters.reporter(result);
        if (report.length) {
            log.error(`Cannot decode JSON, ${JSON.stringify(report)}`);
            throw new Error("cannot_decode");
        }

        this._scenario = scenarioData;
        log.info("scenario loaded successfully");
    }

    async drawScenario() {
        log.debug("drawing scenario");
        const sedData = this._sedData;
        const scenario = this._scenario;

        if (sedData === null || scenario === null) {
            throw new Error("not_initialized");
        }

        const board = new Board({
            boardFace: sedData.editor.board_settings.board_face,
            boardSize: sedData.editor.board_settings.board_size.list.standard
        });

        const size = config.board.board_sizes.standartd;

        log.debug("rendering background");
        const bckg = new Jimp(size[0], size[1], "#000");

        log.debug("rendering default hexes");
        const blank = await Jimp.read("../data/snow.png");
        for (const hex of board.all()) {
            await bckg.composite(blank, parseInt(hex.posX), parseInt(hex.posY));
        }

        log.debug("creating terrain->icon dictionary");
        const terrainDict = sedData.editor.terrain.item.reduce((acc1, category) => {
            return {
                ...acc1,
                ...category.list.item.reduce((acc2, terrain) => {
                    return {
                        ...acc2,
                        [terrain.name]: terrain.icon
                    }
                }, {})
            }
        }, {} as { [name: string]: string });

        log.debug('creating unit->icon dictionary');
        const unitDict = sedData.editor.unit.item.reduce((acc1, category) => {
            return {
                ...acc1,
                ...category.list.item.reduce((acc2, unit) => {
                    return {
                        ...acc2,
                        [unit.name]: unit.icon
                    }
                }, {})
            }
        }, {} as { [name: string]: string });

        log.debug('creating obstacle->icon dictionary');
        const obstacleDict = sedData.editor.obstacle.item.reduce((acc1, category) => {
            return {
                ...acc1,
                ...category.list.item.reduce((acc2, obstacle) => {
                    return {
                        ...acc2,
                        [obstacle.name]: obstacle.icon
                    }
                }, {})
            }
        }, {} as { [name: string]: string });

        log.debug('creating tag->icon dictionary');
        const tagDict = sedData.editor.marker.item.reduce((acc1, category) => {
            return {
                ...acc1,
                ...category.list.item.reduce((acc2, tag) => {
                    return {
                        ...acc2,
                        [tag.name]: tag.icon
                    }
                }, {})
            }
        }, {} as { [name: string]: string });

        log.debug('creating badge->icon dictionary');
        const badgeDict = sedData.editor.badges.item.reduce((acc1, badge) => {
            return {
                ...acc1,
                [badge.name]: badge.icon
            };
        }, {} as { [name: string]: string });


        log.debug("loading font");
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        log.debug("rendering scenario tiles");
        const imgRepo = this._imageRepo;
        for (const hex of scenario.board.hexagons) {
            const boardHex = board.get(hex.row, hex.col);
            if (hex.terrain) {
                const icon = terrainDict[hex.terrain.name];
                if (hex.terrain.orientation) {
                    const rotatedIcon = replaceAt(
                        icon,
                        icon.length - 5, // river1.png -> riverX.png
                        hex.terrain.orientation.toString()
                    );

                    const img = await imgRepo.get(rotatedIcon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY));
                } else {
                    const img = await imgRepo.get(icon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY));
                }
            }
            if (hex.rect_terrain) {
                const icon = obstacleDict[hex.rect_terrain.name];
                if (hex.rect_terrain.orientation) {
                    const rotatedIcon = replaceAt(
                        icon,
                        icon.length - 5, // river1.png -> riverX.png
                        hex.rect_terrain.orientation.toString()
                    );

                    const img = await imgRepo.get(rotatedIcon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.7
                    });
                } else {
                    const img = await imgRepo.get(icon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.7
                    });
                }
            }
            if (hex.obstacle) {
                const icon = obstacleDict[hex.obstacle.name];
                if (hex.obstacle.orientation) {
                    const rotatedIcon = replaceAt(
                        icon,
                        icon.length - 5, // river1.png -> riverX.png
                        hex.obstacle.orientation.toString()
                    );

                    const img = await imgRepo.get(rotatedIcon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.7
                    });
                } else {
                    const img = await imgRepo.get(icon);
                    const j = await Jimp.read(img);
                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.7
                    });
                }
            }
            if (hex.tags) {
                for (const tag of hex.tags) {
                    const icon = tagDict[tag.name];
                    const img = await imgRepo.get(icon);
                    const j = await Jimp.read(img);

                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.8
                    });
                }
            }
            if (hex.unit) {
                const icon = unitDict[hex.unit.name];
                const img = await imgRepo.get(icon);
                const j = await Jimp.read(img);

                await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY), {
                    mode: Jimp.BLEND_SOURCE_OVER,
                    opacityDest: 1,
                    opacitySource: 0.6
                });

                if (hex.unit.badge) {
                    const icon = badgeDict[hex.unit.badge];
                    const img = await imgRepo.get(icon);
                    const j = await (await Jimp.read(img)).resize(64, 64);


                    await bckg.composite(j, parseInt(boardHex.posX), parseInt(boardHex.posY) + 48, {
                        mode: Jimp.BLEND_SOURCE_OVER,
                        opacityDest: 1,
                        opacitySource: 0.6
                    });
                }
            }
        }
        log.debug("rendering text");
        for (const label of scenario.board.labels) {
            const boardHex = board.get(label.row, label.col);
            const nx = parseInt(boardHex.posX);
            const ny = parseInt(boardHex.posY);

            await bckg.print(font, nx, ny - 30, {
                text: label.text.join(" "),
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
            }, 188, 217);
        }

        bckg.write("./test.png");
    }
}
