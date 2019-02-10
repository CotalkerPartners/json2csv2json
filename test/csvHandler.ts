import {parse} from 'papaparse';
import {readFileSync} from 'fs';
import {generateSchema} from '../src/SchemaGenerator';


const file = readFileSync("./csvFile.csv","utf8");
let headerList:Array<string>;
parse(file, {
    header:true,
    complete: (result) => {
    headerList = result.meta['fields'];}
});

let schema:object = generateSchema(headerList);

console.log(JSON.stringify(schema,null,2));