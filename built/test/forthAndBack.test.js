"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CSV2JSON_1 = require("../src/CSV2JSON");
const JSON2CSV_1 = require("../src/JSON2CSV");
const fs_1 = require("fs");
const chai = require("chai");
const stream_1 = require("stream");
const obj = {
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
};
describe('--object-> JSON2CSV --.csv-> CSV2JSON --object->', () => {
    it('Should return the same objects provided', () => {
        backAndForth((err, data) => {
            if (err) {
                return err;
            }
            chai.expect(data).to.equal(JSON.stringify(obj, null, 2));
        });
    });
});
function backAndForth(callback) {
    const c2j = new CSV2JSON_1.CSV2JSON(undefined, undefined);
    const j2c = new JSON2CSV_1.JSON2CSV(undefined, undefined);
    const oS = new ObjectStreamer();
    let res = {};
    fs_1.createReadStream('./test/objFile.json')
        .pipe(oS)
        .pipe(j2c)
        .pipe(c2j)
        .on('data', (data) => {
        res = data;
    })
        .on('error', err => callback(err))
        .on('end', () => {
        return callback(null, JSON.stringify(res, null, 2));
    });
}
class ObjectStreamer extends stream_1.Transform {
    constructor() {
        super({ objectMode: true });
        this.buf = '';
    }
    // tslint:disable-next-line
    _transform(chunk, enc, callback) {
        this.buf += chunk.toString();
        callback();
    }
    // tslint:disable-next-line
    _final(callback) {
        if (this.buf) {
            const rows = JSON.parse(this.buf).Rows;
            rows.forEach(o => this.push(o));
        }
        callback();
    }
}
//# sourceMappingURL=forthAndBack.test.js.map