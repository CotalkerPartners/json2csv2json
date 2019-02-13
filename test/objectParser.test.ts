import * as mocha from 'mocha';
import * as chai from 'chai';
import { objectParser, nestingTokenize } from '../src/JSONparser';

const testobj = {
  Name: 'Eduardo',
  telephone: [
    55555,
    66666,
  ],
  Location: {
    Address: {
      Street: 'Beale',
      Number: 99,
      MailBox: [
        'Mail',
        'Boxes',
        'Amazon',
      ],
    },
    ZipCode: 7341231,
  },
};

const headerRow = nestingTokenize(testobj);

describe('Object Parser to row string', () => {
  it('should return a row string with the object prperties', () => {
    chai.expect(objectParser(testobj, headerRow, undefined)).to.equal('Eduardo,55555,66666,Beale,99,Mail,Boxes,Amazon,7341231\n');
  });
});
