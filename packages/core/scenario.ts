import { M44, M44Hex } from "../shared/m44";
import { GameBoard } from "./game-board";
import { Renderer } from "./types/renderer";
import { ImageStorage } from "./types/imagestorage";

function getOrientation(name: string, orientation?: number): string {
    if (!orientation || orientation === 1) {
        return name;
    }
    return `${name}_${orientation}`;
}

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
    _scenariosHexMap: Map<number, Map<number, M44Hex>>;
    _gameBoard: GameBoard;

    constructor(board: GameBoard, m44: M44) {
        this._m44scen = m44;
        this._gameBoard = board;
        this._scenariosHexMap = new Map();

        for (const hex of m44.board.hexagons) {
            if (this._scenariosHexMap.has(hex.row)) {
                const colHexes = this._scenariosHexMap.get(hex.row);
                colHexes!.set(hex.col, hex);
            } else {
                const colHexes = new Map<number, M44Hex>();
                colHexes.set(hex.col, hex);
                this._scenariosHexMap.set(hex.row, colHexes);
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
        if (this._scenariosHexMap.has(row)) {
            const colHexes = this._scenariosHexMap.get(row);
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

    async drawBackgroundLayer(ctx: Renderer<any, any>, imageStorage: ImageStorage<any>) {
        console.log(`[APP] Drawing board with '${this._m44scen.board.type}' size and with '${this._m44scen.board.face}' face`);

        // TODO: _board._board is ugly f*ck ! boardSize
        // await ctx.resize(this._board._board.rWidth, this._board._board.rHeight);
        for (const hexagon of this._gameBoard.all()) {
            const backgroundImg = await imageStorage.get(hexagon.background);
            await ctx.renderImage(backgroundImg, hexagon.posX, hexagon.posY);
        }
    }

    async drawSceanrioLayer(ctx: Renderer<any, any>, imageStorage: ImageStorage<any>, conf: {
        renderLayers: string[];
    }): Promise<void> {
        console.log("[APP] drawing scenario");
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
                const imgName = getOrientation(
                    scenarioHex.data.terrain.name,
                    scenarioHex.data.terrain.orientation
                );
                const terrainImg = await imageStorage.get(imgName);
                await ctx.renderImage(terrainImg, hexagon.posX, hexagon.posY);
            }
            if (scenarioHex.data) {
                if (scenarioHex.data.rect_terrain && conf.renderLayers.includes("rect_terrain")) {
                    const imgName = getOrientation(
                        scenarioHex.data.rect_terrain.name,
                        scenarioHex.data.rect_terrain.orientation
                    );
                    const rectTerrainImg = await imageStorage.get(imgName);
                    await ctx.renderImage(rectTerrainImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.obstacle && conf.renderLayers.includes("obstacle")) {
                    const imgName = getOrientation(
                        scenarioHex.data.obstacle.name,
                        scenarioHex.data.obstacle.orientation
                    );
                    const obstacleImg = await imageStorage.get(imgName);
                    await ctx.renderImage(obstacleImg, hexagon.posX, hexagon.posY);
                }
                if (scenarioHex.data.unit && conf.renderLayers.includes("unit")) {
                    const unitImg = await imageStorage.get(scenarioHex.data.unit.name);
                    await ctx.renderImage(unitImg, hexagon.posX, hexagon.posY);
                    if (scenarioHex.data.unit.badge && conf.renderLayers.includes("badge")) {
                        const badgeImg = await imageStorage.get(scenarioHex.data.unit.badge);
                        await ctx.renderImage(badgeImg, hexagon.posX, hexagon.posY);
                    }
                }
                if (scenarioHex.data.tags && conf.renderLayers.includes("tags")) {
                    for (const tag of scenarioHex.data.tags) {
                        const tagsImg = await imageStorage.get(tag.name);
                        await ctx.renderImage(tagsImg, hexagon.posX, hexagon.posY);
                    }
                }
            }
        }
    }
}
