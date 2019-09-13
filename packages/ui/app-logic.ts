import { Scenario } from "../core/scenario";
import { Renderer } from "../core/types/renderer";
import { ClickDetection } from "./utils";
import { createImage } from "../browser/utils";

type EVENT = {
    type: 'CLICK'; x: number; y: number;
}

interface AppState {
    scenario?: Scenario;
    clickDetection?: ClickDetection;
    editor: {
        focusedHex?: { posX: number; posY: number; };
        shouldUpdateBckg: boolean;
        shouldUpdateScn: boolean;
        shouldUpdateUI: boolean;
    };
    renderers: {
        background?: Renderer<any, any>;
        scenario?: Renderer<any, any>;
        ui?: Renderer<any, any>;
    }
}

const FPS = 30;
const FPS_T = 1000 / FPS;

export class AppLogic {

    state: AppState = {
        editor: {
            focusedHex: undefined,
            shouldUpdateBckg: true,
            shouldUpdateScn: true,
            shouldUpdateUI: true
        },
        renderers: { }
    };

    loadScenario(scenario: Scenario): void {
        // if there was scenario before, check if we need to recalculate clickDetection
        if (this.state.scenario && this.state.clickDetection) {
            if (this.state.scenario._m44scen.board.type !== scenario._m44scen.board.type) {
                // we need to recalculate size
                this.state.clickDetection.recalculate(scenario._gameBoard._boardSize.hexagons);
            }
        } else {
            const clickDetection = new ClickDetection();
            clickDetection.recalculate(scenario._gameBoard._boardSize.hexagons);
            this.state.clickDetection = clickDetection;
        }
        this.state.editor = {
            ...this.state.editor,
            shouldUpdateBckg: true,
            shouldUpdateScn: true
        };
        this.state.scenario = scenario;
    }

    setBackgroundRender(renderer: Renderer<any, any>) {
        this.state.renderers.background = renderer;
    }

    setScenarioRenderer(renderer: Renderer<any, any>) {
        this.state.renderers.scenario = renderer;
    }

    setUIRenderer(renderer: Renderer<any, any>) {
        this.state.renderers.ui = renderer;
    }

    start(): void {
        this._render();
    }

    processEvent(event: EVENT) {
        console.log(`[APP-LOGIC] EVENT:${event.type}\n${JSON.stringify(event, null, 2)}`);
        switch(event.type) {
            case "CLICK": {
                if (this.state.clickDetection) {
                    const hex = this.state.clickDetection.detectClick(event.x, event.y);
                    if (hex) {
                        this.state.editor.focusedHex = hex;
                        this.state.editor.shouldUpdateUI = true;
                    }
                }
                break;
            }
            default: {
                console.log(`[APP-LOGIC] Undefined event "${event.type}"`);
            }
        }
    }

    async _render(): Promise<void> {
        if (this.state.renderers.background && this.state.renderers.scenario) {
            if (this.state.scenario) {
                if (this.state.editor.shouldUpdateBckg) {
                    this.state.renderers.background!.clear();
                    this.state.scenario.drawBackgroundLayer(this.state.renderers.background);
                    this.state.editor.shouldUpdateBckg = false;
                }
                if (this.state.editor.shouldUpdateScn) {
                    this.state.renderers.scenario!.clear();
                    this.state.scenario.drawSceanrioLayer(this.state.renderers.scenario, {
                        renderLayers: [
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
                    });
                    this.state.editor.shouldUpdateScn = false;
                }
                if (this.state.editor.shouldUpdateUI) {
                    this.state.renderers.ui!.clear();
                    const focusedHex = this.state.editor.focusedHex;
                    if (focusedHex) {
                        const img = await createImage("images/moving.png");
                        this.state.renderers.ui!.renderImage(img, focusedHex.posX, focusedHex.posY);
                    }
                    this.state.editor.shouldUpdateUI = false;
                }
            } else {
                throw new Error("No scenario to render, please load Scenario");
            }
        } else {
            throw new Error("Renderer is not defined, please mount Renderer");
        }

        setTimeout(async () => {
            await this._render();
        }, FPS_T);
    }

}
