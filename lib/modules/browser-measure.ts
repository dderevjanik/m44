import { Measure } from "../types/measure";

export class BrowserMeasure implements Measure {

    _startTime: any;
    _endTime: any;

    constructor() {
        this._startTime = performance.now();
    }

    end(): number {
        this._endTime = performance.now();
        return this._endTime - this._startTime;
    }

}
