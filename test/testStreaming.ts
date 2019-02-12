import { CSV2JSON } from '../src/CSV2JSON';
const fs = require('fs');

const pathCSV = './csvFile_large.csv';
const c2j = new CSV2JSON(undefined, undefined);
let str = '';
fs.createReadStream(pathCSV)
.pipe(c2j)
.on('data', (data) => {
  str = JSON.stringify(data, null, 2);
})
.on('error', (err) => {
  console.log(err);
})
.on('end', () => {
  console.log('end');
});
