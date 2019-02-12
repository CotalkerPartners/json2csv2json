import { tokenizeClassifier } from './tokenClassify';
import { StringifyOptions } from 'querystring';

interface IObjParseConfig {
  errorOnNull?: boolean;
  separator: string;
}

export function nestingTokenize(obj: object): string[] {
  let pathList = Object.keys(obj);
  let tempList: string[] = [];
  let exitFlag = false;
  let objectFlag = false;
  while (!exitFlag) {
    pathList.forEach((key) => {
      let path = obj;
      const nesting = tokenizeClassifier(key);
      const nestingLength = nesting.modes.length;
      for (let i = 0; i < nestingLength; i += 1) {
        if (nesting.modes[i] === 'Object' || nesting.modes[i] === 'Root') {
          path = path[nesting.tokens[i]];
        } else if (nesting.modes[i] === 'Array') {
          path = path[parseInt(nesting.tokens[i], 10)];
        }
      }
      if (typeof(path) === 'object') {
        objectFlag = true;
        if (Array.isArray(path)) {
          Object.keys(path).filter(k => path[parseInt(k, 10)])
          .forEach((index) => {
            tempList.push(`${key}[${index}]`);
          });
        } else {
          Object.keys(path).forEach((keyname) => {
            tempList.push(`${key}{${keyname}}`);
          });
        }
      } else {
        tempList.push(key);
      }
    });
    pathList = tempList;
    tempList = [];
    if (!objectFlag) exitFlag = true;
    objectFlag = false;
  }
  return pathList;
}

export function objectParser(obj: object, pathHeader: string[], config: IObjParseConfig) {
  const rowSize = pathHeader.length;
  let path = obj;
  let row = '';
  const separator = (config && config.separator) || ',';
  for (let i = 0; i < rowSize; i += 1) {
    const nesting = tokenizeClassifier(pathHeader[i]);
    const nestingSize = nesting.modes.length;
    for (let j = 0; j < nestingSize; j += 1) {
      if (path) {
        if (nesting.modes[j] === 'Object' || nesting.modes[j] === 'Root') {
          path = path[nesting.tokens[j]];
        } else if (nesting.modes[j] === 'Array') {
          path = path[parseInt(nesting.tokens[j], 10)];
        }
      } else {
        if (config.errorOnNull) {
          throw `Error, null path on ${pathHeader[i]}`;
        } else {
          row += `null${separator}`;
          break;
        }
      }
    }
    if (path) row += String(path) + separator;
    path = obj;
  }
  // Remove last char, a separator:
  row = row.slice(0, row.length - 1);
  row += '\n';
  return row;
}