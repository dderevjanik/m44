import { ImageStorage } from "./types/imagestorage";
import { SedData } from "./models/sed_data";
import { M44 } from "../types/m44";
import { Board } from "../types/board";
import { IconRepo } from "./utils/icon-repo";
import { IconDict } from "./utils/icon-dict";
import { Measure } from "./types/measure";
import { Renderer } from "./types/renderer";

export interface AppConf {
    renderLayers: string[]
    board: {
        hex_size: [number, number];
        unitTL: [number, number];
        tag_offset: [number, number];
        badge_size: [number, number];
        background_color: [number, number, number],
        border_color: [number, number, number],
        border_width: number,
        margin: [number, number, number, number],
        dash_color: [number, number, number],
        dash_length: [number, number],
        dash_width: number,
        board_sizes: {
            standartd: [number, number],
            overlord: [number, number],
            brkthru: [number, number]
        },
        layers: [
            "terrain",
            "lines",
            "rect_terrain",
            "obstacle",
            "unit",
            "badge",
            "tags",
            "label"
        ]
    }
}

export class App<IMG, RES> {

    _imageRepo: ImageStorage<IMG>;
    _sedData: SedData | null;
    _measure: Measure;
    _renderer: Renderer<IMG, RES>;
    _conf: AppConf;

    constructor(
        sedData: SedData,
        measure: Measure,
        renderer: Renderer<IMG, RES>,
        imageRepo: ImageStorage<IMG>,
        conf: AppConf
    ) {
        this._sedData = sedData;
        this._measure = measure;
        this._renderer = renderer;
        this._imageRepo = imageRepo;
        this._conf = conf;
    }

    async drawScenario(scenario: M44): Promise<RES> {
        console.log("[APP] drawing scenario");
        const sedData = this._sedData;

        if (sedData === null || scenario === null) {
            console.error("[APP] Please intialize both sedData and scenario before drawScenario()");
            throw new Error("data_or_scenario_not_initialized");
        }

        // Gather information

        const board = new Board({
            boardFace: sedData.editor.board_settings.board_face,
            boardSize: sedData.editor.board_settings.board_size.list.standard
        });

        const size = this._conf.board.board_sizes.standartd;

        console.log("[APP] creating dictionary of all icons with their names");
        const iconDict = new IconDict();

        console.log("[APP] creating terrain dictionary");
        for (const category of sedData.editor.terrain.item) {
            for (const terrain of category.list.item) {
                iconDict.set(terrain.name, terrain.icon);
            }
        }

        console.log("[APP] creating unit dictionary");
        for (const category of sedData.editor.unit.item) {
            for (const unit of category.list.item) {
                iconDict.set(unit.name, unit.icon);
            }
        }

        console.log("[APP] creating obstacle dictionary");
        for (const category of sedData.editor.obstacle.item) {
            for (const obstacle of category.list.item) {
                iconDict.set(obstacle.name, obstacle.icon);
            }
        }

        console.log("[APP] creating marker dictionary");
        for (const category of sedData.editor.marker.item) {
            for (const marker of category.list.item) {
                iconDict.set(marker.name, marker.icon);
            }
        }

        console.log("[APP] creating badge dictionary");
        for (const badge of sedData.editor.badges.item) {
            iconDict.set(badge.name, badge.icon);
        }

        // Prepare repo and renderer

        const iconRepo = new IconRepo(this._imageRepo, iconDict);

        const renderer = this._renderer;
        await renderer.loadFont("32px Arial");
        await renderer.resize(size[0], size[1]);

        async function fillBck(img: IMG) {
            for (const hexagon of board.all()) {
                await renderer.renderImage(
                    img,
                    parseFloat(hexagon.posX),
                    parseFloat(hexagon.posY)
                );
            }
        }

        // Pre-fill background

        this._measure.start();
        switch(scenario.board.face) {
            case "BEACH": {
                const img = await this._imageRepo.get("beach.png");
                await fillBck(img);
                break;
            }
            case "COUNTRY": {
                const img = await this._imageRepo.get("countryside.png");
                await fillBck(img);
                break;
            }
            case "DESERT": {
                const img = await this._imageRepo.get("sand.png");
                await fillBck(img);
                break;
            }
            case "WINTER": {
                const img = await this._imageRepo.get("snow.png");
                await fillBck(img);
                break;
            }
            default: {
                throw new Error(`Undefined board face "${scenario.board.face}"`);
            }
        }
        const outlineImg = await this._imageRepo.get("outline.png");
        await fillBck(outlineImg);
        console.log(`[APP] Background tiles rendered in ${this._measure.end()}ms`);

        if (this._conf.renderLayers.includes("lines")) {
            const firstHex = board.get(0, 8);
            const secondHex = board.get(0, 18);
            const bottomHex = board.get(8, 8);

            const l1x = parseFloat(firstHex.posX);
            const l2x = parseFloat(secondHex.posX);

            const y1 = parseFloat(firstHex.posY);
            const y2 = parseFloat(bottomHex.posY) + this._conf.board.hex_size[1];

            // const rightLine = board.get(0, 9);
            await renderer.renderDashedLine(l1x, y1, l1x, y2, {
                length: 12,
                step: 8,
                width: 4,
                style: "rgba(178, 34, 34, 0.8)"
            });
            await renderer.renderDashedLine(l2x, y1, l2x, y2, {
                length: 12,
                step: 8,
                width: 4,
                style: "rgba(178, 34, 34, 0.8)"
            });
        }

        // Render Layers

        this._measure.start();
        for (const hex of scenario.board.hexagons) {
            const { row, col } = hex;
            const { posX, posY } = board.get(row, col);
            const x = parseFloat(posX); const y = parseFloat(posY);

            if (hex.terrain && this._conf.renderLayers.includes("terrain")) {
                const img = await iconRepo.getRotated(hex.terrain.name, hex.terrain.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.rect_terrain && this._conf.renderLayers.includes("rect_terrain")) {
                const img = await iconRepo.getRotated(hex.rect_terrain.name, hex.rect_terrain.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.obstacle && this._conf.renderLayers.includes("obstacle")) {
                const img = await iconRepo.getRotated(hex.obstacle.name, hex.obstacle.orientation);
                await renderer.renderImage(img, x, y);
            }
            if (hex.tags && this._conf.renderLayers.includes("tags")) {
                for (const tag of hex.tags) {
                    const img = await iconRepo.get(tag.name);
                    await renderer.renderImage(img, x, y);
                }
            }
            if (hex.unit && this._conf.renderLayers.includes("unit")) {
                const img = await iconRepo.get(hex.unit.name);
                await renderer.renderImage(img, x, y);
            }
            if (hex.unit && hex.unit.badge && this._conf.renderLayers.includes("badge")) {
                const img = await iconRepo.get(hex.unit.badge);
                await renderer.renderImage(img, x, y);
            }
        }
        if (this._conf.renderLayers.includes("label")) {
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
        console.log(`[APP] scenario rendered successfully in ${this._measure.end()}ms`);

        // Finish

        const resultImg = await renderer.getResult();
        return resultImg;
    }
}
