import { Transform } from 'stream';
import firstline = require('firstline');

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

    if (this.headerList !== [] && this.headerList !== undefined && this.rows !== []) {
      this.configRows(this.headerList);
    }
  }
  configRows(headerList) {
    // implementar configuración de columnas
  }
}
