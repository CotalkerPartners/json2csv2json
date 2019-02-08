import { tokenizeClassifier } from './tokenClassify';

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
          Object.keys(path).forEach((index) => {
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
