const HEX_WIDTH = 188;
const HEX_HEIGHT = 217;

interface Hex {
    posX: number;
    posY: number;
    row: number;
    col: number;
}

interface CachedBoardHex {
    cx: number;
    cy: number;
    hexagon: Hex;
}

export class ClickDetection {

    _hexagons: CachedBoardHex[] = [];

    recalculate(hexagons: Hex[]): void {
        this._hexagons = hexagons.map((hexagon) => ({
            cx: hexagon.posX + (HEX_WIDTH / 2),
            cy: hexagon.posY + (HEX_HEIGHT / 2),
            hexagon
        }));
    }

    detectClick(x: number, y: number): (Hex | undefined) {
        const hexSize = Math.sqrt(HEX_WIDTH**2 + HEX_HEIGHT**2);
        // TODO: check click boundries
        const inRange: Array<[number, Hex]> = [];
        this._hexagons.forEach((hex) => {
            const dx = Math.abs(hex.cx - x);
            const dy = Math.abs(hex.cy - y);
            const distance = Math.sqrt(dx**2 + dy**2);
            if (distance < hexSize) {
                inRange.push([distance, hex.hexagon]);
            }
        });
        const closestHex = inRange.sort((a, b) => a[0] - b[0]);
        if (closestHex) {
            return closestHex[0][1];
        }
        return undefined; // not found
    }

}
