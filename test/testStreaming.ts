import { CSV2JSON } from '../src/CSV2JSON';
import { strictEqual } from 'assert';
const fs = require('fs');

const pathCSV = './test/csvFile.csv';
const c2j = new CSV2JSON(undefined, undefined);
let str = '';
let i = 0;
fs.createReadStream(pathCSV)
.pipe(c2j)
.on('data', (data) => {
  str = JSON.stringify(data, null, 2);
  i += 1;
  if (i % 10000 === 0) {
    console.log(str);
  }
})
.on('error', (err) => {
  console.log(err);
})
.on('end', () => {
  console.log('END');
  console.log(str);
});
