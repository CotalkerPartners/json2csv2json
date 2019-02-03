import { Transform } from 'stream';
import firstline = require('firstline');
import { generateSchema } from './SchemaGenerator';

interface IrowConfig {
  rowID: number;
  read: boolean;
  type: string; // Change afterwards to string literals ('String' |'Integer' | 'Boolean' | 'Date') etc
  headerName: string;
  objectPath: string;
}

interface IconfigObj {
  separator?: string;
  hasHeader?: boolean;
  rows?: IrowConfig[];
}

class CSV2JSON extends Transform {
  headerList: string[];
  separator: string;
  hasHeader: boolean;
  rows: IrowConfig[];
  schema: object;
  constructor(headersOrCsvPath: string, config: IconfigObj, headerAsString: boolean) {
    super({ writableObjectMode: true });
    if (config === undefined) {
      this.separator = ',';
      this.hasHeader = true;
      this.rows = [];
    } else {
      if (config.separator) this.separator = config.separator; else this.separator = ',';
      if (config.hasHeader !== undefined) this.hasHeader = config.hasHeader;
      if (config.rows !== undefined) this.rows = config.rows; else this.rows = [];
    }
    if (headerAsString && headersOrCsvPath !== undefined) {
      this.headerList = headersOrCsvPath.split(this.separator).map(h => h.trim());
    } else if (headersOrCsvPath !== undefined && this.hasHeader) {
      this.headerList = firstline(headersOrCsvPath).split(this.separator).map(h => h.trim());
    }

    if (this.headerList !== [] && this.headerList !== undefined && this.rows === []) {
      this.configRows(this.headerList);
    }
  }
  configRows(headerList) {
    const headerLength: number = headerList.length;
    for (let i = 0; i < headerLength; i += 1) {
      const headerElement: string = headerList[i];
      const rowObj: IrowConfig = {
        rowID: i,
        read: true,
        type: 'String',
        headerName: headerElement,
        objectPath: headerElement,
      };
      this.rows.push(rowObj);
    }
  }

  printSchema() {
    const pathList = this.rows.filter(rowConfig => rowConfig.read)
    .map(rowConfig => rowConfig.objectPath);
    this.schema = generateSchema(pathList);
    console.log(JSON.stringify(this.schema, null, 2));
  }
}
