import log4js, { Logger } from "log4js";
import Jimp from "jimp";
import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { ImageRepo } from "./repo/image-repo";
import { Board } from "./models/board";
import { config, Config } from "./config";
import { fileLoader } from "./utils/file-loader";
import { IconRepo } from "./utils/icon-repo";
import { IconDict } from "./utils/icon-dict";
import { Measure } from "./utils/measure";
import { Renderer } from "./utils/renderer";

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
        const measure = new Measure();
        const sedData = fileLoader(filePath, SedData);
        this._sedData = sedData;
        log.info(`SedData loaded and decoded successfully in ${measure.end()}ms`);
    }

    loadScenario(filePath: string) {
        const measure = new Measure();
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

        const renderer = new Renderer(iconRepo, board, {
            width: size[0],
            height: size[1],
            hexSize: config.board.hex_size
        });
        await renderer.loadFont(Jimp.FONT_SANS_32_BLACK);

        const fillMs = new Measure();
        switch(scenario.board.face) {
            case "BEACH": {
                await renderer.fillBck("../data/countryside.png");
                break;
            }
            case "COUNTRY": {
                await renderer.fillBck("../data/countryside.png");
                break;
            }
            case "DESERT": {
                await renderer.fillBck("../data/sand.png");
                break;
            }
            case "WINTER": {
                await renderer.fillBck("../data/snow.png");
                break;
            }
            default: {
                throw new Error(`Undefined board face "${scenario.board.face}"`);
            }
        }
        await renderer.fillBck("../data/outline.png");
        log.info(`Background tiles rendered in ${fillMs.end()}ms`);

        const renderLayers: string[] = _conf.l
            ? _conf.l.split(",")
            : ["terrain", "rect_terrain", "obstacle", "tags", "unit", "label", "badge"];

        const renderMs = new Measure();
        for (const hex of scenario.board.hexagons) {
            const { row, col } = hex;

            if (hex.terrain && renderLayers.includes("terrain")) {
                await renderer.terrain(hex.terrain, row, col);
            }
            if (hex.rect_terrain && renderLayers.includes("rect_terrain")) {
                await renderer.rectTerrain(hex.rect_terrain, row, col);
            }
            if (hex.obstacle && renderLayers.includes("obstacle")) {
                await renderer.obstacle(hex.obstacle, row, col);
            }
            if (hex.tags && renderLayers.includes("tags")) {
                for (const tag of hex.tags) {
                    await renderer.tags(tag, row, col);
                }
            }
            if (hex.unit && renderLayers.includes("unit")) {
                await renderer.unit(hex.unit, row, col);
            }
            if (hex.unit && hex.unit.badge && renderLayers.includes("badge")) {
                await renderer.badge(hex.unit.badge, row, col);
            }
        }
        if (renderLayers.includes("label")) {
            for (const label of scenario.board.labels) {
                await renderer.label(label);
            }
        }
        log.info(`scenario rendered successfully in ${renderMs.end()}ms`);

        const result = renderer.getResult();
        result.write(`${outputPath}.png`);
        log.info(`scenario output written on disk "${outputPath}.png"`);
    }
}
