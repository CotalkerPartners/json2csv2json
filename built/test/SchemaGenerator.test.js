"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const SchemaGenerator_1 = require("../src/SchemaGenerator");
describe('Schema Generator', () => {
    it('should return a nested object', () => {
        chai.expect(JSON.stringify(SchemaGenerator_1.generateSchema(['Name', 'telephone[1]', 'Location{City}{Street}[2]']), null, 2)).to.equal(JSON.stringify({
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
//# sourceMappingURL=SchemaGenerator.test.js.map