import * as mocha from 'mocha';
import * as chai from 'chai';
import { CSV2JSON } from '../src/CSV2JSON';
import { createReadStream } from 'fs';

describe('Parser with header names and config provided', () => {
  it('should return nested objects', () => {
    testCSVPathStream((err, data) => {
      if (err) return;
      chai.expect(data).to.equal((JSON.stringify({
        Contact: {
          email: 'esotom92@gmail.com',
        },
      }, null, 2) +
      JSON.stringify({
        Contact: {
          email: 'gonzalorojas@cotalker.com',
        },
      }, null, 2) +
      JSON.stringify({
        Contact: {
          email: 'gonzaloduran@cotalker.com',
        },
      }, null, 2)));
    });
  });
});

function testCSVPathStream(callback) {
  const c2j = new CSV2JSON('Name,email,telephone[2],telephone[3],fish{reef}[2]{avenue}{depth}[3]', {columns: [
    {
      columnNum: 0,
      headerName: 'email',
      objectPath: 'Contact{email}',
      type: 'String',
      read: true,
    },
  ]});
  let str = '';

  createReadStream('./test/csvFile.csv')
  .pipe(c2j)
  .on('error', err => callback(err))
  .on('data', (data) => {
    str += JSON.stringify(data, null, 2);
  })
  .on('end', () => {
    return callback(null, str);
  });
}
