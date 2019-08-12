import { SedData } from "../../shared/sed_data";
import { replaceAt } from "./utils";

export function getImagesDict(sedData: SedData) {
    const imageDict: Map<string, string> = new Map();

    console.log("[IMAGE-DICT] creating terrain dictionary");
    for (const category of sedData.editor.terrain.item) {
        for (const terrain of category.list.item) {
            imageDict.set(terrain.name, terrain.icon);
        }
    }

    console.log("[IMAGE-DICT] creating unit dictionary");
    for (const category of sedData.editor.unit.item) {
        for (const unit of category.list.item) {
            imageDict.set(unit.name, unit.icon);
        }
    }

    console.log("[IMAGE-DICT] creating obstacle dictionary");
    for (const category of sedData.editor.obstacle.item) {
        for (const obstacle of category.list.item) {
            imageDict.set(obstacle.name, obstacle.icon);
        }
    }

    console.log("[IMAGE-DICT] creating marker dictionary");
    for (const category of sedData.editor.marker.item) {
        for (const marker of category.list.item) {
            imageDict.set(marker.name, marker.icon);
        }
    }

    console.log("[IMAGE-DICT] creating badge dictionary");
    for (const badge of sedData.editor.badges.item) {
        imageDict.set(badge.name, badge.icon);
    }

    console.log("[IMAGE-DICT] creating rotated images");
    for(const [face, faceData] of Object.entries(sedData.editor.flat_faces)) {
        if (typeof faceData !== "string") {
            if (imageDict.has(face) && faceData.nbrOrientation && parseInt(faceData.nbrOrientation, 10) > 1) {
                const url = imageDict.get(face)!;
                for (let i = 2; i <= parseInt(faceData.nbrOrientation, 10); i++) {
                    const rotated = replaceAt(url, url.length - 5, i.toString());
                    imageDict.set(`${face}_${i}`, rotated);
                }
            }
        }
    }

    return imageDict;
}
