"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CSV2JSON_1 = require("../src/CSV2JSON");
const fs = require('fs');
const pathCSV = './test/csvFile.csv';
const c2j = new CSV2JSON_1.CSV2JSON(undefined, undefined);
let str = '';
let i = 0;
fs.createReadStream(pathCSV)
    .pipe(c2j)
    .on('data', (data) => {
    str = JSON.stringify(data, null, 2);
    i += 1;
    if (i % 100000 === 0) {
        console.log(i);
        console.log(str);
    }
})
    .on('error', (err) => {
    console.log(err);
})
    .on('end', () => {
    console.log(str);
    console.log('end');
});
//# sourceMappingURL=testStreaming.js.map