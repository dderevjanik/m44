import { ImageStorage } from "./types/imagestorage";
import { SedData } from "../types/sed_data";
import { M44 } from "../types/m44";
import { Board } from "./board";
import { IconRepo } from "./utils/icon-repo";
import { Measure } from "./types/measure";
import { Renderer } from "./types/renderer";
import { Scenario } from "./scenario";
import { BackgroundPattern } from "./background-pattern";
import { backgroundIcons } from "./types/icons";
import { BoardSizes, BoardSize } from "../types/board_size";
import { getImagesDict } from "./utils/get-images-dict";

export interface CoreConf {
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

export class Core<IMG, RES> {

    _imageRepo: ImageStorage<IMG>;
    _sedData: SedData;
    _boardSizes: BoardSizes;
    _measure: Measure;
    _renderer: Renderer<IMG, RES>;
    _conf: CoreConf;

    constructor(
        sedData: SedData,
        boardSizes: BoardSizes,
        measure: Measure,
        renderer: Renderer<IMG, RES>,
        imageRepo: ImageStorage<IMG>,
        conf: CoreConf
    ) {
        this._sedData = sedData;
        this._boardSizes = boardSizes;
        this._measure = measure;
        this._renderer = renderer;
        this._imageRepo = imageRepo;
        this._conf = conf;
    }

    async drawScenario(m44: M44): Promise<RES> {
        console.log("[APP] drawing scenario");
        const scenarioSize = m44.board.type;
        const boardSize: BoardSize = this._boardSizes[scenarioSize];

        const boardBackground = new BackgroundPattern({
            face: m44.board.face,
            size: m44.board.type,
            width: boardSize.width,
            height: boardSize.height
        });

        // const board = new Board({
        //     boardSize: this._sedData!.editor.board_settings.board_size.list[boardType.short]
        // });
        const board = new Board(this._boardSizes, {
            face: m44.board.face,
            size: m44.board.type
        });

        const scenario = new Scenario(board, m44);
        const sedData = this._sedData;

        if (sedData === null || scenario === null) {
            console.error("[APP] Please intialize both sedData and scenario before drawScenario()");
            throw new Error("data_or_scenario_not_initialized");
        }

        // Gather information

        console.log("[APP] creating dictionary of all icons with their names");
        const iconDict: Map<string, string> = getImagesDict(sedData);
        for (const [background, backgroundIcon] of Object.entries(backgroundIcons)) {
            iconDict.set(background, backgroundIcon);
        }

        // writeFileSync("./XXXX.json", JSON.stringify(dict, null, 2));

        const iconRepo = new IconRepo(this._imageRepo, iconDict);

        console.log("[APP] preparing rendered");
        const renderer = this._renderer;
        await renderer.loadFont("32px Arial");
        await renderer.resize(boardSize.rWidth, boardSize.rHeight);

        // if (this._conf.renderLayers.includes("lines")) {
        //     console.log("[APP] Drawing lines");
        //     const firstHex = scenario.getHex(0, 8);
        //     const secondHex = scenario.getHex(0, 18);
        //     const bottomHex = scenario.getHex(8, 8);

        //     const l1x = firstHex.posX;
        //     const l2x = secondHex.posX;

        //     const y1 = firstHex.posY;
        //     const y2 = bottomHex.posY + this._conf.board.hex_size[1];

        //     // const rightLine = board.get(0, 9);
        //     await renderer.renderDashedLine(l1x, y1, l1x, y2, {
        //         length: 12,
        //         step: 8,
        //         width: 4,
        //         style: "rgba(178, 34, 34, 0.8)"
        //     });
        //     await renderer.renderDashedLine(l2x, y1, l2x, y2, {
        //         length: 12,
        //         step: 8,
        //         width: 4,
        //         style: "rgba(178, 34, 34, 0.8)"
        //     });
        // }

        // Render Layers
        console.log("[APP] Starting rendering...");
        this._measure.start();
        for (const hexagon of board.all()) {
            const scenarioHex = scenario.getHex(hexagon.row, hexagon.col);
            if (scenarioHex.data.terrain) {
                const terrainImg = await iconRepo.getRotated(scenarioHex.data.terrain.name, scenarioHex.data.terrain.orientation);
                await renderer.renderImage(terrainImg, hexagon.posX, hexagon.posY);

            } else {
                const background = boardBackground.getBackground(hexagon.row, Math.floor(hexagon.col / 2));
                const backgroundImg = await iconRepo.get(background);
                await renderer.renderImage(backgroundImg, hexagon.posX, hexagon.posY);

                if (scenarioHex.data.rect_terrain && this._conf.renderLayers.includes("rect_terrain")) {
                    const rectTerrainImg = await iconRepo.get(scenarioHex.data.rect_terrain.name);
                    await renderer.renderImage(rectTerrainImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.obstacle && this._conf.renderLayers.includes("obstacle")) {
                    const obstacleImg = await iconRepo.get(scenarioHex.data.obstacle.name);
                    await renderer.renderImage(obstacleImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.unit && this._conf.renderLayers.includes("unit")) {
                    const unitImg = await iconRepo.get(scenarioHex.data.unit.name);
                    await renderer.renderImage(unitImg, hexagon.posX, hexagon.posY);
                    if (scenarioHex.data.unit.badge && this._conf.renderLayers.includes("badge")) {
                        const badgeImg = await iconRepo.get(scenarioHex.data.unit.badge);
                        await renderer.renderImage(badgeImg, hexagon.posX, hexagon.posY);
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
