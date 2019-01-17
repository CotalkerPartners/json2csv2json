import {InestMap} from "./tokenClassify";
import {tokenizeClassifier} from "./tokenClassify";
export interface Inode {
    parent: (string | number)[];
    index?: number;
    key?: string;
    level: number;
    isLeaf: boolean;
    ptype: string;
    type: string;
}

function NewNode(i:number):Inode {
    let Nnode:Inode = {
        parent: [],
        isLeaf: false,
        level: i,
        ptype:"None",
        type: "String" // *pending* Incorporate user options *here*;
    };
    return Nnode;
}

function FormatErrors(rowname:string):void {
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
   for (var i:number = 0, tot:number = rowname.length; i < tot; i++) {
        switch (rowname[i]) {
            case "[":
                if (Arrayflag || Objectflag){
                    throw "Format Error, bad use of '['. Cause: "+rowname;
                }
                else {
                    Arrayflag = true;
                }
                break;
            case "{":
                if (Arrayflag || Objectflag){
                    throw "Format Error, bad use of '{'. Cause: "+rowname;
                }
                else {
                    Objectflag = true;
                }
                break;
            case "]":
                if (Arrayflag && !Objectflag){
                    Arrayflag = false;
                }
                else {
                    throw "Format Error, bad use of ']'. Cause: "+rowname;
                }
                break;
            case "}":
                if (Objectflag && !Arrayflag){
                    Objectflag = false;
                }
                else {
                    throw "Format Error, bad use of '}'. Cause: "+rowname;
                }
                break;
        }
    }
    if (Arrayflag || Objectflag) {
        throw "Error, unclosed instance. Cause "+rowname;
    }
}

function IndexErrors(nestMap:InestMap,rowname:string):void {
    if (nestMap.tokens.length !== nestMap.modes.length) {
        throw "Unexpected difference in the number of keys/indexes and modes. Cause: "+rowname;
    }
    for (var i:number = 0, tot:number = nestMap.tokens.length;i<tot;i++){
        if (nestMap.modes[i] === "Array") {
            if (isNaN(Number(nestMap.tokens[i]))) {
                throw "Index Error, not a number. Cause: "+rowname;
            }
        }
    }
}

export function rowClassify(rowname:string,Schem:object):Array<Inode>{
    try {
        FormatErrors(rowname);
    } catch (error) {
        console.log(error);
    }
    let rowHierarchy:Array<Inode> = [];
    let parentList:Array<string|number> = [];
    let nestMap:InestMap = tokenizeClassifier(rowname);

    // check for number errors in nestMap for Array type
    try {
        IndexErrors(nestMap,rowname);
    } catch (error) {
        console.log(error);
    }

    for (var i:number = 0, tot:number = nestMap.modes.length;i<tot;i++){
        let Nnode:Inode = NewNode(i-1);
        if (nestMap.modes[i] === "Root") { // <-> if (i === 0)
            if (nestMap.modes[i+1] === "Array" && tot > 1){
                Schem[nestMap.tokens[i]] = []; // create key branch in Schem
            }
            else if (nestMap.modes[i+1] === "Object" && tot > 1) {
                Schem[nestMap.tokens[i]] = {}; // create key branch in Schem
            }
            else if (tot === 1) {
                Schem[nestMap.tokens[i]] = Nnode.type;
            }
        }
        else {
            Nnode.parent = parentList.slice(0,i-1);
            Nnode.ptype = nestMap.modes[i-1];

            if (Nnode.ptype === "Root") { // i = 1
                Nnode.ptype = "Object";
            }

            if (Nnode.ptype === "Array"){
                Nnode.index = parseInt(nestMap.tokens[i-1]);
            }
            else if (Nnode.ptype === "Object") {
                Nnode.key = nestMap.tokens[i-1];
            }
            Nnode.type = nestMap.modes[i];
            rowHierarchy.push(Nnode);
        }
        parentList.push(nestMap.tokens[i]);
    }
    let LastNode:Inode = NewNode(tot-1);
    if (tot > 1) {
        LastNode.isLeaf = true;
        LastNode.parent = parentList.slice(0,tot-1);
        LastNode.ptype = nestMap.modes[tot-1];
        if (LastNode.ptype === "Array") {
            LastNode.index = parseInt(nestMap.tokens[tot-1]);
        }
        else if (LastNode.ptype === "Object") {
            LastNode.key = nestMap.tokens[tot-1];
        }
        rowHierarchy.push(LastNode);
    }
    return rowHierarchy;
}


/* let str:string = "pescado";
let Schem:object = {};
let res:Array<Inode> = rowClassify(str,Schem);
console.log("Nodes:")
console.log(res);
console.log("Schema:");
console.log(Schem);
 */