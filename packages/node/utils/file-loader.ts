import fs from "fs";
import * as t from "io-ts";
import * as reporters from "io-ts-reporters";

// export function fileLoader<T extends t.TypeC<any>>(filePath: string, decoder: T): t.TypeOf<T> {
export function fileLoader(filePath: string, decoder: any): any {
    if (!fs.existsSync(filePath)) {
        throw new Error(`incorrect_path: ${filePath}`);
    }

    let file: Buffer;
    // let data: t.TypeOf<T>;
    let data: any;
    try {
        file = fs.readFileSync(filePath);
    } catch(err) {
        throw new Error(`cannot_read_file: ${err}`);
    }

    try {
        data = JSON.parse(file.toString());
    } catch(err) {
        throw new Error(`cannot_parse_file: ${err}`);
    }

    const result = decoder.decode(data);
    // result.isLeft
    // const report = reporters.reporter(result);
    if (result.isLeft) {
        throw new Error(`cannot_decode: ${filePath}`);
    }
    return data;
}
