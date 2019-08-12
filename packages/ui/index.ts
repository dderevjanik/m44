import * as t from "io-ts";
import * as reporters from "io-ts-reporters";
import { M44Browser } from "../browser/index";
import { config } from "./config";
import { M44 } from "../shared/m44";

// json
import SedDataJSON from "../../data/sed_data.json";
import BoardSizesJSON from "../../board_sizes.json";
import ImagesJSON from "../../images.json";

(async () => {
//     // Initialize HTML Elements
    const canvasEl = document.getElementById("m44-canvas");
    const sedDataInp = document.getElementById("m44-sed-data");
    const m44Inp = document.getElementById("m44-scenario");

    if (canvasEl === null) {
        throw new Error("m44-canvas <canvas/> is missing!");
    }
    if (m44Inp === null) {
        throw new Error("m44-scenario <input/> is missing!");
    }

    const m44 = new M44Browser({
        board: config.board,
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
    m44.initialize(SedDataJSON, BoardSizesJSON, imagesJSON);

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
                    localStorage.setItem("m44-scenario", JSON.stringify(scenario));
                }
                const drawResult = await m44.drawScenario(scenario);
                console.log(drawResult);
            } catch(err) {
                console.log(err);
                console.error(`[UI] Cannot parse '${file.name}' loaded from <input/>`);
            }
            console.log(`[UI] Scenario '${file.name}' loaded from <input/>`);
        }
        reader.readAsText(file);
    });
})();
