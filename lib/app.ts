import log4js, { Logger } from "log4js";
import Jimp from "jimp";
import fs, { readFileSync, readFile } from "fs";
import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { ImageRepo } from "./repo/image-repo";
import { Board } from "./models/board";
import { config, Config } from "./config";
import { fileLoader } from "./utils/file-loader";
import { IconRepo } from "./utils/icon-repo";
import { IconDict } from "./utils/icon-dict";
import { NodeMeasure } from "./modules/node-measure";

import { JimpRender } from "./modules/jimp-render";
import { NodeCanvasRender } from "./modules/node-canvas-render";

const log = log4js.getLogger("APP");

export interface AppConf extends Config {

}

export class App {

    _imageRepo: ImageRepo;
    _conf: AppConf;

    _sedData: SedData | null;
    _scenario: M44 | null;

    constructor(imageRepo: ImageRepo, conf: AppConf) {
        this._sedData = null;
        this._scenario = null;

        this._conf = conf;
        this._imageRepo = imageRepo;
    }

    loadSedData(filePath: string) {
        const measure = new NodeMeasure();
        const sedData = fileLoader(filePath, SedData);
        this._sedData = sedData;
        log.info(`SedData loaded and decoded successfully in ${measure.end()}ms`);
    }

    loadScenario(filePath: string) {
        const measure = new NodeMeasure();
        const scenario = fileLoader(filePath, M44);
        this._scenario = scenario;
        log.info(`Scenario loaded and decoded successfully in ${measure.end()}ms`);
    }

    async drawScenario(outputPath: string) {
        const { _conf } = this;

        log.debug("drawing scenario");
        const sedData = this._sedData;
        const scenario = this._scenario;

        if (sedData === null || scenario === null) {
            log.error("Please intialize both sedData and scenario before drawScenario()");
            throw new Error("data_or_scenario_not_initialized");
        }

        const board = new Board({
            boardFace: sedData.editor.board_settings.board_face,
            boardSize: sedData.editor.board_settings.board_size.list.standard
        });

        const size = config.board.board_sizes.standartd;

        log.debug("creating dictionary of all icons with their names");
        const iconDict = new IconDict();

        log.debug("creating terrain dictionary");
        for (const category of sedData.editor.terrain.item) {
            for (const terrain of category.list.item) {
                iconDict.set(terrain.name, terrain.icon);
            }
        }

        log.debug("creating unit dictionary");
        for (const category of sedData.editor.unit.item) {
            for (const unit of category.list.item) {
                iconDict.set(unit.name, unit.icon);
            }
        }

        log.debug("creating obstacle dictionary");
        for (const category of sedData.editor.obstacle.item) {
            for (const obstacle of category.list.item) {
                iconDict.set(obstacle.name, obstacle.icon);
            }
        }

        log.debug("creating marker dictionary");
        for (const category of sedData.editor.marker.item) {
            for (const marker of category.list.item) {
                iconDict.set(marker.name, marker.icon);
            }
        }

        log.debug("creating badge dictionary");
        for (const badge of sedData.editor.badges.item) {
            iconDict.set(badge.name, badge.icon);
        }

        const iconRepo = new IconRepo(this._imageRepo, iconDict);

        // const renderer = new JimpRender();
        const renderer = new NodeCanvasRender();
        await renderer.loadFont("32px Arial");
        await renderer.resize(size[0], size[1]);

        async function fillBck(img: Buffer) {
            for (const hexagon of board.all()) {
                await renderer.renderImage(
                    img,
                    parseFloat(hexagon.posX),
                    parseFloat(hexagon.posY)
                );
            }
        }

        const fillMs = new NodeMeasure();
        switch(scenario.board.face) {
            case "BEACH": {
                const img = readFileSync("../data/beach.png");
                await fillBck(img);
                break;
            }
            case "COUNTRY": {
                const img = readFileSync("../data/countryside.png");
                await fillBck(img);
                break;
            }
            case "DESERT": {
                const img = readFileSync("../data/sand.png");
                await fillBck(img);
                break;
            }
            case "WINTER": {
                const img = readFileSync("../data/snow.png");
                await fillBck(img);
                break;
            }
            default: {
                throw new Error(`Undefined board face "${scenario.board.face}"`);
            }
        }
        const outlineImg = readFileSync("../data/outline.png");
        await fillBck(outlineImg);
        log.info(`Background tiles rendered in ${fillMs.end()}ms`);

        const renderLayers: string[] = _conf.l
            ? _conf.l.split(",")
            : ["terrain", "rect_terrain", "obstacle", "tags", "unit", "label", "badge", "lines"];

        if (renderLayers.includes("lines")) {
            const firstHex = board.get(0, 8);
            const secondHex = board.get(0, 18)

            const l1 = parseFloat(firstHex.posX);
            const l2 = parseFloat(secondHex.posX);

            // const rightLine = board.get(0, 9);
            await renderer.renderDashedLine(l1, 0, l1, 900, {
                length: 12,
                step: 3,
                width: 3,
                style: "rgba(178, 34, 34, 0.8)"
            });
            await renderer.renderDashedLine(l2, 0, l2, 900, {
                length: 12,
                step: 8,
                width: 3,
                style: "rgba(178, 34, 34, 0.8)"
            });
        }

        const renderMs = new NodeMeasure();
        for (const hex of scenario.board.hexagons) {
            const { row, col } = hex;
            const { posX, posY } = board.get(row, col);
            const x = parseFloat(posX); const y = parseFloat(posY);

            if (hex.terrain && renderLayers.includes("terrain")) {
                const img = await iconRepo.getRotated(hex.terrain.name, hex.terrain.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.rect_terrain && renderLayers.includes("rect_terrain")) {
                const img = await iconRepo.getRotated(hex.rect_terrain.name, hex.rect_terrain.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.obstacle && renderLayers.includes("obstacle")) {
                const img = await iconRepo.getRotated(hex.obstacle.name, hex.obstacle.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.tags && renderLayers.includes("tags")) {
                for (const tag of hex.tags) {
                    const img = await iconRepo.get(tag.name);
                    await renderer.renderImage(img, x, y);
                }
            }
            if (hex.unit && renderLayers.includes("unit")) {
                const img = await iconRepo.get(hex.unit.name);
                await renderer.renderImage(img, x, y);
            }
            if (hex.unit && hex.unit.badge && renderLayers.includes("badge")) {
                const img = await iconRepo.get(hex.unit.badge);
                await renderer.renderImage(img, x, y);
            }
        }
        if (renderLayers.includes("label")) {
            for (const label of scenario.board.labels) {
                const hex = board.get(label.row, label.col);
                await renderer.renderText(
                    label.text.join("\n"),
                    parseInt(hex.posX),
                    parseInt(hex.posY),
                    188,
                    217
                );
            }
        }
        log.info(`scenario rendered successfully in ${renderMs.end()}ms`);

        const resultImg = await renderer.getResult();
        fs.writeFileSync(`${outputPath}.png`, resultImg);
        log.info(`scenario output written on disk "${outputPath}.png"`);
    }
}
