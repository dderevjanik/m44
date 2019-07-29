import { ImageStorage } from "./types/imagestorage";
import { SedData } from "../types/sed_data";
import { M44 } from "../types/m44";
import { Board, BoardConf } from "./board";
import { IconRepo } from "./utils/icon-repo";
import { IconDict } from "./utils/icon-dict";
import { Measure } from "./types/measure";
import { Renderer } from "./types/renderer";
import { Scenario } from "./scenario";
import { BoardBackground } from "./board-background";
import { BoardType, boardTypes } from "./types/board-type";
import { backgroundIcons } from "./types/icons";

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

    async drawScenario(m44: M44): Promise<RES> {
        console.log("[APP] drawing scenario");
        let boardType: BoardType = boardTypes[m44.board.type];

        const boardBackground = new BoardBackground({
            boardFace: m44.board.face,
            boardSize: boardType.size,
            boardType: m44.board.type
        });

        const board = new Board(boardBackground, {
            boardSize: this._sedData!.editor.board_settings.board_size.list[boardType.short]
        });

        const scenario = new Scenario(board, m44);
        const sedData = this._sedData;

        if (sedData === null || scenario === null) {
            console.error("[APP] Please intialize both sedData and scenario before drawScenario()");
            throw new Error("data_or_scenario_not_initialized");
        }

        // Gather information


        const scenInfo = scenario.info();


        console.log("[APP] creating dictionary of all icons with their names");
        const iconDict = new IconDict();

        console.log("[APP] creating background dictionary");
        for (const [background, backgroundIcon] of Object.entries(backgroundIcons)) {
            iconDict.set(background, backgroundIcon);
        }

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
        console.log("[APP] creating iconRepo");
        const iconRepo = new IconRepo(this._imageRepo, iconDict);

        console.log("[APP] preparing rendered");
        const renderer = this._renderer;
        await renderer.loadFont("32px Arial");
        await renderer.resize(boardType.size[0], boardType.size[1]);

        if (this._conf.renderLayers.includes("lines")) {
            console.log("[APP] Drawing lines");
            const firstHex = scenario.getHex(0, 8);
            const secondHex = scenario.getHex(0, 18);
            const bottomHex = scenario.getHex(8, 8);

            const l1x = firstHex.posX;
            const l2x = secondHex.posX;

            const y1 = firstHex.posY;
            const y2 = bottomHex.posY + this._conf.board.hex_size[1];

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
        console.log("[APP] Starting rendering...");
        this._measure.start();
        for (const hex of scenario.allHexes()) {
            if (hex.data.terrain) {
                const terrainImg = await iconRepo.getRotated(hex.data.terrain.name, hex.data.terrain.orientation);
                await renderer.renderImage(terrainImg, hex.posX, hex.posY);

            } else {
                const backgroundImg = await iconRepo.get(hex.background);
                await renderer.renderImage(backgroundImg, hex.posX, hex.posY);

                if (hex.data.rect_terrain && this._conf.renderLayers.includes("rect_terrain")) {
                    const rectTerrainImg = await iconRepo.get(hex.data.rect_terrain.name);
                    await renderer.renderImage(rectTerrainImg, hex.posX, hex.posY);
                }
                if (hex.data.obstacle && this._conf.renderLayers.includes("obstacle")) {
                    const obstacleImg = await iconRepo.get(hex.data.obstacle.name);
                    await renderer.renderImage(obstacleImg, hex.posX, hex.posY);
                }
                if (hex.data.unit && this._conf.renderLayers.includes("unit")) {
                    const unitImg = await iconRepo.get(hex.data.unit.name);
                    await renderer.renderImage(unitImg, hex.posX, hex.posY);
                    if (hex.data.unit.badge && this._conf.renderLayers.includes("badge")) {
                        const badgeImg = await iconRepo.get(hex.data.unit.badge);
                        await renderer.renderImage(badgeImg, hex.posX, hex.posY);
                    }
                }
                // if (hex.data.tags && this._conf.renderLayers.includes("tags")) {
                //     const tagsImg = await iconRepo.get(hex.data.tags.name);
                //     await renderer.renderImage(tagsImg, hex.posX, hex.posY);
                // }
            }
        }

        // if (this._conf.renderLayers.includes("label")) {
        //     for (const label of scenario.board.labels) {
        //         const hex = board.get(label.row, label.col);
        //         await renderer.renderText(
        //             label.text.join("\n"),
        //             parseInt(hex.posX),
        //             parseInt(hex.posY),
        //             188,
        //             217
        //         );
        //     }
        // }
        console.log(`[APP] scenario rendered successfully in ${this._measure.end()}ms`);

        // Finish

        const resultImg = await renderer.getResult();
        return resultImg;
    }
}
