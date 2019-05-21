import http from "http";
import { WriteStream } from "fs";

export function fetchFile(url: string, writeStream: WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            response
                .on("error", err => reject(err))
                .on("close", () => resolve())
                .pipe(writeStream)
        })
    });
}

// (async function() {
//     const ws = createWriteStream("./p.png");
//     await fetchFile("http://static.daysofwonder.com/memoir44/sed_images/hex_188_217/mp_infus.png", ws);
// })();
