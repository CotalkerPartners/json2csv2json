import * as mocha from 'mocha';
import * as chai from 'chai';
import { JSON2CSV } from '../src/JSON2CSV';
import { createReadStream } from 'fs';
import { Transform } from 'stream';

describe('Object parser with config provided', () => {
  it('should return . separated values', () => {
    testCSVPathStream((err, data) => {
      if (err) return;
      chai.expect(data).to.equal('dory.gonzaloduran@cotalker.com\n');
    });
  });
});

function testCSVPathStream(callback) {
  const oS = new ObjectStreamer();
  const j2c = new JSON2CSV(undefined, {
    separator: '.',
    columns: [
      {
        columnNum: 1,
        headerName: 'E-mail',
        objectPath: 'email',
        type: 'String',
        read: true,
      },
      {
        columnNum: 0,
        headerName: 'Fish Name',
        objectPath: 'fish{reef}[2]{avenue}{depth}[3]',
        type: 'String',
        read: true,
      },
    ],
  });
  let str = '';

  createReadStream('./test/objFile.json')
  .pipe(oS)
  .pipe(j2c)
  .on('error', err => callback(err))
  .on('data', (data) => {
    str = data;
  })
  .on('end', () => {
    return callback(null, str);
  });
}

class ObjectStreamer extends Transform {
  buf: string;
  constructor() {
    super({ objectMode: true });
    this.buf = '';
  }
// tslint:disable-next-line
  _transform(chunk: Buffer, enc, callback) {
    this.buf += chunk.toString();
    callback();
  }
// tslint:disable-next-line
  _final(callback) {
    if (this.buf) {
      const rows: object[] = JSON.parse(this.buf).Rows;
      rows.forEach(obj => this.push(obj));
    }
    callback();
  }
}
