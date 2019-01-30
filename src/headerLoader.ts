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
  return headerLoader(csvPath, (err, header) => {
    if (err) {
      console.log('err', err);
    } else {
      console.log(`Header: `, header);
      const schema = generateSchema(header);
      const readStream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on(`data`, (data) => {
        // Parse to csvParser
        const obj = csvDataToJSON(schema, data);
        console.log(JSON.stringify(obj, null, 2)); // Replace console log with stream export
      })
      .on(`end`, () => {
        console.log(`***End***`);
      });
    }
  });

}

function getHeaderConfig(header: string[]) {
}
// headerLoader('./test/csvFile.csv');
parseRows(`./test/csvFile.csv`);
