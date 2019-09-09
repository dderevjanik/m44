export const config = {
    imageRepo: {
        // dataUrl: "http://static.daysofwonder.com/memoir44/sed_images/",
        dataUrl: "images/",
        imageDir: "m44-images"
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
    }
};
