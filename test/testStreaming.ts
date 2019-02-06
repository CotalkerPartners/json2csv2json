import { CSV2JSON } from '../src/CSV2JSON';
const fs = require('fs');

const pathCSV = './csvFile.csv';
const c2j = new CSV2JSON(undefined, {columns: [
  {
    columnNum: 0,
    headerName: 'fish{reef}[2]{avenue}{depth}[3]',
    objectPath: 'fish{reef}[2]{avenue}{depth}[3]',
    type: 'String',
    read: true,
  },
]}, undefined);

fs.createReadStream(pathCSV)
.pipe(c2j)
.on('data', (data) => {
  console.log(JSON.stringify(data, null, 2));
});
