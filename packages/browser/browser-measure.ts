import { Measure } from "../core/types/measure";

export class BrowserMeasure implements Measure {

    _startTime: number | null = null;
    _endTime: number | null = null;

    start() {
        this._startTime = performance.now();
    }

    end(): number {
        if (this._startTime === null) {
            throw new Error("startTime not intialized");
        }
        this._endTime = performance.now();
        return this._endTime - this._startTime;
    }

}
