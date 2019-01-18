import {INestingMap} from "./tokenClassify";
import {tokenizeClassifier} from "./tokenClassify";
export class Node {
    parent: (string | number)[];
    index?: number;
    key?: string;
    level: number;
    isLeaf: boolean;
    ptype: ("String" | "Array" | "Object" | "Boolean" | "Number" | "Date" | "None" | "Root");
    type: ("String" | "Array" | "Object" | "Boolean" | "Number" | "Date" | "None" | "Root");
    constructor(level:number) {
        this.level = level;
        this.isLeaf = false;
        this.parent = [];
        this.type = "String"; // *pending* Incorporate user options *here*
        this.ptype = "None";
    }
}

function checkHeaderName(rowName:string):void {
    /*
    * Detects unclosed parenthesis or parenthesis inside parenthesis
    * Flags are used to signal the entrance to parenthesis
        * { or [ => flag.On
        * } or ] => flag.Off
    * throws error if tries to raise an already raised flag or if it doesn"t lowers 
      the flags at the end.
    */
   let Arrayflag:boolean = false;
   let Objectflag:boolean = false;
   for (let i:number = 0, modesSize:number = rowName.length; i < modesSize; i++) {
        switch (rowName[i]) {
            case "[":
                if (Arrayflag || Objectflag){
                    throw "Format Error, bad use of '['. Cause: "+rowName;
                }
                Arrayflag = true;
                break;
            case "{":
                if (Arrayflag || Objectflag){
                    throw "Format Error, bad use of '{'. Cause: "+rowName;
                }
                Objectflag = true;
                break;
            case "]":
                if (!Arrayflag || Objectflag){
                    throw "Format Error, bad use of ']'. Cause: "+rowName;
                }
                Arrayflag = false;
                break;
            case "}":
                if (!Objectflag || Arrayflag){
                    throw "Format Error, bad use of '}'. Cause: "+rowName;
                }
                Objectflag = false;
                break;
        }
    }
    if (Arrayflag || Objectflag) {
        throw "Error, unclosed instance. Cause "+rowName;
    }
}

function indexErrors(nestMap:INestingMap,rowName:string):void {
    if (nestMap.tokens.length !== nestMap.modes.length) {
        throw "Unexpected difference in the number of keys/indexes and modes. Cause: "+rowName;
    }
    for (let i:number = 0, modesSize:number = nestMap.tokens.length;i<modesSize;i++){
        if (nestMap.modes[i] === "Array") {
            if (isNaN(Number(nestMap.tokens[i]))) {
                throw "Index Error, not a number. Cause: "+rowName;
            }
        }
    }
}

export function rowClassify(rowName:string,schema:object):Array<Node> {
    // check format errors
    checkHeaderName(rowName);

    let rowHierarchy:Array<Node> = [];
    let parentList:Array<string|number> = [];
    let nestMap:INestingMap = tokenizeClassifier(rowName);

    // check for number errors in nestMap for Array type
    indexErrors(nestMap,rowName);
    let modesSize:number = nestMap.modes.length;
    for (let i:number = 0;i<modesSize;i++){
        let nNode:Node = new Node(i-1);
        if (nestMap.modes[i] === "Root") { // <-> if (i === 0)
            if (nestMap.modes[i+1] === "Array" && modesSize > 1){
                schema[nestMap.tokens[i]] = []; // create key branch in schema
            }
            else if (nestMap.modes[i+1] === "Object" && modesSize > 1) {
                schema[nestMap.tokens[i]] = {}; // create key branch in schema
            }
            else if (modesSize === 1) {
                schema[nestMap.tokens[i]] = nNode.type;
            }
        }
        else {
            nNode.parent = parentList.slice(0,i-1);
            nNode.ptype = nestMap.modes[i-1];

            if (nNode.ptype === "Root") { // i = 1
                nNode.ptype = "Object";
            }

            if (nNode.ptype === "Array"){
                nNode.index = parseInt(nestMap.tokens[i-1],10);
            }
            else if (nNode.ptype === "Object") {
                nNode.key = nestMap.tokens[i-1];
            }
            nNode.type = nestMap.modes[i];
            rowHierarchy.push(nNode);
        }
        parentList.push(nestMap.tokens[i]);
    }
    let lastNode:Node = new Node(modesSize-1);
    if (modesSize > 1) {
        lastNode.isLeaf = true;
        lastNode.parent = parentList.slice(0,modesSize-1);
        lastNode.ptype = nestMap.modes[modesSize-1];
        if (lastNode.ptype === "Array") {
            lastNode.index = parseInt(nestMap.tokens[modesSize-1],10);
        }
        else if (lastNode.ptype === "Object") {
            lastNode.key = nestMap.tokens[modesSize-1];
        }
        rowHierarchy.push(lastNode);
    }
    return rowHierarchy;
}
