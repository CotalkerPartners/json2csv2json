"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const JSONparser_1 = require("../src/JSONparser");
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
        chai.expect(JSONparser_1.nestingTokenize(testobj).toString()).to.equal([
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
//# sourceMappingURL=nestingTokenize.test.js.map