import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { readFileSync } from "fs";
import * as reporters from "io-ts-reporters";
import sharp = require("sharp");
import { Board } from "./models/board";
import { config } from "./config";

import log4js from "log4js";
import { App } from "./app";
import { ImageRepo } from "./repo/image-repo";

log4js.configure(config.log4js);
const log = log4js.getLogger("APP");

const sedDataPath = "../data/sed_data.json";
const testMapPath = "../data/Red Barricades Factory.m44";

(async function () {

    const imgRepo = new ImageRepo(config.imageRepo);


    const app = new App(imgRepo, {});
    app.loadSedData(sedDataPath);
    app.loadScenario(testMapPath);
    await app.drawScenario();

    // const hexCountry = await sharp("../data/countryside.png").resize(
    //     config.board.hex_size[0],
    //     config.board.hex_size[1]
    // ).toBuffer();

    // // log.debug("[SHARP] Initializing blank image");
    // const s = sharp({
    //     create: {
    //         background: { r: 0, g: 0, b: 0 },
    //         channels: 4,
    //         height: parseInt(board.height) * 3,
    //         width: parseInt(board.width) * 3
    //     }
    // });
    // // s.composite(testMap.board.hexagons.map(h => {
    // //     const hex = b.get(h.row, h.col);
    // //     return {
    // //         input: hexCountry,
    // //         top: parseInt(hex.posY),
    // //         left: parseInt(hex.posX)
    // //     }
    // // }));

    // // testMap.board.hexagons.forEach(h => {
    // //     const hex = b.get(h.row, h.col);
    // //     s.composite([{
    // //         input: hexCountry,
    // //         top: parseInt(hex.posY),
    // //         left: parseInt(hex.posX)
    // //     }])
    // // });
    // // log.debug("[SHARP] saving to file ./output.png");
    // s.toFile("output.png");
})();
