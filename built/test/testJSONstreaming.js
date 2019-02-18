"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSON2CSV_1 = require("../src/JSON2CSV");
const CSV2JSON_1 = require("../src/CSV2JSON");
const fs = require('fs');
const pathCSV = './test/csvFile_large.csv';
const j2c = new JSON2CSV_1.JSON2CSV(undefined, {
    separator: ';',
    columns: [
        {
            columnNum: 1,
            read: true,
            type: 'String',
            objectPath: 'fish{reef}[2]{avenue}{depth}[3]',
            headerName: 'FishName',
        },
        {
            columnNum: 0,
            read: true,
            type: 'String',
            objectPath: 'email',
            headerName: 'E-mail',
        },
    ],
});
const c2j = new CSV2JSON_1.CSV2JSON(undefined, undefined);
let i = 0;
fs.createReadStream(pathCSV)
    .pipe(c2j)
    .pipe(j2c)
    .on('data', (data) => {
    i += 1;
    if (i % 100000 === 0) {
        console.log(i);
        console.log(data);
    }
});
//# sourceMappingURL=testJSONstreaming.js.map