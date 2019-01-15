const csv = require("csvtojson");
const hC = require('./headerClassifier');

const csvFilePath='./csvFile.csv';
const readStream=require('fs').createReadStream(csvFilePath);


let headerList = [];

schem = {};
result = [];

readStream.pipe(csv()
    .on('header',(header)=>{
        headerList = header;
        for (var i = 0,tot = headerList.length;i<tot;i++) {
            result = result.concat(hC.rowClassifier(headerList[i],schem));
        }
        console.log(schem);
        console.log(result);
        for (var j = 1; j<5; j++){
            Fresult = result.filter((node)=>{
                return (node.level === j);
            });
            var pathTo = schem;
            Fresult.forEach(node => {
                pathTo = schem;
                for (var p = 0,ptot = node.parent.length;p<ptot;p++){
                    pathTo = pathTo[node.parent[p]];
                }
                if (node.ptype === 'Array'){
                    if (node.isLeaf){
                        pathTo[node.index] = 'String';
                    }
                    else if (node.type === 'Array'){
                        pathTo[node.index] = [];
                    }
                    else if (node.type === 'Object'){
                        pathTo[node.index] = {};
                    }
                }
                else if (node.ptype === 'Object'){
                    if (node.isLeaf){
                        pathTo[node.key] = 'String';
                    }
                    else if (node.type === 'Array'){
                        pathTo[node.key] = [];
                    }
                    else if (node.type === 'Object'){
                        pathTo[node.key] = {};
                    }
                }
            });
        }
        console.log(JSON.stringify(schem,null,2));
    }
));

/*
setTimeout(function(){
    //console.log(headerList);
    for (var i = 0,tot = headerList.length;i<tot;i++) {
            result = result.concat(hC.rowClassifier(headerList[i],schem));
    }
    console.log(schem);
    console.log(result);
},500);

setTimeout(function(){
    var i = 0;
    //var auxL = [];
    
    console.log(schem);
},1000);
*/

function SortByIndex(auxL){
    SortedAuxL = auxL.sort(function(node1,node2){
        if (node1.index < node2.index){
            return -1;
        }
        else if (node1.index > node2.index){
            return 1;
        }
        else {
            return 0;
        }
    });
    return SortedAuxL;
}


