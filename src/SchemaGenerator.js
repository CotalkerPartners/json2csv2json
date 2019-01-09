const csv = require("csvtojson");


const csvFilePath='./csvFile.csv';
const readStream=require('fs').createReadStream(csvFilePath);


let headerList = [];

readStream.pipe(csv()
    .on('header',(header)=>{
        headerList = header;
    }
));

setTimeout(function(){
    console.log(headerList);
},500);

