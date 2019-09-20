import { M44, M44Hex } from "../shared/m44";
import { Renderer } from "./types/renderer";
import { Renderable } from "./types/renderable";
import { ImageStorage } from "./types/imagestorage";
import { BoardSize, BoardSizes } from "../shared/board_size";

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

export class Scenario implements Renderable {

    _m44scen: M44;
    _scenariosHexMap: Map<number, Map<number, M44Hex>>;
    _boardSize: BoardSize;

    constructor(m44: M44, boardSizes: BoardSizes) {
        this._m44scen = m44;
        this._scenariosHexMap = new Map();
        this._boardSize = boardSizes[m44.board.type];

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
            this._boardSize.width,
            this._boardSize.height
        ];
    }

    sizeR(): [number, number] {
        return [
            this._boardSize.rWidth,
            this._boardSize.rHeight
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
        for (const boardHex of this._boardSize.hexagons) {
            const { row, col } = boardHex;
            const iRow = row;
            const iCol = col;
            yield this.getHex(iRow, iCol);
        }
    }

    async render(
        ctx: Renderer<any, any>,
         imageStorage: ImageStorage<any>,
         conf: {
            renderLayers: string[];
    }): Promise<void> {
        console.log("[APP] drawing scenario");
        if (conf.renderLayers.includes("lines")) {
            console.log("[APP] Drawing lines");
            for (const line of this._boardSize.lines) {
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
        for (const boardHex of this._boardSize.hexagons) {
            const scenarioHex = this.getHex(boardHex.row, boardHex.col);
            if (scenarioHex) {
                if (scenarioHex.data.terrain) {
                    // render terrain instead of background
                    const imgName = getOrientation(
                        scenarioHex.data.terrain.name,
                        scenarioHex.data.terrain.orientation
                    );
                    const terrainImg = await imageStorage.get(imgName);
                    await ctx.renderImage(terrainImg, boardHex.posX, boardHex.posY);
                }
                if (scenarioHex.data.rect_terrain && conf.renderLayers.includes("rect_terrain")) {
                    const imgName = getOrientation(
                        scenarioHex.data.rect_terrain.name,
                        scenarioHex.data.rect_terrain.orientation
                    );
                    const rectTerrainImg = await imageStorage.get(imgName);
                    await ctx.renderImage(rectTerrainImg, boardHex.posX, boardHex.posY);
                }
                if (scenarioHex.data.obstacle && conf.renderLayers.includes("obstacle")) {
                    const imgName = getOrientation(
                        scenarioHex.data.obstacle.name,
                        scenarioHex.data.obstacle.orientation
                    );
                    const obstacleImg = await imageStorage.get(imgName);
                    await ctx.renderImage(obstacleImg, boardHex.posX, boardHex.posY);
                }
                if (scenarioHex.data.unit && conf.renderLayers.includes("unit")) {
                    const unitImg = await imageStorage.get(scenarioHex.data.unit.name);
                    await ctx.renderImage(unitImg, boardHex.posX, boardHex.posY);
                    if (scenarioHex.data.unit.badge && conf.renderLayers.includes("badge")) {
                        const badgeImg = await imageStorage.get(scenarioHex.data.unit.badge);
                        await ctx.renderImage(badgeImg, boardHex.posX, boardHex.posY);
                    }
                }
                if (scenarioHex.data.tags && conf.renderLayers.includes("tags")) {
                    for (const tag of scenarioHex.data.tags) {
                        const tagsImg = await imageStorage.get(tag.name);
                        await ctx.renderImage(tagsImg, boardHex.posX, boardHex.posY);
                    }
                }
            }
        }
    }
}
