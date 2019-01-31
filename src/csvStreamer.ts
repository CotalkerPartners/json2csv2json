import { csvDataToJSON } from './csvParser';
import { generateSchema } from './SchemaGenerator';

function headerLoader(csvPath: string, callback) {
  const fs = require(`fs`);
  const csv = require(`csv-parser`);
  fs.createReadStream(csvPath)
  .pipe(csv())
  .on('error', (err) => {
    console.log(err);
    return callback(err);
  })
  .on('headers', (headers) => {
    console.log(headers);
    return callback(null, headers);
  })
  .on('end', () => {
    console.log(`end`);
    return callback(null, []);
  });
}

function parseRows(csvPath: string) {
  const fs = require(`fs`);
  const csv = require(`csv-parser`);
  const Writable = require(`stream`).Writable;
  const ws = Writable({ objectMode: true });
  ws._write = function (chunk, enc, callback) {
    console.log(chunk);
    console.log('--------- XXX -------');
    // process.stdout.on('data', chunk);

    callback();
  };

  return headerLoader(csvPath, (err, header) => {
    if (err) {
      throw err;
    } else {
      console.log(`Header: `, header);
      const schema = generateSchema(header);
      const readStream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on(`data`, (data) => {
        const obj = csvDataToJSON(schema, data);
        // Stream export
        ws.write(obj);
      })
      .on(`end`, () => {
        ws.end();
        console.log(`***End***`);
      });
    }
  });

}

function getHeaderConfig(header: string[]) {
}

parseRows(`./test/csvFile.csv`);
