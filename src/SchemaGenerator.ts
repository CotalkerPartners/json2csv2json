import {Node,rowClassify} from "./headerClassifier";

export function generateSchema(headerList:Array<string>):object {
    let schema:object = {};
    let nodeList:Array<Node> = [];
    let headerSize:number = headerList.length;
    for (let i:number = 0;i<headerSize;i++) {
        nodeList = nodeList.concat(rowClassify(headerList[i],schema));
    }
    let maxlvl:number = Math.max.apply(Math,nodeList.map((node:Node) => node.level));
    const nodesMap: { [level: number]: Node[] } = {};
    nodeList.forEach((node) => {
        if (!nodesMap[node.level]) {
             nodesMap[node.level] = [];
        }
        nodesMap[node.level].push(node);
    } );

    for (let j:number = 1; j<=maxlvl; j++) {
        let nodeListPerLevel:Array<Node> = nodesMap[j];
        let pathTo:any = schema;
        nodeListPerLevel.forEach(node => {
            pathTo = schema;
            for (let p:number = 0, parentSize:number = node.parent.length;p<parentSize;p++) {
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
