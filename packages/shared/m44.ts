import * as t from "io-ts";
import { EUnitName, EBoardFace, EBoardType, EStartingPlayer, ESide, EFront, EScenarioType, ESoftawre } from "./shared";

export const M44Unit = t.strict({
    name: EUnitName,
    badge: t.union([t.undefined, t.string]),
    nbr_units: t.union([t.undefined, t.string])
});
export type M44Unit = t.TypeOf<typeof M44Unit>;

export const M44Terrain = t.strict({
    name: t.string,
    orientation: t.union([t.undefined, t.number])
});
export type M44Terrain = t.TypeOf<typeof M44Terrain>;

export const M44Obstacle = t.strict({
    name: t.string,
    orientation: t.union([
        t.undefined,
        t.number
    ])
});
export type M44Obstacle = t.TypeOf<typeof M44Obstacle>;

export const M44RectTerrain = t.strict({
    name: t.string,
    orientation: t.union([t.undefined, t.number])
});
export type M44RectTerrain = t.TypeOf<typeof M44RectTerrain>;

export const M44Tag = t.strict({
    name: t.string
});
export type M44Tag = t.TypeOf<typeof M44Tag>;

export const M44Label = t.strict({
    row: t.number,
    col: t.number,
    text: t.array(t.string)
});
export type M44Label = t.TypeOf<typeof M44Label>;

export const M44Hex = t.strict({
    row: t.number,
    col: t.number,
    obstacle: t.union([
        t.undefined,
        M44Obstacle
    ]),
    unit: t.union([
        t.undefined,
        M44Unit
    ]),
    rect_terrain: t.union([
        t.undefined,
        M44RectTerrain,
    ]),
    terrain: t.union([
        t.undefined,
        M44Terrain
    ]),
    tags: t.union([
        t.undefined,
        t.array(M44Tag)
    ]),
});

export type M44Hex = t.TypeOf<typeof M44Hex>;

export const M44Board = t.strict({
    type: EBoardType,
    face: EBoardFace,
    hexagons: t.array(M44Hex),
    labels: t.array(M44Label)
});

export type M44Board = t.TypeOf<typeof M44Board>;

export const M44 = t.strict({
    meta_data: t.strict({
        status: t.string,
        software: ESoftawre
    }),
    game_info: t.strict({
        date_begin: t.string,
        front: EFront,
        type: EScenarioType,
        starting: EStartingPlayer,
        side_player1: ESide,
        side_player2: ESide,
        // TODO: Finish EPlayerCountry
        country_player1: t.string,
        country_player2: t.string,
        cards_player1: t.number,
        cards_player2: t.number,
        victory_player1: t.number,
        victory_player2: t.number
    }),
    board: M44Board,
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
