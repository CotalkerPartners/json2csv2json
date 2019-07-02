"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const JSONparser_1 = require("./JSONparser");
const _ = require('lodash');
class JSON2CSV extends stream_1.Transform {
    constructor(objectSchema, config) {
        super({ objectMode: true });
        this.pathListLoaded = false;
        this.passedHeader = false;
        this.separator = (config && config.separator) || ',';
        this.hasHeader = (config && config.hasHeader) || true;
        this.envelopeFix = (config && config.envelopeFix) || true;
        this.errorOnNull = (config && config.errorOnNull) || false;
        this.lineBufferNum = (config && config.bufferNum) || 100000;
        this.objectSchema = objectSchema || {};
        this.lineBuffer = '';
        if (config) {
            this.columns = config.columns.sort((a, b) => {
                return a.columnNum - b.columnNum;
            });
            this.pathList = this.columns.map((column) => {
                if (column.read)
                    return column.objectPath;
            });
            this.pathListLoaded = true;
        }
        else if (!_.isEmpty(this.objectSchema)) {
            this.generateConfig(this.objectSchema);
        }
    }
    generateConfig(objectSchema) {
        this.pathList = JSONparser_1.nestingTokenize(objectSchema);
        this.pathListLoaded = true;
        const PathListSize = this.pathList.length;
        this.columns = [];
        for (let i = 0; i < PathListSize; i += 1) {
            this.columns.push({
                columnNum: i,
                read: true,
                type: 'String',
                headerName: this.pathList[i],
                objectPath: this.pathList[i],
            });
        }
    }
    getConfig() {
        const config = {
            separator: this.separator,
            hasHeader: this.hasHeader,
            errorOnNull: this.errorOnNull,
            columns: this.columns,
        };
        return config;
    }
    passConfig(config) {
        this.separator = (config && config.separator) || ',';
        this.hasHeader = (config && config.hasHeader) || true;
        this.columns = (config && config.columns) || [];
    }
    // tslint:disable-next-line: function-name
    _transform(chunk, enc, callback) {
        let row = '';
        if (!this.pathListLoaded) {
            // Generate config and pathList with the first passed object
            this.generateConfig(chunk);
            if (this.hasHeader) {
                row = this.pathList.join(this.separator);
                row += '\n';
                this.passedHeader = true;
            }
            row += JSONparser_1.objectParser(chunk, this.pathList, {
                errorOnNull: this.errorOnNull,
                separator: this.separator,
                envelopeFix: this.envelopeFix,
            });
            this.push(row);
        }
        else {
            if (this.hasHeader && !this.passedHeader) {
                row += this.columns.map((column) => {
                    return column.headerName;
                }).join(this.separator);
                row += '\n';
                this.passedHeader = true;
            }
            row += JSONparser_1.objectParser(chunk, this.pathList, {
                errorOnNull: this.errorOnNull,
                separator: this.separator,
                envelopeFix: this.envelopeFix,
            });
            this.lineBuffer += row;
            const lineBufferSize = this.lineBuffer.length;
            if (lineBufferSize >= this.lineBufferNum) {
                this.push(this.lineBuffer);
                this.lineBuffer = '';
            }
        }
        callback();
    }
    // tslint:disable-next-line: function-name
    _final(callback) {
        const lineBufferLength = this.lineBuffer.length;
        if (lineBufferLength > 0) {
            this.push(this.lineBuffer);
            this.lineBuffer = '';
        }
        callback();
    }
}
exports.JSON2CSV = JSON2CSV;
//# sourceMappingURL=JSON2CSV.js.map