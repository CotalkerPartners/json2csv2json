import { Transform } from 'stream';
import firstline = require('firstline');
import { generateSchema } from './SchemaGenerator';
import { csvDataToJSON } from './csvParser';

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
  beganPipe: boolean;
  constructor(headersOrCsvPath: string, config: IconfigObj, headerAsString: boolean) {
    super({ writableObjectMode: true, objectMode: true });
    this.remainder = '';
    this.beganPipe = false;
    if (config === undefined) {
      this.separator = ',';
      this.hasHeader = true;
      this.columns = [];
    } else {
      if (config.separator) this.separator = config.separator; else this.separator = ',';
      if (config.hasHeader !== undefined) {
        this.hasHeader = config.hasHeader;
      } else this.hasHeader = true;
      if (config.columns !== undefined) {
        this.columns = config.columns;
        this.schema = generateSchema(this.columns.map(column => column.objectPath));
      } else this.columns = [];
    }
    if (!headerAsString && config.hasHeader === false) {
      throw 'Error. Header not as input nor in file. You must provide the complete header row in some way';
    }
    if (headerAsString && headersOrCsvPath !== undefined) {
      this.headerList = headersOrCsvPath.split(this.separator).map(h => h.trim());
    } else if (headersOrCsvPath !== undefined && this.hasHeader) {
      firstline(headersOrCsvPath)
      .then((headerLine) => {
        this.headerList = headerLine.split(this.separator).map(h => h.trim());
      });
    }

    if (this.headerList !== [] && this.headerList !== undefined) {
      if (this.columns === []) {
        this.configColumns(this.headerList);
        this.columns.forEach((column) => {
          if (column.read) {
            this.readColumns[column.headerName] = true;
          }
        });
        const pathList = this.columns.map((column) => {
          if (this.readColumns[column.headerName]) {
            return column.objectPath;
          }
        });
      }
    }
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

  printSchema() {
    const pathList = this.columns.filter(columnConfig => columnConfig.read)
    .map(columnConfig => columnConfig.objectPath);
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
      if ((dataString[0] === '\n' || dataString[0] === '\r') && this.remainder) {
        dataLines.unshift(this.remainder);
      } else {
        dataLines[0] = this.remainder + dataLines[0];
      }
      if (!this.headerList && !this.schema) {
        this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
        this.configColumns(this.headerList);
        console.log('Generated schema from first row:');
        this.printSchema();
      } else if (this.hasHeader && !this.beganPipe) {
        this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
      }
      this.beganPipe = true;
      const lastChar = dataString[dataString.length - 1];
      if (lastChar === '\n' || lastChar === '\r') {
        this.remainder = '';
      } else {
        this.remainder = dataLines.pop();
      }
      if (this.headerList === []) {
        this.headerList = dataLines.shift().split(this.separator).map(h => h.trim());
      }
      const objectPaths = {};
      this.columns.forEach((column) => {
        objectPaths[column.objectPath] = '';
      });
      dataLines.forEach((row) => {
        const values = row.split(this.separator);
        // Queda implementar ausencia de filas en la configuración
        const totalColumns = values.length;
        if (!this.readColumns) {
          this.readColumns = {};
          this.columns.forEach((col) => {
            if (col.read) this.readColumns[col.headerName] = true;
          });
        }
        for (let i = 0; i < totalColumns; i += 1) {
          if (this.readColumns[this.headerList[i]]) {
            objectPaths[this.headerList[i]] = values[i];
          }
        }
        const obj = csvDataToJSON(this.schema, objectPaths);
        this.push(obj);

      });
    }
    callback();
  }
}
