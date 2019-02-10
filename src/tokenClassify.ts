
/**
 * Recieves a row name, and process it to return an object with two arrays.
    * tokens: Array of keys or indexes (as strings) of the acces sequence to the row value
    * modes: Array of strings describing in an orderly fashion the nesting of the row value

* Example:
    let str:string = `pescado{perro}[90]{oso}{casa}[11]`;

    let res:INestingMap = tokenizeClassifier(str);

    return res;

    * returns: {
        `tokens`: [
            `pescado`,
            `perro`,
            `90`,
            `oso`,
            `casa`,
            `11`
        ],
        `modes`: [
            `Root`,
            `Object`,
            `Array`,
            `Object`,
            `Object`,
            `Array`
        ]
}
 */

export interface INestingMap {
  tokens: string[];
  modes: (`Root` | `Object` | `Array`)[];
}

export function tokenizeClassifier(rowName: string): INestingMap {
  const nestingMap: INestingMap = {
    tokens: [],
    modes: [],
  };
  let inMode: (`Root` | `Object` | `Array`) = `Root`;
  let copyRowName: string = rowName;
  while (copyRowName !== ``) {
    nestingMap.modes.push(inMode);
    let tokenizer: string[];
    switch (inMode) {
      case `Root`:
        tokenizer = copyRowName.match(/\w+(?=(\[|\{))/);
        if (tokenizer === null) {
          nestingMap.tokens.push(copyRowName);
          copyRowName = ``;
          break;
        } else if (tokenizer.length !== 2) {
          throw `Input Error, header name generates bad reading. Cause: ${ rowName }`;
        }
        if (tokenizer[0] != null) {
          nestingMap.tokens.push(tokenizer[0]);
        }
        if (tokenizer[1] === `[`) {
          inMode = `Array`;
        } else if (tokenizer[1] === `{`) {
          inMode = `Object`;
        }
        copyRowName = copyRowName.slice(tokenizer[0].length);
        break;
      case `Object`:
        tokenizer = copyRowName.match(/\w+(?=\}(\[|\{)?)/);
        if (tokenizer[0] != null) {
          nestingMap.tokens.push(tokenizer[0]);
        }
        if (tokenizer[1] === `{`) {
          inMode = `Object`;
        } else if (tokenizer[1] === `[`) {
          inMode = `Array`;
        }
        copyRowName = copyRowName.slice(tokenizer[0].length + 2); // length +2 includes the parenthesis
        break;
      case `Array`:
        tokenizer = copyRowName.match(/\w+(?=\](\{|\[)?)/);
        if (tokenizer[0] !== null) {
          nestingMap.tokens.push(tokenizer[0]);
        }
        if (tokenizer[1] === `{`) {
          inMode = `Object`;
        } else if (tokenizer[1] === `[`) {
          inMode = `Array`;
        }
        copyRowName = copyRowName.slice(tokenizer[0].length + 2); // length +2 includes the parenthesis
        break;
      default:
        break;
    }
  }
  return nestingMap;
}
