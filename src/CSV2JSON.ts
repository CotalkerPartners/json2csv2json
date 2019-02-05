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

export class CSV2JSON extends Transform {
  headerList: string[];
  separator: string;
  hasHeader: boolean;
  rows: IrowConfig[];
  schema: object;
  remainder: string;
  constructor(headersOrCsvPath: string, config: IconfigObj, headerAsString: boolean) {
    super({ writableObjectMode: true, objectMode: true });
    this.remainder = '';
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
      firstline(headersOrCsvPath)
      .then((headerLine) => {
        this.headerList = headerLine.split(this.separator).map(h => h.trim());
      });
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

  // tslint:disable-next-line
  _transform(data: Buffer, encoding, callback) {
    const dataString = data.toString();
    const dataLines = dataString.split(/\r\n|\r|\n/).filter(line => line !== '');
    if (dataLines && !dataString.match(/\r\n|\r|\n/)) {
      this.remainder += dataLines.pop();
    } else {
      dataLines[0] = this.remainder + dataLines[0];
      if (!this.headerList) {
        this.headerList = dataLines.shift().split(this.separator);
        this.configRows(this.headerList);
        console.log('Generated schema from first row:');
        this.printSchema();
      }
      const lastChar = dataString[dataString.length - 1];
      if (lastChar === '\n' || lastChar === '\r') {
        this.remainder = '';
      } else {
        this.remainder = dataLines.pop();
      }
      const headerNames = {};
      this.rows.forEach((row) => {
        headerNames[row.headerName] = '';
      });
      dataLines.forEach((line) => {
        const values = line.split(this.separator);
        // Queda implementar ausencia de filas en la configuración
        const totalColumns = values.length;
        for (let i = 0; i < totalColumns; i += 1) {
          headerNames[Object.keys(headerNames)[i]] = values[i];
        }
        const obj = csvDataToJSON(this.schema, headerNames);
        this.push(obj);

      });
    }
    callback();
  }

  getDataLines(data: Buffer) {

  }
}
