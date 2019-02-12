import { Transform } from 'stream';
import { nestingTokenize, objectParser } from './JSONparser';
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
  errorOnNull?: boolean;
}

export class JSON2CSV extends Transform {
  objectSchema: object;
  columns: IcolumnConfig[];
  pathList: string[];
  pathListLoaded: boolean;
  separator: string;
  hasHeader: boolean;
  errorOnNull: boolean;
  constructor(objectSchema: object, config: IconfigObj) {
    super({ objectMode: true });
    this.pathListLoaded = false;
    this.separator = (config && config.separator) || ',';
    this.hasHeader = (config && config.hasHeader) || true;
    this.errorOnNull = (config && config.errorOnNull) || false;
    this.objectSchema = objectSchema || {};
    if (config) {
      this.columns = config.columns; // Aplicar sort por columnNum
      this.pathList = this.columns.map((column) => {
        if (column.read) return column.objectPath;
      });
      this.pathListLoaded = true;
    } else if (!_.isEmpty(this.objectSchema)) {
      this.generateConfig(this.objectSchema);
    }
  }
  generateConfig(objectSchema: object) {
    this.pathList = nestingTokenize(objectSchema);
    this.pathListLoaded = true;
    const PathListSize = this.pathList.length;
    this.columns = [];
    for (let i = 0; i < PathListSize; i += 1) {
      this.columns.push(
        {
          columnNum: i,
          read: true,
          type: 'String',
          headerName: this.pathList[i],
          objectPath: this.pathList[i],
        },
      );
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
  // tslint:disable-next-line
  _transform(chunk, enc, callback) {
    if (!this.pathListLoaded) {
      // Generate config and pathList with the first passed object
      let row = '';
      this.generateConfig(chunk);
      if (this.hasHeader) {
        row = this.pathList.join(this.separator);
        row += '\n';
      }
      row += objectParser(chunk, this.pathList, {
        errorOnNull: this.errorOnNull,
        separator: this.separator,
      });
      this.push(row);
    } else {
      const row = objectParser(chunk, this.pathList, {
        errorOnNull: this.errorOnNull,
        separator: this.separator,
      });
      this.push(row);
    }
    callback();
  }
}
