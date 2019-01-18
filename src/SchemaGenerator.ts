import {Node,rowClassify} from "./headerClassifier";

export function generateSchema(headerList:Array<string>):object {
    let schema:object = {};
    let nodeList:Array<Node> = [];
    for (let i:number = 0,tot:number = headerList.length;i<tot;i++) {
        nodeList = nodeList.concat(rowClassify(headerList[i],schema));
    }
    let maxlvl:number = Math.max.apply(Math,nodeList.map(function(node:Node):number {
        return node.level;
    }));
    for (let j:number = 1; j<maxlvl; j++) {
        let nodeListPerLevel:Array<Node> = nodeList.filter((node)=> {
            return (node.level === j);
        });
        let pathTo:any = schema;
        nodeListPerLevel.forEach(node => {
            pathTo = schema;
            for (let p:number = 0, ptot:number = node.parent.length;p<ptot;p++) {
                pathTo = pathTo[node.parent[p]];
            }
            let key:(string | number) = null;
            if (node.ptype === "Array") key = node.index;
            else if (node.ptype === "Object") key = node.key;
            if (key) {
                if (node.isLeaf) pathTo[key] = "String";
                else if (node.type === "Array")  pathTo[key] = [];
                else if (node.type === "Object") pathTo[key] = {};   
            }
        });
    }
    return schema;
}
