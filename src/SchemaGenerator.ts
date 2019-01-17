const csv = require("csvtojson");

const csvFilePath:string = "./test/csvFile.csv";

const readStream = require("fs").createReadStream(csvFilePath);

let headerList:Array<string> = [];

import {Inode,rowClassify} from "./headerClassifier";



readStream.pipe(csv()
    .on("header",(header)=> {
        let schem:object = {};
        let result:Array<Inode> = [];
        headerList = header;
        for (var i:number = 0,tot:number = headerList.length;i<tot;i++) {
            result = result.concat(rowClassify(headerList[i],schem));
        }
        for (var j:number = 1; j<6; j++) {
            let Fresult:Array<Inode> = result.filter((node)=> {
                return (node.level === j);
            });
            var pathTo:any = schem;
            Fresult.forEach(node => {
                pathTo = schem;
                for (var p:number = 0, ptot:number = node.parent.length;p<ptot;p++) {
                    pathTo = pathTo[node.parent[p]];
                }
                if (node.ptype === "Array") {
                    if (node.isLeaf) {
                        pathTo[node.index] = "String";
                    }
                    else if (node.type === "Array") {
                        pathTo[node.index] = [];
                    }
                    else if (node.type === "Object") {
                        pathTo[node.index] = {};
                    }
                }
                else if (node.ptype === "Object") {
                    if (node.isLeaf) {
                        pathTo[node.key] = "String";
                    }
                    else if (node.type === "Array") {
                        pathTo[node.key] = [];
                    }
                    else if (node.type === "Object") {
                        pathTo[node.key] = {};
                    }
                }
            });
        }
        console.log(JSON.stringify(schem,null,2));
    }
));