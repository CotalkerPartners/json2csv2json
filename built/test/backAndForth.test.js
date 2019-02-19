"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CSV2JSON_1 = require("../src/CSV2JSON");
const JSON2CSV_1 = require("../src/JSON2CSV");
const fs_1 = require("fs");
const chai = require("chai");
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
    const c2j = new CSV2JSON_1.CSV2JSON(undefined, undefined);
    const j2c = new JSON2CSV_1.JSON2CSV(undefined, undefined);
    let str = '';
    fs_1.createReadStream('./test/csvFile.csv')
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
//# sourceMappingURL=backAndForth.test.js.map