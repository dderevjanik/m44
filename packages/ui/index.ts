import * as reporters from "io-ts-reporters";
import { M44Browser } from "../browser/index";
import { config } from "./config";
import { M44 } from "../shared/m44";
import { AppLogic } from "./app-logic";

// json
import SedDataJSON from "../../data/sed_data.json";
import BoardSizesJSON from "../../board_sizes.json";
import ImagesJSON from "../../images.json";
import { CanvasRender } from "../browser/modules/canvas-render";

(async () => {
    const appLogic = new AppLogic();
    const m44 = new M44Browser({
        dataUrl: config.imageRepo.dataUrl,
        imageKey: config.imageRepo.imageDir,
        renderLayers: [
            "background",
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
    // @ts-ignore
    m44.initialize(SedDataJSON, BoardSizesJSON, ImagesJSON);

    //     // Initialize HTML Elements
    const canvasBackgrundEl = document.getElementById("layer-background") as HTMLCanvasElement;
    const canvasScenarioEl = document.getElementById("layer-scenario") as HTMLCanvasElement;
    const canvasUIEl = document.getElementById("layer-ui") as HTMLCanvasElement;


    const m44Inp = document.getElementById("m44-scenario") as HTMLInputElement;

    if (canvasBackgrundEl === null || canvasScenarioEl === null || canvasUIEl === null) {
        throw new Error("One of <canvas/> is missing!");
    }
    if (m44Inp === null) {
        throw new Error("m44-scenario <input/> is missing!");
    }

    m44Inp.addEventListener("change", (e) => {
        console.log("[UI] Loading scenario from <input/>");
        const reader = new FileReader();
        const target = e.target as HTMLInputElement;
        const file = target.files![0];
        reader.onload = async (e) => {
            const rTarget = e.target as any;
            const data = rTarget.result!;

            let scenario: M44;
            try {
                scenario = JSON.parse(data);
                const result = M44.decode(scenario);
                const report = reporters.reporter(result);
                if (report.length) {
                    console.error(`[UI] ${report}`);
                } else {
                    // localStorage.setItem("m44-scenario", JSON.stringify(scenario));
                }
                const scn = await m44._app!.createScenario(scenario);
                const scenarioSize = scn.sizeR();

                canvasBackgrundEl.width = scenarioSize[0];
                canvasBackgrundEl.height = scenarioSize[1];

                canvasScenarioEl.width = scenarioSize[0];
                canvasScenarioEl.height = scenarioSize[1];

                canvasUIEl.width = scenarioSize[0];
                canvasUIEl.height = scenarioSize[1];

                const backgroundRenderer = new CanvasRender(canvasBackgrundEl);
                const scenarioRenderer = new CanvasRender(canvasScenarioEl);
                const UIRenderer = new CanvasRender(canvasUIEl);

                appLogic.setBackgroundRender(backgroundRenderer);
                appLogic.setScenarioRenderer(scenarioRenderer);
                appLogic.setUIRenderer(UIRenderer);

                appLogic.loadScenario(scn);
                appLogic.start();

                canvasUIEl.addEventListener("click", (e) => {
                    const rect = canvasUIEl.getBoundingClientRect();
                    const scaleX = canvasUIEl.width / rect.width;
                    const scaleY = canvasUIEl.height / rect.height;
                    appLogic.processEvent({
                        type: "CLICK",
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY
                    });
                });
            } catch (err) {
                console.log(err);
                console.error(`[UI] Cannot parse '${file.name}' loaded from <input/>`);
            }
            console.log(`[UI] Scenario '${file.name}' loaded from <input/>`);
        }
        reader.readAsText(file);
    });
})();
