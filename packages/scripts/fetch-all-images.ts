import fs, { WriteStream } from "fs";
import nconf from "nconf";
import http from "http";
import path from "path";

export function fetchFile(url: string, writeStream: WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
        http.get(url, response => {
            response
                .pipe(writeStream)
                .on("error", err => reject(err))
                .on("close", () => resolve())
        })
    });
}

type Config =  {
    _: string[];
    h?: boolean;
    help?: boolean;
    i?: string;
    u?: string;
    o?: string;
};

const conf = nconf
    .argv()
    .get() as Config;

if (conf.h || conf.help) {
    process.stdout.write("Usage: m44-script fetch-images -i IMAGES_DICT -u IMAGES_URL [-o OUTPUT_FOLDER]\n");
    process.stdout.write("For given IMAGES_DICT fetch all images from IMAGES_URL and put them to OUTPUT_FOLDER\n");
    process.stdout.write("\n");
    process.exit();
}

console.log(conf);

(async function() {
    if (!conf.i) {
        throw new Error('-i IMAGES_DICT arg is missing !');
    }
    if (!conf.u) {
        throw new Error('-u URL arg is missing !');
    }

    const outputDir = conf.o || "./images";

    if (!fs.existsSync(conf.i!)) {
        throw new Error(`File for IMAGES_DICT doesn't exists in ${outputDir}`);
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const imagesDictFile = fs.readFileSync(conf.i!);
    const imagesDict: { [imgName: string]: string } = JSON.parse(imagesDictFile.toString());
    for (const [imageName, imagePath] of Object.entries(imagesDict)) {
        const finalOutDir = path.join(outputDir, path.dirname(imagePath));

        if (!fs.existsSync(finalOutDir)) {
            fs.mkdirSync(finalOutDir);
        }

        console.log(`Downloading [${imageName}] ${conf.u}${imagePath}`);

        try {
            const writeStream = fs.createWriteStream(path.join(outputDir, imagePath), { flags: 'w' });
            await fetchFile(conf.u + imagePath, writeStream);
        } catch(err) {
            console.error(`\t[ERROR] while downloading ${err}`);
        }
    }
})();
