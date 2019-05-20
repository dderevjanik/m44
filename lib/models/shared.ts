import * as t from "io-ts";

export const EArmy = t.union([
    t.literal("us"),
    t.literal("ger"),
    t.literal("ru"),
    t.literal("jp"),
    t.literal("uk")
]);

export const ELocale = t.union([
    t.literal("en"),
    t.literal("fr"),
    t.literal("de"),
    t.literal("nl"),
    t.literal("da"),
    t.literal("fi"),
    t.literal("it"),
    t.literal("pl"),
    t.literal("pt"),
    t.literal("es"),
    t.literal("sv"),
    t.literal("no"),
    t.literal("el"),
    t.literal("c")
]);

export const Language = t.strict({
    locale: ELocale,
    label: t.string,
    _type: t.string
});

export const PickerTab = t.strict({
    name: t.string,
    label: t.string,
    accesskey: t.string,
    _type: t.string
});

export const Unit = t.strict({
    name: t.string,
    label: t.string,
    icon: t.string,
    _type: t.string
});

export const UnitSide = t.strict({
    name: EArmy,
    label: t.string,
    list: t.strict({
        item: t.array(Unit),
        _type: t.string
    }),
    _type: t.string
});

export const Marker = t.strict({
    name: t.string,
    label: t.string,
    icon: t.string,
    _type: t.string
});

export const MarkerType = t.strict({
    name: t.string,
    label: t.string,
    list: t.strict({
        item: t.array(Marker),
        _type: t.string
    }),
    _type: t.string,
});

export const Obstacle = t.strict({
    name: t.string,
    label: t.string,
    icon: t.string,
    _type: t.string
});

export const ObstacleType = t.strict({
    name: t.string,
    label: t.string,
    list: t.strict({
        item: t.array(Obstacle),
        _type: t.string
    }),
    _type: t.string,
});

export const Terrain = t.strict({
    name: t.string,
    label: t.string,
    icon: t.string,
    _type: t.string
});

export const TerrainType = t.strict({
    name: t.string,
    label: t.string,
    list: t.strict({
        item: t.array(Terrain),
        _type: t.string
    }),
    _type: t.string
});

export const Side = t.strict({
    label: t.string,
    list: t.strict({
        item: t.array(t.strict({
            name: t.string,
            label: t.string,
            _type: t.string
        })),
        _type: t.string
    }),
    _type: t.string
});

export const EFlatFaceType = t.union([
    t.literal("terrain"),
    t.literal("rect_terrain"),
    t.literal("obstacle"),
    t.literal("unit"),
    t.literal("tag"),
]);

export const EShape = t.union([
    t.literal("hex"),
    t.literal("rect"),
    t.literal("wire"),
    t.literal("sand"),
    t.literal("hog"),
    t.literal("hog"),
    t.literal("unit"),
    t.literal("circle")
]);

export const ELandscape = t.union([
    t.literal("country"),
    t.literal("sand"),
    t.literal("jungle"),
    t.literal("winter"),
]);

export const EDeltaAngle = t.union([
    t.literal("180"),
    t.literal("60"),
    t.literal("-30"),
    t.literal("-60"),
]);

export const EWeapon = t.union([
    t.literal("infantry"),
    t.literal("special_forces"),
    t.literal("armor"),
    t.literal("elite_armor"),
    t.literal("artillery"),
    t.literal("plane"),
    t.literal("vehicle")
]);

export const EOffset = t.union([
    t.literal("TR"),
    t.literal("BL"),
    t.literal("C"),
])

export const EPack = t.union([
    t.literal("winterwars"),
    t.literal("base"),
    t.literal("pacific"),
    t.literal("terrain"),
    t.literal("air"),
    t.literal("eastern"),
    t.literal("mediterranean"),
    t.literal("campaign"),
    t.literal("battlemap"),
]);

export const EUnitName = t.union([
    t.literal("infus"),
    t.literal("inf2us"),
    t.literal("tankus"),
    t.literal("tank2us"),
    t.literal("gunus"),
    t.literal("plnus"),
    t.literal("vehus"),
    t.literal("infger"),
    t.literal("inf2ger"),
    t.literal("tankger"),
    t.literal("tank2ger"),
    t.literal("gunger"),
    t.literal("plnger"),
    t.literal("vehger"),
    t.literal("infru"),
    t.literal("inf2ru"),
    t.literal("tankru"),
    t.literal("tank2ru"),
    t.literal("gunru"),
    t.literal("plnru"),
    t.literal("vehru"),
    t.literal("infjp"),
    t.literal("inf2jp"),
    t.literal("tankjp"),
    t.literal("tank2jp"),
    t.literal("gunjp"),
    t.literal("plnjp"),
    t.literal("vehjp"),
    t.literal("infbrit"),
    t.literal("inf2brit"),
    t.literal("tankbrit"),
    t.literal("tank2brit"),
    t.literal("gunbrit"),
    t.literal("plnbrit"),
    t.literal("vehbrit"),
]);
