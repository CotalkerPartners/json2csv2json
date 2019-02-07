import { CSV2JSON } from '../src/CSV2JSON';
import { strictEqual } from 'assert';
const fs = require('fs');

const pathCSV = './test/csvFile.csv';
const c2j = new CSV2JSON(undefined, undefined);
let str = '';
console.log('batata');
fs.createReadStream(pathCSV)
.pipe(c2j)
.on('data', (data) => {
  str += JSON.stringify(data, null, 2);
})
.on('end', () => {
  console.log('STRING');
  console.log(str);
});
