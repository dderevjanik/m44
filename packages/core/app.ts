import { ImageStorage } from "./types/imagestorage";
import { SedData } from "../types/sed_data";
import { M44 } from "../types/m44";
import { Board, BoardConf } from "../types/board";
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
            "background",
            "outlines",
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


        const boardType = scenario.board.type;

        let boardSize: BoardConf["boardSize"];
        let size: [number, number];
        switch (boardType) {
            case "STANDARD": {
                size = this._conf.board.board_sizes.standartd;
                boardSize = sedData.editor.board_settings.board_size.list.standard;
                break;
            }
            case "OVERLORD": {
                size = this._conf.board.board_sizes.overlord;
                boardSize = sedData.editor.board_settings.board_size.list.overlord;
                break;
            }
            case "BRKTHRU": {
                size = this._conf.board.board_sizes.brkthru;
                boardSize = sedData.editor.board_settings.board_size.list.brkthru;
                break;
            }
            default: {
                throw new Error(`Uknown board type "${boardType}"`);
            }
        }

        const board = new Board({
            boardFace: sedData.editor.board_settings.board_face,
            boardSize: boardSize
        });

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

        async function fillRow(row: number, imgs: [IMG, IMG]) {
            const hexagons = board.getRow(row);
            for (let i = 0; i < hexagons.length; i++) {
                const hexagon = hexagons[i];
                await renderer.renderImage(
                    imgs[i % 2],
                    parseFloat(hexagon.posX),
                    parseFloat(hexagon.posY)
                );
            }
        }

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

        if (this._conf.renderLayers.includes("background")) {
            this._measure.start();
            switch (scenario.board.face) {
                case "BEACH": {
                    // country
                    const imgCountry1_1 = await this._imageRepo.get("h_country-1-1.png");
                    const imgCountry1_2 = await this._imageRepo.get("h_country-1-2.png");
                    // country - beach
                    const imgBeach1_2_1 = await this._imageRepo.get("h_beach1-2-1.png");
                    const imgBeach1_2_2 = await this._imageRepo.get("h_beach1-2-2.png");
                    // beach 1
                    const imgBeach1_3_1 = await this._imageRepo.get("h_beach1-3-1.png");
                    const imgBeach1_3_2 = await this._imageRepo.get("h_beach1-3-2.png");
                    // beach 2
                    const imgBeach1_4_1 = await this._imageRepo.get("h_beach1-4-1.png");
                    const imgBeach1_4_2 = await this._imageRepo.get("h_beach1-4-2.png");
                    // beach - sea
                    const imgBeach1_5_1 = await this._imageRepo.get("h_beach1-5-1.png");
                    const imgBeach1_5_2 = await this._imageRepo.get("h_beach1-5-2.png");
                    // sea
                    const imgSea1_6_1 = await this._imageRepo.get("h_sea1-6-1.png");
                    const imgSea1_6_2 = await this._imageRepo.get("h_sea1-6-2.png");
                    // deep sea
                    const imgSea1_7_1 = await this._imageRepo.get("h_sea1-7-1.png");
                    const imgSea1_7_2 = await this._imageRepo.get("h_sea1-7-2.png");

                    if (boardType === "BRKTHRU") {
                        await fillRow(0, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(1, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(2, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(3, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(4, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(5, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(6, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(7, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(8, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(9, [imgCountry1_1, imgCountry1_2]);

                        await fillRow(10, [imgBeach1_2_1, imgBeach1_2_2]);
                        await fillRow(11, [imgBeach1_3_1, imgBeach1_3_2]);
                        await fillRow(12, [imgBeach1_4_1, imgBeach1_4_2]);
                        await fillRow(13, [imgBeach1_5_1, imgBeach1_5_2]);

                        await fillRow(14, [imgSea1_6_1, imgSea1_6_2]);
                        await fillRow(15, [imgSea1_7_1, imgSea1_7_2]);
                        await fillRow(16, [imgSea1_7_1, imgSea1_7_2]);
                    } else {
                        await fillRow(0, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(1, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(2, [imgCountry1_1, imgCountry1_2]);
                        await fillRow(3, [imgBeach1_2_1, imgBeach1_2_2]);
                        await fillRow(4, [imgBeach1_3_1, imgBeach1_3_2]);
                        await fillRow(5, [imgBeach1_4_1, imgBeach1_4_2]);
                        await fillRow(6, [imgBeach1_5_1, imgBeach1_5_2]);
                        await fillRow(7, [imgSea1_6_1, imgSea1_6_2]);
                        await fillRow(8, [imgSea1_7_1, imgSea1_7_2]);
                    }
                    break;
                }
                case "COUNTRY": {
                    const imgCntry10_1 = await this._imageRepo.get("h_country-10-1.png");
                    const imgCntry10_2 = await this._imageRepo.get("h_country-10-2.png");
                    const imgCntry11_1 = await this._imageRepo.get("h_country-11-1.png");
                    const imgCntry11_2 = await this._imageRepo.get("h_country-11-2.png");
                    const imgCntry12_1 = await this._imageRepo.get("h_country-12-1.png");
                    const imgCntry12_2 = await this._imageRepo.get("h_country-12-2.png");

                    await fillRow(0, [imgCntry10_1, imgCntry10_2]);
                    await fillRow(1, [imgCntry11_1, imgCntry11_2]);
                    await fillRow(2, [imgCntry12_1, imgCntry12_2]);
                    await fillRow(3, [imgCntry10_1, imgCntry10_2]);
                    await fillRow(4, [imgCntry11_1, imgCntry11_2]);
                    await fillRow(5, [imgCntry12_1, imgCntry12_2]);
                    await fillRow(6, [imgCntry10_1, imgCntry10_2]);
                    await fillRow(7, [imgCntry11_1, imgCntry11_2]);
                    await fillRow(8, [imgCntry12_1, imgCntry12_2]);
                    if (boardType === "BRKTHRU") {
                        await fillRow(9, [imgCntry10_1, imgCntry10_2]);
                        await fillRow(10, [imgCntry11_1, imgCntry11_2]);
                        await fillRow(11, [imgCntry12_1, imgCntry12_2]);
                        await fillRow(12, [imgCntry10_1, imgCntry10_2]);
                        await fillRow(13, [imgCntry11_1, imgCntry11_2]);
                        await fillRow(14, [imgCntry12_1, imgCntry12_2]);
                        await fillRow(15, [imgCntry10_1, imgCntry10_2]);
                        await fillRow(16, [imgCntry11_1, imgCntry11_2]);
                    }
                    break;
                }
                case "DESERT": {
                    const imgDesert1_1 = await this._imageRepo.get("h_desert-1-1.png");
                    const imgDesert1_2 = await this._imageRepo.get("h_desert-1-2.png");
                    const imgDesert2_1 = await this._imageRepo.get("h_desert-2-1.png");
                    const imgDesert2_2 = await this._imageRepo.get("h_desert-2-2.png");
                    const imgDesert3_1 = await this._imageRepo.get("h_desert-3-1.png");
                    const imgDesert3_2 = await this._imageRepo.get("h_desert-3-2.png");

                    await fillRow(0, [imgDesert1_1, imgDesert1_2]);
                    await fillRow(1, [imgDesert2_1, imgDesert2_2]);
                    await fillRow(2, [imgDesert3_1, imgDesert3_2]);
                    await fillRow(3, [imgDesert1_1, imgDesert1_2]);
                    await fillRow(4, [imgDesert2_1, imgDesert2_2]);
                    await fillRow(5, [imgDesert3_1, imgDesert3_2]);
                    await fillRow(6, [imgDesert1_1, imgDesert1_2]);
                    await fillRow(7, [imgDesert2_1, imgDesert2_2]);
                    await fillRow(8, [imgDesert3_1, imgDesert3_2]);
                    if (boardType === "BRKTHRU") {
                        await fillRow(9, [imgDesert1_1, imgDesert1_2]);
                        await fillRow(10, [imgDesert2_1, imgDesert2_2]);
                        await fillRow(11, [imgDesert3_1, imgDesert3_2]);
                        await fillRow(12, [imgDesert1_1, imgDesert1_2]);
                        await fillRow(13, [imgDesert2_1, imgDesert2_2]);
                        await fillRow(14, [imgDesert3_1, imgDesert3_2]);
                        await fillRow(15, [imgDesert1_1, imgDesert1_2]);
                        await fillRow(16, [imgDesert2_1, imgDesert2_2]);
                    }
                    break;
                }
                case "WINTER": {
                    const imgWinter1_1 = await this._imageRepo.get("h_winter-1-1.png");
                    const imgWinter1_2 = await this._imageRepo.get("h_winter-1-2.png");
                    const imgWinter2_1 = await this._imageRepo.get("h_winter-2-1.png");
                    const imgWinter2_2 = await this._imageRepo.get("h_winter-2-2.png");
                    const imgWinter3_1 = await this._imageRepo.get("h_winter-3-1.png");
                    const imgWinter3_2 = await this._imageRepo.get("h_winter-3-2.png");

                    await fillRow(0, [imgWinter1_1, imgWinter1_2]);
                    await fillRow(1, [imgWinter2_1, imgWinter2_2]);
                    await fillRow(2, [imgWinter3_1, imgWinter3_2]);
                    await fillRow(3, [imgWinter1_1, imgWinter1_2]);
                    await fillRow(4, [imgWinter2_1, imgWinter2_2]);
                    await fillRow(5, [imgWinter3_1, imgWinter3_2]);
                    await fillRow(6, [imgWinter1_1, imgWinter1_2]);
                    await fillRow(7, [imgWinter2_1, imgWinter2_2]);
                    await fillRow(8, [imgWinter3_1, imgWinter3_2]);
                    if (boardType === "BRKTHRU") {
                        await fillRow(9, [imgWinter1_1, imgWinter1_2]);
                        await fillRow(10, [imgWinter2_1, imgWinter2_2]);
                        await fillRow(11, [imgWinter3_1, imgWinter3_2]);
                        await fillRow(12, [imgWinter1_1, imgWinter1_2]);
                        await fillRow(13, [imgWinter2_1, imgWinter2_2]);
                        await fillRow(14, [imgWinter3_1, imgWinter3_2]);
                        await fillRow(15, [imgWinter1_1, imgWinter1_2]);
                        await fillRow(16, [imgWinter2_1, imgWinter2_2]);
                    }

                    break;
                }
                default: {
                    throw new Error(`Undefined board face "${scenario.board.face}"`);
                }
            }
            if (this._conf.renderLayers.includes("outlines")) {
                const outlineImg = await this._imageRepo.get("outline.png");
                await fillBck(outlineImg);
            }

            console.log(`[APP] Background tiles rendered in ${this._measure.end()}ms`);
        }

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
