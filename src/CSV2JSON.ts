import { Transform } from 'stream';
import { generateSchema } from './SchemaGenerator';
import { csvDataToJSON } from './csvParser';
const _ = require('lodash');
interface IcolumnConfig {
  columnNum: number;
  read: boolean;
  type: string; // Change afterwards to string literals ('String' |'Integer' | 'Boolean' | 'Date') etc
  headerName: string;
  objectPath: string;
}

interface IconfigObj {
  separator?: string;
  hasHeader?: boolean;
  columns?: IcolumnConfig[];
}

export class CSV2JSON extends Transform {
  headerList: string[];
  separator: string;
  hasHeader: boolean;
  columns: IcolumnConfig[];
  schema: object;
  remainder: string;
  readColumns: object;
  loadedHeaders: boolean;
  parsedRows: number;
  constructor(headersString: string, config: IconfigObj) {
    super({ writableObjectMode: true, objectMode: true });
    this.remainder = '';
    this.loadedHeaders = false;
    this.readColumns = {};
    this.parsedRows = 0;
    this.separator = (config && config.separator) || ',';
    this.hasHeader = (config && config.hasHeader) || true;
    this.columns = (config && config.columns) || [];
    if (this.columns.length > 0) {
      this.schema = generateSchema(this.columns.filter(column => column.read).map(column => column.objectPath));
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
        this.generateReadColumns(this.columns);
        if (_.isEmpty(this.schema)) this.schema = generateSchema(this.headerList);
      }
    }
  }

  generateReadColumns(columns) {
    this.columns.forEach((column) => {
      if (column.read) {
        this.readColumns[column.headerName] = column.objectPath;
      }
    });
  }

  getConfig() {
    const configObj: IconfigObj = {
      separator: this.separator,
      hasHeader: this.hasHeader,
      columns: this.columns,
    };
    return configObj;
  }

  configColumns(headerList) {
    const headerLength: number = headerList.length;
    for (let i = 0; i < headerLength; i += 1) {
      const headerElement: string = headerList[i];
      const columnObj: IcolumnConfig = {
        columnNum: i,
        read: true,
        type: 'String',
        headerName: headerElement,
        objectPath: headerElement,
      };
      this.columns.push(columnObj);
    }
  }

  getSchema() {
    const pathList = this.columns.filter(columnConfig => columnConfig.read)
    .map(columnConfig => columnConfig.objectPath);
    this.schema = generateSchema(pathList);
    return this.schema;
  }

  // tslint:disable-next-line
  _transform(data: Buffer, encoding, callback) {
    if (_.isEmpty(this.schema) && this.columns.length > 0) {
      this.schema =  generateSchema(this.columns.map((col) => {
        return col.objectPath;
      }));
    }
    const dataLines = data.toString().split(/\r\n|\r|\n/).filter(line => line !== '');
    if (dataLines && !data.toString().match(/\r\n|\r|\n/)) {
      this.remainder += dataLines.pop();
    } else {
      if ((data.slice(0, 1).toString() === '\n' || data.slice(0, 1).toString() === '\r') && this.remainder) {
        dataLines.unshift(this.remainder);
      } else {
        dataLines[0] = this.remainder + dataLines[0];
      }
      if (!this.headerList && _.isEmpty(this.schema) && !this.loadedHeaders) {
        this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
        if (!this.columns) this.configColumns(this.headerList);
        this.schema = generateSchema(this.headerList);
        this.loadedHeaders = true;
        this.generateReadColumns(this.columns);
        this.parsedRows += 1;
      }
      const lastChar = data.slice(data.length - 1, data.length).toString();
      if (lastChar === '\n' || lastChar === '\r') {
        this.remainder = '';
      } else {
        this.remainder = dataLines.pop();
      }
      if (!this.loadedHeaders && this.hasHeader) {
        this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
        this.loadedHeaders = true;
        this.generateReadColumns(this.columns);
      } else if (this.hasHeader && this.parsedRows === 0) {
        dataLines.shift();
      }
      const objectPaths = {};
      this.columns.forEach((column) => {
        if (column.read) objectPaths[column.objectPath] = '';
      });
      if (_.isEmpty(this.readColumns)) {
        this.readColumns = {};
        this.generateReadColumns(this.columns);
      }
      dataLines.forEach((row) => {
        const values = row.split(this.separator);
        const totalColumns = values.length;
        if (totalColumns !== this.headerList.length) {
          throw `Row ${this.parsedRows} with different number of values than header\n${row}\n`;
        }
        for (let i = 0; i < totalColumns; i += 1) {
          if (this.readColumns[this.headerList[i]]) {
            objectPaths[this.readColumns[this.headerList[i]]] = values[i];
          }
        }
        const obj = csvDataToJSON(this.schema, objectPaths);
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
        this.push(csvDataToJSON(this.schema, rowObj));
      }
    }
    callback();
  }
}
