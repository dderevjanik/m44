export class Measure {

    _startTime: [number, number];
    _endTime: [number, number];

    constructor() {
        this._startTime = process.hrtime();
        this._endTime = process.hrtime();
    }

    end(): number {
        this._endTime = process.hrtime(this._startTime);
        return this._endTime[1] / 1_000_000;
    }

}
