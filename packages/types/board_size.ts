import * as t from "io-ts";

export const BoardSize = t.interface({
    value: t.string,
    nbrCols: t.number,
    nbrRows: t.number,
    width: t.number,
    height: t.number,
    rWidth: t.number,
    rHeight: t.number,
    access: t.string,
    label: t.string,
    hexagons: t.array(t.interface({
        col: t.number,
        row: t.number,
        posX: t.number,
        posY: t.number
    }))
});

export type BoardSize = t.TypeOf<typeof BoardSize>;

export const BoardSizes = t.interface({
    STANDARD: BoardSize,
    OVERLORD: BoardSize,
    BRKTHRU: BoardSize
});

export type BoardSizes = t.TypeOf<typeof BoardSizes>;
