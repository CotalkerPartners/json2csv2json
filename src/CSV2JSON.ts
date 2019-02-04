import { Transform } from 'stream';
import firstline = require('firstline');
import { generateSchema } from './SchemaGenerator';
import { csvDataToJSON } from './csvParser';

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

  _transform(data, encoding, callback) {
    const csv = require('csv-parser');
    this.on('pipe', (source) => {
      source.unpipe(this);
      source.pipe(csv({ separator: this.separator, headers: this.hasHeader }))
      .on('header', (header) => {
        if (this.rows === [] && this.hasHeader === true) {
          this.schema = generateSchema(header);
          this.configRows(header);
        }
      })
      .on('data', (csvData: string[]) => {
        if (this.schema === {} || this.schema === undefined) {
          setTimeout(() => {
            if (this.schema === {} || this.schema === undefined) {
              throw `Error. Timeout, schema not generated`;
            } else {
              const obj = csvDataToJSON(this.schema, csvData);
              this.push(obj);
            }
          }, 1000);
        } else {
          const obj = csvDataToJSON(this.schema, csvData);
          this.push(obj);
        }
      });
    })
    .on('error', (err) => {
      throw err;
    });
    callback();
  }
}
