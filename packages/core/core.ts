import { ImageStorage } from "./types/imagestorage";
import { SedData } from "../shared/sed_data";
import { M44 } from "../shared/m44";
import { Board } from "./board";
import { IconRepo } from "./utils/icon-repo";
import { Measure } from "./types/measure";
import { Renderer } from "./types/renderer";
import { Scenario } from "./scenario";
import { BackgroundPattern } from "./background-pattern";
import { backgroundIcons } from "./types/icons";
import { BoardSizes, BoardSize } from "../shared/board_size";
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

    // @ts-ignore
    _iconRepo: IconRepo<IMG>;

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

    initIcons() {
        console.log("[APP] creating dictionary of all icons with their names");
        const sedData = this._sedData;
        if (sedData === null) {
            console.error("[APP] Please intialize sedData before initIcons()");
            throw new Error("seddata_not_initialized");
        }
        const iconDict: Map<string, string> = getImagesDict(sedData);
        for (const [background, backgroundIcon] of Object.entries(backgroundIcons)) {
            iconDict.set(background, backgroundIcon);
        }

        this._iconRepo = new IconRepo(this._imageRepo, iconDict);
    }

    async renderBoard(canvas: Renderer<IMG, RES>, conf: {
        size: "STANDARD" | "OVERLORD" | "BRKTHRU",
        face: "WINTER" | "BEACH" | "COUNTRY" | "DESERT"
    }): Promise<void> {
        console.log(`[APP] Drawing board with '${conf.size}' size and with '${conf.face}' face`);
        const iconRepo = this._iconRepo;
        const boardSize: BoardSize = this._boardSizes[conf.size];
        const boardBackground = new BackgroundPattern({
            face: conf.face,
            size: conf.size,
            width: boardSize.width,
            height: boardSize.height
        });
        const board = new Board(this._boardSizes, {
            face: conf.face,
            size: conf.size
        });

        await canvas.resize(boardSize.rWidth, boardSize.rHeight);
        for (const hexagon of board.all()) {
            const background = boardBackground.getBackground(hexagon.row, Math.floor(hexagon.col / 2));
            const backgroundImg = await iconRepo.get(background);
            await canvas.renderImage(backgroundImg, hexagon.posX, hexagon.posY);
        }
    }

    async drawScenario(canvas: Renderer<IMG, RES>, m44: M44): Promise<void> {
        console.log("[APP] drawing scenario");
        const iconRepo = this._iconRepo;
        if (iconRepo === undefined) {
            console.error("[APP] initIcons() not initialized");
            throw new Error("init_iconss_not_initialized");
        }
        const scenarioSize = m44.board.type;
        const boardSize: BoardSize = this._boardSizes[scenarioSize];

        const boardBackground = new BackgroundPattern({
            face: m44.board.face,
            size: m44.board.type,
            width: boardSize.width,
            height: boardSize.height
        });

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

        // Render Layers
        console.log("[APP] Starting rendering...");
        this._measure.start();
        for (const hexagon of board.all()) {
            const scenarioHex = scenario.getHex(hexagon.row, hexagon.col);
            if (scenarioHex.data.terrain) {
                // render terrain instead of background
                const terrainImg = await iconRepo.getRotated(scenarioHex.data.terrain.name, scenarioHex.data.terrain.orientation);
                await canvas.renderImage(terrainImg, hexagon.posX, hexagon.posY);
            }
            if (scenarioHex.data) {
                if (scenarioHex.data.rect_terrain && this._conf.renderLayers.includes("rect_terrain")) {
                    const rectTerrainImg = await iconRepo.getRotated(scenarioHex.data.rect_terrain.name, scenarioHex.data.rect_terrain.orientation);
                    await canvas.renderImage(rectTerrainImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.obstacle && this._conf.renderLayers.includes("obstacle")) {
                    const obstacleImg = await iconRepo.getRotated(scenarioHex.data.obstacle.name, scenarioHex.data.obstacle.orientation);
                    await canvas.renderImage(obstacleImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.unit && this._conf.renderLayers.includes("unit")) {
                    const unitImg = await iconRepo.get(scenarioHex.data.unit.name);
                    await canvas.renderImage(unitImg, hexagon.posX, hexagon.posY);
                    if (scenarioHex.data.unit.badge && this._conf.renderLayers.includes("badge")) {
                        const badgeImg = await iconRepo.get(scenarioHex.data.unit.badge);
                        await canvas.renderImage(badgeImg, hexagon.posX, hexagon.posY);
                    }
                }
                // if (hex.data.tags && this._conf.renderLayers.includes("tags")) {
                //     const tagsImg = await iconRepo.get(hex.data.tags.name);
                //     await renderer.renderImage(tagsImg, hex.posX, hex.posY);
                // }
            }
        }
        if (this._conf.renderLayers.includes("lines")) {
            console.log("[APP] Drawing lines");
            for (const line of boardSize.lines) {
                await canvas.renderDashedLine(line[0], line[1], line[2], line[3], {
                    length: 12,
                    step: 8,
                    width: 4,
                    style: "rgba(178, 34, 34, 0.8)"
                });
            }
        }

        console.log(`[APP] scenario rendered successfully in ${this._measure.end()}ms`);
    }
}
