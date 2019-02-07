import * as mocha from 'mocha';
import * as chai from 'chai';
import { CSV2JSON } from '../src/CSV2JSON';
import { createReadStream } from 'fs';

describe('Parser with only header names provided', () => {
  it('should return nested objects', () => {
    testCSVPathStream((err, data) => {
      if (err) return;
      chai.expect(data).to.equal((JSON.stringify({
        Name: 'Eduardo Soto',
        email: 'esotom92@gmail.com',
        telephone: [
          null,
          null,
          '+56965691064',
          '+56965691065',
        ],
        fish: {
          reef: [
            null,
            null,
            {
              avenue: {
                depth: [
                  null,
                  null,
                  null,
                  'nemo',
                ],
              },
            },
          ],
        },
      }, null, 2) +
    JSON.stringify({
      Name: 'Gonzalo Rojas',
      email: 'gonzalorojas@cotalker.com',
      telephone: [
        null,
        null,
        '+56977777777',
        '+56977777778',
      ],
      fish: {
        reef: [
          null,
          null,
          {
            avenue: {
              depth: [
                null,
                null,
                null,
                'merlin',
              ],
            },
          },
        ],
      },
    }, null, 2) +
    JSON.stringify({
      Name: 'Gonzalo Duran',
      email: 'gonzaloduran@cotalker.com',
      telephone: [
        null,
        null,
        '+56955555555',
        '+56955555556',
      ],
      fish: {
        reef: [
          null,
          null,
          {
            avenue: {
              depth: [
                null,
                null,
                null,
                'dory',
              ],
            },
          },
        ],
      },
    }, null, 2)));
    });
  });
});

function testCSVPathStream(callback) {
  const c2j = new CSV2JSON('Name,email,telephone[2],telephone[3],fish{reef}[2]{avenue}{depth}[3]', undefined);
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
