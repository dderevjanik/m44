import * as t from "io-ts";
import {
    Language,
    PickerTab,
    UnitSide,
    MarkerType,
    ObstacleType,
    TerrainType,
    EWeapon,
    EPack,
    EFlatFaceType,
    EShape,
    ELandscape,
    EDeltaAngle,
    EArmy,
    EOffset,
    Side
} from "./shared";

export const BoardHexagon = t.strict({
    col: t.string, // number
    row: t.string, // number
    posX: t.string, // number
    posY: t.string, // number
    _type: t.string
});
export type BoardHexagon = t.TypeOf<typeof BoardHexagon>;

export const BoardSize = t.strict({
    value: t.string, // type
    nbrCols: t.string, // number
    nbrRows: t.string, // number
    width: t.string, // number
    height: t.string, // number
    access: t.string,
    label: t.string,
    hexagons: t.strict({
        item: t.array(BoardHexagon),
        _type: t.string
    }),
    _type: t.string
});
export type BoardSize = t.TypeOf<typeof BoardSize>;

export const SedData = t.strict({
    editor: t.strict({
        language: t.string,
        languages: t.strict({
            item: t.array(Language),
            _type: t.string
        }),
        picker_tabs: t.strict({
            item: t.array(PickerTab),
            _type: t.string
        }),
        label: t.strict({
            accesskey: t.string,
            hex_group: t.string,
            help: t.string,
            _type: t.string
        }),
        filter: t.strict({
            accesskey: t.string,
            elevation: t.strict({
                any: t.string,
                elevation: t.string,
                _type: t.string
            }),
            landscape: t.strict({
                any: t.string,
                winter: t.string,
                sand: t.string,
                jungle: t.string,
                country: t.string,
                _type: t.string
            }),
            transport: t.strict({
                any: t.string,
                road: t.string,
                rail: t.string,
                airfield: t.string,
                water: t.string,
                _type: t.string
            }),
            type: t.strict({
                any: t.string,
                natural: t.string,
                artificial: t.string,
                _type: t.string
            }),
            _type: t.string
        }),
        validation: t.strict({
            accesskey: t.string,
            _type: t.string
        }),
        unit: t.strict({
            item: t.array(UnitSide),
            _type: t.string
        }),
        marker: t.strict({
            item: t.array(MarkerType),
            _type: t.string
        }),
        obstacle: t.strict({
            item: t.array(ObstacleType),
            _type: t.string
        }),
        terrain: t.strict({
            item: t.array(TerrainType),
            _type: t.string
        }),
        badges: t.strict({
            item: t.array(t.strict({
                weapon: t.strict({
                    item: t.union([
                        t.strict({
                            _type: t.string,
                            __text: EWeapon
                        }),
                        t.array(t.strict({
                            _type: t.string,
                            __text: EWeapon
                        }))
                    ]),
                    _type: t.string
                }),
                name: t.string,
                label: t.string,
                icon: t.string,
                packs: t.union([
                    t.strict({
                        item: t.union([
                            t.strict({
                                _type: t.string,
                                __text: EPack
                            }),
                            t.array(t.strict({
                                _type: t.string,
                                __text: EPack
                            }))
                        ]),
                        _type: t.string
                    }),
                    t.strict({
                        _type: t.string
                    })
                ]),
                _type: t.string
            })),
            _type: t.string
        }),
        flat_faces: t.dictionary(t.string, t.union([
            t.strict({
                name: t.string,
                type: EFlatFaceType,
                shape: EShape,
                landscape: t.union([
                    ELandscape,
                    t.undefined
                ]),
                nbrOrientation: t.union([
                    t.literal("3"),
                    t.literal("6"),
                    t.literal("2"),
                    t.undefined
                ]), // number
                manmade: t.union([t.string, t.undefined]), // boolean
                elevation: t.union([t.string, t.undefined]), // boolean
                vegetation: t.union([t.string, t.undefined]),
                angle: t.union([
                    t.literal("90"),
                    t.undefined
                ]), // number
                deltaAngle: t.union([
                    EDeltaAngle,
                    t.undefined
                ]), // number
                bridge: t.union([t.string, t.undefined]), // boolean
                water: t.union([t.string, t.undefined]), // boolean
                road: t.union([t.string, t.undefined]), // boolean
                block: t.union([t.string, t.undefined]), // boolean
                bunker: t.union([t.string, t.undefined]), // boolean
                army: t.union([
                    EArmy,
                    t.undefined
                ]), // nation
                weapon: t.union([
                    EWeapon,
                    t.undefined
                ]), // weapon
                rail: t.union([t.string, t.undefined]), // boolean
                transport: t.union([t.string, t.undefined]), // boolean
                landmark: t.union([t.string, t.undefined]), // boolean
                air: t.union([t.string, t.undefined]), // boolean
                buildings: t.union([t.string, t.undefined]), // boolean
                medal: t.union([t.string, t.undefined]), // boolean
                offset: t.union([
                    EOffset,
                    t.undefined
                ]), // offset position
                packs: t.union([
                    t.strict({
                        item: t.union([
                            t.array(EPack),
                            EPack
                        ]),
                        _type: t.string
                    }),
                    t.strict({
                        _type: t.string
                    })
                ]),
                label: t.string,
                icon: t.string,
                _type: t.string
            }),
            t.string // _type
        ])),
        board_settings: t.strict({
            board_face: t.strict({
                list: t.strict({
                    item: t.array(t.strict({
                        value: t.string,
                        label: t.string,
                        _type: t.string
                    })),
                    _type: t.string
                }),
                _type: t.string
            }),
            board_size: t.strict({
                list: t.strict({
                    standard: BoardSize,
                    overlord: BoardSize,
                    brkthru: BoardSize,
                    _type: t.string
                }),
                _type: t.string
            }),
            _type: t.string
        }),
        packs: t.strict({
            list: t.strict({
                item: t.array(t.strict({
                    name: t.string,
                    required: t.union([t.string, t.undefined]), // number
                    privilege: t.string,
                    label: t.string,
                    pieces: t.union([
                        t.strict({
                            item: t.union([
                                t.array(t.strict({
                                    nbr: t.string, // number
                                    face1: t.string,
                                    face2: t.string,
                                    _type: t.string
                                })),
                                t.strict({
                                    nbr: t.string,
                                    face1: t.string,
                                    face2: t.string,
                                    _type: t.string
                                }),
                                t.string
                            ]),
                            _type: t.string
                        }),
                        t.strict({
                            _type: t.string
                        })
                    ]),
                    _type: t.string
                })),
                _type: t.string,
            }),
            _type: t.string
        }),
        online: t.strict({
            status: t.strict({
                label: t.string,
                list: t.strict({
                    item: t.array(t.strict({
                        name: t.string,
                        access: t.string,
                        label: t.string,
                        _type: t.string
                    })),
                    _type: t.string,
                }),
                _type: t.string,
            }),
            scenario_id: t.string,
            original_scenario_id: t.string,
            expert_mode: t.string,
            _type: t.string
        }),
        battle: t.strict({
            front: t.strict({
                label: t.string,
                list: t.strict({
                    item: t.array(t.strict({
                        name: t.string,
                        label: t.string,
                        _type: t.string
                    })),
                    _type: t.string,
                }),
                _type: t.string
            }),
            operation: t.strict({
                label: t.string,
                suggest: t.string,
                _type: t.string
            }),
            start_date: t.string,
            end_date: t.string,
            same_date: t.string,
            type: t.strict({
                label: t.string,
                list: t.strict({
                    item: t.array(t.strict({
                        name: t.string,
                        label: t.string,
                        _type: t.string
                    })),
                    _type: t.string
                }),
                _type: t.string,
            }),
            _type: t.string
        }),
        game: t.strict({
            starting: t.strict({
                label: t.string,
                list: t.strict({
                    item: t.array(t.strict({
                        name: t.string,
                        label: t.string,
                        _type: t.string
                    })),
                    _type: t.string,
                }),
                _type: t.string,
            }),
            side: t.strict({
                label: t.string,
                axis: Side,
                allies: Side,
                _type: t.string,
            }),
            command: t.string,
            victory: t.string,
            player: t.strict({
                top: t.string,
                bottom: t.string,
                _type: t.string
            }),
            _type: t.string
        }),
        text_panel: t.dictionary(t.string, t.union([
            t.strict({
                name: t.string,
                subtitle: t.string,
                historical: t.string,
                description: t.string,
                rules: t.string,
                victory: t.string,
                bibliography: t.string,
                _type: t.string
            }),
            t.string
        ])),
        _type: t.string
    })
});

export type SedData = t.TypeOf<typeof SedData>;
