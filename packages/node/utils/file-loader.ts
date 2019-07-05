import fs from "fs";
import * as log4js from "log4js";
import * as t from "io-ts";
import * as reporters from "io-ts-reporters";

const log = log4js.getLogger("FILE-LOADER");

// export function fileLoader<T extends t.Type<any>>(filePath: string, decoder: T): t.TypeOf<T> {
export function fileLoader(filePath: string, decoder: any): any {
    if (!fs.existsSync(filePath)) {
        log.error(`Path is not correct "${filePath}"`);
        throw new Error("incorrect_path");
    }

    let file: Buffer;
    // let data: t.TypeOf<T>;
    let data: any;
    try {
        file = fs.readFileSync(filePath);
    } catch(err) {
        log.error(`Cannot read file "${filePath}" \n ${err}`);
        throw new Error("cannot_read_file");
    }

    try {
        data = JSON.parse(file.toString());
    } catch(err) {
        log.error(`Cannot parse file "${filePath}"`);
        throw new Error("cannot_parse_file");
    }

    const result = decoder.decode(data);
    const report = reporters.reporter(result);
    if (report.length) {
        log.error(`Cannot decode JSON, ${JSON.stringify(report)}`);
        throw new Error("cannot_decode");
    }
    return data;
}
