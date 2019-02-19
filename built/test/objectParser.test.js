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
const headerRow = JSONparser_1.nestingTokenize(testobj);
describe('Object Parser to row string', () => {
    it('should return a row string with the object prperties', () => {
        chai.expect(JSONparser_1.objectParser(testobj, headerRow, undefined)).to.equal('Eduardo,55555,66666,Beale,99,Mail,Boxes,Amazon,7341231\n');
    });
});
//# sourceMappingURL=objectParser.test.js.map