import { M44, M44Hex } from "../shared/m44";
import { GameBoard } from "./board";
import { Renderer } from "./types/renderer";
import { ImageStore } from "./utils/images-repo";

interface ScenarioHex {
    row: number;
    col: number;
    data: {
        terrain?: {
            name: string;
            orientation?: number;
        };
        rect_terrain?: {
            name: string;
            orientation?: number;
        };
        unit?: {
            name: string;
            badge?: string;
            nbr_units?: number;
        };
        obstacle?: {
            name: string;
            orientation?: number;
        };
        tags?: Array<{ name: string; }>;
    }
}

export class Scenario {

    _m44scen: M44;
    _rowToCols: Map<number, Map<number, M44Hex>>;

    _iconRepo: ImageStore<any>;
    _gameBoard: GameBoard;

    constructor(board: GameBoard, m44: M44, iconRepo: ImageStore<any>) {
        this._m44scen = m44;
        this._gameBoard = board;
        this._rowToCols = new Map();
        this._iconRepo = iconRepo;

        for (const hex of m44.board.hexagons) {
            if (this._rowToCols.has(hex.row)) {
                const colHexes = this._rowToCols.get(hex.row);
                colHexes!.set(hex.col, hex);
            } else {
                const colHexes = new Map<number, M44Hex>();
                colHexes.set(hex.col, hex);
                this._rowToCols.set(hex.row, colHexes);
            }
        }
    }

    size(): [number, number] {
        return [
            this._gameBoard._boardSize.width,
            this._gameBoard._boardSize.height
        ];
    }

    sizeR(): [number, number] {
        return [
            this._gameBoard._boardSize.rWidth,
            this._gameBoard._boardSize.rHeight
        ];
    }

    getHex(row: number, col: number): ScenarioHex {
        if (this._rowToCols.has(row)) {
            const colHexes = this._rowToCols.get(row);
            if (colHexes && colHexes.has(col)) {
                const hex = colHexes!.get(col);
                if (hex) {
                    return {
                        col,
                        row,
                        data: hex ? {
                            obstacle: hex!.obstacle,
                            rect_terrain: hex!.rect_terrain,
                            tags: hex!.tags,
                            terrain: hex!.terrain,
                            unit: hex!.unit ? {
                                name: hex!.unit.name,
                                nbr_units: hex!.unit.nbr_units
                                    ? parseInt(hex!.unit.nbr_units, 10)
                                    : undefined,
                                badge: hex!.unit.badge

                            } : undefined
                        } : {}
                    };
                }
            }
        }
        return {
            row,
            col,
            data: {}
        };
    }

    *allHexes(): IterableIterator<ScenarioHex> {
        for (const boardHex of this._gameBoard.all()) {
            const { row, col } = boardHex;
            const iRow = row;
            const iCol = col;
            yield this.getHex(iRow, iCol);
        }
    }

    info() {
        const terrains = new Set<string>();
        const rectTerrains = new Set<string>();
        const units = new Set<string>();
        const badges = new Set<string>();
        const tags = new Set<string>();
        const obstacles = new Set<string>();

        for (const hex of this.allHexes()) {
            if (hex.data.obstacle) {
                obstacles.add(hex.data.obstacle.name);
            }
            if (hex.data.rect_terrain) {
                rectTerrains.add(hex.data.rect_terrain.name);
            }
            if (hex.data.tags) {
                for (const tag of hex.data.tags) {
                    tags.add(tag.name);
                }
            }
            if (hex.data.unit) {
                units.add(hex.data.unit.name);
                if (hex.data.unit.badge) {
                    badges.add(hex.data.unit.badge);
                }
            }
            if (hex.data.terrain) {
                terrains.add(hex.data.terrain.name);
            }
        }

        return {
            board: {
                face: this._m44scen.board.face,
                type: this._m44scen.board.type
            },
            stats: {
                terrains: Array.from(terrains.values()),
                rectTerrains: Array.from(rectTerrains.values()),
                units: Array.from(units.values()),
                badges: Array.from(badges.values()),
                tags: Array.from(tags.values()),
                obstacles: Array.from(obstacles.values())
            }
        };
    }

    // Draw

    async drawBackgroundLayer(ctx: Renderer<any, any>) {
        console.log(`[APP] Drawing board with '${this._m44scen.board.type}' size and with '${this._m44scen.board.face}' face`);
        const iconRepo = this._iconRepo;

        // TODO: _board._board is ugly f*ck ! boardSize
        // await ctx.resize(this._board._board.rWidth, this._board._board.rHeight);
        for (const hexagon of this._gameBoard.all()) {
            const backgroundImg = await iconRepo.get(hexagon.background);
            await ctx.renderImage(backgroundImg, hexagon.posX, hexagon.posY);
        }
    }

    async drawSceanrioLayer(ctx: Renderer<any, any>, conf: {
        renderLayers: string[];
    }): Promise<void> {
        console.log("[APP] drawing scenario");
        const iconRepo = this._iconRepo;
        if (iconRepo === undefined) {
            console.error("[APP] initIcons() not initialized");
            throw new Error("init_iconss_not_initialized");
        }

        if (conf.renderLayers.includes("lines")) {
            console.log("[APP] Drawing lines");
            for (const line of this._gameBoard._boardSize.lines) {
                await ctx.renderDashedLine(line[0], line[1], line[2], line[3], {
                    length: 12,
                    step: 8,
                    width: 4,
                    style: "rgba(178, 34, 34, 0.8)"
                });
            }
        }

        // Render Layers
        console.log("[APP] Starting rendering...");
        for (const hexagon of this._gameBoard.all()) {
            const scenarioHex = this.getHex(hexagon.row, hexagon.col);
            if (scenarioHex.data.terrain) {
                // render terrain instead of background
                const terrainImg = await iconRepo.getRotated(scenarioHex.data.terrain.name, scenarioHex.data.terrain.orientation);
                await ctx.renderImage(terrainImg, hexagon.posX, hexagon.posY);
            }
            if (scenarioHex.data) {
                if (scenarioHex.data.rect_terrain && conf.renderLayers.includes("rect_terrain")) {
                    const rectTerrainImg = await iconRepo.getRotated(scenarioHex.data.rect_terrain.name, scenarioHex.data.rect_terrain.orientation);
                    await ctx.renderImage(rectTerrainImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.obstacle && conf.renderLayers.includes("obstacle")) {
                    const obstacleImg = await iconRepo.getRotated(scenarioHex.data.obstacle.name, scenarioHex.data.obstacle.orientation);
                    await ctx.renderImage(obstacleImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.unit && conf.renderLayers.includes("unit")) {
                    const unitImg = await iconRepo.get(scenarioHex.data.unit.name);
                    await ctx.renderImage(unitImg, hexagon.posX, hexagon.posY);
                    if (scenarioHex.data.unit.badge && conf.renderLayers.includes("badge")) {
                        const badgeImg = await iconRepo.get(scenarioHex.data.unit.badge);
                        await ctx.renderImage(badgeImg, hexagon.posX, hexagon.posY);
                    }
                }
                if (scenarioHex.data.tags && conf.renderLayers.includes("tags")) {
                    for (const tag of scenarioHex.data.tags) {
                        const tagsImg = await iconRepo.get(tag.name);
                        await ctx.renderImage(tagsImg, hexagon.posX, hexagon.posY);
                    }
                }
            }
        }

        // console.log(`[APP] scenario rendered successfully in ${this._measure.end()}ms`);
    }

    // Model

}
