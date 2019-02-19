import { CSV2JSON } from '../src/CSV2JSON';
import { JSON2CSV } from '../src/JSON2CSV';
import { createReadStream } from 'fs';
import * as mocha from 'mocha';
import * as chai from 'chai';

describe('--.csv-> CSV2JSON --object-> JSON2CSV --.csv->', () => {
  it('Should return the same csv provided', () => {
    backAndForth((err, data) => {
      if (err) {
        return err;
      }
      chai.expect(data).to.equal('Gonzalo Duran,gonzaloduran@cotalker.com,+56955555555,+56955555556,dory\n');
    });
  });
});

function backAndForth(callback) {
  const c2j = new CSV2JSON(undefined, undefined);
  const j2c = new JSON2CSV(undefined, undefined);
  let str = '';
  createReadStream('./test/csvFile.csv')
  .pipe(c2j)
  .pipe(j2c)
  .on('data', (data) => {
    str = data;
  })
  .on('error', err => callback(err))
  .on('end', () => {
    return callback(null, str);
  });
}
