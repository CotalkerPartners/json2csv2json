import * as mocha from 'mocha';
import * as chai from 'chai';
import { generateSchema } from '../src/SchemaGenerator';

describe('Schema Generator', () => {
  it('should return a nested object', () => {
    chai.expect(JSON.stringify(generateSchema(['Name', 'telephone[1]', 'Location{City}{Street}[2]']), null, 2)).to.equal(JSON.stringify({
      Name: 'String',
      telephone: [null, 'String'],
      Location: {
        City: {
          Street: [null, null, 'String'],
        },
      },
    }, null, 2));
  });
});
