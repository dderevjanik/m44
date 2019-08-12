import * as t from "io-ts";
import * as reporters from "io-ts-reporters";
import { M44Browser } from "../browser/index";
import { config } from "./config";
import { M44 } from "../shared/m44";
import { SedData } from "../shared/sed_data";

(async () => {
    // Initialize HTML Elements
    const canvasEl = document.getElementById("m44-canvas") as HTMLInputElement | null;
    const sedDataInp = document.getElementById("m44-sed-data") as HTMLInputElement | null;
    const m44Inp = document.getElementById("m44-scenario") as HTMLInputElement | null;

    if (canvasEl === null) {
        throw new Error("m44-canvas <canvas/> is missing!");
    }
    if (sedDataInp === null) {
        throw new Error("m44-sed-data <input/> is missing!");
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

    // Initialize localStorage
    const lsSedData = localStorage.getItem("m44-sed-data") as SedData | null;
    const lsScenario = localStorage.getItem("m44-scenario") as M44 | null;

    if (lsSedData) {
        console.log("[UI] SedData stored in localStorage, retrieving...");
        await m44.initialize(JSON.parse(lsSedData));
    }
    if (lsScenario) {
        console.log("[UI] M44 Scenario store in localStorage, retrieving...");
        await m44.drawScenario(JSON.parse(lsScenario));
    }


    sedDataInp.addEventListener("change", (e) => {
        console.log("[UI] Loading sedData from <input/>");
        const reader = new FileReader();
        const target = e.target as HTMLInputElement;
        const file = target.files![0];
        reader.onload = (e) => {
            const rTarget = e.target as any;
            const data = rTarget.result!;

            try {
                const sData = JSON.parse(data);
                const result = SedData.decode(sData);
                const report = reporters.reporter(result);
                if (report.length) {
                    console.error(`[UI] ${report}`);
                } else {
                    localStorage.setItem("m44-sed-data", JSON.stringify(sData));
                }
            } catch(err) {
                console.error(err);
                console.error(`[UI] Cannot parse '${file.name}' loaded from <input/>`);
            }
            console.log(`[UI] SedData '${file.name}' loaded from <input/>`);
        }
        reader.readAsText(file);
    });

    m44Inp.addEventListener("change", (e) => {
        console.log("[UI] Loading scenario from <input/>");
        const reader = new FileReader();
        const target = e.target as HTMLInputElement;
        const file = target.files![0];
        reader.onload = (e) => {
            const rTarget = e.target as any;
            const data = rTarget.result!;

            try {
                const scen = JSON.parse(data);
                const result = M44.decode(scen);
                const report = reporters.reporter(result);
                if (report.length) {
                    console.error(`[UI] ${report}`);
                } else {
                    localStorage.setItem("m44-scenario", JSON.stringify(scen));
                }
            } catch(err) {
                console.log(err);
                console.error(`[UI] Cannot parse '${file.name}' loaded from <input/>`);
            }
            console.log(`[UI] Scenario '${file.name}' loaded from <input/>`);
        }
        reader.readAsText(file);
    });
})();
