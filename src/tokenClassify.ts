
/**
 * Recieves a row name, and process it to return an object with two arrays.
    * tokens: Array of keys or indexes (as strings) of the acces sequence to the row value
    * modes: Array of strings describing in an orderly fashion the nesting of the row value
 
* Example: 
    var str:string = 'pescado{perro}[90]{oso}{casa}[11]';

    let res:INestingMap = tokenizeClassifier(str);  

    return res;

    * returns: {
        "tokens": [
            "pescado",
            "perro",
            "90",
            "oso",
            "casa",
            "11"
        ],
        "modes": [
            "Root",
            "Object",
            "Array",
            "Object",
            "Object",
            "Array"
        ]
}
 */

export interface INestingMap {
    tokens: Array<string>;
    modes: Array<string>;
}

export function tokenizeClassifier(rowname:string):INestingMap {
    let nestingMap:INestingMap = {tokens:[],modes:[]};
    let inMode:string ="Root";
    let tokenizer:Array<string>;
    while(rowname !== "") {
        nestingMap.modes.push(inMode);
        switch (inMode) {
            case "Root":
                tokenizer = rowname.match(/\w+(?=(\[|\{))/);
                if (tokenizer === null) {
                    nestingMap.tokens.push(rowname);
                    rowname = "";
                    break;
                }
                if (tokenizer[0] != null) {
                    nestingMap.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === "[") {
                    inMode = "Array";
                }
                else if (tokenizer[1] === "{") {
                    inMode = "Object";
                }
                rowname = rowname.slice(tokenizer[0].length);
                break;
            case "Object":
                tokenizer = rowname.match(/\w+(?=\}(\[|\{)?)/);
                if (tokenizer[0] != null) {
                    nestingMap.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === "{") {
                    inMode = "Object";
                }
                else if (tokenizer[1] === "[") {
                    inMode = "Array";
                }
                rowname = rowname.slice(tokenizer[0].length+2); // length +2 includes the parenthesis
                break;
            case "Array":
                tokenizer = rowname.match(/\w+(?=\](\{|\[)?)/);
                if (tokenizer[0] != null) {
                    nestingMap.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === "{") {
                    inMode = "Object";
                }
                else if (tokenizer[1] === "[") {
                    inMode = "Array";
                }
                rowname = rowname.slice(tokenizer[0].length+2); // length +2 includes the parenthesis
                break;
            default:
                break;
        }
    }
    return nestingMap;
}
