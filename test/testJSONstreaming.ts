import { JSON2CSV } from '../src/JSON2CSV';
import { CSV2JSON } from '../src/CSV2JSON';
const fs = require('fs');

const pathCSV = './test/csvFile.csv';
const j2c = new JSON2CSV(undefined, undefined);
const c2j = new CSV2JSON(undefined, undefined);

fs.createReadStream(pathCSV)
.pipe(c2j)
.pipe(j2c)
.pipe(process.stdout);
