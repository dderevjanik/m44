import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { readFileSync } from "fs";
import * as reporters from "io-ts-reporters";
import sharp = require("sharp");
import { Board } from "./models/board";
import { config } from "./config";

const sedData = JSON.parse(readFileSync("../data/sed_data.json").toString()) as SedData;
const testMap = JSON.parse(readFileSync("../data/Across the Meuse - May 13, 1940.m44").toString()) as M44;

const sedDataResult = SedData.decode(sedData);
const testMapResult = M44.decode(testMap);

console.log(reporters.reporter(sedDataResult));
console.log(reporters.reporter(testMapResult));

const board = sedData.editor.board_settings.board_size.list.standard;
const b = new Board({
    boardSize: board,
    boardFace: sedData.editor.board_settings.board_face
});

(async function () {
    const hexCountry = await sharp("../data/countryside.png").resize(
        config.board.hexSize[0],
        config.board.hexSize[1]
    ).toBuffer();

    const s = sharp({
        create: {
            background: { r: 0, g: 0, b: 0 },
            channels: 4,
            height: parseInt(board.height) * 3,
            width: parseInt(board.width) * 3
        }
    });
    // s.composite(testMap.board.hexagons.map(h => {
    //     const hex = b.get(h.row, h.col);
    //     return {
    //         input: hexCountry,
    //         top: parseInt(hex.posY),
    //         left: parseInt(hex.posX)
    //     }
    // }));

    // testMap.board.hexagons.forEach(h => {
    //     const hex = b.get(h.row, h.col);
    //     s.composite([{
    //         input: hexCountry,
    //         top: parseInt(hex.posY),
    //         left: parseInt(hex.posX)
    //     }])
    // });

    s.toFile("output.png");
})();
