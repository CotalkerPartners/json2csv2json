const csv = require("csvtojson");
const hC = require('./headerClassifier');

const csvFilePath='./csvFile.csv';
const readStream=require('fs').createReadStream(csvFilePath);


let headerList = [];

readStream.pipe(csv()
    .on('header',(header)=>{
        headerList = header;
    }
));
schem = {};
result = [];
setTimeout(function(){
    //console.log(headerList);
    for (var i = 0,tot = headerList.length;i<tot;i++) {
            result = result.concat(hC.rowClassifier(headerList[i],schem));
    }
    console.log(schem);
    console.log(result);
},500);

