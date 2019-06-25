import { Measure } from "../../core/types/measure";

export class NodeMeasure implements Measure {

    _startTime: [number, number] | null = null;
    _endTime: [number, number] | null = null;

    start(): void {
        this._startTime = process.hrtime();
    }

    end(): number {
        if (this._startTime === null) {
            throw new Error("startTime not intialized");
        }
        this._endTime = process.hrtime(this._startTime);
        return this._endTime[1] / 1_000_000;
    }

}
