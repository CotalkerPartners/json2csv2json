"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenClassify_1 = require("./tokenClassify");
function nestingTokenize(obj) {
    let pathList = Object.keys(obj);
    let tempList = [];
    let exitFlag = false;
    let objectFlag = false;
    while (!exitFlag) {
        pathList.forEach((key) => {
            let path = obj;
            const nesting = tokenClassify_1.tokenizeClassifier(key);
            const nestingLength = nesting.modes.length;
            for (let i = 0; i < nestingLength; i += 1) {
                if (nesting.modes[i] === 'Object' || nesting.modes[i] === 'Root') {
                    path = path[nesting.tokens[i]];
                }
                else if (nesting.modes[i] === 'Array') {
                    path = path[parseInt(nesting.tokens[i], 10)];
                }
            }
            if (typeof (path) === 'object') {
                objectFlag = true;
                if (Array.isArray(path)) {
                    Object.keys(path).filter(k => path[parseInt(k, 10)])
                        .forEach((index) => {
                        tempList.push(`${key}[${index}]`);
                    });
                }
                else {
                    Object.keys(path).forEach((keyname) => {
                        tempList.push(`${key}{${keyname}}`);
                    });
                }
            }
            else {
                tempList.push(key);
            }
        });
        pathList = tempList;
        tempList = [];
        if (!objectFlag)
            exitFlag = true;
        objectFlag = false;
    }
    return pathList;
}
exports.nestingTokenize = nestingTokenize;
function objectParser(obj, pathHeader, config) {
    const rowSize = pathHeader.length;
    let path = obj;
    let row = '';
    const separator = (config && config.separator) || ',';
    for (let i = 0; i < rowSize; i += 1) {
        const nesting = tokenClassify_1.tokenizeClassifier(pathHeader[i]);
        const nestingSize = nesting.modes.length;
        for (let j = 0; j < nestingSize; j += 1) {
            if ((path !== null && (typeof path !== 'undefined'))) {
                if (nesting.modes[j] === 'Object' || nesting.modes[j] === 'Root') {
                    path = path[nesting.tokens[j]];
                }
                else if (nesting.modes[j] === 'Array') {
                    path = path[parseInt(nesting.tokens[j], 10)];
                }
            }
            else {
                if (config.errorOnNull) {
                    throw `Error, null path on ${pathHeader[i]}`;
                }
                else {
                    row += `${separator}`;
                    break;
                }
            }
        }
        if ((path !== null && (typeof path !== 'undefined'))) {
            // this line can cause problems assign after a configuration for separator-in-value replacing
            row += String(path).replace(separator, '') + separator;
        }
        path = obj;
    }
    // Remove last separator:
    row = row.slice(0, row.length - separator.length);
    row += '\n';
    return row;
}
exports.objectParser = objectParser;
//# sourceMappingURL=JSONparser.js.map