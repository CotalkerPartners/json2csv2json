import * as mocha from 'mocha';
import * as chai from 'chai';
import { nestingTokenize } from '../src/JSONparser';

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

describe('Object nesting tokenizer', () => {
  it('should return a string array of headers with nesting syntax', () => {
    chai.expect(nestingTokenize(testobj).toString()).to.equal([
      'Name',
      'telephone[0]',
      'telephone[1]',
      'Location{Address}{Street}',
      'Location{Address}{Number}',
      'Location{Address}{MailBox}[0]',
      'Location{Address}{MailBox}[1]',
      'Location{Address}{MailBox}[2]',
      'Location{ZipCode}',
    ].toString());
  });
});
