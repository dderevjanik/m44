import * as t from "io-ts";
import { EUnitName } from "./shared";

export const BoardUnit = t.strict({
    name: EUnitName,
    badge: t.union([t.undefined, t.string]),
    nbr_units: t.union([t.undefined, t.string])
});
export type BoardUnit = t.TypeOf<typeof BoardUnit>;

export const BoardTerrain = t.strict({
    name: t.string,
    orientation: t.union([t.undefined, t.number])
});
export type BoardTerrain = t.TypeOf<typeof BoardTerrain>;

export const BoardObstacle = t.strict({
    name: t.string,
    orientation: t.union([
        t.undefined,
        t.number
    ])
});
export type BoardObstacle = t.TypeOf<typeof BoardObstacle>;

export const BoardRectTerrain = t.strict({
    name: t.string,
    orientation: t.union([t.undefined, t.number])
});
export type BoardRectTerrain = t.TypeOf<typeof BoardRectTerrain>;

export const BoardTag = t.strict({
    name: t.string
});
export type BoardTag = t.TypeOf<typeof BoardTag>;

export const BoardLabel = t.strict({
    row: t.number,
    col: t.number,
    text: t.array(t.string)
});
export type BoardLabel = t.TypeOf<typeof BoardLabel>;

export const Board = t.strict({
    type: t.string,
    face: t.string,
    hexagons: t.array(t.strict({
        row: t.number,
        col: t.number,
        obstacle: t.union([
            t.undefined,
            BoardObstacle
        ]),
        unit: t.union([
            t.undefined,
            BoardUnit
        ]),
        rect_terrain: t.union([
            t.undefined,
            BoardRectTerrain,
        ]),
        terrain: t.union([
            t.undefined,
            BoardTerrain
        ]),
        tags: t.union([
            t.undefined,
            t.array(BoardTag)
        ]),
    })),
    labels: t.array(BoardLabel)
});

export type Board = t.TypeOf<typeof Board>;

export const M44 = t.strict({
    meta_data: t.strict({
        status: t.string,
        software: t.string
    }),
    game_info: t.strict({
        date_begin: t.string,
        front: t.string,
        type: t.string,
        starting: t.string,
        side_player1: t.string,
        side_player2: t.string,
        country_player1: t.string,
        country_player2: t.string,
        cards_player1: t.number,
        cards_player2: t.number,
        victory_player1: t.number,
        victory_player2: t.number
    }),
    board: Board,
    packs: t.strict({
        base: t.union([t.undefined, t.number]),
        terrain: t.union([t.undefined, t.number]),
        eastern: t.union([t.undefined, t.number]),
        pacific: t.union([t.undefined, t.number]),
        air: t.union([t.undefined, t.number]),
        mediterranean: t.union([t.undefined, t.number]),
        battlemap: t.union([t.undefined, t.number]),
        campaign: t.union([t.undefined, t.number]),
        winterwars: t.union([t.undefined, t.number])
    }),
    text: t.strict({
        en: t.strict({
            name: t.string,
            subtitle: t.string,
            description: t.string,
            rules: t.string,
            historical: t.string,
            victory: t.string,
            bibliography: t.union([t.undefined, t.string])
        })
    })
});

export type M44 = t.TypeOf<typeof M44>;
