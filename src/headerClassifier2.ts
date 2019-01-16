import {tClass} from './tokenClassify'
import {tokenizeClassifier} from "./tokenClassify";

interface Parent {
    answer: boolean,
    index: number
}

interface objectParent {
    answer: boolean,
    Key: string
}

export interface node {
    parent: (string | number)[],
    index?: number,
    key?: string,
    level: number,
    isLeaf: boolean,
    ptype: string,
    type: string
}

function NewNode(i:number){
    let Nnode:node = {
        parent: [],
        isLeaf: false,
        level: i,
        ptype:'None',
        type: 'String' // *pending* Incorporate user options *here*
    }
    return Nnode;
}

function FormatErrors(rowname:string){
    /*
    * Detects unclosed parenthesis or parenthesis inside parenthesis
    * Flags are used to signal the entrance to parenthesis
        * { or [ => flag.On
        * } or ] => flag.Off
    * throws error if tries to raise an already raised flag or if it doesn't lowers 
      the flags at the end.
    */
   let flag:boolean = false;
   let Objectflag:boolean = false;
   for (var i:number = 0, tot:number = rowname.length; i < tot; i++){      
        switch (rowname[i]){
            case '[':
                if (flag){
                    throw "Format Error, bad use of '['. Cause: "+rowname;
                }
                else {
                    flag = true;
                }
                break;
            case '{':
                if (flag){
                    throw "Format Error, bad use of '{'. Cause: "+rowname;
                }
                else {
                    flag = true;
                }
                break;
            case ']':
                if (flag){
                    flag = false;
                }
                else {
                    throw "Format Error, bad use of ']'. Cause: "+rowname;
                }
                break;
            case '}':
                if (flag){
                    flag = false;
                }
                else {
                    throw "Format Error, bad use of '}'. Cause: "+rowname;
                }
                break;
        }
    }
    if (flag){
        throw "Error, unclosed instance. Cause "+rowname;
    }
}

function IndexErrors(nestMap:tClass,rowname:string){
    if (nestMap.tokens.length != nestMap.modes.length){
        throw "Unexpected difference in the number of keys/indexes and modes. Cause: "+rowname;
    }
    for (var i:number = 0, tot = nestMap.tokens.length;i<tot;i++){
        if (nestMap.modes[i] === 'Array'){
            if (isNaN(Number(nestMap.tokens[i]))){
                throw "Index Error, not a number. Cause: "+rowname;
            }
        }
    }
}

export function rowClassify(rowname:string,Schem:object):Array<node>{
    try {
        FormatErrors(rowname)
    } catch (error) {
        console.log(error);
    }
    let rowHierarchy:Array<node> = [];
    let parentList:Array<string|number> = [];
    let nestMap:tClass = tokenizeClassifier(rowname);

    //Check for number errors in nestMap for Array type
    try {
        IndexErrors(nestMap,rowname);
    } catch (error) {
        console.log(error);
    }

    for (var i:number = 0, tot:number = nestMap.modes.length;i<tot;i++){
        let Nnode:node = NewNode(i-1);
        if (nestMap.modes[i] === 'Root'){ //<-> if (i === 0)
            if (nestMap.modes[i+1] === 'Array' && tot > 1){
                Schem[nestMap.tokens[i+1]] = []; //Create key branch in Schem
            }
            else if (nestMap.modes[i+1] === 'Object' && tot > 1){
                Schem[nestMap.tokens[i]] = {}; //Create key branch in Schem
            }
            else if (tot === 1){
                Schem[nestMap.tokens[i]] = Nnode.type;
            }
        }
        else {
            Nnode.parent = parentList.slice(0,i-1);
            Nnode.ptype = nestMap.modes[i-1];

            if (Nnode.ptype === 'Root'){ // i = 1
                Nnode.ptype = 'Object';
            }

            if (Nnode.ptype === 'Array'){
                Nnode.index = parseInt(nestMap.tokens[i-1]);
            }
            else if (Nnode.ptype === 'Object'){
                Nnode.key = nestMap.tokens[i-1];
            }
            Nnode.type = nestMap.modes[i];
            rowHierarchy.push(Nnode);
        }
        parentList.push(nestMap.tokens[i]);
    }
    let LastNode:node = NewNode(tot-1);
    if (tot > 1){
        LastNode.isLeaf = true;
        LastNode.parent = parentList.slice(0,tot-1);
        LastNode.ptype = nestMap.modes[tot-1];
        if (LastNode.ptype === 'Array'){
            LastNode.index = parseInt(nestMap.tokens[tot-1]);
        }
        else if (LastNode.ptype === 'Object'){
            LastNode.key = nestMap.tokens[tot-1];
        }
        rowHierarchy.push(LastNode);
    } 
    return rowHierarchy;
}


let str:string = 'pescado';
let Schem:object = {};
let res:Array<node> = rowClassify(str,Schem);
console.log("Nodes:")
console.log(res);
console.log('Schema:');
console.log(Schem);
