import {Node,rowClassify} from "./headerClassifier";


export function generateSchema(header:Array<string>):object {
    let headerList:Array<string> = [];
    let schem:object = {};
    let result:Array<Node> = [];
    headerList = header;
    for (var i:number = 0,tot:number = headerList.length;i<tot;i++) {
        result = result.concat(rowClassify(headerList[i],schem));
    }
    let maxlvl:number = Math.max.apply(Math,result.map(function(node:Node):number {
        return node.level;
    }));
    for (var j:number = 1; j<maxlvl; j++) {
        let Fresult:Array<Node> = result.filter((node)=> {
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
    return schem;
}
