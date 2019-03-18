"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const SchemaGenerator_1 = require("./SchemaGenerator");
const csvParser_1 = require("./csvParser");
const _ = require('lodash');
class CSV2JSON extends stream_1.Transform {
    constructor(headersString, config) {
        super({ writableObjectMode: true, objectMode: true });
        this.remainder = '';
        this.loadedHeaders = false;
        this.readColumns = {};
        this.parsedRows = 0;
        this.separator = (config && config.separator) || ',';
        this.hasHeader = (config && config.hasHeader) || true;
        this.columns = (config && config.columns) || [];
        this.dateFormats = {};
        if (this.columns.length > 0) {
            this.schema = SchemaGenerator_1.generateSchema(this.columns.filter(column => column.read).map(column => column.objectPath));
        }
        if (!headersString && !this.hasHeader) {
            throw 'Error. Header not as input nor in file. You must provide the complete header row in some way';
        }
        if (headersString !== undefined) {
            this.headerList = headersString.split(this.separator).map(h => h.trim());
            this.loadedHeaders = true;
        }
        if (this.loadedHeaders) {
            if (this.columns.length === 0) {
                this.configColumns(this.headerList);
                this.generateReadColumns();
                if (_.isEmpty(this.schema))
                    this.schema = SchemaGenerator_1.generateSchema(this.headerList);
            }
        }
    }
    generateReadColumns() {
        this.columns.forEach((column) => {
            if (column.read) {
                this.readColumns[column.headerName] = column.objectPath;
            }
        });
    }
    getConfig() {
        const configObj = {
            separator: this.separator,
            hasHeader: this.hasHeader,
            columns: this.columns,
        };
        return configObj;
    }
    configColumns(headerList) {
        const headerLength = headerList.length;
        for (let i = 0; i < headerLength; i += 1) {
            const headerElement = headerList[i];
            const columnObj = {
                columnNum: i,
                read: true,
                type: 'string',
                headerName: headerElement,
                objectPath: headerElement,
            };
            this.columns.push(columnObj);
        }
    }
    getSchema() {
        const pathList = this.columns.filter(columnConfig => columnConfig.read)
            .map(columnConfig => columnConfig.objectPath);
        this.schema = SchemaGenerator_1.generateSchema(pathList);
        return this.schema;
    }
    typeParser(stringValue, typeval, headerName) {
        let val = null;
        switch (typeval) {
            case 'string':
                val = stringValue;
                break;
            case 'boolean':
                val = (stringValue === 'true' || stringValue === 'True');
                break;
            case 'integer':
                val = parseInt(stringValue, 10);
                break;
            case 'float':
                val = parseFloat(stringValue);
                break;
            case 'date':
                const moment = require('moment');
                if (headerName) {
                    val = moment(stringValue, this.dateFormats[headerName]);
                }
                else {
                    val = moment(stringValue); // Especificar fecha
                }
                break;
            default:
                val = stringValue;
        }
        return val;
    }
    passConfig(config) {
        this.separator = (config && config.separator) || ',';
        this.hasHeader = (config && config.hasHeader) || true;
        this.columns = (config && config.columns) || [];
    }
    // tslint:disable-next-line
    _transform(data, encoding, callback) {
        if (_.isEmpty(this.schema) && this.columns.length > 0) {
            this.schema = SchemaGenerator_1.generateSchema(this.columns.map((col) => {
                return col.objectPath;
            }));
        }
        const dataLines = data.toString().split(/\r\n|\r|\n/).filter(line => line !== '');
        if (dataLines && !data.toString().match(/\r\n|\r|\n/)) {
            this.remainder += dataLines.pop();
        }
        else {
            if ((data.slice(0, 1).toString() === '\n' || data.slice(0, 1).toString() === '\r') && this.remainder) {
                dataLines.unshift(this.remainder);
            }
            else {
                dataLines[0] = this.remainder + dataLines[0];
            }
            if (!this.headerList && _.isEmpty(this.schema) && !this.loadedHeaders) {
                this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
                if (this.columns.length === 0)
                    this.configColumns(this.headerList);
                this.schema = SchemaGenerator_1.generateSchema(this.headerList);
                this.loadedHeaders = true;
                this.generateReadColumns();
                this.parsedRows += 1;
            }
            const lastChar = data.slice(data.length - 1, data.length).toString();
            if (lastChar === '\n' || lastChar === '\r') {
                this.remainder = '';
            }
            else {
                this.remainder = dataLines.pop();
            }
            if (!this.loadedHeaders && this.hasHeader) {
                this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
                this.loadedHeaders = true;
                this.generateReadColumns();
            }
            else if (this.hasHeader && this.parsedRows === 0) {
                dataLines.shift();
            }
            const objectPaths = {};
            this.columns.forEach((column) => {
                if (column.read)
                    objectPaths[column.objectPath] = column.type;
                if (column.type === 'date')
                    this.dateFormats[column.headerName] = column.dateFormat;
            });
            if (_.isEmpty(this.readColumns)) {
                this.readColumns = {};
                this.generateReadColumns();
            }
            let typeval = '';
            dataLines.forEach((row) => {
                const values = row.split(this.separator).map(h => h.trim());
                const totalColumns = values.length;
                if (totalColumns !== this.headerList.length) {
                    throw `Row ${this.parsedRows} with different number of values than header\n${row}\n`;
                }
                for (let i = 0; i < totalColumns; i += 1) {
                    if (this.readColumns[this.headerList[i]]) {
                        typeval = objectPaths[this.readColumns[this.headerList[i]]];
                        objectPaths[this.readColumns[this.headerList[i]]] = this.typeParser(values[i], typeval, this.headerList[i]);
                    }
                }
                const obj = csvParser_1.csvDataToJSON(this.schema, objectPaths);
                this.push(obj);
                this.parsedRows += 1;
            });
        }
        callback();
    }
    // tslint:disable-next-line
    _final(callback) {
        if (this.remainder !== '') {
            const rowData = this.remainder.split(this.separator);
            const rowFieldNum = rowData.length;
            if (rowFieldNum === this.headerList.length) {
                const rowObj = {};
                for (let i = 0; i < rowFieldNum; i += 1) {
                    rowObj[this.headerList[i]] = rowData[i];
                }
                this.push(csvParser_1.csvDataToJSON(this.schema, rowObj));
            }
        }
        callback();
    }
}
exports.CSV2JSON = CSV2JSON;
//# sourceMappingURL=CSV2JSON.js.map