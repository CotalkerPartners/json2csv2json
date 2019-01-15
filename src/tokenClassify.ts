interface tClass{
    tokens: Array<string>,
    modes: Array<string>
}

/***Fix Null Problem 
 * Revisar si funciona bien el tema de String.match
*/


function tokenizeClassifier(rowname:string):tClass{
    let tC:tClass = {tokens:[],modes:[]};
    let inMode:string ='Root';
    let tokenizer:Array<string>;
    while(rowname != ''){
        tC.modes.push(inMode);
        switch (inMode) {
            case 'Root':
                tokenizer = rowname.match(/\w+(?=(\[|\{))/);
                if (tokenizer[0] != null){
                    tC.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === '['){
                    inMode = 'Array';
                }
                else if (tokenizer[1] === '{'){
                    inMode = 'Object';
                }
                rowname = rowname.slice(tokenizer[0].length);
                break;
            case 'Object':
                tokenizer = rowname.match(/\d+(?=\}(\{|\[))/);
                if (tokenizer[0] != null){
                    tC.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === '{'){
                    inMode = 'Object';
                }
                else if (tokenizer[1] === '['){
                    inMode = 'Array';
                }
                rowname = rowname.slice(tokenizer[0].length);
                break
            case 'Array':
                tokenizer = rowname.match(/\d+(?=\](\{|\[))/);
                if (tokenizer[0] != null){
                    tC.tokens.push(tokenizer[0]);
                }
                if (tokenizer[1] === '{'){
                    inMode = 'Object';
                }
                else if (tokenizer[1] === '['){
                    inMode = 'Array';
                }
                rowname = rowname.slice(tokenizer[0].length);
                break
            default:
                break;
        }
    }
    return tC;
}

var str:string = 'pescado{perro}[90]{oso}{casa}[11]';

let res:tClass = tokenizeClassifier(str);

console.log(JSON.stringify(res,null,2));