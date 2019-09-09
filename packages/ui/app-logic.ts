import { Scenario } from "../core/scenario";
import { Renderer } from "../core/types/renderer";
import { ClickDetection } from "./utils";

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
            shouldUpdateScn: true
        },
        renderers: {

        }
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

    setScenarioRenderer(render: Renderer<any, any>) {
        this.state.renderers.scenario = render;
    }

    setUIRenderer(render: Renderer<any, any>) {
        this.state.renderers.ui = render;
    }

    start(): void {
        this._render();
    }

    processEvent(event: EVENT) {
        switch(event.type) {
            case "CLICK": {
                if (this.state.clickDetection) {
                    const hex = this.state.clickDetection.detectClick(event.x, event.y);
                    this.state.editor.focusedHex = hex;
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
                    this.state.scenario.drawBackgroundLayer(this.state.renderers.background);
                    this.state.editor.shouldUpdateBckg = false;
                }
                if (this.state.editor.shouldUpdateScn) {
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
