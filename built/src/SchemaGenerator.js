"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const headerClassifier_1 = require("./headerClassifier");
function generateSchema(headerList) {
    const schema = {};
    let nodeList = [];
    const headerSize = headerList.length;
    for (let i = 0; i < headerSize; i += 1) {
        nodeList = nodeList.concat(headerClassifier_1.rowClassify(headerList[i], schema));
    }
    const maxlvl = Math.max.apply(Math, nodeList.map((node) => node.level));
    const nodesMap = {};
    nodeList.forEach((node) => {
        if (!nodesMap[node.level]) {
            nodesMap[node.level] = [];
        }
        nodesMap[node.level].push(node);
    });
    for (let j = 1; j <= maxlvl; j += 1) {
        const nodeListPerLevel = nodesMap[j];
        let pathTo = schema;
        nodeListPerLevel.forEach((node) => {
            pathTo = schema;
            for (let p = 0, parentSize = node.parent.length; p < parentSize; p += 1) {
                pathTo = pathTo[node.parent[p]];
            }
            let key = null;
            if (node.ptype === `Array`)
                key = node.index;
            else if (node.ptype === `Object`)
                key = node.key;
            if (key !== null) {
                if (node.isLeaf)
                    pathTo[key] = `String`;
                else if (node.type === `Array`)
                    pathTo[key] = [];
                else if (node.type === `Object`)
                    pathTo[key] = {};
            }
        });
    }
    return schema;
}
exports.generateSchema = generateSchema;
//# sourceMappingURL=SchemaGenerator.js.map