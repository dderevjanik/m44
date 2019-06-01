import { Configuration } from "log4js";
import { AppConf } from "./app";

export const config = {
    log4js: {
        appenders: {
            out: { type: "stdout" },
            app: { type: "file", filename: "application.log" }
        },
        categories: {
            default: { appenders: ["out", "app"], level: "debug" }
        }
    } as Configuration,
    imageRepo: {
        dataUrl: "http://static.daysofwonder.com/memoir44/sed_images/",
        imageDir: "./temp"
    },
    board: {
        hex_size: [188, 217],
        unitTL: [44, 80],
        tag_offset: [39, -42],
        badge_size: [64, 64],
        background_color: [255, 255, 255],
        border_color: [0, 0, 0],
        border_width: 1,
        margin: [10, 10, 10, 10],
        dash_color: [214, 35, 44],
        dash_length: [36, 9],
        dash_width: 7,
        board_sizes: {
            standartd: [2570, 1737],
            overlord: [5014, 1737],
            brkthru: [2570, 3039]
        },
        layers: [
            "terrain",
            "lines",
            "rect_terrain",
            "obstacle",
            "unit",
            "badge",
            "tags",
            "label"
        ]
    } as AppConf["board"]
};

export type Config = (typeof config) & {
    _: string[];
    help?: boolean;
    h?: boolean;
    d?: string;
    o?: string; // output path
    output?: string;
    l?: string; // layers
};
