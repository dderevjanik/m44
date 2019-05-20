import { SedData } from "./models/sed_data";
import { M44 } from "./models/m44";
import { readFileSync } from "fs";
import * as reporters from "io-ts-reporters";

const sedData = JSON.parse(readFileSync("../data/sed_data.json").toString()) as SedData;
const testMap = JSON.parse(readFileSync("../data/test.m44").toString()) as M44;

const sedDataResult = SedData.decode(sedData);
const testMapResult = M44.decode(testMap);

console.log(reporters.reporter(sedDataResult));
console.log(reporters.reporter(testMapResult));
