"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenClassify_1 = require("./tokenClassify");
function objCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function csvDataToJSON(schema, rowData) {
    const rowPaths = Object.keys(rowData);
    const rowObj = objCopy(schema);
    rowPaths.forEach((rowPath) => {
        const nestingMap = tokenClassify_1.tokenizeClassifier(rowPath);
        let path = rowObj[nestingMap.tokens[0]];
        const nestingSize = nestingMap.modes.length;
        for (let i = 1; i < nestingSize - 1; i += 1) { // Last element of nesting corresponds to the data path
            if (nestingMap.modes[i] === 'Object' && nestingSize > 1) {
                path = path[nestingMap.tokens[i]];
            }
            else if (nestingMap.modes[i] === 'Array' && nestingSize > 1) {
                path = path[parseInt(nestingMap.tokens[i], 10)];
            }
        }
        if (nestingMap.modes[nestingSize - 1] === 'Object' && nestingSize > 1) {
            path[nestingMap.tokens[nestingSize - 1]] = rowData[rowPath];
        }
        else if (nestingMap.modes[nestingSize - 1] === 'Array' && nestingSize > 1) {
            path[parseInt(nestingMap.tokens[nestingSize - 1], 10)] = rowData[rowPath];
        }
        else if (nestingSize === 1) {
            rowObj[nestingMap.tokens[0]] = rowData[rowPath];
        }
    });
    return rowObj;
}
exports.csvDataToJSON = csvDataToJSON;
//# sourceMappingURL=csvParser.js.map